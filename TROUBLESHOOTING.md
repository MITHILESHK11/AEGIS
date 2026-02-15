# AEGIS+ Troubleshooting Guide

Common issues and their solutions for the AEGIS+ platform.

## 📋 Table of Contents

1. [Installation Issues](#installation-issues)
2. [Authentication Problems](#authentication-problems)
3. [Database Issues](#database-issues)
4. [API Errors](#api-errors)
5. [Frontend Issues](#frontend-issues)
6. [Deployment Problems](#deployment-problems)
7. [Performance Issues](#performance-issues)

---

## Installation Issues

### Issue: `npm install` fails with dependency errors

**Symptoms**: Error messages about conflicting dependencies or missing packages.

**Solutions**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Use legacy peer deps (if using npm 7+):
   ```bash
   npm install --legacy-peer-deps
   ```

### Issue: Node version incompatibility

**Symptoms**: "Unsupported engine" or syntax errors.

**Solution**:
- Ensure you're using Node.js v18 or higher:
  ```bash
  node --version
  ```
- Install/switch to correct version using nvm:
  ```bash
  nvm install 18
  nvm use 18
  ```

---

## Authentication Problems

### Issue: "Unauthorized: No token provided"

**Symptoms**: API returns 401 errors even after login.

**Solutions**:
1. Check if token is being sent in headers:
   - Open browser DevTools > Network tab
   - Check request headers for `Authorization: Bearer <token>`

2. Verify token is stored correctly:
   ```javascript
   // In browser console
   localStorage.getItem('authToken')
   ```

3. Check token expiration:
   - Firebase tokens expire after 1 hour
   - Implement token refresh logic

### Issue: "Forbidden: Insufficient permissions"

**Symptoms**: 403 errors when accessing certain routes.

**Solutions**:
1. Verify user role in Firestore:
   - Go to Firebase Console > Firestore
   - Check `users/{uid}` document
   - Ensure `role` field is correct

2. Check custom claims:
   ```javascript
   // In Firebase Console > Authentication > Users
   // Click on user > Custom claims
   ```

3. Re-login to refresh token with new claims:
   - Sign out and sign back in
   - Or force token refresh in code

### Issue: Email verification not working

**Symptoms**: Verification email not received.

**Solutions**:
1. Check spam/junk folder
2. Verify email settings in Firebase Console:
   - Authentication > Templates > Email verification
3. Check sender email is authorized
4. Resend verification email

---

## Database Issues

### Issue: "Permission denied" in Firestore

**Symptoms**: Cannot read/write to Firestore collections.

**Solutions**:
1. Check Firestore Security Rules:
   - Go to Firebase Console > Firestore > Rules
   - Ensure rules match your requirements

2. For development, temporarily use test mode:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2026, 3, 1);
       }
     }
   }
   ```
   ⚠️ **Warning**: Only use in development!

3. Verify user is authenticated:
   ```javascript
   // Check if request.auth is populated
   ```

### Issue: Data not updating in real-time

**Symptoms**: Changes in Firestore don't reflect in UI immediately.

**Solutions**:
1. Ensure you're using Firestore listeners:
   ```javascript
   // Instead of .get()
   db.collection('grievances').onSnapshot(snapshot => {
     // Update UI
   });
   ```

2. Check for errors in console
3. Verify network connectivity

### Issue: Query returns empty results

**Symptoms**: Query should return data but returns empty array.

**Solutions**:
1. Check if composite index is required:
   - Error message will include index creation link
   - Click link to create index in Firebase Console

2. Verify query filters are correct:
   ```javascript
   // Check field names and values
   console.log('Querying with:', { field, value });
   ```

3. Check data exists in Firestore Console

---

## API Errors

### Issue: CORS errors in browser

**Symptoms**: "Access-Control-Allow-Origin" errors in console.

**Solutions**:
1. Verify backend CORS configuration:
   ```javascript
   // backend/src/index.js
   app.use(cors({
     origin: ['http://localhost:3000', 'https://your-domain.com'],
     credentials: true
   }));
   ```

2. Check if backend is running:
   ```bash
   curl http://localhost:5000/api/health
   ```

3. Ensure frontend is using correct API URL:
   ```bash
   # frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

### Issue: "Cannot connect to backend"

**Symptoms**: Network errors, connection refused.

**Solutions**:
1. Verify backend is running:
   ```bash
   cd backend
   npm run dev
   ```

2. Check port is not in use:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Linux/Mac
   lsof -i :5000
   ```

3. Check firewall settings
4. Verify `PORT` in `.env` matches your configuration

### Issue: 500 Internal Server Error

**Symptoms**: API returns 500 status code.

**Solutions**:
1. Check backend logs:
   ```bash
   # Look for error stack traces
   ```

2. Common causes:
   - Missing environment variables
   - Firebase credentials not configured
   - Database connection issues

3. Verify `.env` file exists and is correct:
   ```bash
   cd backend
   cat .env
   ```

---

## Frontend Issues

### Issue: "Module not found" errors

**Symptoms**: Import errors in Next.js.

**Solutions**:
1. Check import paths use correct alias:
   ```typescript
   // Use @/ for src directory
   import Component from '@/components/Component';
   ```

2. Verify file exists at specified path
3. Restart dev server:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Issue: Page not rendering / blank screen

**Symptoms**: White screen or component not displaying.

**Solutions**:
1. Check browser console for errors
2. Verify component is exported correctly:
   ```typescript
   export default function Component() { ... }
   ```

3. Check for syntax errors in JSX
4. Ensure all required props are passed

### Issue: Styles not applying

**Symptoms**: Tailwind classes not working.

**Solutions**:
1. Verify Tailwind is configured:
   ```javascript
   // tailwind.config.ts
   content: [
     './src/**/*.{js,ts,jsx,tsx,mdx}',
   ],
   ```

2. Check if class names are correct
3. Restart dev server to rebuild CSS
4. Clear browser cache

### Issue: Environment variables not working

**Symptoms**: `process.env.NEXT_PUBLIC_*` is undefined.

**Solutions**:
1. Ensure variables start with `NEXT_PUBLIC_`:
   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

2. Restart Next.js dev server (required after .env changes)
3. Don't access env vars in `getStaticProps` (use `getServerSideProps` instead)

---

## Deployment Problems

### Issue: Cloud Run deployment fails

**Symptoms**: Build or deployment errors in Cloud Run.

**Solutions**:
1. Check Dockerfile syntax
2. Verify all dependencies are in `package.json`
3. Check build logs:
   ```bash
   gcloud builds list --limit=5
   gcloud builds log <BUILD_ID>
   ```

4. Ensure service account key is included in build

### Issue: Vercel deployment fails

**Symptoms**: Build fails on Vercel.

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify environment variables are set in Vercel:
   - Project Settings > Environment Variables
3. Ensure all `NEXT_PUBLIC_*` variables are defined
4. Check for TypeScript errors:
   ```bash
   npm run build
   ```

### Issue: Deployed app shows different behavior than local

**Symptoms**: Works locally but not in production.

**Solutions**:
1. Check environment variables in production
2. Verify API URLs are correct for production
3. Check browser console for errors
4. Review production logs

---

## Performance Issues

### Issue: Slow page load times

**Symptoms**: Pages take long to load.

**Solutions**:
1. Optimize images:
   - Use Next.js Image component
   - Compress images before upload

2. Implement code splitting:
   ```typescript
   import dynamic from 'next/dynamic';
   const Component = dynamic(() => import('./Component'));
   ```

3. Enable caching:
   - Use SWR or React Query for data fetching
   - Implement service worker

4. Check Firestore query efficiency:
   - Use indexes
   - Limit query results
   - Paginate large datasets

### Issue: High backend latency

**Symptoms**: API requests take long to respond.

**Solutions**:
1. Add database indexes for frequently queried fields
2. Implement caching (Redis, Memcached)
3. Optimize Firestore queries:
   - Avoid fetching entire collections
   - Use `.limit()` and pagination

4. Monitor Cloud Run metrics:
   - Check CPU and memory usage
   - Scale instances if needed

### Issue: Memory leaks in frontend

**Symptoms**: Browser becomes slow over time.

**Solutions**:
1. Clean up event listeners:
   ```typescript
   useEffect(() => {
     const handler = () => { ... };
     window.addEventListener('event', handler);
     return () => window.removeEventListener('event', handler);
   }, []);
   ```

2. Unsubscribe from Firestore listeners:
   ```typescript
   useEffect(() => {
     const unsubscribe = db.collection('...').onSnapshot(...);
     return () => unsubscribe();
   }, []);
   ```

3. Use React DevTools Profiler to identify issues

---

## 🆘 Getting Help

If you can't resolve an issue:

1. **Check logs**:
   - Backend: Terminal output
   - Frontend: Browser console
   - Cloud Run: `gcloud run services logs read`

2. **Search existing issues**: Check GitHub issues for similar problems

3. **Create detailed bug report**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Error messages and logs
   - Screenshots if applicable

4. **Contact support**:
   - Email: support@aegis-platform.edu
   - GitHub: Open an issue
   - Documentation: Check other guides

---

## 🔧 Useful Commands

### Debugging

```bash
# Check backend health
curl http://localhost:5000/api/health

# View Firebase logs
firebase functions:log

# Check Firestore indexes
firebase firestore:indexes

# Test API endpoint
curl -X POST http://localhost:5000/api/endpoint \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'

# Check port usage
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux
```

### Cleanup

```bash
# Clear all caches
npm cache clean --force
rm -rf node_modules .next

# Reset Firestore emulator data
firebase emulators:export ./backup
firebase emulators:start --import=./backup

# Clear browser data
# Chrome: DevTools > Application > Clear storage
```
