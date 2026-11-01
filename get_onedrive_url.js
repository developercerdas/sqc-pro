const fs = require('fs');
const html = fs.readFileSync('onedrive_file.xlsx', 'utf8');

// Search for any redirect URL or download URL in the page
const re = /https?:\/\/[a-zA-Z0-9\.\-_/:\?&=%]+/g;
const urls = html.match(re) || [];
console.log('Total URLs found:', urls.length);
const relevant = urls.filter(u => u.includes('1drv.ms') || u.includes('sharepoint.com') || u.includes('download') || u.includes('guestaccess'));
console.log('Relevant URLs:', relevant);
