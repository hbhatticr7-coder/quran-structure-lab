# Pre-registration, batch 11: why the mushaf departs from longest-first order

Written 2026-11-14, after batches 1 to 10 and before any of the analysis below was coded or run.
The SHA-256 of this file is recorded in `results/batch11.json`. Internal pre-registration only.

## Question

After the opening sura, the mushaf runs roughly from the longest sura to the shortest, with many exceptions. Batches 2 and 6 showed that neighbours share vocabulary and rhyme beyond what length and date predict. Are the exceptions to the length rule the places where a sura was put next to one it resembles?

Background recalled from memory and not re-checked: Bauer (1921) described the order as length-based with the lettered groups kept together. A recent study, seen only as an abstract in batch 2, attributes 70 to 82 percent of the order's neighbour similarity to the length sort.

## The comparison: orders that are equally untidy

- Length = words. Sura 1 is held in first place and left out of all statistics; the order studied is suras 2 to 114.
- Disorder = the number of sura pairs that stand in the wrong order for a strict longest-first sort.
- Null orders: sort the suras by ln(words) plus random noise. The noise level is set so that the average disorder equals the mushaf's; orders whose disorder is within 10% of the mushaf's are kept (20,000 generated, seed 20261170). These are orders that follow the length rule exactly as loosely as the mushaf does, with the looseness placed at random.

If the mushaf's exceptions are unrelated to content, it should look like a typical null order.

## Tests

**O1 (primary). Vocabulary.** Statistic: mean vocabulary similarity (batch 2's percentile measure) of adjacent suras. p = share of null orders with a mean as high. One-sided, threshold p < 0.05.

**O2. Rhyme.** The same with batch 6's rhyme similarity.

**O3. Similarity beyond period and length.** The same with the vocabulary measure after removing what each sura's baseline, revelation order, period, length and verse length explain (the batch 2 controls). This asks whether the exceptions bring together suras that are alike for reasons other than being contemporaries.

**O4. Letter groups.** Statistic: the number of adjacent pairs with identical opening letters. p from the same null orders.

**O5. Without the lettered suras.** O1 repeated on the 85 unlettered suras alone (their mushaf order, with null orders calibrated to their own disorder). This asks whether the effect is only the letter groups.

Descriptive, no test:
- The strict longest-first order's value for each statistic.
- Mean revelation-rank gap between neighbours, in the mushaf and in the null orders.
- How close the mushaf comes to the best order found by a search (simulated annealing, starting from the mushaf, never exceeding the mushaf's disorder) that maximises adjacent vocabulary similarity. The search gives a lower bound on the best possible.
- The same tests with noise added to length rank instead of ln(words).

## Prediction, recorded before running

O1, O2 and O4 will pass clearly. O3 will pass. O5 is uncertain.

## How results will be read

- O1 and O2 pass: the mushaf's exceptions to the length rule are not placed at random; they raise the resemblance between neighbours.
- O3 passes as well: the resemblance gained is not only that of suras from the same period.
- O5 passes: the pattern is general. O5 fails while O4 passes: the exceptions are mostly the letter groups being kept together.

## Limits stated in advance

- "Noise in ln(words)" is one model of a loosely applied length rule. A different model of looseness could give a different null. A rank-noise version is run as a check.
- Length is measured in words; the arrangers may have judged length by pages or lines.
- Showing that exceptions raise similarity does not show who placed them or why. An arranger grouping similar suras by ear and by subject would produce this.
- The search for the best order is heuristic.
