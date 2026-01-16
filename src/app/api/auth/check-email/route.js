import { prisma } from '../../../lib/prisma';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

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
      return Response.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    return Response.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Check email error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}