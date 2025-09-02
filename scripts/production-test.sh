#!/bin/bash

# =======================================================
# BCS E-Textbook Platform - Production Testing Script
# =======================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BASE_URL="http://localhost:3000"
ADMIN_EMAIL="test@faculty.com"
ADMIN_PASSWORD="testpassword123"

# Test results
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    log "Running test: $test_name"
    
    if eval "$test_command"; then
        success "✓ $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        error "✗ $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# HTTP request helper
make_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local expected_status="$4"
    
    local response
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint" 2>/dev/null || echo "HTTPSTATUS:000")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X "$method" \
            "$BASE_URL$endpoint" 2>/dev/null || echo "HTTPSTATUS:000")
    fi
    
    local http_status=$(echo "$response" | grep -o 'HTTPSTATUS:[0-9]*' | cut -d: -f2)
    local body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    if [ "$http_status" = "$expected_status" ]; then
        return 0
    else
        echo "Expected status $expected_status, got $http_status"
        return 1
    fi
}

# Start testing
log "Starting BCS E-Textbook Platform Production Tests..."
echo ""

# =======================================================
# 1. Application Health Tests
# =======================================================

log "=== Application Health Tests ==="

run_test "Application is running" \
    "curl -f -s $BASE_URL >/dev/null" \
    "200"

run_test "Health endpoint responds" \
    "make_request GET /api/health '' 200" \
    "200"

run_test "Homepage loads" \
    "make_request GET / '' 200" \
    "200"

run_test "Login page loads" \
    "make_request GET /auth/login '' 200" \
    "200"

echo ""

# =======================================================
# 2. Database Connectivity Tests
# =======================================================

log "=== Database Connectivity Tests ==="

run_test "Database connection" \
    "npx prisma db execute --stdin <<< 'SELECT 1;' >/dev/null 2>&1" \
    "success"

run_test "Prisma client works" \
    "node -e 'require(\"./src/lib/db\").prisma.\$queryRaw\`SELECT 1\`.then(() => console.log(\"OK\")).catch(() => process.exit(1))'" \
    "success"

echo ""

# =======================================================
# 3. API Endpoint Tests
# =======================================================

log "=== API Endpoint Tests ==="

run_test "Auth API responds" \
    "make_request GET /api/auth/csrf '' 200" \
    "200"

run_test "Modules API requires auth" \
    "make_request GET /api/modules '' 401" \
    "401"

run_test "Courses API requires auth" \
    "make_request GET /api/courses '' 401" \
    "401"

echo ""

# =======================================================
# 4. Static Asset Tests
# =======================================================

log "=== Static Asset Tests ==="

run_test "Favicon loads" \
    "make_request GET /favicon.ico '' 200" \
    "200"

run_test "Manifest file loads" \
    "make_request GET /manifest.json '' 200" \
    "200"

run_test "Robots.txt loads" \
    "make_request GET /robots.txt '' 200" \
    "200"

echo ""

# =======================================================
# 5. Security Header Tests
# =======================================================

log "=== Security Header Tests ==="

check_security_header() {
    local header="$1"
    local expected_value="$2"
    
    local actual_value=$(curl -s -I "$BASE_URL" | grep -i "$header" | cut -d: -f2- | tr -d '\r\n' | sed 's/^ *//')
    
    if [[ "$actual_value" == *"$expected_value"* ]]; then
        return 0
    else
        echo "Expected header '$header' to contain '$expected_value', got '$actual_value'"
        return 1
    fi
}

run_test "X-Frame-Options header" \
    "check_security_header 'X-Frame-Options' 'SAMEORIGIN'" \
    "present"

run_test "X-Content-Type-Options header" \
    "check_security_header 'X-Content-Type-Options' 'nosniff'" \
    "present"

run_test "X-XSS-Protection header" \
    "check_security_header 'X-XSS-Protection' '1; mode=block'" \
    "present"

if [ "$FORCE_HTTPS" = "true" ]; then
    run_test "HSTS header (if HTTPS)" \
        "check_security_header 'Strict-Transport-Security' 'max-age'" \
        "present"
fi

