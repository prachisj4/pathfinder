import fs from 'fs';
import path from 'path';

const dirPath = 'c:/Users/hp/Desktop/pathfinder/frontend/src/pages';
const indexHtmlPath = 'c:/Users/hp/Desktop/pathfinder/frontend/index.html';

const replacements = [
  // Backgrounds
  [/#0a0a0f/g, '#ffffff'], // Main background to white
  [/rgba\(255,255,255,0\.02\)/g, '#f8fafc'],
  [/rgba\(255,255,255,0\.03\)/g, '#f8fafc'], // Cards bg
  [/rgba\(255,255,255,0\.04\)/g, '#f8fafc'],
  [/rgba\(255,255,255,0\.05\)/g, '#f8fafc'],
  [/rgba\(255,255,255,0\.06\)/g, '#f1f5f9'],
  [/rgba\(255,255,255,0\.08\)/g, '#e2e8f0'],
  [/rgba\(255,255,255,0\.1\)/g, '#e2e8f0'],
  
  // Borders
  [/rgba\(255,255,255,0\.06\)/g, '#e2e8f0'],
  [/rgba\(255,255,255,0\.07\)/g, '#e2e8f0'],
  [/rgba\(255,255,255,0\.08\)/g, '#e2e8f0'],
  [/rgba\(255,255,255,0\.12\)/g, '#e2e8f0'],
  [/rgba\(255,255,255,0\.25\)/g, '#cbd5e1'],
  [/rgba\(255,255,255,0\.15\)/g, '#cbd5e1'],
  [/rgba\(255,255,255,0\.2\)/g, '#cbd5e1'],

  // Gradients for buttons to solid distinct brand colors (Apple-like corporate blue)
  [/linear-gradient\(135deg, #6366f1, #8b5cf6\)/g, '#000000'], // Black primary buttons
  [/linear-gradient\(135deg, #6366f1, #10b981\)/g, '#1e293b'],
  [/linear-gradient\(135deg, #10b981, #059669\)/g, '#000000'],
  [/linear-gradient\(90deg, #6366f1, #10b981\)/g, '#000000'],
  [/rgba\(99,102,241,0\.3\)/g, '#cbd5e1'], // Disabled primary buttons
  [/rgba\(16,185,129,0\.3\)/g, '#cbd5e1'], // Disabled submit

  // Text
  [/#f0f0f0/g, '#0f172a'],
  [/#a5b4fc/g, '#475569'],
  [/rgba\(255,255,255,0\.7\)/g, '#334155'],
  [/rgba\(255,255,255,0\.6\)/g, '#475569'],
  [/rgba\(255,255,255,0\.55\)/g, '#475569'],
  [/rgba\(255,255,255,0\.5\)/g, '#64748b'],
  [/rgba\(255,255,255,0\.45\)/g, '#64748b'],
  [/rgba\(255,255,255,0\.4\)/g, '#94a3b8'],
  [/rgba\(255,255,255,0\.35\)/g, '#94a3b8'],
  [/rgba\(255,255,255,0\.3\)/g, '#94a3b8'],
  [/rgba\(255,255,255,0\.25\)/g, '#cbd5e1'],
  [/color: \"white\"/g, 'color: \"#ffffff\"'], // White remains white for buttons mostly
  [/color: \"#ffffff\"/g, 'color: \"#ffffff\"'], // normalize
  // Wait, if it's text like `color: white` inside button, we want that.
  // But inside card titles, we don't.
  
  // Emojis and "AI" styling
  [/🧭 PathFinder<span style={{ color: \"#6366f1\" }}>AI<\/span>/g, 'PathFinder'],
  [/🚀 AI-Powered Career Guidance/g, 'Professional Career Guidance'],
  [/'DM Sans'/g, "'Inter'"],
  [/'Syne'/g, "'Inter'"],
  // Emojis
  [/🎯/g, ""], [/📊/g, ""], [/🗺️/g, ""], [/📈/g, ""], [/🔐/g, ""], [/♻️/g, ""], 
  [/🚀/g, ""], [/✨/g, ""], [/🔮/g, ""], [/🎉/g, ""], [/💡/g, ""], [/🧪/g, ""], 
  [/📝/g, ""], [/🏆/g, ""], [/🔥/g, ""], [/📚/g, ""], [/🔗/g, ""], [/✅/g, ""], 
  [/❌/g, ""], [/▶/g, ""], [/⏳/g, ""], [/🛠️/g, ""], [/🧩/g, ""], [/📋/g, ""],
  [/👋/g, ""], [/🎓/g, ""], [/💼/g, ""], [/🤖/g, ""],

  // Specific background text clips to plain colors
  [/WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"/g, 'color: "#000000"'],

  // Shadows
  [/box-shadow: 0 0 30px rgba\(99,102,241,0\.4\)/g, "boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'"],
  [/box-shadow: 0 0 50px rgba\(99,102,241,0\.6\)/g, "boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'"],

  // Custom AI backgrounds inside landing page
  [/background: \"radial-gradient.*\n.*borderRadius/g, 'display: "none", borderRadius'],
];

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }
  // Let's ensure body text is dark
  content = content.replace(/color: \"#0f172a\"/g, 'color: \"#0f172a\"'); // identity, just a check
  fs.writeFileSync(filePath, content, 'utf8');
}

fs.readdirSync(dirPath).forEach(file => {
  if (file.endsWith('.jsx')) {
    processFile(path.join(dirPath, file));
  }
});
processFile(indexHtmlPath);

// Update index html specifically
let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
indexContent = indexContent.replace(/<link href="https:\/\/fonts.googleapis.com\/css2\?family=DM\+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">/, `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`);
indexContent = indexContent.replace(/<title>.*<\/title>/, '<title>PathFinder — Career Discovery Platform</title>');
fs.writeFileSync(indexHtmlPath, indexContent, 'utf8');
console.log('Theme updated to professional mode.');
