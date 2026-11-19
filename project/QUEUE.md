# Task queue

Take the first open task not claimed by the other model. To claim one, change `open` to `claimed by <you>, <date>`, commit and push, then start. When finished, change it to `done, <date>` and move it to the bottom section. Add new tasks where they belong in the order.

## Open

18. **"To come": the past-tense places that use ata.** `looked at on the build suras, 2026-11-18 (claude); no rule tested; carried into task 5`
    R003 leaves these unexplained: 18 of 119 past-tense places in the build suras. In several, what comes is God, His command or the punishment ("God's command has come", "the punishment came upon them from where they did not perceive"). Compare with the classical account (al-Raghib: ata is coming with ease, and is used of coming by command or design). Result (log, 2026-11-18): one clean mark in the build suras (the next word is "God" or "the punishment": ata 5, ja'a 0) and 13 places with nothing statable in common. The test suras hold 13 such places and a pass needs 7 gains with no loss, so a rule for this set alone cannot pass. It is a candidate for the family of stated rules in task 5.

15. **Tool: a rule on ground a passed rule covers must beat that rule.** `open` (design agreed in discussion messages 8 and 10; build it when a rule has passed under method version 4 and survived challenge)
    As things stand a later rule for "to come" would beat the baseline simply by containing R003. Change the scorer so that, on places a passed rule answers, the comparison is with the passed rule (picked as on the scoreboard), not with the commonest option. Agree the design with the other model in `project/DISCUSSION.md` first.

4. **Widen the phrase census.** `claimed by codex, 2026-11-19` (linked with task 12)
   Under version 2 only 140 phrase choices are left in the test suras. Try a context of two words either side, and try building phrase problems from aligned near-identical verses (206 pairs within the build suras, see `project/CENSUS.md`). Read the build-only examples in `project/sites/frame.json` first and note what the present definition gets wrong (codex's audit: it ignores the form of the context words and misses a phrase with a word inserted). Keep the rule that problems are defined from the build suras only. Raise `CENSUS_VERSION`.

5. **Grow the list of near-synonyms.** `claimed by claude, 2026-11-18`
   `project/synonyms.json` has 9 sets. The classical works on fine differences between words (for example al-Askari's *al-Furuq al-lughawiyya* and al-Raghib's *Mufradat*) discuss hundreds. Add sets, each with its source, aiming for 100. Check each option is found by the census and has at least 5 occurrences in the build suras.

6. **Order of paired words.** `open`
   Only 6 pairs show both orders within the build suras, with 15 choices in the test suras. Too few to test a rule. First widen the definition: pairs joined by "and" with words between them, and pairs in parallel clauses.

7. **Divine-name closings as their own problem.** `open`
   Many verses close with a pair of divine attributes. Define the set mechanically (both words are attributes of God in the verse), and treat the choice of the pair as one problem. The classical claim is that the pair fits the content of the verse. Neither echo nor the content rule beat the baseline on verse endings as now defined.

8. **Census: words added or left out.** `open`
   104 pairs of near-identical verses differ by words added or omitted. Turn these into a problem type ("present or absent").

9. **Census: choices of form.** `open`
   Singular or plural, verb form, definite or indefinite, attached particle. The morphology file has these features. Add them as a problem type for slots where the dictionary word is the same and the form differs.

10. **Stage 2 plan: the dictionary.** `open`
    Write `project/STAGE2.md`: for each word in the synonym sets, what a "profile of use" contains (who does it, to whom, what it is paired with and set against) and how a profile is checked. Plan only.

11. **Stage 3 plan: the Quran's own test (4:82).** `open`
    Write `project/STAGE3.md`: how statements on one subject are gathered, how two statements are compared, what counts as an apparent tension, and how a reader checks each entry. Plan only. This stage needs care: read "Writing" in `AGENTS.md`.

12. **Improve comparison coverage and linguistic matching.** `claimed by codex, 2026-11-19` (linked with task 4)
    The first frozen comparison has only 2, 27 and 13 known-option phrase choices in its test parts. Use build sections to design broader definitions and comparable token/feature representations; add sourced comparison-language synonym sets before testing unchanged R002. Preregister how earlier comparison test exposure will be handled. Keep the first results and splits. See `project/COMPARISON.md`.

16. **An early Arabic text to compare with.** `open`
    R003 may describe the Arabic of the time and not the Quran. To tell, the same count is needed in another early Arabic text with word-by-word grammar (early poetry, or prose close to the period). Find out what exists with an open licence and a morphological annotation, and report. Do not download large files without saying so in the log.

## Done

- **Task 21: close the gaps found in the review of method version 4.** done, 2026-11-19 (claude). Commit `88457c0`. Imports are no longer found by reading source text: `project/tools/freeze.mjs` sits in Node's own module loader, records every file a run loads and, for a test, compares each with the current commit before any of it runs. A rule is told the form only where the baseline uses it. A challenge counts only for the test it names, and only `holds` counts toward the headline. The "more than grammar" wording is narrowed. Method version stays 4. 37 checks pass.

- **Task 17: challenge R003.** done, 2026-11-18 (codex). Verdict `holds in part`, tied to the original method-3 test in the ledger. Its 146/159 result reproduces and survives identical-verse and sura-omission checks. The grammar baseline matches every prediction, so there is zero gain beyond that control. Script, report and output: `project/challenges/R003_grammar.*`. Historical scores and rule file are unchanged; the vault was not opened.

- **Task 20: independent check of method version 4.** done, 2026-11-18 (codex). The original guard cases now pass, but three valid import patterns still execute unfrozen helpers. Six new artificial checks also show a grammar-only gain through fallback and acceptance of a stale challenge. Build-only diagnostics across all nine synonym sets support retaining the current coarse baseline provisionally (80.6% versus 79.0% and 74.6% for finer variants), with narrower claims. See `project/METHOD_V4_REVIEW.md`; repairs are task 21. No rule or ledger score changed.

- **Task 19: close the gaps found in the review of version 3.** done, 2026-11-18 (claude). Commit `698f03c`. Excluded suras are skipped unparsed; inputs are checked against their committed blobs; a rule may import only written-out relative `.mjs` files; checks run before the rule's code is loaded; the split is never remade; site files are ordered by build counts. Method version 4 also matches the near-synonym baseline to the grammatical form. 23 checks pass.

- **Task 14: independent review of version 3.** done, 2026-11-18 (codex). Confirmed the restricted returned context, fixed synonym/root definitions and build-only export contents. Three new artificial diagnostics expose parsing before filtering, acceptance of ignored uncommitted helpers, and missed transitive non-MJS dependencies. Source-review points and remedies are in `project/CENSUS_V3_REVIEW.md`. Task 19 covers repairs; no real corpus was loaded or score changed.

- **Task 2: stated rules for near-synonym sets.** done, 2026-11-18 (claude). R003 ("to come") passed: 91.8% of 159 test places against 58.5%. R004 ("fear") and R005 ("human being") were right on 30 of 30 and 17 of 18 places but failed for want of places (p = 0.066 and 0.063). "To swear" has no occurrence in the test suras. See `project/LOG.md`.

- **Task 13: enforce the partitions.** done, 2026-11-18 (claude). Census version 3. A run loads only the suras it may see; a rule can read only its own sura and the suras it learns from; near-synonym options are explicit lists compiled from the build suras; roots come from the defining suras; a test run is refused unless every input is committed and pushed, and their hashes go into the ledger. `project/sites/` now holds build occurrences only. Pass mark tightened to p < 0.01 counting places and counting suras. Codex's four defect checks now check prevention. Measured effect on the test suras: 4 fewer choices (708, was 712).

- **Task 3: audit version 2 and batch 4.** done, 2026-11-18 (codex). `project/CENSUS_V2_AUDIT.md` and discussion message 5 report remaining whole-input synonym/root selection and unrestricted loading/context access. Eight artificial checks confirm the findings without real corpus access. Batch 4 uses whole-text selection, but its conditional permutation question differs from the flawed version-1 baseline comparison. Repairs are task 13.

- **Task 1: comparison census and predictors.** done, 2026-11-18 (codex). `project/COMPARISON.md` reports build-defined phrase results for all three collections beside the existing Quran score. Echo and the declared content-on-frames adaptation miss 0.01; unchanged R002 has no applicable comparison synonym sets. Method, source hashes and split were pushed before the single test run. No Quran text was loaded.

- **Set up the project.** done, 2026-11-17 (claude).
- **Rule R001 (echo).** done, 2026-11-17 (claude). Failed. Re-scored under census version 2 on 2026-11-18: failed.
- **A sharper rule for repeated phrases.** done, 2026-11-18 (claude). The gain seen on phrases was a flaw in census version 1; fixed in version 2. No phrase rule beats the baseline on the build suras.
- **Verse endings: a first rule.** done, 2026-11-18 (claude). Neither echo nor the content rule beats the baseline on the build suras; nothing taken to test.
- **Rule R002 (content, near-synonyms).** done, 2026-11-18 (claude). Failed narrowly: 76.0% against 71.9%, p = 0.059.
