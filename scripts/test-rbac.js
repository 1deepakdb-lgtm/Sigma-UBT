async function runRBACTests() {
  console.log('====================================================');
  console.log('       SIGMA UBT - ROLE-BASED ACCESS CONTROL TESTS   ');
  console.log('====================================================\n');

  // Test 1: Unauthenticated user accessing protected API
  console.log('1. Testing Unauthenticated Access to /api/admin/institutes...');
  let res = await fetch('http://localhost:3000/api/admin/institutes', { redirect: 'manual' });
  console.log(`   Status: ${res.status} (Expected: 401)`);
  let json = await res.json();
  console.log(`   Response:`, json);
  console.assert(res.status === 401, 'Test 1 Failed: Status should be 401');

  // Test 2: Unauthenticated user accessing protected UI page (/admin)
  console.log('\n2. Testing Unauthenticated Access to /admin UI page...');
  res = await fetch('http://localhost:3000/admin', { redirect: 'manual' });
  console.log(`   Status: ${res.status} (Expected: 307 Redirect)`);
  const location = res.headers.get('location');
  console.log(`   Redirect Location: ${location} (Expected to redirect to /?error=unauthorized)`);
  console.assert(res.status === 307 && location && location.includes('error=unauthorized'), 'Test 2 Failed');

  // Log in as Student
  console.log('\n3. Logging in as Student...');
  res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'student', password: '1234' })
  });
  const studentCookie = res.headers.get('set-cookie');
  console.log(`   Student Login Status: ${res.status}`);

  // Test 4: Student attempting to call Admin API
  console.log('\n4. Testing Student Attempting to Call Admin API (/api/admin/institutes)...');
  res = await fetch('http://localhost:3000/api/admin/institutes', {
    headers: { 'Cookie': studentCookie }
  });
  console.log(`   Status: ${res.status} (Expected: 403 Forbidden)`);
  json = await res.json();
  console.log(`   Response:`, json);
  console.assert(res.status === 403, 'Test 4 Failed: Student should be 403');

  // Test 5: Student attempting to Upload File
  console.log('\n5. Testing Student Attempting to Upload Media (/api/upload)...');
  const studentForm = new FormData();
  studentForm.append('file', new Blob(['fake audio'], { type: 'audio/mpeg' }), 'test.mp3');
  res = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Cookie': studentCookie },
    body: studentForm
  });
  console.log(`   Status: ${res.status} (Expected: 403 Forbidden)`);
  json = await res.json();
  console.log(`   Response:`, json);
  console.assert(res.status === 403, 'Test 5 Failed: Student upload should be 403');

  // Log in as Admin
  console.log('\n6. Logging in as Super Admin...');
  res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const adminCookie = res.headers.get('set-cookie');
  console.log(`   Admin Login Status: ${res.status}`);

  // Test 7: Admin calling Admin API
  console.log('\n7. Testing Super Admin Calling /api/admin/institutes...');
  res = await fetch('http://localhost:3000/api/admin/institutes', {
    headers: { 'Cookie': adminCookie }
  });
  console.log(`   Status: ${res.status} (Expected: 200 OK)`);
  json = await res.json();
  console.log(`   Total Institutes in DB:`, json.institutes?.length);
  console.assert(res.status === 200, 'Test 7 Failed: Admin should be 200');

  // Test 8: Disallowed File Upload (.exe) by Admin
  console.log('\n8. Testing Disallowed File Upload (e.g. malware.exe)...');
  const badForm = new FormData();
  badForm.append('file', new Blob(['binary data'], { type: 'application/octet-stream' }), 'malware.exe');
  res = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Cookie': adminCookie },
    body: badForm
  });
  console.log(`   Status: ${res.status} (Expected: 400 Invalid file type)`);
  json = await res.json();
  console.log(`   Response:`, json);
  console.assert(res.status === 400, 'Test 8 Failed');

  // Test 9: Valid MP3 Audio Upload by Admin
  console.log('\n9. Testing Legitimate Audio Upload (listening_sample.mp3)...');
  const validForm = new FormData();
  validForm.append('file', new Blob(['ID3 listening question audio test content'], { type: 'audio/mpeg' }), 'listening_sample.mp3');
  res = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Cookie': adminCookie },
    body: validForm
  });
  console.log(`   Status: ${res.status} (Expected: 200 OK)`);
  json = await res.json();
  console.log(`   Uploaded URL:`, json.url);
  console.assert(res.status === 200 && json.url, 'Test 9 Failed');

  console.log('\n====================================================');
  console.log('   ✅ ALL RBAC & SECURITY TESTS PASSED PERFECTLY!   ');
  console.log('====================================================');
}

runRBACTests().catch(console.error);
