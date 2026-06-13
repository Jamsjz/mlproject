from typing import Optional, Dict, Any
from app.models.user import UserInDB, RegistrationSession
from app.core.database import db

class MongoUserRepository:
    @property
    def collection(self):
        return db.db["users"]

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        data = await self.collection.find_one({"email": email})
        if data:
            return UserInDB(**data)
        return None

    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        data = await self.collection.find_one({"_id": user_id})
        if data:
            return UserInDB(**data)
        return None

    async def create_user(self, user: UserInDB) -> UserInDB:
        user_dict = user.model_dump(by_alias=True)
        await self.collection.insert_one(user_dict)
        return user

    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> None:
        await self.collection.update_one({"_id": user_id}, {"$set": update_data})

class MongoRegistrationRepository:
    @property
    def collection(self):
        return db.db["registration_sessions"]

    async def create_session(self, session: RegistrationSession) -> RegistrationSession:
        session_dict = session.model_dump(by_alias=True)
        await self.collection.insert_one(session_dict)
        return session

    async def get_session(self, session_id: str) -> Optional[RegistrationSession]:
        data = await self.collection.find_one({"_id": session_id})
        if data:
            return RegistrationSession(**data)
        return None

    async def update_session(self, session_id: str, update_data: Dict[str, Any]) -> None:
        await self.collection.update_one({"_id": session_id}, {"$set": update_data})

    async def delete_session(self, session_id: str) -> None:
        await self.collection.delete_one({"_id": session_id})
