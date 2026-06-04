# RoopVibe Auth Feature - TODO

## Step 1: Backend auth skeleton
- [ ] Create backend models: User, Otp
- [ ] Create JWT middleware: requireAuth
- [ ] Create auth controller methods: email login, otp send/verify, google login, me
- [ ] Create auth routes: /api/auth/*
- [ ] Mount routes in backend/index.js

## Step 2: Frontend connection
- [ ] Update AuthContext to use JWT (loginWithToken, fetchMe, logout)
- [ ] Update LoginPage to call backend endpoints for email, otp, google

## Step 3: Configure env
- [ ] Ensure backend/.env has: MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN
- [ ] Ensure frontend/.env has: VITE_API_URL
- [ ] Ensure Google env: GOOGLE_CLIENT_ID (+ secret if backend verifies)

## Step 4: Testing
- [ ] Start backend and verify API endpoints with quick request
- [ ] Start frontend and verify login/otp/google flows

