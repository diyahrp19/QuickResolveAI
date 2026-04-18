from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


class ComplaintSubmitRequest(BaseModel):
    """Request model for submitting a new complaint"""
    complaint_text: str
    source: str
    customer_name: str


class ComplaintAnalysisRequest(BaseModel):
    """Request model for AI complaint analysis"""

    complaint: str = Field(min_length=1)


class ComplaintAnalysisResponse(BaseModel):
    """Structured AI analysis response model"""

    category: Literal["Product Issue", "Packaging Issue", "Trade Inquiry"]
    priority: Literal["High", "Medium", "Low"]
    recommendation: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "category": "Packaging Issue",
                "priority": "High",
                "recommendation": "Replace the product and escalate the issue to the quality assurance team.",
            }
        }
    )


class ComplaintUpdateRequest(BaseModel):
    """Request model for updating complaint status"""
    status: str


class ComplaintResponse(BaseModel):
    """Response model for complaint data"""
    id: str = Field(description="MongoDB ObjectId as a string", examples=["69e357af6009191f96d05d0e"])
    complaint_text: str
    category: str
    priority: str
    recommendation: str
    status: str
    source: str
    customer_name: str
    created_at: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "69e357af6009191f96d05d0e",
                "complaint_text": "Product arrived damaged",
                "category": "Packaging Issue",
                "priority": "High",
                "recommendation": "Replace product",
                "status": "New",
                "source": "Email",
                "customer_name": "John Doe",
                "created_at": "2026-04-18T10:06:39.163697",
            }
        }
    )


class DashboardStats(BaseModel):
    """Response model for dashboard analytics"""
    total_complaints: int
    high_priority: int
    medium_priority: int
    low_priority: int
    resolved: int
    pending: int


class SignupRequest(BaseModel):
    """Request model for user signup"""
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    """Request model for user login"""
    email: str
    password: str


class UserResponse(BaseModel):
    """Response model for authenticated user data"""
    id: str = Field(description="MongoDB ObjectId as a string")
    name: str
    email: str
    created_at: str


class AuthResponse(BaseModel):
    """Response model for login tokens"""
    access_token: str
    token_type: str
    user: UserResponse
