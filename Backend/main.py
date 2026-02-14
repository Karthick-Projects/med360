from fastapi import FastAPI
from routers import auth,doctors,appointments,admin,patient
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Med360 API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(admin.router)
app.include_router(patient.router)

@app.get("/")
def root():
    return {"message": "Med360 API running"}


# 👇 Run server directly
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )

