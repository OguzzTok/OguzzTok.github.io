/**
 * Örnek içerik için yer tutucu dosyalar üretir: görseller (.jpg), basit bir küp (.glb), örnek PDF'ler.
 * Sadece eksik dosyaları yazar; var olan dosyaya dokunmaz.
 * Çalıştırma: node scripts/make-samples.mjs
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Gradyan + geometrik motifli yer tutucu görsel (yazı yok: sistem fontuna bağımlı olmasın). */
const images = [
  // [yol, genişlik, yükseklik, renk1, renk2, motif]
  ['src/content/projects/lantern-keeper/cover.jpg', 1920, 1080, '#1b2a4a', '#e8a33d', 'circle'],
  ['src/content/projects/lantern-keeper/01.jpg', 1920, 1080, '#14213d', '#fca311', 'rings'],
  ['src/content/projects/lantern-keeper/02.jpg', 1920, 1080, '#22223b', '#c9ada7', 'bars'],
  ['src/content/projects/lantern-keeper/03.jpg', 1920, 1080, '#0b3954', '#bfd7ea', 'circle'],
  ['src/content/projects/tiny-dungeon/cover.jpg', 1920, 1080, '#2b2d42', '#ef233c', 'grid'],
  ['src/content/projects/tiny-dungeon/01.jpg', 1920, 1080, '#3d0c11', '#d5a021', 'grid'],
  ['src/content/projects/lowpoly-crate/cover.jpg', 1600, 1600, '#3c2f2f', '#be9b7b', 'diamond'],
  ['src/content/projects/lowpoly-crate/01.jpg', 1600, 1600, '#4b3832', '#854442', 'diamond'],
  ['src/content/projects/lowpoly-crate/02.jpg', 1600, 1600, '#2e2e2e', '#fff4e6', 'bars'],
  ['src/content/projects/poster-series/cover.jpg', 1200, 1600, '#0d1b2a', '#e0e1dd', 'rings'],
  ['src/content/projects/poster-series/01.jpg', 1200, 1600, '#590d22', '#ffccd5', 'circle'],
  ['src/content/projects/poster-series/02.jpg', 1200, 1600, '#003049', '#fcbf49', 'bars'],
  ['src/content/projects/_template-detail/cover.jpg', 1280, 720, '#333333', '#777777', 'grid'],
  ['src/content/projects/_template-lightbox/cover.jpg', 1280, 720, '#333333', '#777777', 'grid'],
  ['src/data/about/photo.jpg', 900, 1200, '#2a2522', '#8d7b68', 'portrait'],
];

function motif(kind, w, h, fg) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.28;
  switch (kind) {
    case 'circle':
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fg}" opacity=".85"/>`;
    case 'rings':
      return [1, 0.72, 0.44]
        .map((k) => `<circle cx="${cx}" cy="${cy}" r="${r * k}" fill="none" stroke="${fg}" stroke-width="${r * 0.08}"/>`)
        .join('');
    case 'bars':
      return Array.from({ length: 5 }, (_, i) => {
        const bw = w * 0.08;
        const bh = h * (0.2 + i * 0.12);
        return `<rect x="${w * 0.2 + i * bw * 1.5}" y="${h * 0.8 - bh}" width="${bw}" height="${bh}" fill="${fg}" opacity=".85"/>`;
      }).join('');
    case 'grid':
      return Array.from({ length: 16 }, (_, i) => {
        const s = Math.min(w, h) * 0.12;
        const x = cx - s * 2.2 + (i % 4) * s * 1.1;
        const y = cy - s * 2.2 + Math.floor(i / 4) * s * 1.1;
        return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${fg}" opacity="${(i * 7) % 3 === 0 ? 0.9 : 0.35}"/>`;
      }).join('');
    case 'diamond':
      return `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${fg}" opacity=".85"/>`;
    case 'portrait':
      return `<circle cx="${cx}" cy="${h * 0.38}" r="${w * 0.17}" fill="${fg}"/><ellipse cx="${cx}" cy="${h * 0.95}" rx="${w * 0.36}" ry="${h * 0.3}" fill="${fg}"/>`;
    default:
      return '';
  }
}

