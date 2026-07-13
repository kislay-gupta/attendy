#!/bin/bash
# Prettier format hook script
# Resolve the workspace root directory (two levels up from this script in .agents/hooks/)
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$WORKSPACE_ROOT"

# Run prettier write command
if [ -f "package.json" ]; then
  npx prettier --write .
fi
