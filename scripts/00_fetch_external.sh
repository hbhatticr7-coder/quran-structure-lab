#!/usr/bin/env bash
# Fetches the third-party data that is not stored in this repository.
# Run from the repository root:  bash scripts/00_fetch_external.sh
set -euo pipefail

mkdir -p data/external/oshb data/external/morphgnt data/external/tanzil data/external/wikipedia

# Open Scriptures Hebrew Bible (CC BY 4.0): batches 3, 5, 12
for b in Gen 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr; do
  curl -sS -L -o "data/external/oshb/$b.xml" "https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc/$b.xml"
done

# MorphGNT SBLGNT (morphology CC BY-SA; see sblgnt.com/license for the text): batches 5, 12
for f in 61-Mt 62-Mk 63-Lk; do
  curl -sS -L -o "data/external/morphgnt/$f-morphgnt.txt" "https://raw.githubusercontent.com/morphgnt/sblgnt/master/$f-morphgnt.txt"
done

# Sura metadata from Tanzil (CC BY) and Wikipedia's chapter list (CC BY-SA).
# Only needed to rebuild data/chronology.json, which is already in the repository.
# The Wikipedia page changes over time; the committed chronology.json is the version used.
curl -sS -L -o data/external/tanzil/quran-data.xml "https://tanzil.net/res/text/metadata/quran-data.xml"
curl -sS -L -A "research-script/1.0" -o data/external/wikipedia/list_of_chapters.wikitext "https://en.wikipedia.org/w/index.php?title=List_of_chapters_in_the_Quran&action=raw"

echo "done"
