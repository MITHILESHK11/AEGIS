# AEGIS+ System Architecture

## 🏛️ Overview

AEGIS+ is a unified, role-driven campus digital operating system. It relies on a service-oriented architecture where a central backend API serves multiple frontend interfaces (web dashboards) tailored to specific user roles.

## 🏗️ Technical Stack

- **Frontend**: Next.js 16 (React 19), TailwindCSS, Radix UI, Framer Motion
- **Backend**: Node.js, Express.js (v5)
- **Database**: Google Cloud Firestore (NoSQL)
- **Storage**: Google Cloud Storage
- **Authentication**: Firebase Authentication
- **Deployment target**: Google Cloud Run (Containerized)

## 🧩 System Components

### 1. Frontend (`/frontend`)
The frontend is a monolithic Next.js application that renders different views based on the authenticated user's role.
- **Client-Side Rendering (CSR)** for interactive dashboards.
- **Server-Side Rendering (SSR)** for SEO-critical or public pages (if any).
- **Middleware**: Uses Next.js middleware for route protection and role-based redirects.

### 2. Backend API (`/backend`)
The backend is a RESTful API built with Express.js.
- **Controllers**: Handle request logic and response formatting.
- **Services**: Contain business logic and interaction with Firebase/Firestore.
- **Middleware**: 
  - `auth`: Verifies Firebase ID Tokens.
  - `rbac`: Enforces Role-Based Access Control.

### 3. Database Layer (Firestore)
Data is stored in structured collections.

#### Collections Schema

**Users**
- `uid` (string): Firebase Auth ID
- `email` (string): Institutional email
- `role` (enum): 'student' | 'faculty' | 'authority' | 'admin'
- `profile`: { name, ... }

**Grievances**
- `grievanceId` (string)
- `studentId` (string)
- `category` (string): Infrastructure, Academic, etc.
- `priority` (string): Low, Medium, High
- `location` (string)
- `description` (string)
- `status` (string): Submit -> Review -> In Progress -> Resolved
- `timeline` (array): History of status changes

**Courses**
- `courseId` (string)
- `courseName` (string)
- `credits` (number)
- `faculty` (string)

**Resources**
- `resourceId` (string)
- `courseId` (string)
- `fileUrl` (string)
- `uploadedBy` (string)

**Opportunities**
- `opportunityId` (string)
- `facultyId` (string)
- `description` (string)
- `status` (string)

## 🔐 Security & Access Control

### Authentication
- All requests must bear a valid Firebase ID Token in the `Authorization` header (`Bearer <token>`).
- Tokens are verified using `firebase-admin` SDK on the backend.

### Authorization (RBAC)
Routes are protected by roles:
- **Student**: Can submit grievances, view own data, apply to opportunities.
- **Faculty**: Can upload resources, post opportunities.
- **Authority**: Can manage grievance status.
- **Admin**: Full system access, user management.

## 🔄 Data Flow Protocol
1. **Request**: Frontend requests `GET /api/grievance/list` with Auth Header.
2. **Auth Layer**: Middleware verifies token => attaches `req.user`.
3. **RBAC Layer**: Middleware checks if `req.user.role` is allowed.
4. **Controller**: Calls `grievanceService.getGrievances(userId, role)`.
5. **Service**: Queries Firestore, filtering data based on role (e.g., Student sees own, Authority sees all).
6. **Response**: JSON data returned to frontend.
