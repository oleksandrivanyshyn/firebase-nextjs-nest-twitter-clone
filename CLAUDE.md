# Firebase Twitter Clone — CLAUDE.md

## Project Overview
Full-stack Twitter-like app. Monorepo with `/frontend` (Next.js 15) and `/backend` (NestJS 11) in `/firebase-nextjs-nest-twitter-clone/`.

## Stack
- **Frontend:** Next.js 15, App Router, TailwindCSS v4, shadcn/ui, TanStack Query, React Hook Form, Zod, Firebase Client SDK, dayjs, lucide-react
- **Backend:** NestJS 11, firebase-admin, class-validator, class-transformer
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Storage:** Firebase Storage
- **Firebase Project ID:** `twitter-clone-927ae`

## Architecture

### Backend (`/backend/src/`)
```
integrations/firebase/      — FirebaseService (db, auth, storage), FirebaseModule (@Global)
common/guards/auth.guard.ts — Bearer token verification via firebase-admin
common/decorators/          — @CurrentUser() decorator (returns DecodedIdToken)
modules/
  user/                     — GET/PUT /api/users/me, GET /api/users/:id, DELETE /api/users/me
                              GET /api/users/:id/posts
  posts/                    — CRUD /api/posts, prefix search with ?q=
  reactions/                — POST /api/posts/:id/react, GET /api/posts/:id/my-reaction
  comments/                 — CRUD /api/posts/:postId/comments/:commentId
```
All write endpoints require `AuthGuard`. Reactions use Firestore transactions. Comments increment `commentsCount + score` in transaction. Post delete cascades to likes and comments subcollections.

### Frontend (`/frontend/src/`)
```
lib/firebase.ts             — Firebase app, auth, storage
lib/queryClient.ts          — TanStack QueryClient
utils/api.ts                — apiFetch<T>() — attaches Bearer token from auth.currentUser
contexts/AuthContext.tsx    — onAuthStateChanged, provides { user, loading }
components/Providers.tsx    — QueryClientProvider + AuthProvider wrapper
services/                   — One service per domain (auth, posts, comments, reactions, profile, storage)
hooks/                      — TanStack Query wrappers (useAuth, usePosts, useComments, useReactions, useProfile)
types/index.ts              — Post, Comment, UserProfile, PaginatedPosts interfaces
app/
  page.tsx                  — root: redirect to /feed (auth) or /login (unauth)
  (auth)/login|register|forgot-password — auth pages, use hooks/useAuth
  (main)/layout.tsx         — authenticated layout with Sidebar
  (main)/feed/page.tsx      — infinite scroll feed with search
  (main)/post/[id]/page.tsx — single post + comments
  (main)/profile/page.tsx   — edit profile, change password, my posts, delete account
  (main)/user/[id]/page.tsx — other user profile + their posts
components/
  layout/Sidebar.tsx        — nav links, "New Tweet" button, sign out
  posts/PostCard.tsx        — renders post with like/dislike/comment/edit/delete actions
  posts/CreatePostModal.tsx — modal to create post (with optional image upload)
  posts/EditPostModal.tsx   — modal to edit post
  comments/CommentTree.tsx  — builds nested tree from flat comment list
  comments/CommentItem.tsx  — single comment with reply/edit/delete
  comments/CommentForm.tsx  — textarea + submit for creating/replying
```

## Firestore Schema
```
users/{uid}                  — uid, email, name, surname, photoURL, createdAt
posts/{postId}               — id, userId, title, text, photoURL, likesCount, dislikesCount, commentsCount, score, createdAt
posts/{postId}/likes/{uid}   — type: "like" | "dislike"
posts/{postId}/comments/{id} — id, postId, userId, text, parentCommentId, createdAt
```
`score = likesCount * 2 + commentsCount` — stored field, updated in transactions.

## Firestore Indexes (`firestore.indexes.json`)
- `posts`: `score DESC` + `createdAt DESC` (for feed ordering)
- `posts`: `userId ASC` + `createdAt DESC` (for user posts)

## Key Design Decisions
- **Service layer:** Frontend has `services/` directory (postsService, commentsService, etc.) wrapping `apiFetch`. Hooks wrap these with TanStack Query. This is an improvement over the original plan.
- **Search:** Firestore prefix search on `title` field: `>= q`, `<= q + ''`. Not full-text. This is a known limitation.
- **Pagination:** cursor-based. `nextCursor` = last doc ID. `?startAfter=<id>` on next request.
- **Comment replies:** flat storage, tree built client-side by `buildTree()` in CommentTree.tsx.
- **Auth guard bypass:** (main)/layout.tsx does NOT have its own auth redirect — relies on root page.tsx redirect. Direct navigation to /feed while unauthenticated will render the page without redirecting.

## Dev Commands
```bash
# Backend
cd backend && npm run start:dev       # http://localhost:5000/api
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run start:dev

# Frontend
cd frontend && npm run dev            # http://localhost:3000
```

## Task Status vs `ai/task.txt`

### COMPLETE ✅
- Sign up email/password + email verification
- Sign up with Google
- Sign in / Log out
- Delete account
- Change name/surname/profile photo
- Change password (re-auth + Firebase updatePassword)
- Forgot password (sendPasswordResetEmail)
- Create/edit/delete posts (title, text, optional photo)
- View my posts (profile page)
- View other user's posts (/user/[id] page)
- Feed — paginated (infinite scroll) + sorted by score (likes*2 + comments)
- Search posts by title (prefix search)
- Like / Dislike / Remove reaction (1 reaction per user per post, Firestore transaction)
- Comments — create, edit, delete
- Reply to comments (parentCommentId)

### MISSING ❌
- **CI/CD GitHub Actions** (Stage 12 of plan)
  - `.github/workflows/deploy-frontend.yml`
  - `.github/workflows/deploy-backend.yml`
- `firebase.json` uses `frontend/out` (static export path) — correct path for Firebase Hosting static export.  Next.js must be built with `output: 'export'` for this to work, OR firebase.json hosting must be reconfigured for dynamic Next.js (Cloud Run/Functions integration).

### OPTIONAL (task.txt says "optional")
- Sign in with SMS code

## Notes for Next Session
1. The only remaining items from the plan are the CI/CD workflows (Stage 12).
2. There's a potential deployment config issue: `firebase.json` points to `frontend/out` (Next.js static export output) but `next.config.ts` does NOT have `output: 'export'`. Before deploying, decide: static export (add `output: 'export'` to next.config.ts + update rewrites) OR Next.js on Cloud Run (update firebase.json accordingly).
3. Firebase Storage rules and Firestore security rules should be set in Firebase Console before going live.
