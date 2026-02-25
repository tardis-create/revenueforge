#!/bin/bash
# RevenueForge E2E Test Runner with Video Recording
# Usage: ./run-e2e-tests.sh

set -e

echo "🧪 RevenueForge E2E Test Suite"
echo "==============================="
echo ""

# Configuration
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H-%M-%S)
VIDEO_DIR="./test-videos"
REPORT_DIR="./test-results"
OUTPUT_VIDEO="${VIDEO_DIR}/revenueforge-${DATE}.mp4"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create directories
mkdir -p "$VIDEO_DIR" "$REPORT_DIR"

echo "📁 Created output directories"
echo "   Videos: $VIDEO_DIR"
echo "   Reports: $REPORT_DIR"
echo ""

# Check Playwright is installed
if ! command -v npx playwright test &> /dev/null; then
    echo -e "${YELLOW}⚠️  Playwright not found, installing...${NC}"
    npm install -D @playwright/test
    npx playwright install chromium
fi

echo "🎬 Starting E2E test run..."
echo "   Date: $DATE"
echo "   Time: $TIME"
echo ""

# Run tests with video recording
echo "▶️  Running tests..."
npx playwright test \
  --project=chromium \
  --reporter=html,json \
  --output="$REPORT_DIR" \
  2>&1 | tee "$REPORT_DIR/test-output-${TIME}.log"

TEST_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "📊 Test Results"
echo "==============="

# Check test results
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed (exit code: $TEST_EXIT_CODE)${NC}"
fi

# List generated videos
echo ""
echo "📹 Recorded Videos:"
find "$REPORT_DIR" -name "*.webm" -type f 2>/dev/null | while read video; do
    echo "   - $video"
done

# Convert videos to MP4 if ffmpeg is available
if command -v ffmpeg &> /dev/null; then
    echo ""
    echo "🎥 Converting videos to MP4..."
    
    # Find all webm files and concatenate
    VIDEO_FILES=$(find "$REPORT_DIR" -name "*.webm" -type f | sort)
    
    if [ -n "$VIDEO_FILES" ]; then
        # Create file list for ffmpeg
        LIST_FILE="$REPORT_DIR/video-list.txt"
        > "$LIST_FILE"
        
        for video in $VIDEO_FILES; do
            echo "file '$video'" >> "$LIST_FILE"
        done
        
        # Concatenate videos
        ffmpeg -f concat -safe 0 -i "$LIST_FILE" -c copy "$OUTPUT_VIDEO" 2>/dev/null || {
            echo -e "${YELLOW}⚠️  Could not concatenate videos, copying individually${NC}"
            cp $VIDEO_FILES "$VIDEO_DIR/" 2>/dev/null || true
        }
        
        if [ -f "$OUTPUT_VIDEO" ]; then
            echo -e "${GREEN}✅ Combined video saved to: $OUTPUT_VIDEO${NC}"
        fi
        
        rm -f "$LIST_FILE"
    else
        echo -e "${YELLOW}⚠️  No video files found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  ffmpeg not found - videos remain in webm format${NC}"
    echo "   Install ffmpeg to enable MP4 conversion"
fi

# Generate summary report
echo ""
echo "📋 Test Summary"
echo "==============="

RESULTS_FILE="$REPORT_DIR/results.json"
if [ -f "$RESULTS_FILE" ]; then
    # Parse results
    PASSED=$(grep -o '"passed":[0-9]*' "$RESULTS_FILE" | grep -o '[0-9]*' || echo "0")
    FAILED=$(grep -o '"failed":[0-9]*' "$RESULTS_FILE" | grep -o '[0-9]*' || echo "0")
    TOTAL=$((PASSED + FAILED))
    
    echo "   Total Tests: $TOTAL"
    echo -e "   ${GREEN}Passed: $PASSED${NC}"
    if [ "$FAILED" -gt 0 ]; then
        echo -e "   ${RED}Failed: $FAILED${NC}"
    fi
    
    # Generate report file
    SUMMARY_FILE="$REPORT_DIR/summary-${DATE}-${TIME}.txt"
    {
        echo "RevenueForge E2E Test Summary"
        echo "Date: $DATE $TIME"
        echo "================================"
        echo ""
        echo "Results:"
        echo "  Total: $TOTAL"
        echo "  Passed: $PASSED"
        echo "  Failed: $FAILED"
        echo ""
        echo "Videos: $VIDEO_DIR"
        echo "Reports: $REPORT_DIR"
        echo ""
        if [ $TEST_EXIT_CODE -eq 0 ]; then
            echo "Status: ✅ ALL TESTS PASSED"
            echo "test_passed: true"
        else
            echo "Status: ❌ SOME TESTS FAILED"
            echo "test_passed: false"
        fi
    } > "$SUMMARY_FILE"
    
    echo ""
    echo "📄 Summary saved to: $SUMMARY_FILE"
fi

# Open HTML report if available
HTML_REPORT="$REPORT_DIR/index.html"
if [ -f "$HTML_REPORT" ]; then
    echo ""
    echo "📊 HTML Report: $HTML_REPORT"
    echo "   Open with: npx playwright show-report"
fi

echo ""
echo "==============================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Test run completed successfully${NC}"
    exit 0
else
    echo -e "${RED}❌ Test run completed with failures${NC}"
    exit 1
fi
