# Pre-registration, batch 18: an audit of popular word-count claims

Written 2026-11-16, after batch 17. Before writing, the corpus was searched for which lemmas exist under each relevant root and which grammatical tags they carry. That lookup printed no counts. Committed to the public repository before the batch's code was written.

## Purpose

Lists circulate widely claiming that pairs of words occur an equal number of times in the Quran (this world and the hereafter, 115 each), or that a word occurs a meaningful number of times (day, 365). Most trace to Abd al-Razzaq Nawfal's work on numerical balance. The claims below are given as I recall them from such lists; versions differ.

The known difficulty is that a count depends on what is counted: one dictionary word in all its forms, only its singular, or every word from its root. A claim can be made to "work" by choosing a different rule for each word. So the rules are fixed here, the same for every claim.

## Counting rules

For each word in a claim, three counts are reported:

- **Word**: the dictionary word (lemma) named in the claim, in all its inflections.
- **Singular**: the same, singular forms only (where number applies).
- **Root**: every word from the same root.

Where a claim names a particular grammatical form (the plural "prayers", the command "say"), that form is counted as specified.

The text is the Hafs reading in the Tanzil Uthmani edition, with the Quranic Arabic Corpus morphology. The basmala is counted once, in sura 1.

## Verdicts

- **Holds**: the claimed number is the Word count for every word in the claim (or the count of the specified form).
- **Holds under another rule**: not by Word, but the claimed number is the Singular count, or the Root count, for every word in the claim, using the same rule for all of them.
- **Only with mixed rules**: each word reaches the claimed number, but under different rules.
- **Does not hold**: otherwise. For equality claims it is also noted whether the two words are equal at some other number.

## The claims

| # | Claim | Words and forms |
|---|---|---|
| 1 | This world 115 = the hereafter 115 | *dunya*; *akhira* (the feminine singular of the lemma *akhir*) |
| 2 | Angels 88 = devils 88 | *malak*; *shaytan* |
| 3 | Life 145 = death 145 | *hayat*; *mawt* |
| 4 | Man 24 = woman 24 | *rajul*; *imra'a* |
| 5 | Month 12 | *shahr* |
| 6 | Day 365 | *yawm*, singular, with no attached pronoun and not in the compound "on that day" (*yawma'idhin*). The plain singular count is also reported. |
| 7 | Days 30 | *yawm*, plural and dual together |
| 8 | "Say" 332 = "they said" 332 | the command *qul* (singular masculine imperative of *qala*); *qalu* (perfect, third person masculine plural) |
| 9 | Sea 32 and land 13, matching the 71% to 29% split of the earth's surface | *bahr* singular; *barr* in the sense of land, counted two ways (singular with the definite article; and those in a verse that also has *bahr*), plus the one occurrence of "dry land" (*yabas*) that the claim adds |
| 10 | Alms (*zakat*) 32 = blessing (*baraka*) 32 | *zakat*; *baraka* |
| 11 | Prayers 5 | the plural *salawat* |
| 12 | "Seven heavens" 7 | the word seven directly followed by the plural of heaven |
| 13 | Benefit 50 = corruption 50 | *naf'*; *fasad* |
| 14 | Calamity 75 = thanks 75 | *musiba*; *shukr* |
| 15 | Patience 114 = hardship 114 | *sabr*; for hardship there is no single lemma, so the root sh-d-d |
| 16 | Tongue 25 = admonition 25 | *lisan*; *maw'iza* |
| 17 | Reason 49 = light 49 | the root '-q-l (it occurs only as a verb); *nur* |
| 18 | Desire 8 = dread 8 | the roots r-gh-b and r-h-b (the claim is usually stated for the word-families) |
| 19 | Iblis 11 | the name |
| 20 | Muhammad 4 | the name |

## What a result means

Each count is a fact about this edition under a stated rule, and is reported as such. No significance test is attached. With many candidate pairs and three counting rules, some exact matches are expected by chance, and nobody records the pairs that were tried and did not match. A match is something to know; it is not, by itself, evidence of design.

## Prediction, recorded before running

A minority will hold under the Word rule. Several will hold only under another rule or with mixed rules. I expect the two names, the month and the days to hold, and "day 365" to hold under the claim's own narrow definition.
