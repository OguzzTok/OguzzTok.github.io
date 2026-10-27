# Oğuz Tok — Game Design Portfolio

Kişisel oyun tasarımı portfolyosu: oyunlar, 3D modeller, tasarımlar, sertifikalar.
İngilizce ve Türkçe. [Astro](https://astro.build) ile üretilen statik site, GitHub Pages'te yayınlanır:
**https://oguzztok.github.io/**

Sunucu, veritabanı veya yönetim paneli yok: tüm içerik bu repodaki dosyalardır.
İçerik eklemek için Claude Code'a "şu görsellerle Modeller'e yeni proje ekle" demen yeterli;
Claude [CLAUDE.md](CLAUDE.md)'deki tarifleri izler.

---

## GitHub Pages kurulumu (bir kerelik)

Gerekenler: [GitHub](https://github.com) hesabı (`OguzzTok`), bilgisayarda Git ve Node.js 22.12+ (ikisi de kurulu).

### 1. GitHub'da repoyu oluştur

1. https://github.com/new adresine git.
2. **Repository name:** tam olarak `OguzzTok.github.io` yaz. Bu özel ad sayesinde site kök adreste yayınlanır
   (`https://oguzztok.github.io/`). Büyük/küçük harf önemli değil.
3. **Public** seç. (Ücretsiz GitHub hesabında Pages yalnızca public repolarda çalışır; repodaki her şey herkese açık olur.)
4. "Add a README", ".gitignore" ve "license" seçeneklerini **işaretleme**: repo boş oluşmalı, kod bilgisayarındaki
   klasörden gelecek.
5. **Create repository**'ye bas.

### 2. Pages'i "GitHub Actions" ile yayınlayacak şekilde ayarla

1. Yeni repoda **Settings** → sol menüde **Pages**.
2. **Build and deployment** → **Source** açılır menüsünden **GitHub Actions**'ı seç.
   (Seçince kaydedilir; ayrıca bir buton yok.)

Bu adım ilk gönderimden **önce** yapılırsa ilk yayın sorunsuz çalışır. Sonra yapıldıysa bkz. "Sorun giderme".

### 3. Kodu GitHub'a gönder

Proje klasöründe (`C:\Users\ogzog\dev\portfolio`) bir terminal aç:

```bash
git remote add origin https://github.com/OguzzTok/OguzzTok.github.io.git
```

```bash
git push -u origin main
```

İlk gönderimde GitHub girişi için tarayıcı penceresi açılabilir (Git Credential Manager); giriş yapıp izin ver.
Sonraki gönderimlerde sadece `git push` yeterli.

### 4. İlk yayını izle

1. Repoda **Actions** sekmesine git; **Deploy** adlı bir çalışma başlamış olmalı.
2. İki aşaması var: **Build ve test** (typecheck, build, boyut kontrolü, otomatik testler) ve **Yayınla**.
   İlk çalışma 3-5 dakika sürebilir (test tarayıcısı kuruluyor).
3. İkisi de yeşil tik olunca site https://oguzztok.github.io/ adresinde. İlk seferde adresin açılması
   birkaç dakika daha sürebilir.

Kurulum bu kadar. Bundan sonra `main` dalına her gönderimde site otomatik güncellenir.

---

## Günlük kullanım

1. İçerik ekle veya değiştir (Claude Code'a söyleyerek ya da dosyaları kendin düzenleyerek).
2. Yerelde kontrol et: `npm run dev` → http://localhost:4321
3. Gönder: `git add -A`, `git commit -m "feat(icerik): ..."`, `git push`
4. **Actions** sekmesinde Deploy'un yeşil olmasını bekle.

**Güvenlik ağı:** typecheck, build, dosya boyutu kontrolü veya testlerden biri başarısız olursa site **güncellenmez**;
yayındaki eski hâli olduğu gibi kalır. Hatayı düzeltip tekrar gönderdiğinde yayın devam eder.

Elle yeniden yayınlamak için (ör. yeni yıl geldi, "X yıldır oyun yapıyorum" sayacı güncellensin):
**Actions** → **Deploy** → **Run workflow** → **Run workflow**.

---

## Sorun giderme

| Belirti | Sebep ve çözüm |
|---|---|
| Deploy, "Pages ayarları" adımında kırmızı | Pages kaynağı henüz "GitHub Actions" değil. Adım 2'yi yap, sonra Actions → başarısız çalışma → **Re-run all jobs**. |
| "Testler" adımında kırmızı | Bir şey bozulmuş; site güncellenmedi. Çalışmanın en altındaki **Artifacts** → `playwright-report`'u indir, aç (`index.html`). Ya da Claude'a hatayı göster. |
| "Build" adımında kırmızı | Çoğunlukla içerik dosyasında eksik/yanlış alan (ör. alt metni boş görsel). Log'da hangi dosya olduğu Türkçe yazar. |
| "Dosya boyutu kontrolü" kırmızı | 90 MB'tan büyük bir dosya var. Küçült veya repodan çıkar (videolar YouTube'a, oyunlar itch.io'ya). |
| Deploy yeşil ama site eski | Tarayıcı önbelleği: Ctrl+F5 ile yenile. GitHub Pages'in kendi önbelleği birkaç dakika sürebilir. |
| `git push` "rejected" diyor | GitHub'da senin bilgisayarında olmayan bir değişiklik var: önce `git pull --rebase`, sonra `git push`. |

### Repo adını değiştirirsen

Site başka bir repo adı altında da çalışır (ör. `portfolio` → `https://oguzztok.github.io/portfolio/`):
tüm linkler base yoluna uyumlu ve yol, workflow'da GitHub'dan otomatik alınır. Kodda değişiklik gerekmez.
Kullanıcı adı veya alan adı değişirse `astro.config.mjs` içindeki `SITE` satırını güncelle.

---

## Yerelde çalıştırma

```bash
npm install
```

```bash
npm run dev
```

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu, http://localhost:4321 (kaydedince sayfa yenilenir) |
| `npm run check` | Tip kontrolü |
| `npm run build` | Siteyi `dist/` klasörüne derler; eksik çevirileri listeler |
| `npm run preview` | Derlenmiş siteyi yerelde açar (yayındaki hâlin aynısı) |
| `npm test` | Otomatik testler (önce `npm run build`; açık bir `preview` varsa kapat) |
| `npm run check:sizes` | Dosya boyutu kontrolü |

İlk kez test çalıştırılacak bir bilgisayarda test tarayıcısını kur: `npx playwright install chromium`

## Yapı

```
src/content/projects/<slug>/   her proje: index.md (+ en.md/tr.md), görseller, .glb
src/content/certificates/      sertifikalar (.yaml)
src/data/                      site, hakkımda, kategoriler, araçlar, sayaçlar, indirmeler (.yaml) + PDF'ler
src/i18n/                      arayüz metinleri (en.json, tr.json)
src/lib/                       içerik okuma ve dönüştürme
src/components/, src/pages/    arayüz
tests/                         Playwright testleri
.github/workflows/deploy.yml   GitHub Pages yayını
```

Ayrıntılı mimari ve içerik ekleme tarifleri: [CLAUDE.md](CLAUDE.md).
