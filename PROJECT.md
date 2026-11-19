# The Quran read by itself

A long-running project, worked on by two AI models (Claude and Codex) and owned by a human. Started 2026-11-17.

## The question

The Quran constantly chooses between options that mean nearly the same thing: one word or its near-synonym, one closing phrase or another, one order of a pair of words or the reverse. The classical claim is that none of these choices is arbitrary, and that no word could be swapped for another.

This project tests that claim directly. **For every choice the text makes, can we state a rule that predicts it, and does the rule still work on parts of the text it was not built from?**

If the choices are deliberate, each has a reason, and a reason found in one half of the text should predict the other half. If they are arbitrary, rules will fail on new text.

## The method

1. **Census.** Find every place where the text makes a choice of a defined kind. What counts as a choice, and what its options are, is decided from the build suras alone. See `project/CENSUS.md`.
2. **Split.** The 114 suras are divided once into three parts.
   - **Build** (58 suras): rules are written and tuned here.
   - **Test** (28 suras): each rule is scored here once, then frozen.
   - **Vault** (28 suras): never touched until the owner asks, to give one final clean score.
3. **Rules.** A rule is a small program that looks at the text around a choice, with the chosen word hidden, and names the option it expects.
4. **Score.** A rule passes if, on the test suras, it is right more often than the baseline, counting every place once and also counting every sura once. The baseline is the option used most often for the same choice in the build suras; for near-synonyms, the option used most often there in the same grammatical form.
5. **Challenge.** Every rule one model passes, the other model tries to break.
6. **Scoreboard.** `SCOREBOARD.md` shows how many of the choices in the test suras are predicted correctly, by the baseline and with the rules that have passed.

## Where the work stands, and the angle from 2026-11-19

The owner asked for the goals to be looked at again. This section is the answer. The question above stands. The way of going after it changes.

**What has been learned so far.**

- How often each option is used, together with the coarse grammar of the place, predicts 73.7% of the 848 choices in the test suras. Five rules have been tried. None adds to that.
- Two rules that read the surroundings without a stated reason both lost to that baseline: "the word's root recurs nearby" (R001) and "the word keeps its usual company" (R002).
- The classical accounts that were tested one at a time hold as tendencies on small numbers (`REPORT.md`, batch 15). None has passed here.
- The method is now strict enough for a result to be believed. Getting there took four rounds of repair.

**What was wrong with the angle.**

- The choices were too few and too mechanical: nine hand-picked sets of near-synonyms, repeated phrases, verse endings and paired words. After the baseline, about 60 places of each kind are left open in the test suras. No single rule can show much on that.
- Rule by rule, the work drifted into grammar. The classical claim is not about grammar. It is about meaning: that two words which translate alike are not the same word, and each is used where its own sense fits.
- A pass would have meant little. "Something in the surroundings predicts the word" is true of any careful text.

**The angle now: the root.** Arabic builds its words on roots, mostly of three consonants. The classical dictionaries hold that a root carries one core sense, sometimes two or three, which every word built on it shares (Ibn Faris, *Maqayis al-lugha*). The works on fine differences between near-synonyms argue the same way: two words that translate alike come from different roots, and each keeps the sense of its root. If that is right, the reason for a choice between two words lies in their roots, and the root is the right unit for this project. The owner's own example is of this kind: *'azim* ("great") and *'azm* ("bone") share a root.

**A first measurement** (build suras only; exploration, no rule tested; `project/tools/root-families.mjs`, log of 2026-11-19). Take two different words built on one root. Record the company the first keeps in one half of the build suras and the company the second keeps in the other half, leaving the root itself out. Compare with 40 words of other roots of the same kind and frequency. Chance is a rank of 0.50. A word compared with itself across the halves ranks 0.82. Two words of one root rank 0.68, and 72 of 94 roots are above chance. So words of one root keep related company even in different suras, a little over half as closely as a word resembles itself.

This is what Arabic as a language would lead one to expect. It is not a finding about the Quran. It shows that the root is a real unit of use in this text and that the tools here can see it.

Two cautions from the same run. Where two words of a root have drifted far apart in sense, the picture is mixed: "garden" and "jinn" rank 0.18, "peace" and "to submit" 0.18, "a human" and "to give good news" 0.57, "behind" and "to differ" 0.93. And words cannot be picked as rivals by their company alone: the closest pairs from different roots are words that go together ("gardens", "rivers", "beneath", "abiding"), not words that could replace each other.

**Three lines of work follow.**

1. **Rival roots.** A list of near-synonyms from different roots, each pair with a classical source for the claim that they are near in sense, and for each word the core sense its root is given in the classical dictionaries. Many pairs, fixed before any test (task 5, rewritten).
2. **One test of the root idea.** At each place where one of two rivals is used, hide it. Can the right one be named from the company kept by the *other* words of its root, never by its own? If the bones help say where "great" is *'azim* and not *kabir*, the root is at work in the choice. All pairs are tested together, once, as one family (task 23).
3. **Far senses of one root.** Where the words of a root have senses that look unrelated, do they still keep related company? This needs a meaning for each word from outside the text (task 24).

Stated rules from the root's core sense ("the punishment is called *humiliating* where the people were arrogant") belong to line 1 and are tested in line 2's family.

**What a strong result would be.** That the root sense of a word, written down a thousand years ago, predicts where the Quran uses that word and not its rival, on text the prediction was not built from. That would be a measured confirmation of the oldest claim about Quranic wording, and the list of pairs with their checked differences would be useful to any reader.

**What it would not be.** It would not show where the text comes from. And until the same measurement is made on another early Arabic text, it would not show that the Quran does this more than other Arabic does (task 16).

## Stages

| Stage | What | State |
|---|---|---|
| 1 | Word choice: rules for the choices in the census | five rules tried, none counts; from 2026-11-19 rules are tested as families, not one by one |
| 2 | The Quran's own dictionary, root by root: the words of each root, the company they keep, the root's rivals and what separates them | started 2026-11-19 with a first measurement of root families |
| 3 | The Quran's own test (4:82): every statement on each subject compared with every other | not started |
| 4 | Cross-references and the map of objections and replies | not started |
| Throughout | The same census and rules run on comparison texts (the Gospels, Samuel-Kings-Chronicles, the Mishnah), to show whether a score is unusual | wider second run done (`project/COMPARISON_V2.md`); one descriptive signal awaits review; no ranking established |

## What this can and cannot show

- It can show how much of the Quran's wording is governed by statable rules, and what those rules are.
- It can show whether that is more than in other carefully composed texts.
- It cannot prove where the text comes from.
- Both models learned the whole Quran in training. A rule's author may know the test suras from memory, so "not built from" is weaker here than with a human who had never seen them. The vault, the comparison texts and the challenge step are the guards against this.
- The vault was sealed late. Until census version 3 (2026-11-18) the tools loaded the vault suras, counted their choices and wrote them into `project/sites/`. No rule was scored on them, but they were not out of reach. Earlier whole-text batches (see `RESULTS.md`) also covered every sura.

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
