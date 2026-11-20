# Task queue

Take the first open task not claimed by the other model. To claim one, change `open` to `claimed by <you>, <date>`, commit and push, then start. When finished, change it to `done, <date>` and move it to the bottom section. Add new tasks where they belong in the order.

## Open

27. **Direct Arabic reading pilot.** `claimed by codex, 2026-11-19 (Codex first reading of 49 done and revealed; remaining pilot pending)` See `project/DIRECTION_REVIEW.md` and discussion 22; the pilot does not change the charter. Independently read build suras 19, 41 and 49, preserve each initial account before exchange, document claims/structure/alternatives, then publish three readable accounts and a synthesis. Prior familiarity remains disclosed. No vault access required. Both models agreed the amended packet (discussion 25–26). The owner authorized the fresh Codex reader on 2026-11-19 (discussion 27).
    Codex confirms `project/reading/PACKET.md` unchanged. The substantive question is warranted belief and responsible action (`project/RESEARCH_PRIORITY.md`). Both first-reading hashes for 49 were pushed before Codex's reveal in `project/reading/codex-49.md`; its bytes match the seal. The fresh reader received only the packet and all 18 Arabic verses exported through `loadText('build')`, with no conversation history or other account, and reported using no other sources. Claude's reveal, cross-review of 49, suras 41 and 19, and synthesis remain pending. See discussion 28.

29. **Every place the text names a ground for belief.** `claimed by claude, 2026-11-19` (build-only inventory first; proposed in discussion 25, scope set in 26)
    The way into the question of `project/RESEARCH_PRIORITY.md` by all places of a word group and not by chosen verses. First group: the three words for supposing (*ẓanna* with its noun, *ḥasiba*, *zaʿama*), 66 places in the build suras. A tool that lists them from the morphology; then, at each place and by both models independently: who supposes, about what, and does the text treat it as sound, mistaken or open? What separates the three is then written as a claim, fixed and pushed, before any test sura is read for it.
    Discussion 26 asks Claude to lead. Publish the exact retrieval criteria, candidates and exclusions first; 66 is a provisional count, not yet an audited sample. Distinguish belief content, truth assessment and grounds; retain ambiguity, negation and quotation. This covers the declared vocabulary in build suras, not every expression of belief or its grounds. Codex will review the inventory; no test access agreed for this task yet.
    Inventory published 2026-11-19 (claude; discussion 29): `project/inventory/SUPPOSING.md`, made by `project/tools/supposing-inventory.mjs`. 94 candidate words, 66 included, 28 set aside with reasons; 61 places (*ẓanna* 33, *ḥasiba* 21, *zaʿama* 7). Waiting for Codex's review of the rules and the six proposed columns. No place labelled yet.

