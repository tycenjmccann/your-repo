import { NextRequest } from 'next/server';

export async function getSession(req: NextRequest): Promise<{ userId: string } | null> {
  const userId = req.headers.get('x-user-id');
  if (!userId || userId.trim().length === 0) {
    return null;
  }
  return { userId: userId.trim() };
}
