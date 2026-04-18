"""
QuickResolveAI - FastAPI Backend
AI Powered Complaint Classification & Resolution System
"""

from fastapi import FastAPI, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from bson import ObjectId

from models import (
    ComplaintSubmitRequest,
    ComplaintUpdateRequest,
    ComplaintResponse,
    DashboardStats,
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UserResponse,
)
from database import (
    get_complaints_collection,
    convert_objectid_to_string,
    convert_objectid_in_list,
    create_indexes,
)
from services.complaint_service import process_complaint
from services.auth_service import (
    authenticate_user,
    create_access_token,
    create_user,
    get_current_user_from_token,
)

app = FastAPI(
    title="QuickResolveAI",
    description="AI Powered Complaint Classification & Resolution System",
    version="1.0.0",
)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
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


def _require_authenticated_user(authorization: str | None) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    token = authorization.split(" ", 1)[1].strip()
    return get_current_user_from_token(token)


@app.on_event("startup")
def startup():
    """Create database indexes on startup"""
    create_indexes()
    print("✓ Backend started successfully")


@app.get("/health", tags=["Health"])
def health_check():
    """Check if backend is running"""
    return {"status": "healthy", "service": "QuickResolveAI"}


@app.post("/auth/signup", response_model=UserResponse, tags=["Auth"])
def signup(request: SignupRequest):
    """Create a new user account."""
    try:
        return create_user(request.name, request.email, request.password)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating account: {str(e)}",
        )


@app.post("/auth/login", response_model=AuthResponse, tags=["Auth"])
def login(request: LoginRequest):
    """Authenticate an existing user and create a JWT session."""
    try:
        user = authenticate_user(request.email, request.password)
        token = create_access_token(user)
        return AuthResponse(access_token=token, token_type="bearer", user=user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error logging in: {str(e)}",
        )


@app.get("/auth/me", response_model=UserResponse, tags=["Auth"])
def get_profile(authorization: str | None = Header(default=None)):
    """Return the authenticated user's profile."""
    try:
        return _require_authenticated_user(authorization)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching profile: {str(e)}",
        )


@app.post("/complaint", response_model=ComplaintResponse, tags=["Complaints"])
def submit_complaint(
    request: ComplaintSubmitRequest,
    authorization: str | None = Header(default=None),
):
    """
    Submit a new complaint.
    
    The complaint text is processed for classification.
    Results are stored in MongoDB.
    """
    try:
        current_user = _require_authenticated_user(authorization)
        collection = get_complaints_collection()
        
        classification_result = process_complaint(request.complaint_text)

        complaint_doc = {
            "complaint_text": request.complaint_text,
            "category": classification_result["category"],
            "priority": classification_result["priority"],
            "recommendation": classification_result["recommendation"],
            "status": "New",
            "source": request.source,
            "customer_name": request.customer_name,
            "user_id": current_user["id"],
            "created_at": datetime.utcnow().isoformat(),
        }
        result = collection.insert_one(complaint_doc)

        complaint_doc["_id"] = result.inserted_id
        return convert_objectid_to_string(complaint_doc)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting complaint: {str(e)}"
        )


@app.get("/complaints", response_model=list[ComplaintResponse], tags=["Complaints"])
def get_all_complaints(authorization: str | None = Header(default=None)):
    """
    Get all complaints from database.
    
    Returns all complaints for the Complaint Management table in UI.
    ObjectId is converted to string.
    """
    try:
        current_user = _require_authenticated_user(authorization)
        collection = get_complaints_collection()
        complaints = list(
            collection.find({"user_id": current_user["id"]}).sort("created_at", -1)
        )

        complaints_converted = convert_objectid_in_list(complaints)
        
        return complaints_converted
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching complaints: {str(e)}"
        )


@app.patch("/complaint/{complaint_id}", response_model=ComplaintResponse, tags=["Complaints"])
def update_complaint_status(
    complaint_id: str,
    request: ComplaintUpdateRequest,
    authorization: str | None = Header(default=None),
):
    """
    Update complaint status.
    
    Status values: New | In Progress | Resolved
    """
    try:
        current_user = _require_authenticated_user(authorization)
        collection = get_complaints_collection()
        if not ObjectId.is_valid(complaint_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid complaint ID format"
            )

        result = collection.find_one_and_update(
            {"_id": ObjectId(complaint_id), "user_id": current_user["id"]},
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


@app.delete("/complaint/{complaint_id}", response_model=ComplaintResponse, tags=["Complaints"])
def delete_complaint(
    complaint_id: str,
    authorization: str | None = Header(default=None),
):
    """Delete a complaint from the database."""
    try:
        current_user = _require_authenticated_user(authorization)
        collection = get_complaints_collection()
        if not ObjectId.is_valid(complaint_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid complaint ID format"
            )

        deleted = collection.find_one_and_delete(
            {"_id": ObjectId(complaint_id), "user_id": current_user["id"]}
        )

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )

        return convert_objectid_to_string(deleted)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting complaint: {str(e)}"
        )


@app.get("/dashboard", response_model=DashboardStats, tags=["Analytics"])
def get_dashboard_stats(authorization: str | None = Header(default=None)):
    """
    Get dashboard analytics.
    
    Returns aggregated statistics for dashboard charts.
    """
    try:
        current_user = _require_authenticated_user(authorization)
        collection = get_complaints_collection()
        base_query = {"user_id": current_user["id"]}
        total_complaints = collection.count_documents(base_query)

        high_priority = collection.count_documents({**base_query, "priority": "High"})
        medium_priority = collection.count_documents({**base_query, "priority": "Medium"})
        low_priority = collection.count_documents({**base_query, "priority": "Low"})

        resolved = collection.count_documents({**base_query, "status": "Resolved"})
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

    uvicorn.run(app, host="0.0.0.0", port=8000)
