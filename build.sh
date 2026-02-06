#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="./build"
TARGET="${1:-linux-amd64}"
PLEX_URL="${PLEX_URL:-}"
PLEX_TOKEN="${PLEX_TOKEN:-}"

echo -e "${YELLOW}MovieMatch Build Script${NC}"
echo "========================"

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command -v deno &> /dev/null; then
    echo -e "${RED}Deno is not installed. Please install Deno first:${NC}"
    echo "curl -fsSL https://deno.land/install.sh | sh"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command -v just &> /dev/null; then
    echo -e "${RED}Just is not installed. Please install Just first:${NC}"
    echo "curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites found${NC}"

# Build binary
echo -e "\n${YELLOW}Building binary for ${TARGET}...${NC}"
just build-binary "${TARGET}"
echo -e "${GREEN}✓ Binary built successfully${NC}"

# Build Docker image
echo -e "\n${YELLOW}Building Docker image...${NC}"
docker build -t moviematch:local -f configs/Dockerfile .
echo -e "${GREEN}✓ Docker image built successfully${NC}"

