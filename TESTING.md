# AEGIS+ Testing Guide

Comprehensive testing documentation for the AEGIS+ platform.

## 🧪 Testing Strategy

AEGIS+ follows a multi-layered testing approach:

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test API endpoints and service interactions
3. **End-to-End Tests**: Test complete user workflows
4. **Manual Testing**: Role-based acceptance testing

---

## 🛠️ Setup Testing Environment

### Backend Testing Setup

1. **Install Testing Dependencies**:
   ```bash
   cd backend
   npm install --save-dev jest supertest
   ```

2. **Create Test Configuration**:
   Create `backend/jest.config.js`:
   ```javascript
   module.exports = {
     testEnvironment: 'node',
     coverageDirectory: 'coverage',
     collectCoverageFrom: [
       'src/**/*.js',
       '!src/index.js'
     ],
     testMatch: [
       '**/__tests__/**/*.test.js'
     ],
     setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
   };
   ```

3. **Update package.json**:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage"
     }
   }
   ```

### Frontend Testing Setup

1. **Install Testing Dependencies**:
   ```bash
   cd frontend
   npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```

2. **Create Test Configuration**:
   Next.js includes Jest support. Update `jest.config.js`:
   ```javascript
   const nextJest = require('next/jest');
   
   const createJestConfig = nextJest({
     dir: './',
   });
   
   const customJestConfig = {
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     testEnvironment: 'jest-environment-jsdom',
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/src/$1',
     },
   };
   
   module.exports = createJestConfig(customJestConfig);
   ```

---

## 📝 Backend Unit Tests

### Testing Services

Create `backend/tests/services/authService.test.js`:

```javascript
const { createUserProfile, getUserProfile } = require('../../src/services/authService');

// Mock Firebase Admin
jest.mock('../../src/config/firebase', () => ({
  admin: {
    firestore: {
      FieldValue: {
        serverTimestamp: jest.fn(() => new Date())
      }
    },
    auth: () => ({
      setCustomUserClaims: jest.fn()
    })
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => ({
          exists: false,
          data: jest.fn()
        })),
        set: jest.fn()
      }))
    }))
  }
}));

describe('AuthService', () => {
  describe('createUserProfile', () => {
    it('should create a new user profile', async () => {
      const uid = 'test-uid';
      const email = 'test@institute.edu';
      const role = 'student';
      
      const result = await createUserProfile(uid, email, role, {});
      
      expect(result).toHaveProperty('email', email);
      expect(result).toHaveProperty('role', role);
    });
  });
});
```

### Testing Controllers

Create `backend/tests/controllers/grievanceController.test.js`:

```javascript
const request = require('supertest');
const app = require('../../src/index');

