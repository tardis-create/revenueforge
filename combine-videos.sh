#!/bin/bash
# Combine all test videos into a single MP4 file

cd /home/pronit/workspace/revenueforge

DATE=$(date +%Y-%m-%d)
OUTPUT_DIR="./test-videos"
OUTPUT_FILE="${OUTPUT_DIR}/revenueforge-${DATE}.mp4"

mkdir -p "$OUTPUT_DIR"

echo "🎥 Combining test videos..."
echo "Output: $OUTPUT_FILE"
echo ""

# Find all webm files
VIDEO_FILES=$(find test-results -name "video.webm" -type f | sort)

if [ -z "$VIDEO_FILES" ]; then
    echo "❌ No video files found"
    exit 1
fi

# Count videos
VIDEO_COUNT=$(echo "$VIDEO_FILES" | wc -l)
echo "Found $VIDEO_COUNT video files"
echo ""

# Create file list for ffmpeg
LIST_FILE=$(mktemp)
echo "$VIDEO_FILES" | while read video; do
    echo "file '$(pwd)/$video'" >> "$LIST_FILE"
done

# Check if ffmpeg is available
if command -v ffmpeg &> /dev/null; then
    echo "Combining videos with ffmpeg..."
    
    # Concatenate all videos
    ffmpeg -f concat -safe 0 -i "$LIST_FILE" -c copy "$OUTPUT_FILE" -y 2>&1 | grep -E "(Duration|Output|frame|video|audio)" | tail -10
    
    if [ -f "$OUTPUT_FILE" ]; then
        echo ""
        echo "✅ Combined video saved to: $OUTPUT_FILE"
        ls -lh "$OUTPUT_FILE"
    else
        echo "❌ Failed to create combined video"
        echo "Individual videos are available in test-results/ directories"
    fi
    
    rm -f "$LIST_FILE"
else
    echo "⚠️  ffmpeg not found - cannot combine videos"
    echo "Individual videos are available in:"
    echo "$VIDEO_FILES"
    
    # Copy individual videos to output directory
    echo ""
    echo "Copying individual videos to $OUTPUT_DIR/..."
    mkdir -p "$OUTPUT_DIR/individual"
    
    counter=1
    echo "$VIDEO_FILES" | while read video; do
        test_name=$(basename $(dirname "$video") | cut -c1-50)
        cp "$video" "$OUTPUT_DIR/individual/${counter}-${test_name}.webm"
        counter=$((counter + 1))
    done
    
    echo "✅ Individual videos copied to $OUTPUT_DIR/individual/"
fi

echo ""
echo "📊 Test Run Summary"
echo "==================="
echo "Total videos recorded: $VIDEO_COUNT"
echo "Video location: $OUTPUT_DIR"
