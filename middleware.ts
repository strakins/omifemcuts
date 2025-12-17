import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the route is admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // You can add admin authentication logic here
    // For now, we'll let the client-side handle the admin check
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};