-- Create projects table with all required columns
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planned', 'active', 'archived')),
  linked_repositories JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_workspace_updated_at
  ON projects (workspace_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_workspace_linked_repositories
  ON projects (workspace_id);