describe('Grievance Controller', () => {
  let authToken;
  
  beforeAll(async () => {
    // Setup: Get auth token for testing
    // This would typically involve creating a test user
  });
  
  describe('POST /api/grievance/submit', () => {
    it('should submit a grievance successfully', async () => {
      const grievanceData = {
        category: 'Infrastructure',
        priority: 'High',
        location: 'Library',
        description: 'Broken AC',
        isAnonymous: false
      };
      
      const response = await request(app)
        .post('/api/grievance/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(grievanceData)
        .expect(201);
      
      expect(response.body).toHaveProperty('grievanceId');
      expect(response.body.category).toBe('Infrastructure');
    });
    
    it('should reject submission without auth token', async () => {
      const grievanceData = {
        category: 'Infrastructure',
        priority: 'High',
        location: 'Library',
        description: 'Broken AC'
      };
      
      await request(app)
        .post('/api/grievance/submit')
        .send(grievanceData)
        .expect(401);
    });
  });
});
```

### Testing Middleware

Create `backend/tests/middleware/rbac.test.js`:

```javascript
const checkRole = require('../../src/middleware/rbac');

describe('RBAC Middleware', () => {
  it('should allow access for authorized role', () => {
    const req = {
      user: { uid: 'test-uid', role: 'student' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    
    const middleware = checkRole(['student', 'faculty']);
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
  
  it('should deny access for unauthorized role', () => {
    const req = {
      user: { uid: 'test-uid', role: 'student' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();
    
    const middleware = checkRole(['admin']);
    middleware(req, res, next);
    
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
```

---

## ⚛️ Frontend Unit Tests

### Testing Components

Create `frontend/tests/components/GrievanceForm.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import GrievanceForm from '@/components/GrievanceForm';

describe('GrievanceForm', () => {
  it('renders all form fields', () => {
    render(<GrievanceForm />);
    
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });
  
  it('validates required fields', async () => {
    render(<GrievanceForm />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/description is required/i)).toBeInTheDocument();
  });
  
  it('submits form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<GrievanceForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'Infrastructure' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test grievance' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

### Testing Hooks

Create `frontend/tests/hooks/useAuth.test.tsx`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth Hook', () => {
  it('returns null user when not authenticated', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });
  
  it('returns user data when authenticated', async () => {
    // Mock Firebase auth state
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });
  });
});
```

---

## 🔗 Integration Tests

### API Integration Tests

Create `backend/tests/integration/grievance.integration.test.js`:

```javascript
const request = require('supertest');
const app = require('../../src/index');
const { admin, db } = require('../../src/config/firebase');

describe('Grievance Integration Tests', () => {
  let studentToken;
  let authorityToken;
  let grievanceId;
  
  beforeAll(async () => {
    // Create test users and get tokens
    // Setup test data in Firestore
  });
  
  afterAll(async () => {
    // Cleanup test data
  });
  
  it('should complete full grievance workflow', async () => {
    // 1. Student submits grievance
    const submitResponse = await request(app)
      .post('/api/grievance/submit')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        category: 'Infrastructure',
        priority: 'High',
        location: 'Library',
        description: 'Integration test grievance'
      })
      .expect(201);
    
    grievanceId = submitResponse.body.grievanceId;
    expect(grievanceId).toBeDefined();
    
    // 2. Student views their grievances
    const listResponse = await request(app)
      .get('/api/grievance/list')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);
    
    expect(listResponse.body).toContainEqual(
      expect.objectContaining({ grievanceId })
    );
    
    // 3. Authority updates status
    const updateResponse = await request(app)
      .put(`/api/grievance/${grievanceId}/status`)
      .set('Authorization', `Bearer ${authorityToken}`)
      .send({
        status: 'In Progress',
        remark: 'Working on it'
      })
      .expect(200);
    
    expect(updateResponse.body.status).toBe('In Progress');
  });
});
```

---

## 🎭 End-to-End Tests

### Using Playwright

1. **Install Playwright**:
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   ```

2. **Create E2E Test**:
   Create `tests/e2e/student-workflow.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Student Workflow', () => {
  test('should submit and track grievance', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'student@test.edu');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Navigate to grievance submission
    await page.click('text=Submit Grievance');
    
    // Fill form
    await page.selectOption('select[name="category"]', 'Infrastructure');
    await page.selectOption('select[name="priority"]', 'High');
    await page.fill('input[name="location"]', 'Library');
    await page.fill('textarea[name="description"]', 'E2E test grievance');
    
    // Submit
    await page.click('button:has-text("Submit")');
    
    // Verify success
    await expect(page.locator('text=Grievance submitted successfully')).toBeVisible();
    
    // Track grievance
    await page.click('text=My Grievances');
    await expect(page.locator('text=E2E test grievance')).toBeVisible();
  });
});
```

---

## ✅ Manual Testing Checklist

### Student Role Testing

- [ ] Register new student account
- [ ] Login with student credentials
- [ ] Submit grievance (all categories)
- [ ] Submit anonymous grievance
- [ ] Track grievance status
- [ ] Browse academic resources
- [ ] Download resource
- [ ] Search resources by course
- [ ] Browse opportunities
- [ ] Apply to opportunity
- [ ] Track application status
- [ ] Create task in Scholar's Ledger
- [ ] Update task progress
- [ ] Mark task complete
- [ ] Update profile
- [ ] Change password
- [ ] Logout

### Faculty Role Testing

- [ ] Login as faculty
- [ ] Upload academic resource
- [ ] Edit uploaded resource
- [ ] Delete resource
- [ ] View resource analytics
- [ ] Post new opportunity
- [ ] Edit opportunity
- [ ] Close opportunity
- [ ] View applications
- [ ] Shortlist applicant
- [ ] Accept applicant
- [ ] Reject applicant
- [ ] Logout

### Authority Role Testing

- [ ] Login as authority
- [ ] View all grievances
- [ ] Filter by category
- [ ] Filter by status
- [ ] Filter by priority
- [ ] Update grievance status
- [ ] Add remark to grievance
- [ ] Assign grievance to department
- [ ] View analytics
- [ ] Export report
- [ ] Logout

### Admin Role Testing

- [ ] Login as admin
- [ ] View all users
- [ ] Create new user
- [ ] Edit user role
- [ ] Deactivate user
- [ ] Delete user
- [ ] View audit logs
- [ ] Filter audit logs
- [ ] View system analytics
- [ ] Export analytics
- [ ] Update system settings
- [ ] Logout

---

## 🔍 Test Data

### Sample Test Users

```json
{
  "student": {
    "email": "student.test@institute.edu",
    "password": "TestPass123!",
    "role": "student"
  },
  "faculty": {
    "email": "faculty.test@institute.edu",
    "password": "TestPass123!",
    "role": "faculty"
  },
  "authority": {
    "email": "authority.test@institute.edu",
    "password": "TestPass123!",
    "role": "authority"
  },
  "admin": {
    "email": "admin.test@institute.edu",
    "password": "TestPass123!",
    "role": "admin"
  }
}
```

---

## 📊 Running Tests

### Backend Tests
```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

### E2E Tests
```bash
npx playwright test              # Run all E2E tests
npx playwright test --headed     # Run with browser visible
npx playwright test --debug      # Debug mode
```

---

## 📈 Coverage Goals

- **Unit Tests**: Minimum 80% code coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: All critical user workflows covered
- **Manual Tests**: All role-specific features tested

---

## 🐛 Bug Reporting

When reporting bugs from testing:

1. **Title**: Clear, concise description
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, versions
6. **Screenshots**: If applicable
7. **Logs**: Console errors or backend logs
