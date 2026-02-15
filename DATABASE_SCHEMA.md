# AEGIS+ Database Schema

Complete Firestore database schema documentation for the AEGIS+ platform.

## 📊 Collections Overview

The AEGIS+ platform uses the following Firestore collections:

1. **users** - User profiles and authentication data
2. **grievances** - Grievance submissions and tracking
3. **grievanceRemarks** - Authority remarks on grievances
4. **courses** - Course information
5. **enrollments** - Student course enrollments
6. **resources** - Academic resources and materials
7. **opportunities** - Internship and research opportunities
8. **applications** - Student applications to opportunities
9. **tasks** - Scholar's Ledger personal tasks
10. **notifications** - User notifications
11. **auditLogs** - System activity logs

---

## 1. Users Collection

**Collection Path**: `/users/{userId}`

Stores user profile information and role assignments.

### Schema

```typescript
{
  uid: string;              // Firebase Auth UID (document ID)
  email: string;            // Institutional email
  role: 'student' | 'faculty' | 'authority' | 'admin';
  profile: {
    name: string;
    department?: string;
    year?: number;          // For students
    enrollmentId?: string;  // For students
    designation?: string;   // For faculty/authority
    phone?: string;
    avatar?: string;        // URL to profile picture
  };
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isActive: boolean;        // Account status
  lastLogin?: Timestamp;
}
```

### Indexes

- `email` (ascending)
- `role` (ascending)
- `createdAt` (descending)

---

## 2. Grievances Collection

**Collection Path**: `/grievances/{grievanceId}`

Stores all grievance submissions.

### Schema

```typescript
{
  grievanceId: string;      // Auto-generated unique ID
  studentId: string;        // Reference to user UID
  category: 'Infrastructure' | 'Academic' | 'Administrative' | 
            'Hostel' | 'Transport' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  location: string;         // Location of issue
  description: string;      // Detailed description
  photoUrl?: string;        // Cloud Storage URL (optional)
  isAnonymous: boolean;     // Anonymous submission flag
  status: 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved';
  assignedTo?: string;      // Authority UID (if assigned)
  department?: string;      // Assigned department
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
  timeline: Array<{
    status: string;
    timestamp: Timestamp;
    updatedBy?: string;     // Authority UID
    remark?: string;
  }>;
}
```

### Indexes

- Composite: `studentId` (asc) + `createdAt` (desc)
- Composite: `status` (asc) + `createdAt` (desc)
- Composite: `category` (asc) + `status` (asc)
- Composite: `assignedTo` (asc) + `status` (asc)

---

## 3. Grievance Remarks Collection

**Collection Path**: `/grievanceRemarks/{remarkId}`

Stores detailed remarks from authorities.

### Schema

```typescript
{
  remarkId: string;         // Auto-generated
  grievanceId: string;      // Reference to grievance
  authorityId: string;      // Authority who added remark
  remark: string;           // Detailed remark
  previousStatus: string;
  newStatus: string;
  timestamp: Timestamp;
  attachments?: string[];   // URLs to supporting documents
}
```

### Indexes

- `grievanceId` (ascending)
- `timestamp` (descending)

---

## 4. Courses Collection

**Collection Path**: `/courses/{courseId}`

Stores course catalog information.

### Schema

```typescript
{
  courseId: string;         // Unique course ID
  courseCode: string;       // e.g., "CS101"
  courseName: string;       // e.g., "Introduction to Programming"
  department: string;
  credits: number;
  semester: number;         // 1-8
  faculty: string[];        // Array of faculty UIDs
  description?: string;
  syllabus?: string;        // Cloud Storage URL
  prerequisites?: string[]; // Array of course codes
  isActive: boolean;
  createdAt: Timestamp;
}
```

### Indexes

- `courseCode` (ascending)
- `department` (ascending)
- `semester` (ascending)

---

## 5. Enrollments Collection

**Collection Path**: `/enrollments/{enrollmentId}`

Tracks student course enrollments.

### Schema

```typescript
{
  enrollmentId: string;     // Auto-generated
  studentId: string;        // User UID
  courseId: string;         // Reference to course
  semester: string;         // e.g., "Fall 2024"
  status: 'enrolled' | 'completed' | 'dropped';
  grade?: string;           // Final grade (if completed)
  attendance?: number;      // Percentage
  enrolledAt: Timestamp;
  completedAt?: Timestamp;
}
```

### Indexes

- Composite: `studentId` (asc) + `semester` (asc)
- Composite: `courseId` (asc) + `status` (asc)

---

## 6. Resources Collection

**Collection Path**: `/resources/{resourceId}`

Stores academic resources and materials.

### Schema

