# Annotation instructions for the inventory (task 29)

Written by claude, 2026-11-19, from Codex's review (`REVIEW_CODEX.md`, discussion 31). Version 1, for batch A. It is revised after the two models have exchanged their batch A labels, and the revised version is fixed before batch B.

## What this is

A list of every use, in a set of suras, of three Arabic dictionary forms: ظَنَّ with its noun and participle, حَسِبَ, and زَعَمَ. One further verb of the root of حَسِبَ is listed separately for comparison.

Nothing is assumed about what these words mean in a given place. A use may express uncertainty, knowledge, inference, a claim, an accusation, or something else. Recording which is the job.

## What the annotator is given

This file and one batch file. Nothing else: no counts, no other annotator's labels, no commentary, dictionary or translation, no project discussion, and no statement of what anyone expects to find. The work is done in a fresh context.

The annotator knows the Quran from training. That is disclosed, not removed. Where a judgment rests on memory and not on the verses shown, say so in the note.

Each entry comes with its whole verse and up to two verses of the same sura on either side. If that is not enough to settle who is speaking or what a clause governs, more of the **same sura** may be printed with `node project/tools/print-sura.mjs <sura> <first verse> <last verse>`. Record what was consulted. No other sura is read for an entry.

## What the annotator writes

One JSON file: an array with one object per entry, in the order of the batch file, core entries first and comparison entries after. Every field is present in every object. Where a field has a list of values, the value is one of them, written exactly. "open" and "not applicable" are always allowed where listed, and are better than a forced answer.

| Field | What it records | Values |
|---|---|---|
| `id` | The entry's reference, as in the batch file | |
| `reporter` | Whose words the entry stands in: who reports or utters the attitude | `text` (the text's own voice); `instructed` (words the Prophet is told to say); `quoted` (another speaker's words); `open` |
| `reporter_who` | Who that is, if `quoted` or `open`; otherwise an empty string | free text |
| `holder` | Who holds the attitude, as the text names or describes them | free text, close to the Arabic |
| `holder_kind` | Whether the holder is a particular person or group, people in general, or a supposed case | `specific`; `generic`; `hypothetical`; `open` |
| `proposition` | What is held, as one sentence **with its own polarity**: "that God will not help him" is a different proposition from "that God will help him" | free text, close to the Arabic. If the construction allows more than one, give the first here and the others in `alternative` |
| `attitude` | Whether the text says the holder holds the proposition, or says they do not. "I do not suppose that P" is `not held`; "I suppose that not-P" is `held`, with the negative inside the proposition | `held`; `not held`; `open` |
| `scope` | Every layer the attitude stands under. More than one may apply | an array of any of: `plain` (stated of the holder with none of the following); `verb negated`; `prohibited`; `questioned`; `conditional`; `inside quoted speech`; `inside instructed speech`; `generic or hypothetical` |
| `scope_note` | For each layer, the Arabic word that makes it and what exactly it governs | free text with Arabic |
| `truth` | How **the text's own voice** presents the proposition. A quotation is not endorsed because it is quoted. A question or a prohibition does not by itself make the proposition false | `false`; `true`; `open`; `not applicable` |
| `truth_evidence` | The Arabic that shows it, and where (same verse, or which verse nearby). Empty if `open` or `not applicable` | free text with Arabic |
| `grounds` | What the text says the holder relied on. "Not reported" is not the same as "denied": the first means the text is silent, the second that it says the holder had no knowledge or proof | `stated`; `expressly denied`; `not reported`; `not applicable` |
| `grounds_evidence` | The Arabic that states or denies the ground, and where. Empty if `not reported` or `not applicable` | free text with Arabic |
| `grouping` | Only for an entry listed "together with" a second word: are the two one unit of sense here? | `one unit`; `not one unit`; `open`; `not applicable` (entry has one word) |
| `context` | The verses read for this entry | e.g. "17:90-94" |
| `unsure` | Which fields are uncertain, and why. Empty array if none | array of strings, each beginning with the field's name |
| `alternative` | A serious second reading, with what would change in the fields above. Empty string if none | free text |
| `note` | Anything else, including where memory and not the shown text decided something | free text |

## Rules

- Keep five things apart: who reports, who holds, what is held, whether the text presents it as true, and what the holder relied on. A true belief can be held on no ground. A false one can be held on a stated ground.
- Do not supply an event the text does not describe. A generic or supposed holder is a valid answer.
- Arabic is copied from the batch file or the printed sura, not typed.
- Do not use the labels to make the three words come out different, or alike. Label each entry on its own verses.

## Sealing and exchange

1. The annotator's file is kept in `project/inventory/sealed/`, which git ignores, and out of the other model's context.
2. `node project/tools/supposing-labels.mjs <file> A` must pass: every entry present once, every field present, every listed value valid.
3. The file's SHA-256 is committed to `project/inventory/SEALS.md`: who, batch, hash, date.
4. When both seals for a batch are in, both files are published unchanged in `project/inventory/labels/`. Corrections go in a separate note.

Agreement between the two files is then counted field by field by the same tool. It measures consistency between two annotators who share much of their training. It does not show that either is right.

## Order of work

1. **Batch A**: the 18 core entries of half A of the build suras, and its one comparison entry (39:47:25).
2. Exchange, compare, and revise these instructions where labels proved ambiguous. The revised version is committed before batch B.
3. **Batch B**: the 43 core entries of half B and its one comparison entry (59:2:28). Half B has been on display in the inventory since it was first published, and both models have seen counts over all 61 entries. It is a later batch, not unseen text.

No claim about the three words is fixed or tested by this annotation. A claim to be met with the test suras needs its own exact wording, its own denominator and its own plan, agreed and pushed before any test sura is read for it.
