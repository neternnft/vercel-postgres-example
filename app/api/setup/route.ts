import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(42) UNIQUE NOT NULL,
        username VARCHAR(20) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
    `;

    // Create update timestamp function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    // Create trigger
    await sql`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    `;
    
    await sql`
      CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;

    return NextResponse.json({ message: 'Database setup completed successfully' });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ 
      error: 'Failed to set up database',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 