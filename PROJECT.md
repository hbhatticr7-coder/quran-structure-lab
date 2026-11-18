# The Quran read by itself

A long-running project, worked on by two AI models (Claude and Codex) and owned by a human. Started 2026-11-17.

## The question

The Quran constantly chooses between options that mean nearly the same thing: one word or its near-synonym, one closing phrase or another, one order of a pair of words or the reverse. The classical claim is that none of these choices is arbitrary, and that no word could be swapped for another.

This project tests that claim directly. **For every choice the text makes, can we state a rule that predicts it, and does the rule still work on parts of the text it was not built from?**

If the choices are deliberate, each has a reason, and a reason found in one half of the text should predict the other half. If they are arbitrary, rules will fail on new text.

## The method

1. **Census.** Find every place where the text makes a choice of a defined kind. See `project/CENSUS.md`.
2. **Split.** The 114 suras are divided once into three parts.
   - **Build** (58 suras): rules are written and tuned here.
   - **Test** (28 suras): each rule is scored here once, then frozen.
   - **Vault** (28 suras): never touched until the owner asks, to give one final clean score.
3. **Rules.** A rule is a small program that looks at the text around a choice, with the chosen word hidden, and names the option it expects.
4. **Score.** A rule passes if, on the test suras, it is right more often than the baseline. The baseline is the option used most often for the same choice in the build suras.
5. **Challenge.** Every rule one model passes, the other model tries to break.
6. **Scoreboard.** `SCOREBOARD.md` shows how many of the choices in the test suras are predicted correctly, by the baseline and with the rules that have passed.

## Stages

| Stage | What | State |
|---|---|---|
| 1 | Word choice: rules for the choices in the census | started |
| 2 | The Quran's own dictionary: how each word is used across the whole text, built from the rules of stage 1 | not started |
| 3 | The Quran's own test (4:82): every statement on each subject compared with every other | not started |
| 4 | Cross-references and the map of objections and replies | not started |
| Throughout | The same census and rules run on comparison texts (the Gospels, Samuel-Kings-Chronicles, the Mishnah), to show whether a score is unusual | not started |

## What this can and cannot show

- It can show how much of the Quran's wording is governed by statable rules, and what those rules are.
- It can show whether that is more than in other carefully composed texts.
- It cannot prove where the text comes from.
- Both models learned the whole Quran in training. A rule's author may know the test suras from memory, so "not built from" is weaker here than with a human who had never seen them. The vault, the comparison texts and the challenge step are the guards against this.

## Files

- `PROJECT.md`: this file.
- `AGENTS.md`: the working rules for both models. Read it before doing anything.
- `SCOREBOARD.md`: the current score.
- `project/QUEUE.md`: the tasks, in order.
- `project/LOG.md`: what was done, newest first.
- `project/DISCUSSION.md`: where the two models talk to each other.
- `project/CENSUS.md`, `project/sites/`: the choices found in the text.
- `project/split.json`: which suras are build, test and vault.
- `project/rules/`: the rules. `project/ledger/`: each rule's scores.
- `project/tools/`: the census, the scorer and the scoreboard.

The twenty batches of tests that came before this project are in `REPORT.md` and `RESULTS.md`.
