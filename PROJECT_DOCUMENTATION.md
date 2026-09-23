# Online Request Evaluation System - Project Documentation

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Routing](#routing)
4. [Core Architecture](#core-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [Key Features](#key-features)
7. [Environment Configuration](#environment-configuration)
8. [Database Schema Overview](#database-schema-overview)
9. [Components](#components)
10. [Utilities](#utilities)
11. [Hooks](#hooks)
12. [Configuration Files](#configuration-files)
13. [Known Issues & Considerations](#known-issues--considerations)

---

## Overview

The Online Request Evaluation System (ORES) is a Next.js 16 procurement management application built for Santeh Feeds Corporation. It manages purchase requests, request evaluations, tickets, user accounts, and approvals with real-time notifications, role-based access control, and OTP authentication.

- **Framework**: Next.js 16 with App Router
- **Server**: Express + Socket.IO merged server (`server.js`)
- **Database**: Microsoft SQL Server (mssql) with two database contexts
- **Frontend**: React 19, Tailwind CSS, Framer Motion
- **Real-time**: Socket.IO (primary) + Pusher (dual implementation)
- **Authentication**: Custom bcrypt-based login with OTP, rate limiting
- **Email**: Nodemailer (Gmail SMTP) with HTML templates
- **Icons**: Heroicons, Lucide React
- **Charts**: Recharts
- **Notifications**: react-toastify

---

## Project Structure

```
OnlineProcurementSystem/
├── server.js                  # Express + Socket.IO + Next.js custom server
├── package.json               # Dependencies and scripts
├── .env.local                 # Environment variables (committed to repo)
├── next.config.mjs            # Next.js config (React Compiler enabled)
├── next.config.cjs            # Legacy Next.js config
├── jsconfig.json            # Path alias: @/* -> ./src/*
├── tailwind.config.mjs      # Tailwind CSS v4 config
├── postcss.config.mjs       # PostCSS config
├── eslint.config.mjs        # ESLint config
├── testDb.js                # Database connection test script
├── testMailer.js           # Email service test script
├── README.md                # Project overview (basic)
├── PROJECT_DOCUMENTATION.md  # This file
└── src/
    ├── app/
    │   ├── layout.js        # Root layout with AuthProvider + SessionTimeoutWrapper
    │   ├── page.js          # Landing page - redirects to /dashboard or /login
    │   ├── globals.css      # Global styles
    │   ├── favicon.ico
    │   ├── login/
    │   │   ├── page.js      # Login form with rate limiting, password visibility
    │   │   └── _actions/
    │   │       └── index.js # loginUser, logoutUser server actions
    │   ├── signup/
    │   │   ├── page.js      # Account request form with live validation
    │   │   └── _actions/
    │   │       └── index.js # createUser, checkEmailExists, checkEmployeeIDExists,
    │   │                      sendConfirmationEmail, sendNotification
    │   ├── forgot-password/
    │   │   ├── page.js      # 3-step password reset (email -> OTP -> reset)
    │   │   └── _actions/
    │   │       └── index.js # sendPasswordResetOTP, verifyPasswordResetOTP,
    │   │                      resendPasswordResetOTP, resetPassword
    │   ├── OTP/
    │   │   ├── page.js      # OTP verification with 10-min timer, resend
    │   │   └── _actions/
    │   │       └── index.js # verifyOTP, resendOTP
    │   ├── _components/     # Shared UI components
    │   │   ├── loader.js        # Lottie-based full-screen loader
    │   │   ├── loaderButton.js  # Inline loader button
    │   │   ├── loader.json      # Lottie animation data
    │   │   ├── headerNavBar.js  # Main navigation bar with dynamic menus
    │   │   ├── notificationBell.js  # Notification dropdown with real-time updates
    │   │   ├── sessionTimeoutWrapper.js  # Wraps app with session timeout hook
    │   │   ├── skeletonLoader.js  # Loading skeleton placeholders
    │   │   ├── titleUpdater.js  # Dynamic document title updates
    │   │   ├── card.js          # Reusable card component
    │   │   └── email.html     # HTML email template
    │   ├── _actions/        # Server actions (React Server Components)
    │   │   ├── notifications.js   # getUserNotifications, getUnreadNotificationCount,
    │   │   │                      # markNotificationAsRead
    │   │   ├── socket.js          # Server-side Socket.IO broadcast functions
    │   │   └── pusher1.js         # Server-side Pusher broadcast functions
    │   ├── api/             # API routes
    │   │   ├── check-login-time/route.js  # Checks if user logged in before 7 AM
    │   │   ├── check-access/route.js      # Checks module access for employee
    │   │   ├── user-access/route.js       # Gets accessible modules for employee
    │   │   └── user-settings/route.js     # Gets user dark mode preference
    │   ├── (main)/        # Protected routes (wrapped with RouteGuard)
    │   │   └── layout.js  # Applies RouteGuard to all main routes
    │   │   ├── dashboard/
    │   │   │   ├── page.js           # Admin dashboard
    │   │   │   └── procurement/
    │   │   │       └── page.js       # Procurement dashboard
    │   │   ├── user-setup/
    │   │   │   └── user-approval/
    │   │   │       └── page.js       # Pending account approval
    │   │   ├── user-access/
    │   │   │   └── page.js           # Module access management
    │   │   ├── user-accounts/
    │   │   │   └── page.js           # User account management
    │   │   ├── user-profile/
    │   │   │   ├── page.js           # User profile view/edit
    │   │   │   └── _actions/
    │   │   │       └── index.js      # Profile update actions
    │   │   ├── procurement/
    │   │   │   ├── purchase-request/
    │   │   │   │   └── page.js        # PR creation and listing
    │   │   ├── purchase-order/
    │   │   │   └── page.js            # PO management
    │   │   ├── canvassing/
    │   │   │   └── page.js            # Supplier quotations/canvassing
    │   │   ├── canvass-approval/
    │   │   │   └── page.js            # Canvass approval workflow
    │   │   ├── receiving-entry/
    │   │   │   └── page.js            # Goods receiving
    │   │   ├── request-evaluation/
    │   │   │   ├── page.js            # Request evaluation main page
    │   │   │   ├── _actions/
    │   │   │   │   └── index.js       # Evaluation action handlers
    │   │   │   └── _components/
    │   │   │       ├── RejectOptionModal.js
    │   │   │       ├── PurchaseRequestDetails.js
    │   │   │       └── PurchaseOrderDetails.js
    │   │   ├── non-po/
    │   │   │   └── requests/
    │   │   │       └── page.js        # Non-PO request management
    │   │   ├── settings/
    │   │   │   ├── page.js            # Settings page
    │   │   │   └── activity-logs/
    │   │   │       └── page.js        # Activity audit logs
    │   │   └── system-utilities/
    │   │       ├── item-masterfile/
    │   │       │   └── page.js        # Item master maintenance
    │   │       ├── system-modules/
    │   │       │   └── page.js        # Module configuration
    │   │       ├── ticket/
    │   │       │   └── page.js        # Support ticket system
    │   │       └── admin-utilities/
    │   │           ├── page.js
    │   │           ├── receiving-utilities/
    │   │           │   └── page.js
    │   │           └── distribution-of-accounts/
    │   │               └── page.js
    │   └── (main)/_components/  # Layout components for protected area
    │       ├── userProfileHeader.js
    │       ├── userPassword.js
    │       ├── successModal.js
    │       ├── sideNotchOpenLeftPanel.js
    │       ├── SearchModal.js
    │       ├── rejectRequestModal.js
    │       ├── Pagination.js
    │       ├── helpSupportModal.js
    │       ├── contentLeftPanel.js
    │       ├── confirmModal.js
    │       └── BudgetModal.js
    ├── models/              # Data models (MSSQL queries)
    ├── lib/                 # Core libraries
    └── utils/               # Utilities, hooks, constants
```

---

## Routing

The application uses Next.js 16's App Router with a merged Express server.

### Route Hierarchy

```
/                              -> Landing page (redirects to /dashboard or /login)
/login                         -> Public route, login form
/signup                        -> Public route, account request form
/forgot-password               -> Public route, 3-step password reset
/OTP                           -> Public route, OTP verification
/(main)/                       -> Protected group (wrapped with RouteGuard)
  ├── layout.js                -> Applies RouteGuard to all routes
  ├── dashboard/
  │   ├── page.js              -> Admin dashboard with analytics
  │   └── procurement/
  │       └── page.js          -> Procurement dashboard
  ├── user-setup/
  │   ├── user-approval/
  │   │   └── page.js          -> Pending account approval (MIS only)
  │   ├── user-accounts/
  │   │   └── page.js          -> User account management (MIS only)
  │   └── user-access/
  │       └── page.js          -> Module access management (MIS only)
  ├── user-profile/
  │   ├── page.js              -> View/edit user profile
  │   └── _actions/
  │       └── index.js         -> Profile update server actions
  ├── procurement/
  │   ├── purchase-request/
  │   │   └── page.js          -> Create, list, track purchase requests
  │   ├── purchase-order/
  │   │   └── page.js          -> Purchase order management
  │   ├── canvassing/
  │   │   ├── page.js          -> Supplier canvassing
  │   │   ├── _components/
  │   │   │   ├── CreateCanvassingModal.js
  │   │   │   ├── EditCanvassingModal.js
  │   │   │   └── CanvassingDetailsModal.js
  │   │   └── _actions/
  │   │       └── index.js
  │   ├── canvass-approval/
  │   │   └── page.js          -> Canvass approval workflow
  │   ├── receiving-entry/
  │   │   └── page.js          -> Goods receiving
  │   └── request-evaluation/
  │       ├── page.js          -> Request evaluation main page
  │       ├── _actions/
  │       │   └── index.js     # Evaluation action handlers
  │       └── _components/
  │           ├── RejectOptionModal.js
  │           ├── PurchaseRequestDetails.js
  │           └── PurchaseOrderDetails.js
  ├── non-po/
  │   └── requests/
  │       ├── index/
  │       │   └── index.js     # Non-PO request actions
  │       ├── _components/
  │       │   └── CreateRFPRequest.js
  │       └── page.js          # Non-PO / RFP request management
  ├── settings/
  │   ├── page.js              # Settings page
  │   └── activity-logs/
  │       └── page.js          # Activity audit logs
  └── system-utilities/
      ├── item-masterfile/
      │   └── page.js          # Item master maintenance
      ├── system-modules/
      │   └── page.js          # Module configuration
      ├── ticket/
      │   └── page.js          # Support ticket system
      └── admin-utilities/
          ├── page.js
          ├── receiving-utilities/
          │   └── page.js
          └── distribution-of-accounts/
              └── page.js
```

### Routing Mechanics

1. **Root layout** (`src/app/layout.js`): Wraps all pages with `AuthProvider`, `SessionTimeoutWrapper`, and `TitleUpdater`. No route protection at this level.

2. **Main layout** (`src/app/(main)/layout.js`): The `(main)` route group applies `RouteGuard` to all child routes. The RouteGuard:
   - Allows public routes (`/login`, `/signup`, `/forgot-password`, `/OTP`) to render without authentication
   - Redirects unauthenticated users to `/login`
   - For authenticated routes (`/dashboard`, `/user-profile`, `/settings`), requires login only
   - For other routes, makes a POST to `/api/check-access` with `pathname` and `employeeID` to verify module-level permissions
   - Shows an "Access Denied" page if the user lacks permission

3. **API Routes** (`src/app/api/`): App Router API routes handling:
   - `check-login-time`: Verifies if user logged in before 7 AM (for daily logout)
   - `check-access`: Checks if employee has module access via `UserAccess.checkAccess`
   - `user-access`: Fetches all accessible modules for navigation rendering
   - `user-settings`: Retrieves user's dark mode preference

4. **Server Actions** (`src/app/**/_actions/`): Next.js 16 server actions used for:
   - Login: `loginUser`, `logoutUser`
   - Signup: `createUser`, `checkEmailExists`, `checkEmployeeIDExists`, `sendConfirmationEmail`, `sendNotification`
   - OTP: `verifyOTP`, `resendOTP`
   - Forgot password: `sendPasswordResetOTP`, `verifyPasswordResetOTP`, `resendPasswordResetOTP`, `resetPassword`
   - Notifications: `getUserNotifications`, `getUnreadNotificationCount`, `markNotificationAsRead`

### Navigation Data Source

Module navigation is dynamically generated from the database, not hardcoded:
1. On login, the header nav bar fetches accessible modules via `/api/user-access?employeeID=XXX`
2. `UserAccess.getAccessibleModulesWithChildren` queries `SYSTEM.USERACCESS.1` joined with `SETTINGS.PARENTMODULE.1` and `SETTINGS.CHILDMODULE1.1`
3. Modules are grouped into parent dropdowns with child links
4. Icons are resolved dynamically via `getIconById(module.icon)` from `src/utils/iconConstants.js` (60+ icon definitions)

---

## Core Architecture

### Custom Server (`server.js`)

The application uses a merged Next.js + Express + Socket.IO server rather than Next.js's default server:

```js
// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Socket.IO setup with CORS wildcard
  const io = new Server(httpServer, { cors: { origin: "*" } });
  io.on("connection", (socket) => {
    socket.on("join", (room) => { socket.join(room); });
    socket.on("disconnect", () => { /* ... */ });
  });

  // Make io globally accessible
  global.io = io;

  // Let Next.js handle all routes
  server.use((req, res) => handle(req, res));
  httpServer.listen(PORT, () => { /* ... */ });
});
```

**Scripts:**
```json
{
  "dev": "nodemon server.js",
  "build": "next build",
  "start": "NODE_ENV=production node server.js"
}
```

### Database Layer (`src/lib/db.js`)

Uses `mssql` package with connection pooling. Two database contexts are used:

- **`DB_NAME=GDB`** - System tables (`SYSTEM.USERACCOUNT.1`, `SYSTEM.USERACCESS.1`, `SYSTEM.NOTIFICATION.1`, `SYSTEM.OTPHISTORY.1`, `SETTINGS.PARENTMODULE.1`, `SETTINGS.CHILDMODULE1.1`, etc.)
- **`DB_SFC=SFC`** - Procurement tables (`PURCHASE.REQUESTHEADER.1`, `PURCHASE.REQUESTDETAILS.1`, `PURCHASE.ORDERHEADER.1`, `PURCHASE.ORDERDETAILS.1`, `PURCHASE.QUOTATIONHEADER.1`, `PURCHASE.QUOTATIONDETAILS.1`, `PURCHASE.RECEIVEHEADER.1`, `PURCHASE.RECEIVEDETAILS.1`, `ACTIVITY.LOGS.1`, `ITEM.MASTERFILE.1`, `ACCOUNT.CODES.1`, `BUDGET.LINEITEMS.1`, etc.)

The `connectToDatabase(dbName)` function maintains a `Map` of connection pools, keyed by database name, to reuse connections across requests.

### Real-time Communication

Two parallel real-time systems exist:

1. **Socket.IO** (`src/lib/socketBroadcast.js` + `src/app/_actions/socket.js`):
   - Server-side broadcasts via `global.io`
   - Client-side via `src/utils/socket.js` (`initSocket`, `joinRoom`, `emitEvent`)
   - React hook: `useSocketMultiple(room, events)`
   - Rooms: `request-evaluation-broadcast`, `user-approval-broadcast`, `user-account-broadcast`, `user-profile-broadcast`, `dashboard-broadcast`, `user-{userName}`

2. **Pusher** (`src/lib/pusher.js` + `src/app/_actions/pusher1.js`):
   - Server: `pusherServer` instance
   - Client: `pusherClient` instance
   - React hook: `usePusher`, `usePusherMultiple`
   - Channels match Socket.IO room naming

Both are used in different parts of the application for notifications and live updates.

---

## Authentication & Authorization

### Authentication Flow

1. **Login** (`src/app/login/page.js` + `src/app/login/_actions/index.js`):
   - User enters email + password
   - `loginUser` action checks rate limit (3 attempts per 5 minutes)
   - `LoginModel.authenticate` queries `SYSTEM.USERACCOUNT.1`, compares bcrypt password hash
   - Checks `IS_APPROVED` status - only approved users can log in
   - Retrieves user details and checks `NEXT_OTP` via `UserProfile.shouldRequireOTP()`
   - If OTP required: generates 6-digit OTP, saves to `SYSTEM.OTPHISTORY.1`, sends via email
   - If OTP not required: creates session token (base64-encoded user JSON) and logs in directly

2. **OTP Verification** (`src/app/OTP/page.js` + `src/app/OTP/_actions/index.js`):
   - 6-digit numeric code with 10-minute expiration
   - `verifyOTP` checks `SYSTEM.OTPHISTORY.1` for matching unverified, non-expired OTP
   - On success: sets `NEXT_OTP` to 7 days from now, updates `LOGGEDIN` timestamp, creates token
   - `resendOTP` invalidates old OTPs and sends new one
   - User data stored client-side in `localStorage` under key `'user'`

3. **Session Management** (`src/utils/authContext.js`):
   - `AuthProvider` context with `user`, `loading`, `login`, `logout`, `isAdmin`, `darkMode`
   - User persisted in localStorage
   - Admin check: `user.department.toUpperCase() === "MIS"`
   - Dark mode persisted per-user in database (`IS_DARK_MODE` column) and localStorage

### Daily Session Timeout

- Users who logged in before 7 AM are force-logout at 7 AM daily
- Implemented via `src/utils/sessionTimeout.js` and `src/hooks/useSessionTimeout.js`
- `SessionTimeoutWrapper` component wraps the entire app
- `useSessionTimeout` hook checks login time via `/api/check-login-time` API, then sets a timer for 7 AM
- On logout, clears localStorage entries (`user`, `lastDailyLogoutDate`)

### Authorization / Access Control

1. **RouteGuard** (`src/utils/routeGuard.js`):
   - Applied in `src/app/(main)/layout.js` to protect all `/main` routes
   - Public routes: `/login`, `/signup`, `/forgot-password`, `/OTP`
   - Authenticated routes: `/dashboard`, `/user-profile`, `/settings`
   - Checks module-level access via `/api/check-access` API (queries `USERACCESS.checkAccess`)

2. **ProtectedRoute** (`src/utils/protectedRoute.js`):
   - Simpler wrapper for routes requiring authentication only

3. **AdminOnly** (`src/utils/adminOnly.js`):
   - Component that renders children only if `isAdmin()` returns true

4. **UserAccess Model** (`src/models/UserAccess.js`):
   - Manages `SYSTEM.USERACCESS.1` table
   - `checkAccess(employeeID, module)` - checks if user has access to a module path
   - `getAccessibleModulesWithChildren(employeeID)` - fetches parent + child modules with icons
   - `grantAccessWithChildren` / `revokeAccessWithChildren` - transactional operations
   - Also manages `SETTINGS.CONFIRMBY.1`, `SETTINGS.APPROVEBY.1`, `SETTINGS.AUTHORIZATION.1` tables

### Rate Limiting

`src/utils/rateLimiter.js` limits login attempts:
- 3 attempts per 5-minute window per email
- In-memory `Map` (no database persistence)
- Returns minutes remaining for retry

---

## Key Features

### 1. Purchase Request Management (`src/models/PurchaseRequest.js`)

- **DB Context**: `SFC` (`PURCHASE.REQUESTHEADER.1`, `PURCHASE.REQUESTDETAILS.1`)
- Status workflow: `FOR SUBMISSION` → `FOR CONFIRMATION` → `FOR REQUEST APPROVAL` → `FOR PURCHASING LEAD TIME` → `SERVED`/`COMPLETED`
- Reference numbers: `OPR-{n}` generated from max existing number
- Item numbers: auto-generated from first 3 letters of description words
- Transaction safety: all create/update/cancel operations use MSSQL transactions with commit/rollback
- Cancellation cascades: cancels related PO details and canvass records
- Role-based: non-admin users only see their own requests

### 2. Purchase Order Management (`src/models/PurchaseOrder.js`)

- **DB Context**: `SFC` (`PURCHASE.ORDERHEADER.1`, `PURCHASE.ORDERDETAILS.1`)
- Status tracking: `POSTSTATUS`, `PO_STATUS`
- Integrates with request evaluation and receiving entry
- Vendor management with confirmation officers

### 3. Request Evaluation (`src/models/RequestEvaluation.js`)

- **DB Context**: `SFC`
- Core evaluation workflow with status tracking
- Table existence checks before queries
- Integration with notifications, email, and Socket.IO broadcasts
- Status breakdown and trend analytics

### 4. Canvassing & Approval (`src/models/Canvassing.js`, `src/models/CanvassApproval.js`)

- Supplier quotation management
- Canvass comparison and approval workflows
- Real-time updates via Socket.IO (`canvass-approval-broadcast` room)

### 5. Receiving Entry (`src/models/ReceivingEntry.js`)

- Goods receipt tracking
- Integration with PO and request status updates

### 6. Non-PO Requests (`src/models/NOPORFP.js`)

- Manages requests without purchase orders

### 7. Ticket System (`src/models/Ticket.js`)

- **DB Context**: `GDB` (`SYSTEM.TICKET.1`)
- Support ticket creation, updating, deletion
- Admin sees all tickets; non-admin users see only their own
- Stats by status (Open, In Progress, Resolved, Closed)

### 8. Budget Management (`src/models/Budget.js`)

- Budget code and line item tracking
- Integration with purchase requests and POs

### 9. Item Masterfile (`src/models/ItemMasterfile.js`)

- Item code, description, unit of measure maintenance
- **DB Context**: `SFC` (`ITEM.MASTERFILE.1`)

### 10. Dashboard & Analytics (`src/models/Dashboard.js`)

- **DB Context**: Both `GDB` and `SFC`
- Admin dashboard: total users, active users, pending requests, 24h requests, recent logins, activity logs
- User dashboard: personal request stats, evaluation stats, trend charts
- Procurement performance: average completion time, on-time delivery rate, early requests, time-to-serve, total spend
- Efficiency trends over months with sparkline data

### 11. User Setup & Approval (`src/models/AccountApproval.js`, `src/models/DistributionOfAccounts.js`)

- Pending account approval workflow
- MIS department receives notifications for new signups
- User access module assignment with parent/child module hierarchy

### System Utilities

- **Modules** (`src/models/Module.js`): Parent/child module management (`SETTINGS.PARENTMODULE.1`, `SETTINGS.CHILDMODULE1.1`)
- **Admin Utilities**: Various administrative functions
- **Activity Logs** (`src/models/ActivityLogs.js`): Audit trail with Socket.IO broadcast to dashboard

---

## Environment Configuration

The `.env.local` file is committed to the repository and contains live AWS RDS credentials:

| Variable | Value | Description |
|---|---|---|
| `DB_HOST` | sfcserver.c4hymnwj7adb.ap-southeast-1.rds.amazonaws.com | AWS RDS MSSQL instance |
| `DB_USER` | carlo | Database user |
| `DB_PASSWORD` | Sfcsql1425 | Database password |
| `DB_NAME` | GDB | System database (users, notifications, OTP, modules) |
| `DB_SFC` | SFC | Procurement database (PRs, POs, canvassing, activity logs) |
| `SENDGRID_API_KEY` | SG.DmjDOPyx... | SendGrid API key (in config but not used in code) |
| `SENDGRID_FROM_EMAIL` | j.valencia@santehfeeds.com | SendGrid sender email |
| `GMAIL_USER` | jcvbrowsing@gmail.com | Gmail SMTP user |
| `GMAIL_APP_PASSWORD` | qngh jzuu mojw kgry | Gmail 16-char app password |
| `PUSHER_APP_ID` | 2078726 | Pusher app ID |
| `PUSHER_APP_KEY` | 020ae9f7b244cb4fbd35 | Pusher app key |
| `PUSHER_APP_SECRET` | d2ddbfb4ec67c016fa11 | Pusher app secret |
| `PUSHER_CLUSTER` | ap1 | Pusher cluster |
| `NEXT_PUBLIC_PUSHER_APP_KEY` | 020ae9f7b244cb4fbd35 | Public Pusher key (client-side) |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | ap1 | Public Pusher cluster (client-side) |
| `GMAIL_SENDER_NAME` | Santeh MIS Team | Email sender name |
| `NEXT_PUBLIC_SOCKET_URL` | (not set in .env) | Socket.IO client URL (referenced in socket.js but not configured) |

**Security Note**: The `.env.local` file contains live credentials and is committed to the repository. This is a significant security risk. The SendGrid API key is configured but the application uses Gmail SMTP via Nodemailer instead.

---

## Database Schema Overview

### GDB Database (System)

| Table | Description |
|---|---|
| `SYSTEM.USERACCOUNT.1` | User accounts with email, password hash, department, approval status, OTP settings |
| `SYSTEM.USERACCESS.1` | Module access permissions per employee |
| `SYSTEM.NOTIFICATION.1` | System notifications for users |
| `SYSTEM.OTPHISTORY.1` | OTP codes with creation/verification timestamps |
| `SYSTEM.TICKET.1` | Support tickets |
| `SETTINGS.PARENTMODULE.1` | Parent navigation modules |
| `SETTINGS.CHILDMODULE1.1` | Child navigation modules |
| `SETTINGS.CONFIRMBY.1` | Purchase order confirmation officers |
| `SETTINGS.APPROVEBY.1` | Request approvers by location |
| `SETTINGS.AUTHORIZATION.1` | Authorization rules |

### SFC Database (Procurement)

| Table | Description |
|---|---|
| `PURCHASE.REQUESTHEADER.1` | Purchase request headers |
| `PURCHASE.REQUESTDETAILS.1` | Purchase request line items |
| `PURCHASE.ORDERHEADER.1` | Purchase order headers |
| `PURCHASE.ORDERDETAILS.1` | Purchase order line items |
| `PURCHASE.QUOTATIONHEADER.1` | Canvass/quotation headers |
| `PURCHASE.QUOTATIONDETAILS.1` | Canvass/quotation line items |
| `PURCHASE.RECEIVEHEADER.1` | Goods receipt headers |
| `PURCHASE.RECEIVEDETAILS.1` | Goods receipt line items |
| `ACTIVITY.LOGS.1` | Activity audit trail |
| `ITEM.MASTERFILE.1` | Item master data |
| `ACCOUNT.CODES.1` | Account codes |
| `BUDGET.LINEITEMS.1` | Budget line items |
| `BUDGET.HEADER.1` | Budget headers |

---

## Components

### Layout & Navigation

- **`src/app/layout.js`**: Root layout wrapping all pages with `AuthProvider`, `SessionTimeoutWrapper`, and `TitleUpdater`
- **`src/app/(main)/layout.js`**: Protected layout applying `RouteGuard` to all authenticated routes
- **`src/app/_components/headerNavBar.js`**: Main navigation bar with:
  - Dynamic navigation links based on user's accessible modules
  - Dropdown menus for parent modules with children
  - Notification bell with unread count and real-time Socket.IO updates
  - User profile dropdown (profile, settings, help & support, sign out)
  - Mobile hamburger menu
  - Dark mode support
  - Skeleton loading states

### Shared Components

- **`loader.js`**: Full-screen Lottie animation loader (overlay with backdrop blur)
- **`loaderButton.js`**: Inline loading button spinner
- **`skeletonLoader.js`**: Skeleton placeholder for loading states
- **`card.js`**: Reusable card container
- **`titleUpdater.js`**: Updates document title dynamically
- **`sessionTimeoutWrapper.js`**: Initializes session timeout on app load

### Modals & Forms

- **`successModal.js`**: Success confirmation dialog
- **`confirmModal.js`**: Generic confirmation dialog
- **`rejectRequestModal.js`**: Request rejection with reason selection
- **`helpSupportModal.js`**: Help and support contact modal
- **`BudgetModal.js`**: Budget selection modal
- **`SearchModal.js`**: Search functionality
- **`sideNotchOpenLeftPanel.js`**: Side panel component
- **`contentLeftPanel.js`**: Content panel component

---

## Utilities

- **`src/utils/authContext.js`**: Auth context provider with user state, dark mode, admin check
- **`src/utils/routeGuard.js`**: Route protection with module-level access checks
- **`src/utils/protectedRoute.js`**: Simple authentication wrapper
- **`src/utils/adminOnly.js`**: Admin-only component wrapper
- **`src/utils/sessionTimeout.js`**: Daily 7 AM logout configuration and helpers
- **`src/utils/rateLimiter.js`**: Login attempt rate limiting (3/5 min)
- **`src/utils/emailService.js`**: Nodemailer Gmail SMTP transporter with HTML template support
- **`src/utils/socket.js`**: Socket.IO client initialization and room joining
- **`src/utils/statusColor.js`**: Status-to-color mapping for UI elements
- **`src/utils/passwordRequirements.js`**: Password validation with strength scoring
- **`src/utils/generatePassword.js`**: Auto-generated password generation
- **`src/utils/validateEmail.js`**: Email format validation
- **`src/utils/calculateAge.js`**: Age calculation utility
- **`src/utils/jobConstants.js`**: Job titles, departments, and levels constants
- **`src/utils/locationConstants.js`**: Location options (Head Office, Calumpit Plant)
- **`src/utils/nameChangeUtils.js`**: Name change related utilities
- **`src/utils/iconConstants.js`**: 60+ icon definitions mapped by ID for dynamic navigation
- **`src/utils/useClickOutsideClose.js`**: Click-outside detection hook
- **`src/lib/utils.js`**: `cn()` className utility (class-variance merging)

---

## Hooks

- **`useSessionTimeout`**: Manages daily 7 AM logout; checks login time via API
- **`useSocketMultiple`**: Subscribes to multiple Socket.IO events on a room
- **`usePusher`**: Subscribes to a Pusher channel/event
- **`usePusherMultiple`**: Subscribes to multiple Pusher events on a channel

---

## Configuration Files

- **`next.config.mjs`**: React Compiler enabled, allowed dev origins for `192.168.10.85`
- **`next.config.cjs`**: Older config with allowed dev origins
- **`tailwind.config.mjs`**: Tailwind CSS v4 configuration
- **`postcss.config.mjs`**: PostCSS with Tailwind plugin
- **`eslint.config.mjs`**: ESLint 9 flat config
- **`jsconfig.json`**: Path alias `@/*` → `./src/*`
- **`.env.local`**: Environment variables (committed - security concern)

---

---