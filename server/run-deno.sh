#!/bin/sh

set -e

cd "$(dirname "$0")"

deno run ./packages/deno/index.ts
