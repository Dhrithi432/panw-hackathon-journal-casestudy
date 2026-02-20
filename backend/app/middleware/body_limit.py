"""Request body size limit middleware to prevent large payload abuse."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class BodyLimitMiddleware(BaseHTTPMiddleware):
    """Reject requests whose Content-Length exceeds max_bytes."""

    def __init__(self, app, max_bytes: int = 1_000_000):
        super().__init__(app)
        self.max_bytes = max_bytes

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("Content-Length")
        if content_length:
            try:
                if int(content_length) > self.max_bytes:
                    return JSONResponse(
                        status_code=413,
                        content={"detail": "Request body too large"},
                    )
            except ValueError:
                pass  # Invalid Content-Length, let downstream handle
        return await call_next(request)
