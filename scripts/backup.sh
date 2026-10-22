#!/usr/bin/env bash
# Dated backup of the local data store (orders, products, settings) and uploaded images.
# Usage:  npm run backup            (saves next to the project, in "Project 2/Backups")
#         BACKUP_DIR=/some/folder npm run backup
set -euo pipefail

cd "$(dirname "$0")/.."

DEST="${BACKUP_DIR:-$(cd .. && pwd)/Backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$DEST/outtake-$STAMP"

if [ ! -f data/db.json ]; then
  echo "No data/db.json found — nothing to back up." >&2
  exit 1
fi

mkdir -p "$OUT"
cp data/db.json "$OUT/db.json"
[ -d public/uploads ] && cp -R public/uploads "$OUT/uploads"

# Keep the 30 most recent backups
ls -1d "$DEST"/outtake-* 2>/dev/null | sort -r | tail -n +31 | while read -r old; do rm -rf "$old"; done

echo "Backup saved to: $OUT"
du -sh "$OUT" | awk '{print "Size: " $1}'
