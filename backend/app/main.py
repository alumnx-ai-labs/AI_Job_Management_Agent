from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.jobs_chat import router as chat_router
from app.api.routes import router
from app.db.database import init_db

app = FastAPI(title="Job Parser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(chat_router)

@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
