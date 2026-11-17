# Census of choice sites

Written by `project/tools/census.mjs`. Do not edit by hand.

A *problem* is one kind of choice (one phrase frame, one set of synonyms). An *occurrence* is one place in the text where that choice is made.

| Type | What it is | Problems | Occurrences | In build suras | In test suras | In vault suras |
|---|---|---|---|---|---|---|
| frame | A word slot with the same three words before and after it, filled differently in different places | 581 | 2,101 | 1,013 | 559 | 529 |
| synonym | An occurrence of a word from 9 listed sets of near-synonyms | 9 | 1,659 | 795 | 437 | 427 |
| ending | A recurring pair of words closing a verse: given the first, which word closes it | 22 | 824 | 450 | 181 | 193 |
| order | Two nouns joined by "and" that occur in both orders | 17 | 326 | 164 | 69 | 93 |
| **all** | | 629 | 4,910 | 2,422 | 1,246 | 1,242 |

The split: 58 build suras (37,571 words), 28 test suras (20,878), 28 vault suras (18,980).

## Not yet turned into problems

- **Near-identical verses.** 886 pairs of verses share at least 70% of their words in order. 670 are word-for-word identical; 102 differ by a swapped word; 104 by words added or left out; 59 in a longer stretch. (A pair can fall in more than one group.) Swapped words are mostly covered by the frames above. Added and omitted words are not yet covered.
- **Pairs always in one order.** 78 pairs of nouns joined by "and" occur three times or more and always in the same order.
- **Choices of form.** Singular or plural, verb form, definite or indefinite, which particle is attached. Words are compared by dictionary form here, so these are not counted.
- **What each telling of a story includes.** See batch 16.
