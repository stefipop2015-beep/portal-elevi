const fs = require('fs');

['index.html', 'index1.html'].forEach(fn => {
  const html = fs.readFileSync('d:/01.WorkspaceCLAUDE/Portal-Elevi/' + fn, 'utf8');

  // Emoji check
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const hasEmoji = emojiRegex.test(html);
  if (hasEmoji) throw new Error('Emoji detected in ' + fn);

  // Modal checks
  if (!html.includes('id="simulatorModal"')) throw new Error('Missing simulatorModal in ' + fn);
  if (!html.includes('function openSimulatorModal')) throw new Error('Missing openSimulatorModal in ' + fn);
  if (!html.includes('function closeSimulatorModal')) throw new Error('Missing closeSimulatorModal in ' + fn);
  if (!html.includes('function toggleModalFullscreen')) throw new Error('Missing toggleModalFullscreen in ' + fn);
  if (!html.includes('Liceul Tehnologic „Ioniță G. Andron” Negrești Oaș')) throw new Error('Missing institution in ' + fn);
  if (!html.includes('prof. ing. Ștefan Dan POP')) throw new Error('Missing professor in ' + fn);
  
  console.log(fn + ' passed all modal integration checks!');
});
