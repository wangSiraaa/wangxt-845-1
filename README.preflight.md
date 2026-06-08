# Trae Preflight

This folder is prepared for `wangxt-845-1`.

Use `.env` for stable local ports and compose project identity:

- APP_PORT: 18145
- API_PORT: 19145
- WEB_PORT: 20145
- DB_PORT: 21145
- REDIS_PORT: 22145

Smoke entry:

```bash
bash scripts/smoke.sh
```

The preflight files are environment scaffolding only. The generated business
project can replace or extend them when needed.
