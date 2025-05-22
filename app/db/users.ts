import { sql } from '@vercel/postgres';

export interface User {
  id: number;
  wallet_address: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export async function getUserByWalletAddress(walletAddress: string): Promise<User | null> {
  try {
    const result = await sql<User>`
      SELECT * FROM users WHERE wallet_address = ${walletAddress}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error in getUserByWalletAddress:', error);
    throw error;
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const result = await sql<User>`
      SELECT * FROM users WHERE username = ${username}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error in getUserByUsername:', error);
    throw error;
  }
}

export async function createUser(walletAddress: string, username: string): Promise<User | null> {
  try {
    console.log('Creating user with:', { walletAddress, username });
    
    // First check if the table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `;
    
    if (!tableCheck.rows[0].exists) {
      throw new Error('Users table does not exist. Please run the database setup first.');
    }

    // Then try to create the user
    const result = await sql<User>`
      INSERT INTO users (wallet_address, username)
      VALUES (${walletAddress}, ${username})
      RETURNING *;
    `;

    console.log('User creation result:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in createUser:', error);
    // Check if it's a unique constraint violation
    if (error instanceof Error && error.message.includes('unique constraint')) {
      if (error.message.includes('wallet_address')) {
        throw new Error('This wallet address is already registered');
      }
      if (error.message.includes('username')) {
        throw new Error('This username is already taken');
      }
    }
    throw error;
  }
}

export async function updateUsername(walletAddress: string, newUsername: string): Promise<User | null> {
  try {
    const result = await sql<User>`
      UPDATE users
      SET username = ${newUsername}
      WHERE wallet_address = ${walletAddress}
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateUsername:', error);
    // Check if it's a unique constraint violation
    if (error instanceof Error && error.message.includes('unique constraint') && error.message.includes('username')) {
      throw new Error('This username is already taken');
    }
    throw error;
  }
}

export async function isUsernameTaken(username: string, excludeWalletAddress?: string): Promise<boolean> {
  try {
    const query = excludeWalletAddress
      ? sql`SELECT EXISTS(SELECT 1 FROM users WHERE username = ${username} AND wallet_address != ${excludeWalletAddress})`
      : sql`SELECT EXISTS(SELECT 1 FROM users WHERE username = ${username})`;
    
    const result = await query;
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error in isUsernameTaken:', error);
    throw error;
  }
} 