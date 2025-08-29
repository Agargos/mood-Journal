-- Fix security issues identified in the scan

-- 1. Fix function search path mutability for existing functions
ALTER FUNCTION public.handle_new_user() SET search_path = public, auth;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. Add additional security measures for user data protection

-- Create a security definer function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public, auth;

-- Create function to validate user ownership
CREATE OR REPLACE FUNCTION public.is_user_owner(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT auth.uid() = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public, auth;

-- Add audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (for now, no admins exist so this is restrictive)
CREATE POLICY "Admin only audit log access" ON public.audit_logs
    FOR ALL USING (false);

-- Add trigger function for audit logging
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
            ELSE NEW.id::TEXT
        END,
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
    );
    
    RETURN CASE 
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_journal_entries
    AFTER INSERT OR UPDATE OR DELETE ON public.journal_entries
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_user_challenges
    AFTER INSERT OR UPDATE OR DELETE ON public.user_challenges
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Strengthen existing RLS policies with additional checks

-- Add data validation for journal entries
CREATE OR REPLACE FUNCTION public.validate_journal_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate text length (prevent abuse)
    IF LENGTH(NEW.text) > 10000 THEN
        RAISE EXCEPTION 'Journal entry text too long (max 10000 characters)';
    END IF;
    
    -- Ensure user_id matches authenticated user
    IF NEW.user_id != auth.uid() THEN
        RAISE EXCEPTION 'Cannot create entry for another user';
    END IF;
    
    -- Validate score range
    IF NEW.score IS NOT NULL AND (NEW.score < -1 OR NEW.score > 1) THEN
        RAISE EXCEPTION 'Score must be between -1 and 1';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Add validation trigger
DROP TRIGGER IF EXISTS validate_journal_entry_trigger ON public.journal_entries;
CREATE TRIGGER validate_journal_entry_trigger
    BEFORE INSERT OR UPDATE ON public.journal_entries
    FOR EACH ROW EXECUTE FUNCTION public.validate_journal_entry();

-- Add data validation for profiles
CREATE OR REPLACE FUNCTION public.validate_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure user_id matches authenticated user for updates
    IF TG_OP = 'UPDATE' AND OLD.user_id != auth.uid() THEN
        RAISE EXCEPTION 'Cannot update another user profile';
    END IF;
    
    -- Ensure user_id matches authenticated user for inserts
    IF TG_OP = 'INSERT' AND NEW.user_id != auth.uid() THEN
        RAISE EXCEPTION 'Cannot create profile for another user';
    END IF;
    
    -- Validate display name length
    IF NEW.display_name IS NOT NULL AND LENGTH(NEW.display_name) > 100 THEN
        RAISE EXCEPTION 'Display name too long (max 100 characters)';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Add validation trigger for profiles
DROP TRIGGER IF EXISTS validate_profile_trigger ON public.profiles;
CREATE TRIGGER validate_profile_trigger
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.validate_profile();

-- Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, action, window_start)
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limit data
CREATE POLICY "Users can view own rate limits" ON public.rate_limits
    FOR SELECT USING (auth.uid() = user_id);

-- Only the system can insert/update rate limits
CREATE POLICY "System only rate limit modifications" ON public.rate_limits
    FOR ALL USING (false);

-- Add function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    action_name TEXT,
    max_requests INTEGER DEFAULT 10,
    window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate window start time
    window_start_time := date_trunc('minute', now()) - INTERVAL '1 minute' * (EXTRACT(MINUTE FROM now())::INTEGER % window_minutes);
    
    -- Get current count for this user and action in this window
    SELECT COALESCE(SUM(count), 0) INTO current_count
    FROM public.rate_limits
    WHERE user_id = auth.uid()
      AND action = action_name
      AND window_start >= window_start_time;
    
    -- Check if limit exceeded
    IF current_count >= max_requests THEN
        RETURN false;
    END IF;
    
    -- Increment counter
    INSERT INTO public.rate_limits (user_id, action, window_start)
    VALUES (auth.uid(), action_name, window_start_time)
    ON CONFLICT (user_id, action, window_start)
    DO UPDATE SET count = rate_limits.count + 1;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Add additional security constraints

-- Ensure journal entries can't be backdated more than 7 days
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_date_check 
    CHECK (created_at >= now() - INTERVAL '7 days');

-- Add constraint to prevent future dating
ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_future_check 
    CHECK (created_at <= now() + INTERVAL '1 hour');

-- Create a view for safe user statistics (no sensitive data exposure)
CREATE OR REPLACE VIEW public.user_stats_safe AS
SELECT 
    user_id,
    COUNT(*)::INTEGER as total_entries,
    AVG(score)::NUMERIC(3,2) as avg_mood_score,
    DATE(MAX(created_at)) as last_entry_date,
    DATE(MIN(created_at)) as first_entry_date
FROM public.journal_entries
WHERE user_id = auth.uid()
GROUP BY user_id;