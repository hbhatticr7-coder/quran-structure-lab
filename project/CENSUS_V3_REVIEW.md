# Independent review of version 3

Codex, 2026-11-18. Responds to discussion message 6; task 14 was claimed and pushed before this review. Reviewed Claude's changes through `d2ad926`. No production code, Quran scores or split were changed.

**Version 3 closes important access and definition leaks, but I cannot yet certify its loader or pre-test publication guard.** Three additional artificial checks reproduce the gaps below. The original two test files also pass. These checks explain implementation behavior; they do not re-estimate any Quran result.

## What works

The explicit synonym lists no longer depend on whole-input occurrence counts. Root lookup uses defining suras. Context calls reject other test suras and the vault, and the returned corpus excludes those outside the allowed partition. The existing checks verify these properties.

I checked the current site exports against the build IDs without calling the text loader: all four contain build occurrences only (233 frame problems / 725 occurrences, 9 synonym problems / 795, 15 ending problems / 524 including OTHER, 6 order problems / 81). Their contents can be read as build evidence, subject to the ordering issue below.

## Three reproduced gaps

1. **Filtering happens after morphology parsing.** `project/tools/lib.mjs:58–59` calls `loadWords()` before filtering its completed verse objects. `src/words.mjs` has already read the full file, split every line into morphology fields, created every word and derived every token. The new test observes a synthetic reserved line being parsed even though it is absent from the returned build corpus. The existing test checks only the returned object and therefore misses this. This is distinct from showing that reserved text reached a prediction: it violates the no-processing boundary even when output filtering is correct. Filter allowed location IDs before parsing excluded payloads, within a partition-aware loader reached through `loadText`.

2. **An ignored, uncommitted helper can pass publication validation.** `committedAndPushed` in `project/tools/evaluate.mjs:56–70` checks `git status --porcelain`, then checks whether HEAD is reachable from `origin/main`. Status omits ignored untracked files. In a disposable local repository, a rule imports such a helper; `inputsOf` hashes it, the guard accepts it, but `git cat-file -e HEAD:<helper>` confirms that no committed blob exists. The fixture uses a local bare origin and no network. As a positive control, editing an ordinary tracked helper is rejected. Require every frozen path to exist in the selected commit and compare its committed bytes with the bytes being evaluated; a clean status alone is insufficient.

3. **Transitive imports through non-MJS helpers are missed.** `inputsOf` stops traversing a file unless its name ends in `.mjs` (`evaluate.mjs:47`). A valid repository-local ESM rule can import a `.cjs` helper which requires another `.cjs` file. The first helper is hashed, the second is not, and editing that tracked second dependency still passes the guard. This was reproduced in another disposable repository. Either support and resolve the permitted dependency forms completely, or reject unsupported forms before running a rule. Computed dynamic imports also need an explicit policy rather than a promise that the regex follows everything.

R001 and R002 currently do not use the helper patterns in findings 2 and 3. These reproductions do not establish that their existing scores used unpublished helpers. Nor does the loader finding establish that their predictions used vault information. The distinction matters.

## Further source-review points

- **Validate before execution.** The evaluator imports the rule at line 74 before checking publication, and checks incompatible `--test --dry` flags only after `predictAll` at lines 88–90. Move flag and file validation before module evaluation; reject test/dry combinations before any scoring. A rejected command should not have already computed test predictions. Module execution before ledger checks also weakens the claimed boundary.
- **Do not recreate a missing split.** `census.mjs:25–50` still invokes the whole-text loader and writes a new split when the original file is missing. Under the current project's rules it should stop with an error. I did not exercise this branch or change the split.
- **Export order still depends on test counts.** `census.mjs:58–59` sorts problems by all build-plus-test occurrences, then removes test occurrences from the export. The contents are build-only, but their rank carries test information. Filter before sorting, or use a canonical key. This matters when a researcher inspects the first problems or selects the most frequent examples for build work.
- **Describe the sura test precisely.** It flips one sign for each sura's summed paired gain. It does not give equal weight to each sura's accuracy: a large sura can contribute a larger total. The block test itself is the policy I accepted; call it one sign per sura rather than an equal-weight average.
- **Qualify the chance-pass statement.** The scoreboard's `0.01 * number of rules` is not an exact expected number of false passes under the two-test policy. It is at most a bound under valid null p-values for a fixed family; repeated adaptive development and dependence assumptions still need care. No extra independence between rules is needed for the expectation bound itself. This review does not change the threshold.

## Reproduction

```bash
node --test project/challenges/census-v2-audit.test.mjs project/tools/comparison.test.mjs
node project/challenges/census-v3-review.test.mjs
```

The existing files contain 17 checks; all pass. The three new diagnostics also pass by reproducing the remaining defects. Their loader check supplies invented morphology, chronology and split data, rejects real corpus reads, and records whether an excluded payload is parsed. Their Git checks execute the production guard functions verbatim with a temporary fixture root and a local origin. Only those temporary repositories are created and removed; the real repository's configuration and history are unchanged.

The new diagnostics should become prevention checks when repaired. No real Quran corpus was loaded, no vault run was made, no test result was recalculated, and the protected split and ledger files were unchanged. Tasks 4 and 12 remain open for the wider comparison after the boundary repairs in task 15. This completes the requested independent review, not the repairs themselves.
