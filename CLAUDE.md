# Portfolyo — Claude için çalışma rehberi

Oğuz Tok'un kişisel oyun tasarımı portfolyosu. Astro 7 (statik) + Tailwind 4, GitHub Pages'te yayınlanır:
https://oguzztok.github.io/ (repo: `OguzzTok/OguzzTok.github.io`).
Sunucu, veritabanı, CMS **yok**: tüm içerik bu repodaki dosyalardır. Kullanıcı yeni içeriği
"şu resimlerle Modeller'e yeni proje ekle" gibi cümlelerle ister; bu dosyadaki tarifleri izle.

## Kullanıcıyla çalışma

- Kullanıcı dijital oyun tasarımı öğrencisi, bu teknolojilerde yeni. Türkçe yaz, teknik terimleri İngilizce bırak.
  Önemli kararları ve çalıştırdığın komutları **bir cümleyle** açıkla.
- **Bilgi uydurma.** Tarih, araçlar, takım büyüklüğü, linkler, metin, çeviri eksikse sor (aşağıdaki soru listesi).
  Çeviriyi kullanıcı isterse yap; istemezse o dili boş bırak (fallback çalışır, build raporunda görünür).
  Kendi çevirini veya yazdığın metni kullanıcıya göster, onaylamasını iste.
- Sitedeki her bilgi herkese açık (public repo). Telefon, adres, TCKN gibi kişisel bilgileri ekleme; gelirse uyar.
- Kod değişikliği gerektiren isteklerde (yeni bölüm, yeni blok tipi, tasarım değişikliği) önce kısa plan sun, onay al.
  Daha iyi bir yol varsa uygulamadan önce söyle.

## Durum

Altı fazın hepsi tamam (kurulum, projeler, detay sayfası, ana sayfa bölümleri, SEO/test/CI, rehber).
Lightbox tarifi Faz 6'da baştan sona denendi (büyük görsel küçültme → şablon → build → test).
GitHub kurulumu tamam (2026-10-27): repo `OguzzTok/OguzzTok.github.io` (public), Pages kaynağı GitHub Actions, ilk deploy
başarılı. Commit e-postası GitHub gizli adresi (`244495561+OguzzTok@users.noreply.github.com`, repo-yerel `user.email`).
CI sadece `main` push'unda çalışır; PR'lar CI'da test edilmez, PR açmadan önce testleri yerelde çalıştır.

Gerçek bilgiler girildi: ad, e-posta, okul, şehir, başlangıç yılı, TR biyografi, araç kutusu,
sosyal linkler (GitHub, LinkedIn, Behance), 3 sertifika, ilk gerçek proje `mental-impass` (öne çıkan).
**Hâlâ bekleyenler** (uydurma, fırsat oldukça sor):
- Gerçek fotoğraf → `src/data/about/photo.jpg` + `about.yaml` alt metni ("Oğuz Tok'un portresi" gibi).
- Diğer sosyal linkler (itch.io, ArtStation, Sketchfab…) → `src/data/site.yaml`.
- `mental-impass`: tam yayın günü (şimdilik 2025-12-01, künyede "1 Aralık 2025" görünür), oyunun linki (itch.io?).
- CV / portfolyo PDF'leri (şu an örnek) → bkz. tarif.
- İngilizce biyografi ve hero tanıtım cümlesini Claude yazdı; kullanıcı değiştirmek isterse açık ol.
- E-posta okul adresi (`posta.mu.edu.tr`): mezuniyette kapanabilir.

**Örnek içerik:** örnek projeler ve sertifika silindi; sadece örnek CV/portfolyo PDF'leri kaldı (gerçekleri gelince
değiştir). `npm run samples` çalıştırma: silinen örnek projelerin görsellerini yeniden üretir. `_template-*` klasörleri **silinmez** (draft şablonlar).

---

## İçerik ekleme akışı (her istekte)

1. **Dosyaları al.** Kullanıcı görselleri sohbete ekler ya da bilgisayardaki yolu verir (ör. `C:\Users\ogzog\Desktop\x.png`).
   Dosyayı ilgili klasöre kopyala ve tarifteki adla yeniden adlandır.