```typescript
{
  resourceId: string;       // Auto-generated
  courseId: string;         // Reference to course
  title: string;
  description?: string;
  fileUrl: string;          // Cloud Storage URL
  fileType: string;         // MIME type
  fileSize: number;         // Bytes
  resourceType: 'Notes' | 'Slides' | 'Paper' | 'Assignment' | 'Other';
  uploadedBy: string;       // Faculty UID
  tags: string[];           // Searchable tags
  semester?: string;
  downloadCount: number;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### Indexes

- Composite: `courseId` (asc) + `createdAt` (desc)
- Composite: `resourceType` (asc) + `courseId` (asc)
- `uploadedBy` (ascending)
- Array: `tags`

---

## 7. Opportunities Collection

**Collection Path**: `/opportunities/{opportunityId}`

Stores internship and research opportunities.

### Schema

```typescript
{
  opportunityId: string;    // Auto-generated
  facultyId: string;        // Faculty who posted
  title: string;
  description: string;
  type: 'Internship' | 'Research' | 'Project';
  department: string;
  requiredSkills: string[]; // Array of skills
  duration: string;         // e.g., "3 months"
  stipend?: string;         // e.g., "5000/month" or "Unpaid"
  location: string;         // "On-campus" or specific location
  applicationDeadline: Timestamp;
  maxApplicants?: number;
  status: 'open' | 'closed' | 'filled';
  applicantCount: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  closedAt?: Timestamp;
}
```

### Indexes

- Composite: `status` (asc) + `createdAt` (desc)
- Composite: `facultyId` (asc) + `status` (asc)
- Composite: `department` (asc) + `status` (asc)
- `applicationDeadline` (ascending)

---

## 8. Applications Collection

**Collection Path**: `/applications/{applicationId}`

Tracks student applications to opportunities.

### Schema

```typescript
{
  applicationId: string;    // Auto-generated
  opportunityId: string;    // Reference to opportunity
  studentId: string;        // Applicant UID
  resumeUrl?: string;       // Cloud Storage URL
  portfolioUrl?: string;    // External URL or Cloud Storage
  coverLetter?: string;     // Application text
  status: 'Submitted' | 'Under Review' | 'Shortlisted' | 
          'Accepted' | 'Rejected';
  appliedAt: Timestamp;
  lastUpdated: Timestamp;
  reviewedBy?: string;      // Faculty UID
  reviewNotes?: string;     // Internal notes
}
```

### Indexes

- Composite: `studentId` (asc) + `appliedAt` (desc)
- Composite: `opportunityId` (asc) + `status` (asc)
- Composite: `status` (asc) + `appliedAt` (desc)

---

## 9. Tasks Collection (Scholar's Ledger)

**Collection Path**: `/tasks/{taskId}`

Personal task management for students.

### Schema

```typescript
{
  taskId: string;           // Auto-generated
  studentId: string;        // Owner UID
  title: string;
  description?: string;
  dueDate?: Timestamp;
  priority: 'Low' | 'Medium' | 'High';
  category: 'Assignment' | 'Project' | 'Exam Prep' | 'Goal' | 'Other';
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;         // 0-100
  courseId?: string;        // Optional link to course
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  completedAt?: Timestamp;
}
```

### Indexes

- Composite: `studentId` (asc) + `status` (asc) + `dueDate` (asc)
- Composite: `studentId` (asc) + `category` (asc)

---

## 10. Notifications Collection

**Collection Path**: `/notifications/{notificationId}`

User notifications and alerts.

### Schema

```typescript
{
  notificationId: string;   // Auto-generated
  userId: string;           // Recipient UID
  type: 'grievance_update' | 'application_update' | 
        'new_resource' | 'new_opportunity' | 'system';
  title: string;
  message: string;
  relatedId?: string;       // ID of related entity
  relatedType?: string;     // Type of related entity
  isRead: boolean;
  createdAt: Timestamp;
  readAt?: Timestamp;
}
```

### Indexes

- Composite: `userId` (asc) + `isRead` (asc) + `createdAt` (desc)

---

## 11. Audit Logs Collection

**Collection Path**: `/auditLogs/{logId}`

System activity and security logs.

### Schema

```typescript
{
  logId: string;            // Auto-generated
  userId: string;           // Actor UID
  action: string;           // e.g., "CREATE_GRIEVANCE", "UPDATE_STATUS"
  resource: string;         // e.g., "grievances", "users"
  resourceId?: string;      // ID of affected resource
  details?: object;         // Additional context
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
  status: 'success' | 'failure';
  errorMessage?: string;
}
```

### Indexes

- Composite: `userId` (asc) + `timestamp` (desc)
- Composite: `resource` (asc) + `timestamp` (desc)
- `timestamp` (descending)

---

## 🔍 Query Examples

### Get Student's Grievances
```javascript
db.collection('grievances')
  .where('studentId', '==', userId)
  .orderBy('createdAt', 'desc')
  .get();
```

### Get Active Opportunities
```javascript
db.collection('opportunities')
  .where('status', '==', 'open')
  .where('applicationDeadline', '>', new Date())
  .orderBy('applicationDeadline', 'asc')
  .get();
```

### Get Course Resources
```javascript
db.collection('resources')
  .where('courseId', '==', courseId)
  .orderBy('createdAt', 'desc')
  .get();
```

### Get Pending Tasks
```javascript
db.collection('tasks')
  .where('studentId', '==', userId)
  .where('status', '!=', 'completed')
  .orderBy('dueDate', 'asc')
  .get();
```

---

## 📈 Data Retention Policy

- **Audit Logs**: Retained for 1 year
- **Notifications**: Retained for 90 days
- **Completed Tasks**: Retained for 6 months
- **Resolved Grievances**: Retained indefinitely for records
- **Closed Opportunities**: Retained for 1 year
- **User Data**: Retained until account deletion
