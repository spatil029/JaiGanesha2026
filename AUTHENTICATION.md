# GitHub Authentication & Dashboard Access

## Overview

The account ledger application now integrates **GitHub username authentication** with role-based access control. Users must sign in with a GitHub username to view the dashboard.

## Key Features

### ✅ Authentication System
- **GitHub username login** (not OAuth, just username verification)
- Session stored in HTTP-only cookies (7-day expiry)
- Persistent login across page reloads
- Sign out functionality

### ✅ Role-Based Access Control
- **Admin User**: `spatil029` — Full write access to create/edit ledger entries
- **Other GitHub Users**: Read-only access to view the dashboard

### ✅ User Experience
- **Login Page**: Simple GitHub username input before dashboard access
- **Admin View**: Complete form to post new credits/expenses
- **Viewer View**: Dashboard displays all data, but entry form is hidden with informative message
- **Status Bar**: Shows current user and access level (admin/read-only)

## File Structure

```
src/
├── lib/
│   └── auth.ts                    # Auth utilities & constants
├── app/
│   ├── page.tsx                   # Entry point with session initialization
│   └── api/
│       └── auth/
│           └── login/
│               └── route.ts        # Login/logout endpoints
└── components/
    ├── AuthGate.tsx               # Login page & role wrapper
    └── LedgerApp.tsx              # Dashboard with conditional form
```

## API Changes

### POST `/api/auth/login`
**Request:**
```json
{
  "username": "spatil029"
}
```

**Response (success):**
```json
{
  "ok": true,
  "username": "spatil029",
  "isAdmin": true,
  "role": "admin"
}
```

**Response (invalid username):**
```json
{
  "error": "Enter a valid GitHub username to continue."
}
```

### DELETE `/api/auth/login`
Clears the session cookie and signs out the user.

### POST `/api/entries`
**Now requires admin authentication**
- Returns `403 Forbidden` if user is not `spatil029`
- Only admin (`spatil029`) can create ledger entries
- Other signed-in users cannot submit the form (UI-level restriction)

### GET `/api/entries`
**Public read access** for all authenticated users
- No changes from before, but now only accessible after login

## User Flows

### First-Time Login
1. User visits homepage → sees login page
2. Enters GitHub username (e.g., `spatil029` or `other_user`)
3. System validates username format and creates session cookie
4. Redirected to dashboard with appropriate access level

### Admin User (`spatil029`)
1. Sees "Admin edit access" badge
2. Full "Post a line" form visible
3. Can create credits and expenses
4. Dashboard shows all entries

### Regular GitHub User
1. Sees "Read-only access" badge
2. No form visible (replaced with info message)
3. Can view all ledger entries, balances, and trends
4. Cannot modify any data

### Sign Out
1. Click "Sign out" button in top bar
2. Session cookie deleted
3. Redirected to login page

## Configuration

**Admin Username** (set in `src/lib/auth.ts`):
```typescript
export const ALLOWED_ADMIN_GITHUB_USERNAME = "spatil029";
```

To add admin privileges to another user, update this constant and redeploy.

## Session Security

- **HTTP-only cookies**: Cannot be accessed via JavaScript (prevents XSS attacks)
- **SameSite=Lax**: Protects against CSRF attacks
- **Secure flag**: Only sent over HTTPS in production
- **7-day expiry**: Automatic session timeout for security

## Testing

1. **Admin user**: Sign in as `spatil029` → see full dashboard + form
2. **Regular user**: Sign in as any other valid GitHub username → see read-only dashboard
3. **Invalid username**: Enter invalid characters → error message
4. **Sign out**: Click sign out → returned to login page

## Future Enhancements

- Integrate with GitHub OAuth for real authentication
- Add user profiles and activity logs
- Support multiple admin accounts
- Add permission levels (viewer, commenter, admin)
