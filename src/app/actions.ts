'use server';

export async function getApiKey() {
  // Try NEXT_PUBLIC_GEMINI_API_KEY first, then GEMINI_API_KEY as fallback
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  return key || null;
}
