-- Check and fix any remaining security definer issues
-- Remove the problematic policy that was duplicated
DROP POLICY IF EXISTS "Users can only view their own stats" ON public.journal_entries;

-- The existing policy "Users can view their own entries" already covers this
-- Let's also create a function instead of a view for better security control
DROP VIEW IF EXISTS public.user_stats_safe;

-- Create a secure function for user statistics instead of a view
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE (
    total_entries INTEGER,
    avg_mood_score NUMERIC(3,2),
    last_entry_date DATE,
    first_entry_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_entries,
        AVG(score)::NUMERIC(3,2) as avg_mood_score,
        DATE(MAX(created_at)) as last_entry_date,
        DATE(MIN(created_at)) as first_entry_date
    FROM public.journal_entries
    WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;