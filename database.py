
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Create Database Directory if not exists
if not os.path.exists("data"):
    os.makedirs("data")

# Database Setup
DATABASE_URL = "sqlite:///data/history.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class MissionHistory(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    city = Column(String)
    emergency_type = Column(String)
    source = Column(String)
    destination = Column(String)
    classical_eta = Column(Float)
    quantum_eta = Column(Float)
    time_saved = Column(Float)
    distance_km = Column(Float)
    qubits_used = Column(Integer)
    status = Column(String)

# Create Tables
Base.metadata.create_all(bind=engine)

def log_mission(city, e_type, src, dst, c_eta, q_eta, dist, qubits):
    session = SessionLocal()
    try:
        mission = MissionHistory(
            city=city,
            emergency_type=e_type,
            source=src,
            destination=dst,
            classical_eta=c_eta,
            quantum_eta=q_eta,
            time_saved=round(c_eta - q_eta, 2),
            distance_km=dist,
            qubits_used=qubits,
            status="COMPLETED"
        )
        session.add(mission)
        session.commit()
    except Exception as e:
        print(f"DB Error: {e}")
    finally:
        session.close()

def get_recent_missions(limit=10):
    session = SessionLocal()
    try:
        return session.query(MissionHistory).order_by(MissionHistory.id.desc()).limit(limit).all()
    finally:
        session.close()
