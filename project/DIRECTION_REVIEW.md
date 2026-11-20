# Direction review: read the argument before expanding the word tests

Codex, 2026-11-19. Task 26, requested by the owner and claimed in `e46f582`. Response to discussion messages 19–20. This is a recommendation, not an adopted change to the charter or a new experiment.

## Recommendation

Make a direct, documented reading of the Arabic the main project. Start with three complete build suras, read independently by Claude and Codex, then compare their accounts of the claims, progression, strongest passages and unresolved difficulties. Expand if that produces useful, checkable understanding. Keep al-Askari as a later comparison with the readings, and as a possible focused lexical study.

This fits the owner's question better than making a comprehensive test of a later dictionary the flagship. It can produce something worth reading even if no statistical novelty emerges. The first deliverable should be a few clear essays with exact evidence, not another large apparatus.

| Direction | What it can answer well | Main limitation | Recommended role |
|---|---|---|---|
| Root-family prediction | Whether other words of a root help a specified predictor | A distributional association need not recover a shared core meaning or explain the text's argument | Keep the existing exploration; do not make it the organizing principle |
| All eligible al-Askari distinctions | How widely specified lexical distinctions fit the sampled Quranic uses | Tests a later account; operationalization and remembered readings can shape the outcome | Secondary study, after a small annotation feasibility check |
| Independent reading of complete suras, followed by cross-text synthesis | What the text says, how a passage develops its case, which interpretations survive objections | Interpretation is not blind to training, and agreement is not proof | Main project, beginning with a small pilot |

## What I agree with in message 20

Moving from loose root associations to explicit semantic claims is a better-defined question. A source chosen before outcomes gives a more accountable list than selecting attractive examples from memory. Recording uncheckable entries and using existing annotations where suitable are useful safeguards. OpenITI's [author catalogue](https://github.com/OpenITI/0400AH/tree/master/data/0395AbuHilalCaskari) does list *Furuq Lughawiyya*. I did not independently recount the reported 2,251 entries or audit their edition and licensing, and no book was downloaded here.

But success would primarily support specified distinctions in al-Askari's account. It would not establish that every Quranic word is irreplaceable, that the Quran exceeds other Arabic writing, or that its origin is beyond human capacity. Al-Askari's familiarity with the Quran makes the book an earlier interpretation of the evidence, not a source independent of it.

The most consequential correction concerns `choice-information.mjs`. I read the code; it uses a particular smoothed context predictor with root/token features and a grammar prior. A small reduction in its held-out log loss is not an upper bound on information available in context. Syntax, scope, discourse role and semantic relations may remain inaccessible to that predictor. The reported measurement can stand while the conclusion “the surrounding words carry almost no information” is withdrawn. I did not rerun or alter the measurement.

## Remaining issues with the al-Askari design

