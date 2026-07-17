# Hướng dẫn cài đặt & chạy dự án trên máy mới

Tài liệu này mô tả **toàn bộ** các bước để clone `resto-hub` từ GitHub và chạy được cả 2 app (**web** + **admin**) trên một máy hoàn toàn mới.

> Trả lời nhanh câu hỏi "clone về máy khác có phải setup nhiều thứ không?": **Đúng.** Repo **không** commit file `.env`, `node_modules`, database... nên máy mới cần: cài công cụ → cài dependencies → tạo `.env` → khởi tạo database → chạy. Làm theo đúng thứ tự bên dưới là chạy được.

---

## 1. Yêu cầu công cụ (cài 1 lần cho mỗi máy)

| Công cụ        | Phiên bản | Ghi chú                                                    |
| -------------- | --------- | ---------------------------------------------------------- |
| **Node.js**    | `>= 22`   | Bắt buộc (khai báo trong `engines`). Nên dùng `nvm`.       |
| **pnpm**       | `11.8.0`  | Package manager chính. Cài qua `corepack` để đúng version. |
| **PostgreSQL** | 14+       | Local, hoặc dùng dịch vụ cloud (Supabase / Neon...).       |
| **Git**        | mới nhất  | Để clone repo.                                             |

### Cài Node.js (khuyến nghị dùng nvm)

```bash
# macOS / Linux
nvm install 22
nvm use 22
node -v   # phải >= v22
```

### Bật pnpm đúng phiên bản qua corepack

```bash
corepack enable
corepack prepare pnpm@11.8.0 --activate
pnpm -v   # phải in ra 11.8.0
```

---

## 2. Clone source code

```bash
git clone <URL-repo-cua-ban> resto-hub
cd resto-hub
```

---

## 3. Cài dependencies cho toàn bộ workspace

Đây là monorepo (Turborepo + pnpm workspace), chỉ cần chạy **1 lệnh ở thư mục gốc**, pnpm sẽ cài cho tất cả `apps/*` và `packages/*`:

```bash
pnpm install
```

> Lệnh `pnpm install` cũng tự chạy script `prepare` → cài **Husky** git hooks (pre-commit + commitlint). Đây là hành vi bình thường, không phải lỗi.

---

## 4. Tạo file biến môi trường (`.env`)

Repo **không** commit `.env`, chỉ commit `.env.example`. Tạo file thật từ mẫu:

```bash
cp .env.example .env
```

Sau đó mở `.env` và điền giá trị thật.

### 4.1. Danh sách biến môi trường

| Biến                            | Bắt buộc | Mô tả                                                                           |
| ------------------------------- | :------: | ------------------------------------------------------------------------------- |
| `DATABASE_URL`                  |    ✅    | Chuỗi kết nối PostgreSQL (dùng cho app runtime & Prisma).                       |
| `DIRECT_URL`                    |   ✅\*   | Kết nối trực tiếp tới DB. **Bắt buộc vì `schema.prisma` khai báo `directUrl`.** |
| `JWT_SECRET`                    |    ✅    | Khoá bí mật ký access token (>= 32 ký tự).                                      |
| `JWT_REFRESH_SECRET`            |    ✅    | Khoá bí mật ký refresh token (>= 32 ký tự).                                     |
| `JWT_EXPIRATION`                |    ⬜    | Thời gian sống access token (mặc định `15m`).                                   |
| `JWT_REFRESH_EXPIRATION`        |    ⬜    | Thời gian sống refresh token (mặc định `7d`).                                   |
| `NEXT_PUBLIC_WEB_URL`           |    ✅    | URL của app web (dev: `http://localhost:3000`).                                 |
| `NEXT_PUBLIC_ADMIN_URL`         |    ✅    | URL của app admin (dev: `http://localhost:3001`).                               |
| `NEXT_PUBLIC_SUPABASE_URL`      |    ⬜    | URL Supabase — chỉ cần khi dùng tính năng lưu trữ media.                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |    ⬜    | Anon key Supabase.                                                              |
| `SUPABASE_SERVICE_ROLE_KEY`     |    ⬜    | Service role key Supabase (chỉ dùng phía server).                               |
| `ALLOWED_ORIGINS`               |    ✅    | Danh sách origin cho CORS, phân tách bằng dấu phẩy.                             |

