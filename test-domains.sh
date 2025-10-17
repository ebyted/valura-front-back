#!/bin/bash

# Test script for multi-domain configuration
# This script tests that both domains are properly configured

echo "🔍 Testing domain configuration for valura.mx and valura.webitofrito.com"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test a URL
test_url() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description ($url)... "
    
    if curl -s -f -o /dev/null "$url"; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Function to test redirect
test_redirect() {
    local url=$1
    local expected_location=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    local actual_location=$(curl -s -I "$url" | grep -i "^location:" | cut -d' ' -f2 | tr -d '\r\n')
    
    if [[ "$actual_location" == "$expected_location"* ]]; then
        echo -e "${GREEN}✓ OK${NC} (redirects to $actual_location)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (expected: $expected_location, got: $actual_location)"
        return 1
    fi
}

echo -e "\n${YELLOW}Testing main domains:${NC}"
test_url "https://valura.mx" "valura.mx"
test_url "https://valura.webitofrito.com" "valura.webitofrito.com"

echo -e "\n${YELLOW}Testing WWW redirects:${NC}"
test_redirect "https://www.valura.mx" "https://valura.mx" "www.valura.mx → valura.mx"
test_redirect "https://www.valura.webitofrito.com" "https://valura.webitofrito.com" "www.valura.webitofrito.com → valura.webitofrito.com"

echo -e "\n${YELLOW}Testing API endpoints:${NC}"
test_url "https://valura.mx/api/hola" "valura.mx API"
test_url "https://valura.webitofrito.com/api/hola" "valura.webitofrito.com API"
test_url "https://api.valura.mx/hola" "api.valura.mx"
test_url "https://api.valura.webitofrito.com/hola" "api.valura.webitofrito.com"

echo -e "\n${YELLOW}Testing health endpoints:${NC}"
test_url "https://valura.mx/health" "valura.mx health check"
test_url "https://valura.webitofrito.com/health" "valura.webitofrito.com health check"

echo -e "\n${YELLOW}Testing HTTP to HTTPS redirects:${NC}"
test_redirect "http://valura.mx" "https://valura.mx" "HTTP → HTTPS (valura.mx)"
test_redirect "http://valura.webitofrito.com" "https://valura.webitofrito.com" "HTTP → HTTPS (valura.webitofrito.com)"

echo ""
echo "=================================================="
echo "🏁 Domain configuration test completed!"
echo ""
echo "📝 Notes:"
echo "   • Make sure both domains point to your server's IP"
echo "   • DNS propagation may take up to 48 hours"
echo "   • SSL certificates will be generated automatically by Let's Encrypt"
echo "   • Backend runs on port 7099 internally"
echo "   • If tests fail, check Traefik logs: docker-compose logs traefik"