-- Add notes field to user_challenges table
ALTER TABLE public.user_challenges 
ADD COLUMN notes TEXT;