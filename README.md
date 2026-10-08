# Hassam Arshad — Portfolio

Personal portfolio of Hassam Arshad, Technical Consultant (Banking & Trade Finance Systems).

- **frontend/** — Angular 21 single-page app (standalone components, signals, zoneless)
- **backend/** — Spring Boot 4 REST API (Java 17) that serves the portfolio content and handles the contact form

All content (profile, skills, experience, projects…) lives in one file:
[`backend/src/main/resources/data/portfolio.json`](backend/src/main/resources/data/portfolio.json).
Edit it and the whole site updates. No HTML changes needed.

## Running locally

Prerequisites: Java 17+, Node 22+. Maven is not needed; the wrapper downloads it.

```bash
# 1. API on http://localhost:8080
cd backend
./mvnw spring-boot:run            # Windows: mvnw.cmd spring-boot:run

# 2. Site on http://localhost:4200 (proxies /api to :8080)
cd frontend
npm install
npm start
```

If the API isn't running, the site still renders: it falls back to a copy of
`portfolio.json` bundled at build time (`npm start`/`npm run build` sync it
automatically). Only the contact form needs the API.

## Tests

```bash
cd backend  && ./mvnw test
cd frontend && npm test -- --watch=false
```

## API

| Method | Path                         | Description                                   |
| ------ | ---------------------------- | --------------------------------------------- |
| GET    | `/api/portfolio`             | The whole portfolio document                  |
| GET    | `/api/projects?category=web` | Projects (optionally `web`, `mobile`, `desktop`) |
| GET    | `/api/projects/{slug}`       | One project, 404 if unknown                   |
| POST   | `/api/contact`               | Contact form; 202 on success, 400 with field errors |
| GET    | `/actuator/health`           | Health check                                  |

## Configuration

The backend is configured with environment variables:

| Variable                     | Default                        | Purpose                                         |
| ---------------------------- | ------------------------------ | ----------------------------------------------- |
| `PORT`                       | `8080`                         | HTTP port                                       |
| `PORTFOLIO_CORS_ORIGINS`     | `http://localhost:4200`        | Comma-separated front-end origins               |
| `PORTFOLIO_CONTENT_LOCATION` | `classpath:data/portfolio.json`| e.g. `file:/srv/portfolio.json` to edit without rebuilding |
| `CONTACT_RECIPIENT`          | `hassamarshad021@gmail.com`    | Inbox for contact-form messages                 |
| `CONTACT_SENDER`             | SMTP username                  | `From` address of those emails                  |
| `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD` | unset | SMTP server. When unset, messages are only logged. |

Example for Gmail (use an [App Password](https://support.google.com/accounts/answer/185833), not your account password):

```bash
SPRING_MAIL_HOST=smtp.gmail.com SPRING_MAIL_PORT=587 \
SPRING_MAIL_USERNAME=you@gmail.com SPRING_MAIL_PASSWORD=your-app-password \
./mvnw spring-boot:run
```

If the API is hosted on a different domain from the site, set `apiUrl` in
[`frontend/src/environments/environment.ts`](frontend/src/environments/environment.ts)
and add the site's origin to `PORTFOLIO_CORS_ORIGINS`.

## Deployment (free)

| Part     | Host   | Config                         |
| -------- | ------ | ------------------------------ |
| Frontend | Vercel | [`vercel.json`](vercel.json)   |
| Backend  | Render (free web service) | [`render.yaml`](render.yaml), [`backend/Dockerfile`](backend/Dockerfile) |

Both redeploy automatically on every push to `main`.

**Backend on Render (one-time setup)**

1. Sign in at [render.com](https://render.com) with GitHub.
2. **New → Blueprint**, pick this repository. Render reads `render.yaml`.
3. When asked for `PORTFOLIO_CORS_ORIGINS`, enter your Vercel domain(s),
   e.g. `https://my-portfolio.vercel.app,https://my-portfolio-*.vercel.app`.
4. Wait for the first build, then open `https://<service>.onrender.com/actuator/health`.
   It should return `{"status":"UP"}`.
5. If Render gave the service a different URL than
   `hassam-portfolio-api.onrender.com`, update the `/api` rewrite in `vercel.json`.
6. Optional: add the `SPRING_MAIL_*` variables (see above) under
   **Environment** so contact-form messages are emailed.

**Frontend on Vercel**

`vercel.json` builds `frontend/`, serves the result, proxies `/api/*` to
Render and sends all other paths to `index.html` (so deep links work). In the
Vercel project settings, keep **Root Directory** empty (the repository root)
and use Node.js 22 or newer.

The free Render service sleeps after 15 minutes without traffic and needs
up to a minute to wake. The site doesn't wait: after 4 seconds it shows the
content bundled at build time, and the request wakes the API for the
contact form.

## Building locally for production

```bash
cd frontend && npm run build      # static files in frontend/dist/frontend/browser
cd backend  && ./mvnw package     # runnable jar in backend/target
```

## Credits

Visual design based on the
[Personal](https://bootstrapmade.com/personal-free-resume-bootstrap-template/)
template by BootstrapMade.