> ⚠️ **Lưu ý quan trọng về `DIRECT_URL`:** File `.env.example` hiện **chưa liệt kê** biến này, nhưng `prisma/schema.prisma` có dòng `directUrl = env("DIRECT_URL")`. Nếu thiếu, các lệnh Prisma (`db:push`, `db:migrate`, `db:seed`) sẽ báo lỗi. Hãy thêm `DIRECT_URL` vào `.env`. Với PostgreSQL local, giá trị của nó thường **giống hệt** `DATABASE_URL`.

### 4.2. Ví dụ `.env` cho PostgreSQL local

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/resto_hub"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/resto_hub"

# JWT Auth (đổi thành chuỗi ngẫu nhiên >= 32 ký tự)
JWT_SECRET="thay-bang-chuoi-ngau-nhien-that-dai-32ky-tu"
JWT_REFRESH_SECRET="thay-bang-mot-chuoi-khac-cung-dai-32-ky-tu"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# URLs
NEXT_PUBLIC_WEB_URL="http://localhost:3000"
NEXT_PUBLIC_ADMIN_URL="http://localhost:3001"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Supabase (bỏ trống nếu chưa dùng media storage)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

Sinh nhanh chuỗi bí mật JWT:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.3. ⚠️ Biến môi trường cho từng app (điểm dễ vấp nhất)

Prisma CLI tự đọc `.env` ở **thư mục gốc**, nên các lệnh `pnpm db:*` chạy tốt với 1 file gốc.

Tuy nhiên, **Next.js chỉ nạp file `.env` nằm trong thư mục của chính app đó** (`apps/web`, `apps/admin`) khi Turbo chạy `next dev`/`next build` trong từng thư mục con. File `.env` ở gốc **không** tự động được app đọc. Vì các app dùng trực tiếp `process.env.DATABASE_URL`, `process.env.JWT_SECRET`, `process.env.NEXT_PUBLIC_SUPABASE_URL`..., nên **mỗi app cần thấy được `.env`**.

Cách khuyến nghị (giữ 1 nguồn duy nhất, dùng symlink):

```bash
# Chạy ở thư mục gốc, sau khi đã tạo .env
ln -sf ../../.env apps/web/.env
ln -sf ../../.env apps/admin/.env
```

Hoặc nếu không muốn symlink thì copy (nhớ đồng bộ khi đổi giá trị):

```bash
cp .env apps/web/.env
cp .env apps/admin/.env
```

> Các đường dẫn `apps/web/.env` và `apps/admin/.env` đã được `.gitignore` bỏ qua nên sẽ không bị commit nhầm.

---

## 5. Khởi tạo cơ sở dữ liệu

Đảm bảo PostgreSQL đang chạy và database trong `DATABASE_URL` đã tồn tại.

```bash
# (tuỳ chọn) Tạo database local nếu chưa có
createdb resto_hub
```

Sau đó chạy tuần tự:

```bash
# 1. Sinh Prisma Client (tạo code type-safe từ schema)
pnpm db:generate

# 2. Đưa schema vào database
pnpm db:push          # cách nhanh cho dev, KHÔNG tạo file migration
# hoặc dùng migration (khuyến nghị cho môi trường giống production)
pnpm db:migrate

# 3. Nạp dữ liệu mẫu (roles, permissions, tài khoản admin, danh mục...)
pnpm db:seed
```

Sau khi seed xong, có sẵn tài khoản admin để đăng nhập trang **admin**:

| Trường   | Giá trị              |
| -------- | -------------------- |
| Email    | `admin@restohub.com` |
| Mật khẩu | `Admin@1234`         |

> 🔐 Đổi mật khẩu này ngay khi chạy môi trường thật.

Xem/sửa dữ liệu trực quan bằng Prisma Studio:

