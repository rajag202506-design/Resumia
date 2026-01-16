import { prisma } from '../../../lib/prisma';
import bcryptjs from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return Response.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    });

    return Response.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update password error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}