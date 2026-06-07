# Entity Relationship Diagram (ERD)

## Database: networking_db

### ERD Description

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│    users     │     │    roles     │     │   permissions    │
├──────────────┤     ├──────────────┤     ├──────────────────┤
│ id (PK/UUID) │     │ id (PK/UUID) │     │ id (PK/UUID)     │
│ first_name   │     │ name (ENUM)  │     │ name (UNIQUE)    │
│ last_name    │     │ description  │     │ description      │
│ email (UQ)   │     └──────┬───────┘     │ module           │
│ password     │            │             └────────┬─────────┘
│ phone        │     ┌──────┴───────┐              │
│ address      │     │ user_roles   │     ┌────────┴─────────┐
│ status       │     ├──────────────┤     │ role_permissions  │
│ email_verified│    │ user_id (FK) │     ├──────────────────┤
│ force_pwd_chg│     │ role_id (FK) │     │ role_id (FK)     │
│ last_login   │     └──────────────┘     │ permission_id(FK)│
│ failed_attempts│                        └──────────────────┘
│ locked_until │
│ is_deleted   │     ┌──────────────┐     ┌──────────────────┐
│ created_at   │     │  categories  │     │    products      │
│ updated_at   │     ├──────────────┤     ├──────────────────┤
└──────┬───────┘     │ id (PK/UUID) │     │ id (PK/UUID)     │
       │             │ name (UQ)    │     │ name             │
       │             │ description  │     │ sku (UQ)         │
       │             │ image_url    │     │ price            │
       │             │ parent_id(FK)│◄────│ category_id (FK) │
       │             └──────────────┘     │ seller_id (FK)   │──► users
       │                                  │ status           │
       │             ┌──────────────┐     │ wholesale_price  │
       │             │  warehouses  │     │ min_order_qty    │
       │             ├──────────────┤     │ size/color/etc   │
       │             │ id (PK/UUID) │     │ is_deleted       │
       │             │ name         │     └────────┬─────────┘
       │             │ code (UQ)    │              │
       │             │ address      │     ┌────────┴─────────┐
       │             │ manager_id(FK│──►  │   inventory      │
       │             │ is_active    │     ├──────────────────┤
       │             └──────┬───────┘     │ product_id (FK)  │
       │                    │             │ warehouse_id(FK) │
       │                    └────────────►│ quantity         │
       │                                  │ reserved_qty     │
       │                                  │ reorder_level    │
       │                                  └──────────────────┘
       │
       ├──► ┌──────────────────┐     ┌──────────────────┐
       │    │     orders       │     │   order_items     │
       │    ├──────────────────┤     ├──────────────────┤
       │    │ id (PK/UUID)     │     │ id (PK/UUID)     │
       │    │ order_number(UQ) │     │ order_id (FK)    │
       │    │ user_id (FK)     │     │ product_id (FK)  │
       │    │ customer_id (FK) │     │ quantity         │
       │    │ status           │     │ unit_price       │
       │    │ total_amount     │     │ total_price      │
       │    │ order_date       │     │ size/color       │
       │    └──────────────────┘     └──────────────────┘
       │
       ├──► ┌──────────────────┐     ┌──────────────────┐
       │    │   customers      │     │  notifications   │
       │    ├──────────────────┤     ├──────────────────┤
       │    │ id (PK/UUID)     │     │ id (PK/UUID)     │
       │    │ company_name     │     │ user_id (FK)     │
       │    │ email (UQ)       │     │ title            │
       │    │ user_id (FK)     │     │ message          │
       │    └──────────────────┘     │ is_read          │
       │                             └──────────────────┘
       │
       ├──► ┌──────────────────┐     ┌──────────────────┐
       │    │ refresh_tokens   │     │ otp_verifications│
       │    ├──────────────────┤     ├──────────────────┤
       │    │ id (PK/UUID)     │     │ id (PK/UUID)     │
       │    │ token (UQ)       │     │ email            │
       │    │ user_id (FK)     │     │ code             │
       │    │ expires_at       │     │ otp_type         │
       │    │ is_revoked       │     │ is_used          │
       │    └──────────────────┘     │ expires_at       │
       │                             └──────────────────┘
       │
       └──► ┌──────────────────┐     ┌──────────────────┐
            │   audit_logs     │     │ system_settings  │
            ├──────────────────┤     ├──────────────────┤
            │ id (PK/UUID)     │     │ id (PK/UUID)     │
            │ action           │     │ setting_key (UQ) │
            │ user_id          │     │ setting_value    │
            │ user_email       │     │ setting_group    │
            │ entity_type      │     │ is_encrypted     │
            │ entity_id        │     └──────────────────┘
            │ description      │
            │ ip_address       │
            │ timestamp        │
            └──────────────────┘
```

## Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| Users ↔ Roles | Many-to-Many | Through user_roles join table |
| Roles ↔ Permissions | Many-to-Many | Through role_permissions join table |
| Products → Categories | Many-to-One | Product belongs to category |
| Products → Users (seller) | Many-to-One | Product created by seller |
| Categories → Categories | Self-referencing | Hierarchical categories |
| Inventory → Products | Many-to-One | Stock tracking per product |
| Inventory → Warehouses | Many-to-One | Stock per warehouse |
| Orders → Users | Many-to-One | Order placed by user |
| Orders → Customers | Many-to-One | B2B customer |
| OrderItems → Orders | Many-to-One | Line items in order |
| OrderItems → Products | Many-to-One | Product being ordered |
| Notifications → Users | Many-to-One | Notification for user |
| RefreshTokens → Users | Many-to-One | Token belongs to user |
| Warehouses → Users (manager) | Many-to-One | Managed by user |
| Customers → Users | One-to-One | Customer's user account |

## Indexes

- `idx_users_email` (UNIQUE) - Fast email lookup
- `idx_users_status` - Status filtering
- `idx_products_sku` (UNIQUE) - SKU lookup
- `idx_products_name` - Product search
- `idx_products_category` - Category filtering
- `idx_orders_number` (UNIQUE) - Order lookup
- `idx_orders_user` - User order history
- `idx_orders_status` - Status filtering
- `idx_audit_action` - Audit log filtering
- `idx_audit_timestamp` - Time-range queries
- `idx_inventory_product_warehouse` (UNIQUE) - Prevent duplicates

## Constraints

- All primary keys use UUID v4
- Soft delete pattern (is_deleted flag)
- Created/updated timestamps via JPA Auditing
- Cascade delete on OrderItems when Order deleted
- Email uniqueness enforced at database level
