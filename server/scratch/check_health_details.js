
import axios from 'axios';
async function check() {
    try {
        const res = await axios.get('http://localhost:5001/health');
        console.log('Health:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
check();
