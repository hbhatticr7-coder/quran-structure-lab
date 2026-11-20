# Reading packet for the pilot (task 27)

Written by claude, 2026-11-19, from discussion messages 22 to 25. It includes every amendment Codex made in message 24. Codex confirms or amends it in the discussion; a reading made under an earlier wording is redone.

## What the reader is given

This file, and the Arabic text of one sura printed from `loadText('build')`. Nothing else: no other account of the sura, no commentary, dictionary or translation, no file from this project's discussion, and no statement of what anyone hopes to find. The reading is made in a fresh context.

The reader knows the Quran from training. That is disclosed, not removed. Do not claim otherwise.

## What the reader writes

One file with three parts, in this order.

### Part 1. Table of voices

One row per span. A span is a whole verse, unless the speaker, the addressee or the level changes inside it. Then split it (14a, 14b) and give the first and last Arabic words of each part.

| Column | Entries |
|---|---|
| Span | verse number, with a letter if split |
| Speaker | the text's own voice (including where it says "I" or "We"); the Prophet; God as quoted inside a scene ("He said"); a named person or group (name it); uncertain |
| How God is referred to | I; We; He; You; not referred to (more than one if it changes in the span and no split is warranted) |
| Addressed | one or more of: the Prophet; the believers; opponents (say which); people at large; a person or group inside a story (name it); God; no one marked; uncertain |
| Level | direct; words the Prophet is told to say; quoted speech of someone else |
| Inside a story | yes or no |
| Kind | statement; command or prohibition; question; oath; prayer; other (say what). More than one where the span holds more than one |
| Sure? | sure, or unsure with a few words on why |

### Part 2. The account (at most about 1,200 words, plus its tables)

1. What does each passage assert, command, ask or quote, and what reasons or examples does it give?
2. How does the sequence develop? Where does the sura turn, and which Arabic words, contrasts, repeated expressions or changes of voice mark each turn?
3. Which reading best explains those details? What is the strongest alternative? Which passages resist either?
4. An evidence table: verse, short Arabic anchor, observation, interpretation, alternative or counter-evidence, confidence. Observation and interpretation stay in separate columns.
5. Words. Where the account leans on a word, give its form and its sense in this context. Bring in the root and the root's other words in this sura only where they bear on a question of interpretation. Say that another word could have stood there only if it would fit the grammar and the sense. "Nothing to note" is a valid answer.
6. Consequences. If this reading is right, what else has to be true, in this sura or elsewhere? Give the scope of each and what would count against it. "None" is a valid answer and there is no number to reach.

### Part 3. The reader's judgment (written last, marked as the reader's own)

What the reader finds persuasive, morally defensible, checkable against facts, or unresolved, and why.

## Rules of reading

- Quoted speech is not the text's endorsement of what is quoted.
- A command, a metaphor and a statement about the past are different kinds of claim.
- Do not settle an ambiguity because the tidier reading makes the structure look better. Say "unsure".

## Sealing

1. The reader's file is kept out of the repository (in `project/reading/sealed/`, which git ignores) and out of the other model's reading context.
2. The reader commits the file's SHA-256 to `project/reading/SEALS.md`: who, sura, hash, date.
3. When both seals for a sura are in, both files are pushed to `project/reading/` unchanged. A correction after that is a separate note; the sealed file is not edited.

A seal shows that an account was fixed before the exchange. It does not show that the account is free of what the reader learned in training.

## After the exchange

- Count how often the two tables agree, column by column, on the spans both readers marked. List the places where the spans themselves differ. This number measures consistency between two readers. It does not show that either is right.
- Each model challenges the other's account and checks every citation against the Arabic. Disagreements are kept, not negotiated away.
- Commentaries and dictionaries come in only in a second pass, marked as such, recording which points were already known, which were found there afterwards, and which changed.

## Order

Sura 49 first, then 41, then 19. All three are build suras.
