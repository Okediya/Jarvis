'use server';

export async function getApiKey() {
  // Use a variable WITHOUT NEXT_PUBLIC_ so Next.js doesn't delete it during the Docker build
  const key = process.env.GEMINI_API_KEY;
  return key || null;
}
