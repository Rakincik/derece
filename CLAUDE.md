# DereceUzem — Developer Playbook & Project Rules

Bu dosya, projenin mimarisi, kod standartları, veritabanı/backend entegrasyonu, admin paneli kuralları ve Plesk deployment süreçleri için ana rehberdir.

## 🛠 Sık Kullanılan Komutlar

### Geliştirme (Local Development)
* `npm run dev` - Yerel geliştirme sunucusunu başlatır (`http://localhost:3000`).
* `npm run build` - Üretim derlemesini (production build) hazırlar.
* `npm run start` - Derlenmiş üretimi yerelde test etmek için başlatır.
* `npm run lint` - ESLint kod analizi yapar.

### Veritabanı ve Backend Komutları (Eklenecek Yapıya Göre)
* `npx prisma db push` - Prisma şemasını veritabanına yansıtır.
* `npx prisma generate` - Prisma istemcisini (client) oluşturur.
* `npx prisma studio` - Veritabanını görsel olarak tarayıcıda açar.

---

## 📂 Klasör Yapısı ve Mimarisi

```
├── public/                 # Statik dosyalar, logolar, görseller
├── src/
│   ├── app/                # Next.js App Router (Sayfalar ve API)
│   │   ├── api/            # Backend API rotaları (Route Handlers)
│   │   ├── admin/          # Admin Paneli sayfaları
│   │   ├── urun/           # Dinamik ürün detay sayfaları
│   │   ├── globals.css     # Global CSS ve CSS değişkenleri
│   │   └── ...
│   ├── components/         # Yeniden kullanılabilir UI ve sayfa bileşenleri
│   │   ├── ui/             # Temel atomik bileşenler (Button, Skeleton vb.)
│   │   ├── layout/         # Navbar, Footer vb.
│   │   └── ...
│   ├── data/               # Statik ve mock veriler (Örn: products.js)
│   ├── store/              # Zustand state depoları (Örn: cartStore.js)
│   └── lib/                # Veritabanı bağlantısı, şifreleme ve araçlar
├── app.js                  # Plesk (Phusion Passenger) için Node.js başlangıç dosyası
├── next.config.mjs         # Next.js konfigürasyonu (ESLint yoksayma açık)
└── tailwind.config.js      # Tailwind CSS yapılandırması
```

---

## 🎨 Tasarım ve UI Kuralları (Aesthetic System)
* **Dark Mode Varsayılan:** Site koyu tema (vibrant dark) ve modern cam efekti (glassmorphic) üzerine kurulmuştur.
* **Cam Efektleri (Glassmorphism):** Kartlarda ve panellerde `backdrop-blur-md bg-slate-900/60 border border-slate-800` gibi class'lar tercih edilir.
* **Görsel Bildirimler:** Yüklenme süreçlerinde spinner yerine **Skeleton Loader** kullanılır.
* **Animasyonlar:** Mikro etkileşimler için `framer-motion` kullanılır. Tıklanabilir butonlar ve kartlar hover/active durumlarında yumuşak geçişli olmalıdır.
* **İkonlar:** Sadece `lucide-react` kullanılmalıdır. Başka bir ikon kütüphanesi yüklenmemelidir.
* **Mobil Öncelik (Mobile-First):** Tüm tasarımlar ve admin paneli mobil ekranlarda kusursuz çalışmalıdır.

---

## 🖥 Backend & Veritabanı Tasarım Kuralları (Next.js Route Handlers)
* **API Rotası:** Backend `src/app/api/` altında Next.js Route Handlers (`route.js` veya `route.ts`) kullanılarak yazılır.
* **Veritabanı Entegrasyonu:** MongoDB (Prisma ORM ile) veya alternatif olarak SQLite kullanılacaktır.
  * Bağlantı singleton deseniyle `src/lib/db.js` altında tutulur.
* **Veri Modelleri:**
  * `User`: `id`, `email`, `password` (hashed), `role` (ADMIN, STUDENT), `createdAt`.
  * `Product`: `id`, `title`, `slug`, `price`, `type` (Kitap, Video, Deneme vb.), `coverImage`, `description`, `contents`, `outcomes`.
  * `Order`: `id`, `userId`, `productId`, `amount`, `paymentStatus` (SUCCESS, FAILED, PENDING), `paymentId`, `createdAt`.
* **Güvenlik & JWT:** 
  * Kimlik doğrulama için API isteklerinde JWT (JSON Web Token) veya hafif bir custom session cookie mekanizması kullanılır.
  * Şifreler `bcryptjs` kullanılarak hash'lenmelidir.

---

## 🛡 Admin Paneli Kuralları (`/admin`)
* **Yetkilendirme:** `/admin` altındaki tüm rotalar middleware seviyesinde korunmalıdır. `role !== 'ADMIN'` olan istekler anasayfaya veya login sayfasına yönlendirilir.
* **Admin Dashboard Özellikleri:**
  * Ürün Yönetimi (CRUD - Ekleme, Listeleme, Silme, Düzenleme).
  * Satış Analitiği (Toplam gelir, satılan ürün adetleri, sipariş geçmişi).
  * Öğrenci/Kullanıcı Yönetimi.
  * Sipariş Durumları ve Manuel Erişim Tanımlama.

---

## 🚀 Plesk & Production Deploy Kuralları
1. **Yerel Build Kontrolü:** Sunucuya yüklenmeden önce mutlaka yerelde `npm run build` çalıştırılarak hata kontrolü yapılmalıdır.
2. **Arşivleme:** Sunucuya gönderilecek `.tar` dosyasında `node_modules`, `.next`, `.git` ve `.claude` klasörleri hariç tutulmalıdır.
3. **Plesk Başlangıç Dosyası (`app.js`):** Plesk Node.js Passenger modülü kök dizindeki `app.js` dosyasını tetikler. Bu dosya kesinlikle silinmemelidir.
4. **Çevre Değişkenleri:** `.env` değişkenleri Plesk panelindeki "Custom environment variables" alanından yönetilir.

---

## 📝 Kod Yazım & Standart Kuralları
* **Türkçe Dil Desteği:** Kullanıcı arayüzünde kullanılan tüm metinler, uyarılar ve veri açıklamaları Türkçe olmalıdır.
* **ESLint Kaçış Kuralları:** JSX içerisindeki metinlerde tırnak (`"`) ve kesme işaretleri (`'`) doğrudan kullanılmamalı, javascript stringleri `{"..."}` içinde veya `&quot;`, `&apos;` gibi HTML entity kodlarıyla yazılmalıdır.
* **Yorum Satırları:** Kod içindeki kritik mantıklar ve karmaşık animasyon tetikleyicileri Türkçe yorum satırlarıyla açıklanmalıdır.
