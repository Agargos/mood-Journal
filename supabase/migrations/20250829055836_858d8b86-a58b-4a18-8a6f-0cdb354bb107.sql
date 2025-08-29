-- Add emotion tracking columns to journal_entries table
ALTER TABLE public.journal_entries 
ADD COLUMN emotions TEXT[] DEFAULT NULL,
ADD COLUMN coping_strategy TEXT DEFAULT NULL;

-- Add index for emotions array for better query performance
CREATE INDEX idx_journal_entries_emotions ON public.journal_entries USING GIN(emotions);

-- Update the updated_at trigger function (if it doesn't exist already)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column and trigger to journal_entries if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'journal_entries' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.journal_entries ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        
        CREATE TRIGGER update_journal_entries_updated_at
        BEFORE UPDATE ON public.journal_entries
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;