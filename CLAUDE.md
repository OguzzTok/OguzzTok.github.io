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
| 3 | Detay sayfası ve medya blokları | ⏳ |
| 4 | Hero + istatistikler, hakkımda, sertifikalar, indirmeler, iletişim, 404 | ⏳ |
| 5 | SEO, performans, Playwright, GitHub Actions deploy, boyut kontrolü | ⏳ |
| 6 | Bu rehberin tamamlanması, README'de GitHub Pages kurulumu | ⏳ |

Doldurulmayı bekleyen gerçek bilgiler (uydurma, kullanıcıya sor): `src/data/site.yaml` → `name`, `email`;
`src/data/about.yaml` → `bio`, `school`, `city`, `since`; `src/data/stats.yaml` → `years.year`.
Örnek içerik (başlığında "sample/örnek" geçen her şey) kullanıcı kendi içeriğini ekledikçe silinir.

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu: http://localhost:4321 (kayıtta otomatik yenilenir) |
| `npm run check` | TypeScript + Astro tip kontrolü |
| `npm run build` | Siteyi `dist/`'e derler; içerik şemaya uymuyorsa durur, eksik çevirileri listeler |
| `npm run preview` | `dist/`'i yerelde yayınlar (GitHub Pages'teki hâlin aynısı) |
| `npm run samples` | Örnek yer tutucu görsel/glb/pdf'leri üretir (sadece eksik olanları) |

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
   - `spec`: `genre`, `engine`, `platforms`, `team` (1 = solo), `duration`, `publisher`. Boşlar gizlenir.
   - `blocks` (opsiyonel, yazıldığı sırayla metnin altında): `gallery`, `youtube`, `model`, `code`
     (`file: ./snippets/X.cs`, `lang: csharp`), `itch` (itch.io "Embed game" iframe `src` adresi), `download` (dosya klasörde; ad ve boyut otomatik).
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

`src/data/stats.yaml` (3-4 kayıt önerilir). `kind`:
- `manual` → `value: 12` elle yazılır.
- `count` → proje sayısı; `status: released` ve/veya `category: models` ile süzülür.
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
2. Testler (Faz 5'ten sonra): `npm test`.
3. Commit + push (main'e doğrudan; CI testleri geçmezse yayın yapılmaz). Conventional commits, Türkçe açıklama:
   `feat(icerik): Modeller'e "Low-poly Sandık" eklendi`, `fix(icerik): CV güncellendi`.
   Kod değişiklikleri ise `feature/…` veya `fix/…` branch'inde yapılıp PR ile birleştirilir.
