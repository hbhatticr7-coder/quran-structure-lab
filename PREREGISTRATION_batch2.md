# Pre-registration, batch 2: the arrangement test

Written 2026-11-14, after batch 1 and before any batch 2 analysis was coded or run.
At this point the revelation-order tables had been downloaded and validated (`data/chronology.json`), and nothing relating similarity to revelation order had been computed.
The SHA-256 of this file is recorded in `results/batch2.json`. Internal pre-registration only.

## Question

The mushaf order of suras is not the order of revelation. Do suras that sit next to each other in the mushaf share more distinctive vocabulary than their lengths and revelation dates predict?

## Prior work found before writing this

- Khadangi (Journal of Interdisciplinary Qur'anic Studies, 2022) reports that sura similarity tracks mushaf distance and concludes the order is organised.
- A later falsification study (seen only as an abstract) reports that 70 to 82 percent of the canonical order's advantage over random shuffles comes from its approximate sort by length.

So the question is not new. What this test adds is a direct control for each sura's own baseline, for length difference, and for two independent chronologies, with a permutation method built for pair data.

## Data

- Units: all 6,441 unordered pairs of suras.
- Similarity: M2 from batch 1 (tf-idf cosine over lemmas, sura level).
- Egyptian standard revelation order and Meccan/Medinan type: Tanzil metadata.
- Noldeke's order: Wikipedia's chapter list (citing Robinson 2003), cross-checked against Tanzil on verse counts and the Egyptian column (114 of 114 rows agree).
- W = words in a sura. MVL = words per verse (a style marker that tracks revelation period and does not depend on any traditional list).

## Model

Response S(i,j): rank the other 113 suras by similarity to sura i and convert to a percentile from 0 to 1 (ties share the average rank). S(i,j) is the mean of j's percentile in i's list and i's percentile in j's list. Chance level is 0.5.

Predictors:

- ADJ = 1 if the two suras are neighbours in the mushaf.
- CHRON = ln(1 + difference in Egyptian revelation rank).
- TYPE = 1 if both are Meccan or both Medinan.
- LEN = absolute difference of ln W.
- MVL = absolute difference of ln MVL.
- One fixed effect per sura (every pair carries its two suras' effects). This absorbs anything that makes a given sura similar to everything, including its length.

## Primary test

Coefficient of ADJ, one-sided (positive), tested by MRQAP with double semi-partialling (Dekker, Krackhardt and Snijders 2007): ADJ is residualised on the other predictors, the residual matrix is permuted by relabelling suras, and the t-statistic is recomputed. 10,000 permutations, seed 20261115. Threshold p < 0.05 (one primary test).

## Secondary analyses (no confirmatory weight)

- S1. Add GRAD = ln(mushaf distance) as a control. This asks whether immediate neighbours exceed the general trend of nearby suras being similar.
- S2. Replace the Egyptian order with Noldeke's.
- S3. Response = raw cosine instead of the percentile.
- S4. Distance profile: replace ADJ with indicators for mushaf distance 1, 2, 3, 4-5 and 6-10.
- S5. Split ADJ into Farrin's 53 pairs and the 60 other adjacent pairs (follow-up to batch 1 T1).
- S6. Symmetric check: coefficient of chronological adjacency (neighbours in the Egyptian order) with mushaf distance among the controls. This shows the size of effect the method finds for revelation-order neighbours.
- Descriptive: mean S for mushaf neighbours, for Egyptian-order neighbours, and for mushaf neighbours split at their median chronological distance.

## How results will be read

- ADJ positive in the primary test and in S1 to S3: mushaf adjacency carries lexical signal beyond length and revelation date.
- Positive in the primary but not in S1: nearby suras are similar in a broad way, which residual differences in genre or period could also produce. Adjacency itself is not shown.
- Null: no evidence that adjacency adds anything beyond the controls.

## Limits stated in advance

- Both chronologies are uncertain, and many suras contain material from more than one period.
- A positive result would show that the arrangement is not arbitrary with respect to wording. It would not show who arranged it or why. People arranging suras by hand could place similar ones together.
- Genre is controlled only through period, verse length and sura length.
