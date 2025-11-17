-- Create skills table for storing hard and soft skills
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hard', 'soft')),
  level INTEGER NOT NULL CHECK (level >= 0 AND level <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to manage their skills
CREATE POLICY "Users can manage their own skills" ON skills
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_skills_type ON skills(type);
CREATE INDEX IF NOT EXISTS idx_skills_level ON skills(level DESC);

-- Insert some sample data (optional)
INSERT INTO skills (name, type, level) VALUES
  ('React', 'hard', 90),
  ('TypeScript', 'hard', 85),
  ('Node.js', 'hard', 80),
  ('Python', 'hard', 75),
  ('PostgreSQL', 'hard', 70),
  ('AWS', 'hard', 65),
  ('Comunicación', 'soft', 85),
  ('Trabajo en Equipo', 'soft', 90),
  ('Resolución de Problemas', 'soft', 88),
  ('Aprendizaje Continuo', 'soft', 92)
ON CONFLICT DO NOTHING;