const fs = require('fs');
const path = require('path');

try {
  const filePath = path.join(__dirname, '..', 'db_dump.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log('Keys in dump:', Object.keys(data));
    
    if (data.users) {
      console.log(`Total users in dump: ${data.users.length}`);
      data.users.forEach((u, i) => {
        console.log(`${i+1}. Name: "${u.name}" | Email: "${u.email}" | Phone: "${u.phone}" | TC: "${u.tcNo}"`);
      });
    } else {
      console.log('No users found in dump.');
    }
    
    if (data.orders) {
      console.log(`\nTotal orders in dump: ${data.orders.length}`);
    }
    if (data.lmsQueues || data.lmsQueue) {
      const queue = data.lmsQueues || data.lmsQueue;
      console.log(`\nTotal LMS Queue jobs in dump: ${queue.length}`);
      queue.forEach((q, i) => {
        console.log(`${i+1}. Order ID: ${q.orderId} | Status: ${q.status} | Error: ${q.error}`);
      });
    }
  } else {
    console.log('db_dump.json not found');
  }
} catch (e) {
  console.error(e);
}
