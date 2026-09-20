# CryptoJobsList UI clone

Front-end recreation of [cryptojobslist.com](https://cryptojobslist.com) that loads **live jobs** from CryptoJobsList.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. That starts the Vite app and the Express API on `http://127.0.0.1:3001`.

Applications submitted from a job form are saved as JSON in `data/applications.json` with uploaded resume, photo, and video files in `data/uploads/`. Only an admin can review them at `/applications`.

Default admin login (override in `.env`):

```
admin@cryptojobslist.local
admin123
```

## Data source

The official JSON API (`GET https://api.cryptojobslist.com/public/jobs`) requires an `x-api-key`. Apply at [cryptojobslist.com/api-access](https://cryptojobslist.com/api-access), then put the key in `.env`:

```
CJL_API_KEY=cjl_your_api_key
```

Without a key, the app uses the public RSS feeds on the same API host (`/rss/web3.xml`, `/rss/remote.xml`, category feeds). Apply buttons go to each listing’s `canonicalURL` on CryptoJobsList.

Talent, blog, and hire flows are still demo UI.
