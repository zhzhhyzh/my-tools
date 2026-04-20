"""PDF Tools Processing Service - FastAPI Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import organize, optimize, convert, edit, security, intelligence

app = FastAPI(title="PDF Tools Processing Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(organize.router, tags=["Organize"])
app.include_router(optimize.router, tags=["Optimize"])
app.include_router(convert.router, tags=["Convert"])
app.include_router(edit.router, tags=["Edit"])
app.include_router(security.router, tags=["Security"])
app.include_router(intelligence.router, tags=["Intelligence"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "pdf-processing"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
