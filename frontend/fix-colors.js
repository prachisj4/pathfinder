import fs from 'fs';
import path from 'path';

const dirPath = 'c:/Users/hp/Desktop/pathfinder/frontend/src/pages';

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix form input text colors
  content = content.replace(/color: \"#ffffff\", fontSize/g, 'color: \"#0f172a\", fontSize');
  
  // Fix button text colors on light backgrounds
  content = content.replace(/color: step === 0 \? \"#cbd5e1\" : \"white\"/g, 'color: step === 0 ? \"#94a3b8\" : \"#0f172a\"');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

fs.readdirSync(dirPath).forEach(file => {
  if (file.endsWith('.jsx')) {
    processFile(path.join(dirPath, file));
  }
});

console.log('Fixed input colors');
