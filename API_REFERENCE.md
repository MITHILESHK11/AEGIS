# AEGIS+ API Reference

Base URL: `/api` (e.g., `http://localhost:5000/api`)

All protected endpoints require a valid Firebase ID Token in the `Authorization` header:
`Authorization: Bearer <your-firebase-token>`

## 🔐 Authentication (`/auth`)

### Register User
Register a new user in the system.
- **Endpoint**: `POST /auth/register`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "email": "user@institute.edu",
    "role": "student" // 'student' | 'faculty' | 'authority'
    // Additional profile fields
  }
  ```

### Get Profile
Get the profile of the currently authenticated user.
- **Endpoint**: `GET /auth/profile`
- **Headers**: `Authorization: Bearer <token>`

## 📢 Grievances (`/grievance`)

### Submit Grievance
Submit a new grievance (Student only).
- **Endpoint**: `POST /grievance/submit`
- **Role**: `student`
- **Body**:
  ```json
  {
    "category": "Infrastructure",
    "priority": "High",
    "location": "Library",
    "description": "Broken AC",
    "isAnonymous": false
  }
  ```

### List Grievances
Get a list of grievances.
- **Endpoint**: `GET /grievance/list`
- **Query Params**:
  - `category`: Filter by category
  - `status`: Filter by status
  - `priority`: Filter by priority
- **Behavior**:
  - **Student**: Returns only their own grievances.
  - **Authority**: Returns all grievances assigned to them or their department.

### Update Status
Update the status of a grievance (Authority only).
- **Endpoint**: `PUT /grievance/:grievanceId/status`
- **Role**: `authority`
- **Body**:
  ```json
  {
    "status": "In Progress", // 'Review' | 'In Progress' | 'Resolved'
    "remark": "Maintenance team notified."
  }
  ```

### Get Stats
Get grievance analytics (Authority/Admin only).
- **Endpoint**: `GET /grievance/stats`
- **Role**: `authority`, `admin`

## 📚 Academic Resources (`/academic`)

### Upload Resource
Upload a new academic resource (Faculty only).
- **Endpoint**: `POST /academic/upload`
- **Role**: `faculty`, `admin`
- **Body**:
  ```json
  {
    "title": "Lecture 1 Notes",
    "courseId": "CS101",
    "description": "Introduction to Algorithms",
    "fileUrl": "https://storage.googleapis.com/...",
    "type": "Notes",
    "tags": ["week1", "basics"]
  }
  ```

### List Resources
List academic resources.
- **Endpoint**: `GET /academic/list`
- **Query Params**:
  - `courseId`: Filter by course
  - `type`: Filter by resource type
  - `tag`: Filter by tag

### Delete Resource
Delete a resource.
- **Endpoint**: `DELETE /academic/delete/:resourceId`
- **Role**: `faculty`, `admin`

## 💼 Opportunities (`/opportunity`)

### Post Opportunity
Create a new opportunity (Faculty only).
- **Endpoint**: `POST /opportunity/post`
- **Role**: `faculty`, `admin`
- **Body**:
  ```json
  {
    "title": "Research Assistant",
    "description": "ML Project",
    "requiredSkills": ["Python", "PyTorch"],
    "duration": "3 months",
    "stipend": "5000/month",
    "deadline": "2023-12-31"
  }
  ```

### List Opportunities
List all active opportunities.
- **Endpoint**: `GET /opportunity/list`
- **Query Params**:
  - `status`: 'open' | 'closed'
  - `facultyId`: Filter by faculty

### Apply
Apply for an opportunity (Student only).
- **Endpoint**: `POST /opportunity/:opportunityId/apply`
- **Role**: `student`
- **Body**:
  ```json
  {
    "resumeUrl": "https://...",
    "coverLetter": "I am interested..."
  }
  ```

### My Applications
View applications submitted by the current student.
- **Endpoint**: `GET /opportunity/my-applications`
- **Role**: `student`

### View Applications (Faculty)
View applications received for posted opportunities.
- **Endpoint**: `GET /opportunity/applications`
- **Role**: `faculty`, `admin`

### Review Application
Update application status.
- **Endpoint**: `PATCH /opportunity/application/:appId`
- **Role**: `faculty`, `admin`
- **Body**:
  ```json
  {
    "status": "Shortlisted" // 'Shortlisted' | 'Rejected' | 'Accepted'
  }
  ```
