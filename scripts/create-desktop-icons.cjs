const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const iconDir = path.join(
  __dirname,
  "..",
  "shikshasarthi-launcher",
  "desktop-wrapper",
  "build"
);
const pngPath = path.join(iconDir, "icon.png");
const icoPath = path.join(iconDir, "icon.ico");

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);

  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));

  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function createPng({ width, height, pixels }) {
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = 1 + x * 4;
      const pixel = pixels(x, y);
      row[offset] = pixel[0];
      row[offset + 1] = pixel[1];
      row[offset + 2] = pixel[2];
      row[offset + 3] = pixel[3];
    }
    rows.push(row);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const signature = Buffer.from("89504e470d0a1a0a", "hex");
  return Buffer.concat([
    signature,
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function createIco(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const directory = Buffer.alloc(16);
  directory[0] = 0;
  directory[1] = 0;
  directory[2] = 0;
  directory[3] = 0;
  directory.writeUInt16LE(1, 4);
  directory.writeUInt16LE(32, 6);
  directory.writeUInt32LE(png.length, 8);
  directory.writeUInt32LE(header.length + directory.length, 12);

  return Buffer.concat([header, directory, png]);
}

const png = createPng({
  width: 256,
  height: 256,
  pixels(x, y) {
    const dx = x - 128;
    const dy = y - 128;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const inCircle = distance <= 98;
    const inBookLeft = x >= 54 && x <= 126 && y >= 72 && y <= 184 && y + x >= 150;
    const inBookRight = x >= 130 && x <= 202 && y >= 72 && y <= 184 && y - x >= -106;
    const inSpine = x >= 122 && x <= 134 && y >= 78 && y <= 192;
    const inSpark = Math.abs(x - 184) + Math.abs(y - 72) < 20;

    if (inSpark) return [247, 181, 43, 255];
    if (inBookLeft || inBookRight || inSpine) return [255, 255, 255, 255];
    if (inCircle) return [20, 115, 230, 255];

    const shade = 18 + Math.round((x + y) / 512 * 22);
    return [shade, shade + 6, shade + 16, 255];
  },
});

fs.mkdirSync(iconDir, { recursive: true });
fs.writeFileSync(pngPath, png);
fs.writeFileSync(icoPath, createIco(png));

console.log(`Desktop icons written to ${iconDir}`);
