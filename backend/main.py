"""
QuickResolveAI - FastAPI Backend
AI Powered Complaint Classification & Resolution System
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from bson import ObjectId

from models import (
    ComplaintSubmitRequest,
    ComplaintUpdateRequest,
    ComplaintResponse,
    DashboardStats,
)
from database import (
    get_complaints_collection,
    convert_objectid_to_string,
    convert_objectid_in_list,
    create_indexes,
)
from services.complaint_service import process_complaint

# Initialize FastAPI app
app = FastAPI(
    title="QuickResolveAI",
    description="AI Powered Complaint Classification & Resolution System",
    version="1.0.0",
)

# Enable CORS for React frontend
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event
@app.on_event("startup")
def startup():
    """Create database indexes on startup"""
    create_indexes()
    print("✓ Backend started successfully")


# Health check endpoint
@app.get("/health", tags=["Health"])
def health_check():
    """Check if backend is running"""
    return {"status": "healthy", "service": "QuickResolveAI"}


# ==================== COMPLAINT ENDPOINTS ====================

@app.post("/complaint", response_model=ComplaintResponse, tags=["Complaints"])
def submit_complaint(request: ComplaintSubmitRequest):
    """
    Submit a new complaint.
    
    The complaint text is processed for classification.
    Results are stored in MongoDB.
    """
    try:
        collection = get_complaints_collection()
        
        # Process complaint text using complaint service
        classification_result = process_complaint(request.complaint_text)
        
        # Create complaint document
        complaint_doc = {
            "complaint_text": request.complaint_text,
            "category": classification_result["category"],
            "priority": classification_result["priority"],
            "recommendation": classification_result["recommendation"],
            "status": "New",
            "source": request.source,
            "customer_name": request.customer_name,
            "created_at": datetime.utcnow().isoformat(),
        }
        
        # Insert into MongoDB
        result = collection.insert_one(complaint_doc)
        
        # Return the created complaint
        complaint_doc["_id"] = result.inserted_id
        return convert_objectid_to_string(complaint_doc)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting complaint: {str(e)}"
        )


@app.get("/complaints", response_model=list[ComplaintResponse], tags=["Complaints"])
def get_all_complaints():
    """
    Get all complaints from database.
    
    Returns all complaints for the Complaint Management table in UI.
    ObjectId is converted to string.
    """
    try:
        collection = get_complaints_collection()
        
        # Fetch all complaints, sorted by creation date (newest first)
        complaints = list(collection.find({}).sort("created_at", -1))
        
        # Convert ObjectId to string
        complaints_converted = convert_objectid_in_list(complaints)
        
        return complaints_converted
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching complaints: {str(e)}"
        )


@app.patch("/complaint/{complaint_id}", response_model=ComplaintResponse, tags=["Complaints"])
def update_complaint_status(complaint_id: str, request: ComplaintUpdateRequest):
    """
    Update complaint status.
    
    Status values: New | In Progress | Resolved
    """
    try:
        collection = get_complaints_collection()
        
        # Validate complaint ID
        if not ObjectId.is_valid(complaint_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid complaint ID format"
            )
        
        # Update status
        result = collection.find_one_and_update(
            {"_id": ObjectId(complaint_id)},
            {"$set": {"status": request.status}},
            return_document=True
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )
        
        return convert_objectid_to_string(result)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating complaint: {str(e)}"
        )


# ==================== ANALYTICS ENDPOINTS ====================

@app.get("/dashboard", response_model=DashboardStats, tags=["Analytics"])
def get_dashboard_stats():
    """
    Get dashboard analytics.
    
    Returns aggregated statistics for dashboard charts.
    """
    try:
        collection = get_complaints_collection()
        
        # Count total complaints
        total_complaints = collection.count_documents({})
        
        # Count by priority
        high_priority = collection.count_documents({"priority": "High"})
        medium_priority = collection.count_documents({"priority": "Medium"})
        low_priority = collection.count_documents({"priority": "Low"})
        
        # Count by status
        resolved = collection.count_documents({"status": "Resolved"})
        pending = total_complaints - resolved
        
        return DashboardStats(
            total_complaints=total_complaints,
            high_priority=high_priority,
            medium_priority=medium_priority,
            low_priority=low_priority,
            resolved=resolved,
            pending=pending,
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard stats: {str(e)}"
        )


# ==================== ROOT ENDPOINT ====================

@app.get("/", tags=["Root"])
def root():
    """Welcome message"""
    return {
        "message": "Welcome to QuickResolveAI Backend",
        "docs": "http://localhost:8000/docs",
        "health": "http://localhost:8000/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    # Run with: uvicorn main:app --reload
    uvicorn.run(app, host="0.0.0.0", port=8000)
