
import axios from 'axios';
async function check() {
    try {
        const res = await axios.get('http://localhost:5001/api/categories');
        console.log('Categories:', JSON.stringify(res.data, null, 2));
        
        const res2 = await axios.get('http://localhost:5001/api/main-categories/active');
        console.log('Main Categories Active:', JSON.stringify(res2.data, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
check();
