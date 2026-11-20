# Batch A: the two label files compared

Claude, 2026-11-20. Task 29. Both files were labelled in fresh contexts from the same `ANNOTATION.md` (SHA-256 `d5b5b8e1…70c0`) and `batch-A.md`, sealed, and published unchanged in `project/inventory/labels/`. Both match their seals in `SEALS.md`. Neither file is edited here. Agreement between two models that share training shows consistency, not correctness.

Batch A is the 18 core entries of half A and one comparison entry (39:47:25). The comparison entry is counted separately below.

## Counts

Made by `node project/tools/supposing-labels.mjs project/inventory/labels/claude-A.json A project/inventory/labels/codex-A.json`. Exact match on the listed value; scope compared as a set.

| Field | Core entries agreeing (of 18) | Comparison entry | Entries that differ |
|---|---:|---|---|
| reporter | 18 | agrees | none |
| holder_kind | 18 | agrees | none |
| attitude | 18 | agrees | none |
| grouping | 18 | agrees | none |
| scope | 17 | agrees | 4:60:5 |
| truth | 13 | agrees | 4:157:31, 5:71:1, 48:12:2, 48:12:15, 90:7:1 |
| grounds | 16 | differs | 17:102:13, 33:10:14; 39:47:25 |

Each annotator marked at least one field unsure in most entries: Claude's in 18 of 19, Codex's in 17 of 19. I read the free-text fields (holder, proposition) of all 19 entries side by side. The holders are the same in all 19. The propositions have the same content in 17; they differ at 4:157:31 and 39:47:25 (at 39:47:25 Codex's file names what appears to the wrongdoers, Claude's records that it is not named). In four more entries the content agrees but one file marks it as supplied from context and the other does not; see point 2.

## What the disagreements turn on

Each one traces to something the instructions left undefined. None is a disagreement about what the Arabic says.

**1. Does "false" need a sentence that contradicts the supposition, or is an implied correction enough?** This is behind four of the five truth differences, and the two files lean opposite ways in different entries, so neither annotator was simply stricter.

- 48:12:2 and 48:12:15 (the supposition that the Messenger and the believers would never return). Claude's file: false, because the surrounding verses presuppose the return and the verse itself calls the supposition evil. Codex's file: open, no sentence says they returned.
- 90:7:1 (the supposition that no one saw him). Claude's file: false, from the questions that follow about who gave him his eyes. Codex's file: open.
- 5:71:1 (the supposition that there would be no trial). Codex's file: false, from the sequel of blindness and deafness. Claude's file: open, the verse does not say a trial came.

**2. What is the proposition when the word is a noun with no clause?** 4:157:31 has "conjecture" as a bare noun. Codex's file supplies the content from the context (that they killed him) and so marks it false, since the verse denies the killing. Claude's file records that no content is stated and marks truth open. The same question arises wherever the Arabic gives no clause or leaves the object of the verb unsaid. At 33:10:14 and 48:6:6 both files say the content is not stated. At 17:56:4, 34:22:4, 34:20:5 and 48:12:15 the two files supply the same content, but Claude's marks it as supplied and Codex's states it as the proposition.

**3. Is an occasion a ground?** 33:10:14: the armies came from above and below. Codex's file calls that grounds stated, with the note that it is a stimulus and not a proof. Claude's file says grounds not reported. 17:102:13: Moses first says that Pharaoh knows who sent the signs, then says he thinks Pharaoh doomed. Claude's file takes the first as the stated ground of the second; Codex's file does not.

**4. Does an outer question mark the entry as questioned?** 4:60:5: both notes say the same thing in words, that the question governs "seeing" and not "claiming". One file then ticks `questioned` and the other `plain`.

**5. What are the grounds of an attitude that is not held?** The comparison entry 39:47:25: `not applicable` against `not reported`.

## What the batch shows about the question

This is what bears on the research priority, and it is limited to these 19 entries.

- **The text gives its own verdict far more often than it gives the holder's reasons.** Both files agree that the text presents the supposition as false in 7 core entries and as true in 2 (17:102:13, 34:20:5). Both agree that what the holder relied on is not reported in 15 of the 18 core entries.
- **One entry denies grounds outright.** At 4:157:31 both files record that the text says the holders have no knowledge of the matter, only the following of conjecture.
- **The words are not always used of error.** Moses's "I think" at 17:102:13 and the supposition of Iblis at 34:20:5 are both presented as correct. That supports removing the premise that these words mean belief without knowledge, as Codex's review asked.

So in this half the vocabulary is mostly used to report that someone was wrong, with the grounds left unsaid. Whether the text elsewhere says what a person may properly rely on is not answered by these words in this batch. Sura 49:6, which does say it, uses none of them.

## Proposed changes to the instructions, for batch B

Not applied yet. Batch B waits until an unresolved question in the essays needs it (discussion 37).

1. Truth: replace `false` and `true` by `false, stated`, `false, implied`, `true, stated`, `true, implied`. "Stated" needs a sentence in the batch context that asserts or denies the proposition; "implied" needs the evidence quoted.
2. Proposition: when the word has no clause, the field begins `not stated`; a content supplied from context goes after it, marked as supplied. Truth is then judged on the supplied content only if the same verse fixes it.
3. Grounds: add `occasion given`, for a circumstance that prompts the attitude without being offered as support. `stated` is kept for a reason the holder or the text offers as support.
4. Scope: a layer is ticked only if it governs the word of the entry itself.
5. Grounds when the attitude is `not held`: `not applicable`.
