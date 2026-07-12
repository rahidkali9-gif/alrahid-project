# Seeders

`scripts/seed.js` runs `database/seeders/index.js`, which inserts idempotent
seed data using `ON CONFLICT DO NOTHING/UPDATE`.

## Seeded Data

- **Super admin**: `admin@alrahid.com` / `Admin@123456` (role `super_admin`)
- **Demo user**: `demo@alrahid.com` / `Demo@123456` (role `user`)
- **Welcome credits**: admin 100000, demo 10000
- **Default app_settings**: `app_name`, `primary_color=#0d9488`, `theme`
- **Default feature_toggles**: all 14 AI features enabled
- **Default ai_provider_settings**: openai default
- **Welcome notifications**: one per seeded user

Run with:

```bash
npm run seed
```
