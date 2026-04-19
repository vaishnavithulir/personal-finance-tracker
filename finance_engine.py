from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import jwt
import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext

# --- Configuration & Security ---
SECRET_KEY = "DUMBO_SECRET_INSTITUTIONAL_KEY"  # Matches Node.js JWT secret if applicable
ALGORITHM = "HS256"
DATABASE_URL = "sqlite:///./dev.db"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI(title="Dumbo Finance Python Engine")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Models ---
class User(Base):
    __tablename__ = "User"
    id = Column(String, primary_key=True, index=True)
    fullName = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="user")
    bankName = Column(String, nullable=True)
    accountNumber = Column(String, nullable=True)
    ifscCode = Column(String, nullable=True)

class Transaction(Base):
    __tablename__ = "Transaction"
    id = Column(String, primary_key=True, index=True)
    userId = Column(String, ForeignKey("User.id"))
    description = Column(String)
    amount = Column(Float)
    type = Column(String)  # 'income' or 'expense'
    legacyCategory = Column(String)
    date = Column(DateTime, default=datetime.datetime.utcnow)

# --- Pydantic Models ---
class TransactionCreate(BaseModel):
    description: str
    amount: float
    type: str
    category: str

class TransactionResponse(BaseModel):
    id: str
    description: str
    amount: float
    type: str
    legacyCategory: Optional[str]
    date: datetime.datetime

    class Config:
        orm_mode = True

# --- Dependencies ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(x_auth_token: str = Header(...), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(x_auth_token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("user", {}).get("id") # Adjustment to match your Node.js JWT structure
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        user = db.query(User).filter(User.id == email).first()
        if user is None:
            raise HTTPException(status_code=404, detail="Identity not verified")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication Failure: {str(e)}")

# --- API Routes ---

@app.get("/api/wealth/summary")
def get_summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    txns = db.query(Transaction).filter(Transaction.userId == user.id).all()
    income = sum(t.amount for t in txns if t.type == 'income')
    expense = sum(t.amount for t in txns if t.type == 'expense')
    return {
        "net_balance": income - expense,
        "total_income": income,
        "total_expense": expense,
        "record_count": len(txns)
    }

@app.get("/api/transactions", response_model=List[TransactionResponse])
def read_transactions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Transaction).filter(Transaction.userId == user.id).order_by(Transaction.date.desc()).all()

@app.post("/api/ai/alpha-advice")
def get_ai_advice(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Python-native AI Logic (Pattern matching financial intelligence)
    txns = db.query(Transaction).filter(Transaction.userId == user.id).all()
    expense_sum = sum(t.amount for t in txns if t.type == 'expense')
    
    if expense_sum > 50000:
        advice = "Institutional alert: Your burn rate is exceeding tier-1 thresholds. Recommend consolidating SaaS subscriptions."
    elif len(txns) < 5:
        advice = "System Ready: Start logging your wealth signals to unlock deep learning analytics."
    else:
        advice = "Portfolio Optimized: Asset distribution is currently following institutional growth patterns."
        
    return {
        "advisor": "Dumbo Alpha Engine (Python Core)",
        "recommendation": advice,
        "timestamp": datetime.datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    print("Dumbo Finance: Initializing Python Institutional Engine...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
