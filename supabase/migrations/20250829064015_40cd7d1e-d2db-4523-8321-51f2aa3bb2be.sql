-- Fix the security definer view issue by recreating the view without security definer
DROP VIEW IF EXISTS public.user_stats_safe;

-- Create a safe statistics view that respects RLS
CREATE VIEW public.user_stats_safe AS
SELECT 
    user_id,
    COUNT(*)::INTEGER as total_entries,
    AVG(score)::NUMERIC(3,2) as avg_mood_score,
    DATE(MAX(created_at)) as last_entry_date,
    DATE(MIN(created_at)) as first_entry_date
FROM public.journal_entries
GROUP BY user_id;