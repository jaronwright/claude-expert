#!/usr/bin/env node
/**
 * Generate solid-color PNG icons for the PWA manifest.
 *
 * Produces /public/icons/icon-192.png and /public/icons/icon-512.png.
 * Uses only Node built-ins (no sharp/canvas dependency). The icon is a solid
 * brand-colored square with a centered white star. Swap in a designed icon
 * set before shipping widely.
 */

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "public/icons");

const BRAND = [0xc9, 0x64, 0x42]; // #C96442
const WHITE = [0xff, 0xff, 0xff];

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

mkdirSync(OUT_DIR, { recursive: true });

for (const size of [192, 512]) {
  const buf = makeIcon(size, BRAND, WHITE);
  const path = resolve(OUT_DIR, `icon-${size}.png`);
  writeFileSync(path, buf);
  console.log(`wrote ${path} (${buf.length} bytes)`);
}

function makeIcon(size, bg, fg) {
  // Raw RGBA pixel data with a filter byte per row.
  const rowBytes = size * 4;
  const raw = Buffer.alloc(size * (1 + rowBytes));
  const cx = size / 2;
  const cy = size / 2;
  const star = buildStar(cx, cy, size * 0.33, size * 0.14, 4);

  for (let y = 0; y < size; y++) {
    raw[y * (1 + rowBytes)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const offset = y * (1 + rowBytes) + 1 + x * 4;
      const color = pointInStar(x + 0.5, y + 0.5, star) ? fg : bg;
      raw[offset] = color[0];
      raw[offset + 1] = color[1];
      raw[offset + 2] = color[2];
      raw[offset + 3] = 0xff;
    }
  }

  return encodePng(size, size, raw);
}

/** Build a 4-point star (sparkle) as alternating outer/inner vertex points. */
function buildStar(cx, cy, rOuter, rInner, points) {
  const verts = [];
  const total = points * 2;
  for (let i = 0; i < total; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const theta = (i / total) * Math.PI * 2 - Math.PI / 2;
    verts.push([cx + r * Math.cos(theta), cy + r * Math.sin(theta)]);
  }
  return verts;
}

function pointInStar(px, py, verts) {
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const [xi, yi] = verts[i];
    const [xj, yj] = verts[j];
    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function encodePng(width, height, rawWithFilter) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = deflateSync(rawWithFilter);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)) >>> 0;
  }
  return (c ^ 0xffffffff) >>> 0;
}
