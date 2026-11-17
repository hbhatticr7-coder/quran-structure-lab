# Test plan, batch 20: a code scanner for the Quran's numbers

Written 2026-11-16, before the scanner was run on the real order of the suras. Committed to the public repository before that run.

## The question

Many numerical patterns have been reported in the Quran's sura numbers and verse counts. Each was found by someone searching, and nobody records the patterns that were tried and failed. So a single striking pattern cannot show design: search long enough and one will turn up in any list of 114 numbers.

This batch asks a different question. Fix a family of simple patterns in advance. Search the real arrangement and thousands of shuffled arrangements equally hard. **Does the real arrangement hold more patterns, or rarer ones, than the shuffled arrangements do?**

## What is already known (declared)

One pattern in the family was checked on 2026-11-16 before this plan was written, and holds:

- Add each sura's number to its verse count. The result is even for 57 suras and odd for 57.
- Those sums total 6,236 for the even group (the number of verses in the Quran) and 6,555 for the odd group (the sum of the numbers 1 to 114).
- In 2,000,000 shuffles of the verse counts across the sura numbers, both held together 659 times.

Because this outcome is known, every pattern built on the grouping rule "number + verses is even" is **left out of the main test**. The main test asks whether there is anything beyond it.

Nothing else in the family has been computed on the real arrangement. I know of other published claims in this area only loosely and have not checked which fall inside the family.

## The data

For each sura: its number in the standard order (1 to 114), and three counts from the Tanzil Uthmani text (Hafs, Kufan verse numbering).

| Count | Rule | Total |
|---|---|---|
| Verses | as numbered in the text | 6,236 |
| Words | space-separated words holding at least one letter | 77,433 |
| Letters | written base letters; vowel and pause marks and the free-standing hamza are not counted | 322,604 |

The opening line "In the name of God..." is counted only in sura 1, where it is verse 1. The disconnected opening letters are counted as words and letters.

These totals were computed before the plan was written. They are inputs, and say nothing about which patterns hold.

## The family of patterns

A pattern has three parts.

**1. A rule that splits the 114 suras into two groups** (44 rules).

- Take one of seven quantities: number, verses, words, letters, number + verses, number + words, number + letters.
- Ask one of six things of it: is it divisible by 2, by 3, by 5, by 7, by 19, or is it prime? That gives 42 rules.
- Two more rules: "verses greater than number", and "number at most 57" (the first half).

**2. A measure taken over each group** (8 measures): how many suras; the sum of their numbers; of their verses; of their words; of their letters; of number + verses; of number + words; of number + letters.

**3. A kind of hit** (4 kinds).

| Kind | Holds when |
|---|---|
| Equal | the two groups have the same value |
| Total | either group's value equals one of five grand totals: 114, 6,555 (sum of numbers), 6,236 (verses), 77,433 (words), 322,604 (letters) |
| Both divisible by 7 | both groups' values are multiples of 7 |
| Both divisible by 19 | both groups' values are multiples of 19 |

A pattern can hold only if both groups are non-empty.

That makes 44 × 8 × 4 = **1,408 patterns**. The code is `src/scanner.mjs`. The family was fixed without looking at which patterns hold in the real arrangement.

## Shuffled arrangements

Each sura keeps its own verse, word and letter counts. Only the order changes. Two kinds of shuffle are used.

- **Free shuffle.** The 114 suras in a random order.
- **Length-matched shuffle.** The real order runs roughly from long suras to short. These shuffles do the same, as loosely as the real order does (the method of batch 11: sort by length with random noise, calibrated to the real order's number of out-of-order pairs, keeping draws within 10% of it). This guards against patterns that the long-to-short trend alone makes likely.

## The score

1. **Calibration.** Scan 200,000 shuffles. For each pattern, record how often it holds. Its *surprise* is minus the base-10 logarithm of that frequency (a pattern holding once in 1,000 shuffles has surprise 3). A pattern never seen is given the frequency 1 in 200,001. A pattern that holds in every shuffle has surprise 0.
2. **Score of an arrangement.** The sum of the surprises of the patterns that hold in it.
3. **Test.** Score the real arrangement. Score 100,000 fresh shuffles the same way. The p-value is the share of shuffles scoring at least as high as the real arrangement.

Calibration and test are done separately for the two kinds of shuffle. Seeds are fixed in the script.

## Tests

**Main test.** The score over the whole family, leaving out the 32 patterns built on the known rule (1,376 patterns).

**Two sub-family tests**, also leaving out the known rule:

- Exact identities: the "equal" and "total" kinds.
- Divisibility: the two "both divisible" kinds.

**Also reported, with no decision attached:**

- The score with the known rule included.
- The number of patterns holding, and the single rarest pattern holding, each against the shuffles.
- Every pattern that holds in the real arrangement, with its values and its frequency in shuffles.

## What a result means

| Result | Reading |
|---|---|
| Main test p < 0.01 under both kinds of shuffle | The real order carries more arithmetic regularity than shuffled orders. A finding, to be checked on other verse-numbering traditions. |
| Main test not significant, a sub-family p < 0.005 under both | Suggestive only. |
| Neither | Beyond the one known pattern, the real order's numbers look like a shuffled order's. The known pattern then stands alone, and a lone 1-in-3,000 pattern is what a wide search would be expected to find. |

A pattern is a fact about this edition under these counting rules. Word and letter counts depend on the rules above; verse counts depend on the Kufan numbering.

## Check before the real run

`scripts/31_batch20_scanner_check.mjs` is run first. It never looks at the real order.

- **False alarms.** 2,000 fresh shuffles of each kind are put through the main test. About 1% should score p < 0.01.
- **Planted patterns.** Starting from random orders, suras are swapped until 1, 2, 3 or 5 chosen exact identities hold (chosen at random from identities that hold in fewer than 1 in 100 shuffles). The share of these planted arrangements that the main test detects is reported. This shows how many deliberate identities the scanner needs before it can see them.

The check's results are committed with this plan.

## Limits known in advance

- The family is one choice among many. A design that uses other arithmetic (digit sums, products, verse-level counts, letter values) is outside it.
- The shuffles test the order of the suras given their counts. They do not test where verses are divided.
- One known pattern adds a surprise of about 3.5 to a score whose shuffle-to-shuffle spread is larger. The scanner is built to see a broad excess, and may miss one or two isolated patterns. The planted-pattern check measures this.

## Prediction, recorded before running

I expect the main test not to be significant under either shuffle. I expect the known pattern to be the rarest hit when it is included, and no other exact identity rarer than 1 in 1,000 to hold. If design of this kind is present, I would expect it among the verse-count identities.
