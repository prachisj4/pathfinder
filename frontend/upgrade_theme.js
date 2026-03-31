import fs from 'fs';
import path from 'path';

const dirPath = 'c:/Users/hp/Desktop/pathfinder/frontend/src/pages';
const indexHtmlPath = 'c:/Users/hp/Desktop/pathfinder/frontend/index.html';

const replacements = [
  // Background
  [/#0a0a0f/g, '#020617'], // Deep rich slate

  // Fonts
  [/'DM Sans'/g, "'Plus Jakarta Sans'"],
  [/'Syne'/g, "'Outfit'"],

  // Vibrant Gradients
  // Replace purple->purple with wild fuchsia->violet
  [/linear-gradient\(135deg, #6366f1, #8b5cf6\)/g, 'linear-gradient(135deg, #FF0080, #7928CA)'],
  // Replace purple->green with cyan->blue
  [/linear-gradient\(135deg, #6366f1, #10b981\)/g, 'linear-gradient(135deg, #00DFD8, #007CF0)'],
  // Replace pure green gradient with emerald->teal
  [/linear-gradient\(135deg, #10b981, #059669\)/g, 'linear-gradient(135deg, #10b981, #06b6d4)'],

  // Standalone Colors
  [/#6366f1/g, '#FF0080'], // Accents to Fuchsia
  [/#10b981/g, '#00DFD8'], // Accents to Cyan
  [/#a5b4fc/g, '#fbcfe8'], // Light accent text
  [/#f59e0b/g, '#F5A623'], // Yellows

  // Card Borders and Backgrounds (more glassy, less flat)
  [/rgba\(255,255,255,0\.02\)/g, 'rgba(255,255,255,0.015)'],
  [/rgba\(255,255,255,0\.03\)/g, 'rgba(255,255,255,0.02)'],
  [/rgba\(255,255,255,0\.04\)/g, 'rgba(255,255,255,0.03)'],
  // Make borders stand out slightly with a hint of color instead of pure white
  [/rgba\(255,255,255,0\.06\)/g, 'rgba(255,255,255,0.08)'],
  [/rgba\(255,255,255,0\.08\)/g, 'rgba(255,255,255,0.12)'],

  // Enhanced Shadows
  [/box-shadow: 0 0 30px rgba\(99,102,241,0\.4\)/g, 'box-shadow: 0 0 40px rgba(255, 0, 128, 0.5)'],
  [/box-shadow: 0 0 50px rgba\(99,102,241,0\.6\)/g, 'box-shadow: 0 0 60px rgba(255, 0, 128, 0.7)'],
  [/boxShadow: "0 0 30px rgba\(16,185,129,0\.3\)"/g, 'boxShadow: "0 0 40px rgba(0, 223, 216, 0.4)"'],
  
];

// Re-inject some specific hover animations dynamically!
const cssInjections = {
  'LandingPage.jsx': (content) => {
    return content.replace(
      '.feature-card:hover {',
      '.feature-card { backdrop-filter: blur(16px); }\n        .feature-card:hover { box-shadow: 0 10px 40px -10px rgba(0,223,216,0.3);'
    )
  },
  'DashboardPage.jsx': (content) => {
    // Add glass hover to tracking cards
    return content.replace(
      'const cardStyle = {',
      'const cardStyle = { backdropFilter: "blur(12px)", transition: "all 0.3s", '
    ).replace(
      '<div key={i} style={cardStyle}>',
      '<div key={i} style={{...cardStyle}} onMouseEnter={(e) => {e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.borderColor="rgba(255,0,128,0.4)";}} onMouseLeave={(e) => {e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";}}>'
    );
  }
};

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }
  
  const filename = path.basename(filePath);
  if (cssInjections[filename]) {
    content = cssInjections[filename](content);
  }
  
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
// Fix font link
indexContent = indexContent.replace(
  /<link href="https:\/\/fonts.googleapis.com\/css2\?family=DM\+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">/, 
  `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">`
);
fs.writeFileSync(indexHtmlPath, indexContent, 'utf8');
console.log('Upgraded theme successfully.');
