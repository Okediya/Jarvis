import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { techStack, projectName } = body;

    if (!techStack || !projectName) {
      return NextResponse.json(
        { success: false, error: 'Missing techStack or projectName' },
        { status: 400 }
      );
    }

    // Determine where to create the new project.
    // For safety, we'll put it in the parent directory of the current Jarvis app
    // so it doesn't get nested inside Jarvis's own source code.
    const runDir = path.resolve(process.cwd(), '..');
    const projectPath = path.join(runDir, projectName);

    console.log(`[Build API] Building ${projectName} with ${techStack} at ${runDir}`);

    let command = '';

    const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    switch (techStack.toLowerCase()) {
      case 'nextjs':
      case 'next.js':
      case 'next':
        command = `npx -y create-next-app@latest ${sanitizedName} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`;
        break;
      case 'vite-react':
      case 'react':
      case 'vite':
        command = `npm create vite@latest ${sanitizedName} -- --template react-ts`;
        break;
      case 'vite-vue':
      case 'vue':
        command = `npm create vite@latest ${sanitizedName} -- --template vue-ts`;
        break;
      default:
        // Fallback to Next.js
        command = `npx -y create-next-app@latest ${sanitizedName} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`;
        break;
    }

    // Wrap the CLI execution in a try/catch
    console.log(`[Build API] Executing command: ${command}`);
    
    // We don't await the full installation if we want to return fast, 
    // but the actual app creation might take 30-60 seconds.
    // For this prototype, we'll await it so we don't leave zombie processes,
    // or we can fire and forget. Let's fire and forget for a fast response.
    execAsync(command, { cwd: runDir })
      .then(({ stdout, stderr }) => {
        console.log(`[Build API] Successfully created project:\n${stdout}`);
      })
      .catch((err) => {
        console.error(`[Build API] Scaffold command failed:`, err);
      });

    return NextResponse.json({
      success: true,
      message: `Scaffolding started with command: ${command}`,
      path: projectPath
    });

  } catch (error: any) {
    console.error('[Build API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
