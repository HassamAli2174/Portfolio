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

## Building for production

```bash
cd frontend && npm run build      # static files in frontend/dist/frontend/browser
cd backend  && ./mvnw package     # runnable jar in backend/target
```

The front end is a single-page app: configure the host to serve `index.html`
for unknown paths so deep links like `/portfolio/texatube` work.

## Credits

Visual design based on the
[Personal](https://bootstrapmade.com/personal-free-resume-bootstrap-template/)
template by BootstrapMade.
