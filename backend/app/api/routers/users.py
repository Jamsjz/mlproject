from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.user import UserInDB

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
async def get_my_profile(current_user: UserInDB = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "citizenship_number": current_user.citizenship_number,
        "phone_number": current_user.phone_number,
    }
