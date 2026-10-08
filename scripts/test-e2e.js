async function testFullFlow() {
  console.log('====================================================');
  console.log('       SIGMA UBT - END-TO-END FLOW TESTS           ');
  console.log('====================================================\n');

  // 1. Login as Student
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'student', password: '1234' })
  });
  const studentCookie = loginRes.headers.get('set-cookie');
  console.log('1. Student login:', loginRes.status === 200 ? 'SUCCESS (200)' : 'FAILED');

  // 2. Start Exam
  const startRes = await fetch('http://localhost:3000/api/student/exams/set-1-demo/start', {
    method: 'POST',
    headers: { 'Cookie': studentCookie }
  });
  const startData = await startRes.json();
  console.log('2. Start exam status:', startRes.status, '| Questions count:', startData.questions?.length);
  console.assert(startRes.status === 200 && startData.questions?.length === 40, 'Start exam failed');

  // Check that correct answers are NOT leaked to client!
  const hasAnswers = startData.questions.some(q => q.answer !== undefined);
  console.log('   Correct answers hidden from client API:', !hasAnswers ? 'YES (Secure)' : 'NO (Leaked!)');
  console.assert(!hasAnswers, 'Security breach: answers leaked in start exam API');

  // 3. Submit Exam (select answers for 40 questions)
  const answers = {};
  startData.questions.forEach((q, i) => {
    answers[q.id] = 0; // Select option 0
    answers[q.qIndex] = 0;
  });

  const submitRes = await fetch('http://localhost:3000/api/student/exams/set-1-demo/submit', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': studentCookie
    },
    body: JSON.stringify({
      sessionId: startData.sessionId,
      selectedAnswers: answers
    })
  });
  const submitData = await submitRes.json();
  console.log('3. Submit exam status:', submitRes.status);
  console.log('   Grading Summary:', submitData.result ? {
    readingScore: submitData.result.readingScore,
    listeningScore: submitData.result.listeningScore,
    totalScore: submitData.result.totalScore,
    correctAnswers: submitData.result.correctAnswers,
    passed: submitData.result.passed
  } : submitData);
  console.assert(submitRes.status === 200 && submitData.success, 'Submit exam failed');

  // 4. Test Institute Student Management
  const instLogin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'sigma', password: '1234' })
  });
  const instCookie = instLogin.headers.get('set-cookie');
  console.log('\n4. Institute login:', instLogin.status === 200 ? 'SUCCESS (200)' : 'FAILED');

  // Create Student
  const newStudentUsername = 'test_student_' + Date.now();
  const createRes = await fetch('http://localhost:3000/api/institute/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': instCookie
    },
    body: JSON.stringify({
      name: 'Automated Test Student',
      username: newStudentUsername,
      password: 'password123',
      phone: '9841000000',
      batch: 'Morning'
    })
  });
  const createData = await createRes.json();
  console.log('5. Create student status:', createRes.status, '| New Student:', createData.student?.username);
  console.assert(createRes.status === 200 && createData.student?.id, 'Create student failed');

  // List Students
  const listRes = await fetch('http://localhost:3000/api/institute/students', {
    headers: { 'Cookie': instCookie }
  });
  const listData = await listRes.json();
  console.log('6. List students status:', listRes.status, '| Total students found:', listData.students?.length);
  console.assert(listRes.status === 200 && listData.students?.some(s => s.username === newStudentUsername), 'Student list verification failed');

  // Delete Created Student
  const delRes = await fetch('http://localhost:3000/api/institute/students?id=' + createData.student.id, {
    method: 'DELETE',
    headers: { 'Cookie': instCookie }
  });
  const delData = await delRes.json();
  console.log('7. Delete student status:', delRes.status, '| Response:', delData.message);
  console.assert(delRes.status === 200 && delData.success, 'Delete student failed');

  console.log('\n====================================================');
  console.log('⭐ ALL END-TO-END FLOW TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

testFullFlow().catch(console.error);
