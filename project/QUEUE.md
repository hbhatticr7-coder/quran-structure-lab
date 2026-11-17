# Task queue

Take the first open task not claimed by the other model. To claim one, change `open` to `claimed by <you>, <date>`, commit and push, then start. When finished, change it to `done, <date>` and move it to the bottom section. Add new tasks where they belong in the order.

## Open

1. **Challenge rule R001 (echo).** `open` (for the model that did not write it: codex)
   R001 says the word chosen is the one whose root is commonest in the ten verses either side. Check whether its score rests on refrains or on a few suras, whether it survives when verses identical to a nearby verse are counted once, and how it does with a window of 3 and of 30 verses. Done when `project/ledger/R001.json` has a `challenge` entry and the checks are a script in `project/challenges/`.

2. **Verse endings: a first rule.** `open`
   R001 does worse than the baseline on verse endings (39% against 55% on the build suras). The classical claim is that a closing phrase fits the content of its verse: "forgiving, merciful" after sin and repentance, "mighty, wise" after a ruling or a punishment. Write a rule that predicts the closing word from the words of the verse itself, learning from `ctx.build`. Done when the rule is tested.

3. **Grow the list of near-synonyms.** `open`
   `project/synonyms.json` has 9 sets. The classical works on fine differences between words (for example al-Askari's *al-Furuq al-lughawiyya* and al-Raghib's *Mufradat*) discuss hundreds. Add sets, each with its source, aiming for 100. Check each option is found by the census and has at least 5 occurrences. Done when the census runs with the new sets and `project/CENSUS.md` is updated.

4. **Synonyms: one rule per set, starting with the largest.** `open`
   The sets "to come", "to do" and "to send down" hold most of the synonym choices. For each, state the classical account of the difference, turn it into a rule, and test it. Batch 15 in `RESULTS.md` has earlier whole-text results for these sets; say so in each rule's `provenance`.

5. **Order of paired words.** `open`
   17 pairs occur in both orders (jinn and mankind, play and amusement, hearing and sight). Write a rule for which comes first. Candidate ideas: the one the passage is about comes first; the order follows the order of events. Done when a rule is tested.

6. **Run the census and R001 on the comparison texts.** `open`
   Use `src/greek.mjs` (Matthew, Mark, Luke) and `src/hebrew.mjs` (Samuel, Kings, Chronicles) and the Mishnah loader of batch 13. Build the frame problems the same way and score the echo rule the same way, with a split made the same way. Done when `project/COMPARISON.md` reports the same headline numbers for each text beside the Quran's.

7. **Census: words added or left out.** `open`
   104 pairs of near-identical verses differ by words added or omitted. Turn these into a fifth problem type ("present or absent") and add it to the census, the scorer and the scoreboard.

8. **Census: choices of form.** `open`
   Singular or plural, verb form, definite or indefinite, attached particle. The morphology file has these features. Add them as a problem type for slots where the dictionary word is the same and the form differs.

9. **Divine-name closings as their own problem.** `open`
   Many verses close with a pair of divine attributes. Define the set mechanically (both words are attributes of God in the verse), and treat the choice of the pair as one problem.

10. **Stage 2 plan: the dictionary.** `open`
    Write `project/STAGE2.md`: for each word in the synonym sets, what a "profile of use" contains (who does it, to whom, what it is paired with and set against) and how a profile is checked. Plan only.

11. **Stage 3 plan: the Quran's own test (4:82).** `open`
    Write `project/STAGE3.md`: how statements on one subject are gathered, how two statements are compared, what counts as an apparent tension, and how a reader checks each entry. Plan only. This stage needs care: read "Writing" in `AGENTS.md`.

## Done

- **Set up the project.** done, 2026-11-17 (claude). Charter, working rules, census (629 problems, 4,910 occurrences), split, scorer, scoreboard.
- **Rule R001 (echo).** done, 2026-11-17 (claude). See `SCOREBOARD.md`.
