# Database

This project uses a custom SQL migration runner (`scripts/migrate.js`) that reads
`.sql` files from `database/migrations/`, applies each in a transaction, and records
the applied filename in the `schema_migrations` table.

## Structure

```
database/
  index.js            # pg Pool wrapper (query, transaction, ping, close)
  migrations/         # 001-018 SQL files (forward only; --undo uses *.down.sql)
  seeders/
    index.js          # idempotent seed data
    README.md
```

## Commands

```bash
npm run migrate          # apply pending migrations
npm run migrate:undo     # revert last migration (requires <name>.down.sql)
npm run seed             # insert seed data (idempotent via ON CONFLICT)
npm run db:reset         # migrate + seed
```

## Connection

Configure via `.env` (see `.env.example`):

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alrahid
DB_USER=alrahid
DB_PASSWORD=alrahid_secret
DB_SSL=false
```

## Migrations List

| # | File | Purpose |
|---|------|---------|
| 001 | create_extensions | pgcrypto, uuid-ossp |
| 002 | create_users_table | users + role check + reset fields |
| 003 | create_profiles_table | 1:1 profiles |
| 004 | create_settings_table | user settings key/value |
| 005 | create_notifications_table | notifications |
| 006 | create_wallets_table | wallets (BIGINT balance >= 0) |
| 007 | create_wallet_transactions_table | ledger |
| 008 | create_activity_logs_table | activity logs |
| 009 | create_api_keys_table | SHA-256 hashed API keys |
| 010 | create_ai_generations_table | AI generation records (14 types) |
| 011 | create_history_table | user history |
| 012 | create_uploads_table | upload metadata |
| 013 | create_password_changes_table | password change audit |
| 014 | create_updated_at_trigger | updated_at triggers |
| 015 | create_migrations_meta_table | schema_migrations |
| 016 | create_app_settings_table | global app settings |
| 017 | feature_toggles + ai_provider_settings | toggles + provider config |
| 018 | ads + prompts + banners + admin_actions | admin tables |
