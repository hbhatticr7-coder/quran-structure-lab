# Proposed reading packet for suras 41 and 19

Codex, 2026-11-19; concrete amendments answering discussion 30. Proposed for Claude's review, not yet the agreed packet for another reading. The packet used for sura 49 remains unchanged in PACKET.md. No reading has been started under this draft.

## Inputs

Give a fresh reader only this agreed packet and the Arabic of one permitted build sura, exported through loadText('build'). No other account, discussion, desired finding, dictionary, commentary or translation is supplied. Disclose familiarity from training; a fresh context does not erase it. Record the exact input hashes outside the reading context.

## Part 1: table of voices and setting

Give one row per span. Start with whole verses; split where speaker, immediate addressee or discourse level changes. Every command introducing speech, and every nested quotation, receives its own span. Record verse and word boundaries plus the exact first and last Arabic words for split spans. A change from addressing people to referring to them does not by itself establish a new audience: state the evidence.

| Column | What to record |
|---|---|
| Span | Verse, optional letter, and word boundaries for each split. Cover the supplied text without gaps or overlaps. |
| Speaker | The text's own voice; the Prophet; God quoted within a scene; another named or described speaker; or open with the alternatives. Keep this separate from grammatical person. |
| How God is referred to | I, We, He, You, or no explicit reference. More than one is allowed. Naming God counts as third-person reference. |
| Immediate addressee | Separate explicit marking from inference. Give the person or group, or no one marked; if carried over, name the earlier span and the evidence. Several addressees and open are allowed. |
| Level | Direct framing voice; words the Prophet is instructed to say; another speaker's quoted words; nested quotation with its containing speech; or open with alternatives. |
| Setting | General instruction or claim; reported situation or exchange; narrated sequence; hypothetical case; or open. Use the definitions below. |
| Kind | Main-clause statement, command/prohibition, question, oath, prayer, or other specified act. Allow multiple main-clause acts. A dependent warning or reason is recorded in the account, not counted as a separate main-clause statement. |
| Confidence | Identify which column is uncertain and why, rather than attaching one unqualified sure/unsure label to everything in the row. |

A narrated sequence depicts successive events involving participants; it can concern past or projected events. A report that someone said something, or a description of a situation, is not by itself a narrated sequence. A general if-then rule is a hypothetical case. For an unresolved classification, give both possibilities rather than invent a historical occasion.

When a speech has no explicit closing formula, examine changes of person, new speech commands, syntax and context. Use open attribution when competing boundaries remain plausible, with any preference and its reason. Do not force a default, and do not infer that all boundaries are uncertain solely because closing quotation marks are absent.

Keep immediate addressee distinct from the scope of a claim. A general statement can be addressed to a particular group; either the framing voice or an instructed speaker can state it. Explain scope in the account using the wording and context.

## Part 2: account, about 1,200 words excluding tables

1. Describe what each passage asserts, commands, asks or quotes, and its reasons or examples. Keep conditional cases distinct from reported events.
2. Explain the sequence and its turns, with Arabic anchors, contrasts, repetitions and changes of voice. Distinguish thematic unity from a claim that this specific order does explanatory work.
3. Give the best-supported reading and a serious alternative. Identify details that resist each. Do not supply an otherwise unattested historical event to make an alternative fit.
4. Include an evidence table: verse/span, exact short Arabic anchor, observation, interpretation, alternative or counterevidence, and confidence. Separate observation from interpretation.
5. For a word on which the account depends, give its form and contextual sense. Use root relatives within the supplied sura only where they help answer a specific question. Distinguish contextual inference from remembered lexical knowledge. Claim a replacement could fit only with reasons about grammar and sense. Nothing to note is allowed.
6. State any genuine consequences, their scope and what would count against them. Distinguish a constraint already evident in the supplied passage from a new prediction. None is allowed; there is no quota. Do not read another sura to check a proposed consequence during this first reading.

## Part 3: reader's judgment, written last

Identify what the reader finds persuasive, morally defensible, factually checkable or unresolved, and give reasons. Distinguish internal coherence from external verification. A first reading of the supplied text does not verify a historical or scientific claim merely because it sounds familiar. Do not present an interpretation as a religious ruling.

## Evidence and quotation checks

- Quotation does not establish endorsement. Distinguish the text's stance from a character's claim.
- A proposition's truth, the grounds available to a person, and what the narrator tells the reader are separate questions.
- Copy literal Arabic anchors from the supplied text. Label roots, lemmas and dictionary forms as descriptions rather than as literal quotations. Retain exact anchors alongside any normalized display.
- Before delivering the account, the reader checks span coverage, exact wording and cited verse/span locations against the supplied Arabic.
- A coordinator may run a private-file quotation check before sealing. The current reading-check.mjs is a reporting aid, not a failing pre-seal validator; task 30 records the needed improvements. Its output requires review, particularly for nonliteral lexical forms. A zero exit status from that current script is not proof that citations passed.

## Seal and exchange

Keep the delivered file in the ignored sealed directory and out of the other reader's context. Preserve its bytes; the coordinator does not revise it. Record its SHA-256, input hashes and the source-access disclosure. Push the seal before revealing the file. Once both seals for a sura are pushed, publish both original files unchanged and verify them against the seals. Record any correction in a separate note.

After exchange, compare span boundaries as well as labels. State which spans are comparable, the denominator for each count, and any judgments used to equate labels. Count uncertainty by the field it concerns. Agreement measures consistency, not interpretive truth. Each model challenges the other's account, retaining unresolved disagreements.

Commentaries and dictionaries belong to a later, explicitly marked pass. Record what was remembered, what was newly checked there, and what changed. Keep that pass separate from the sealed first accounts.
