# Twitter Clone

A full-stack Twitter-like application built with Next.js, NestJS, and Firebase.

## Features

- Sign up with email/password (with email verification) or Google
- Sign in / Log out / Delete account
- Forgot password & change password
- Create, edit, delete posts (title, text, optional photo)
- Feed with infinite scroll, sorted by score (likes × 2 + comments)
- Full-text search by title, text, and author name (powered by Algolia)
- Like / Dislike posts (one reaction per user per post)
- Comments and nested replies
- View other users' profiles and their posts
- Edit profile info and avatar

## Tech Stack

**Frontend**
- Next.js 15 (App Router, static export)
- TailwindCSS v4 + shadcn/ui
- TanStack Query
- React Hook Form + Zod
- Firebase Client SDK

**Backend**
- NestJS 11
- Firebase Admin SDK (Firestore, Auth, Storage)
- Algolia (full-text search)
- Deployed as Firebase Functions v2

**Infrastructure**
- Firebase Hosting (frontend)
- Firebase Functions (backend)
- Firebase Firestore (database)
- Firebase Storage (file uploads)
- Firebase Authentication
- GitHub Actions (CI/CD)

## Live Demo

- Frontend: https://twitter-clone-927ae.web.app
- API: https://us-central1-twitter-clone-927ae.cloudfunctions.net/api

## Local Development

### Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore, Auth, and Storage enabled

### Backend

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run start:dev      # http://localhost:5000/api
```

Required `.env` variables:

```
FIREBASE_PROJECT_ID=your-project-id
ALGOLIA_APP_ID=your-algolia-app-id
ALGOLIA_API_KEY=your-algolia-api-key
ALGOLIA_INDEX_NAME=posts
FRONTEND_URL=http://localhost:3000
```

### Frontend

```bash
cd frontend
cp .env.example .env   # fill in your values
npm install
npm run dev            # http://localhost:3000
```

Required `.env` variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Project Structure

```
├── frontend/          # Next.js app
│   └── src/
│       ├── app/       # App Router pages
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── contexts/
├── backend/           # NestJS app
│   └── src/
│       ├── modules/   # posts, users, reactions, comments
│       ├── integrations/  # firebase, algolia
│       └── common/    # guards, filters, decorators
├── firebase.json      # Firebase Hosting + Functions config
└── firestore.rules    # Firestore security rules
```
