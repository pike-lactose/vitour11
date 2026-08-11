# Documentation - Virtual Tour (Vitour)

## Overview
Aplikasi Virtual Tour berbasis web yang memungkinkan pengguna menjelajahi lokasi secara interaktif melalui panorama 360°. Dilengkapi dengan admin panel untuk mengelola scene, hotspot, user, dan monitoring aktivitas.

---

## Metode Pengembangan - SDLC (Agile Iterative)

Proyek ini dikembangkan menggunakan metode **SDLC (Software Development Life Cycle)** dengan pendekatan **Agile Iterative**, yang memungkinkan pengembangan fitur secara bertahap, fleksibel terhadap perubahan kebutuhan, dan pengujian di setiap iterasi.

### Mengapa Agile Iterative?
1. **Fleksibilitas** - Kebutuhan bisa berubah atau ditambah di tengah pengembangan tanpa mengganggu keseluruhan proyek
2. **Feedback Cepat** - Setiap fitur yang selesai langsung bisa diuji dan dievaluasi
3. **Pengiriman Bertahap** - Fitur prioritas (landing page, tour viewer) dirilis terlebih dahulu, kemudian fitur tambahan (auth, manajemen user) menyusul
4. **Adaptif** - Masalah atau bug bisa diperbaiki di iterasi berikutnya

### Tahapan SDLC pada Proyek Ini

#### 1. Planning (Perencanaan)
- **Analisis Kebutuhan**: Menentukan fitur utama (virtual tour 360°, admin panel) dan fitur tambahan (autentikasi, role-based access, activity log)
- **Pemilihan Teknologi**: React.js, Express.js, MySQL, Pannellum
- **Arsitektur Sistem**: Client-server dengan REST API
- **Database Design**: Tabel `scenes`, `hotspots`, `users` dengan relasi foreign key

#### 2. Design (Perancangan)
- **UI/UX Design**: Landing page dengan hero section, tour viewer interaktif, admin dashboard dengan sidebar navigasi, timeline activity log
- **Database Schema**:
  - `scenes`: id, name, image_path, description, created_by, updated_by, created_at, updated_at
  - `hotspots`: id, scene_id, pitch, yaw, text, description, target_scene_id, created_by, updated_by, created_at, updated_at
  - `users`: id, username, password_hash, role, created_at
