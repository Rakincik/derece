const fs = require('fs');
const content = fs.readFileSync('src/components/admin/AdminDashboard.js', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('type="file"')) {
    console.log(`Line ${idx+1}: ${line.trim()}`);
  }
});
