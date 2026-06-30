const fs = require('fs');
const dump = JSON.parse(fs.readFileSync('db_dump.json', 'utf8'));

for (const key in dump) {
  if (Array.isArray(dump[key])) {
    dump[key].forEach((item, index) => {
      for (const prop in item) {
        if (typeof item[prop] === 'string' && item[prop].includes('???')) {
          console.log(`Corrupted field: Table=${key}, Index=${index}, Prop=${prop}`);
          console.log(`Snippet: ${item[prop].substring(0, 100)}`);
        }
      }
    });
  }
}
