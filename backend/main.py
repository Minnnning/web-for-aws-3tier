import os
from dotenv import load_dotenv
from typing import List

import sqlalchemy
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.sql import func

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# .env 파일에서 환경 변수 로드 (AWS 배포 시에는 사용 안 함)
load_dotenv()

# 로컬 테스트용 DATABASE_URL. AWS RDS 사용 시 환경변수만 교체하면 됩니다.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/guestbook")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQLAlchemy 모델 정의 ---
class Guestbook(Base):
    __tablename__ = "guestbook"
    id = Column(Integer, primary_key=True, index=True)
    author = Column(String, index=True)
    content = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

# --- Pydantic 모델 (데이터 유효성 검사) ---
class GuestbookEntryBase(BaseModel):
    author: str
    content: str

class GuestbookEntryCreate(GuestbookEntryBase):
    pass

class GuestbookEntry(GuestbookEntryBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True # SQLAlchemy 모델을 Pydantic 모델로 변환 허용

# --- FastAPI 앱 생성 ---
app = FastAPI()

# CORS 설정 (React 앱이 3000번 포트에서 API를 호출할 수 있도록 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 세션 의존성 주입
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API 엔드포인트 ---
@app.post("/entries", response_model=GuestbookEntry)
def create_entry(entry: GuestbookEntryCreate, db: sqlalchemy.orm.Session = Depends(get_db)):
    db_entry = Guestbook(author=entry.author, content=entry.content)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    # SQLAlchemy의 datetime 객체를 문자열로 변환하여 반환
    return GuestbookEntry(
        id=db_entry.id,
        author=db_entry.author,
        content=db_entry.content,
        created_at=db_entry.created_at.isoformat()
    )

@app.get("/entries", response_model=List[GuestbookEntry])
def read_entries(skip: int = 0, limit: int = 100, db: sqlalchemy.orm.Session = Depends(get_db)):
    entries = db.query(Guestbook).order_by(Guestbook.created_at.desc()).offset(skip).limit(limit).all()
    # 각 엔트리의 datetime을 ISO 형식 문자열로 변환
    return [
        GuestbookEntry(
            id=e.id,
            author=e.author,
            content=e.content,
            created_at=e.created_at.isoformat()
        ) for e in entries
    ]
