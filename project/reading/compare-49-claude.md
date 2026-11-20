# Sura 49: the two first readings compared (claude, 2026-11-19)

A separate note, as the packet requires. The two sealed accounts are unchanged: `claude-49.md` (SHA-256 `07e1166c…4737`) and `codex-49.md` (`d20d8500…2441`), both checked against `SEALS.md` before this was written. Build sura; no test or vault sura was read.

Both readers know the Quran and its commentaries from training. Where the two accounts agree, that is two readers with much the same schooling agreeing. It is not two independent witnesses.

## 1. In short

- On who speaks and how God is referred to, the two tables agree almost everywhere (18 and 20 of the 20 spans that both marked).
- They disagree in two places, and both are worth knowing about. One is a fault in the packet: it never said what "inside a story" means, and the readers took it differently in 10 of 20 spans. The other is in the text: after each "say" (verses 14, 16, 17) the Arabic does not mark where the Prophet's words end. Both readers flagged this, and then chose opposite defaults.
- Both accounts find the same turns (verse 13, verse 14) and the same unresolved tension (verse 9 calls two fighting parties "believers"; verse 15 defines the word far more narrowly).
- Codex's account quotes the Arabic exactly, 60 times out of 60. Mine re-typed it: no wrong letters, but 57 of 128 quotations differ from the printed text in their marks. Two claims in my account are loosely worded and are corrected in section 6.
- My account makes more claims that could be wrong. Codex's is more careful and commits to less. Section 5 asks Codex five things.

## 2. Quotations checked against the Arabic

`node project/tools/reading-check.mjs 49` compares every run of Arabic in each account with the text.

| | Quotations | Exact | Same but for the order or encoding of marks | Same letters, different marks | Letters not in the sura | In the verse the table row names |
|---|---|---|---|---|---|---|
| claude-49.md | 128 | 71 | 52 | 5 | 0 | 101 of 102 |
| codex-49.md | 60 | 60 | 0 | 0 | 0 | 45 of 45 |

The five with different marks in mine: لَمْ تُؤْمِنُوا۟ twice (the text has لَّمْ, with the mark of assimilation), آمَنَّا once (the text writes ءَامَنَّا), and two dictionary forms (أَسْلَمَ, آمَنَ) that are not quotations. The one misplaced citation: in the Words table, row "4", the phrase تَخْرُجَ إِلَيْهِمْ is from verse 5.

## 3. The tables of voices

### Spans

Claude marked 26 spans, Codex 25. Twenty are the same stretch of text in both: the whole of verses 1 to 6, 8 to 13, 15 and 18; the first three parts of 14 (the report, the quoted "we believe", the "say"); both parts of 16; and the last part of 17 (from لَّا to صَٰدِقِينَ).

The spans differ in three verses.

- **7.** Claude splits at أُو۟لَٰٓئِكَ, where "you" becomes "those". Codex keeps one span and says in its preface that speaking of the audience in the third person does not change who is addressed.
- **14, after "say".** Codex gives the nested "we have submitted" its own span and keeps everything from وَلَمَّا to the end as the Prophet's words, marked sure. Claude keeps "we have submitted" inside the Prophet's words, and splits off وَإِن تُطِيعُوا۟ … رَّحِيمٌ as uncertain between the Prophet's words and the text's own voice.
- **17.** Claude gives قُل its own span. Codex joins it to the statement before it, though it gave قُل its own span in 14 and 16.

### Agreement on the 20 common spans

"Command" and "prohibition" are one kind, as in the packet. A tick is agreement; a cross is a difference.

| Span | Speaker | God referred to as | Addressed | Level | In a story | Kind | Sure? |
|---|---|---|---|---|---|---|---|
| 1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| 3 | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |
| 4 | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| 5 | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| 6 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| 8 | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ |
| 9 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 10 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 11 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 12 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 13 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 14, the report | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| 14, "we believe" | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |
| 14, "say" | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| 15 | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| 16, "say" | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| 16, the speech | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| 17, the speech | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| 18 | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **Agree** | **18 of 20** | **20 of 20** | **15 of 20** | **18 of 20** | **10 of 20** | **17 of 20** | **16 of 20** |

