/**
 * Dosya boyutu kontrolü (CI'da build'den sonra çalışır, yerelde: npm run check:sizes).
 *
 *   Repo'daki dosyalar:  > 20 MB uyarı · > 90 MB hata (GitHub tek dosyada 100 MB'a izin verir)
 *   Görseller (src/):    > 5 MB uyarı (eklemeden önce küçültülmeli, bkz. CLAUDE.md)
 *   dist/ toplamı:       > 900 MB uyarı · > 1 GB hata (GitHub Pages site sınırı)
 *
 * GitHub Actions'ta uyarı/hatalar "::warning file=..." biçiminde yazılır ve PR/commit ekranında görünür.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MB = 1024 * 1024;
const LIMITS = { fileWarn: 20 * MB, fileError: 90 * MB, imageWarn: 5 * MB, siteWarn: 900 * MB, siteError: 1024 * MB };
const IMAGE = /\.(jpe?g|png|webp|gif|avif)$/i;
const inCI = Boolean(process.env.GITHUB_ACTIONS);

let errors = 0;
let warnings = 0;
const mb = (bytes) => `${(bytes / MB).toFixed(1)} MB`;

function report(level, file, message) {
  if (level === 'error') errors++;
  else warnings++;
  if (inCI) console.log(`::${level} file=${file}::${message}`);
  else console.log(`${level === 'error' ? 'HATA ' : 'UYARI'}  ${file}  ${message}`);
}

// Git'in takip ettiği dosyalar + henüz eklenmemiş ama yok sayılmayanlar (commit öncesi yakalamak için)
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((file) => existsSync(file));

for (const file of files) {
  const { size } = statSync(file);
  if (size > LIMITS.fileError) report('error', file, `${mb(size)} — 90 MB sınırını aşıyor; GitHub bu dosyayı kabul etmez`);
  else if (size > LIMITS.fileWarn) report('warning', file, `${mb(size)} — 20 MB'tan büyük; sıkıştırmayı düşün`);
  else if (IMAGE.test(file) && file.startsWith('src/') && size > LIMITS.imageWarn)
    report('warning', file, `${mb(size)} — görsel 5 MB'tan büyük; uzun kenarı 2560 px'e küçült`);
}

function dirSize(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    total += entry.isDirectory() ? dirSize(path) : statSync(path).size;
  }
  return total;
}

if (existsSync('dist')) {
  const total = dirSize('dist');
  if (total > LIMITS.siteError) report('error', 'dist', `site ${mb(total)} — GitHub Pages 1 GB sınırını aşıyor`);
  else if (total > LIMITS.siteWarn) report('warning', 'dist', `site ${mb(total)} — 1 GB sınırına yaklaşıyor`);
  console.log(`Site boyutu (dist/): ${mb(total)}`);
} else {
  console.log('dist/ yok: önce npm run build (site toplamı kontrol edilmedi).');
}

console.log(`Boyut kontrolü: ${files.length} dosya, ${warnings} uyarı, ${errors} hata.`);
process.exit(errors > 0 ? 1 : 0);
