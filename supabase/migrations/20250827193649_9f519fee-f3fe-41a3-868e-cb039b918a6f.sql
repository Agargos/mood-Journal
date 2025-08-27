-- Add tags and streak tracking columns to journal_entries table
ALTER TABLE journal_entries ADD COLUMN tags TEXT[];

-- Add last_entry_date and current_streak to profiles table for streak tracking
ALTER TABLE profiles ADD COLUMN last_entry_date DATE;
ALTER TABLE profiles ADD COLUMN current_streak INTEGER DEFAULT 0;

-- Create index for better performance on tags
CREATE INDEX idx_journal_entries_tags ON journal_entries USING GIN(tags);

-- Create index for user_id and created_at for streak calculations
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, created_at DESC);