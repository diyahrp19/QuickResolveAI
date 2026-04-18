# Frontend Integration Guide

This guide shows how to integrate the QuickResolveAI backend APIs with your React frontend.

## Base URL

```
http://localhost:8000
```

## API Integration Examples

### 1. Submit a Complaint (POST)

**File:** `src/routes/submit.tsx` or your complaint form component

```typescript
import axios from "axios";

const submitComplaint = async (formData) => {
  try {
    const response = await axios.post("http://localhost:8000/complaint", {
      complaint_text: formData.complaintText,
      source: formData.source, // Email | Call | Manual
      customer_name: formData.customerName,
    });

    console.log("Complaint submitted:", response.data);
    // Response includes: id, category, priority, recommendation, status, etc.
    return response.data;
  } catch (error) {
    console.error("Error submitting complaint:", error);
    throw error;
  }
};
```

### 2. Fetch All Complaints (GET)

**File:** `src/routes/complaints.tsx` or your complaints table component

```typescript
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('http://localhost:8000/complaints');
        setComplaints(response.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div>
      {/* Render complaints table with data */}
      {complaints.map((complaint) => (
        <div key={complaint.id}>
          <p>{complaint.complaint_text}</p>
          <span>{complaint.priority}</span>
          <span>{complaint.status}</span>
        </div>
      ))}
    </div>
  );
}
```

### 3. Update Complaint Status (PATCH)

**File:** Any component showing complaint details

```typescript
import axios from "axios";

const updateComplaintStatus = async (complaintId, newStatus) => {
  try {
    const response = await axios.patch(
      `http://localhost:8000/complaint/${complaintId}`,
      { status: newStatus }, // New | In Progress | Resolved
    );

    console.log("Complaint updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating complaint:", error);
    throw error;
  }
};
```

### 4. Fetch Dashboard Analytics (GET)

**File:** `src/routes/analytics.tsx` or your dashboard component

```typescript
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <div>Total Complaints: {stats.total_complaints}</div>
      <div>High Priority: {stats.high_priority}</div>
      <div>Medium Priority: {stats.medium_priority}</div>
      <div>Low Priority: {stats.low_priority}</div>
      <div>Resolved: {stats.resolved}</div>
      <div>Pending: {stats.pending}</div>
    </div>
  );
}
```

## Create API Service Module (Optional but Recommended)

**File:** `src/services/api.ts`

```typescript
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const complaintAPI = {
  // Submit a new complaint
  submitComplaint: (data) => apiClient.post("/complaint", data),

  // Get all complaints
  getAllComplaints: () => apiClient.get("/complaints"),

  // Update complaint status
  updateStatus: (complaintId, status) => apiClient.patch(`/complaint/${complaintId}`, { status }),

  // Get dashboard analytics
  getDashboardStats: () => apiClient.get("/dashboard"),

  // Health check
  healthCheck: () => apiClient.get("/health"),
};
```

**Usage in components:**

```typescript
import { complaintAPI } from "@/services/api";

// Submit complaint
const response = await complaintAPI.submitComplaint({
  complaint_text: "Issue with product",
  source: "Email",
  customer_name: "John Doe",
});

// Get all complaints
const complaints = await complaintAPI.getAllComplaints();

// Update status
await complaintAPI.updateStatus(complaintId, "In Progress");

// Get dashboard stats
const stats = await complaintAPI.getDashboardStats();
```

## Data Structures

### Complaint Submit Request

```json
{
  "complaint_text": "string",
  "source": "Email | Call | Manual",
  "customer_name": "string"
}
```

### Complaint Response

```json
{
  "id": "string (MongoDB ObjectId)",
  "complaint_text": "string",
  "category": "Product Issue | Packaging Issue | Trade Inquiry",
  "priority": "High | Medium | Low",
  "recommendation": "string",
  "status": "New | In Progress | Resolved",
  "source": "Email | Call | Manual",
  "customer_name": "string",
  "created_at": "ISO datetime string"
}
```

### Status Update Request

```json
{
  "status": "New | In Progress | Resolved"
}
```

### Dashboard Stats Response

```json
{
  "total_complaints": 50,
  "high_priority": 12,
  "medium_priority": 20,
  "low_priority": 18,
  "resolved": 25,
  "pending": 25
}
```

## Error Handling

Always handle errors in your API calls:

```typescript
try {
  const data = await complaintAPI.submitComplaint(formData);
  console.log("Success:", data);
} catch (error) {
  if (error.response) {
    // Backend error
    console.error("Error:", error.response.status, error.response.data);
  } else if (error.request) {
    // No response
    console.error("No response from server");
  } else {
    console.error("Error:", error.message);
  }
}
```

## CORS Handling

The backend is already configured for CORS from your React frontend. If you get CORS errors:

1. Check that frontend runs on `http://localhost:3000` or `http://localhost:5173`
2. Update CORS origins in `backend/main.py` if needed
3. Restart backend server

## Testing API Endpoints

### Using Browser DevTools

Open browser console and test:

```javascript
fetch("http://localhost:8000/health")
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### Using Swagger UI

Visit: `http://localhost:8000/docs`

Click on any endpoint and click "Try it out" to test directly.

### Using cURL

```bash
# Submit complaint
curl -X POST http://localhost:8000/complaint \
  -H "Content-Type: application/json" \
  -d '{
    "complaint_text": "Product is broken",
    "source": "Email",
    "customer_name": "John Doe"
  }'

# Get all complaints
curl http://localhost:8000/complaints

# Get dashboard stats
curl http://localhost:8000/dashboard
```

## Environment Configuration

For different environments, update the API base URL:

```typescript
// src/config/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default API_BASE_URL;
```

**.env file:**

```
REACT_APP_API_URL=http://localhost:8000  # Development
# REACT_APP_API_URL=https://api.quickresolveai.com  # Production
```

## Quick Troubleshooting

| Issue              | Solution                                              |
| ------------------ | ----------------------------------------------------- |
| CORS error         | Check backend CORS origins in `main.py`               |
| 404 Not Found      | Verify backend is running and API endpoint is correct |
| Connection refused | Ensure backend is running on port 8000                |
| MongoDB error      | Ensure MongoDB is running and connected               |

---

## Next Steps

1. Install axios: `npm install axios`
2. Create API service module (optional but recommended)
3. Update your existing React components to use the API calls
4. Test endpoints using Swagger UI: `http://localhost:8000/docs`
5. Start backend: `cd backend && uvicorn main:app --reload`
