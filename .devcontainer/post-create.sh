#!/bin/bash
set -e

. ${NVM_DIR}/nvm.sh 
nvm install 21
npm install --include dev plngx-dissect-frontend --prefix plngx-dissect-frontend

pip install wheel
pip install -r backend/requirements.txt
pip install -r backend/requirements-dev.txt
