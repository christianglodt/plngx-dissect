#!/bin/sh

# TODO omit reload if not in devcontainer
exec uvicorn --host 0.0.0.0 main:app --reload
