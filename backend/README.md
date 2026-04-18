# QuickResolveAI Backend

AI Powered Complaint Classification & Resolution System

## Setup Instructions

### Prerequisites

- Python 3.8+
- MongoDB (running locally or remotely)
- pip (Python package manager)

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update MongoDB URI if needed:

```bash
cp .env.example .env
```

**Default .env:**

```
MONGO_URI=mongodb://localhost:27017
DEBUG=True
```

For MongoDB Atlas (cloud):

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

### 3. Start MongoDB

**Local MongoDB:**

```bash
mongod
```

**or use MongoDB Atlas (cloud)** - Update MONGO_URI in .env

### 4. Run Backend Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**

### 5. Access API Documentation

**Interactive API Docs (Swagger UI):**

```
http://localhost:8000/docs
```

**Alternative API Docs (ReDoc):**

```
http://localhost:8000/redoc
```

---

## Project Structure

```
backend/
├── main.py                      # FastAPI application & endpoints
├── models.py                    # Pydantic request/response models
├── database.py                  # MongoDB connection & utilities
├── services/
│   ├── __init__.py
│   └── complaint_service.py     # Complaint processing logic
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── .env                         # Environment variables (local)
```

---

## API Endpoints

### Health Check

```
GET /health
```

Returns: `{"status": "healthy", "service": "QuickResolveAI"}`

### 1. Submit Complaint

```
POST /complaint
```

**Request Body:**

```json
{
  "complaint_text": "The product arrived with a leak",
  "source": "Email",
  "customer_name": "John Doe"
}
```

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "complaint_text": "The product arrived with a leak",
  "category": "Packaging Issue",
  "priority": "High",
  "recommendation": "Replace product",
  "status": "New",
  "source": "Email",
  "customer_name": "John Doe",
  "created_at": "2024-01-15T10:30:00.000000"
}
```

### 2. Get All Complaints

```
GET /complaints
```

**Response:**

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "complaint_text": "...",
    "category": "Packaging Issue",
    "priority": "High",
    "recommendation": "Replace product",
    "status": "New",
    "source": "Email",
    "customer_name": "John Doe",
    "created_at": "2024-01-15T10:30:00.000000"
  },
  ...
]
```

### 3. Update Complaint Status

```
PATCH /complaint/{id}
```

**Request Body:**

```json
{
  "status": "In Progress"
}
```

**Valid Status Values:** `New` | `In Progress` | `Resolved`

**Response:** Updated complaint object

### 4. Dashboard Analytics

```
GET /dashboard
```

**Response:**

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

---

## Complaint Processing

The `process_complaint()` function in `services/complaint_service.py` handles complaint classification with placeholder rules.

### Categories

- **Product Issue**: Keywords - "defective", "not working", "faulty"
- **Packaging Issue**: Keywords - "leak", "damaged", "torn"
- **Trade Inquiry**: Keywords - "distributor", "wholesale", "bulk order"

### Priority Levels

- **High**: Safety issues, damaged products → "Replace product"
- **Medium**: Inconvenience, wrong items → "Follow up with customer"
- **Low**: General inquiries → "Forward to sales team"

### Ready for AI Integration

The `process_complaint()` function can be extended with AI/ML models (OpenAI API, custom models, etc.) for advanced classification later.

---

## Database (MongoDB)

### Database: `quickresolveai`

### Collection: `complaints`

### Document Schema

```json
{
  "_id": ObjectId,
  "complaint_text": "string",
  "category": "string (Product Issue | Packaging Issue | Trade Inquiry)",
  "priority": "string (High | Medium | Low)",
  "recommendation": "string",
  "status": "string (New | In Progress | Resolved)",
  "source": "string (Email | Call | Manual)",
  "customer_name": "string",
  "created_at": "ISO datetime string"
}
```

### Indexes

Automatically created on startup:

- `created_at` - For sorting complaints by date
- `status` - For filtering by status
- `priority` - For priority-based queries
- `category` - For category-based queries

---

## CORS Configuration

The backend allows requests from React frontend:

- `http://localhost:3000` (React production)
- `http://localhost:5173` (Vite development)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

Update `main.py` CORS origins if frontend runs on different port.

---

## Frontend Integration

### Example React API Calls

**Using Fetch:**

```javascript
// Submit complaint
const response = await fetch("http://localhost:8000/complaint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    complaint_text: "Product not working",
    source: "Email",
    customer_name: "John Doe",
  }),
});
const data = await response.json();
```

**Using Axios:**

```javascript
// Submit complaint
import axios from "axios";

const response = await axios.post("http://localhost:8000/complaint", {
  complaint_text: "Product not working",
  source: "Email",
  customer_name: "John Doe",
});
console.log(response.data);
```

---

## Environment Variables

Create `.env` file in `backend/` directory:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017

# FastAPI
DEBUG=True
```

---

## Running in Development

```bash
# Install dependencies
pip install -r requirements.txt

# Start MongoDB (if local)
mongod

# Run FastAPI with auto-reload
uvicorn main:app --reload
```

**Server runs on:** `http://localhost:8000`
**API Docs:** `http://localhost:8000/docs`

---

## Deployment

For production:

1. Update `MONGO_URI` to MongoDB Atlas or managed service
2. Set `DEBUG=False` in .env
3. Use production ASGI server:
   ```bash
   gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
   ```
4. Configure proper CORS origins for production domain
5. Use HTTPS/SSL certificates

---

## Future Enhancements

- **AI Integration**: Replace `process_complaint()` with OpenAI API or custom ML models
- **Advanced Analytics**: Add more dashboard metrics and filtering
- **User Authentication**: Add JWT token-based authentication
- **Pagination**: Add pagination to GET /complaints endpoint
- **Search & Filtering**: Add search and filter capabilities
- **Email Notifications**: Send notifications on complaint status updates

---

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- For MongoDB Atlas, verify IP whitelist and credentials

### CORS Error

- Verify React frontend URL is in CORS origins in `main.py`
- Clear browser cache and restart

### Port Already in Use

```bash
# Change port
uvicorn main:app --port 8001
```

---

## Support

For issues or questions, check:

- FastAPI docs: `http://localhost:8000/docs`
- MongoDB docs: https://docs.mongodb.com
- PyMongo docs: https://pymongo.readthedocs.io
