#!/bin/bash

###############################################################################
# Build n8n Frontend for Next.js Integration
# 
# This script builds the n8n frontend and copies it to your Next.js project.
# 
# Usage:
#   ./build-n8n-frontend.sh [backend-api-url] [nextjs-public-dir]
# 
# Examples:
#   ./build-n8n-frontend.sh http://localhost:5678/ ./public/n8n-editor
#   ./build-n8n-frontend.sh https://api.example.com/ /path/to/nextjs/public/n8n-editor
###############################################################################

set -e

# Default values
BACKEND_API_URL="${1:-http://localhost:5678/}"
NEXTJS_PUBLIC_DIR="${2:-./public/n8n-editor}"
N8N_REPO_DIR="${N8N_REPO_DIR:-./n8n}"

echo "=========================================="
echo "Building n8n Frontend"
echo "=========================================="
echo "Backend API URL: $BACKEND_API_URL"
echo "Next.js Public Dir: $NEXTJS_PUBLIC_DIR"
echo "n8n Repo Dir: $N8N_REPO_DIR"
echo ""

# Check if n8n repository exists
if [ ! -d "$N8N_REPO_DIR" ]; then
  echo "Error: n8n repository not found at $N8N_REPO_DIR"
  echo "Please clone n8n first or set N8N_REPO_DIR environment variable"
  exit 1
fi

# Navigate to n8n repository
cd "$N8N_REPO_DIR"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "Installing n8n dependencies..."
  pnpm install
fi

# Build the frontend with the specified backend API URL
echo ""
echo "Building frontend..."
cd packages/frontend/editor-ui

# Check if cross-env is available
if command -v cross-env >/dev/null 2>&1; then
  # Use cross-env if available
  cross-env VUE_APP_URL_BASE_API="$BACKEND_API_URL" pnpm build
else
  # Fallback to direct environment variable setting
  echo "Note: cross-env not found in PATH, using direct environment variable"
  VUE_APP_URL_BASE_API="$BACKEND_API_URL" pnpm build
fi

# Navigate back to original directory
cd -

# Create target directory if it doesn't exist
mkdir -p "$NEXTJS_PUBLIC_DIR"

# Copy the built files
echo ""
echo "Copying built files to Next.js public directory..."
cp -r packages/frontend/editor-ui/dist/* "$NEXTJS_PUBLIC_DIR/"

echo ""
echo "=========================================="
echo "Build Complete!"
echo "=========================================="
echo "The n8n frontend has been built and copied to:"
echo "  $NEXTJS_PUBLIC_DIR"
echo ""
echo "You can now access it in your Next.js app at:"
echo "  /n8n-editor/index.html"
echo ""
echo "Next steps:"
echo "  1. Ensure your backend is running at $BACKEND_API_URL"
echo "  2. Create a Next.js page to embed the editor (see examples)"
echo "  3. Test the integration"
echo "=========================================="
