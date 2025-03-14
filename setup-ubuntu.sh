#!/bin/bash

# This script installs the necessary dependencies for the Puppeteer service on Ubuntu

echo "Setting up Puppeteer service on Ubuntu..."

# Update package lists
sudo apt-get update

# Install Node.js dependencies
sudo apt-get install -y ca-certificates curl gnupg

# Add NodeSource repository
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# Update package lists again
sudo apt-get update

# Install Node.js
sudo apt-get install -y nodejs

# Install Puppeteer dependencies
sudo apt-get install -y \
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  libappindicator1 \
  libnss3 \
  lsb-release \
  xdg-utils \
  wget

# Install PM2 for process management
sudo npm install -g pm2

# Create directory for the service
mkdir -p ~/puppeteer-service

echo "All dependencies have been installed."
echo "Next steps:"
echo "1. Copy the service files to ~/puppeteer-service"
echo "2. Run 'cd ~/puppeteer-service && npm install'"
echo "3. Start the service with PM2: 'pm2 start index.js --name puppeteer-service'"
echo "4. Save the PM2 process list: 'pm2 save'"
echo "5. Set PM2 to start at boot: 'pm2 startup'"