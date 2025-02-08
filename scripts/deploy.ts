import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function deploy() {
  try {
    // Build the Next.js application
    console.log('Building Next.js application...');
    await execAsync('npm run build');

    // Deploy to Firebase
    console.log('Deploying to Firebase...');
    await execAsync('firebase deploy');

    console.log('Deployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deploy(); 