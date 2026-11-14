# Pre-registration, batch 3: Yusuf against Genesis

Written 2026-11-14, after batches 1 and 2 and before any Hebrew data were parsed or analysed.
At this point the Genesis file had been downloaded and its first lines inspected for format only, and Rendsburg's outline had been transcribed from his 2020 paper.
The SHA-256 of this file is recorded in `results/batch3.json`. Internal pre-registration only.

## Question

Batch 1 found that Farrin's ring for sura 12 is the best of 945 possible pairings of its sections. Sura 12 tells a story whose plot mirrors itself, so the ring may follow from the plot. Does the Genesis telling of the same story (Genesis 37-50) show a ring in its wording too?

## Data

- Hebrew: Open Scriptures Hebrew Bible (morphhb), `Gen.xml`, Westminster Leningrad Codex with lemma (Strong's number) and morphology per word. CC BY 4.0.
- Content words: verbs, nouns (including proper nouns) and adjectives, which is the closest match to the root-bearing words used for the Quran. Alternate readings inside notes are dropped.
- Similarity: M2 as before. Each section is a bag of lemmas; weight = ln(1 + count) x idf; cosine. idf = ln(1533 / number of Genesis verses containing the lemma).

## Tests

**G0. Does the measure work on Hebrew? (validation)**
Genesis tells the "wife presented as sister" story twice in close wording: 12:10-20 and 20:1-18. The similarity of these two passages is compared with the similarity of 12:10-20 to every 18-verse window of Genesis that overlaps neither passage nor the third version at 26:1-11. Pass mark: 95th percentile or higher. If G0 fails, the Genesis results below are reported as uninterpretable.

**G1. Rendsburg's ring (primary).**
Twelve units, six mirror pairs (`rendsburg-ring-genesis-joseph` in the registry). Statistic: sum of M2 similarities over the six claimed pairs. Null: all 10,395 ways of pairing the twelve units. Exact one-sided p. Threshold p < 0.05.

**G2. The Quranic mirror plan applied to Genesis.**
Genesis episodes matched by plot to Farrin's sections a, b, c, c', b', a' (`genesis-plot-aligned`). Null: all 15 pairings.

**G3. Reference: sura 12 under the same six-section design** (`yusuf-reduced`). Not blind.

## Secondary

- G1 with idf computed over Genesis 37-50 only.
- G2 with the genealogy (46:8-27) included in a'.
- For each claimed pair in G1 and G2: the rank of the claimed partner among all possible partners.

## How results will be read

- G1 significant: the Genesis telling also has a ring in its wording under its own published outline. Sura 12's ring is then not distinctive on this evidence, and a mirrored plot is enough to explain it.
- G1 not significant and G0 passed: under the best-known published outline, the Genesis telling does not show a lexical ring, while sura 12 does under Farrin's. The Quranic telling is then the more tightly mirrored of the two in its wording.
- No test of the difference between the two texts is possible: there is one text on each side.

## Limits stated in advance

- Two languages and two annotation schemes (Strong's lemmas against Quranic Arabic Corpus lemmas).
- Genesis 37-50 is about four times longer than sura 12 and its units are much longer. Longer units give steadier similarity estimates, which should make a real ring easier to detect in Genesis, not harder.
- The two outlines come from different scholars. Rendsburg's argument rests partly on themes and on specific catchwords, and a thematic parallel without shared distinctive vocabulary is invisible to M2.
- Genesis 37-50 includes material with no counterpart in sura 12 (Judah and Tamar, Jacob's blessings, the deaths of Jacob and Joseph).
- One comparison text. Nothing here generalises beyond these two tellings.