2. **Boyutu kontrol et.** Görsel > 5 MB veya uzun kenar > 2560 px → küçült (komut aşağıda). `.glb` > 20 MB → sıkıştırmayı öner.
3. **Eksik bilgiyi sor** (tek mesajda, liste hâlinde). Proje için sorulacaklar:
   - Başlık ve tek cümlelik açıklama (TR ve/veya EN)
   - Kategori, durum (released / in-progress / prototype / jam), tarih (en azından ay/yıl)
   - Kullanılan araçlar, etiketler
   - Görsellerde ne olduğu (alt metin için; kısa)
   - Linkler (itch.io, Steam, GitHub, fragman, Sketchfab, ArtStation)
   - Oyunlarda: tür, motor, platformlar, takım (solo mu, kaç kişi), süre, yayıncı ve
     "Nedir / Ben ne yaptım / Ne öğrendim" metinleri (takım projesinde kullanıcının **kendi** katkısı)
   - Öne çıkan proje olsun mu?
4. **Tarifi uygula** (aşağıda).
5. **Son adımlar:**
   1. `npm run build` — şema hatası varsa düzelt. Build sonundaki `[içerik] … uyarı` listesindeki **yeni** eksikleri kullanıcıya söyle.
   2. `npm test` ve `npm run check:sizes` — başarısızsa push etme; düzelt ya da kullanıcıya açıkla.
   3. Ne değiştiğini kısaca göster; kullanıcı isterse `npm run dev` ile bakabileceğini söyle.
   4. Commit + push, `main`'e doğrudan (CI testleri geçmezse yayın yapılmaz). Conventional commits, Türkçe açıklama:
      `feat(icerik): Modeller'e "Taş Kule" eklendi` · `fix(icerik): CV güncellendi` · `chore(icerik): örnek projeler silindi`.
      Kod değişiklikleri (bileşen, script, şema) `feature/…` veya `fix/…` branch'inde yapılıp PR ile birleştirilir.
   5. Push'tan sonra yayını kontrol et: https://github.com/OguzzTok/OguzzTok.github.io/actions
      (`gh` kuruluysa: `gh run watch`). Yeşil tik → 1-2 dakika içinde sitede. Kırmızı → "Build ve test" işinin
      loguna bak; test hatasıysa "playwright-report" artifact'ını indir.

## İçerik ekleme tarifleri

### Görsel kuralları