Notes on the counting. In the "addressed" column I counted the Bedouins as the same answer whether a reader filed them under "opponents" (Claude) or "a group inside the scene" (Codex). In the "sure" column, verse 8 is counted as agreement because both readers record a doubt, though about different things. These are my judgments; the two tables are in the accounts for anyone to recount.

### What the differences are

**"In a story" (10 differences).** Claude answered "no" in every span: a reported saying is not a narrated story. Codex answered "yes" for 4 to 5 and 14 to 18, counting "represented encounters", and said its answer for 4 to 5 was uncertain. The packet gave no definition. This is the packet's fault and section 7 proposes a fix.

**Where the Prophet's words end (speaker, level and addressed at 15 and 18; the split of 14).** Both readers wrote "unsure" at 15 and at 18, and each named the other's answer as the alternative. Claude returned to the text's own voice; Codex continued the Prophet's speech. So this is one disagreement, not six, and it is about the text: nothing in the Arabic closes a speech opened by "say".

**"Addressed" at 3 and 8.** Claude recorded what the span itself marks ("no one marked"); Codex carried the audience over from the verse before and said so. Two conventions, not two readings.

**"Addressed" at the quoted "we believe".** Claude: no one marked. Codex: uncertain, probably the Prophet.

**"Kind" at 2, 6 and 8.** Codex lists a "lest" clause as a separate statement; Claude lists it as a warning attached to the command. At 8 Claude calls the verbless phrase "other".

**"Sure" at 3, 4, 5 and the quoted "we believe".** Codex is unsure where Claude is sure. In each case Codex's doubt follows from one of the differences above.

## 4. The accounts

### What both say

- The same passages: 1 to 5, 6 to 8, 9 to 12, 13, 14 to 18.
- The same two turns: verse 13 (the only address to all people, and the only "We"), and verse 14 (the first quoted speech and the first "say").
- The same main alternative: a set of separate rulings.
- The same unresolved points: what is "put forward" in verse 1; the force of لِ in "tested their hearts for heedfulness" (3); the severity of the warning in 2; which way the naming clause in 11 points; who decides which party is the aggressor in 9; whether "a male and a female" (13) means one first pair; and that the "believers" of 9 sit uneasily with the definition in 15.
- The same handling of that last point: the word is used in two strengths, and that is an interpretation, not something the text says.

### Where they differ

| | Claude | Codex |
|---|---|---|
| Main reading | The sura asks what the name "believer" requires: conduct in 1 to 12, the measure in 13, the measure applied to a claim in 14 to 18 | Disciplined judgment under divine authority: restrain presumptuous speech and action, judge others justly, do not confuse standing or declarations with inward faith |
| Verse 13 | The hinge of the sura | Exceeds a merely internal programme; no structural role claimed |
| Links found | "In your hearts" at 7 and 14, granted and denied; "obey" at 7 and 14 in opposite directions; "those are the …" three times (7, 11, 15); two definitions opening "the believers are only …" (10, 15); faith as God's gift at 8 and 17; one verb for "holding a favour over" turned round in 17 | "Hearts" at 3, 7 and 14; the brothers of 10 and the brother of 12; report (6) and fighting (9) joined by the danger of harm |
| Consequences | Five, one of them reaching other suras (the line between "submitted" and "believed" is drawn where a claim is being tested) | Three, all inside the sura; "no … claim about other suras follows necessarily" |

## 5. Challenges to Codex's account

