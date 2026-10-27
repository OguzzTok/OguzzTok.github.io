# Portfolyo — Claude için çalışma rehberi

Kişisel oyun tasarımı portfolyosu. Astro (statik) + Tailwind, GitHub Pages'te yayınlanır.
Sunucu, veritabanı, CMS **yok**: tüm içerik bu repodaki dosyalardır. Kullanıcı yeni içeriği
"şu resimlerle Modeller'e yeni proje ekle" gibi cümlelerle ister; bu dosyadaki tarifleri izle.

Kullanıcı bu teknolojilerde yeni: önemli kararları ve çalıştırdığın komutları kısaca açıkla.
Türkçe yaz, teknik terimleri İngilizce bırak.

## Durum

| Faz | İçerik | Durum |
|---|---|---|
| 1 | Kurulum, şemalar, örnek içerik, i18n, layout, tema | ✅ |
| 2 | Proje sekmeleri, kartlar, filtre, öne çıkan kart, lightbox + 3D | ✅ |
| 3 | Detay sayfası ve medya blokları | ✅ |
| 4 | Hero + istatistikler, hakkımda, sertifikalar, indirmeler, iletişim, 404 | ✅ |
| 5 | SEO, performans, Playwright, GitHub Actions deploy, boyut kontrolü | ✅ |
| 6 | Bu rehberin tamamlanması, README'de GitHub Pages kurulumu | ⏳ |

