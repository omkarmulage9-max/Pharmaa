# Deployment Guide

## Quick Start - Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Production Build

```bash
npm run build
npm run preview
```

## Deployment Options

### Vercel (Recommended - One-click deploy)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" and select your repo
4. Click "Deploy" - that's it!

**Environment Variables:** None required (credentials are hardcoded in `utils/supabase/info.ts`)

### Netlify (One-click deploy)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git" and select your repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Click "Deploy"

### GitHub Pages

```bash
# Update package.json with your repo name
npm run build
# Push dist folder to gh-pages branch
```

### Any Static Host (AWS S3, Azure, Google Cloud, etc.)

1. Run `npm run build`
2. Upload the `dist` folder to your host
3. Configure as SPA (redirect all routes to index.html)

## Troubleshooting

- **Port 5173 already in use:** Kill Node processes and restart
  ```bash
  # Windows
  Get-Process node | Stop-Process -Force
  npm run dev
  ```

- **Build fails:** Clear cache and reinstall
  ```bash
  rm -r node_modules package-lock.json
  npm install
  npm run build
  ```

- **App not loading:** Check browser console for errors and ensure Supabase URL is correct