1. **The end of verse 14 is marked "sure" as the Prophet's words.** That stretch contains وَإِن تُطِيعُوا۟ ٱللَّهَ وَرَسُولَهُۥ, "if you obey God and his messenger", with the speaker named in the third person. A speaker can name himself so, but that needs saying, and your preface treats the same question as open at 15 and 18. I think "unsure" is the right mark here too.
2. **"Inside a story: yes" for 4 to 5 and 14 to 18.** Nothing is narrated in sequence in either place: 4 to 5 comment on people who call out, and 14 to 18 are a present dispute. If "represented encounter" is the test, verse 2 (voices raised before the Prophet) is one as well. The packet is to blame; see section 7.
3. **قُل has its own span in 14 and 16 and not in 17.**
4. **The main reading would survive a different order of the same verses.** "Disciplined judgment under divine authority" describes the contents. It does not say why 13 stands between 12 and 14, or why the sura closes on God's knowledge. Your section 6 gives as consequences what verses 14 and 9 state outright (the Bedouins' claim is qualified; the fighting has an end), so they cannot come out false. Please name one thing in the sura that would be otherwise if your reading were wrong.
5. **"Knowledge language frames and recurs throughout the sura."** By code, the root of *ʿilm* stands in verses 1, 7, 8, 13, 16 and 18. It frames the sura (1 and 18), and it is absent from 2 to 6, 9 to 12, 14, 15 and 17. "At the opening, the hinge and the close" is nearer the text than "throughout".

Two points where your account is better than mine, checked by code: "hearts" stands at 3 as well as 7 and 14, and the brother of 12 picks up the brothers of 10. My account uses neither link.

## 6. Corrections to my own account

The sealed file is not edited. These are the corrections.

1. **The Arabic was not copied exactly** (section 2). No letter is wrong. The reader re-typed the text where the packet said to copy it.
2. **"Verse endings on God's knowledge: 1, 8, 13, 16, 18."** Four verses end on it (1, 8, 13, 16). Verse 18 opens with "God knows the unseen" and ends on "sees what you do". The claim should read: four endings, and the last verse opens with it.
3. **Consequence 4, "mercy endings follow faults (5, 12, 14)".** Verse 10 also ends on mercy and was left out; it follows the fighting, so it fits. Verse 3 ends on forgiveness after praise, not after a fault, and counts against the claim as worded.
4. **"In your hearts" at 7 and 14: "a common idiom; the echo may be chance."** It is not common. The phrase stands in five verses of the 58 build suras (3:154, 33:51, 48:12 and these two). The echo is better supported than my own table allowed.
5. **One citation in the wrong row**: تَخْرُجَ إِلَيْهِمْ is in verse 5, not 4.

One count for scale, not a test: four of this sura's 18 verses end on a word from the root of *ʿilm* within their last two words. In the Medinan build suras the share is 82 of 946 verses (8.7%). No claim is made from one sura.

## 7. Proposed changes to the packet, before suras 41 and 19

For Codex to accept or amend. The accounts of 49 stand as they are.

1. **"Inside a story"** means the span belongs to a telling of past events in sequence. A present dispute introduced by "they say" is reported speech, not a story.
2. **Addressed**: write what the span itself marks. Where nothing is marked, write "carried over from verse N".
3. **Where a speech opened by "say" has no marked end**, the level is "open: the Prophet's words or the text's own voice", a value of its own. The reader adds which way they lean and why.
4. **Kind** counts main clauses. A "lest" clause or a reason clause is not a separate statement.
5. **"Say" always has its own span.** So does a quotation nested inside another.
6. **Arabic is pasted, not typed**, and `reading-check.mjs` is run on the account before it is sealed.

## 8. The question to carry into the second pass

Whose words is verse 15? If the Prophet's, the strict definition of a believer is said *to the Bedouins*, as a standard they have not met. If the text's own, it is a definition for every hearer, and it is then the second of two definitions that open with the same words (10 and 15).

From the Arabic alone I can offer two things, neither decisive. First, verse 17 begins in the text's own voice ("they hold it over you …"), so the speech opened by "say" in 16 has ended by then without any mark; speeches here do close silently. Second, "say" is given again at 16, which is needless if 15 is still inside the speech of 14, though a repeated "say" can also mark a new point within one address.

This is the first thing to look up when the commentaries are opened, and the first place where a reading of this sura depends on a choice the text leaves open.
