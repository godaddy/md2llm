#!/bin/bash

echo "🧪 Testing Windows compatibility..."

# Build and run Windows test container
echo "📦 Building Windows test container..."
docker build -f Dockerfile.windows-test -t md2llm-windows-test .

if [ $? -eq 0 ]; then
    echo "✅ Container built successfully"
    echo "🚀 Running Windows compatibility tests..."
    docker run --rm md2llm-windows-test
else
    echo "❌ Failed to build container"
    exit 1
fi 
