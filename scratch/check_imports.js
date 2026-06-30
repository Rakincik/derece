const fs = require('fs');
const content = fs.readFileSync('src/components/admin/AdminDashboard.js', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < 100; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
