import dotenv from 'dotenv';
import { testEmail } from '../utils/emailService.js';

dotenv.config();

const runTest = async () => {
    console.log('🧪 Triggering test email to nihalcp398@gmail.com...');
    try {
        const res = await testEmail('nihalcp398@gmail.com');
        console.log('🧪 Test execution completed:', res);
        process.exit(res.success ? 0 : 1);
    } catch (err) {
        console.error('🧪 Test execution failed:', err);
        process.exit(1);
    }
};

runTest();
