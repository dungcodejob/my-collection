#!/usr/bin/env sh

# Setup Node.js environment using nvm
# This script loads nvm and switches to the Node.js version specified in .nvmrc

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Use Node.js version specified in .nvmrc
echo "🔄 Switching to Node.js version specified in .nvmrc..."
nvm use

# Verify Node.js version
echo "✅ Using Node.js version: $(node --version)"
echo "✅ Using npm version: $(npm --version)"