-- Add premium column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN premium BOOLEAN DEFAULT FALSE;