- **API Design**: RESTful endpoints untuk CRUD operations + Activity Log
- **Color Palette**: Biru utama (#1e3a5f), putih, hijau tosca (#4ecdc4), ungu gradient (#667eea → #764ba2)

#### 3. Development (Pengembangan) - Dilakukan per Iterasi

| Iterasi | Fitur yang Dikembangkan |
|---------|------------------------|
| **Iterasi 1** | Landing page, hero section, footer, navigasi dasar |
| **Iterasi 2** | Tour viewer dengan Pannellum, panorama 360°, navigasi antar scene |
| **Iterasi 3** | Hotspot interaktif (scene, info), deskripsi panel, animasi |
| **Iterasi 4** | Admin panel (dashboard, kelola scene, kelola hotspot, panorama editor) |
| **Iterasi 5** | Sistem autentikasi (login/logout, session, bcrypt), protected routes |
| **Iterasi 6** | Role-based access (super_admin vs admin), kelola admin, UI/UX refinements |
| **Iterasi 7** | Logout button, foreign key tracking (created_by, updated_by), activity log |

#### 4. Testing (Pengujian)
- **Unit Testing**: Menguji setiap komponen secara individual
- **Integration Testing**: Menguji koneksi frontend-backend, API endpoints, relasi database
- **User Testing**: Menguji flow virtual tour, navigasi, dan admin panel
- **Security Testing**: Validasi autentikasi, role-based access, password hashing

#### 5. Deployment (Penerapan)
- Backend: Node.js server di port 5000
- Frontend: React development server di port 3000 (production bisa di-build dengan `npm run build`)
- Database: MySQL server lokal

#### 6. Maintenance (Pemeliharaan)
- Bug fixing (contoh: event bubbling pada deskripsi panel, session management)
- Penambahan fitur baru berdasarkan feedback user
- Update dependency dan security patches

---

## Tech Stack

### Bahasa Pemrograman
| Bahasa | Penggunaan |
|--------|-----------|
| JavaScript | Frontend (React) & Backend (Node.js) |
| SQL | Database queries (MySQL) |
| CSS | Styling halaman |

### Frontend
| Library/Framework | Versi | Kegunaan |
|-------------------|-------|----------|
| React | 18.2.0 | UI library utama |
| React Router DOM | 6.21.1 | Navigasi & routing |
| Pannellum | 2.5.6 | Render panorama 360° |
| Framer Motion | 12.38.0 | Animasi UI |
| Lucide React | 1.14.0 | Ikon |
| tsparticles | 3.9.1 | Efek partikel (background) |
| React Scripts | 5.0.1 | Build tool (Create React App) |

### Backend
| Library/Framework | Versi | Kegunaan |
|-------------------|-------|----------|
| Express.js | 4.18.2 | Web framework (API server) |
| MySQL2 | 3.6.5 | Driver database MySQL |
| Multer | 1.4.5-lts | Upload file (gambar panorama) |
| bcrypt | 6.0.0 | Hash password |
| express-session | 1.19.0 | Session management (login) |
| CORS | 2.8.5 | Cross-origin resource sharing |

### Database
| Teknologi | Kegunaan |
|-----------|----------|
| MySQL | Menyimpan data scene, hotspot, dan user dengan relasi foreign key |

---

## Fitur Lengkap

### Public (Tanpa Login)
| No | Fitur | Deskripsi |
|----|-------|-----------|
| 1 | **Landing Page** | Halaman utama dengan hero section, informasi virtual tour, dan navigasi |
| 2 | **Tour Viewer 360°** | Menjelajahi panorama 360° menggunakan Pannellum, kontrol mouse/touch |
| 3 | **Navigasi Antar Scene** | Klik hotspot untuk berpindah antar lokasi/scene |
| 4 | **Deskripsi Scene** | Info detail setiap lokasi yang bisa ditampilkan |
| 5 | **Navigasi Cepat** | Daftar semua scene untuk akses langsung ke lokasi tertentu |

### Admin Panel (Login Required)
| No | Fitur | Deskripsi | Super Admin Only |
|----|-------|-----------|:----------------:|
| 1 | **Dashboard** | Ringkasan data (jumlah scene, hotspot, dll) | ✗ |
| 2 | **Kelola Scene** | Tambah, edit, hapus scene panorama + upload gambar | ✗ |
| 3 | **Kelola Hotspot** | Tambah, edit, hapus hotspot per scene | ✗ |
| 4 | **Panorama Editor** | Edit posisi & konfigurasi hotspot secara visual | ✗ |
| 5 | **Log Aktivitas** | Timeline aktivitas (create/update) semua user | ✓ |
| 6 | **Kelola Admin** | Tambah, hapus akun admin & editor | ✓ |
| 7 | **Logout** | Logout dari admin panel, harus login ulang | ✗ |

### Fitur Autentikasi & Keamanan
- **Session-based Authentication** - Login dengan session httpOnly cookie
- **Password Hashing** - bcrypt untuk enkripsi password
- **Protected Routes** - Halaman admin hanya bisa diakses setelah login
- **Role-based Access Control** - Super admin vs admin dengan permission berbeda
- **Auto Redirect** - User belum login akan diarahkan ke halaman login
- **Loading State** - Auth check dengan timeout 5 detik

### Fitur Tracking & Audit
- **created_by** - Mencatat user yang pertama kali membuat scene/hotspot
- **updated_by** - Mencatat user yang terakhir mengedit scene/hotspot
- **Activity Log** - Timeline 50 aktivitas terbaru dengan info lengkap:
  - Jenis aksi (tambah/update scene/hotspot)
  - Nama item yang diubah
  - Nama user yang melakukan aksi
  - Waktu relatif (contoh: "5 menit yang lalu")

---

## Role & Permission

| Fitur | Super Admin | Admin |
|-------|:-----------:|:-----:|
| Dashboard | ✓ | ✓ |
| Kelola Scene | ✓ | ✓ |
| Kelola Hotspot | ✓ | ✓ |
| Panorama Editor | ✓ | ✓ |
| Log Aktivitas | ✓ | ✗ |
| Kelola Admin | ✓ | ✗ |

- **Super Admin**: Akses penuh termasuk manajemen user dan monitoring aktivitas
- **Admin**: Akses semua fitur CRUD kecuali manajemen user dan activity log
- Menu "Kelola Admin" dan "Log Aktivitas" disembunyikan dari sidebar untuk role Admin
- Route dan API di-blok di backend & frontend untuk non-super_admin

---

## Database Schema

### Tabel `users`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | INT (PK) | ID unik user |
| username | VARCHAR(100) | Username login (unique) |
| password_hash | VARCHAR(255) | Password ter-hash (bcrypt) |
| role | VARCHAR(50) | Role: `super_admin` atau `admin` |
| created_at | TIMESTAMP | Waktu pembuatan akun |

### Tabel `scenes`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | INT (PK) | ID unik scene |
| name | VARCHAR(255) | Nama scene/lokasi |
| image_path | VARCHAR(500) | Path gambar panorama |
| description | TEXT | Deskripsi scene |
| created_by | INT (FK → users.id) | User yang membuat |
| updated_by | INT (FK → users.id) | User yang terakhir edit |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu terakhir update |

### Tabel `hotspots`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | INT (PK) | ID unik hotspot |
| scene_id | INT (FK → scenes.id) | Scene tempat hotspot berada |
| pitch | FLOAT | Koordinat pitch |
| yaw | FLOAT | Koordinat yaw |
| text | VARCHAR(255) | Label hotspot |
| description | TEXT | Deskripsi hotspot |
| target_scene_id | INT (FK → scenes.id) | Scene tujuan (untuk tipe scene) |
| created_by | INT (FK → users.id) | User yang membuat |
| updated_by | INT (FK → users.id) | User yang terakhir edit |
| created_at | TIMESTAMP | Waktu pembuatan |
| updated_at | TIMESTAMP | Waktu terakhir update |

### Relasi Database
```
users (1) ←— (0..*) scenes.created_by
users (1) ←— (0..*) scenes.updated_by
users (1) ←— (0..*) hotspots.created_by
users (1) ←— (0..*) hotspots.updated_by
scenes (1) ←— (0..*) hotspots.scene_id
scenes (1) ←— (0..*) hotspots.target_scene_id
```

---

## Struktur Project

```
vitour/
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── admin/
│   │   │   │   ├── AdminLayout.js    # Sidebar & layout admin panel
│   │   │   │   └── AdminLayout.css
│   │   │   ├── ProtectedRoute.js     # Route guard (auth + super_admin)
│   │   │   ├── ProtectedRoute.css
│   │   │   ├── ScrollRevealGallery.js
│   │   │   └── InteractivePhotoStack.js
│   │   ├── context/
│   │   │   └── AuthContext.js        # Auth state management
│   │   ├── pages/
│   │   │   ├── Landing.js            # Landing page
│   │   │   ├── Landing.css
│   │   │   ├── TourViewer.js         # 360° panorama viewer
│   │   │   ├── TourViewer.css
│   │   │   ├── Login.js              # Login page
│   │   │   ├── Login.css
│   │   │   ├── Admin.js              # Dashboard
│   │   │   ├── Admin.css
│   │   │   └── admin/
│   │   │       ├── SceneManager.js       # Kelola scene
│   │   │       ├── SceneManager.css
│   │   │       ├── HotspotManager.js     # Kelola hotspot
│   │   │       ├── HotspotManager.css
│   │   │       ├── PanoramaEditor.js     # Editor visual
│   │   │       ├── PanoramaEditor.css
│   │   │       ├── ManageUsers.js        # Kelola admin
│   │   │       ├── ManageUsers.css
│   │   │       ├── ActivityLog.js        # Log aktivitas
│   │   │       └── ActivityLog.css
│   │   ├── App.js                    # Router setup
│   │   ├── App.css                   # Global styles
│   │   └── index.js
│   └── package.json
│
├── backend/
│   ├── uploads/                      # Uploaded panorama images
│   ├── server.js                     # Express API server
│   └── package.json
│
└── documentation.md                  # File ini
```

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/login` | ✗ | Login |
| POST | `/api/auth/logout` | ✗ | Logout |
| GET | `/api/auth/check` | ✗ | Cek status login |

### Scenes
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/scenes` | ✗ | Ambil semua scene + hotspot (untuk tour viewer) |
| GET | `/api/scenes/list` | ✗ | Ambil daftar scene dengan info creator |
| POST | `/api/scenes` | ✓ | Tambah scene (upload gambar) |
| PUT | `/api/scenes/:id` | ✓ | Edit scene |
| DELETE | `/api/scenes/:id` | ✓ | Hapus scene |

### Hotspots
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/hotspots` | ✗ | Ambil semua hotspot (opsional filter by sceneId) |
| POST | `/api/hotspots` | ✓ | Tambah hotspot |
| PUT | `/api/hotspots/:id` | ✓ | Edit hotspot |
| DELETE | `/api/hotspots/:id` | ✓ | Hapus hotspot |

### Users (Super Admin Only)
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/users` | ✓ (Super Admin) | Ambil semua user |
| POST | `/api/users` | ✓ (Super Admin) | Buat user baru |
| PUT | `/api/users/:id` | ✓ (Super Admin) | Edit user (password/role) |
| DELETE | `/api/users/:id` | ✓ (Super Admin) | Hapus user |

### Activity Log (Super Admin Only)
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/activity-log` | ✓ (Super Admin) | Ambil 50 aktivitas terbaru |

---

## Color Palette

| Peran | Hex | RGB | Penggunaan |
|-------|-----|-----|------------|
| **Primary Blue** | `#1e3a5f` | `rgb(30, 58, 95)` | Header, tombol utama, sidebar aktif |
| **Secondary Blue** | `#2d5a87` | `rgb(45, 90, 135)` | Hover, gradient background |
| **Accent Teal** | `#4ecdc4` | `rgb(78, 205, 196)` | Tombol CTA, ikon, highlight |
| **White** | `#ffffff` | `rgb(255, 255, 255)` | Card background, teks gelap |
| **Background** | `#f5f7fa` | `rgb(245, 247, 250)` | Latar belakang utama |
| **Text Primary** | `#2c3e50` | `rgb(44, 62, 80)` | Teks utama |
| **Purple Gradient** | `#667eea → #764ba2` | `rgb(102, 126, 234) → rgb(118, 75, 162)` | Tombol login, elemen dekoratif |
| **Danger Red** | `#e74c3c` | `rgb(231, 76, 60)` | Tombol hapus, error |
| **Success Green** | `#27ae60` | `rgb(39, 174, 96)` | Notifikasi berhasil |

---

## Cara Menjalankan

### Prerequisites
- Node.js (v18+)
- MySQL Server

### Backend
```bash
cd backend
npm install
node server.js
# Server berjalan di port 5000
```

### Frontend
```bash
cd frontend
npm install
npm start
# App berjalan di port 3000
```

### Default Credentials
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | super_admin |

---

## FAQ - Pertanyaan yang Mungkin Ditanyakan

### Q1: Apa itu Virtual Tour?
**A:** Virtual Tour adalah simulasi digital dari lokasi nyata yang memungkinkan pengguna menjelajahi area secara interaktif melalui gambar panorama 360°. Pengguna bisa berpindah antar lokasi, melihat info di setiap titik, dan merasakan pengalaman seolah berada di tempat tersebut.

### Q2: Teknologi apa yang digunakan?
**A:** 
- Frontend: React.js untuk UI, Pannellum untuk render panorama 360°, Framer Motion untuk animasi
- Backend: Node.js dengan Express.js untuk API
- Database: MySQL untuk menyimpan data dengan relasi foreign key
- Auth: Session-based authentication dengan bcrypt untuk hashing password

### Q3: Bagaimana cara kerja panorama 360°?
**A:** Gambar panorama 360° di-render menggunakan library Pannellum yang memproyeksikan gambar equirectangular ke sphere virtual. Pengguna bisa memutar pandangan ke segala arah (atas, bawah, kiri, kanan) menggunakan mouse atau touch. Hotspot ditempatkan pada koordinat spherical (yaw, pitch) di dalam panorama.

### Q4: Kenapa pakai session-based auth bukan JWT?
**A:** Karena ini aplikasi internal/admin panel, session-based auth lebih sederhana dan aman untuk use case ini. Session disimpan di server, tidak ada token yang bisa diclient-side, dan otomatis expire setelah 24 jam.

### Q5: Bagaimana sistem keamanannya?
**A:** 
- Password di-hash dengan bcrypt (tidak disimpan plain text)
- Session dengan httpOnly cookie (tidak bisa diakses JavaScript)
- Protected routes di frontend dan backend
- Role-based access control (super_admin vs admin)
- Validasi input di backend
- Foreign key tracking (created_by, updated_by) untuk audit

### Q6: Apa perbedaan Super Admin dan Admin?
**A:** Super Admin bisa mengakses halaman "Kelola Admin" untuk menambah/hapus akun dan "Log Aktivitas" untuk memantau aktivitas semua user. Admin biasa bisa akses semua fitur CRUD tapi tidak bisa mengelola user atau melihat activity log. Menu terkait disembunyikan dari sidebar.

### Q7: Bagaimana cara menambah admin baru?
**A:** Login sebagai super_admin → buka menu "Kelola Admin" → klik "Tambah Admin" → isi username, password (min 6 karakter), pilih role → submit.

### Q8: Format gambar panorama yang didukung?
**A:** Format equirectangular (rasio 2:1) dalam format JPG/PNG. Contoh: 4000x2000 pixel. Gambar di-upload ke server dan disimpan di folder `backend/uploads/`.

### Q9: Apa itu hotspot dalam virtual tour?
**A:** Hotspot adalah titik interaktif di dalam panorama yang bisa diklik pengguna. Ada beberapa tipe:
- **Scene**: Memindahkan pengguna ke scene/lokasi lain
- **Info**: Menampilkan informasi tambahan
- **Video**: Memutar video

### Q10: Bagaimana alur navigasi antar scene?
**A:** 
1. Admin membuat scene baru dengan upload gambar panorama
2. Admin menambahkan hotspot tipe "scene" dan mengatur koordinat (yaw, pitch)
3. Hotspot di-link ke scene target
4. Di Tour Viewer, saat user klik hotspot scene, viewer akan transition ke scene tujuan

### Q11: Apa itu Log Aktivitas?
**A:** Log Aktivitas adalah halaman khusus super admin yang menampilkan timeline 50 aktivitas terbaru dari semua user, meliputi: tambah/update scene, tambah/update hotspot. Setiap entri menampilkan jenis aksi, nama item, nama user yang melakukan, dan waktu relatif.

### Q12: Bagaimana tracking "created by" dan "updated by" bekerja?
**A:** Setiap kali scene atau hotspot dibuat atau diedit, backend otomatis mencatat ID user yang melakukan aksi dari session. Kolom `created_by` dan `updated_by` di database terhubung ke tabel `users` via foreign key. Saat query, nama username ditampilkan melalui JOIN.

### Q13: Bagaimana jika user dihapus?
**A:** Foreign key menggunakan `ON DELETE SET NULL`, jadi jika user dihapus, data scene/hotspot tidak ikut terhapus, hanya kolom `created_by`/`updated_by` yang menjadi NULL. Ini menjaga integritas data.