- `.jpg` (fotoğraf/render) veya `.png` (şeffaflık, piksel art). Uzun kenar **en fazla 2560 px**, dosya **en fazla 5 MB**.
  Büyükse küçült (sharp Astro ile kurulu; çıktıyı hedef klasöre yaz):
  `node -e "require('sharp')('girdi.png').resize(2560,2560,{fit:'inside',withoutEnlargement:true}).jpeg({quality:85}).toFile('cover.jpg')"`
  Build görselleri WebP'ye çevirir ve birkaç boyut üretir; orijinal repo'da kalır (ve `dist/`'e de kopyalanır).
  sharp "unable to open" / "No such file" derse yol 260 karakteri aşıyordur (Windows): kaynağı önce kısa bir
  klasöre kopyala (ör. `C:\Users\ogzog\AppData\Local\Temp\x\`). Komut proje kökünden çalıştırılmalı (`require('sharp')`).
- İsimler: kapak `cover.jpg`, galeri `01.jpg`, `02.jpg`… Türkçe karakter ve boşluk yok.
- **Alt metin zorunlu** (en az bir dil): görselde ne olduğunu kısaca anlat ("Fırtınada deniz feneri, gece").
- Oyun kapakları **16:9**; model/tasarım kapakları kareye kırpılarak gösterilir (önemli kısım ortada olsun).

### Yeni proje — lightbox modu (Modeller, Tasarımlar)

1. `src/content/projects/_template-lightbox/` → `src/content/projects/<slug>/` kopyala.
   Slug: küçük harf, rakam, tire (`stone-tower`). URL'de görünür (`?item=stone-tower`), sonradan değiştirme.
2. Görseller: `cover.jpg` (kart kapağı ve lightbox'ta ilk görsel), `01.jpg`, `02.jpg`…
3. 3D model varsa `model.glb` olarak koy, `index.md`'de `model:` bloğunu aç (`tris`, `texture`, `renderer` opsiyonel).
   `.gltf` sadece tek dosyalıysa (gömülü veri) çalışır; `.glb` tercih et. > 20 MB ise:
   `npx @gltf-transform/cli optimize girdi.glb model.glb --compress draco --texture-compress webp`
4. `index.md`: `draft: false`. Zorunlu: `title`, `summary`, `category` (`models`/`designs`), `status`, `date`,
   `cover.src` + `cover.alt`. Galeri: her görsel `{ src, alt }`. `tools` → `src/data/tools.yaml` id'leri (yoksa önce
   oraya ekle). `tags` serbest metin (büyük/küçük harf fark etmez). Sketchfab/ArtStation/website → `links`.
5. `en.md` / `tr.md` **gerekmez**.

### Yeni proje — detail modu (Oyunlar)

1. `src/content/projects/_template-detail/` → `src/content/projects/<slug>/` kopyala.
2. Görseller: `cover.jpg` (**16:9**; detay sayfasının büyük görseli ve kart kapağı), galeri `01.jpg`…
3. `index.md`: `draft: false`, zorunlu alanlar yukarıdaki gibi, `category: games`.
   - `links`: `steam`, `itch`, `github`, `trailer` (YouTube linki veya id), `website`. Boşlar görünmez.
     İlk dolu olan birincil buton olur; sıra: itch → steam → fragman → github → website.
     `trailer` doluysa büyük görsel tıklayınca oynayan videoya dönüşür, "Fragmanı izle" butonu çıkar.
   - `spec`: `genre`, `engine`, `platforms`, `team` (1 = solo), `duration`, `publisher`. Boşlar gizlenir.
     Künyede durum, yayın tarihi (`date`) ve araçlar (`tools`) otomatik gösterilir.
   - `gallery`: metnin altında "Galeri" başlığıyla.
   - `blocks` (opsiyonel, yazıldığı sırayla galerinin altında):
     - `gallery` → `images: [{ src, alt }]`, opsiyonel `caption: {en, tr}`
     - `youtube` → `id` (video linki de olur), opsiyonel `title`
     - `model` → `src: ./model.glb`, opsiyonel `caption`
     - `code` → `file: ./snippets/X.cs`, `lang` (Shiki adı: `csharp`, `cpp`, `gdscript`, `python`, `hlsl`, `glsl`, `json`…), opsiyonel `caption`
     - `itch` → `url` (itch.io sayfası → "Embed game" → iframe'in `src` adresi), `width`, `height`, opsiyonel `title`
     - `download` → `file: ./dosya.pdf` (.pdf / .zip / .glb), opsiyonel `label`; ad, tür, boyut otomatik
   - Şablondaki örnek `youtube` / `itch` bloklarını gerçek değerlerle değiştir ya da sil.
4. `en.md` ve `tr.md`: üç `##` başlık, bu sırayla: **What it is / What I did / What I learned** ve
   **Nedir / Ben ne yaptım / Ne öğrendim** (otomatik 01-02-03 numaralanır). Markdown destekli.
   En az biri **zorunlu** (yoksa build durur); diğeri yoksa o dile düşülür ve sayfada not çıkar.

### Projeyi düzenleme / silme

- Düzenleme: `src/content/projects/<slug>/index.md` (ve `en.md`/`tr.md`). Slug'ı değiştirme (paylaşılmış linkler kırılır).
- Geçici gizleme: `draft: true`. Silme: klasörü sil. Silinen proje `featured` idiyse başka birini öne çıkar.
- Sıra: `order` (küçük önce; olmayanlar sona), eşitse tarih (yeni → eski).

### Öne çıkan proje

`featured: true` → sekmelerin üstündeki büyük kart ve varsayılan paylaşım görseli. Tek projede tut; diğerlerinde `false`.

### Örnek içeriği temizleme

Kullanıcı kendi içeriğini ekledikçe (onayını alarak):
- Örnek proje klasörleri: `lantern-keeper`, `tiny-dungeon`, `lowpoly-crate`, `poster-series` (`_template-*` kalır).
- `src/content/certificates/sample-certificate.yaml`.
- `src/data/downloads/*.pdf` örnekleri → gerçekleri gelince değiştir (tarif aşağıda).
- `src/data/tools.yaml`'daki artık kullanılmayan araçlar (ör. `substance-painter`, `figma`, `aseprite`, `git`):
  hiçbir proje ve `about.yaml` kullanmıyorsa silinebilir; kullanan varsa build hata verir.
- Hiç proje kalmazsa site yine çalışır ama projeler bölümü boş görünür; en az bir gerçek proje eklenmeden tümünü silme.
- Testler içerikten bağımsızdır; uygun içerik yoksa ilgili test atlanır (3D modelli proje yoksa 3D testi gibi).

### Yeni kategori (sekme)

`src/data/categories.yaml`'a kayıt: `id` (URL'de: `/en/projects/<id>/`), `name: {en, tr}`, `order`, `visible`,
`mode: detail | lightbox`. Kod değişikliği gerekmez. Projesi olmayan kategorinin sekmesi görünmez.
Gizlemek için `visible: false` (projeleri de listeden çıkar).

### Yeni araç

`src/data/tools.yaml`: `id` (küçük harf-tire) + `label` (görünen ad). Projeler ve Hakkımda bu id'yi kullanır.

### Sertifika

1. `src/content/certificates/<slug>.yaml` oluştur (`_`-siz, `sample-certificate.yaml`'ı örnek al).
2. Zorunlu: `title: {en, tr}`, `issuer`, `date`. Opsiyonel: `instructor`, `hours`, `credentialId`, `verifyUrl`,
   `logo` (`./logos/kurum.png`, kare, en az 128 px; yoksa kurumun baş harfleri), `order`.

### İstatistik

`src/data/stats.yaml` (3-4 kayıt; ekrandaki sıra = dosyadaki sıra). `kind`:
- `manual` → `value: 12` elle yazılır.
- `count` → proje sayısı; `status: released` ve/veya `category: models` ile süzülür.
  Etiket "yayınlanan oyun" diyorsa `category: games` de ekle; yoksa yayınlanan modeller de sayılır.
- `yearsSince` → `year`dan bu yana geçen yıl (**build** tarihine göre; yeni yıl gelince bir push gerekir).
Her birinde `label: {en, tr}`, opsiyonel `suffix` (ör. `+`).

### Sosyal link / e-posta

`src/data/site.yaml` → `socials` (tam URL; boşsa görünmez): itch, steam, github, youtube, linkedin, behance,
artstation, sketchfab, discord. Ekrandaki sıra `src/lib/profile.ts` → `SOCIAL_LABELS`. E-posta: `email`.

### CV / portfolyo PDF'i

1. PDF'i `src/data/downloads/` altına koy (`cv-en.pdf`, `cv-tr.pdf`, `portfolio-tr.pdf`…). Eskisinin üzerine yazılabilir.
2. `src/data/downloads.yaml`: ilgili kaydın `files.<dil>` satırı → `file`, `pages` (sayfa sayısı; kullanıcıya sor
   veya PDF'ten oku), `updated` (bugünün tarihi). Sadece bir dil varsa diğer dilin satırını sil. Sıra = dosyadaki sıra.

### Hakkımda, hero, iletişim metinleri

- `src/data/about.yaml`: `bio: {en, tr}` (paragraflar arası boş satır), `school`, `city`, `since`,
  `toolbox` (gruplar + `tools.yaml` id'leri; temel seviye için `level: basic`).
  Fotoğraf: `src/data/about/photo.jpg` (dikey, en az 900×1200) + `photo.alt`.
- `src/data/site.yaml`: `name`, `eyebrow` (hero üst başlığı), `intro` (hero tanıtımı), `description`
  (arama motoru açıklaması), `contactText` (iletişim davet metni).
- Arayüz metinleri (buton, başlık, etiket): `src/i18n/en.json` ve `tr.json` — iki dosyada aynı anahtar olmalı.

### Görünüm (sık istekler)

- Vurgu rengi: `src/styles/global.css` → `--accent` (tek satır; diğer tonlar ondan türetilir). Değiştirince
  kontrastı kontrol et (Lighthouse veya beyaz yazı / koyu zemin oranı ≥ 4.5).
- Bölüm sırası / yeni ana sayfa bölümü: `src/lib/sections.ts` + `src/pages/[lang]/index.astro` (kod değişikliği → branch + PR).

---

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu: http://localhost:4321 (kayıtta otomatik yenilenir) |
| `npm run check` | TypeScript + Astro tip kontrolü |
| `npm run build` | `dist/`'e derler; içerik şemaya uymuyorsa durur, eksik çeviri/bölüm uyarılarını listeler |
| `npm run preview` | `dist/`'i yerelde yayınlar (GitHub Pages'teki hâlin aynısı) |
| `npm test` | Playwright testleri (`dist/`'i 4322 portunda açar). **Önce `npm run build`** |
| `npm run check:sizes` | Boyut kontrolü: dosya >20 MB uyarı, >90 MB hata; görsel >5 MB uyarı; site >1 GB hata |
| `npm run samples` | Örnek yer tutucu görsel/glb/pdf üretir (sadece eksikleri; normalde gerekmez) |

Ortam: Windows, Node 24 (`C:\Program Files\nodejs`). Bash'te `node` bulunamazsa
`export PATH="/c/Program Files/nodejs:$PATH"`. GitHub CLI (`gh`) kurulu değil.

Test notları:
- Açık bir `npm run preview` varsa testten önce kapat (`npx astro preview stop`); Astro 7 iki preview'a izin vermez.
  `npm run dev` (4321) testlerle çakışmaz.
- Testler içerikten bağımsız: sayıları sayfadan okur, uygun içerik yoksa ilgili test **atlanır**, kırılmaz.
- Lightbox testlerinde ok/ESC'den önce `waitForLightbox()`: PhotoSwipe açılış animasyonunda tuşları yok sayar
  (script bitince `.pswp[data-ready]` ekler). Panoya kopyalama testinde `context.grantPermissions` gerekir.
- Base yolu testi (Git Bash yol dönüşümünü kapatarak):
  `MSYS_NO_PATHCONV=1 BASE_PATH=/portfolio npm run build && MSYS_NO_PATHCONV=1 BASE_PATH=/portfolio npm test`
  Sonra normal build'i tekrar al.
- Lighthouse (isteğe bağlı): kendi Chrome başlatıcısı bu makinede `spawn UNKNOWN` veriyor. Playwright'ın Chromium'unu
  `--remote-debugging-port=9222` ile açık tut, `npx lighthouse@13.5.0 <url> --port=9222` ile bağlan.
  Son ölçüm (Faz 5, mobil): tüm sayfalar performans 98, erişilebilirlik / en iyi uygulamalar / SEO 100.
- `npm run preview` sayfaları tarayıcı önbelleğinden verebilir: değişiklik görünmüyorsa `?v=2` ekle veya Ctrl+F5.

CI (`.github/workflows/deploy.yml`; main'e push veya Actions → Deploy → Run workflow):
npm ci → check → build → check:sizes → Playwright (Chromium) → aynı `dist/` Pages'e yüklenir → deploy.
Biri başarısızsa yayın olmaz. Base yolu `actions/configure-pages`'ten gelir (bu repo için boş = kök dizin).
Test başarısızsa rapor "playwright-report" artifact'ında (7 gün). Kurulum adımları: README.md.

---

## Mimari

- `src/content.config.ts` — **tüm zod şemaları**. Alan eklemek/değiştirmek buradan başlar.
- `src/content/projects/<slug>/` — her proje kendi klasöründe: `index.md` (frontmatter: ortak alanlar + kısa
  `{en, tr}` metinler), `en.md`/`tr.md` (detail modu uzun metin), görseller, `.glb`, `snippets/`, indirilebilir dosyalar.
- `src/content/certificates/<slug>.yaml` — sertifikalar.
- `src/data/*.yaml` — site geneli veriler (site, kategoriler, araçlar, istatistikler, hakkımda, indirmeler).
  Tekil dosyalar (`site.yaml`, `about.yaml`) alanları en üst seviyede tutar (Git-based CMS uyumu).
- `src/i18n/{en,tr}.json` — arayüz metinleri (eksik anahtar → `npm run check` hatası).
- `src/lib/` — içerik okuma ve dönüştürme. Sayfalar/bileşenler içeriğe **sadece** buradan erişir:
  `i18n.ts` (t(), localize(), plural(), tarih/sayı biçimi), `urls.ts` (base uyumlu linkler), `projects.ts` (sıralama,
  doğrulama, komşular), `content.ts` (tekil veriler, dosya sırası), `assets.ts` (glb/pdf URL ve boyut, kod dosyası),
  `explorer.ts` (proje gezgini verisi), `lightbox.ts` (lightbox görselleri), `stats.ts`, `profile.ts` (sertifika,
  indirme, sosyal), `seo.ts` (paylaşım görseli, JSON-LD), `sections.ts` (ana sayfa bölüm sırası),
  `translation-report.ts` (build uyarı raporu).
- `src/components/` — küçük, tek sorumluluklu bileşenler; sabit metin yok (metin i18n/json veya data'dan):
  `layout/` (Head, Header, Footer), `ui/` (tema/dil düğmesi, LocalizedText, SectionHeading, CopyButton),
  `projects/` (gezgin, kart, sekmeler, filtre, öne çıkan), `detail/` (detay sayfası parçaları),
  `media/` (medya blokları; `MediaBlocks.astro` dağıtıcı), `sections/` (ana sayfa bölümleri).
- `src/scripts/` — tarayıcıda çalışan vanilla TypeScript: `theme.ts`, `lang.ts`, `projects/` (durum, sekmeler,
  filtreler), `lightbox/` (PhotoSwipe + 3D katmanı; ilk tıklamada yüklenir), `gallery.ts`, `embeds.ts`,
  `model-viewer.ts` (ortak 3D yükleyici), `copy.ts`, `counters.ts`, `dom.ts`.
- `src/pages/` — `index.astro` (kök dil yönlendirmesi), `404.astro`, `robots.txt.ts`, `[lang]/index.astro`,
  `[lang]/projects/index.astro`, `[lang]/projects/[category]/index.astro`, `[lang]/projects/[category]/[slug].astro`.
- `scripts/` — `check-sizes.mjs` (CI boyut kontrolü), `make-samples.mjs` (örnek dosya üretici).
- `tests/` — Playwright (`helpers.ts` + `*.spec.ts`).

### Davranış özeti

- **Dil:** varsayılan İngilizce; `/en/…` ve `/tr/…`. Kök `/` kayıtlı tercihe (localStorage `lang`) göre yönlendirir.
  EN/TR düğmesi aynı sayfanın diğer dildeki adresine gider (`#bölüm` ve `?item=` korunur). Her sayfa iki dilde üretilir;
  boş dil diğerine düşer ve metne doğru `lang` verilir.
- **Tema:** varsayılan koyu; tercih localStorage `theme`. İlk boyamadan önce `<head>`'deki inline script uygular.
- **Projeler:** her proje sayfası tüm kartları içerir, aktif sekmede olmayanlar `hidden`. JS kapalıyken sekmeler link;
  JS ile ARIA tablist, sayfa yenilemeden süzer, `/projects/` sayfalarında adres çubuğunu günceller (ana sayfada değil).
  Filtre: grup başına tek seçim, sekme değişince sıfırlanır.
- **Lightbox:** görünen lightbox kartlarının tüm görselleri tek listede; ok tuşları projeler arasında geçer.
  `?item=<slug>` doğrudan açar. 3D açıkken ok/ESC modele ait, ESC önce 3D'yi kapatır. JS kapalıysa kart büyük görsele link.
- **Detay sayfası:** başlık → aksiyon butonları → hero/fragman → metin (01-02-03) → galeri → bloklar → önceki/sonraki;
  yanda künye. YouTube / itch.io / 3D tıklanana kadar dış istek yapmaz.
- **Ana sayfa:** Hero + sayaçlar, sonra `sections.ts` sırasıyla Projeler, Hakkımda, Sertifikalar, İndirmeler, İletişim.
- **404:** iki dilli, header'sız, `noindex`.
- **SEO:** title/description, canonical, hreflang (en, tr, x-default), Open Graph (proje kapağı; diğer sayfalarda öne çıkan
  projenin kapağı), ana sayfada `Person` JSON-LD, `robots.txt`, iki dilli sitemap.
- **Paket boyutları:** sekme/filtre ~6 KB her sayfada; PhotoSwipe ~65 KB ilk tıklamada; model-viewer ~1 MB
  sadece 3D istenince.

### Kod kuralları

- İç linkler asla elle `"/..."` yazılmaz: `pagePath()`, `sectionPath()`, `withBase()` (base değişebilir).
- Görsel yön "Art Book": Fraunces başlık, Instrument Sans metin, JetBrains Mono etiket; sıcak siyah/krem, kobalt vurgu.
  Oyunlar geniş 16:9 kartlarla öne çıkar; modeller/tasarımlar kare galeri. Vurgu rengi tek değişken: `--accent`.
- Sayfa geçişleri tarayıcının View Transition API'si (`@view-transition`). Astro `ClientRouter` **kullanılmıyor**:
  script'ler sayfa yüklemesinde bir kez çalışır.
- Kolon şablonu olmayan `.grid` varsayılan `minmax(0,1fr)` (global.css). Çok kolonlularda da `minmax(0,Nfr)`;
  düz `1fr` uzun kelime/kod satırında mobilde sayfayı yatay taşırır (testi var).
- Yatay şeritte öğe göstermek için `scrollIntoView()` **kullanma** (sayfayı dikey kaydırır): `dom.ts` → `revealHorizontally()`.
- Bölümler arası boşluk `margin` ile (padding değil): `#bölüm` linki başlığın hemen üstüne kayar.
- Erişilebilirlik: alt metin zorunlu (şemada), düğme adı görünen metni içerir (WCAG 2.5.3), dokunma hedefi ≥ 24 px,
  kontrast ≥ 4.5:1 (kod teması `github-dark-default` / `github-light-default`), `prefers-reduced-motion`'a uy.
- Astro 7: Markdown işlemcisi Sätteri (remark/rehype eklentisi için `@astrojs/markdown-remark` + `markdown.processor`).
  `compressHTML: 'jsx'`: satır içi öğeler arasında boşluk için `{' '}`. Kapanmamış HTML etiketi build hatasıdır.
  `src/fetch.ts` ayrılmış dosya adıdır. Belgeler: https://docs.astro.build
- Yeni kütüphane eklemeden önce kullanıcıya nedenini söyle.
- Bir bileşene/listeye dokunduysan onu kapsayan Playwright testini güncelle veya ekle.

### Bilinen sınırlamalar / teknik borç

- Lightbox projeleri için ayrı sayfa yok: `?item=` linki paylaşılınca önizleme görseli kategori sayfasınınki olur.
- `yearsSince` sayacı build anında hesaplanır; yıl dönünce güncellenmesi için bir push (veya elle workflow) gerekir.
- Orijinal görseller `dist/`'e de kopyalanır (Astro davranışı); site boyutunu `check:sizes` izler.
- Testler sadece Chromium'da; Firefox/Safari otomatik test edilmiyor.
- Sosyal linkler ikonsuz (marka ikonu paketi eklenmedi). YouTube bloğunda oynatmadan önce kapak yok (dış istek olmasın diye).
- E-posta düz metin: spam botları toplayabilir.
