FROM python:3.10-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/
COPY . /app
WORKDIR /app
RUN uv sync --frozen --no-cache --no-dev

FROM python:3.10-slim
COPY --from=builder /app /app
COPY --from=builder /bin/uv /bin/uv
WORKDIR /app
CMD ["uv", "run", "fastapi", "run"]