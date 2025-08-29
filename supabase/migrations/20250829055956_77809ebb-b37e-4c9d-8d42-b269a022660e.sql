-- Create challenges table with predefined challenges
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'streak', 'count', 'daily', 'weekly'
  target_value INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy', -- 'easy', 'medium', 'hard'
  category TEXT NOT NULL DEFAULT 'general', -- 'general', 'positivity', 'mindfulness', 'reflection'
  badge_icon TEXT DEFAULT '🏆',
  badge_color TEXT DEFAULT '#FFD700',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_challenges table to track user progress
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'failed', 'paused'
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  streak_count INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS on both tables
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- Challenges are viewable by everyone (they're like templates)
CREATE POLICY "Challenges are viewable by everyone" 
ON public.challenges 
FOR SELECT 
USING (is_active = true);

-- Users can view their own challenge progress
CREATE POLICY "Users can view their own challenge progress" 
ON public.user_challenges 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own challenge progress
CREATE POLICY "Users can create their own challenge progress" 
ON public.user_challenges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own challenge progress
CREATE POLICY "Users can update their own challenge progress" 
ON public.user_challenges 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own challenge progress
CREATE POLICY "Users can delete their own challenge progress" 
ON public.user_challenges 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_challenges_updated_at
BEFORE UPDATE ON public.user_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert predefined challenges
INSERT INTO public.challenges (title, description, type, target_value, duration_days, difficulty, category, badge_icon, badge_color) VALUES
('Daily Journaler', 'Write a journal entry every day', 'streak', 7, 7, 'easy', 'general', '📝', '#4ade80'),
('Positivity Week', 'Write 3 positive thoughts daily for 7 days', 'daily', 3, 7, 'medium', 'positivity', '✨', '#fbbf24'),
('Mindful Month', 'Complete 30 journal entries in 30 days', 'count', 30, 30, 'hard', 'mindfulness', '🧘', '#8b5cf6'),
('Gratitude Challenge', 'Write about something you''re grateful for daily', 'streak', 5, 5, 'easy', 'positivity', '🙏', '#f59e0b'),
('Emotion Explorer', 'Log entries with at least 3 different emotions', 'count', 10, 14, 'medium', 'reflection', '🎭', '#06b6d4'),
('Weekly Warrior', 'Write journal entries for 4 weeks straight', 'streak', 28, 28, 'hard', 'general', '⚔️', '#dc2626'),
('Self-Care Sunday', 'Write about self-care activities every Sunday', 'weekly', 4, 28, 'medium', 'mindfulness', '💆', '#ec4899'),
('Morning Pages', 'Write morning thoughts for 10 days', 'streak', 10, 10, 'medium', 'reflection', '🌅', '#f97316'),
('Stress Buster', 'Document stress-relief activities for 14 days', 'count', 14, 14, 'medium', 'mindfulness', '😌', '#22c55e'),
('Reflection Master', 'Write detailed reflections (200+ words) for 7 days', 'streak', 7, 7, 'hard', 'reflection', '🤔', '#6366f1');

-- Create indexes for better performance
CREATE INDEX idx_user_challenges_user_id ON public.user_challenges(user_id);
CREATE INDEX idx_user_challenges_status ON public.user_challenges(status);
CREATE INDEX idx_user_challenges_challenge_id ON public.user_challenges(challenge_id);
CREATE INDEX idx_challenges_category ON public.challenges(category);
CREATE INDEX idx_challenges_difficulty ON public.challenges(difficulty);