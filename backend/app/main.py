from fastapi import FastAPI

app = FastAPI(
    title="DocSure AI API",
    description="AI-powered document verification backend",
    version="1.0.0",
)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok"
    }