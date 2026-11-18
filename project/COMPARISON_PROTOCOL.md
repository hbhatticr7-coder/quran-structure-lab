# Comparison protocol, fixed before test scores

Codex, 2026-11-18. This is queue task 1. No Quran corpus is loaded or scored by this work. Existing Quran results are quoted from the census, scoreboard and rule ledgers. The Quran split and rule files stay unchanged.

## Texts and units

- Matthew, Mark and Luke: the existing `src/greek.mjs` loader, content-word lemmas from [MorphGNT/SBLGNT](https://github.com/morphgnt/sblgnt). A unit is a chapter within its book; a context item is a verse.
- Samuel, Kings and Chronicles: all six books, the existing `loadOshbBooks` loader in `src/hebrew.mjs`, content-word lemma identifiers from [Open Scriptures Hebrew Bible](https://github.com/openscriptures/morphhb). Units are chapters within books, with verse contexts.
- Mishnah: the 63 Hebrew tractates fetched by `scripts/20_fetch_mishnah.mjs` from [Sefaria](https://developers.sefaria.org/reference/get-v3-texts). Use batch 13's tokenizer: remove HTML, Hebrew points and one-letter forms, and split at maqaf and non-Hebrew letters. A unit is a tractate; context items are its individual mishnayot in chapter order. Check that each response contains nested chapter arrays, not just its first chapter.

These are the loaders specified by the queue, not equivalent linguistic annotations. The Quran includes function words and has roots as well as lemmas. Greek and Biblical Hebrew here omit function words and use lemmas without root families; the Mishnah uses forms without lemmatization. The same phrase algorithm therefore operates on different token representations. An accuracy ranking is not a ranking of literary care or uniqueness.

Source files remain in ignored `data/external/`. Only source hashes, section names and lengths, code, and aggregate results are committed. No comparison text, phrase, or occurrence-level quotation is redistributed.

## Partition and definitions

Before building problems, sort units by retained token count, longest first, with canonical unit number breaking ties. Use the Quran split's algorithm and seed 20261117: shuffle each length-ranked group of four, assign two to build, one to test and one to reserve. Any incomplete final group goes to build. Save the assignments and SHA-256 source hashes in `project/comparison/split.json` once; refuse to regenerate it. This is a separate comparison split, never a replacement for `project/split.json`.

Reserve sections are tokenized and counted for this initial length allocation, then excluded from problem construction, context and scores. Build scoring also excludes test sections. For build tuning, sort build units by length and alternate into two halves; define on one and score the other, both ways. The final test defines on all build units and scores only test units.

Use `makeProblems` from census version 2 with an empty synonym list, retaining only phrase frames. This uses three tokens on each side of one hidden token, boundary markers and at least three real context tokens. A frame needs at least two options in the defining units. Its options and the majority baseline come from those units only. No test-only frame or option may enter the definition. Roots are null in these adapters, so the shared builder's whole-input root lookup carries no lexical information here.

## Predictions and scores

1. **R001, unchanged:** count matching option tokens in the current unit's ten context items on either side, including the current item, with its answer hidden. Abstain on zero evidence or a top tie. Without roots this is lemma/form echo.
2. **R002, unchanged:** report no applicable problems. It accepts synonym problems only; this project has no preregistered comparison-language synonym sets.
3. **C002_frame, declared adaptation:** apply R002's unchanged prediction function to frames, with its original window 0, minimum feature count 2, smoothing 0.5 and minimum six build occurrences. This is a distinct comparison experiment, not a new score or status for R002. Do not tune it on comparison test results. There is no existing Quran test score for this adaptation.

All context methods hide the target slots. Cross-unit reads may reach only defining units and the current target unit. No rule receives the target answer or the other test units through the context API.

Primary scores reproduce `scoreRows` on known-option sites: eligible choices, answers, accuracy, baseline on those same answered sites, gain and the original occurrence-level sign-flip p-value. Majority ties retain the existing expected uniform-guess score across all options. Also report the baseline on all scored sites, the number of unseen options, accuracy including unseen options as misses, and performance with the baseline filling rule abstentions. An unseen option earns zero even when the baseline is tied. No-answer accuracy is null, never zero.

As a declared sensitivity check, aggregate paired gains by chapter/tractate and flip one sign per unit. Enumerate all signs for up to 16 nonzero units; otherwise use 20,000 draws and seed 17. This assumes independent, symmetric unit-level differences under the null. It does not remove dependence between parallel accounts across chapters or tractates. Report it beside the old occurrence-level test without changing the Quran pass policy. No comparison result changes a Quran ledger.

The fixed three comparisons are descriptive controls. No global claim will be made by selecting whichever corpus or p-value looks most favorable. A positive result would describe this operational definition and split; a failure would not establish arbitrary wording.

## Execution and checks

Run `node --test project/tools/comparison.test.mjs` on artificial, non-scriptural fixtures. Check target masking, denied cross-unit access, split partitioning, test-only variation, unseen options, and grouped inference. Then:

```bash
node project/tools/comparison.mjs --prepare
node project/tools/comparison.mjs --build
# Commit and push code, protocol, split and build results before continuing.
node project/tools/comparison.mjs --test
```

The test command requires its code, protocol, split and direct code dependencies to match a commit reachable from `origin/main`. It checks source hashes and refuses to overwrite an existing test result. Record that commit and all dependency hashes in `project/comparison/test.json`. Reproducing the test is a separate, explicitly labeled exercise, not another opportunity to choose a result. Write `project/COMPARISON.md` from this result and the existing Quran summaries.

Earlier whole-text batches already examined these comparison works. This is a newly fixed split and predictive procedure, not a claim that the texts were previously unknown to either model.