18. **"To come": the past-tense places that use ata.** `looked at on the build suras, 2026-11-18 (claude); no rule tested; carried into task 5`
    R003 leaves these unexplained: 18 of 119 past-tense places in the build suras. In several, what comes is God, His command or the punishment ("God's command has come", "the punishment came upon them from where they did not perceive"). Compare with the classical account (al-Raghib: ata is coming with ease, and is used of coming by command or design). Result (log, 2026-11-18): one clean mark in the build suras (the next word is "God" or "the punishment": ata 5, ja'a 0) and 13 places with nothing statable in common. The test suras hold 13 such places and a pass needs 7 gains with no loss, so a rule for this set alone is unlikely to pass (codex, message 16: not impossible). It is a candidate for the family test in task 23.

15. **Tool: a rule on ground a passed rule covers must beat that rule.** `open` (design agreed in discussion messages 8 and 10; build it when a rule has passed under method version 4 and survived challenge)
    As things stand a later rule for "to come" would beat the baseline simply by containing R003. Change the scorer so that, on places a passed rule answers, the comparison is with the passed rule (picked as on the scoreboard), not with the commonest option. Agree the design with the other model in `project/DISCUSSION.md` first.

22. **Review the wider phrases and the surface-content result.** `claimed by claude, 2026-11-19`
    Read `project/COMPARISON_V2.md` and the protocol frozen in `dce3342`. Check that the two-word and masked-alignment definitions use only defining data and count each phrase slot once. The Quran surface-content control has p = 0.00205 by place and 0.0016 by sura; the lexical control misses the sura threshold. Challenge the surface result with repetition, unit omission and grammar controls. This follow-up is selected after the result: label its checks post hoc, preserve the frozen output, and do not turn it into a native ledger pass. Keep all unsuccessful arms and the zero added Quran alignment coverage visible.

5. **Rival roots: a sourced list of near-synonyms.** `claimed by claude, 2026-11-18` (rewritten 2026-11-19; see "the angle from 2026-11-19" in `PROJECT.md`)
   `project/synonyms.json` has 9 sets. Build a much longer list of words that are near in sense and come from different roots. Each set needs a classical source for the nearness (for example al-Askari's *al-Furuq al-lughawiyya*, al-Raghib's *Mufradat*), and for each word the core sense its root is given in the classical dictionaries (Ibn Faris, *Maqayis al-lugha*), quoted or closely reported, with a note where it is from memory and unchecked. Options stay explicit lists of dictionary forms compiled from the build suras, each with at least 5 build occurrences. Words cannot be picked by the company they keep (log, 2026-11-19): that finds words that go together, not words that replace each other. Fix the rule for what gets on the list before compiling it, so the list is not a selection of cases that look promising.

23. **One family test of the root idea.** `open` ON HOLD since 2026-11-19: see the second log entry of that day and discussion message 20; the owner is deciding.
    At each place where one of a set of rivals is used, hide it and name the right one from the company kept by the *other* words of its root, never by the word itself. Proposed primary score: against the same predictor fed the other words of a wrong root, matched in number. Beside it: own company with and without the root's other words; the baseline; and any stated rules drawn from the roots' core senses (task 18's lead among them). All members, sets, overlaps, abstentions and the primary score fixed together and pushed before one test, under a new rule ID, with earlier exposure listed as in message 16.

24. **Far senses of one root.** `open` ON HOLD since 2026-11-19: see the second log entry of that day and discussion message 20; the owner is deciding.
    Where the words of one root have senses that look unrelated ("great" and "bone", "mercy" and "womb", "garden" and "jinn"), do they still keep related company? `project/tools/root-families.mjs` gives a mixed first look on a handful of pairs chosen from memory. To do it properly, each word needs a meaning from outside the text, so that "unrelated senses" is decided by a rule. Find word-by-word glosses or a dictionary with a licence that allows use, report what exists before downloading anything large, and keep third-party files out of the repository (`data/external/`). Build suras only until a test is declared.

25. **Root families in a Hebrew text, for scale.** `open` ON HOLD since 2026-11-19: see the second log entry of that day and discussion message 20; the owner is deciding.
    Two words of one root keep related company across the halves of the build suras: rank 0.68 where chance is 0.50 (log, 2026-11-19). Is that ordinary for a Semitic text? Run the same measurement on the build part of Samuel-Kings-Chronicles if the data carry roots or can be given them from a sourced lexicon. Say plainly if they cannot.

6. **Order of paired words.** `open`
   Only 6 pairs show both orders within the build suras, with 15 choices in the test suras. Too few to test a rule. First widen the definition: pairs joined by "and" with words between them, and pairs in parallel clauses.

7. **Divine-name closings as their own problem.** `open`
   Many verses close with a pair of divine attributes. Define the set mechanically (both words are attributes of God in the verse), and treat the choice of the pair as one problem. The classical claim is that the pair fits the content of the verse. Neither echo nor the content rule beat the baseline on verse endings as now defined.

8. **Census: words added or left out.** `open`
   104 pairs of near-identical verses differ by words added or omitted. Turn these into a problem type ("present or absent").

9. **Census: choices of form.** `open`
   Singular or plural, verb form, definite or indefinite, attached particle. The morphology file has these features. Add them as a problem type for slots where the dictionary word is the same and the form differs.

10. **Stage 2 plan: the dictionary.** `open` (from 2026-11-19 the unit is the root: see `PROJECT.md`; write this after task 5 shows what an entry needs)
    Write `project/STAGE2.md`: for each word in the synonym sets, what a "profile of use" contains (who does it, to whom, what it is paired with and set against) and how a profile is checked. Plan only.

11. **Stage 3 plan: the Quran's own test (4:82).** `open`
    Write `project/STAGE3.md`: how statements on one subject are gathered, how two statements are compared, what counts as an apparent tension, and how a reader checks each entry. Plan only. This stage needs care: read "Writing" in `AGENTS.md`.

16. **An early Arabic text to compare with.** `open`
    R003 may describe the Arabic of the time and not the Quran. To tell, the same count is needed in another early Arabic text with word-by-word grammar (early poetry, or prose close to the period). Find out what exists with an open licence and a morphological annotation, and report. Do not download large files without saying so in the log.

## Done

- **Task 28: response to Claude's pilot amendments and Codex's own research priority.** done, 2026-11-19 (codex). Message 24 accepts the safeguards with amendments and rejects the claim that only held-out prediction can make a reading answerable to evidence. `project/RESEARCH_PRIORITY.md` proposes studying warranted belief and responsible action, using prior knowledge to generate and verify competing interpretations and track their assumptions. Existing QurAna/QurSim/QAC resources checked; no claim of historical novelty, no pilot or corpus test run. See log for incidental web-result exposure.

- **Task 26: independent direction review requested by the owner.** done, 2026-11-19 (codex). Read message 20, researched model limitations and method design, inspected the context-information code, and read selected build passages in Arabic. Recommends direct reading as the main project, with al-Askari secondary; gives concrete annotation/statistical objections and a three-sura pilot. See `project/DIRECTION_REVIEW.md` and discussion 22. No experiment or test/vault reading, and no charter or historical score changes.

- **Task 4: widen the phrase census.** done, 2026-11-19 (codex). Method 5 uses two written context words on either side and build-defined masked alignments, with one owner per phrase slot. Build places grow from 725 to 1,290; known test choices from 140 to 280, with 103 unseen answers. Alignment adds no Quran problems after local ownership. Native census, build-only sites and scoreboard regenerated after the method was published. See `project/COMPARISON_V2.md` and its frozen protocol; 52 checks pass, no vault run.

- **Task 12: improve comparison coverage and linguistic matching.** done, 2026-11-19 (codex). Complete method, catalogue, build results and exposure policy frozen and pushed in `dce3342` before one test. All-word surface arms give 144/132/169 known phrase choices in the comparison collections, up from 2/27/13; separate lexical arms add sourced contrasts for unchanged R002. Only the Quran surface-content control has both descriptive p-values below 0.01; none of the lexical aggregates does. No native pass changes. Results and all-place denominators are in `project/COMPARISON_V2.md`; original splits/results/rules/ledgers preserved. Independent follow-up is task 22.

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
