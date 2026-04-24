-- Add days_of_week column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS days_of_week integer[] DEFAULT '{0,1,2,3,4,5,6}';

-- Update existing habits to have all days if they don't have them
UPDATE habits SET days_of_week = '{0,1,2,3,4,5,6}' WHERE days_of_week IS NULL;
