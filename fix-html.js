#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// HTML 파일에서 type="module" 제거
function fixHtmlFiles() {
  const htmlFiles = [
    path.resolve(__dirname, 'dist/src/popup/index.html'),
    path.resolve(__dirname, 'dist/src/options/index.html')
  ];

  htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf-8');
      
      // type="module" 제거
      content = content.replace(/type="module"\s+/g, '');
      
      // modulepreload를 일반 script로 변경
      content = content.replace(
        /<link rel="modulepreload" crossorigin href="([^"]+)">/g, 
        '<script crossorigin src="$1"></script>'
      );
      
      fs.writeFileSync(file, content);
      console.log(`Fixed: ${file}`);
    } else {
      console.warn(`File not found: ${file}`);
    }
  });
}

fixHtmlFiles();
