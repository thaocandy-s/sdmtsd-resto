# Resto Hub

Hệ thống quản lý nhà hàng dạng **monorepo** gồm 2 ứng dụng Next.js:

- **Web** (`apps/web`) – Trang khách hàng, hỗ trợ đa ngôn ngữ (`next-intl`).
- **Admin** (`apps/admin`) – Trang quản trị nội dung, đặt bàn, người dùng...

Dùng chung các package trong `packages/*` (`ui`, `types`, `utils`, `config`) và cơ sở dữ liệu PostgreSQL thông qua Prisma.

## Công nghệ chính

| Thành phần   | Công nghệ                     |
| ------------ | ----------------------------- |
| Monorepo     | Turborepo + pnpm workspace    |
| Framework    | Next.js 15, React 19          |
| Ngôn ngữ     | TypeScript                    |
| CSDL / ORM   | PostgreSQL + Prisma           |
| State / Data | Zustand, TanStack Query       |
| Form         | React Hook Form + Zod         |
| Storage      | Supabase (tuỳ chọn)           |
| Auth         | JWT (jsonwebtoken + bcryptjs) |

## Yêu cầu môi trường

- **Node.js** >= 22
- **pnpm** 11.8.0 (dùng đúng version qua `corepack`)
- **PostgreSQL** (local hoặc từ dịch vụ như Supabase, Neon...)

Bật corepack để dùng đúng phiên bản pnpm:

```bash
corepack enable
corepack prepare pnpm@11.8.0 --activate
```

## Cài đặt

```bash
# 1. Cài dependencies cho toàn bộ workspace
pnpm install

# 2. Tạo file biến môi trường từ mẫu
cp .env.example .env
```

Sau đó mở `.env` và điền các giá trị:

| Biến                            | Mô tả                                              |
| ------------------------------- | -------------------------------------------------- |
| `DATABASE_URL`                  | Chuỗi kết nối PostgreSQL                           |
| `JWT_SECRET`                    | Khoá bí mật JWT (>= 32 ký tự)                      |
| `JWT_REFRESH_SECRET`            | Khoá bí mật refresh token (>= 32 ký tự)            |
| `JWT_EXPIRATION`                | Thời gian sống access token (mặc định `15m`)       |
| `JWT_REFRESH_EXPIRATION`        | Thời gian sống refresh token (mặc định `7d`)       |
| `NEXT_PUBLIC_WEB_URL`           | URL của app web                                    |
| `NEXT_PUBLIC_ADMIN_URL`         | URL của app admin                                  |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL Supabase (tuỳ chọn, cho lưu trữ file)          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key của Supabase (tuỳ chọn)                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key của Supabase (tuỳ chọn)           |
| `ALLOWED_ORIGINS`               | Danh sách origin cho CORS, phân tách bằng dấu phẩy |

## Khởi tạo cơ sở dữ liệu

```bash
# Sinh Prisma Client
pnpm db:generate

# Đồng bộ schema vào database (dev nhanh, không tạo migration)
pnpm db:push
# hoặc dùng migration
pnpm db:migrate

# Nạp dữ liệu mẫu
pnpm db:seed
```

Mở Prisma Studio để xem/sửa dữ liệu trực quan:

```bash
pnpm db:studio
```

## Chạy dự án (development)

```bash
# Chạy tất cả app song song
pnpm dev
```

- Web: http://localhost:3000
- Admin: http://localhost:3001

Chạy riêng từng app nếu cần:

```bash
pnpm --filter @resto-hub/web dev
pnpm --filter @resto-hub/admin dev
```

## Build & chạy production

```bash
# Build toàn bộ
pnpm build

# Chạy từng app đã build
pnpm --filter @resto-hub/web start
pnpm --filter @resto-hub/admin start
```

## Các lệnh hữu ích khác

| Lệnh             | Chức năng                       |
| ---------------- | ------------------------------- |
| `pnpm lint`      | Kiểm tra lint toàn bộ workspace |
| `pnpm typecheck` | Kiểm tra kiểu TypeScript        |
| `pnpm format`    | Format code bằng Prettier       |
| `pnpm clean`     | Dọn output build                |

## Cấu trúc thư mục

```
resto-hub/
├── apps/
│   ├── web/          # App khách hàng (port 3000)
│   └── admin/        # App quản trị (port 3001)
├── packages/
│   ├── config/       # Cấu hình dùng chung
│   ├── types/        # Type dùng chung
│   ├── ui/           # Component UI dùng chung
│   └── utils/        # Hàm tiện ích dùng chung
├── prisma/
│   ├── schema.prisma # Schema cơ sở dữ liệu
│   └── seed.ts       # Dữ liệu mẫu
├── turbo.json        # Cấu hình Turborepo
└── pnpm-workspace.yaml
```

## Ghi chú

- Dự án dùng **Husky** + **lint-staged** + **commitlint** (chuẩn Conventional Commits) cho pre-commit hook. Hook được cài tự động sau `pnpm install` (script `prepare`).
- Supabase chỉ cần thiết nếu sử dụng tính năng lưu trữ media; có thể bỏ qua khi phát triển cơ bản.
