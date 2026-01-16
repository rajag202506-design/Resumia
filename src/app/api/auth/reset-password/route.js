import { prisma } from '../../../lib/prisma';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, token, newPassword } = await request.json();

    // If this is a password reset request (only email provided)
    if (email && !token && !newPassword) {
      // Validate email domain
      const allowedDomains = ['gmail.com', 'outlook.com', 'cust.pk', 'edu.cust.pk'];
      const domain = email.split('@')[1];
      
      if (!allowedDomains.includes(domain)) {
        return Response.json(
          { error: 'Only emails from gmail.com, outlook.com, cust.pk, or edu.cust.pk are allowed' },
          { status: 400 }
        );
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return Response.json(
          { message: 'If an account with that email exists, password reset instructions have been sent.' },
          { status: 200 }
        );
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Store reset token in database (you'll need to add these columns to your User model)
      await prisma.user.update({
        where: { email },
        data: {
          resetToken,
          resetTokenExpiry
        }
      });

      // In a real application, you would send an email here
      // For now, we'll just return a success message
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset link: http://localhost:3001/reset-password?token=${resetToken}&email=${email}`);

      return Response.json(
        { message: 'Password reset instructions have been sent to your email address.' },
        { status: 200 }
      );
    }

    // If this is a password reset confirmation (token and newPassword provided)
    if (email && token && newPassword) {
      if (newPassword.length < 6) {
        return Response.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }

      // Find user with valid reset token
      const user = await prisma.user.findFirst({
        where: {
          email,
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return Response.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcryptjs.hash(newPassword, 12);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      return Response.json(
        { message: 'Password has been reset successfully' },
        { status: 200 }
      );
    }

    return Response.json(
      { error: 'Invalid request' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}