async function makeImage([path, w, h, c1, c2, kind]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}" stop-opacity=".55"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="${c1}"/><rect width="100%" height="100%" fill="url(#g)"/>
    ${motif(kind, w, h, c2)}
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(path);
}

/** 1x1x1 küp: pozisyon + normal + index, tek renkli PBR materyal. */
function makeCubeGlb() {
  const positions = [];
  const normals = [];
  const indices = [];
  for (let a = 0; a < 3; a++) {
    for (const s of [1, -1]) {
      const b = (a + 1) % 3;
      const c = (a + 2) % 3;
      const base = positions.length / 3;
      for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const p = [0, 0, 0];
        p[a] = s * 0.5;
        p[b] = u * 0.5;
        p[c] = v * 0.5;
        const n = [0, 0, 0];
        n[a] = s;
        positions.push(...p);
        normals.push(...n);
      }
      const quad = s > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2];
      indices.push(...quad.map((i) => base + i));
    }
  }
  const pos = Buffer.from(new Float32Array(positions).buffer);
  const nor = Buffer.from(new Float32Array(normals).buffer);
  const idx = Buffer.from(new Uint16Array(indices).buffer);
  const bin = pad(Buffer.concat([pos, nor, idx]), 0x00);

  const gltf = {
    asset: { version: '2.0', generator: 'make-samples.mjs' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'Crate' }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }] }],
    materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.62, 0.42, 0.25, 1], metallicFactor: 0, roughnessFactor: 0.8 } }],
    buffers: [{ byteLength: bin.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: pos.length, target: 34962 },
      { buffer: 0, byteOffset: pos.length, byteLength: nor.length, target: 34962 },
      { buffer: 0, byteOffset: pos.length + nor.length, byteLength: idx.length, target: 34963 },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 24, type: 'VEC3', min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5] },
      { bufferView: 1, componentType: 5126, count: 24, type: 'VEC3' },
      { bufferView: 2, componentType: 5123, count: 36, type: 'SCALAR' },
    ],
  };
  const json = pad(Buffer.from(JSON.stringify(gltf)), 0x20);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // "glTF"
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + json.length + 8 + bin.length, 8);
  return Buffer.concat([header, chunk(json, 0x4e4f534a), chunk(bin, 0x004e4942)]);
}

function pad(buf, byte) {
  const rest = buf.length % 4;
  return rest ? Buffer.concat([buf, Buffer.alloc(4 - rest, byte)]) : buf;
}

function chunk(data, type) {
  const head = Buffer.alloc(8);
  head.writeUInt32LE(data.length, 0);
  head.writeUInt32LE(type, 4);
  return Buffer.concat([head, data]);
}

/** Tek sayfalık, geçerli bir PDF. */
function makePdf(title) {
  const content = `BT /F1 28 Tf 72 760 Td (${title}) Tj ET\nBT /F1 12 Tf 72 730 Td (Sample file - replace with your own.) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let out = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

const others = [
  ['src/content/projects/lowpoly-crate/model.glb', makeCubeGlb],
  ['src/content/projects/lantern-keeper/gdd-sample.pdf', () => makePdf('Lantern Keeper - GDD (sample)')],
  ['src/data/downloads/cv-en.pdf', () => makePdf('CV (sample)')],
  ['src/data/downloads/cv-tr.pdf', () => makePdf('Ozgecmis (ornek)')],
  ['src/data/downloads/portfolio-en.pdf', () => makePdf('Portfolio (sample)')],
];

let written = 0;
for (const spec of images) {
  const path = join(root, spec[0]);
  if (existsSync(path)) continue;
  mkdirSync(dirname(path), { recursive: true });
  await makeImage([path, ...spec.slice(1)]);
  written++;
}
for (const [rel, make] of others) {
  const path = join(root, rel);
  if (existsSync(path)) continue;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, make());
  written++;
}
console.log(`make-samples: ${written} dosya üretildi.`);
