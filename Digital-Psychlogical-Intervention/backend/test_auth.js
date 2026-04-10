const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Testing Registration ---');
  const regData = {
    name: 'Auth Tester',
    email: 'authtester' + Date.now() + '@test.com',
    password: 'password123',
    role: 'counselor'
  };
  
  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regData)
  });
  
  const regJson = await regRes.json();
  console.log('Status:', regRes.status);
  console.log('Data:', JSON.stringify(regJson, null, 2));

  if (regRes.status !== 201) {
    console.error('Registration failed');
    return;
  }

  const token = regJson.token;
  console.log('\n--- Testing Protected Route (Profile) ---');
  const profRes = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const profJson = await profRes.json();
  console.log('Status:', profRes.status);
  console.log('Data:', JSON.stringify(profJson, null, 2));

  console.log('\n--- Testing Login ---');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: regData.email,
      password: regData.password
    })
  });
  const loginJson = await loginRes.json();
  console.log('Status:', loginRes.status);
  console.log('Data:', JSON.stringify(loginJson, null, 2));

  if (loginRes.status === 200) {
    console.log('\n✅ ALL AUTH TESTS PASSED');
  } else {
    console.error('\n❌ LOGIN TEST FAILED');
  }
}

runTests().catch(err => console.error(err));
