# Hassam Arshad — Portfolio

Personal portfolio of Hassam Arshad, Technical Consultant (Banking & Trade Finance Systems).

A frontend-only Angular 21 single-page app (standalone components, signals,
zoneless) in [`frontend/`](frontend). There is no server: content is bundled
into the app and the contact form sends email through Web3Forms.

## Editing the content

Everything on the site (profile, skills, experience, education, projects…)
comes from one file:
[`frontend/src/app/data/portfolio.json`](frontend/src/app/data/portfolio.json).
Edit it, push, and the site updates. No HTML changes needed.

- Images go in `frontend/public/assets/img/portfolio/` and are referenced as
  `assets/img/portfolio/<file>`.
- A project with `"cover": null` gets a generated placeholder cover.
- Projects appear in the order they are listed.
- Replace `frontend/public/assets/Resume.pdf` to update the downloadable resume.
- Interest icons can be a Bootstrap Icons / Boxicons class (`bi bi-…`, `bx bxl-…`) or
  a path to a logo image such as `assets/img/icons/redis.svg`.

## Chat assistant

The "Ask me anything" button opens an assistant that answers visitors'
questions about skills, experience, projects, education, contact details and
the resume. It reads the same `portfolio.json`, so it stays up to date when
you edit the content. It runs entirely in the browser: no API key, no server,
no cost. The logic is in
[`frontend/src/app/chat/chat-engine.ts`](frontend/src/app/chat/chat-engine.ts);
add entries to `ALIASES` there if visitors use other names for a technology.

## Contact form

The form sends messages with [Web3Forms](https://web3forms.com) (free, no card):

1. Go to https://web3forms.com, enter the email address that should receive
   messages, and copy the access key they email you.
2. Paste it into `web3formsAccessKey` in
   [`frontend/src/environments/environment.ts`](frontend/src/environments/environment.ts).
   The key is designed to be public, so committing it is fine.

Until a key is set, the form opens the visitor's email app with the message
already filled in.

## Running locally

Prerequisite: Node 22+.

```bash
cd frontend
npm install
npm start          # http://localhost:4200
```

## Tests

```bash
cd frontend
npm test -- --watch=false
```

## Deployment

The site is deployed on Vercel, which redeploys on every push.
[`vercel.json`](vercel.json) installs and builds `frontend/`, serves
`frontend/dist/frontend/browser`, and sends every path to `index.html` so deep
links like `/portfolio/texatube` work. In the Vercel project settings, keep
**Root Directory** empty (the repository root) and use Node.js 22 or newer.

To build locally: `cd frontend && npm run build`.

## Credits

Visual design based on the
[Personal](https://bootstrapmade.com/personal-free-resume-bootstrap-template/)
template by BootstrapMade.
