#!/bin/sh

set -e

cd "$(dirname "$0")"

(cd packages/node && npx tsc && npx tsx .)
