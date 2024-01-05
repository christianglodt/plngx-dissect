FROM node:21-bookworm as build_stage

COPY plngx-dissect-frontend/package.json /app/plngx-dissect-frontend/

WORKDIR /app/plngx-dissect-frontend

RUN npm install

COPY . /app

RUN npm run build

FROM python:3.12-bookworm

# Create virtual env
ENV VIRTUAL_ENV=/opt/venv
RUN python -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY requirements.txt /app/requirements.txt

# Install Python packages
RUN pip install -r /app/requirements.txt

COPY . /app

WORKDIR /app

RUN rm -rf /app/plngx-dissect-frontend

COPY --from=build_stage /app/plngx-dissect-frontend/dist /app/plngx-dissect-frontend/dist/

CMD ["/app/entrypoint.sh"]
