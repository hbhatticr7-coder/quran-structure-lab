# Pre-registration, batch 16: the retold stories

Written 2026-11-16, after batch 15. Before writing, the names and marker words below were looked up in the corpus to confirm their spelling and total counts. No telling had been located and nothing had been counted by sura. Committed to the public repository before the batch's code was written.

## Question

The same prophets' stories are told in many suras, and no two tellings are the same. Which parts of the story does each sura tell, and are the details particular to a telling tied to the sura it sits in?

## Finding the tellings

- A **mention** is a verse containing the prophet's name. For Moses the names are Moses, Pharaoh and Aaron.
- Mentions in the same sura that are no more than ten verses apart are grouped. A group runs from its first mention to three verses after its last.
- A sura's **telling** is all its groups together. Tellings with fewer than 30 content words are listed as passing mentions and not analysed.
- The **host** is the rest of that sura.

## Part 1. The map of Moses episodes (description)

Eighteen episodes, each recognised by marker words inside a Moses telling. An episode is marked present if any of its markers occurs.

| Episode | Markers |
|---|---|
| Infancy | nursing (r-d-'), the chest (*tabut*), picked up (l-q-t) |
| Killing and flight to Madyan | struck (w-k-z), Madyan |
| The fire and the call | Tuwa, firebrand (q-b-s, j-dh-w), sandals (n-'-l) |
| Signs of the staff and hand | white (b-y-d), serpent (th-'-b), bosom (j-y-b) |
| Aaron as helper | *wazir*, strengthen ('-z-r), support (r-d-'), more eloquent (f-s-h) |
| The magicians' contest | ropes (h-b-l), swallow (l-q-f), crucify (s-l-b) |
| The plagues | flood (*tufan*), locusts, lice, frogs |
| The sea and the drowning | drown (gh-r-q), split (f-l-q), dry (y-b-s) |
| Haman and the tower | Haman, tower (s-r-h) |
| The believer in Pharaoh's house | conceal (k-t-m) |
| Provisions in the wilderness | quails (s-l-w), cloud (gh-m-m) |
| Sinai and the tablets | tablets (l-w-h), appointed time (*miqat*), manifest (j-l-w) |
| The golden calf | calf (*'ijl*), the Samiri, lowing (kh-w-r) |
| The cow | cow (b-q-r) |
| Forty years of wandering | wander (t-y-h) |
| Qarun | Qarun |
| The journey with the servant of God | fish (h-w-t), ship (*safina*), wall (j-d-r) |
| Pharaoh's body preserved | body (b-d-n) |

The result is a table of suras against episodes. Markers can miss an episode told in other words and can fire on an unrelated use of the word; the table is an automatic first pass for a reader to correct.

## Part 2. Test R1 (primary): are a telling's particular details tied to its sura?

- For each Moses telling, its **particular roots** are the roots that occur in that telling and in no other Moses telling.
- The **echo** of telling i in host j is the share of telling i's particular roots that also occur in host j.
- Statistic: the sum, over tellings, of each telling's echo in its own host. Null: the hosts are reassigned among the tellings at random (100,000 draws, seed 20261210). This keeps every telling and every host in play in each draw, so a telling with many rare words or a host with a large vocabulary affects the null and the observed value equally. One-sided, threshold p < 0.05.

Secondary:
- Verse-final words removed from tellings and hosts, since rhyme alone ties a telling's vocabulary to its sura.
- Hosts reassigned only among suras of the same period (Meccan or Medinan).
- The same test for Noah, Abraham, Lot, 'Ad, Thamud, Shu'ayb, and Adam with Iblis, where at least four suras have a telling; and pooled across all prophets.
- For each Moses telling, the particular roots that are echoed in its host are listed, rarest first.

## Prediction, recorded before running

R1 will pass clearly, and will weaken but survive without verse-final words. I expect this because batch 4 already found that word choices follow their surroundings.

## How results will be read

- R1 passes: what is particular to each telling is shared with the rest of its sura. Each telling is cut to its sura, not copied from a stock version.
- R1 fails: no such tie is visible in shared roots.

Either way, batch 5 showed that the Gospels and Kings also fit their wording to context, so a pass would not show that this is unusual. The value of this batch is the map.

## Limits stated in advance

- Tellings are found by names. A passage that tells part of a story without naming the prophet within ten verses is cut short (the journey in sura 18 is the clearest case).
- A group's three-verse tail can run into the next story where stories follow one another closely.
- The host includes other prophets' stories in the same sura. Suras that tell several stories with one refrain will show a strong echo for that reason.
- Suras of the same period share vocabulary; one secondary check addresses this.
