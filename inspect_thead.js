const fs = require('fs');
const html = fs.readFileSync('D:/APLIKASI/dashboard-produksi/index.html', 'utf8');
const pos = html.indexOf('id="workerFilter"');
console.log(html.substring(pos - 200, pos + 800));
