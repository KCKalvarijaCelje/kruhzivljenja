import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');
const assetsDir = path.resolve(rootDir, 'src/assets');

export async function generateIcons() {
  const masterLogo = path.resolve(publicDir, 'LOGO-kruh.webp');
  if (!fs.existsSync(masterLogo)) {
    console.warn('[icon-gen] Master logo not found at:', masterLogo);
    return;
  }

  let sharp;
  try {
    const sharpModule = await import('sharp');
    sharp = sharpModule.default || sharpModule;
  } catch (err) {
    console.warn('[icon-gen] sharp could not be loaded:', err.message);
    return;
  }

  console.log('[icon-gen] Processing icons from:', masterLogo);

  // 1. Delete old test files or deprecated icons
  const testSvg = path.resolve(publicDir, 'test.svg');
  if (fs.existsSync(testSvg)) fs.unlinkSync(testSvg);

  // Background color matching the logo
  const BRAND_COLOR = '#744927';

  // 2. Generate icon-192.png (192x192)
  const icon192Buffer = await sharp(masterLogo)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.resolve(publicDir, 'icon-192.png'), icon192Buffer);

  // 3. Generate icon-512.png (512x512)
  const icon512Buffer = await sharp(masterLogo)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.resolve(publicDir, 'icon-512.png'), icon512Buffer);

  // 4. Generate icon-maskable-512.png (512x512 with safe-zone padding and solid brand background)
  // Maskable safe zone is central 80% circle (i.e. ~410px diameter on 512px canvas)
  const innerLogoBuffer = await sharp(masterLogo)
    .resize(410, 410, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const maskable512Buffer = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: BRAND_COLOR,
    },
  })
    .composite([{ input: innerLogoBuffer, gravity: 'center' }])
    .png()
    .toBuffer();
  fs.writeFileSync(path.resolve(publicDir, 'icon-maskable-512.png'), maskable512Buffer);

  // 5. Generate apple-touch-icon.png (180x180 with solid background so iOS doesn't make it black)
  const appleTouchInner = await sharp(masterLogo)
    .resize(144, 144, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const appleTouchBuffer = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: BRAND_COLOR,
    },
  })
    .composite([{ input: appleTouchInner, gravity: 'center' }])
    .png()
    .toBuffer();
  fs.writeFileSync(path.resolve(publicDir, 'apple-touch-icon.png'), appleTouchBuffer);

  // 6. Generate favicon-32x32.png and favicon-16x16.png
  const favicon32Buffer = await sharp(masterLogo)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.resolve(publicDir, 'favicon-32x32.png'), favicon32Buffer);

  const favicon16Buffer = await sharp(masterLogo)
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.resolve(publicDir, 'favicon-16x16.png'), favicon16Buffer);

  // 7. Generate favicon.ico (containing 32x32 PNG)
  const icoHeader = Buffer.from([0x00, 0x00, 0x01, 0x00, 0x01, 0x00]);
  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(32, 0); // width
  dirEntry.writeUInt8(32, 1); // height
  dirEntry.writeUInt8(0, 2);  // no palette
  dirEntry.writeUInt8(0, 3);  // reserved
  dirEntry.writeUInt16LE(1, 4); // color planes
  dirEntry.writeUInt16LE(32, 6); // bpp
  dirEntry.writeUInt32LE(favicon32Buffer.length, 8); // size
  dirEntry.writeUInt32LE(22, 12); // offset (6 + 16 = 22)
  const faviconIcoBuffer = Buffer.concat([icoHeader, dirEntry, favicon32Buffer]);
  fs.writeFileSync(path.resolve(publicDir, 'favicon.ico'), faviconIcoBuffer);

  // 8. Generate favicon.svg (SVG referencing or embedding the webp logo)
  const webpBase64 = fs.readFileSync(masterLogo).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/webp;base64,${webpBase64}" width="512" height="512"/>
</svg>`;
  fs.writeFileSync(path.resolve(publicDir, 'favicon.svg'), svgContent, 'utf-8');

  // 9. Sync/update src/assets/logo.png and src/assets/logo.webp
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  // High quality PNG version of logo for internal app imports
  const logoPngBuffer = await sharp(masterLogo)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.resolve(assetsDir, 'logo.png'), logoPngBuffer);
  fs.copyFileSync(masterLogo, path.resolve(assetsDir, 'logo.webp'));

  console.log('[icon-gen] Successfully generated and replaced all icons & logos!');
}

generateIcons().catch(console.error);
