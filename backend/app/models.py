from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ProficiencyLevel(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

class SkillCategory(str, Enum):
    PROGRAMMING = "Programming"
    DESIGN = "UI/UX & Design"
    LANGUAGES = "Languages"
    CREATIVE = "Creative Arts & Photo"
    BUSINESS = "Business & Data"
    ACADEMICS = "Academics & Science"

class SkillTeachItem(BaseModel):
    name: str
    category: str = "General"
    proficiency: ProficiencyLevel = ProficiencyLevel.INTERMEDIATE
    experience_summary: Optional[str] = ""

class SkillLearnItem(BaseModel):
    name: str
    category: str = "General"
    target_goal: Optional[str] = ""

class RatingSummary(BaseModel):
    average_rating: float = 5.0
    total_reviews: int = 0
    hours_taught: int = 0

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    university: Optional[str] = "University Campus"
    avatar_url: Optional[str] = ""
    bio: Optional[str] = ""
    skills_to_teach: List[SkillTeachItem] = []
    skills_to_learn: List[SkillLearnItem] = []

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    university: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    skills_to_teach: Optional[List[SkillTeachItem]] = None
    skills_to_learn: Optional[List[SkillLearnItem]] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    university: str
    avatar_url: str
    bio: str
    skills_to_teach: List[SkillTeachItem]
    skills_to_learn: List[SkillLearnItem]
    rating_summary: RatingSummary
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class SwapStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class SkillExchangeProposal(BaseModel):
    name: str
    hours: int = 1

class SwapRequestCreate(BaseModel):
    receiver_id: str
    skill_offered: SkillExchangeProposal
    skill_requested: SkillExchangeProposal
    note: Optional[str] = "Hey! Let's exchange skills together."

class SwapRequestResponse(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    sender_avatar: str
    receiver_id: str
    receiver_name: str
    receiver_avatar: str
    skill_offered: SkillExchangeProposal
    skill_requested: SkillExchangeProposal
    note: str
    status: SwapStatus
    created_at: datetime
    updated_at: datetime

class ChatMessageCreate(BaseModel):
    swap_id: str
    receiver_id: str
    content: str
    message_type: str = "text"

class ChatMessageResponse(BaseModel):
    id: str
    swap_id: str
    sender_id: str
    sender_name: str
    receiver_id: str
    content: str
    message_type: str
    is_read: bool
    created_at: datetime

class SessionCreate(BaseModel):
    swap_id: str
    teacher_id: str
    learner_id: str
    skill_name: str
    scheduled_start: datetime
    duration_minutes: int = 60
    notes: Optional[str] = ""

class SessionResponse(BaseModel):
    id: str
    swap_id: str
    teacher_id: str
    teacher_name: str
    learner_id: str
    learner_name: str
    skill_name: str
    scheduled_start: datetime
    duration_minutes: int
    meeting_url: str
    status: str
    notes: str
    created_at: datetime

class ReviewCreate(BaseModel):
    session_id: str
    reviewee_id: str
    skill_taught: str
    rating: int = Field(ge=1, le=5)
    tags: List[str] = []
    comment: str

class ReviewResponse(BaseModel):
    id: str
    session_id: str
    reviewer_id: str
    reviewer_name: str
    reviewer_avatar: str
    reviewee_id: str
    skill_taught: str
    rating: int
    tags: List[str]
    comment: str
    created_at: datetime

class ClusterConfigUpdate(BaseModel):
    mongodb_url: str
    database_name: Optional[str] = "skillswap"

class MaterialCreate(BaseModel):
    title: str
    category: str = "Notes & Cheatsheets"
    description: str
    file_format: str = "PDF"
    file_size: Optional[str] = "1.5 MB"
    download_url: Optional[str] = ""
    swap_requirement: Optional[str] = "Free for Campus Peers"

class MaterialResponse(BaseModel):
    id: str
    title: str
    category: str
    description: str
    file_format: str
    file_size: str
    download_url: str
    swap_requirement: str
    author_id: str
    author_name: str
    author_avatar: str
    downloads_count: int
    likes_count: int
    created_at: datetime
