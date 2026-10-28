# PROJECT MEMORY: SEO Audit AI

## 1. Project Purpose & Requirements
**SEO Audit AI** is a professional SEO auditing and issue-prioritization platform. Users enter a target website URL, configure crawl depth and page limits, and receive a comprehensive, evidence-based audit identifying technical and on-page SEO issues, prioritized by severity with actionable developer recommendations, transparent health scoring, AI-powered fix code, and CSV/PDF reports.

---

## 2. Technology Stack & Installed Versions
- **Frontend**: React 18.3.1, TypeScript 5.7.2, Vite 6.0.3, Tailwind CSS 3.4.16, React Router DOM 6.28.0, Recharts 2.15.0, Lucide React 0.468.0, Vitest 2.1.8, @testing-library/react 16.1.0, jsdom 25.0.1.
- **Backend**: Python 3.12.6, FastAPI 0.115.5, Uvicorn 0.32.1, Pydantic 2.10.2, SQLAlchemy 2.0.36, Alembic 1.14.0, psycopg2-binary 2.9.10, httpx 0.28.1, BeautifulSoup4 4.12.3, lxml 5.3.0, ReportLab 4.2.5, pytest 8.3.4, pytest-asyncio 0.24.0.
- **Database**: PostgreSQL 16 (via Docker Compose / env `DATABASE_URL`), with automated SQLite fallback for local developer machines without active PostgreSQL service.

---

## 3. Repository Structure & Responsibilities
```text
seo-audit-ai/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # AppLayout, Navbar, Sidebar
│   │   │   ├── ui/           # Button, Card, Badge, Input, Modal, ProgressBar, EmptyState, LoadingSpinner
│   │   ├── pages/            # DashboardPage, NewAuditPage, AuditReportPage, AuditHistoryPage, MethodologyPage
│   │   ├── context/          # ThemeContext (dark/light mode persistence)
│   │   ├── config/           # theme.ts (semantic chart color mapping)
│   │   ├── styles/           # design-tokens.css, index.css
│   │   ├── services/         # api.ts (Axios client connecting to /api/v1)
│   │   ├── types/            # TypeScript interfaces
│   │   ├── test/             # Vitest test specs & setup.ts
│   │   ├── App.tsx           # Route tree & theme provider
│   │   └── main.tsx          # React DOM entry
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/    # audits.py, issues.py, export.py, ai.py, health.py
│   │   │   └── api.py        # Centralized v1 router
│   │   ├── core/             # config.py (Pydantic Settings)
│   │   ├── db/               # base.py, session.py (SQLAlchemy engine & session)
│   │   ├── models/           # website.py, audit.py, page.py, issue.py
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── crawler/      # security.py (SSRF protection), robots.py, crawler.py
│   │   │   ├── seo/          # rules.py (20 SEO rules), scoring.py, engine.py
│   │   │   ├── ai/           # advisor.py (Gemini API & heuristic fallback)
│   │   │   └── reports/      # csv_exporter.py, pdf_exporter.py (ReportLab)
│   │   └── main.py           # FastAPI entrypoint, CORS, lifespan startup
│   ├── alembic/              # Migration environment & versions
│   ├── tests/                # pytest specs
│   ├── requirements.txt
│   └── .env.example
├── docker-compose.yml        # PostgreSQL container configuration
├── pytest.ini                # Pytest configuration
├── README.md                 # Setup & running instructions
├── PROJECT_MEMORY.md         # Persistent system memory
└── TESTING.md                # Test execution logs & verification
```

---

## 4. Centralized Theme & Design System
All colors, border radii, typography, and shadows are defined in `frontend/src/styles/design-tokens.css` with semantic variables:
- `--color-primary`, `--color-primary-hover`, `--color-primary-light`
- `--color-surface`, `--color-background`, `--color-border`
- `--color-text`, `--color-text-muted`, `--color-text-subtle`
- `--color-danger`, `--color-warning`, `--color-success`, `--color-info`
Mapped directly into Tailwind CSS utilities in `tailwind.config.js`. Dark mode is toggled using the `.dark` CSS class.

---

## 5. SEO Rules & Scoring Methodology
20 deterministic rules implemented in `backend/app/services/seo/rules.py`:
1. `RULE_MISSING_TITLE` (Critical)
2. `RULE_TITLE_TOO_SHORT` / `RULE_TITLE_TOO_LONG` (Low / Medium)
3. `RULE_DUPLICATE_TITLE` (High)
4. `RULE_MISSING_META_DESC` (High)
5. `RULE_META_DESC_TOO_SHORT` / `RULE_META_DESC_TOO_LONG` (Low)
6. `RULE_MISSING_H1` (High)
7. `RULE_MULTIPLE_H1` (Info - review recommendation)
8. `RULE_HEADING_HIERARCHY` (Low - skipped levels)
9. `RULE_BROKEN_INTERNAL_LINK` (High - internal 4xx/5xx)
10. `RULE_HTTP_ERROR` (Critical/High - 404, 500)
11. `RULE_MISSING_IMAGE_ALT` (Medium)
12. `RULE_MISSING_CANONICAL` / `RULE_RELATIVE_CANONICAL` (Medium / Low)
13. `RULE_REDIRECT_CHAIN` (Medium - > 1 hop)
14. `RULE_MISSING_SITEMAP` (Medium)
15. `RULE_MISSING_ROBOTS` (Low)
16. `RULE_INSECURE_HTTP` (High)
17. `RULE_MIXED_CONTENT` (High - HTTP assets on HTTPS)
18. `RULE_DUPLICATE_CONTENT` (High - MD5 body hash collision)
19. `RULE_MISSING_LANG` (Low)
20. `RULE_SLOW_RESPONSE` / `RULE_VERY_SLOW_RESPONSE` (Medium / High)

**Scoring**:
- Starts at 100 points.
- Severity deductions: Critical: -15, High: -8, Medium: -4, Low: -1.5, Info: 0.
- Category caps applied (Technical: 40, Security: 35, On-Page: 35, Content: 25, Performance: 20).
- Normalized by crawled pages.

---

## 6. SSRF Protection Architecture
`backend/app/services/crawler/security.py`:
- Restricts to `http://` and `https://`.
- Resolves DNS addresses.
- Rejects loopback (`127.0.0.0/8`, `::1`), private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata (`169.254.169.254`).
- Validates every hop in redirect chains.

---

## 7. Current Project Status
- **Backend Tests**: 27 / 27 passing (100% pass rate).
- **Frontend Tests**: 10 / 10 passing (100% pass rate).
- **Frontend Production Build**: `dist/` built successfully with zero errors.
- **Database Migrations**: Alembic initialized and migration head applied.

---

## 8. Instructions for the Next AI Assistant
1. Read `PROJECT_MEMORY.md`, `README.md`, and `TESTING.md` before modifying the project.
2. Inspect the actual codebase and verify the documented status.
3. Continue from the existing code; do not restart the project unnecessarily.
4. Preserve working features, database compatibility, API contracts, and the centralized design system.
5. Run relevant unit tests after modifying each module (`pytest` for backend, `npm run test` for frontend).
6. Run integration and regression tests after meaningful changes.
7. Never fabricate completed functionality or successful test results.
8. Update all relevant documentation after meaningful changes.
9. If the code and documentation disagree, verify the code and correct the documentation.
10. Report changed files, completed tasks, tests executed, actual results, remaining defects, and the next recommended task.
