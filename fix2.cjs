const fs = require('fs');
let c = fs.readFileSync('src/components/Navigation.tsx', 'utf-8');
c = c.replace(/ hover:scale-\[1\.03\]/g, '');
fs.writeFileSync('src/components/Navigation.tsx', c);
console.log('Fixed Navigation.tsx');
