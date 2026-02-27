# Products API

Full CRUD API with image upload support.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | Public | List all products (paginated) |
| GET | `/api/products/:id` | Public | Get single product |
| POST | `/api/products` | Admin | Create product |
| PATCH | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/products/:id/image` | Admin | Upload product image to R2 |

## Features

- **Pagination**: `?page=1&limit=20` on list endpoint
- **Categories**: `category` field on every product; indexed for fast filtering
- **Image upload**: Multipart form upload → R2 (`PRODUCT_IMAGES` bucket); max 5 MB; JPEG/PNG/WebP/GIF
- **Audit log**: create/update/delete actions recorded via `logAction`
- **Validation**: all inputs validated; errors returned as `400` with detail array

## Database

Migration: `worker/src/migrations/001_create_products_table.sql`

Tables:
- `products` — core product data
- `product_images` — one-to-many images per product (CASCADE delete)

## Bindings Required

```toml
[[d1_databases]]
binding = "DB"
database_name = "revenueforge-db"
database_id = "..."

[[r2_buckets]]
binding = "PRODUCT_IMAGES"
bucket_name = "revenueforge-product-images"
```
