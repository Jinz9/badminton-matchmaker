#!/usr/bin/env bash
set -e
echo "========================================================"
echo " CHAY TOAN BO TEST SUITE (DOMAIN + CONFIG + FUNCTIONS)"
echo "========================================================"
npm test

echo "--------------------------------------------------------"
echo " CHAY TEST CLOUD FUNCTIONS"
echo "--------------------------------------------------------"
node scripts/sync-domain.js
cd functions && npm test && cd ..