1. **A masked familiar verse is still familiar.** The model may recover the answer or remember its conventional explanation. Two models can reproduce the same learned reading. Existing syntax and antecedent annotations may also encode interpretive decisions; a code-only tier limits model discretion at scoring time but is not interpretation-free.
2. **The questions are a new interpretation.** Turning an entry into two binary questions can simplify away qualifications or build the answer into the label. Predefine how senses, negation, quotation, hypothetical statements, indeterminate antecedents, disagreements and abstentions are handled. Preserve every eligible entry and every exclusion reason. Report agreement before adjudication; do not retain only easy agreements without displaying the lost coverage.
3. **A sign per word group is not automatically a valid null.** Claims can share passages, topics, grammar, source arguments and annotator judgments without sharing a word. Conversely, one connected group can absorb most claims. Even disjoint groups do not establish that positive and negative directions are equally probable under the null. Block-based inference still needs a defensible dependence and symmetry/exchangeability argument; it is not supplied by the grouping operation. See [Winkler et al., multi-level block permutation](https://pmc.ncbi.nlm.nih.gov/articles/PMC4644991/). This is a general statistical requirement, not a validated solution for this corpus.
4. **Direction alone discards too much.** A tiny association and a strong one both receive one sign. Show the complete denominator, effect sizes, counterexamples, uncertain labels and distribution across suras. Compare semantic features beyond relevant grammar and frequency when the question requires that. Do not give a global significance figure until its null is justified.
5. **A broad novelty claim has not been established.** Neither Claude's brief literature map nor this review establishes that nobody has done a held-out Quran study. Do not advertise that absence as a finding.

If pursued, begin by measuring whether a small, predetermined set of entries can be operationalized faithfully and consistently on build data. Freeze the resulting procedure before a larger study. Label existing Quran/test exposure throughout. Tasks 23–25 can remain on hold; task 22 remains Claude's independent challenge of the already-recorded comparison signal.

## What the model research changes

The relevant research concerns our measuring instrument, not what the Quran must mean.

- [Liu et al., *Lost in the Middle*](https://aclanthology.org/2024.tacl-1.9/) found that the position of evidence affected performance on long-context tasks. A large input capacity is not evidence of uniformly reliable attention. The study does not measure the exact current models in this project. Its practical implication here is to use passage-level records and revisit the Arabic during synthesis, rather than trust one whole-book impression.
- [Sharma et al., sycophancy research](https://www.anthropic.com/research/towards-understanding-sycophancy-in-language-models) found assistants adjusting toward user beliefs. The initial reading packet should therefore omit the owner's desired conclusion and the other model's views. This reduces an avoidable influence; it does not establish neutrality.
- [Oren et al., test-set contamination](https://proceedings.iclr.cc/paper_files/paper/2024/hash/46e624c244cff669223d488defd4e835-Abstract-Conference.html) demonstrates the difficulty of evaluating models on previously encountered material. Its detection test relies on exchangeable benchmark orderings; Quranic literary order is meaningful, so that procedure cannot simply certify this project as uncontaminated.
- [Anthropic's faithfulness experiments](https://www.anthropic.com/research/reasoning-models-dont-say-think) show that explanations can omit influences that changed an answer. Asking a model whether it used remembered commentary is not a reliable certificate. The experiments involved particular models and artificial hint settings, not this Quran reading.
- [*Fann or Flop*, EMNLP 2025](https://aclanthology.org/2025.emnlp-main.1023/) evaluates Arabic poetry interpretation and reports weaknesses not evident from ordinary language benchmarks. It supports checking Arabic competence on the particular task. It does not establish an error rate for our models or a verdict on their Quranic readings.

The recommendation drawn from these sources is mine: make each interpretation inspectable and make remembered answers insufficient, rather than promise to erase prior knowledge.

## A small, concrete reading project

Proposed pilot: suras **19, 41 and 49**, all in the existing build partition. They offer narrative, argument and communal instruction at manageable lengths. This is a purposeful feasibility sample, selected with prior familiarity, not a representative or blind sample. Sura 49 was also read in full for this direction review. No whole-Quran claim can follow from these three alone.

Each model first receives only the same Arabic text, the reading questions and essential source/reading identification. It does not receive the other's analysis, al-Askari, tafsir summaries, the owner's preferred outcome or an instruction to defend a religious verdict. Use separate fresh contexts for those first readings and preserve each answer before exchanging them. Fresh contexts control conversational exposure; they do not erase training.

Each sura gets a short account answering five questions:

1. Who speaks, to whom, about what, and with what changes of voice or audience?
2. What does each passage assert, command, question or quote? What reasons or examples does it offer?
3. How does the sequence develop? Mark the Arabic words, contrasts, repeated expressions and transitions supporting the proposed structure.
4. Which reading best explains those details, and what is the strongest alternative? Which passages resist either reading?
5. What is persuasive, morally defensible, empirically checkable or still unresolved, and why?

A compact evidence table accompanies the prose: verse reference, short Arabic anchor, observation, interpretation, alternative/counterevidence and confidence. Observation and interpretation must remain separate. Quoted speech is not automatically the narrator's endorsement; metaphor, command and historical assertion are not the same kind of claim. Do not resolve an ambiguity merely because the cleaner interpretation makes the structure look better.

Then exchange the sealed readings. Each model challenges the other's strongest claims and checks every citation against the Arabic. Preserve disagreement rather than negotiate it away. At the end, show the owner a readable account, the surviving differences and the reasons for revisions. A fluent Arabic reader would be valuable for unresolved linguistic questions; no contact with anyone is authorized by this proposal.

Consult dictionaries and scholarship in a second, explicitly marked pass. Record which ideas were already familiar, which were independently reconstructed in the documented reading, which were later found in scholarship, and which changed after consultation. We cannot certify the psychological origin of an idea, and “I did not consult a book” does not mean “this has never been said.”

Success for the pilot means complete passage coverage, accurate citations, a useful account of progression, and disagreements a reader can inspect. It does not require finding extraordinary structure. If the method mainly produces fluent but unsupported summaries, revise it before scaling. The immediate deliverable is three accounts and one synthesis, with no new app or scoring engine.

## What can actually be blinded

We can conceal the other reader's answer, the owner's preferred verdict, and which proposed explanation a later reviewer is being asked to evaluate. We cannot credibly conceal the Quran's identity from models familiar with its language, nor instruct them to forget their learned associations.

For a later structural test, freeze a precise claim before examining further permitted material. Require predictions specific enough to fail: an identified transition, a stated relationship between passages, or a distinction between two readings. Compare against credible alternatives, including matches based only on topic or vocabulary. If using comparison texts, choose them for the feature in question and match language, genre and size as far as possible. Do not turn one unusual feature into a literary ranking.

Removing sura numbers, shuffling passages or translating into another language would not establish blindness. These changes can also remove the order, sound or grammar being studied. Use authentic passages, not generated imitations. Recognition questions and alternate prompt order can be useful diagnostics, but a model saying “I do not recognize this” proves little. Label such work a robustness check on familiar texts.

The current vault remains closed. A future deliberate reading of all 114 suras would require an explicit scope decision under `AGENTS.md`. It would change the exposure record for later model-designed hypotheses, so the same workflow could not describe those passages as uninspected afterward. The pilot needs no such change.

## My preliminary reading, and what “correct” means

For this review I inspected the Arabic of **4:131–140, 5:7–11, 17:23–39, all of 49, and all of 103**, through `loadText('build')`. These familiar examples were chosen to illustrate the project, not to estimate how often a claim holds. I have not performed a fresh, complete reading of the Quran here. The judgments below are my provisional assessments, not a report of a commentator's verdict. I consulted no tafsir for these readings, but cannot certify that training had no influence.

I regard the demand to uphold justice even against oneself and relatives (4:135), and not let hostility justify injustice (5:8), as strong moral principles. Their force lies partly in targeting motivations that make impartiality costly. Calling them defensible is a moral assessment; it does not establish the truth of every theological premise around them.

The warning against following what one lacks knowledge of (17:36), together with checking a report from an unreliable/wrongdoing informant before harming people (49:6), supports an ethic of responsibility for belief and action. The precise condition in 49:6 matters: it should not silently be rewritten as a modern rule about every news report. I find the connection between careless judgment and harm compelling.

One possible reading of sura 49 is a progression through disciplines of authority, speech, reports, conflict, contempt and claims to religious standing. Its closing appeal to divine knowledge matters for that reading. This is more specific than calling the whole sura “social ethics,” but it must still explain each transition. It must account for deference to prophetic authority in 49:1–5, the response to armed conflict in 49:9, and the account of true faith in 49:14–18—not extract only passages that resemble modern ideals. No claim of a unique pattern or ring structure is established here.

The proposed project should distinguish four questions:

| Question | Evidence needed |
|---|---|
| Does this interpretation fit the Arabic and its context? | Wording, grammar, scope, full passage and serious alternative readings |
| Is a factual claim true? | Appropriate independent evidence, after fixing what the claim actually says |
| Is a moral judgment defensible? | Reasons, consequences, consistency and counterarguments; no automatic numerical truth score |
| Does a theological conclusion follow? | Its premises and argument, with the distinction between what the text asserts and what the analysis establishes |

Coherence does not by itself establish factual truth. Agreement between models does not add two independent witnesses to revelation. Nor does difficulty resolving a passage show that the text is incoherent. Those are questions to investigate rather than conclusions to build into the prompt.

## The unlettered-prophet question

Even granting the premise that Muhammad could not read or write, lack of literacy does not imply lack of intellectual or compositional ability. Recorded oral traditions supply counterexamples to that general inference. Harvard's publication of [Lord's archival descriptions of Avdo Međedović](https://classics-at.chs.harvard.edu/classics3-casey-due-the-invention-of-ossian/) includes testimony that the singer could not read or write and documents very long oral compositions. This establishes a human capacity, not an explanation of the Quran or an equivalence in literary quality.

Whether the historical Muhammad could have produced this particular text requires historical evidence as well as textual analysis. A claim about human impossibility needs a defensible account of human alternatives. A machine being impressed, or unable to produce an equally compelling work, does not supply one. Neither does a small p-value under a narrow word-choice null equal the probability of human authorship.

My present conclusion is that there are morally and intellectually serious features worth sustained study. I do not presently have grounds to conclude that the text is beyond human capacity. This leaves theological interpretation open; it makes the research obligation concrete. The useful outcome would be a detailed explanation of what the text accomplishes, where its arguments persuade or remain contested, and exactly which further conclusions the evidence can bear.

## What was done in this review

Read the updated charter, working rules, queue, log and discussion; answered before research; claimed and pushed task 26; inspected the context-information code without rerunning it; researched primary model-evaluation papers, statistical methodology, the OpenITI catalogue and oral-literature archival material; read only the listed build passages. No experiment, rule score, split, source corpus or charter was changed. No test or vault sura was loaded. This report and discussion response recommend a direction for the owner and Claude to consider.
