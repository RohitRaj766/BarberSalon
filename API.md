# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Admin routes use JWT tokens stored in HTTP-only cookies. Login first to get a token.

---

## Public Endpoints

### POST /book
Create a new booking

**Request**:
```json
{
  "name": "John Doe",
  "phone": "(555) 123-4567"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "name": "John Doe",
    "phone": "(555) 123-4567",
    "queuePosition": 1,
    "estimatedTime": "2026-01-21T09:18:00.000Z",
    "status": "PENDING",
    "createdAt": "2026-01-21T06:00:00.000Z"
  }
}
```

**Errors**:
- 400: Invalid name or phone
- 400: Duplicate pending booking with same phone

---

### GET /queue
Get all bookings in queue

**Response** (200):
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
        "name": "John Doe",
        "phone": "(555) 123-4567",
        "queuePosition": 1,
        "estimatedTime": "2026-01-21T09:18:00.000Z",
        "status": "PENDING",
        "createdAt": "2026-01-21T06:00:00.000Z"
      }
    ],
    "totalCount": 1
  }
}
```

---

### GET /booking/[id]
Get specific booking details

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "name": "John Doe",
    "phone": "(555) 123-4567",
    "queuePosition": 1,
    "estimatedTime": "2026-01-21T09:18:00.000Z",
    "status": "PENDING",
    "createdAt": "2026-01-21T06:00:00.000Z"
  }
}
```

**Errors**:
- 404: Booking not found

---

## Admin Endpoints

### POST /admin/login
Admin login

**Request**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response** (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- 401: Invalid credentials

**Note**: Token is automatically set as HTTP-only cookie

---

### POST /admin/logout
Admin logout

**Response** (200):
```json
{
  "success": true
}
```

---

### PATCH /booking/[id]
Update booking status (Admin only)

**Request**:
```json
{
  "status": "COMPLETED"
}
```

**Valid statuses**: `PENDING`, `COMPLETED`, `CANCELLED`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1k",
    "name": "John Doe",
    "phone": "(555) 123-4567",
    "queuePosition": 1,
    "estimatedTime": "2026-01-21T09:18:00.000Z",
    "status": "COMPLETED",
    "createdAt": "2026-01-21T06:00:00.000Z"
  }
}
```

**Side effects**:
- When marking as COMPLETED or CANCELLED, remaining PENDING bookings are recalculated
- Queue positions are updated automatically
- Estimated times are recalculated

**Errors**:
- 404: Booking not found

---

### DELETE /booking/[id]
Delete a booking (Admin only)

**Response** (200):
```json
{
  "success": true
}
```

**Side effects**:
- Remaining PENDING bookings are recalculated
- Queue positions are updated automatically
- Estimated times are recalculated

**Errors**:
- 404: Booking not found

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad request (validation error)
- 401: Unauthorized (invalid credentials)
- 404: Not found
- 500: Server error

---

## Type Definitions

### BookingStatus
```typescript
type BookingStatus = "PENDING" | "COMPLETED" | "CANCELLED"
```

### BookingResponse
```typescript
interface BookingResponse {
  id: string
  name: string
  phone: string
  queuePosition: number
  estimatedTime: string (ISO 8601)
  status: BookingStatus
  createdAt: string (ISO 8601)
}
```

### QueueResponse
```typescript
interface QueueResponse {
  bookings: BookingResponse[]
  totalCount: number
}
```

---

## Scheduling Logic

- Opening time: 9:00 AM
- Slot duration: 18 minutes
- Estimated time formula: `9:00 AM + (queuePosition × 18 minutes)`

Example:
- Position 1: 9:00 AM
- Position 2: 9:18 AM
- Position 3: 9:36 AM
- Position 4: 9:54 AM

---

## Rate Limiting

No rate limiting implemented. Add if needed for production.

---

## CORS

CORS is not explicitly configured. Same-origin requests only by default.
