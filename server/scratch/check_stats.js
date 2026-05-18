
import axios from 'axios';
async function check() {
    try {
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'shazyboo.info@gmail.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        
        const statsRes = await axios.get('http://localhost:5001/api/admin/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Stats:', JSON.stringify(statsRes.data.data.counts, null, 2));
    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}
check();
