#!/bin/bash
set -e

. ${NVM_DIR}/nvm.sh 
nvm install 22
npm install --include dev plngx-dissect-frontend --prefix plngx-dissect-frontend

pushd backend
uv sync
popd