```bash
pnpm db:studio
```

---

## 6. Chạy dự án (development)

Chạy song song cả 2 app từ thư mục gốc:

```bash
pnpm dev
```

| App   | URL                   |
| ----- | --------------------- |
| Web   | http://localhost:3000 |
| Admin | http://localhost:3001 |

Chạy riêng từng app nếu cần:

```bash
pnpm --filter @resto-hub/web dev
pnpm --filter @resto-hub/admin dev
```

---

## 7. Build & chạy production (trên server)

```bash
# Build toàn bộ workspace
pnpm build

# Chạy từng app đã build
pnpm --filter @resto-hub/web start
pnpm --filter @resto-hub/admin start
```

Lưu ý cho production:

- Trên server phải có đầy đủ biến môi trường **tại thời điểm build** (đặc biệt các biến `NEXT_PUBLIC_*` được nhúng vào bundle lúc build).
- Chạy migration production bằng `pnpm exec prisma migrate deploy` thay vì `db:push`.
- Cấu hình `ALLOWED_ORIGINS`, `NEXT_PUBLIC_WEB_URL`, `NEXT_PUBLIC_ADMIN_URL` theo domain thật.

---

## 8. Checklist tổng hợp (copy chạy lần lượt)

```bash
# 1. Công cụ
corepack enable && corepack prepare pnpm@11.8.0 --activate

# 2. Source
git clone <URL-repo> resto-hub && cd resto-hub

# 3. Dependencies
pnpm install

# 4. Env
cp .env.example .env
# -> mở .env, điền DATABASE_URL, DIRECT_URL, JWT_SECRET, JWT_REFRESH_SECRET, ...
ln -sf ../../.env apps/web/.env
ln -sf ../../.env apps/admin/.env

# 5. Database
pnpm db:generate
pnpm db:push        # hoặc pnpm db:migrate
pnpm db:seed

# 6. Chạy
pnpm dev
```

---

## 9. Xử lý lỗi thường gặp

| Triệu chứng                                    | Nguyên nhân & cách xử lý                                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `Environment variable not found: DIRECT_URL`   | Thiếu `DIRECT_URL` trong `.env`. Thêm vào (local có thể để giống `DATABASE_URL`).             |
| `Can't reach database server` / `ECONNREFUSED` | PostgreSQL chưa chạy, hoặc `DATABASE_URL` sai host/port/user/password.                        |
| App chạy nhưng gọi API bị lỗi env `undefined`  | App chưa thấy `.env` — làm bước **4.3** (symlink/copy `.env` vào `apps/web` và `apps/admin`). |
| `pnpm: command not found` hoặc sai version     | Chưa bật corepack. Chạy lại bước **1**.                                                       |
| `The engine "node" is incompatible`            | Node < 22. Cài Node 22 (`nvm use 22`).                                                        |
| `@prisma/client did not initialize yet`        | Chưa chạy `pnpm db:generate` (hoặc chạy trước khi `pnpm install`).                            |
| Đăng nhập admin thất bại                       | Chưa `pnpm db:seed`, hoặc dùng sai tài khoản (`admin@restohub.com` / `Admin@1234`).           |
| Port 3000/3001 đã bị chiếm                     | Tắt tiến trình đang dùng port, hoặc đổi `--port` trong script `dev` của app tương ứng.        |

---

## 10. Ghi chú thêm

- **Không commit** `.env`, `apps/*/.env`, `node_modules`, thư mục build (`.next`). Chúng đã nằm trong `.gitignore`.
- Supabase là **tuỳ chọn** — chỉ cần khi dùng tính năng lưu trữ / hiển thị media. Có thể để trống các biến `*_SUPABASE_*` khi phát triển cơ bản.
- Dự án dùng **Conventional Commits** (kiểm tra bởi commitlint qua Husky). Commit message phải theo định dạng ví dụ: `feat: ...`, `fix: ...`, `docs: ...`.
- Các lệnh hữu ích khác: `pnpm lint`, `pnpm typecheck`, `pnpm format`, `pnpm clean`.
