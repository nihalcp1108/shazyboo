async function trigger() {
  try {
    console.log('🔗 Sending POST request to http://localhost:5001/api/auth/forgotpassword for cpnihal35@gmail.com...');
    const response = await fetch('http://localhost:5001/api/auth/forgotpassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'cpnihal35@gmail.com' })
    });
    
    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', data);
  } catch (err) {
    console.error('Error triggering forgot password:', err.message);
  }
}
trigger();
