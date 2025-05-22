import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Drop existing tables to start fresh
    await sql`DROP TABLE IF EXISTS high_scores`;
    await sql`DROP TABLE IF EXISTS users`;

    // Create users table
    await sql`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL UNIQUE,
        wallet_address VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create high_scores table
    await sql`
      CREATE TABLE high_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        score INTEGER NOT NULL,
        user_id UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX idx_users_wallet_address ON users(wallet_address)`;
    await sql`CREATE INDEX idx_high_scores_score ON high_scores(score DESC)`;
    await sql`CREATE INDEX idx_high_scores_user_id ON high_scores(user_id)`;

    // Insert some test data
    const { rows: [user] } = await sql`
      INSERT INTO users (username, wallet_address)
      VALUES ('TestUser', '0x1234567890123456789012345678901234567890')
      RETURNING id
    `;

    await sql`
      INSERT INTO high_scores (score, user_id)
      VALUES 
        (100, ${user.id}),
        (200, ${user.id}),
        (150, ${user.id})
    `;

    // Verify the setup
    const { rows: userCount } = await sql`SELECT COUNT(*) as count FROM users`;
    const { rows: scoreCount } = await sql`SELECT COUNT(*) as count FROM high_scores`;
    const { rows: topScores } = await sql`
      SELECT h.score, u.username
      FROM high_scores h
      JOIN users u ON h.user_id = u.id
      ORDER BY h.score DESC
      LIMIT 3
    `;

    return NextResponse.json({
      message: 'Database initialized successfully',
      status: {
        users: userCount[0].count,
        scores: scoreCount[0].count,
        topScores
      }
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 