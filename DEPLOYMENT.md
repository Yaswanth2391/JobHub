# JobHub Production Deployment

Recommended first deployment:
- Frontend: Vercel (Vite/React)
- Backend: Render (Node/Express)
- Database: MongoDB Atlas

## Backend (Render)

Root directory: `backend`

Build command:

```bash
npm ci
```

Start command:

```bash
npm start
```

Environment variables:

```text
NODE_ENV=production
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<long random secret>
SUPER_ADMIN_EMAIL=<production admin email>
SUPER_ADMIN_PASSWORD=<strong production admin password>
CLIENT_ORIGINS=https://<your-vercel-domain>
```

The `/` endpoint is the backend health check and returns a JSON success message.

## Frontend (Vercel)

Root directory: `frontend`

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Environment variable:

```text
VITE_API_BASE_URL=https://<your-render-backend-domain>
```

`frontend/vercel.json` is included so React Router routes work after a direct refresh.

## Important

Do not commit:
- `.env` files
- `node_modules`
- `backend/uploads` user files

The current local upload implementation writes files to the backend filesystem. This is suitable for an initial functional demo, but persistent production storage should later be moved to object storage (for example S3-compatible storage or Cloudinary) because hosted filesystems can be ephemeral.

## End-to-end test

After both services are deployed:

1. Open the public frontend URL.
2. Register a new candidate account.
3. Confirm the request succeeds and the user appears in MongoDB Atlas.
4. Log in with that account.
5. Open candidate profile and dashboard.
6. Test jobs and applications.
7. Test company-admin and super-admin flows separately.
8. Check browser Network/Console for failed API calls.
