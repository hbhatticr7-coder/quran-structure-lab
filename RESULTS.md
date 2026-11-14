# Results, batch 1 (2026-11-14)

Tests were specified in `PREREGISTRATION.md` before they were coded, and each was run once. Full numbers are in `results/batch1.json`. Confirmation threshold for the three primary tests: p < 0.0167.

## Summary

| Claim (Farrin 2014) | Primary result | Verdict |
|---|---|---|
| 53 adjacent sura pairs | p = 0.041 | Suggestive, not confirmed |
| 19 sura groups | p = 0.49 | Not supported |
| Rings in suras 2, 3, 12 (combined) | p = 0.0015 | Confirmed, but only sura 12 carries it |

## T0. Rebuild check

The rebuilt pipeline reproduces the May 2026 session numbers exactly: 228 sura pairs share an exclusive 5-root formula (3.5% of all pairs), 628 verses carry one, and 4:43 / 5:6 share 12.

## T1. Sura pairs

Farrin's 53 pairs share more distinctive vocabulary than random adjacent pairings do (mean similarity 0.090 against 0.084, z = 1.9, p = 0.041). That misses the pre-set threshold. 31 of the 53 pairs are more similar to each other than to their neighbours on the other side.

The exclusive-formula measure points the same way without reaching significance (n = 3: p = 0.069; n = 5: p = 0.052). Only 5 to 8 of the 53 pairs share any exclusive formula at all, so that measure has little power for short suras.

## T2. Sura groups

Farrin's group boundaries do no better than the same group sizes placed at random along the sura sequence (p = 0.49; adjacent pairs excluded: p = 0.56; formulas n = 3: p = 0.72; n = 5: p = 0.15).

Per group, 2-5 stands clearly above its surroundings, with smaller positive differences for 57-66, 25-32 and 47-49. Most other groups are at or below zero.

## T3. Is the 2-5 cluster a size effect? (exploratory)

No. Suras 2-5 share 32 bridged verse pairs; their sizes predict about 18 and a degree-preserving rewiring predicts about 12 (p = 0.00005). Suras 25-32 share 14 against 2 to 5 expected (p = 0.0002).

Across all 19 groups there are 67 within-group bridges against 32 to 36 expected. Read together with T2, this says nearby suras share formulas more than chance, but Farrin's particular boundaries are not what captures it. Revelation period and subject matter (Medinan law in 2-5, prophet stories in 26-28) are not controlled here and are the obvious candidate explanations.

## T4. Rings

