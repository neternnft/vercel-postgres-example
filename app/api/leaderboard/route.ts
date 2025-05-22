import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

async function ensureTablesExist() {
  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL UNIQUE,
        wallet_address VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create high_scores table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS high_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        score INTEGER NOT NULL,
        user_id UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes if they don't exist
    await sql`CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores(score DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_high_scores_user_id ON high_scores(user_id)`;

    console.log('Tables and indexes verified/created successfully');
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
    throw error;
  }
}

export async function GET() {
  try {
    // Get top 10 scores with usernames
    const { rows } = await sql`
      SELECT DISTINCT ON (h.score)
        h.score,
        u.username,
        h.created_at
      FROM high_scores h
      INNER JOIN users u ON h.user_id = u.id
      ORDER BY h.score DESC
      LIMIT 10
    `;

    console.log('Fetched leaderboard data:', rows);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 