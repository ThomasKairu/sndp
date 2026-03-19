const sharp = require('sharp');
sharp('public/v2/optimized/Me.png')
  .webp({ quality: 80 })
  .toFile('public/v2/optimized/Thomas_Kairu.webp')
  .then(() => console.log('Converted successfully'))
  .catch(err => console.error(err));
