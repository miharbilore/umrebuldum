const fs = require('fs');
const path = require('path');
const dirs = ['app/sanal-tur/page.tsx', 'app/yasam-rehberi/page.tsx', 'app/rehber/page.tsx'];
dirs.forEach(p => {
  const fullPath = path.join('d:/Yeni klasör/Yeni klasör (3)/umre/kurulum/umrebuldum/frontend', p);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/\/images\/tour\/mekke\/[^\.\"]+\.jpg/g, '/stock/kabe-1.png');
    content = content.replace(/\/images\/tour\/medine\/[^\.\"]+\.jpg/g, '/stock/medina-1.png');
    content = content.replace(/\/images\/tour\/diger\/[^\.\"]+\.jpg/g, '/stock/pattern-1.png');
    content = content.replace(/\/images\/rehber\/[^\.\"]+\.jpg/g, '/stock/pattern-1.png');
    fs.writeFileSync(fullPath, content);
    console.log('Fixed', p);
  } else {
    console.log('Not found', p);
  }
});
