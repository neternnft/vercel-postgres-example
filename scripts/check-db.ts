import { sql } from '@vercel/postgres';

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Check users table
    const { rows: users } = await sql`SELECT * FROM users`;
    console.log('\nUsers in database:', users.length);
    console.log(users);

    // Check high scores
    const { rows: scores } = await sql`
      SELECT h.score, u.username, h.created_at
      FROM high_scores h
      JOIN users u ON h.user_id = u.id
      ORDER BY h.score DESC
    `;
    console.log('\nHigh scores in database:', scores.length);
    console.log(scores);

  } catch (error) {
    console.error('Database check failed:', error);
  }
}

checkDatabase(); 