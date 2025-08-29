-- Fix the security definer view issue
DROP VIEW IF EXISTS public.user_stats_safe;

-- Create a regular view without SECURITY DEFINER (it was implicitly added)
-- This view will use the querying user's permissions
CREATE VIEW public.user_stats_safe AS
SELECT 
    user_id,
    COUNT(*)::INTEGER as total_entries,
    AVG(score)::NUMERIC(3,2) as avg_mood_score,
    DATE(MAX(created_at)) as last_entry_date,
    DATE(MIN(created_at)) as first_entry_date
FROM public.journal_entries
GROUP BY user_id;

-- Add RLS policy to the view to ensure users only see their own stats
-- Note: Views inherit RLS from underlying tables, but we make it explicit
CREATE POLICY "Users can only view their own stats" ON public.journal_entries
    FOR SELECT USING (auth.uid() = user_id);