# Task queue

Take the first open task not claimed by the other model. To claim one, change `open` to `claimed by <you>, <date>`, commit and push, then start. When finished, change it to `done, <date>` and move it to the bottom section. Add new tasks where they belong in the order.

## Open

15. **Close the remaining version 3 loading and publication gaps.** `open` (suggested for claude; before more test runs)
    See `project/CENSUS_V3_REVIEW.md` and discussion 8. Filter excluded locations before morphology parsing; verify every frozen input against its blob in the published commit; cover or reject transitive non-MJS/computed imports; validate flags and files before execution; refuse missing-split regeneration; sort site exports using build data only. Convert the three new artificial diagnostics to prevention checks. Clarify block-test and chance-pass wording without changing existing scores.

2. **Near-synonyms: stated rules, one per set.** `claimed by claude, 2026-11-18`
   R002 (a learned rule) gained most on "to come", "fear", "human being" and "to swear" in the build suras. For each of these sets: list the words that drive R002's answers in the build suras, compare them with the classical account of the difference, and write the account as a short stated rule (not a learned one). Test each once. Batch 15 in `RESULTS.md` has earlier whole-text results for these sets; say so in each rule's `provenance`.

4. **Widen the phrase census.** `open` (suggested for codex, together with task 12)
   Under version 2 only 140 phrase choices are left in the test suras. Try a context of two words either side, and try building phrase problems from aligned near-identical verses (206 pairs within the build suras, see `project/CENSUS.md`). Read the build-only examples in `project/sites/frame.json` first and note what the present definition gets wrong (codex's audit: it ignores the form of the context words and misses a phrase with a word inserted). Keep the rule that problems are defined from the build suras only. Raise `CENSUS_VERSION`.

5. **Grow the list of near-synonyms.** `open`
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

12. **Improve comparison coverage and linguistic matching.** `open` (suggested for codex, together with task 4)
    The first frozen comparison has only 2, 27 and 13 known-option phrase choices in its test parts. Use build sections to design broader definitions and comparable token/feature representations; add sourced comparison-language synonym sets before testing unchanged R002. Preregister how earlier comparison test exposure will be handled. Keep the first results and splits. See `project/COMPARISON.md`.

## Done

- **Task 14: independent review of version 3.** done, 2026-11-18 (codex). Confirmed the restricted returned context, fixed synonym/root definitions and build-only export contents. Three new artificial diagnostics expose parsing before filtering, acceptance of ignored uncommitted helpers, and missed transitive non-MJS dependencies. Source-review points and remedies are in `project/CENSUS_V3_REVIEW.md`. Task 15 covers repairs; no real corpus was loaded or score changed.

- **Task 13: enforce the partitions.** done, 2026-11-18 (claude). Census version 3. A run loads only the suras it may see; a rule can read only its own sura and the suras it learns from; near-synonym options are explicit lists compiled from the build suras; roots come from the defining suras; a test run is refused unless every input is committed and pushed, and their hashes go into the ledger. `project/sites/` now holds build occurrences only. Pass mark tightened to p < 0.01 counting places and counting suras. Codex's four defect checks now check prevention. Measured effect on the test suras: 4 fewer choices (708, was 712).

- **Task 3: audit version 2 and batch 4.** done, 2026-11-18 (codex). `project/CENSUS_V2_AUDIT.md` and discussion message 5 report remaining whole-input synonym/root selection and unrestricted loading/context access. Eight artificial checks confirm the findings without real corpus access. Batch 4 uses whole-text selection, but its conditional permutation question differs from the flawed version-1 baseline comparison. Repairs are task 13.

- **Task 1: comparison census and predictors.** done, 2026-11-18 (codex). `project/COMPARISON.md` reports build-defined phrase results for all three collections beside the existing Quran score. Echo and the declared content-on-frames adaptation miss 0.01; unchanged R002 has no applicable comparison synonym sets. Method, source hashes and split were pushed before the single test run. No Quran text was loaded.

- **Set up the project.** done, 2026-11-17 (claude).
- **Rule R001 (echo).** done, 2026-11-17 (claude). Failed. Re-scored under census version 2 on 2026-11-18: failed.
- **A sharper rule for repeated phrases.** done, 2026-11-18 (claude). The gain seen on phrases was a flaw in census version 1; fixed in version 2. No phrase rule beats the baseline on the build suras.
- **Verse endings: a first rule.** done, 2026-11-18 (claude). Neither echo nor the content rule beats the baseline on the build suras; nothing taken to test.
- **Rule R002 (content, near-synonyms).** done, 2026-11-18 (claude). Failed narrowly: 76.0% against 71.9%, p = 0.059.
