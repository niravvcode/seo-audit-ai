# SEO Audit AI - Website SEO Audit & Fix Prioritizer

A full-stack, enterprise-grade SEO diagnostic web application that audits target websites, evaluates 20+ deterministic technical and on-page SEO rules, calculates a transparent health score, provides actionable remediation steps with optional AI assistance, and generates downloadable CSV and PDF reports.

---

## 🚀 Features

- **Automated Web Crawler**: Asynchronous, rate-limited, depth-aware HTML crawler with strict SSRF protections against internal network scanning.
- **20 Deterministic SEO Checks**: Page title, meta descriptions, H1 hierarchy, broken links, image alts, canonical URLs, redirect loops, robots.txt, sitemaps, HTTPS/mixed content, duplicate content hashing, and page latency.
- **Transparent Health Scoring**: 0–100 scale using weighted penalties and category caps, clearly distinguishing technical defects from ranking guarantees.
- **AI-Powered Code Fix Recommendations**: Step-by-step developer implementation advice and tag examples (supports Gemini/OpenAI API or high-precision deterministic templates without an API key).
- **Mandatory Centralized Design System**: Controlled via CSS custom variables (`--color-primary`, `--color-surface`, etc.) in `design-tokens.css` with dynamic Dark/Light mode support.
- **Export Capabilities**: Complete CSV issue logs and formatted ReportLab PDF executive summaries.
- **Full Test Coverage**: Pytest suite for backend and Vitest/Testing-Library suite for frontend.

---

## 🛠️ Technology Stack

### Frontend
- **React 18** with **TypeScript** and **Vite**
- **Tailwind CSS 3.4** connected to centralized semantic design tokens
- **React Router DOM 6**
- **Recharts** (theme-aware charts)
- **Lucide React** (icons)
- **Vitest** & **React Testing Library**

### Backend
- **Python 3.12**
- **FastAPI** & **Uvicorn**
- **SQLAlchemy 2.0** & **Alembic** (migrations)
- **HTTPX** & **BeautifulSoup4**
- **ReportLab** (PDF generation)
- **Pytest** & **pytest-asyncio**

### Database
- **PostgreSQL** (primary production database)
- **SQLite** (automatic dev fallback / test environment)

---

## 📦 Prerequisites

- **Node.js**: `v20+` or `v22+` (with `npm`)
- **Python**: `3.12+`
- **Docker & Docker Compose** (optional, for running PostgreSQL locally)

---

## ⚙️ Initial Setup Instructions

### 1. Database Setup (PostgreSQL with Docker)
Run the provided `docker-compose.yml` to spin up a PostgreSQL instance on port `5432`:
```bash
docker compose up -d
```
Or use the automatic development fallback to SQLite if PostgreSQL is not installed locally.

### 2. Backend Setup
1. Create and activate a Python virtual environment:
   ```bash
   python -m venv backend/venv
   # Windows:
   .\backend\venv\Scripts\activate
   # Linux/macOS:
   source backend/venv/bin/activate
   ```
2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Copy environment configuration:
   ```bash
   cp backend/.env.example backend/.env
   ```
4. Run Alembic database migrations:
   ```bash
   alembic -c backend/alembic.ini upgrade head
   ```

### 3. Frontend Setup
1. Navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   ```

---

## 🏃 Running the Application

### 1. Start the Backend API Server
From the root workspace or `backend/`:
```bash
.\backend\venv\Scripts\uvicorn.exe app.main:app --app-dir backend --reload --port 8000
```
- API Documentation (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- API Health Endpoint: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 2. Start the Frontend Development Server
From the `frontend/` directory:
```bash
npm --prefix frontend run dev
```
- Frontend UI: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Tests

### Backend Unit & Integration Tests (pytest)
```bash
.\backend\venv\Scripts\pytest.exe -v
```
*Current status: 27 / 27 tests passing.*

### Frontend Unit Tests (Vitest)
```bash
npm --prefix frontend run test
```
*Current status: 10 / 10 tests passing.*

### Frontend Production Build
```bash
npm --prefix frontend run build
```

---

## 🎨 Centralized Design System Customization

All visual styles are centralized in `frontend/src/styles/design-tokens.css`.
To customize the primary branding color across the entire application:
```css
:root {
  --color-primary: #3b82f6; /* change to your brand hue */
  --color-primary-hover: #2563eb;
  --color-primary-light: #eff6ff;
}
```
All components, buttons, badges, tables, and charts automatically reflect token updates.

---

## 🔒 Security Architecture (SSRF Protection)

- **Scheme Validation**: Enforces `http://` or `https://` only.
- **DNS Resolution Check**: Pre-resolves IP addresses before issuing requests.
- **Restricted Networks**: Blocks loopback (`127.0.0.0/8`, `::1`), private RFC1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata (`169.254.169.254`).
- **Redirect Re-validation**: Validates every redirect hop dynamically before following.