| Sura | Claimed pairing's rank among all pairings | Exact p | Blind |
|---|---|---|---|
| 12 (Yusuf) | 1 of 945 | 0.0011 | No |
| 2 (al-Baqara) | 4 of 15 | 0.27 | Yes |
| 3 (Al 'Imran) | 7 of 15 | 0.47 | Yes |
| 18 (al-Kahf), re-test | 7 of 15 | 0.47 | No |

Yusuf is a strong result. Farrin's pairing is the single best of 945 possible pairings, and in four of the five mirror pairs each section's claimed partner is its closest match among nine candidates. The combined primary test passes only because of this sura.

Suras 2 and 3 show no lexical ring. In sura 3, C' is the least similar of the five candidates to C.

Al-Kahf matches the earlier sessions: the frame and the Cave / Dhul-Qarnayn pair are each other's closest matches, while Gardens / Khidr is the worst of five.

## Limits

- Both measures see shared wording only. Thematic parallels without shared distinctive words are invisible, so the nulls for groups and for suras 2 and 3 do not show those claims are false.
- The Yusuf ring had been examined in an earlier session with a different measure, so that test is not blind.
- Yusuf is a single continuous story whose plot mirrors itself (dream and fulfilment, separation and reunion). A ring in the wording may follow from the plot. Whether the Genesis telling shows the same pattern is untested.
- No comparison corpus yet. Nothing here says whether the Quran's structure is unusual relative to other texts.
- The pre-registration is internal. It has no third-party timestamp.

## Not yet encoded

See `notYetEncoded` in `claims/registry.json`: Farrin's concentric arrangement of the groups, his three-part outlines, and all claims from Cuypers, Robinson, Mir/Islahi, Dayeh and Bannister.

---

# Results, batch 2: the arrangement test (2026-11-14)

Specified in `PREREGISTRATION_batch2.md` before it was coded; run once. Numbers are in `results/batch2.json`. The post hoc checks at the end are in `results/batch2_posthoc.json`.

Question: do suras that are neighbours in the mushaf share more distinctive vocabulary than their lengths and revelation dates predict?

## Summary

| Test | Effect | p | Reading |
|---|---|---|---|
| Primary: mushaf neighbours, controlling for revelation order, period, length, verse length and each sura's baseline | +5.4 percentile points | 0.0004 | Passes |
| S1: same, plus a log mushaf-distance control | +1.8 | 0.16 | Does not pass |
| S2: Noldeke's chronology instead of the Egyptian | +4.6 | 0.002 | Holds |
| S3: raw cosine instead of percentiles | positive | 0.02 | Holds |
| S5: Farrin's 53 pairs | +9.8 | 0.0001 | Strong |
| S5: the other 60 adjacent pairs | +1.7 | 0.22 | Nothing |
| S6: neighbours in revelation order | +3.4 | 0.018 | Smaller than the mushaf effect |

Mushaf neighbours sit on average at the 62nd percentile of each other's similarity lists (chance is 50). Neighbours revealed far apart are still at the 61st.

## Reading under the pre-stated rule

The rule written in advance says: positive in the primary but not in S1 means nearby suras are similar in a broad way and adjacency itself is not shown. That is the formal verdict.

The distance profile (S4) does not fit that reading well. The effect is +5.7 points at distance 1 (p = 0.0002) and indistinguishable from zero at distances 2, 3, 4-5 and 6-10. There is no broad gradient for adjacency to ride on. A log-distance term is steepest between distance 1 and 2, so it competes directly with the adjacency indicator, which is the likely reason S1 fails. S1 was a poorly chosen control; that is a judgement made after seeing results and carries no confirmatory weight.

## Farrin's pairs

The adjacency effect is concentrated in the pairs identified by Islahi, Mir and Farrin. Their 53 pairs are +9.8 points above expectation; the 60 adjacent pairs that fall between them are not distinguishable from zero. This is stronger support for the pair claim than batch 1 gave (p = 0.041), now with length and date controlled. It is a secondary analysis.

## Post hoc checks (not pre-registered)

- Difference between Farrin's pairs and the other adjacent pairs: +8.1 points, p = 0.0045.
- The five strongest adjacent pairs are 113-114, 91-92, 89-90, 92-93 and 109-110, all short suras. With those five removed the primary effect halves to +2.8 points, p = 0.044.
- 61 of 113 adjacent pairs are above expectation. The effect comes from a minority of pairs with large excess, not from a uniform lift.

## What this does and does not show

- With length and revelation date controlled, the mushaf order still carries a lexical signal. The claim that the order is only a sort by length does not account for these data.
- The signal is strongest in short suras near the end, and about half of it rests on five pairs.
- It does not show who arranged the suras or why. Anyone arranging by hand could place similar suras together.
- Genre is controlled only through period, verse length and sura length. Short suras of the same type placed together (oath suras, refuge prayers) are the obvious alternative explanation.
- Both chronologies are traditional lists with real uncertainty, and many suras mix material from different periods.
- The lexical data have now been examined twice. Any further confirmatory test on sura pairs needs a different kind of feature (rhyme, verse-ending formulas, syntax), since there is no second Quran to hold out.

---

# Results, batch 3: Yusuf against Genesis (2026-11-14)

Specified in `PREREGISTRATION_batch3.md` before the Hebrew data were parsed; run once. Numbers are in `results/batch3.json`.

Question: sura 12's ring might simply follow from a plot that mirrors itself. Does the Genesis telling of the same story (Genesis 37-50) show a ring in its wording too?

## Summary

| Test | Claimed pairing's rank | Exact p |
|---|---|---|
| Sura 12, Farrin's outline (batch 1) | 1 of 945 | 0.0011 |
| Genesis 37-50, Rendsburg's outline (primary) | 6,460 of 10,395 | 0.62 |
| Sura 12, six-section design | 1 of 15 | 0.067 |
| Genesis, same six plot episodes | 5 of 15 | 0.33 |

The 15-pairing design cannot produce a p-value below 0.067, so its two rows are for comparing the two tellings, not for significance.

## G0. The measure works on Hebrew

The two "wife presented as sister" stories (12:10-20 and 20:1-18) score 0.26, at the 97.6th percentile of 1,425 comparison windows (median 0.125). Validation passed.

## G1. Rendsburg's ring

No ring in the wording. The claimed pairing is slightly worse than the average pairing (z = -0.37). Only F / F' (the final test and its conclusion, chapters 44 and 45) are close, and those two units are adjacent. For most units the closest match is a neighbouring unit, not the mirror unit. Computing word weights over the Joseph story alone gives the same result (p = 0.70).

## G2 and G3. The same six plot episodes in both tellings

| Mirror pair | Sura 12: partner's rank | Genesis: partner's rank |
|---|---|---|
| a / a': the dream, and the family reunited | 1 of 5 | 3 of 5 |
| b / b': the brothers' plot, and the brothers' journeys | 1 of 5 | 1 of 5 |
| c / c': settled in the Egyptian's house, and raised to authority | 2 of 5 | 1 of 5 |

Two of the three pairs mirror in the Genesis wording as well. So part of sura 12's ring does come with the plot: the same characters and settings return in the matching episodes of either telling.

The difference is the outer pair. In sura 12 the dream and the reunion are the most similar pair of all (0.36): the closing scene names the dream and its fulfilment (12:100). In Genesis they score 0.08, and the dream episode's closest match is the brothers' journeys, where Genesis places the fulfilment (42:6-9). Including the genealogy in a' does not change the picture.

Sura 12 also has two mirror pairs that Genesis has no material for: the vindication scene (12:50-53), which answers the seduction scene, and the prologue and epilogue that frame the story.

## Reading under the pre-stated rule

G1 was not significant and G0 passed. Under its best-known published outline the Genesis telling does not show a lexical ring, while sura 12 does under Farrin's. Of these two tellings, the Quranic one is the more tightly mirrored in its wording.

A mirrored plot explains some of sura 12's ring (pairs b and c appear in Genesis too) but not all of it. The parts that complete the ring in sura 12, namely the dream fulfilled at the very end, the vindication scene, and the frame, are features of how the Quran tells the story.

## Limits

- One comparison text. This says nothing about how sura 12 compares with other well-constructed narratives.
- The two outlines come from different scholars. Farrin's sections are fine-grained story scenes; Rendsburg's are whole chapters and include material outside the Joseph plot (Judah and Tamar, Jacob's blessings). A different Genesis outline might do better; only one published outline and one transferred plan were tested.
- Rendsburg's case rests partly on themes and on particular catchwords. Thematic parallels are invisible to this measure, so this result does not refute his chiasm.
- Two languages and two annotation schemes.
- A tighter ring shows more deliberate concentric composition. It does not identify the composer.

---

# Results, batch 4: near-twin verses (2026-11-14)

Specified in `PREREGISTRATION_batch4.md`; run once. Numbers are in `results/batch4.json`, with every case listed in `results/batch4_all_sites.json` and `results/batch4_all_frames.json`.

Question: where two almost identical passages differ by one word, is each variant more at home in its own surroundings than its twin's word would be?

## Summary

| Analysis | Cases | Positive / negative | p |
|---|---|---|---|
| Registered primary: whole-verse twins, whole-sura context | 21 pairs | 11 / 10 | 0.18 |
| Amended: phrase-level, whole-sura context | 65 frames | 35 / 28 | 0.020 |
| Amended: phrase-level, ten verses either side | 65 frames | 37 / 19 | 0.0006 |
| Amended: phrase-level, sura with local passage and repeats removed | 65 frames | 29 / 31 | 0.12 |
| Amended: phrase-level, suras of the same period | 65 frames | 32 / 29 | 0.92 |

## Status of these results

The registered primary test is a null. Its rules found only 21 usable pairs, because most near-twin verses differ by added or dropped words, not by a clean one-word swap. All its secondary variants are null as well.

The phrase-level analysis was added after that yield was seen and before any outcome was computed; its rule is recorded in Amendment A1 and was not tuned. It is reported as an amended analysis, not as the registered primary.

## What the amended analysis shows

- **Variant words fit their immediate surroundings.** Within the ten verses on either side, the word actually used is more frequent than its twin's word in 37 of 56 informative cases (p = 0.0006).
- **The fit does not clearly extend to the rest of the sura.** With the local passage and repeated formulas removed, the effect is not distinguishable from zero (p = 0.12).
- **It is not explained by period.** Against the vocabulary of suras revealed around the same time, there is no effect at all (p = 0.92). The pattern belongs to the passage, not to the era.

Under the reading rule set in advance, this is the second outcome: the fit comes from local wording, which is consistent local diction and a weaker thing than the claim that each variant suits its sura as a whole.

## Two cases, checked against the corpus

- 2:60 and 7:160 (water from the rock) differ in the verb: root f-j-r in sura 2, root b-j-s in sura 7. Root f-j-r returns fourteen verses later at 2:74 (rivers bursting from rocks) and does not occur in sura 7. Root b-j-s occurs nowhere else in the Quran.
- 9:39 and 11:57 share a clause that names "Allah" in sura 9 and "my Lord" in sura 11. Sura 9 uses the root of "Allah" 103 times per thousand content words and the root of "Lord" 1.8 times; sura 11 uses "Lord" 36 times per thousand.

## Limits

- Sixty-five frames is a small sample, and the positive result rests on an analysis added mid-batch.
- The measure only sees a variant root that is repeated nearby. Classical explanations based on meaning, emphasis or rhetoric are not tested, so the null for the wider sura does not refute them.
- Some frames are loose formula templates ("have you not seen that God ... the heavens and the earth") and not twin verses in the classical sense.
- Writers generally repeat words within a passage. Without a comparison text, this result cannot say whether the Quran does so more than other careful compositions. Parallel passages in other scriptures (for example the Synoptic Gospels) would be the natural comparison.
- Variants in function words and word order, a large part of the classical literature, are outside this test.

---

# Results, batch 5: is the Quran's local fit unusual? (2026-11-14)

Specified in `PREREGISTRATION_batch5.md` before the comparison data were parsed; run once. Numbers are in `results/batch5.json`; the post hoc check is in `results/batch5_posthoc.json`.

Question: batch 4 found that where two Quranic phrases differ by one word, the word used tends to recur in the ten verses around it. Do other parallel texts do the same?

The general test function was first checked against batch 4 and reproduced its figures exactly.

## Local fit (ten verses either side)

| Corpus | Phrases | Fit own place / fit twin's place | Mean excess (95% interval) | p |
|---|---|---|---|---|
| Quran, root level (batch 4) | 65 | 37 / 19 | 0.34 | 0.0006 |
| Quran, lemma level | 59 | 22 / 15 | 0.25 (-0.07 to 0.56) | 0.051 |
| Synoptic Gospels | 40 | 19 / 9 | 0.35 (0.10 to 0.60) | 0.010 |
| Samuel-Kings-Chronicles | 169 | 85 / 35 | 0.98 (0.50 to 1.68) | 0.00001 |
| Samuel-Kings-Chronicles without proper-name variants (post hoc) | 104 | 42 / 22 | 0.38 (0.17 to 0.60) | 0.00005 |

Difference in mean local excess, Quran (lemma level) minus Gospels: -0.50 to 0.29. Quran minus Samuel-Kings-Chronicles: -1.51 to -0.14.

## Reading under the pre-stated rule

Both comparison texts show local fit, the Gospels at about the Quran's size and Samuel-Kings-Chronicles larger. Under the rule set in advance, local fit of variant words is ordinary in parallel texts and the Quran's result is not distinctive.

The large Samuel-Kings-Chronicles figure comes mostly from formulas whose varying word is a king's name ("the rest of the acts of ... and all that he did", nineteen occurrences), where the name is bound to appear nearby. With proper-name variants removed (a check added after seeing the results), its mean excess is 0.38, in line with the other two.

So across three corpora in three languages the same thing appears at about the same size: when a repeated phrase varies by one word, the word used recurs nearby roughly two times in three.

## Whole document and strict contexts

The Gospels and Samuel-Kings-Chronicles also show fit to the whole book and to the book with the local passage removed (Gospels p = 0.008 and 0.030; Samuel-Kings-Chronicles p = 0.00001 for both). The Quran does not clearly show this (lemma level p = 0.096 and 0.21; root level 0.020 and 0.12). This difference is expected and is not evidence about the Quran's quality: in the comparison texts each book has its own author with his own habits (Matthew's "kingdom of heaven" against Luke's "kingdom of God" is among the top cases), while the Quran varies its own formulas in one voice.

## What this means for batch 4

Batch 4's local-fit finding stands, but it is a general property of how repeated phrases get varied, visible in texts with ordinary human authors. It does not set the Quran apart.

## Limits

- At lemma level the Quran's own local result is borderline (p = 0.051); the root-level result is the stronger one, and roots merge related words in a way Greek and Hebrew lemmas do not.
- The processes differ: authors rewriting a source in the comparison texts, one text varying its own formulas in the Quran.
- Two comparison texts are not a baseline for writing in general.
- The phrase rule finds few cases in every corpus (40 to 169), so the intervals are wide and a moderate difference between corpora could go undetected.

---

# Results, batch 6: the sound layer (2026-11-14)

Specified in `PREREGISTRATION_batch6.md` before any rhyme data were related to sura order or vocabulary; run once. Numbers are in `results/batch6.json`.

Rhyme was taken from each verse's final word as pronounced in pause (`src/rhyme.mjs`), checked beforehand against suras whose rhymes are well known.

## R1. Do mushaf neighbours share rhyme?

| Test | Effect (percentile points) | p |
|---|---|---|
| Primary: mushaf neighbours, with revelation order, period, length, verse length and each sura's baseline controlled | +7.1 | 0.0004 |
| Same, Noldeke's chronology | +6.8 | 0.0006 |
| Same, five strongest pairs removed (112-113, 111-112, 13-14, 91-92, 98-99) | +4.9 | 0.011 |
| Farrin's 53 pairs | +8.1 | 0.004 |
| The other 60 adjacent pairs | +6.1 | 0.018 |
| Farrin's pairs minus other adjacent pairs | +2.0 | 0.32 |
| Batch 2 vocabulary effect with rhyme similarity controlled | +4.8 | 0.0012 |

Mushaf neighbours sit at the 63rd percentile of each other's rhyme-similarity lists (chance is 50); 68 of 113 adjacent pairs are above expectation.

Reading under the pre-stated rules:

- **Neighbours resemble each other in rhyme** beyond what length and date predict. The arrangement now tracks similarity in two different features, vocabulary (batch 2) and rhyme. This result is sturdier than the vocabulary one: it survives removal of its five strongest pairs.
- **Rhyme does not single out Farrin's pairs.** His pairs and the other adjacent pairs are both above expectation and do not differ (p = 0.32). The pair structure found in batch 2 rests on vocabulary alone.
- **The batch 2 vocabulary effect is not explained by style.** It is nearly unchanged with rhyme similarity controlled (+4.8 against +5.4 points).

## R2. Do rhyme shifts mark a change of subject?

Across 39 suras with both kinds of boundary (114 shifts, 1,843 continuations), vocabulary changes more sharply where the rhyme switches than where it continues: shifts are higher in 29 of 39 suras, p = 0.014. Windows of two verses (p = 0.003) and five verses (p = 0.009) agree. The effect appears in short-verse suras (p = 0.049) and is weaker in long-verse ones (p = 0.095).

The difference is small in absolute terms (0.958 against 0.936) because three-verse windows share little vocabulary anywhere, so the measure sits near its ceiling.

Reading: where the rhyme changes, the subject tends to change. This agrees with what Neuwirth and others describe from close reading of the Meccan suras.

## Limits

- No comparison text for rhyme. Nothing here says whether either property is unusual. Rhymed sermons or poetry collections arranged by someone would be the relevant comparison and are not available in analysed form.
- Rhyme style changed over the period of revelation. It is controlled through two traditional chronologies, period, and verse length; residual confounding by period is possible.
- Whoever arranged the suras could hear the rhymes. Placing similar-sounding suras together is something an arranger could do deliberately.
- R2 shows an association. A new subject introduced with a new rhyme is a compositional habit found in rhymed and strophic verse generally.
- The rhyme key is an approximation built from the script.

---

# Results, batch 7: the disconnected letters (2026-11-14)

Specified in `PREREGISTRATION_batch7.md` before any letter counts were made; run once. Numbers are in `results/batch7.json`; post hoc checks are in `results/batch7_posthoc.json`.

## L1. Do same-letter suras form families?

| Test | Effect (percentile points) | p |
|---|---|---|
| Primary: same opening letters, with both-lettered, neighbours, mushaf distance, revelation order, period, length, verse length and sura baselines controlled | -2.3 | 0.80 |
| Rhyme in place of vocabulary | -0.6 | 0.51 |
| Noldeke's chronology | -1.7 | 0.74 |
| First five verses removed | -1.7 | 0.77 |
| HM family alone | +0.3 | 0.45 |
| Separated ALM pairs (2-3 against 29-32) | -3.5 | 0.73 |
| Share of letters in common | -1.3 | 0.61 |

No family effect. Raw similarity is high: same-letter pairs sit at the 81st percentile of each other's lists. But lettered suras with different letters sit at the 77th, and the separated ALM pairs at the 82nd. Once the model accounts for both suras being lettered, and for neighbourhood and date, having the same letters adds nothing.

**Post hoc:** the lettered suras resemble each other as a class. With the same controls, a pair of lettered suras (any letters) is +5.0 points above expectation, p = 0.0002. This was not a registered test and needs confirming.

Reading under the pre-stated rule: the letters do not mark families of suras that share vocabulary beyond being neighbours and contemporaries. What the data suggest instead is one broad group: suras with letters resemble other suras with letters, whichever letters they carry.

## L2. Are a sura's letters unusually frequent in it?

| Test | Suras with positive own score | p |
|---|---|---|
| Primary (written-skeleton count, standardised across the 29) | 19 of 29 | 0.0045 |
| Strict counting rule | 20 of 29 | 0.0030 |
| Standardised across all 114 suras | 18 of 29 | 0.0009 |
| Post hoc: without sura 50 | 18 of 28 | 0.048 |
| Post hoc: without the single-letter suras 38, 50, 68 | 16 of 26 | 0.16 |
| Post hoc: ALM, ALR and HM suras only | 11 of 18 | 0.22 |
| Post hoc: the other eleven suras only | 8 of 11 | 0.036 |

The registered test passes under both counting rules: taken together, suras' own letters are more frequent in them than other lettered suras' letters would be.

The post hoc breakdown shows where that comes from. It is carried by the suras with rare letters and short letter-sets. The three large families, which are 18 of the 29 suras, show nothing: for example the letter ha ranks 18th, 11th, 6th, 22nd, 28th, 10th and 16th of 29 in the seven HM suras.

The single-letter suras:

| Sura | Letter | Count | Rank among 29 lettered | Rank among all 114 |
|---|---|---|---|---|
| 50 (Qaf) | qaf | 56 | 1 | 4 |
| 68 (the Pen) | nun | 130 | 5 | 12 |
| 38 (Sad) | sad | 28 | 3 | 30 |

Sura 50 is the standout. Its qaf rate (38 per thousand letters) is the highest of all 68 suras with at least 1,000 letters; the three suras above it overall are very short (113, 75, 91). The count of 56, plus the opening letter itself, is the 57 often quoted. Nun in sura 68 and sad in sura 38 are above average and unremarkable.

Reading: the frequency idea holds for qaf in sura 50 and weakly for a few other rare letters (ta in suras 20, 26 and 27; kaf in 19). It does not hold as a general rule, and not at all for the ALM, ALR and HM suras.

## Limits

- Letter frequency follows vocabulary. Sura 50 is rich in words with qaf (Qur'an, speech, creation, truth); the test cannot tell "the letter was chosen to match the sura" from "the sura's subject favours the letter".
- The class effect in L1 is post hoc. Lettered suras are mostly late Meccan suras of similar length that open by affirming the Book, so a shared genre is the obvious explanation; the chronology and length controls only partly cover it.
- Traditional revelation orders may have been influenced by these groupings.
- With 29 suras in few families, the shuffle in L2 has limited resolution, and one sura (50) supplies a large share of the result.

---

# Results, batch 8: a tournament of theories about the disconnected letters (2026-11-14)

Specified in `PREREGISTRATION_batch8.md` before the tests were coded; run once. Numbers are in `results/batch8.json`. The ordinary pass mark is p < 0.05; with six theories in play the stricter mark is p < 0.008.

## Scoreboard (batches 7 and 8)

| Theory | Result | p | Verdict |
|---|---|---|---|
| Letters mark families of related suras | No effect beyond neighbourhood and date | 0.80 | Fails |
| A sura's letters are unusually frequent in it | Carried by qaf in sura 50; nothing in ALM, ALR, HM | 0.0045 overall | Mostly fails |
| A. Letters rhyme with their sura | 65% of verses match, against 55% under shuffling | 0.021 | Passes |
| B. Letters sample the shapes of the script | 14 letters, 14 different shapes | 0.014 | Passes |
| C. Letters keep one internal order | Consistent; 0.11% of random arrangements are | 0.0011 | Passes strictly |
| D. Letters balance the classes of sounds | As balanced as possible | 0.026 | Passes |
| E. Letter counts are multiples of 19 | 5 of 78, against 4.1 by chance | 0.39 | Fails |
| F. Lettered suras form one class | +13.1 points in rhyme; +5.0 in vocabulary | 0.0001 | Passes strictly |

My predictions, recorded beforehand, were that A, B, C and D would pass and E would fail. All five came out that way.

## A. Rhyme

Where the letters form a verse of their own (19 suras), the letter-name's ending belongs to the sura's rhyme in 17 of them: ta-ha ends in long a and sura 20 rhymes in long a; ha-mim, alif-lam-mim, ta-sin-mim and ya-sin end like the -im / -in / -un rhymes of their suras. The two exceptions are suras 7 and 19, both ending in sad.

Where the letters are not a verse of their own they mostly do not rhyme (suras 10 to 15 and 50). That fits the old observation that the letters are counted as a verse where they rhyme, and it also means the verse division and the rhyme are not independent facts. The primary test uses all 29 suras regardless.

## B. Letterforms

Grouped by shape in undotted writing, the 28 letters fall into 18 groups. The 14 letters come from 14 different groups, the most possible; 1.4% of all sets of 14 letters do as well. A coarser grouping of 15 gives the same figure. The groups not represented are ba-ta-tha, dal-dhal, fa and waw.

In all six multi-letter groups that are represented, the letter present is the one written without dots today (hard ha, ra, sin, sad, emphatic ta, 'ayn). Picking one letter per group at random would do that 1% of the time. Those undotted letters are also the commoner member of each group, so a letter chosen for being common would show the same pattern.

## C. Internal order

Across the 11 distinct multi-letter openings there is no pair of letters that appears in both orders, and all the "comes before" relations fit a single ranking. One forced chain runs through seven letters: kaf, ha, ya, 'ayn, sin, mim, sad. Only 0.11% of random arrangements of the same openings are consistent. This re-tests Massey (1996) and agrees with him.

## D. Sound classes

Of the classical classes, the 14 letters contain 5 of the 10 voiceless letters, 4 of the 8 stops, 2 of the 4 emphatics, 3 of the 7 elevated letters and 2 of the 5 qalqala letters. That is as close to half of each as whole numbers allow; 2.6% of random sets are as balanced.

## E. The number 19

Five of the 78 sura-letter counts are multiples of 19, where chance gives about four. Under the strict counting rule it is four; with the basmala included, five.

Of Khalifa's five headline claims, the two about qaf hold under this count: suras 50 and 42 each contain exactly 57. The other three do not: nun in sura 68 is 131 against his 133, sad across suras 7, 19 and 38 is 153 against 152, and ha plus mim across suras 40 to 46 is 2,112 against 2,147.

## F. Lettered suras as a class

The lead from batch 7 is confirmed with a feature not used to find it. With neighbourhood, mushaf distance, revelation order, period, length, verse length and sura baselines controlled, two lettered suras are +13.1 percentile points more alike in rhyme than expected (p = 0.0001, the smallest the test can return).

The vocabulary effect is unchanged (+5.0 points) when the opening formula is controlled. Twenty-four of the 29 lettered suras mention the Book, the recitation or the sending-down in their first three verses, against 16 of the 85 others, but that does not account for the resemblance.

## What the tournament says

The theories that tie the letters to the content of particular suras fail: families, letter frequency (qaf aside) and the number 19. The theories that treat the letters as a constructed selection from the alphabet pass: distinct shapes, a fixed order, balanced sound classes, and agreement with the rhyme. And the suras that carry letters are a distinct group in both vocabulary and rhyme, whichever letters they carry.

The reading these results support best is that the letters are a deliberate, ordered sample of the Arabic alphabet placed at the head of one class of suras, the ones that present themselves as the Book. They do not show what the letters were meant to convey.

## Limits

- B, C and D are patterns scholars noticed by looking at the letters (the letterform observation is in the modern literature, the order is Massey's, the sound classes are al-Zamakhshari's). A probability worked out afterwards overstates the surprise, because the patterns that were looked for and not found are unrecorded. Only C clears the stricter mark.
- B, C and D are not independent of one another: all three describe the same 14 letters.
- Fourteen letters and fourteen distinct openings are small numbers.
- A depends on a rhyme extractor built from the script, and on the traditional verse division, which may itself follow the rhyme.
- F shows the lettered suras are alike beyond the listed controls. A shared period or genre that the two chronologies capture poorly could still be behind it.

---

# Results, batch 9: three predictions of my own about the letters (2026-11-14)

Specified in `PREREGISTRATION_batch9.md` before the tests were coded; run once. Numbers are in `results/batch9.json`.

The theory under test: the letters put the alphabet on display at the head of the suras whose subject is the scripture as an Arabic text.

| Prediction | Result | p | Outcome |
|---|---|---|---|
| M1. Lettered suras talk about scripture and writing throughout, not only in their openings | 17.3 against 16.4 words per thousand; adjusted difference -0.3 | 0.56 | Wrong |
| M2. "Arabic" belongs to the lettered suras (not blind) | 9 of 11 occurrences, against 5.2 expected | 0.021 | Holds |
| M3. The fixed order runs from the throat to the lips | 21 of 28 letter pairs agree | 0.061 | Not shown |
| M3. The alphabetical orders do not fit | Abjad order: 23 of 28 pairs agree | 0.010 | Wrong: abjad fits best |

## M1. Scripture vocabulary

With the first three verses removed, lettered suras use the vocabulary of books, recitation, writing and revelation no more than other suras. Every variant agrees: Meccan suras only (lower in lettered suras, p = 0.96), the narrower lexicon (p = 0.26), opening verses kept (p = 0.23), Noldeke's order (p = 0.70).

The core prediction of the theory failed. Whatever makes the lettered suras resemble each other (batch 8, test F), it is not that they talk about the Book more.

## M2. "Arabic"

Nine of the eleven occurrences of 'arabi are in lettered suras (12, 13, 20, 26, 41 twice, 42, 43, 46; the other two are in 16 and 39). Lettered suras hold 47% of the text. I knew the rough distribution before testing, so this is a count and not a blind test.

## M3. What the internal order is

| Candidate order | Letter pairs agreeing | p (two-sided) |
|---|---|---|
| Abjad (the old Semitic alphabet order) | 23 of 28 | 0.010 |
| Articulation, throat to lips | 21 of 28 | 0.061 |
| Frequency in the Quran | 19 of 28 | 0.21 |
| Modern alphabetical | 14 of 28 | 1.0 |

I predicted articulation would win and the alphabetical orders would sit at chance. The opposite happened for abjad: it fits best. The five pairs that break it are kaf before ha and ya (in KHY'S), emphatic ta before ha (TH), sin before mim (TSM) and 'ayn before sin ('SQ).

Abjad was the order in which the alphabet was known in the seventh century; the modern order came later. With four candidates tried, the corrected p-value is about 0.04, so this is a modest result. It points the same way as batch 8: the letters relate to the alphabet as a system.

## What this does to the theory

The half about the alphabet gains a little (the abjad tendency; "Arabic"). The half about subject matter loses: lettered suras are not marked by talk of scripture beyond their first lines. The link between the letters and the Book is in the opening formula (24 of 29 open with it) and not in the body of the sura.

## Limits

- M1 uses a lexicon I chose; a different choice could behave differently, though the narrow and full versions agree.
- M3 rests on 28 letter pairs and four candidates.
- M2 was not blind.

---

# Results, batch 10: what sets the lettered suras apart? (2026-11-14)

Specified in `PREREGISTRATION_batch10.md` before the analysis was coded; run once. Numbers are in `results/batch10.json`. This batch was a search, with the check against noise fixed in advance. 111 suras (three have no verses after the first three), 304 roots.

## Part 1. Vocabulary: the validation failed

Words picked as distinguishing in one half of the suras did not reliably distinguish lettered suras in the other half. Across 40 confirmation tests the median p was 0.18, and 6 were below 0.05 (2 would be expected by chance). The pre-set pass mark was a median below 0.05.

Under the rule written in advance, no list of distinguishing words is offered as a finding. Only two roots were selected consistently, h-z-n (grieve) and '-r-d (earth), and with the validation failed they should be treated as noise until shown otherwise.

So the vocabulary resemblance among lettered suras found in batch 8 is real but diffuse. It is not carried by a set of words that can be named.

## Part 2. Formal features: one holds

| Feature | Lettered | Unlettered | p | p adjusted for nine tests |
|---|---|---|---|---|
| Verses rhyming in long i/u + consonant (-un, -in, -im) | 85% | 61% | 0.0028 | 0.025 |
| Vocative ya per 1,000 words | 5.3 | 4.1 | 0.14 | 0.60 |
| First-person plural verbs per 1,000 words | 25.4 | 23.1 | 0.23 | 0.60 |
| Imperatives per 1,000 words | 26.2 | 22.3 | 0.27 | 0.60 |
| Proper nouns per 1,000 words | 49.3 | 51.9 | 0.38 | 0.64 |
| Second-person verbs per 1,000 words | 62.4 | 57.5 | 0.43 | 0.64 |
| Verbs as a share of content words | 40.0% | 37.6% | 0.53 | 0.68 |
| Share of verbs in the perfect tense | 47.5% | 46.5% | 0.70 | 0.78 |
| Passive verbs per 1,000 words | 14.5 | 15.3 | 1.00 | 1.00 |

The one feature that separates lettered suras is rhyme. With period, revelation order, length and verse length controlled, 25 points more of their verses end in the -un / -in / -im type of rhyme. Nothing about their grammar or narrative style differs: not proper nouns, tense, person, imperatives or passives.

## How this fits with the earlier batches

- Batch 8 F: lettered suras resemble each other strongly in rhyme (+13 points) and weakly in vocabulary (+5).
- Batch 8 A: where the letters form their own verse, the letter-name rhymes with the sura in 17 of 19 cases. Twenty-two of the 29 openings end in mim, sin or nun, whose names end in exactly this kind of rhyme.
- This batch: the lettered suras are the suras with the most uniform rhyme of that kind.

Put together: the firmest thing the data say about which suras carry letters is a fact about sound. The letters sit on suras with a uniform -un / -in / -im rhyme, and most of the letters rhyme with it.

## Limits

- This rhyme became dominant in the later Meccan period, where most lettered suras fall. Two chronologies, a period flag and verse length are controlled, but the chronologies are coarse and some of the effect may still be period.
- Five lettered suras do not have this rhyme (19, 20 and 38 rhyme in long a; the letters of 10 to 15 and 50 do not rhyme with their suras), so the description is a tendency and not a rule.
- The split-half validation had only about 14 lettered suras per half. A real but modest vocabulary signature could have been missed.

---

# Results, batch 11: why the mushaf departs from longest-first order (2026-11-14)

Specified in `PREREGISTRATION_batch11.md` before the analysis was coded; run once. Numbers are in `results/batch11.json`.

Sura 1 is held first and left out. Among suras 2 to 114, 423 of the 6,328 sura pairs (6.7%) stand in the wrong order for a strict longest-first sort, and in 49 of the 112 adjacent pairs the shorter sura comes first.

The mushaf is compared with 15,541 random orders that break the length rule to the same degree (within 10%), with the breaks placed at random.

## Results

| Test | Mushaf | Strict longest-first | Orders with random exceptions | p |
|---|---|---|---|---|
| O1. Vocabulary similarity of neighbours (percentile; chance is 0.50) | 0.623 | 0.599 | 0.554 | 0.00006 |
| O2. Rhyme similarity of neighbours | 0.628 | 0.585 | 0.557 | 0.0002 |
| O3. Vocabulary similarity beyond period and length | 0.051 | 0.037 | 0.003 | 0.0035 |
| O4. Adjacent pairs with identical opening letters | 13 | 1 | 1.8 | 0.00006 |
| Mean revelation-rank gap between neighbours (lower is closer) | 23.9 | 27.6 | 30.7 | 0.0001 |

For O1 and O4, no random order did as well as the mushaf; the p-value shown is the smallest the test can return.

All five predictions recorded beforehand held.

## Reading

- **The exceptions are not placed at random.** Breaking the length rule at random lowers the resemblance between neighbours (0.599 to 0.554 for vocabulary). The mushaf breaks it just as often and its neighbours are more alike than under a perfect sort (0.623).
- **It is not only the letter groups (O5).** With the 29 lettered suras removed, the 84 remaining suras show the same thing: vocabulary p = 0.0009, rhyme p = 0.003, beyond period and length p = 0.008.
- **It is not only date.** The exceptions also bring suras of similar date together, but the vocabulary result survives after period, revelation order, length and verse length are removed (O3).
- **Letter groups are held together.** Thirteen adjacent pairs share identical letters, against fewer than two expected.
- A rank-based version of the random orders gives the same results.

## How this squares with the earlier dispute

A fully random order would score 0.50. The strict length sort reaches 0.599 and the mushaf 0.623, so the sort accounts for about 80% of the mushaf's raw advantage over a random order. That matches the 70 to 82 percent reported by the study noted in batch 2.

The remaining fifth is the point at issue. It is not noise: an order that departs from the sort as much as the mushaf does would be expected to fall to 0.554, and the mushaf rises instead.

## How optimised is it?

A search for the best order with no more disorder than the mushaf's found one scoring 0.744. The mushaf sits 36% of the way from the random-exception average to that order. It is arranged with resemblance in view, and it is far from the arrangement that would maximise resemblance alone.

## Limits

- The random orders come from one model of a loosely applied length rule (noise in the logarithm of length, or in rank). Real looseness might be structured differently, for example by sheets or booklets of suras copied together.
- Length is counted in words. The arrangers may have judged it by lines or pages.
- This shows the exceptions raise resemblance. It does not show who placed them or why; an arranger grouping suras by ear, subject and date would produce it.
- The similarity measures were built in earlier batches of this project, on the same text.

---

# Results, batch 12: a census of shapes (2026-11-14)

Specified in `PREREGISTRATION_batch12.md` before either detector had been run on real text; run once. Numbers, including every unit, are in `results/batch12.json`.

Each sura or chapter with at least 300 content words was cut into 12 equal blocks and scanned, with no outline, for ring structure and for parallel structure.

A fault in the block-cutting function was found and fixed during the eligibility count, before any detector ran on real text: it had silently dropped one sura (42). Counts below are after the fix.

## Results

| | Quran suras | Hebrew chapters | Gospel chapters | Above false-alarm rate? | Quran above baseline? |
|---|---|---|---|---|---|
| Rings | 2 of 47 | 4 of 121 | 1 of 40 | p = 0.87 | p = 0.50 |
| Parallel structure | 2 of 47 | 0 of 121 | 1 of 40 | p = 0.78 | p = 0.13 |

Neither shape is detected more often than the detectors' own error rates, and the Quran does not differ from the biblical chapters.

- Suras flagged as rings: 17 (centre around verses 65 to 84) and 30 (centre around 33 to 41). Two of 47 is what the false-alarm rate alone would give, so these are candidates for a close reading and nothing more.
- Suras flagged as parallel: 5 and 41.
- **Sura 12 was not detected** (p = 0.36), although an outline-based test confirmed its ring in batch 1. The detector did place its best centre at verses 46 to 53, close to Farrin's, and paired the opening verses with the closing ones, but not strongly enough to count.

My prediction was a small number of rings, somewhat above the false-alarm rate, not clearly more than in biblical chapters, with sura 12 possibly missed. The count was not above the false-alarm rate; the rest held.

## Reading under the pre-stated rule

At this resolution, with shared wording as the only evidence, rings are not detectable beyond the detector's error rate. This does not contradict the outline-based result for sura 12.

The miss on sura 12 matters for how much weight the null carries. A detector that cannot find the one ring already confirmed has little power on real text, most likely because real sections are of very unequal length (in sura 12 they run from 3 to 41 verses) and twelve equal blocks blur them. The census therefore shows that rings are not obvious at this resolution; it does not show they are absent.

## Limits

- One resolution (twelve equal blocks). A detector that allows unequal sections would have more power but far more freedom, and would need a much stricter check against false alarms.
- Biblical chapters are later divisions, not compositional units.
- Wording only.

---

# Results, batch 13: a second length-ordered collection, the Mishnah (2026-11-14)

Specified in `PREREGISTRATION_batch13.md`, which was committed to the public repository (commit 6096135) before any similarity between tractates was computed and before this batch's code was written. Run once. Numbers are in `results/batch13.json`.

The Mishnah has 63 tractates in six orders. Within each order the tractates run from the most chapters to the fewest, with exceptions: 22 of the 308 within-order pairs (7.1%) stand the wrong way round. The mushaf's figure is 6.7%.

## The measure works

Tractates in the same order are far more alike than tractates in different orders (+0.27, p = 0.0001), and the three Bavot, originally one tractate, score 0.95 to 0.99 with each other.

## Results

| Test | Mishnah | Strict sort | Random exceptions | p |
|---|---|---|---|---|
| M1. Similarity of adjacent tractates, length in chapters | 0.822 | 0.761 | 0.740 | 0.0001 |
| M2. Length in words | 0.822 | 0.753 | 0.749 | 0.0003 |
| M3. True exceptions only (tied tractates left as they are) | 0.822 | 0.761 | 0.758 | 0.0004 |
| M4. Without Avot, the three Bavot as one | 0.813 | 0.745 | 0.730 | 0.0002 |

In M1 none of the 7,363 random orders did as well as the Mishnah.

I predicted M1 would pass and that M3 might fail for lack of exceptions. M3 passed.

## Reading under the pre-stated rule

M1 and M3 pass. Exceptions that raise resemblance are found in a second length-ordered collection. The pattern in the mushaf is what careful human arrangement looks like, and it is not distinctive.

The two collections are close in size of effect as well as in kind:

| | Share of pairs out of order | Actual | Random exceptions | Gap in null standard deviations |
|---|---|---|---|---|
| Mushaf (batch 11, vocabulary) | 6.7% | 0.623 | 0.554 | 3.9 |
| Mishnah (M1) | 7.1% | 0.822 | 0.740 | 4.2 |

## What this does to batch 11

Batch 11 stands: the mushaf's order is deliberate and not a bare sort by length. What changes is how much that says. The Mishnah was arranged by its editors, and it shows the same thing to the same degree. So the arrangement finding is evidence of deliberate arrangement and gives no ground for saying the arrangement is beyond what people do.

## Limits

- One comparison collection, in a different genre.
- The Mishnah measure uses word forms without lemmas, so it is cruder than the Quran measure. A cruder measure would be expected to weaken the result, and it is strong anyway.
- The Mishnah is built in six thematic orders; the mushaf has no such divisions. The tests respect that (only within-order pairs are used), but the two arrangements are not built the same way.
- Printed chapter counts differ slightly from older ones in a few tractates.
