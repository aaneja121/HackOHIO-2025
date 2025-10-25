import os
from fastapi import Header, HTTPException, status

# Use .env if present; default keeps dev unblocked.
DEMO_API_KEY: str = os.getenv("API_KEY_DEMO", "demo-key-123")

async def require_api_key(
    x_api_key: str = Header(..., alias="X-API-Key")
) -> None:
    if x_api_key != DEMO_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )
