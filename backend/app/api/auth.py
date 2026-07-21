from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_current_user, get_db, hash_password, verify_password
from app.db.models import User


router = APIRouter()


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str
    password: str


def user_response(user: User):
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "created_at": user.created_at}


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == payload.email.lower())):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    role = "admin" if db.scalar(select(User.id).limit(1)) is None else "uploader"
    user = User(name=payload.name, email=payload.email.lower(), password_hash=hash_password(payload.password), role=role)
    db.add(user); db.commit(); db.refresh(user)
    return {"access_token": create_access_token(user), "token_type": "bearer", "user": user_response(user)}


@router.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return {"access_token": create_access_token(user), "token_type": "bearer", "user": user_response(user)}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return user_response(user)
