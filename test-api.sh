#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}Testing Barber Shop API${NC}\n"

# Test 1: Slots API
echo -e "${YELLOW}1. Testing /api/slots${NC}"
SLOTS_RESPONSE=$(curl -s "$BASE_URL/api/slots")
if echo "$SLOTS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Slots API working${NC}"
    echo "Response: $SLOTS_RESPONSE" | head -c 200
    echo -e "\n"
else
    echo -e "${RED}✗ Slots API failed${NC}"
    echo "Response: $SLOTS_RESPONSE"
    echo -e "\n"
fi

# Test 2: Queue API
echo -e "${YELLOW}2. Testing /api/queue${NC}"
QUEUE_RESPONSE=$(curl -s "$BASE_URL/api/queue")
if echo "$QUEUE_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Queue API working${NC}"
    echo "Response: $QUEUE_RESPONSE" | head -c 200
    echo -e "\n"
else
    echo -e "${RED}✗ Queue API failed${NC}"
    echo "Response: $QUEUE_RESPONSE"
    echo -e "\n"
fi

# Test 3: Book API (invalid data)
echo -e "${YELLOW}3. Testing /api/book (validation)${NC}"
BOOK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/book" \
  -H "Content-Type: application/json" \
  -d '{"name":"","phone":""}')
if echo "$BOOK_RESPONSE" | grep -q '"success":false'; then
    echo -e "${GREEN}✓ Book API validation working${NC}"
    echo "Response: $BOOK_RESPONSE" | head -c 200
    echo -e "\n"
else
    echo -e "${RED}✗ Book API validation failed${NC}"
    echo "Response: $BOOK_RESPONSE"
    echo -e "\n"
fi

# Test 4: Admin Login API
echo -e "${YELLOW}4. Testing /api/admin/login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Admin Login API working${NC}"
    echo "Response: $LOGIN_RESPONSE" | head -c 200
    echo -e "\n"
else
    echo -e "${RED}✗ Admin Login API failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    echo -e "\n"
fi

echo -e "${YELLOW}Testing complete!${NC}"
