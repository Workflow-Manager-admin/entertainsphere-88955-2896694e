#!/bin/bash
cd /home/kavia/workspace/code-generation/entertainsphere-88955-2896694e/funbase_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

