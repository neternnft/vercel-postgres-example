-- Create users table first
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    wallet_address VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create high_scores table with foreign key reference
CREATE TABLE IF NOT EXISTS high_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    score INTEGER NOT NULL,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_high_scores_user_id ON high_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address); 