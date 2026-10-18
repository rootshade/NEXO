# NEXO

NEXO is a task and team-work management frontend built with Next.js, React, TypeScript, and Tailwind CSS. The project is being developed incrementally, with the interface and user workflows taking priority before a production backend is introduced.

## Current frontend areas

- Dashboard and activity overview
- Task listing, filtering, details, and editing
- Letters and messages
- Settings and developer/project information
- Users, roles, and permissions UI (under development)
- Floating notification center with filters and read/dismiss actions

## Tech stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Lucide icons
- Browser localStorage for prototype data and preferences

## Requirements

Install a supported Node.js LTS release and npm. The repository includes `package-lock.json`, so use npm for consistent dependency installation.

## Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/rootshade/NEXO.git
   cd NEXO
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Validation

Run the available checks before pushing changes:

```bash
npm run lint
npm run build
```

GitHub Actions is configured on `frontend-dev` and `main` to install dependencies, run ESLint, and build the production app on pushes and pull requests.

## Current limitations

NEXO is still a frontend prototype. Some tasks, comments, notifications, and preferences are stored in the browser's localStorage. That means this data is not shared between different users, browsers, or devices. A real multi-user deployment will require a backend, database, authentication, server-side authorization, and appropriate validation and security controls.

Do not treat UI-only role or permission checks as production security boundaries.

## Development workflow

- Work on `frontend-dev` while building features.
- Keep changes focused and use clear commit messages (for example, `feat: add task filters` or `fix: prevent task detail hydration mismatch`).
- Run lint and build locally before considering a release.
- Update `CHANGELOG.md` when meaningful user-facing or developer-facing changes are made.
- Create a version tag only after the relevant checks pass.

## Project links

- Repository: https://github.com/rootshade/NEXO
- Next.js documentation: https://nextjs.org/docs
