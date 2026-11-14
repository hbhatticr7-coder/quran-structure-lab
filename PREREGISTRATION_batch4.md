# Pre-registration, batch 4: near-twin verses

Written 2026-11-14, after batches 1 to 3 and before any twin-verse alignment or context-fit code was written or run.
The SHA-256 of this file is recorded in `results/batch4.json`. Internal pre-registration only.

## Question

The Quran contains many pairs of verses that are almost identical but differ by a word. Classical works on these verses (al-Iskafi, al-Kirmani, Ibn al-Zubayr) hold that each difference suits the place where it occurs. Is each variant word more at home in its own sura than its twin's word would be?

## Prior work found before writing this

Qualitative studies of individual cases and stories, and computational work that detects similar verses. Two searches found no statistical test of whether the differing words fit their contexts.

## Finding the pairs

- Each verse is its sequence of content roots (root-bearing words), as in earlier batches.
- Two verses in different suras are aligned by longest common subsequence (LCS) of roots.
- A pair is a near-twin if LCS >= 5 and LCS / (length of the longer verse) >= 0.6.
- A substitution site is a place between two consecutive matched roots where each verse has exactly one unmatched root. The two unmatched roots (a in verse A, b in verse B) are the variants. Sites at the edges of the alignment, insertions and deletions are not used.
- Each verse is used once: pairs with at least one site are taken in order of similarity ratio (then LCS length, then position), skipping any pair that reuses a verse.

## Context fit

For a root w and a context C (a set of verses), p(w | C) = (count of w in C + 0.5) / (content words in C + 0.5 x number of distinct roots in the Quran).

For one site, with A in sura X and B in sura Y:

D = ln p(a | X) - ln p(b | X) + ln p(b | Y) - ln p(a | Y)

D is positive when each variant is relatively more frequent in its own context. Swapping the two variants turns D into -D exactly, so under the hypothesis that the assignment of variants to places is unrelated to context, D is symmetric around zero. A pair's score is the sum of D over its sites.

## Primary test

Context = the whole sura, leaving out the twin verse itself (A from X, B from Y).
Statistic: mean pair score over pairs whose score is not zero. Null: random sign flips of pair scores, 100,000 draws, seed 20261116. One-sided, threshold p < 0.05. The count of positive and negative pairs is also reported.

## Secondary analyses (no confirmatory weight)

- **Strict context.** The sura, leaving out the verse, the ten verses on either side, and every verse in either sura that is itself a near-twin (by the rule above) of A or B. This removes local repetition and repeated formulas, and asks whether the variant fits the rest of the sura.
- **Local context.** Only the ten verses on either side.
- **Period context.** In place of each sura, the three suras before and three after it in the Egyptian revelation order (excluding both suras of the pair). This asks whether a variant fits the vocabulary of its time, which an author's changing word preferences would produce.
- **Association measure.** Fit by co-occurrence instead of frequency: fit(w, C) = average over content words c in C of the positive pointwise mutual information between w and c (verse-level co-occurrence across the Quran, pairs co-occurring in at least two verses). Same D, same test, whole-sura context.
- **Thresholds.** Primary test repeated with similarity ratio 0.5 and 0.7.
- The twenty sites with the largest and smallest D are listed for inspection.

## How results will be read

- Primary and strict both positive: variant words fit the wider vocabulary of their sura.
- Primary positive, strict not: the fit comes from local wording and repeated formulas within a sura. That is consistent diction, a weaker thing than the classical claim.
- Period context about as strong as the sura context: the pattern is explained by vocabulary changing over time.
- Null: no fit detectable by these measures.

## Limits stated in advance

- Frequency and co-occurrence are crude stand-ins for "suits its place". Classical explanations are mostly about meaning, emphasis and rhetoric, and many would be invisible here. A null does not refute them.
- Many variant roots are rare, so many sites will carry no information (D = 0).
- A positive result shows that word choice is sensitive to context. Careful human composition has the same property; this test cannot rank the Quran against other texts.
- Function-word variants (wa / fa, word order, pronouns), which make up much of the classical literature, are outside this test.

---

## Amendment A1 (written after seeing the yield, before computing any fit)

Running the pair-finding rules with `--count` (which computes no context fit) gave 252 near-twin pairs across suras at ratio 0.6, of which only 24 contain a one-for-one substitution site; 21 pairs and 22 sites survive the one-pair-per-verse rule. Most near-twins differ by added or dropped words, or sit inside longer verses that fail the whole-verse ratio. The registered primary test stays as written and will be reported, but it is expected to have little power.

To address this, a phrase-level analysis is added. Its rule is fixed here before its yield is known and will not be tuned.

**Phrase-level sites.** A frame is four roots: the two content roots before a position and the two after it, inside one verse. Every position in the Quran with a full frame is an occurrence, recording the root in the middle. A frame is used if its occurrences show at least two different middle roots and lie in at least two suras.

**Statistic.** For an occurrence o with middle root m in sura X, the context is sura X leaving out o's verse. For a frame, T = sum over its occurrences of ln p(m | context). The null permutes the middle roots among the occurrences of the same frame; with two occurrences this is the swap used above and T(observed) - T(swapped) = D. The test statistic is the sum over frames of T(observed) minus the mean of T under permutation. Null: independent random permutations within every frame, 100,000 draws, seed 20261117, one-sided.

**Variants of the phrase-level test** (same statistic):
- Strict context: the sura leaving out the verse, the ten verses on either side, and every verse of that sura containing the same frame.
- Local context: the ten verses on either side.
- Period context: three suras before and three after in the Egyptian order, excluding the occurrence's own sura.

**Status.** Because it was added after the yield of the registered test was seen, the phrase-level result is reported as an amended analysis, not as the registered primary. Its reading follows the same rules as above.
