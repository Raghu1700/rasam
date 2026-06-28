// Generates simple solid-color placeholder PNGs so the app builds out of the
// box. Replace these with real artwork later. Run: node scripts/make-assets.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function makePng(size, [r, g, b]) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  // rows: each row prefixed with filter byte 0
  const row = Buffer.concat([
    Buffer.from([0]),
    Buffer.concat(Array.from({ length: size }, () => Buffer.from([r, g, b]))),
  ]);
  const raw = Buffer.concat(Array.from({ length: size }, () => row));
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const PINK = [255, 107, 129];
const WHITE = [255, 255, 255];
const HOME_BG = [255, 228, 234]; // soft pink — placeholder Home background
const PHOTO_BG = [230, 224, 245]; // soft lilac — placeholder Photo background

const outDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(outDir, { recursive: true });

const files = [
  ['icon.png', 512, PINK],
  ['adaptive-icon.png', 512, PINK],
  ['splash.png', 512, PINK],
  ['notification-icon.png', 96, WHITE],
  ['widget-preview.png', 256, PINK],
  ['favicon.png', 48, PINK],
  // Placeholder full-screen backgrounds — replaced with the user's photos.
  ['bg-home.png', 256, HOME_BG],
  ['bg-photo.png', 256, PHOTO_BG],
];

for (const [name, size, color] of files) {
  fs.writeFileSync(path.join(outDir, name), makePng(size, color));
  console.log('wrote assets/' + name);
}
