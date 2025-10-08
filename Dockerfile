FROM node:22-bookworm AS npm_build_stage

COPY plngx-dissect-frontend/package.json /app/plngx-dissect-frontend/

WORKDIR /app/plngx-dissect-frontend

RUN --mount=type=cache,target=/root/.npm \
    npm install

COPY . /app

RUN --mount=type=cache,target=/root/.npm \
    npm run build

FROM python:3.13-bookworm

LABEL org.opencontainers.image.source=https://github.com/christianglodt/plngx-dissect

RUN apt update -y && apt install -y poppler-utils ocrmypdf tesseract-ocr-all && rm -rf /var/apt/lists

# Install uv
COPY --from=ghcr.io/astral-sh/uv:0.8.12 /uv /uvx /bin/

COPY backend/pyproject.toml backend/uv.lock /app/backend/

WORKDIR /app/backend

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --no-python-downloads --no-install-project --no-dev --link-mode=copy

ENV PATH="/app/backend/.venv/bin:$PATH"

WORKDIR /app

# TODO use --exclude here once it's released, instead of "rm" after
COPY . /app
RUN rm -rf ./plngx-dissect-frontend

COPY --from=npm_build_stage /app/plngx-dissect-frontend/dist /app/plngx-dissect-frontend/dist/

WORKDIR /app/backend
CMD ["uvicorn", "--host", "0.0.0.0", "main:app"]
