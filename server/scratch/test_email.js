import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testEmail } from '../utils/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  console.log('🧪 Starting email test to cpnihal35@gmail.com...');
  const res = await testEmail('cpnihal35@gmail.com');
  console.log('Result:', res);
  process.exit(0);
}
run();
