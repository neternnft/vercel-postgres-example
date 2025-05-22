import { NextResponse } from 'next/server';
import { getUserByWalletAddress, createUser, updateUsername, isUsernameTaken } from '@/app/db/users';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  try {
    const user = await getUserByWalletAddress(walletAddress);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { walletAddress, username } = await request.json();
    console.log('POST /api/users received:', { walletAddress, username });

    if (!walletAddress || !username) {
      return NextResponse.json({ error: 'Wallet address and username are required' }, { status: 400 });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    // Validate username format
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: 'Username must be between 3 and 20 characters' }, { status: 400 });
    }

    // Check if username is taken
    try {
      const taken = await isUsernameTaken(username);
      if (taken) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
      }
    } catch (error) {
      console.error('Error checking username:', error);
      return NextResponse.json({ 
        error: 'Failed to check username availability',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }

    // Create new user
    try {
      const user = await createUser(walletAddress, username);
      if (!user) {
        throw new Error('Database operation failed to return the created user');
      }
      console.log('User created successfully:', user);
      return NextResponse.json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof Error && error.message.includes('Users table does not exist')) {
        return NextResponse.json({ 
          error: 'Database not set up',
          details: 'Please visit /api/setup first to set up the database'
        }, { status: 500 });
      }
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ 
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { walletAddress, username } = await request.json();

    if (!walletAddress || !username) {
      return NextResponse.json({ error: 'Wallet address and username are required' }, { status: 400 });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    // Validate username format
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: 'Username must be between 3 and 20 characters' }, { status: 400 });
    }

    // Check if username is taken by another user
    try {
      const taken = await isUsernameTaken(username, walletAddress);
      if (taken) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
      }
    } catch (error) {
      console.error('Error checking username:', error);
      return NextResponse.json({ 
        error: 'Failed to check username availability',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }

    // Update username
    try {
      const user = await updateUsername(walletAddress, username);
      if (!user) {
        throw new Error('Database operation failed to return the updated user');
      }
      return NextResponse.json(user);
    } catch (error) {
      console.error('Error updating username:', error);
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error in PUT /api/users:', error);
    return NextResponse.json({ 
      error: 'Failed to update username',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 