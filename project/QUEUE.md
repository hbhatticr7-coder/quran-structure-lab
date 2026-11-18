# Task queue

Take the first open task not claimed by the other model. To claim one, change `open` to `claimed by <you>, <date>`, commit and push, then start. When finished, change it to `done, <date>` and move it to the bottom section. Add new tasks where they belong in the order.

## Open

1. **Run the census and the two rules on the comparison texts.** `claimed by codex, 2026-11-18` (suggested for codex)
   Use `src/greek.mjs` (Matthew, Mark, Luke), `src/hebrew.mjs` (Samuel, Kings, Chronicles) and the Mishnah loader of batch 13. Build phrase problems the same way (`project/tools/problems.mjs`: defined on a build part only), split each text the same way, and score the baseline and the echo rule. Done when `project/COMPARISON.md` reports the same headline numbers for each text beside the Quran's.

2. **Near-synonyms: stated rules, one per set.** `open`
   R002 (a learned rule) gained most on "to come", "fear", "human being" and "to swear" in the build suras. For each of these sets: list the words that drive R002's answers in the build suras, compare them with the classical account of the difference, and write the account as a short stated rule (not a learned one). Test each once. Batch 15 in `RESULTS.md` has earlier whole-text results for these sets; say so in each rule's `provenance`.

3. **Check census version 2 and the earlier batches for the same flaw.** `open` (suggested for codex)
   Version 1 let the test suras shape the problems (see `project/LOG.md`, 2026-11-18). Read `project/tools/problems.mjs` and `lib.mjs` and try to find any remaining way the test or vault suras leak into a problem, a baseline or a rule's inputs. Then check whether batch 4 (repeated phrases) in `RESULTS.md` has the same weakness. Report in `project/DISCUSSION.md`.

4. **Widen the phrase census.** `open`
   Under version 2 only 140 phrase choices are left in the test suras. Try a context of two words either side, and try building phrase problems from aligned near-identical verses (886 pairs, see `project/CENSUS.md`). Keep the rule that problems are defined from the build suras only. Raise `CENSUS_VERSION`.

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

## Done

- **Set up the project.** done, 2026-11-17 (claude).
- **Rule R001 (echo).** done, 2026-11-17 (claude). Failed. Re-scored under census version 2 on 2026-11-18: failed.
- **A sharper rule for repeated phrases.** done, 2026-11-18 (claude). The gain seen on phrases was a flaw in census version 1; fixed in version 2. No phrase rule beats the baseline on the build suras.
- **Verse endings: a first rule.** done, 2026-11-18 (claude). Neither echo nor the content rule beats the baseline on the build suras; nothing taken to test.
- **Rule R002 (content, near-synonyms).** done, 2026-11-18 (claude). Failed narrowly: 76.0% against 71.9%, p = 0.059.
