# AJCM Platform - Technical Documentation & Integration Guide

This document provides technical details for both frontend developers and the backend team to ensure a consistent and robust integration within the AJCM association website.

## 1. Frontend Architecture Standard

The application follows a standardized **Service-Hook-Component** pattern to manage data and UI states.

### Service Layer (`/src/api`)
- All API calls must use the centralized `apiClient` instance.
- **Data Extraction:** The `apiClient` response interceptor already handles `response.data`. Services should return the direct promise.
- **Service Example:**
  ```javascript
  import apiClient from './apiClient';
  const exampleService = {
    getAll: () => apiClient.get('/examples'),
    create: (data) => apiClient.post('/examples', data),
  };
  ```

### Hook Layer (`/src/hooks`)
- Use the `useAsync` hook to manage loading states, errors, and data fetching uniformly.
  ```javascript
  const { execute, isLoading, error } = useAsync(serviceMethod);
  ```

### Admin Component Scope
- Admin modules are scoped using the `.platform-app` class to isolate the **Floating Glassmorphism** design from the public website styles.

---

## 2. Backend Integration Details

The frontend expects an API that follows standard RESTful principles.

### API Base URL
The frontend uses the environment variable `VITE_API_BASE_URL`.
Default: `http://localhost:5000/api`

### Authentication
The frontend expects a login endpoint returning user data with a `role` (`admin` or `member`).

### Resource Schemas

#### A. Events (Activités)
Managed via `eventService.js`.
- **Primary Key:** `folder` (String)
- **Date Format:** `YYYY-MM-DD`
- **Fields:** `folder`, `title`, `date` (start), `endDate`, `startTime`, `lieu`, `description_fr`, `description_ar`, `media` (Array), `maxParticipants`.

#### B. Annonces
Managed via `annonceService.js`.
- **Date Format:** `YYYY-MM-DD`
- **Fields:** `id`, `title`, `type` (`actualite`|`evenement`), `date` (start), `endDate`, `startTime`, `location`, `text`, `image`.

#### C. Registrations (Inscriptions)
Managed via `registrationService.js`.
- **Fields:** `id`, `member`, `email`, `phone`, `activity` (matches event title), `date`, `message`.

---

## 3. Form Management Standards

To ensure data integrity, frontend components must:
1. **Clean Payloads:** Strip temporary UI state (e.g., `_isNew`, `_posterPreview`) before transmission.
2. **Date Normalization:** Convert backend formats (e.g., `DD/MM/YYYY`) to `YYYY-MM-DD` for `<input type="date">`.
3. **Validation:** Implement client-side validation for required fields (`*`) before submission.

---
*Maintained by the AJCM Technical Team.*