Gerçek bilgiler girildi (ad, e-posta, okul, şehir, başlangıç yılı, TR biyografi, araç kutusu).
Hâlâ bekleyenler (uydurma, kullanıcıya sor): gerçek fotoğraf (`src/data/about/photo.jpg` + `about.yaml` alt metni),
sosyal linkler (şu an sadece GitHub), CV/portfolyo PDF'leri. İngilizce biyografi kullanıcının Türkçe metninden
çevrildi; kullanıcı onaylamadıysa değiştirme isteğine açık ol. E-posta okul adresi: mezuniyette değişebilir.
Örnek içerik (başlığında "sample/örnek" geçen her şey) kullanıcı kendi içeriğini ekledikçe silinir.

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu: http://localhost:4321 (kayıtta otomatik yenilenir) |
| `npm run check` | TypeScript + Astro tip kontrolü |
| `npm run build` | Siteyi `dist/`'e derler; içerik şemaya uymuyorsa durur, eksik çevirileri listeler |
| `npm run preview` | `dist/`'i yerelde yayınlar (GitHub Pages'teki hâlin aynısı) |
| `npm test` | Playwright testleri (`dist/`'i 4322 portunda açar). **Önce `npm run build`** |
| `npm run check:sizes` | Dosya boyutu kontrolü: >20 MB uyarı, >90 MB hata, görsel >5 MB uyarı, site >1 GB hata |
| `npm run samples` | Örnek yer tutucu görsel/glb/pdf'leri üretir (sadece eksik olanları) |

Test notları:
- Açık bir `npm run preview` varsa testten önce kapat (`npx astro preview stop`); Astro 7 iki preview'a izin vermez.
  `npm run dev` (4321) testlerle çakışmaz.
- Testler içerikten bağımsız: sayıları sayfadan okur, uygun içerik yoksa ilgili test **atlanır** (skip), kırılmaz.
  Örnek içerik silinince bazı testler (3D, fallback, önceki/sonraki) atlanabilir; bu normal.
- Lightbox testlerinde ok/ESC'den önce `waitForLightbox()` çağır: PhotoSwipe açılış animasyonunda tuşları yok sayar
  (script bitince `.pswp[data-ready]` ekler).
- Base yolu testi (Git Bash'te yol dönüşümünü kapatarak):
  `MSYS_NO_PATHCONV=1 BASE_PATH=/portfolio npm run build && MSYS_NO_PATHCONV=1 BASE_PATH=/portfolio npm test`
  Sonra normal build'i tekrar al.
- Lighthouse (yerelde, isteğe bağlı): Lighthouse'un kendi Chrome başlatıcısı bu makinede `spawn UNKNOWN` veriyor.
  Playwright'ın Chromium'unu `--remote-debugging-port=9222` ile açıp `npx lighthouse@13.5.0 <url> --port=9222` ile bağlan.
  Son ölçüm (Faz 5, mobil): tüm sayfalar performans 98, erişilebilirlik/en iyi uygulamalar/SEO 100.

CI (`.github/workflows/deploy.yml`, main'e push veya elle): npm ci → check → build → check:sizes → Playwright →
aynı `dist/` Pages'e yüklenir → deploy. Herhangi biri başarısızsa yayın olmaz. Base yolu `actions/configure-pages`'ten
gelir (OguzzTok.github.io için boş). Test başarısız olursa rapor "playwright-report" artifact'ında (7 gün).

Windows'ta Node `C:\Program Files\nodejs` altında. Bash'te `node` bulunamazsa:
`export PATH="/c/Program Files/nodejs:$PATH"`.

## Mimari (kısa)

- `src/content.config.ts` — **tüm zod şemaları**. Alan eklemek/değiştirmek buradan başlar.
- `src/content/projects/<slug>/` — her proje kendi klasöründe (bkz. tarifler).
- `src/content/certificates/<slug>.yaml` — sertifikalar.
- `src/data/*.yaml` — site geneli veriler (site, kategoriler, araçlar, istatistikler, hakkımda, indirmeler).
- `src/i18n/{en,tr}.json` — arayüz metinleri. İki dosyada aynı anahtarlar olmalı (eksikse `npm run check` hata verir).
- `src/lib/` — içerik okuma ve dönüştürme. Sayfalar içeriğe **sadece** buradan erişir:
  `i18n.ts` (t(), localize(), fallback), `urls.ts` (base uyumlu linkler), `projects.ts` (sıralama, doğrulama),
  `content.ts` (tekil veriler), `assets.ts` (glb/pdf URL ve boyut), `sections.ts` (ana sayfa bölüm sırası),
  `translation-report.ts` (build'de eksik çeviri raporu).
  `explorer.ts` (proje gezgininin tüm verisi: sekmeler, filtreler, lightbox JSON), `lightbox.ts` (lightbox görselleri).
- `src/components/` — küçük, tek sorumluluklu bileşenler. Bileşenlere sabit metin yazılmaz; metin
  `src/i18n/*.json` veya `src/data/` dosyalarından gelir.
  `projects/ProjectsExplorer.astro` hem ana sayfada (urlMode `none`) hem `/projects/` sayfalarında (urlMode `push`) kullanılır.
- `src/scripts/` — tarayıcıda çalışan vanilla TypeScript:
  `theme.ts`, `lang.ts`, `projects/` (durum + sekmeler + filtreler), `lightbox/` (PhotoSwipe + 3D, ilk tıklamada yüklenir).

Projeler bölümü nasıl çalışır:
- Her proje sayfası (`/en/projects/`, `/en/projects/<kategori>/`) **tüm** kartları içerir; aktif sekmede olmayanlar
  `hidden` gelir. JS kapalıyken sekmeler normal linktir. JS açılınca sekmeler ARIA tablist olur, sayfa yenilenmeden
  süzer ve adres çubuğunu günceller (`history.pushState`). Boş kategorinin sekmesi ve sayfası üretilmez.
- Filtre: her gruptan (etiket, araç) en fazla bir seçim; sekme değişince sıfırlanır. JS kapalıysa gizli.
- Lightbox: görünen lightbox kartlarının tüm görselleri tek listede; ok tuşları projeler arası geçer.
  `?item=<slug>` linki doğrudan açar. 3D açıkken ok/ESC tuşları modele aittir, ESC önce 3D'yi kapatır.
  JS kapalıysa kart büyük WebP görsele linktir.
- Paket boyutları: sekme/filtre ~6 KB her sayfada; PhotoSwipe ~65 KB ilk tıklamada; model-viewer ~1 MB
  sadece "3D Görüntüle"ye basınca.

Detay sayfası (`src/pages/[lang]/projects/[category]/[slug].astro`, sadece detail modundaki kategoriler):
- Sıra: geri linki → rozet/etiketler/başlık/özet/aksiyon butonları → hero (kapak; `links.trailer` varsa tıklayınca
  oynayan fragman) → metin (`en.md`/`tr.md`) → `gallery` alanı ("Galeri") → `blocks` (yazıldığı sırayla) → önceki/sonraki.
  Yanda künye (`components/detail/SpecSheet.astro`), mobilde metnin üstünde.
- Metindeki her `## ` başlığı otomatik numaralanır (01, 02, 03). Build, 3'ten farklı bölüm sayısında uyarı verir.
- YouTube / itch.io / 3D: tıklanana kadar dış siteye istek gitmez (`scripts/embeds.ts`). YouTube `youtube-nocookie` ile açılır.
- Bileşenler: `components/detail/` (sayfa parçaları), `components/media/` (bloklar; `MediaBlocks.astro` dağıtıcı).
  Script'ler: `embeds.ts`, `gallery.ts` (galeri lightbox'ı), `copy.ts` (kopyala butonları, e-posta için de),
  `model-viewer.ts` (lightbox ve model bloğunun ortak 3D yükleyicisi).

Ana sayfa (`src/pages/[lang]/index.astro`): `sections/Hero.astro` (+ `Stats.astro`, sayaçlar `scripts/counters.ts`),
sonra `src/lib/sections.ts` sırasıyla numaralı bölümler: Projeler, `About`, `Certificates`, `Downloads`, `Contact`
(hepsi `src/components/sections/`). Veri okuyucular: `lib/stats.ts`, `lib/profile.ts` (sertifika, indirme, sosyal).
- Sosyal linkler ikonsuz, tipografik liste (marka ikonu paketi eklenmedi). Sıra `lib/profile.ts` → `SOCIAL_LABELS`.
- `stats.yaml` ve `downloads.yaml`'da ekrandaki sıra = dosyadaki sıra (`getCollectionInFileOrder`; Astro normalde id'ye göre sıralar).
- 404 (`src/pages/404.astro` → `dist/404.html`): dil bilinemediği için mesaj iki dilde, header/footer yok (`chrome={false}`).

Düzen kuralları:
- Kolon şablonu verilmemiş `.grid` varsayılan olarak `minmax(0,1fr)` (global.css base katmanı). Çok kolonlu şablonlarda
  da `minmax(0,Nfr)` kullan; düz `1fr` uzun kelime/kod satırında mobilde sayfayı yatay taşırır.
- Sayfa içi bölümler arası boşluk `margin` ile verilir (padding değil); `#bölüm` linki başlığın hemen üstüne kayar.
- Yatay şeritte öğe göstermek için `element.scrollIntoView()` **kullanma**: sayfayı da dikey kaydırır (açılışta sayfanın
  sekmelere atlaması ve Lighthouse'ta LCP ölçülememesi bu yüzdendi). `scripts/dom.ts` → `revealHorizontally()`.
- Kod blokları `github-dark-default` / `github-light-default` temasıyla (yorum satırı kontrastı ≥ 4.5:1). Başka tema
  seçilirse kontrastı ölç.
- İkon/düğmelerin erişilebilir adı görünen metni içermeli (WCAG 2.5.3); dokunma hedefi en az 24×24 px.

SEO: her sayfada title/description, canonical, hreflang (en, tr, x-default), Open Graph (proje sayfasında kapak, diğerlerinde
öne çıkan projenin kapağı: `lib/seo.ts`), ana sayfada schema.org `Person` JSON-LD, `robots.txt` (`src/pages/robots.txt.ts`),
iki dilli sitemap. 404 ve kök yönlendirme sayfası `noindex`, sitemap'te yok.

Yerelde test notu: `npm run preview` sayfaları tarayıcı önbelleğinden verebilir. Değişiklik görünmüyorsa adrese
`?v=2` ekle veya sert yenile (Ctrl+F5).

Kurallar:
- İç linkler asla elle `"/..."` yazılmaz: `pagePath()`, `sectionPath()`, `withBase()` kullanılır (base değişebilir).
- Dil: varsayılan **İngilizce**. Rotalar `/en/...` ve `/tr/...`. Kök `/` kayıtlı tercihe göre yönlendirir.
  Header'daki EN/TR düğmesi aynı sayfanın diğer dildeki adresine gider. Her sayfa iki dilde de üretilir.
- İçerikte iki dilli metin `{ en: ..., tr: ... }` şeklindedir. Bir dil boşsa diğerine düşülür (fallback)
  ve `lang` özniteliği doğru verilir. En az bir dil zorunludur.
- Tema: varsayılan koyu. Vurgu rengi tek değişken: `src/styles/global.css` → `--accent`.
- Görsel yön: "Art Book" (Fraunces başlık, Instrument Sans metin, JetBrains Mono etiket; sıcak siyah/krem, kobalt vurgu).
  Oyunlar görsel olarak öne çıkar (geniş 16:9 kartlar); modeller/tasarımlar galeri düzeninde.
- Sayfa geçişleri tarayıcının View Transition API'si ile (CSS `@view-transition`). Astro `ClientRouter` kullanılmıyor:
  script'ler normal sayfa yüklemesinde bir kez çalışır, `astro:page-load` gerekmez.
- Astro 7 notları: Markdown varsayılan işlemcisi Sätteri (remark/rehype eklentisi gerekirse
  `@astrojs/markdown-remark` + `markdown.processor` gerekir). `compressHTML: 'jsx'` varsayılan: satır içi
  öğeler arasında boşluk gerekiyorsa `{' '}` yaz. Kapanmamış HTML etiketi build hatasıdır.
- Belgeler: https://docs.astro.build (content collections, i18n, images rehberleri).

## İçerik ekleme tarifleri

Her tariften sonra: **Son adımlar** bölümünü uygula.

### Genel kurallar

- **Eksik bilgi uydurma.** Tarih, araçlar, takım büyüklüğü, çeviri, link eksikse kullanıcıya sor.
  Çeviriyi kullanıcı isterse sen yapabilirsin; istemezse o dili boş bırak (fallback çalışır, build raporunda görünür).
- **Slug / id**: küçük harf, rakam ve tire (`lost-lantern`). Türkçe karakter yok. URL'de görünür, sonradan değiştirme.
- **Görseller**: `.jpg` (fotoğraf/render) veya `.png` (şeffaflık/piksel art). Uzun kenar **en fazla 2560 px**.
  Dosya **5 MB'tan büyükse** veya uzun kenarı 2560 px'i aşıyorsa eklemeden önce küçült (sharp Astro ile kurulu):
  `node -e "require('sharp')('girdi.jpg').resize(2560,2560,{fit:'inside'}).jpeg({quality:85}).toFile('cover.jpg')"`
  Build WebP'ye çevirir ve farklı boyutlar üretir; orijinal repo'da kalır.
- **İsimlendirme**: kapak `cover.jpg`, galeri `01.jpg`, `02.jpg`… (sıra = dosyadaki listeleme sırası).
- **Alt metin zorunlu** (en az bir dil): görselde ne olduğunu kısaca anlat.
- **.glb modeller**: 20 MB'tan büyükse eklemeden önce sıkıştırmayı öner:
  `npx @gltf-transform/cli optimize girdi.glb model.glb --compress draco --texture-compress webp`
  (Draco ile sıkıştırılmış modeli model-viewer destekler). `.gltf` sadece tek dosyalıysa (gömülü veri) çalışır; `.glb` tercih et.
- **Repo'ya konmaz**: video (YouTube'a), oynanabilir oyun build'i (itch.io'ya). Tek dosya 90 MB'ı geçemez.

### Yeni proje — lightbox modu (Modeller, Tasarımlar)

1. `src/content/projects/_template-lightbox/` klasörünü `src/content/projects/<slug>/` olarak kopyala.
2. Görselleri klasöre koy: `cover.jpg` (lightbox'ta ilk görsel ve kart kapağı), `01.jpg`, `02.jpg`…
3. 3D model varsa `model.glb` olarak koy ve `index.md`'de `model:` bloğunu aç (tris, texture, renderer opsiyonel).
4. `index.md`'yi doldur: `draft: false` yap. Zorunlu: `title`, `summary`, `category` (`models`/`designs`),
   `status`, `date`, `cover.src` + `cover.alt`. Galeri her görsel için `{ src, alt }`.
   `tools` → `src/data/tools.yaml`'daki id'ler (yoksa önce oraya ekle). `tags` serbest metin.
   Sketchfab/ArtStation linki varsa `links` altına.
5. `en.md` / `tr.md` **gerekmez** (lightbox modunda uzun metin yok).

### Yeni proje — detail modu (Oyunlar)

1. `src/content/projects/_template-detail/` klasörünü `src/content/projects/<slug>/` olarak kopyala.
2. Görseller: `cover.jpg` (**16:9**, detay sayfasının büyük görseli ve kart kapağı), galeri `01.jpg`…
3. `index.md`: `draft: false`, zorunlu alanlar yukarıdaki gibi, `category: games`.
   - `links`: `steam`, `itch`, `github`, `trailer` (YouTube linki veya id), `website`. Boşlar görünmez.
     Sıra ve ilk dolu olanın birincil buton olması: itch → steam → fragman → github → website.
     `trailer` doluysa hero görseli tıklayınca oynayan videoya dönüşür ve "Fragmanı izle" butonu çıkar.
   - `spec`: `genre`, `engine`, `platforms`, `team` (1 = solo), `duration`, `publisher`. Boşlar gizlenir.
     Künyede ayrıca durum, yayın tarihi (`date`) ve araçlar (`tools`) otomatik gösterilir.
   - `gallery`: metnin hemen altında "Galeri" başlığıyla gösterilir.
   - `blocks` (opsiyonel, yazıldığı sırayla galerinin altında):
     - `gallery` → `images: [{ src, alt }]`, opsiyonel `caption: {en, tr}`
     - `youtube` → `id` (video linki de olur), opsiyonel `title`
     - `model` → `src: ./model.glb`, opsiyonel `caption`
     - `code` → `file: ./snippets/X.cs`, `lang` (Shiki dil adı: `csharp`, `cpp`, `gdscript`, `python`, `hlsl`, `glsl`, `json`…), opsiyonel `caption`
     - `itch` → `url` (itch.io sayfasında "Embed game" → iframe'in `src` adresi), `width`, `height` (oyunun boyutu), opsiyonel `title`
     - `download` → `file: ./dosya.pdf` (.pdf/.zip/.glb), opsiyonel `label`; ad, tür ve boyut otomatik
   - Şablondaki örnek `youtube`/`itch` bloklarını gerçek değerlerle değiştir ya da sil.
4. `en.md` ve `tr.md`: üç `##` başlık, bu sırayla: **What it is / What I did / What I learned** ve
   **Nedir / Ben ne yaptım / Ne öğrendim**. Markdown destekli. Takım projesinde "Ben ne yaptım"
   kısmında kullanıcının katkısı net olmalı. Biri yoksa diğer dile düşülür (rapor uyarır).
   Detail modundaki projede ikisinden en az biri **zorunlu** (yoksa build durur).

### Öne çıkan proje

`featured: true` → sekmelerin üstündeki büyük kart. Tek bir projede tutmak önerilir; diğerininkini `false` yap.

### Yeni kategori (sekme)

`src/data/categories.yaml`'a kayıt ekle: `id` (URL'de: `/en/projects/<id>/`), `name: {en, tr}`, `order`,
`visible`, `mode: detail | lightbox`. Kod değişikliği gerekmez. Gizlemek için `visible: false`
(o kategorinin projeleri de listeden çıkar).

### Yeni araç

`src/data/tools.yaml`: `id` (küçük harf-tire) + `label` (görünen ad). Projeler ve Hakkımda bu id'yi kullanır.

### Sertifika

1. `src/content/certificates/<slug>.yaml` oluştur (`sample-certificate.yaml`'ı örnek al).
2. Zorunlu: `title: {en, tr}`, `issuer`, `date`. Opsiyonel: `instructor`, `hours`, `credentialId`, `verifyUrl`,
   `logo` (ör. `./logos/kurum.png`, kare, en az 128 px; yoksa baş harfler), `order`.

### İstatistik

`src/data/stats.yaml` (3-4 kayıt önerilir, ekrandaki sıra dosyadaki sıradır). `kind`:
- `manual` → `value: 12` elle yazılır.
- `count` → proje sayısı; `status: released` ve/veya `category: models` ile süzülür.
  Etiket "yayınlanan oyun" diyorsa `category: games` de ekle; yoksa yayınlanan modeller de sayılır.
- `yearsSince` → `year: 2022`'den bu yana geçen yıl (build tarihine göre hesaplanır).
Her birinde `label: {en, tr}`, opsiyonel `suffix` (ör. `+`).

### Sosyal link / e-posta

`src/data/site.yaml` → `socials` altındaki alanı doldur (tam URL). Boş bırakılan görünmez.
Desteklenenler: itch, steam, github, youtube, linkedin, behance, artstation, sketchfab, discord.
E-posta: `email`.

### CV / portfolyo PDF'i güncelleme

1. PDF'i `src/data/downloads/` altına koy (isim: `cv-en.pdf`, `cv-tr.pdf`, `portfolio-tr.pdf`…). Eskisinin üzerine yazılabilir.
2. `src/data/downloads.yaml`'da ilgili kaydın `files.<dil>` satırını güncelle: `file`, `pages` (sayfa sayısı), `updated` (bugünün tarihi).
   Sadece bir dil varsa diğer dilin satırını sil.

### Hakkımda metni

`src/data/about.yaml`: `bio: {en, tr}` (paragraflar arasında boş satır), `school`, `city`, `since`,
`toolbox` (gruplar ve `tools.yaml` id'leri; temel seviye için `level: basic`).
Fotoğraf: `src/data/about/photo.jpg` (dikey, en az 900×1200).

### Son adımlar (her içerik değişikliğinden sonra)

1. `npm run build` — şema hatası varsa düzelt; çeviri raporundaki yeni eksikleri kullanıcıya söyle.
2. `npm test` ve `npm run check:sizes` — başarısız olursa push etme, sebebini düzelt ya da kullanıcıya söyle.
3. Commit + push (main'e doğrudan; CI testleri geçmezse yayın yapılmaz). Conventional commits, Türkçe açıklama:
   `feat(icerik): Modeller'e "Low-poly Sandık" eklendi`, `fix(icerik): CV güncellendi`.
   Kod değişiklikleri ise `feature/…` veya `fix/…` branch'inde yapılıp PR ile birleştirilir.
