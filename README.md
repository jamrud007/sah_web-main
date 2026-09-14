
# SAH Web — Administrative & Management Portal

**SAH Web** (`sah_web`) is the frontend web administration platform for the SAH (Scan Aman Halal) ecosystem. Built with React 19, TypeScript, Vite, and MUI v9+, this web portal enables administrative personnel to manage product catalogs, halal certificates, user roles, content management (CMS), analytics, and platform configurations.

---

**Tech Stack**

* **Framework & Build:** React 19, TypeScript ~6.0, Vite 8
* **UI Library:** Material UI (MUI) v9+, Emotion, MUI Icons
* **State Management:** Redux Toolkit, React-Redux v9
* **HTTP Client & Utilities:** Axios, Day.js
* **Linting & Quality:** ESLint 10, TypeScript-ESLint

---

**Prerequisites**

Ensure your development environment meets the following requirements:

* **Node.js:** `>= 20.x` (Recommended)
* **Package Manager:** `npm` (v10+) or `yarn` / `pnpm`
* **Nginx:** Required for local proxy setup and dev environment domain mapping (See [server_config.md](./server_config.md)

---

**Environment Variables**

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env

```

Configure the environment variables:

```env
# Website & Portal Title
VITE_WEBSITE_NAME=SAH Manager

# Backend API Base URLs
VITE_APP_BASEURL=http://localhost:xx1
VITE_OCR_BASEURL=http://localhost:xx2

```

> **Note:** All client-exposed variables in Vite must be prefixed with `VITE_`.

---

**Local Development Setup**

**1. Clone and Install Dependencies**

```bash
git clone [https://github.com/your-org/sah_web.git](https://github.com/your-org/sah_web.git)
cd sah_web
npm install

```

**2. Configure Local Web Server (Nginx)**

For local development, API requests and local domain routing rely on an Nginx reverse proxy setup.

Before launching the dev server, follow the step-by-step installation instructions detailed in [server_config.md](https://www.google.com/search?q=./server_config.md).

**3. Run Vite Development Server**

```bash
npm run dev

```

The application runs locally on port `8051` (`http://localhost:8051`) with strict port mapping as defined in `vite.config.ts`.

---

**Scripts**

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server on port `8051`<br> |
| `npm run build` | Compiles TypeScript declarations (`tsc -b`) and builds production assets via Vite

 |
| `npm run preview` | Previews the compiled production build locally

 |
| `npm run lint` | Runs ESLint checks across the codebase

 |

---

**Project Structure**

```text
sah_web/
├── src/                  # Application source code (aliased to '@')
│   ├── assets/           # Static assets (images, icons, fonts)
│   ├── components/       # Reusable MUI components
│   ├── features/         # Feature-based Redux slices & logic
│   ├── store/            # Redux Toolkit store setup
│   ├── services/         # Axios API clients & endpoints
│   └── views/            # Main administrative pages & views
├── .env                  # Environment variables (local configuration)
├── server_config.md      # Nginx server configuration guide for dev setup
├── vite.config.ts        # Vite configuration (port 8051, path aliases)
└── package.json          # Dependencies and scripts

```

---

**Path Aliases**

Path aliasing is configured in `vite.config.ts` so you can import modules using `@/`:

```typescript
// Import from src/components/Button
import CustomButton from "@/components/CustomButton";

```
