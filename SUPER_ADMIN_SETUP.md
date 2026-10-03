# JobHub Super Admin & Public Navigation

## Super Admin routes

- `/super-admin/login`
- `/super-admin/dashboard`
- `/super-admin/companies`
- `/super-admin/company-admins`
- `/super-admin/users`
- `/super-admin/platform-management`
- `/super-admin/settings`

For local development, the Super Admin credentials come from the backend `.env`. If no Super Admin exists when MongoDB connects, the backend creates the default account from `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`.

## Public routes

- `/`
- `/jobs`
- `/companies`
- `/about`
- `/how-it-works`
- `/contact`
- `/help`
- `/privacy`
- `/terms`
- `/login`
- `/register`
- `/jobs/:jobId`

A fallback `*` route displays a JobHub not-found page.

## Frontend API configuration

The frontend no longer depends on the old hard-coded LAN IP. Set:

```env
VITE_API_BASE_URL=http://localhost:5000
```

For deployment, set `VITE_API_BASE_URL` to the public URL of the deployed backend.

Optional support details:

```env
VITE_SUPPORT_EMAIL=support@jobhub.com
VITE_SUPPORT_PHONE=
```

## Backend environment

Use a private backend `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
SUPER_ADMIN_EMAIL=your_admin_email
SUPER_ADMIN_PASSWORD=your_secure_password
CLIENT_ORIGINS=http://localhost:5173
```

`CLIENT_ORIGINS` accepts a comma-separated list of allowed frontend origins. If it is not configured, the backend preserves the current development CORS behavior.

## Local development

From `backend`:

```bash
npm install
npm run dev
```

From `frontend`:

```bash
npm install
npm run dev
```

## MongoDB deployment note

The existing project already contains a configured `MONGO_URI`. Keep that value private. Reuse the same Atlas cluster/database only when you intentionally want production to use the same data. Back up the database first. For a safer launch, use a separate production database or database name while keeping the same Atlas cluster if desired.

## Current authentication storage

The current frontend uses browser `localStorage` for authentication tokens and selected session/profile/search data. API requests are made with `fetch`. This is compatible with the current architecture, but production security hardening should consider moving authentication to secure HttpOnly cookies and reviewing XSS protections.

## Final QA notes

- Candidate-only footer links are protected. Visitors are shown a responsive JobHub login prompt instead of opening private pages.
- Company Admin dashboard/application links are protected separately and cannot fall through to the Candidate Dashboard.
- Candidate and Company Admin sessions are kept mutually exclusive when logging in or registering.
- Super Admin notifications open a real recent-activity panel and the profile arrow opens a Settings/Logout menu.
- Candidate profile picture upload is supported through `/api/candidate/profile/image` with JPG/PNG/WebP up to 2 MB.
- JobHub app icon is configured as the browser favicon.
- The project includes a reusable JobHub loading animation used across key loading states.

## Production deployment

1. Run `npm install` in both `backend` and `frontend`.
2. Keep `backend/.env` private. Do not commit it to GitHub.
3. For local testing, use the existing MongoDB Atlas connection string in your private backend `.env` when you intentionally want to test against the existing data.
4. Before production, back up the Atlas database. Prefer a dedicated production database/database name rather than testing directly against the only copy of live data.
5. Set the deployed frontend URL(s) in `CLIENT_ORIGINS` on the backend.
6. Set `VITE_API_BASE_URL` to the deployed backend public URL before building the frontend.
7. If your hosting platform uses ephemeral/serverless storage, move profile-image, resume, and company-logo uploads from local disk to persistent object storage such as Cloudinary or S3 before launch.
8. After deployment, test every public, candidate, company-admin, and super-admin route, plus login/logout, job posting, applications, interviews, uploads, filters, and mobile layouts.
