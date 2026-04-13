#!/bin/bash

# Default values
PROJECT_NAME=$(basename $(git rev-parse --show-toplevel))
BUILD_MODE="production"

# Override defaults with environment variables if they exist
if [ -n "$1" ]; then
  BUILD_MODE=$1
fi


echo "Building for mode: $BUILD_MODE"
echo "Project name: $PROJECT_NAME"

# Run vite build
vite build --mode $BUILD_MODE

# Create zip file
ZIP_FILE="build-${BUILD_MODE}-${PROJECT_NAME}-$(date +%d-%m-%y)-$(date +%H-%M-%S).zip"
BUILD_FILE="build-${BUILD_MODE}"
echo $ZIP_FILE $BUILD_FILE
zip -r $ZIP_FILE $BUILD_FILE > /dev/null
echo "Build complete. Zip file created: $ZIP_FILE"
