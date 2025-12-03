#!/bin/bash
set -euo pipefail

# Generate same locales as in Dockerfile
sudo bash -c "
    sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    sed -i -e 's/# de_DE.UTF-8 UTF-8/de_DE.UTF-8 UTF-8/' /etc/locale.gen && \
    sed -i -e 's/# fr_FR.UTF-8 UTF-8/fr_FR.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales
"

. ${NVM_DIR}/nvm.sh 
nvm install 22
npm install --include dev plngx-dissect-frontend --prefix plngx-dissect-frontend

pushd backend
uv sync --no-python-downloads --no-install-project
popd
