

  # Best - Delivery Management System

  A modern delivery management platform with consumer, manager, and delivery partner dashboards.

  ## Quick Start

  ### Local Development

  ```bash
  # Install dependencies
  npm install

  # Start dev server
  npm run dev
  ```

  Open [http://localhost:5173](http://localhost:5173) in your browser.

  ### Production Build

  ```bash
  npm run build
  npm run preview
  ```

  ## Deployment

  **See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.**

  ### Fastest Deploy Options:

  - **Vercel** (Recommended): Connect GitHub repo → Auto-deploys on push
  - **Netlify**: Connect GitHub repo → Auto-deploys on push
  - **GitHub Pages**: Free hosting for static sites

  All platforms: No environment variables needed!

  ## Features

  - Multi-role authentication (Consumer, Manager, Delivery Partner)
  - Real-time order management
  - Delivery tracking
  - Demo mode (try any email/password)
  - Dark mode support
  - Mobile responsive

  ## Tech Stack

  - React 18 + TypeScript
  - Tailwind CSS
  - Vite (Lightning-fast builds)
  - Supabase (Backend)
  - Radix UI (Components)

  ## Troubleshooting

  **App not loading locally?**
  ```bash
  # Kill all Node processes
  Get-Process node | Stop-Process -Force
  
  # Fresh install
  rm -r node_modules
  npm install
  npm run dev
  ```

  **Build fails?**
  ```bash
  npm run build
  ```

  **Port 5173 in use?**
  ```bash
  Get-Process node | Stop-Process -Force
  npm run dev
  ```

  Original project: https://www.figma.com/design/RSND5SUlAgQyWS3l3iHWsr/best
  Run `npm run dev` to start the development server.
  