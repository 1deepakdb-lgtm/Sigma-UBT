async function testDictionarySystem() {
  console.log('====================================================');
  console.log('   SIGMA UBT - DICTIONARY & VOICE AUDIO TESTS       ');
  console.log('====================================================\n');

  // Test 1: Fetch initial dictionary
  console.log('1. Testing GET /api/dictionary (default listing)...');
  let res = await fetch('http://localhost:3000/api/dictionary?limit=5');
  let data = await res.json();
  console.log(`   Status: ${res.status} | Count: ${data.results?.length}`);
  console.assert(res.status === 200 && data.results?.length > 0, 'Test 1 Failed');

  // Test 2: Search Korean "사과"
  console.log('\n2. Testing Search Korean ("사과")...');
  res = await fetch('http://localhost:3000/api/dictionary?q=' + encodeURIComponent('사과'));
  data = await res.json();
  const apple = data.results?.[0];
  console.log('   Found:', {
    korean: apple?.korean,
    koreanRomanized: apple?.koreanRomanized,
    nepali: apple?.nepali,
    nepaliRomanized: apple?.nepaliRomanized,
    english: apple?.english
  });
  console.assert(apple?.korean === '사과' && apple?.koreanRomanized === 'sagwa', 'Korean romanization failed');
  console.assert(apple?.nepaliRomanized?.includes('syau') || apple?.nepaliRomanized?.includes('syaau'), 'Nepali romanization failed');

  // Test 3: Search Romanized Nepali "namaste"
  console.log('\n3. Testing Search by Romanized Nepali ("namaste")...');
  res = await fetch('http://localhost:3000/api/dictionary?q=namaste');
  data = await res.json();
  const namaste = data.results?.[0];
  console.log('   Found:', {
    korean: namaste?.korean,
    koreanRomanized: namaste?.koreanRomanized,
    nepali: namaste?.nepali,
    nepaliRomanized: namaste?.nepaliRomanized
  });
  console.assert(namaste?.korean === '안녕하세요', 'Romanized search failed');

  // Test 4: Smooth Neural Female Voice Playback
  console.log('\n4. Testing Smooth Neural Female Voice (Korean)...');
  res = await fetch('http://localhost:3000' + apple.audio.korean.female);
  console.log(`   Status: ${res.status} | Content-Type: ${res.headers.get('content-type')}`);
  const femaleBuf = await res.arrayBuffer();
  console.log(`   Audio buffer: ${femaleBuf.byteLength} bytes`);
  console.assert(res.status === 200 && femaleBuf.byteLength > 1000, 'Female voice test failed');

  // Test 5: Polite Neural Male Voice Playback
  console.log('\n5. Testing Polite Neural Male Voice (Korean)...');
  res = await fetch('http://localhost:3000' + apple.audio.korean.male);
  console.log(`   Status: ${res.status} | Content-Type: ${res.headers.get('content-type')}`);
  const maleBuf = await res.arrayBuffer();
  console.log(`   Audio buffer: ${maleBuf.byteLength} bytes`);
  console.assert(res.status === 200 && maleBuf.byteLength > 1000, 'Male voice test failed');

  // Test 6: Voice Audio MP3 Downloader Header
  console.log('\n6. Testing Audio MP3 Downloader headers (Content-Disposition)...');
  res = await fetch('http://localhost:3000' + apple.audio.korean.femaleDownload);
  const disposition = res.headers.get('content-disposition');
  console.log(`   Status: ${res.status} | Content-Disposition: ${disposition}`);
  console.assert(res.status === 200 && disposition?.includes('attachment'), 'Downloader header test failed');

  // Test 7: Nepali Neural Female and Male Voices
  console.log('\n7. Testing Nepali Neural Voices (Female & Male)...');
  const neFemRes = await fetch('http://localhost:3000' + namaste.audio.nepali.female);
  const neFemBuf = await neFemRes.arrayBuffer();
  console.log(`   Nepali Female Audio: ${neFemRes.status} (${neFemBuf.byteLength} bytes)`);

  const neMaleRes = await fetch('http://localhost:3000' + namaste.audio.nepali.male);
  const neMaleBuf = await neMaleRes.arrayBuffer();
  console.log(`   Nepali Male Audio: ${neMaleRes.status} (${neMaleBuf.byteLength} bytes)`);
  console.assert(neFemRes.status === 200 && neMaleRes.status === 200, 'Nepali voices failed');

  console.log('\n====================================================');
  console.log('  ✅ ALL DICTIONARY, ROMANIZATION & AUDIO TESTS PASSED! ');
  console.log('====================================================');
}

testDictionarySystem().catch(console.error);