echo ""

# =======================================================
# 6. Performance Tests
# =======================================================

log "=== Performance Tests ==="

check_response_time() {
    local endpoint="$1"
    local max_time="$2"
    
    local response_time=$(curl -w "%{time_total}" -s -o /dev/null "$BASE_URL$endpoint")
    local response_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
    
    if [ "$response_ms" -lt "$max_time" ]; then
        return 0
    else
        echo "Response time ${response_ms}ms exceeds maximum ${max_time}ms"
        return 1
    fi
}

run_test "Homepage loads under 3s" \
    "check_response_time '/' 3000" \
    "fast"

run_test "Health check loads under 1s" \
    "check_response_time '/api/health' 1000" \
    "fast"

echo ""

# =======================================================
# 7. File Upload Tests (if configured)
# =======================================================

log "=== File Upload Tests ==="

# Create a small test file
echo "Test file content" > /tmp/test_upload.txt

# Note: These tests would require authentication, so we'll test the endpoint exists
run_test "Upload endpoint exists (returns 401 without auth)" \
    "make_request POST /api/upload '' 401" \
    "401"

# Cleanup
rm -f /tmp/test_upload.txt

echo ""

# =======================================================
# 8. Environment Configuration Tests
# =======================================================

log "=== Environment Configuration Tests ==="

check_env_var() {
    local var_name="$1"
    if [ -n "${!var_name}" ]; then
        return 0
    else
        echo "Environment variable $var_name is not set"
        return 1
    fi
}

run_test "NODE_ENV is production" \
    "[ '$NODE_ENV' = 'production' ]" \
    "set"

run_test "DATABASE_URL is configured" \
    "check_env_var DATABASE_URL" \
    "set"

run_test "NEXTAUTH_SECRET is configured" \
    "check_env_var NEXTAUTH_SECRET" \
    "set"

run_test "NEXTAUTH_URL is configured" \
    "check_env_var NEXTAUTH_URL" \
    "set"

echo ""

# =======================================================
# 9. SSL/HTTPS Tests (if applicable)
# =======================================================

if [[ "$NEXTAUTH_URL" == https://* ]]; then
    log "=== SSL/HTTPS Tests ==="
    
    HTTPS_URL=$(echo "$NEXTAUTH_URL" | sed 's/http:/https:/')
    
    run_test "HTTPS endpoint responds" \
        "curl -f -s '$HTTPS_URL' >/dev/null" \
        "200"
    
    run_test "HTTP redirects to HTTPS (if configured)" \
        "curl -s -I '$BASE_URL' | grep -q '30[12]' && curl -s -I '$BASE_URL' | grep -q 'https'" \
        "redirects"
    
    echo ""
fi

# =======================================================
# 10. Application-Specific Tests
# =======================================================

log "=== Application-Specific Tests ==="

run_test "Faculty dashboard route exists (requires auth)" \
    "make_request GET /faculty/dashboard '' 302" \
    "302"

run_test "Public courses route works" \
    "make_request GET /courses '' 200" \
    "200"

run_test "Graph visualization route exists" \
    "make_request GET /faculty/visualization '' 302" \
    "302"

echo ""

# =======================================================
# Test Results Summary
# =======================================================

echo ""
log "=== Test Results Summary ==="
echo ""
echo -e "Tests Run:    ${BLUE}$TESTS_RUN${NC}"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    success "🎉 All tests passed! Production environment is ready."
    echo ""
    echo -e "${GREEN}Production Readiness Checklist:${NC}"
    echo "✓ Application is running and responding"
    echo "✓ Database connectivity confirmed"
    echo "✓ API endpoints are secured"
    echo "✓ Security headers are configured"
    echo "✓ Performance meets targets"
    echo "✓ Environment variables are set"
    
    exit 0
else
    error "❌ Some tests failed. Please review and fix issues before production deployment."
    echo ""
    echo -e "${RED}Failed tests need attention:${NC}"
    echo "- Review application logs"
    echo "- Check environment configuration"
    echo "- Verify database connectivity"
    echo "- Test SSL/HTTPS setup"
    
    exit 1
fi
