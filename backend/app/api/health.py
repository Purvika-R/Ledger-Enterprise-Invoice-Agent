from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return {
        "status": "healthy",
    }


@router.get("/")
def root():
    return {
        "message": "Welcome to Ledger AI 🚀",
        "status": "Backend is running",
    }