# Census version 2 audit

Codex, 2026-11-18. Task 3, claimed and pushed before this audit. Audited the source at commit `8a30a70`; no existing scores, rule files or census code were changed.

**Verdict: the original phrase-selection flaw is fixed, but version 2 does not enforce build-only definitions or protect the vault throughout the pipeline.** The findings below are demonstrated on artificial inputs, not measurements of their effect on the existing Quran scores. The comparison experiment is unaffected by these paths: it supplies no synonyms or roots, removes reserve sections before calling the problem builder, and uses its own restricted context.

## Confirmed findings

| Priority | Finding | Source | Consequence |
|---|---|---|---|
| First | Synonym token selection scans all suras and can select by whole-text occurrence count | `project/tools/problems.mjs:88–92`; `project/synonyms.json` | Test or vault occurrences can change which tokens constitute an option, or make the option disappear entirely. |
| First | Loading and context access are not restricted by the split | `project/tools/lib.mjs:19–30,41–47,64–92`; `src/words.mjs` | Even a build run loads the whole text; a rule can ask `ctx.verse(s,v)` for a test or vault sura. Filtering scored occurrences later does not undo this. |
| Next | Root lookup takes the first matching token from the whole input | `project/tools/problems.mjs:40,74`; `project/tools/lib.mjs:24–28,90` | Held-out annotations can affect an option's roots or the dictionary exposed to a rule. This matters when the same token has different or missing annotations. |
| Next | Only the rule file's hash is checked against a prior test | `project/tools/evaluate.mjs:27–40` | Changed scorer, census, synonym registry or dependencies are not covered by that hash. The tool also does not itself verify the required pre-test commit and push. |

The first finding is present in the actual configuration: `send-down`, `heart`, `human` and `do` contain exact-count selectors. Those selectors use whole-input counts, not counts restricted by the defining set. The other synonym sets also collect their token vocabulary from the full input. Their fixed labels are sourced to the earlier whole-text batch 15; that prior exposure needs to stay visible even after a code fix.

The root finding is a demonstrated possibility, not evidence that a particular real token was mapped incorrectly. I did not inspect test or vault morphology to estimate its effect.

The context finding is an access defect, not evidence that the current rules deliberately requested vault verses. R001 uses its current-sura window. R002 reads the supplied build occurrences and current-verse context. Both nevertheless run inside a loader and problem-definition pipeline that already processes the whole corpus. `census.mjs` also explicitly counts and exports vault occurrences and runs its near-identical-verse census over the whole text. I did not run it.

## What version 2 gets right

Phrase eligibility and option labels use only the defining suras. A frame seen with one build word and a different test word no longer becomes a two-option problem. Ending thresholds and the two-order requirement also filter to the defining set. The baseline uses the supplied defining occurrences, excluding OTHER, and a held-out word outside the options becomes OTHER. The scoring loop excludes it, producing conditional rather than all-eligible-sites accuracy.

The current target slots are hidden consistently through `verse`, `window` and `sura`. Build folds use separate defining and scoring suras. These are real improvements; they do not fix the unrestricted loader, synonym vocabulary or cross-sura access.

## The phrase definition

The implementation checks token equality in three positions on either side, allows boundary padding, and requires at least three real surrounding tokens. It does not compare context morphology, syntax or meaning. A fixture with singular context in one occurrence and plural context in another still merges them when their dictionary tokens match. An inserted word or a changed verse boundary can prevent a match. This is a census of repeated token frames, not a guarantee of interchangeable expressions.

I did not open the unfiltered `project/sites/frame.json`: the exporter includes vault occurrences. These conclusions come from the actual construction code and executable fixtures. A concrete build-only example review needs a safe export; it is included in the repair task. This preserves the boundary instead of treating an existing mixed export as permission to inspect it.

## Batch 4: shared dependence, different statistical question

Reviewed `scripts/07_batch4_twins.mjs`, `src/twins.mjs`, `src/phrase.mjs`, its preregistration, and the aggregate batch-4 discussion in `RESULTS.md`. I did not execute the old batch or read its per-site/per-frame results.

Both the near-twin selection and amended phrase census use the whole text. In particular, a phrase is included only if at least two observed middle roots differ across at least two suras. Importing those frames or choices as an already fixed inventory for a new predictive split would recreate the leakage problem: the later test answers helped define the tasks. The batch also builds context counts and the secondary association matrix from the whole text. It cannot serve as a clean held-out prediction result under the new project.

However, **the specific version-1 majority-baseline failure does not automatically invalidate batch 4's permutation p-values**. Batch 4 has no training-majority predictor. Its amended analysis permutes the observed middle roots within each selected frame, preserving their multiset. For a fixed frame this preserves the variation criterion that selected it. A fixture verifies this distinction. This is a conditional association question, not a test of accuracy beyond a learned baseline.

That does not certify the older inference. Frames can overlap and share contexts, repeated passages can cross suras, and contextual counts are held fixed while labels are shuffled. The exchangeability and dependence assumptions need their own check. The registered primary was already null; the local-context finding is explicitly an amended whole-text analysis. Preserve its numbers and qualify its interpretation rather than declaring them numerically disproved by the new census bug.

## Clarification of the R002 shuffle result

`scoreRows` shuffles choices **within each problem**, among answered occurrences, preserving that problem's choice frequencies. A constant majority guess therefore cannot by itself produce the reported small shuffle p-value; an artificial constant-prediction check gives p = 1. This resolves the conditional point in discussion message 3.

Under that shuffle's assumptions, R002's small p-value is evidence that its varying predictions align with choices beyond a constant within-problem guess. It does not establish semantic causation or enough accuracy gain to meet the separate baseline test. The pGain = 0.059 result still misses the declared 0.01 bar. Dependence and the leakage paths above still limit both interpretations. No pass mark was changed.

## Reproduction and next work

Run only the artificial audit:

```bash
node project/challenges/census-v2-audit.test.mjs
```

All eight checks pass: they confirm the repaired frame behavior and reproduce the remaining defects, plus the masking, morphology and permutation distinctions. The loader/context check substitutes invented morphology, chronology and split data at the file-read boundary and rejects real corpus/site access. No real Quran corpus or vault text is loaded. Assertions describing defects must be replaced with prevention checks when the implementation is repaired.

Before further rule tests, require explicit allowed partitions at load and context boundaries; derive dictionaries and option mappings from defining data or a declared fixed registry; replace whole-text count selectors with explicit, documented morphological identities; and freeze all relevant inputs and code. Preserve the original split and old ledger entries. A change affecting problem definitions requires a new census version under AGENTS.md, with any later rescoring explicitly recorded. Export build-only frame examples after those guards exist. The historical whole-text exposure cannot be removed by calling the vault newly clean.
