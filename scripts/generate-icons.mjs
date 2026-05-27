/**
 * generate-icons.mjs
 * Resizes the Melodix logo into every Android mipmap density bucket
 * and copies a web-friendly PNG favicon to public/.
 *
 * Run once:  node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { copyFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');
const SRC_LOGO  = resolve('C:/Users/venka/.gemini/antigravity/brain/583b9165-6b35-49f4-8a12-86a3c2342d53/melodix_logo_1777821395215.png');
const RES_DIR   = resolve(ROOT, 'android/app/src/main/res');
const PUBLIC    = resolve(ROOT, 'public');

// ── Android mipmap sizes ──────────────────────────────────────────────────────
// ic_launcher        = the full icon (background + foreground combined)
// ic_launcher_round  = same image, masked to a circle by the OS
// ic_launcher_foreground = foreground layer for adaptive icons (108dp padding)
const SIZES = [
  { dir: 'mipmap-mdpi',    launcher: 48,  foreground: 81  },
  { dir: 'mipmap-hdpi',    launcher: 72,  foreground: 122 },
  { dir: 'mipmap-xhdpi',   launcher: 96,  foreground: 162 },
  { dir: 'mipmap-xxhdpi',  launcher: 144, foreground: 243 },
  { dir: 'mipmap-xxxhdpi', launcher: 192, foreground: 324 },
];

async function resize(src, dest, size) {
  await sharp(src)
    .resize(size, size, { fit: 'contain', background: { r: 10, g: 10, b: 18, alpha: 1 } })
    .png()
    .toFile(dest);
  console.log(`  ✓  ${dest.replace(ROOT, '.')}`);
}

async function main() {
  console.log('\n🎨  Generating Melodix icons...\n');

  for (const { dir, launcher, foreground } of SIZES) {
    const outDir = resolve(RES_DIR, dir);
    mkdirSync(outDir, { recursive: true });

    await resize(SRC_LOGO, resolve(outDir, 'ic_launcher.png'),            launcher);
    await resize(SRC_LOGO, resolve(outDir, 'ic_launcher_round.png'),      launcher);
    await resize(SRC_LOGO, resolve(outDir, 'ic_launcher_foreground.png'), foreground);
  }

  // ── Web favicon (512px PNG in public/) ─────────────────────────────────────
  mkdirSync(PUBLIC, { recursive: true });
  await resize(SRC_LOGO, resolve(PUBLIC, 'logo512.png'), 512);
  await resize(SRC_LOGO, resolve(PUBLIC, 'logo192.png'), 192);

  // Also drop a 32px favicon.png (browsers pick it up from <link> tag)
  await resize(SRC_LOGO, resolve(PUBLIC, 'favicon.png'), 32);

  console.log('\n✅  All icons generated!\n');
  console.log('👉  Update index.html to use favicon.png instead of the SVG emoji.');
}

main().catch(e => { console.error(e); process.exit(1); });
