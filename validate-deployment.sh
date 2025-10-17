#!/bin/bash

# Valura Deployment Validation Script
# This script checks if all services are running correctly

echo "🚀 Valura Deployment Validation"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check HTTP status
check_url() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3
    
    echo -n "Checking $description... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10)
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ OK${NC} ($status_code)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} ($status_code)"
        return 1
    fi
}

# Function to check Docker container
check_container() {
    local container_name=$1
    local description=$2
    
    echo -n "Checking $description container... "
    
    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        return 0
    else
        echo -e "${RED}✗ NOT RUNNING${NC}"
        return 1
    fi
}

echo "1. Docker Container Health Checks"
echo "=================================="

check_container "valura-homepage" "Frontend"
check_container "valura-mail" "Backend"

echo ""
echo "2. Local Health Checks (if running locally)"
echo "============================================"

# Check if running locally
if docker ps --format "table {{.Names}}" | grep -q "valura"; then
    check_url "http://localhost:80" 200 "Frontend (local)"
    check_url "http://localhost:3015/health" 200 "Backend health endpoint (local)"
    check_url "http://localhost:3015/api/hola" 200 "Backend API test (local)"
fi

echo ""
echo "3. Production Health Checks"
echo "=========================="

# Production URLs (comment out if not deployed yet)
# check_url "https://valura.mx" 200 "Production Frontend"
# check_url "https://valura.mx/health" 200 "Production Backend Health"
# check_url "https://api.valura.mx/health" 200 "Production API Health"

echo ""
echo "4. Docker Compose Status"
echo "========================"

if [ -f "docker-compose.yml" ]; then
    echo "Services defined in docker-compose.yml:"
    docker-compose config --services
    
    echo ""
    echo "Current status:"
    docker-compose ps
else
    echo -e "${YELLOW}⚠ docker-compose.yml not found in current directory${NC}"
fi

echo ""
echo "5. Environment Check"
echo "==================="

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ Backend .env file exists${NC}"
    
    # Check if required variables are set (without showing values)
    if grep -q "EMAIL_USER=" backend/.env && grep -q "EMAIL_PASS=" backend/.env && grep -q "PORT=" backend/.env; then
        echo -e "${GREEN}✓ Required environment variables are set${NC}"
    else
        echo -e "${RED}✗ Missing required environment variables${NC}"
        echo "Required: EMAIL_USER, EMAIL_PASS, PORT"
    fi
else
    echo -e "${RED}✗ Backend .env file missing${NC}"
    echo "Copy backend/.env.example to backend/.env and configure it"
fi

echo ""
echo "6. Network Check"
echo "================"

if docker network ls | grep -q "dokploy-network"; then
    echo -e "${GREEN}✓ dokploy-network exists${NC}"
else
    echo -e "${YELLOW}⚠ dokploy-network not found${NC}"
    echo "Create it with: docker network create dokploy-network"
fi

echo ""
echo "Validation Complete!"
echo "==================="
echo ""
echo "Quick Commands:"
echo "• View logs: docker-compose logs -f"
echo "• Restart:   docker-compose restart"
echo "• Rebuild:   docker-compose up -d --build"
echo "• Stop:      docker-compose down"
echo ""
echo "For production deployment, see DOKPLOY_DEPLOYMENT.md"