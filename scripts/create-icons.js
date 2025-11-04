const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#1a1f3a"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.3}" 
        font-weight="bold" 
        fill="#ffffff" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >PS</text>
    </svg>
  `;

  const outputPath = path.join(__dirname, '..', 'public', 'icons', `${size}x${size}.png`);
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`Created ${outputPath}`);
}

async function main() {
  await createIcon(192);
  await createIcon(512);
  console.log('All icons created!');
}

main().catch(console.error);

