FROM node:21-bookworm as build_stage

COPY plngx-dissect-frontend/package.json /app/plngx-dissect-frontend/

WORKDIR /app/plngx-dissect-frontend

RUN npm install

COPY . /app

RUN npm run build

FROM python:3.12-bookworm

LABEL org.opencontainers.image.source https://github.com/christianglodt/plngx-dissect

RUN apt update -y && apt install -y poppler-utils && rm -rf /var/apt/lists

# Create virtual env
ENV VIRTUAL_ENV=/opt/venv
RUN python -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY backend/requirements.txt /app/backend/requirements.txt

# Install Python packages
RUN pip install wheel && pip install -r /app/backend/requirements.txt

COPY . /app

WORKDIR /app

RUN rm -rf /app/plngx-dissect-frontend

COPY --from=build_stage /app/plngx-dissect-frontend/dist /app/plngx-dissect-frontend/dist/

WORKDIR /app/backend
CMD ["/opt/venv/bin/uvicorn", "--host", "0.0.0.0", "main:app"]
