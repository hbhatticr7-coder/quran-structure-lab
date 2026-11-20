# Inventory: the words for supposing in the build suras (task 29)

Made by `node project/tools/supposing-inventory.mjs`. Do not edit by hand. Build suras only; no test or vault sura is read. This file retrieves and counts. It interprets nothing and tests no rule.

## What is covered and what is not

The group was declared in discussion 25 before the places were looked at: three words for holding something to be so without knowing it. It is **not** every way the text speaks of supposing. Other expressions (for example a verb of seeing used for an opinion, particles such as "perhaps", a phrase such as "guessing at the unseen") are not retrieved. The root خرص ("to guess") has no word in the build suras.

## Rules of inclusion

Every word of the three roots in the build suras is a candidate. Each is included or set aside by its dictionary form and part of speech, exactly as the morphology file gives them. A form the table does not name stops the tool.

| Root | Dictionary form | Part of speech | Decision | Sense, or reason for setting aside | Words |
|---|---|---|---|---|---|
| ظنن | ظَنَّ | verb | included (zanna) | to suppose (verb) | 27 |
| ظنن | ظَنّ | noun | included (zanna) | supposition (noun) | 10 |
| ظنن | ظانّ | noun | included (zanna) | one who supposes (participle) | 1 |
| حسب | حَسِبَ | verb | included (hasiba) | to suppose, to take something to be so (verb, first form) | 21 |
| حسب | يَحْتَسِبُ | verb | set aside, nearest neighbour | nearest neighbour, kept apart: eighth form, "to reckon on, to expect" (from where they had not expected). An attitude toward what will happen, but not the declared verb. | 2 |
| حسب | حِساب | noun | set aside | reckoning, account | 12 |
| حسب | حَسْب | noun | set aside | "enough for" (God is enough for us) | 6 |
| حسب | حَسِيب | noun | set aside | one who reckons, who takes account | 4 |
| حسب | حاسِب | noun | set aside | one who reckons (participle) | 1 |
| حسب | حاسَبْ | verb | set aside | third form, "to call to account" | 1 |
| حسب | حُسْبان | noun | set aside | here a calamity sent from the sky; elsewhere "calculation" | 1 |
| زعم | زَعَمَ | verb | included (za'ama) | to claim, to assert (verb) | 7 |
| زعم | زَعِيم | noun | set aside | guarantor, one who vouches | 1 |

Candidates: 94 words. Included: 66. Set aside: 28.

## From words to places

The unit is the place: one act of supposing in its context. A noun of supposing that stands in the same verse as a verb or participle of the same root, with at most 3 words between them, is counted with that verb as one place ("they supposed about God ... the supposing of the age of ignorance"). Nothing else is merged. Two places in one verse are both kept and each names the other, because they are not independent passages.

**66 words make 61 places, in 56 verses of 23 suras.**

## Counts

These are counts of grammatical form taken from the morphology. They are not readings. "Question" means the question particle is on the word or the word follows *am*. "After lā" means the word before it is *lā*, tagged by the morphology file as negative or as prohibiting. "After negative mā" means the word before it is *mā* with the negative tag of the morphology file. A mark is set only by the word immediately before or after; a question or a denial that starts further back is not caught. Whether a clause is in fact a question, a prohibition or a denial is for the reading step.

| | ẓanna | ḥasiba | zaʿama |
|---|---|---|---|
| Places | 33 | 21 | 7 |
| Verb / noun / participle | 27 / 5 / 1 | 21 / 0 / 0 | 7 / 0 / 0 |
| Verbs in the first person (I, we) | 8 of 27 | 0 of 21 | 0 of 7 |
| Verbs in the second person (you) | 8 of 27 | 10 of 21 | 6 of 7 |
| Verbs in the third person | 11 of 27 | 11 of 21 | 1 of 7 |
| Verbs: past / present | 16 / 11 | 6 / 15 | 6 / 1 |
| Question | 0 of 33 | 10 of 21 | 0 of 7 |
| After lā | 0 of 33 | 5 of 21 | 0 of 7 |
| After negative mā | 4 of 33 | 0 of 21 | 0 of 7 |
| None of these three marks | 29 of 33 | 6 of 21 | 7 of 7 |
| Meccan / Medinan suras | 21 / 12 | 9 / 12 | 5 / 2 |
| Half A / half B of the build suras | 9 / 24 | 5 / 16 | 4 / 3 |

## The places

The word is in square brackets. "Subject" is the person, gender and number as the morphology gives it (3MP: third person, masculine, plural). "Marks" are the surface marks described above. The whole verse for each place is in `supposing-build.json`.

### ẓanna (ظَنَّ): 33 places

| Place | Kind | Subject | In context | Marks | Also in this verse |
|---|---|---|---|---|---|
| 3:154:16 | verb, present | 3MP | قَدْ أَهَمَّتْهُمْ أَنفُسُهُمْ **[يَظُنُّونَ]** بِٱللَّهِ غَيْرَ ٱلْحَقِّ ظَنَّ ٱلْجَٰهِلِيَّةِ (with the noun ظَنَّ) |  |  |
| 4:157:31 | noun |  | عِلْمٍ إِلَّا ٱتِّبَاعَ **[ٱلظَّنِّ]** وَمَا قَتَلُوهُ يَقِينًۢا |  |  |
| 9:118:15 | verb, past | 3MP | وَضَاقَتْ عَلَيْهِمْ أَنفُسُهُمْ **[وَظَنُّوٓا۟]** أَن لَّا مَلْجَأَ مِنَ ٱللَّهِ | next word is "that" (an, anna) |  |
| 17:52:5 | verb, present | 2MP | يَدْعُوكُمْ فَتَسْتَجِيبُونَ بِحَمْدِهِۦ **[وَتَظُنُّونَ]** إِن لَّبِثْتُمْ إِلَّا قَلِيلًا |  |  |
| 17:101:16 | verb, present | 1S | لَهُۥ فِرْعَوْنُ إِنِّى **[لَأَظُنُّكَ]** يَٰمُوسَىٰ مَسْحُورًا |  |  |
| 17:102:13 | verb, present | 1S | وَٱلْأَرْضِ بَصَآئِرَ وَإِنِّى **[لَأَظُنُّكَ]** يَٰفِرْعَوْنُ مَثْبُورًا |  |  |
| 18:35:8 | verb, present | 1S | لِّنَفْسِهِۦ قَالَ مَآ **[أَظُنُّ]** أَن تَبِيدَ هَٰذِهِۦٓ أَبَدًا | after negative mā; next word is "that" (an, anna) |  |
| 18:36:2 | verb, present | 1S | وَمَآ **[أَظُنُّ]** ٱلسَّاعَةَ قَآئِمَةً وَلَئِن رُّدِدتُّ إِلَىٰ | after negative mā |  |
| 18:53:4 | verb, past | 3MP | وَرَءَا ٱلْمُجْرِمُونَ ٱلنَّارَ **[فَظَنُّوٓا۟]** أَنَّهُم مُّوَاقِعُوهَا وَلَمْ يَجِدُوا۟ عَنْهَا | next word is "that" (an, anna) |  |
| 21:87:6 | verb, past | 3MS | إِذ ذَّهَبَ مُغَٰضِبًا **[فَظَنَّ]** أَن لَّن نَّقْدِرَ عَلَيْهِ فَنَادَىٰ | next word is "that" (an, anna) |  |
| 22:15:3 | verb, present | 3MS | مَن كَانَ **[يَظُنُّ]** أَن لَّن يَنصُرَهُ ٱللَّهُ فِى | next word is "that" (an, anna) |  |
| 26:186:7 | verb, present | 1P | بَشَرٌ مِّثْلُنَا وَإِن **[نَّظُنُّكَ]** لَمِنَ ٱلْكَٰذِبِينَ |  |  |
| 33:10:14 | verb, present | 2MP | وَبَلَغَتِ ٱلْقُلُوبُ ٱلْحَنَاجِرَ **[وَتَظُنُّونَ]** بِٱللَّهِ ٱلظُّنُونَا۠ (with the noun ٱلظُّنُونَا۠) |  |  |
| 34:20:5 | noun |  | صَدَّقَ عَلَيْهِمْ إِبْلِيسُ **[ظَنَّهُۥ]** فَٱتَّبَعُوهُ إِلَّا فَرِيقًا مِّنَ ٱلْمُؤْمِنِينَ |  |  |
| 37:87:2 | noun |  | فَمَا **[ظَنُّكُم]** بِرَبِّ ٱلْعَٰلَمِينَ | after mā "what?" |  |
| 41:22:13 | verb, past | 2MP | وَلَا جُلُودُكُمْ وَلَٰكِن **[ظَنَنتُمْ]** أَنَّ ٱللَّهَ لَا يَعْلَمُ كَثِيرًا | next word is "that" (an, anna) |  |
| 41:23:4 | verb, past | 2MP | وَذَٰلِكُمْ ظَنُّكُمُ ٱلَّذِى **[ظَنَنتُم]** بِرَبِّكُمْ أَرْدَىٰكُمْ فَأَصْبَحْتُم مِّنَ ٱلْخَٰسِرِينَ (with the noun ظَنُّكُمُ) |  |  |
| 41:48:8 | verb, past | 3MP | يَدْعُونَ مِن قَبْلُ **[وَظَنُّوا۟]** مَا لَهُم مِّن مَّحِيصٍ |  |  |
| 41:50:13 | verb, present | 1S | هَٰذَا لِى وَمَآ **[أَظُنُّ]** ٱلسَّاعَةَ قَآئِمَةً وَلَئِن رُّجِعْتُ إِلَىٰ | after negative mā |  |
| 48:6:6 | participle |  | وَٱلْمُنَٰفِقَٰتِ وَٱلْمُشْرِكِينَ وَٱلْمُشْرِكَٰتِ **[ٱلظَّآنِّينَ]** بِٱللَّهِ ظَنَّ ٱلسَّوْءِ عَلَيْهِمْ دَآئِرَةُ (with the noun ظَنَّ) |  |  |
| 48:12:2 | verb, past | 2MP | بَلْ **[ظَنَنتُمْ]** أَن لَّن يَنقَلِبَ ٱلرَّسُولُ وَٱلْمُؤْمِنُونَ | next word is "that" (an, anna) | 48:12:15 |
| 48:12:15 | verb, past | 2MP | ذَٰلِكَ فِى قُلُوبِكُمْ **[وَظَنَنتُمْ]** ظَنَّ ٱلسَّوْءِ وَكُنتُمْ قَوْمًۢا بُورًا (with the noun ظَنَّ) |  | 48:12:2 |
| 49:12:7 | noun |  | ٱجْتَنِبُوا۟ كَثِيرًا مِّنَ **[ٱلظَّنِّ]** إِنَّ بَعْضَ ٱلظَّنِّ إِثْمٌ وَلَا |  | 49:12:10 |
| 49:12:10 | noun |  | ٱلظَّنِّ إِنَّ بَعْضَ **[ٱلظَّنِّ]** إِثْمٌ وَلَا تَجَسَّسُوا۟ وَلَا يَغْتَب |  | 49:12:7 |
| 59:2:14 | verb, past | 2MP | لِأَوَّلِ ٱلْحَشْرِ مَا **[ظَنَنتُمْ]** أَن يَخْرُجُوا۟ وَظَنُّوٓا۟ أَنَّهُم مَّانِعَتُهُمْ | after negative mā; next word is "that" (an, anna) | 59:2:17 |
| 59:2:17 | verb, past | 3MP | ظَنَنتُمْ أَن يَخْرُجُوا۟ **[وَظَنُّوٓا۟]** أَنَّهُم مَّانِعَتُهُمْ حُصُونُهُم مِّنَ ٱللَّهِ | next word is "that" (an, anna) | 59:2:14 |
| 72:5:2 | verb, past | 1P | وَأَنَّا **[ظَنَنَّآ]** أَن لَّن تَقُولَ ٱلْإِنسُ وَٱلْجِنُّ | next word is "that" (an, anna) |  |
| 72:7:2 | verb, past | 3MP | وَأَنَّهُمْ **[ظَنُّوا۟]** كَمَا ظَنَنتُمْ أَن لَّن يَبْعَثَ |  | 72:7:4 |
| 72:7:4 | verb, past | 2MP | وَأَنَّهُمْ ظَنُّوا۟ كَمَا **[ظَنَنتُمْ]** أَن لَّن يَبْعَثَ ٱللَّهُ أَحَدًا | next word is "that" (an, anna) | 72:7:2 |
| 72:12:2 | verb, past | 1P | وَأَنَّا **[ظَنَنَّآ]** أَن لَّن نُّعْجِزَ ٱللَّهَ فِى | next word is "that" (an, anna) |  |
| 75:25:1 | verb, present | 3FS |  **[تَظُنُّ]** أَن يُفْعَلَ بِهَا فَاقِرَةٌ | next word is "that" (an, anna) |  |
| 75:28:1 | verb, past | 3MS |  **[وَظَنَّ]** أَنَّهُ ٱلْفِرَاقُ | next word is "that" (an, anna) |  |
| 84:14:2 | verb, past | 3MS | إِنَّهُۥ **[ظَنَّ]** أَن لَّن يَحُورَ | next word is "that" (an, anna) |  |

### ḥasiba (حَسِبَ): 21 places

| Place | Kind | Subject | In context | Marks | Also in this verse |
|---|---|---|---|---|---|
| 3:78:7 | verb, present | 2MP | يَلْوُۥنَ أَلْسِنَتَهُم بِٱلْكِتَٰبِ **[لِتَحْسَبُوهُ]** مِنَ ٱلْكِتَٰبِ وَمَا هُوَ مِنَ |  |  |
| 3:142:2 | verb, past | 2MP | أَمْ **[حَسِبْتُمْ]** أَن تَدْخُلُوا۟ ٱلْجَنَّةَ وَلَمَّا يَعْلَمِ | after am; next word is "that" (an, anna) |  |
| 3:169:2 | verb, present | 2MS | وَلَا **[تَحْسَبَنَّ]** ٱلَّذِينَ قُتِلُوا۟ فِى سَبِيلِ ٱللَّهِ | after lā |  |
| 3:178:2 | verb, present | 3MS | وَلَا **[يَحْسَبَنَّ]** ٱلَّذِينَ كَفَرُوٓا۟ أَنَّمَا نُمْلِى لَهُمْ | after lā |  |
| 3:180:2 | verb, present | 3MS | وَلَا **[يَحْسَبَنَّ]** ٱلَّذِينَ يَبْخَلُونَ بِمَآ ءَاتَىٰهُمُ ٱللَّهُ | after lā |  |
| 3:188:2 | verb, present | 2MS | لَا **[تَحْسَبَنَّ]** ٱلَّذِينَ يَفْرَحُونَ بِمَآ أَتَوا۟ وَّيُحِبُّونَ | after lā | 3:188:14 |
| 3:188:14 | verb, present | 2MS | لَمْ يَفْعَلُوا۟ فَلَا **[تَحْسَبَنَّهُم]** بِمَفَازَةٍ مِّنَ ٱلْعَذَابِ وَلَهُمْ عَذَابٌ | after lā | 3:188:2 |
| 5:71:1 | verb, past | 3MP |  **[وَحَسِبُوٓا۟]** أَلَّا تَكُونَ فِتْنَةٌ فَعَمُوا۟ وَصَمُّوا۟ | next word is "that" (an, anna) |  |
| 9:16:2 | verb, past | 2MP | أَمْ **[حَسِبْتُمْ]** أَن تُتْرَكُوا۟ وَلَمَّا يَعْلَمِ ٱللَّهُ | after am; next word is "that" (an, anna) |  |
| 18:9:2 | verb, past | 2MS | أَمْ **[حَسِبْتَ]** أَنَّ أَصْحَٰبَ ٱلْكَهْفِ وَٱلرَّقِيمِ كَانُوا۟ | after am; next word is "that" (an, anna) |  |
| 18:18:1 | verb, present | 2MS |  **[وَتَحْسَبُهُمْ]** أَيْقَاظًا وَهُمْ رُقُودٌ وَنُقَلِّبُهُمْ ذَاتَ |  |  |
| 18:102:1 | verb, past | 3MS |  **[أَفَحَسِبَ]** ٱلَّذِينَ كَفَرُوٓا۟ أَن يَتَّخِذُوا۟ عِبَادِى | question particle on the word |  |
| 18:104:8 | verb, present | 3MP | ٱلْحَيَوٰةِ ٱلدُّنْيَا وَهُمْ **[يَحْسَبُونَ]** أَنَّهُمْ يُحْسِنُونَ صُنْعًا | next word is "that" (an, anna) |  |
| 25:44:2 | verb, present | 2MS | أَمْ **[تَحْسَبُ]** أَنَّ أَكْثَرَهُمْ يَسْمَعُونَ أَوْ يَعْقِلُونَ | after am; next word is "that" (an, anna) |  |
| 33:20:1 | verb, present | 3MP |  **[يَحْسَبُونَ]** ٱلْأَحْزَابَ لَمْ يَذْهَبُوا۟ وَإِن يَأْتِ |  |  |
| 47:29:2 | verb, past | 3MS | أَمْ **[حَسِبَ]** ٱلَّذِينَ فِى قُلُوبِهِم مَّرَضٌ أَن | after am |  |
| 59:14:15 | verb, present | 2MS | بَأْسُهُم بَيْنَهُمْ شَدِيدٌ **[تَحْسَبُهُمْ]** جَمِيعًا وَقُلُوبُهُمْ شَتَّىٰ ذَٰلِكَ بِأَنَّهُمْ |  |  |
| 75:3:1 | verb, present | 3MS |  **[أَيَحْسَبُ]** ٱلْإِنسَٰنُ أَلَّن نَّجْمَعَ عِظَامَهُۥ | question particle on the word |  |
| 75:36:1 | verb, present | 3MS |  **[أَيَحْسَبُ]** ٱلْإِنسَٰنُ أَن يُتْرَكَ سُدًى | question particle on the word |  |
| 90:5:1 | verb, present | 3MS |  **[أَيَحْسَبُ]** أَن لَّن يَقْدِرَ عَلَيْهِ أَحَدٌ | question particle on the word; next word is "that" (an, anna) |  |
| 90:7:1 | verb, present | 3MS |  **[أَيَحْسَبُ]** أَن لَّمْ يَرَهُۥٓ أَحَدٌ | question particle on the word; next word is "that" (an, anna) |  |

### zaʿama (زَعَمَ): 7 places

| Place | Kind | Subject | In context | Marks | Also in this verse |
|---|---|---|---|---|---|
| 4:60:5 | verb, present | 3MP | تَرَ إِلَى ٱلَّذِينَ **[يَزْعُمُونَ]** أَنَّهُمْ ءَامَنُوا۟ بِمَآ أُنزِلَ إِلَيْكَ | next word is "that" (an, anna) |  |
| 17:56:4 | verb, past | 2MP | قُلِ ٱدْعُوا۟ ٱلَّذِينَ **[زَعَمْتُم]** مِّن دُونِهِۦ فَلَا يَمْلِكُونَ كَشْفَ |  |  |
| 17:92:5 | verb, past | 2MS | تُسْقِطَ ٱلسَّمَآءَ كَمَا **[زَعَمْتَ]** عَلَيْنَا كِسَفًا أَوْ تَأْتِىَ بِٱللَّهِ |  |  |
| 18:48:12 | verb, past | 2MP | أَوَّلَ مَرَّةٍۭ بَلْ **[زَعَمْتُمْ]** أَلَّن نَّجْعَلَ لَكُم مَّوْعِدًا | next word is "that" (an, anna) |  |
| 18:52:6 | verb, past | 2MP | نَادُوا۟ شُرَكَآءِىَ ٱلَّذِينَ **[زَعَمْتُمْ]** فَدَعَوْهُمْ فَلَمْ يَسْتَجِيبُوا۟ لَهُمْ وَجَعَلْنَا |  |  |
| 34:22:4 | verb, past | 2MP | قُلِ ٱدْعُوا۟ ٱلَّذِينَ **[زَعَمْتُم]** مِّن دُونِ ٱللَّهِ لَا يَمْلِكُونَ |  |  |
| 62:6:6 | verb, past | 2MP | ٱلَّذِينَ هَادُوٓا۟ إِن **[زَعَمْتُمْ]** أَنَّكُمْ أَوْلِيَآءُ لِلَّهِ مِن دُونِ | next word is "that" (an, anna) |  |

## Set aside

Every word of the three roots that is not included, with the reason. The two marked "nearest neighbour" are the ones a reviewer is most likely to want back.

| Word | Dictionary form | In context | Reason |
|---|---|---|---|
| 3:19:26 | حِساب | فَإِنَّ ٱللَّهَ سَرِيعُ **[ٱلْحِسَابِ]**  | reckoning, account |
| 3:27:21 | حِساب | مَن تَشَآءُ بِغَيْرِ **[حِسَابٍ]**  | reckoning, account |
| 3:37:34 | حِساب | مَن يَشَآءُ بِغَيْرِ **[حِسَابٍ]**  | reckoning, account |
| 3:173:14 | حَسْب | فَزَادَهُمْ إِيمَٰنًا وَقَالُوا۟ **[حَسْبُنَا]** ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ | "enough for" (God is enough for us) |
| 3:199:30 | حِساب | إِنَّ ٱللَّهَ سَرِيعُ **[ٱلْحِسَابِ]**  | reckoning, account |
| 4:6:37 | حَسِيب | عَلَيْهِمْ وَكَفَىٰ بِٱللَّهِ **[حَسِيبًا]**  | one who reckons, who takes account |
| 4:86:15 | حَسِيب | عَلَىٰ كُلِّ شَىْءٍ **[حَسِيبًا]**  | one who reckons, who takes account |
| 5:4:31 | حِساب | إِنَّ ٱللَّهَ سَرِيعُ **[ٱلْحِسَابِ]**  | reckoning, account |
| 5:104:12 | حَسْب | وَإِلَى ٱلرَّسُولِ قَالُوا۟ **[حَسْبُنَا]** مَا وَجَدْنَا عَلَيْهِ ءَابَآءَنَآ أَوَلَوْ | "enough for" (God is enough for us) |
| 9:59:9 | حَسْب | ٱللَّهُ وَرَسُولُهُۥ وَقَالُوا۟ **[حَسْبُنَا]** ٱللَّهُ سَيُؤْتِينَا ٱللَّهُ مِن فَضْلِهِۦ | "enough for" (God is enough for us) |
| 9:68:11 | حَسْب | خَٰلِدِينَ فِيهَا هِىَ **[حَسْبُهُمْ]** وَلَعَنَهُمُ ٱللَّهُ وَلَهُمْ عَذَابٌ مُّقِيمٌ | "enough for" (God is enough for us) |
| 9:129:4 | حَسْب | فَإِن تَوَلَّوْا۟ فَقُلْ **[حَسْبِىَ]** ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ | "enough for" (God is enough for us) |
| 17:12:19 | حِساب | وَلِتَعْلَمُوا۟ عَدَدَ ٱلسِّنِينَ **[وَٱلْحِسَابَ]** وَكُلَّ شَىْءٍ فَصَّلْنَٰهُ تَفْصِيلًا | reckoning, account |
| 17:14:7 | حَسِيب | بِنَفْسِكَ ٱلْيَوْمَ عَلَيْكَ **[حَسِيبًا]**  | one who reckons, who takes account |
| 18:40:10 | حُسْبان | جَنَّتِكَ وَيُرْسِلَ عَلَيْهَا **[حُسْبَانًا]** مِّنَ ٱلسَّمَآءِ فَتُصْبِحَ صَعِيدًا زَلَقًا | here a calamity sent from the sky; elsewhere "calculation" |
| 21:1:3 | حِساب | ٱقْتَرَبَ لِلنَّاسِ **[حِسَابُهُمْ]** وَهُمْ فِى غَفْلَةٍ مُّعْرِضُونَ | reckoning, account |
| 21:47:20 | حاسِب | بِهَا وَكَفَىٰ بِنَا **[حَٰسِبِينَ]**  | one who reckons (participle) |
| 26:113:2 | حِساب | إِنْ **[حِسَابُهُمْ]** إِلَّا عَلَىٰ رَبِّى لَوْ تَشْعُرُونَ | reckoning, account |
| 33:39:13 | حَسِيب | ٱللَّهَ وَكَفَىٰ بِٱللَّهِ **[حَسِيبًا]**  | one who reckons, who takes account |
| 39:10:21 | حِساب | ٱلصَّٰبِرُونَ أَجْرَهُم بِغَيْرِ **[حِسَابٍ]**  | reckoning, account |
| 39:38:32 | حَسْب | مُمْسِكَٰتُ رَحْمَتِهِۦ قُلْ **[حَسْبِىَ]** ٱللَّهُ عَلَيْهِ يَتَوَكَّلُ ٱلْمُتَوَكِّلُونَ | "enough for" (God is enough for us) |
| 39:47:25 | يَحْتَسِبُ | مَا لَمْ يَكُونُوا۟ **[يَحْتَسِبُونَ]**  | nearest neighbour, kept apart: eighth form, "to reckon on, to expect" (from where they had not expected). An attitude toward what will happen, but not the declared verb. |
| 59:2:28 | يَحْتَسِبُ | مِنْ حَيْثُ لَمْ **[يَحْتَسِبُوا۟]** وَقَذَفَ فِى قُلُوبِهِمُ ٱلرُّعْبَ يُخْرِبُونَ | nearest neighbour, kept apart: eighth form, "to reckon on, to expect" (from where they had not expected). An attitude toward what will happen, but not the declared verb. |
| 68:40:4 | زَعِيم | سَلْهُمْ أَيُّهُم بِذَٰلِكَ **[زَعِيمٌ]**  | guarantor, one who vouches |
| 78:27:5 | حِساب | كَانُوا۟ لَا يَرْجُونَ **[حِسَابًا]**  | reckoning, account |
| 78:36:5 | حِساب | مِّن رَّبِّكَ عَطَآءً **[حِسَابًا]**  | reckoning, account |
| 84:8:2 | حاسَبْ | فَسَوْفَ **[يُحَاسَبُ]** حِسَابًا يَسِيرًا | third form, "to call to account" |
| 84:8:3 | حِساب | فَسَوْفَ يُحَاسَبُ **[حِسَابًا]** يَسِيرًا | reckoning, account |

## What the reading step will record at each place (proposed; nothing below has been applied)

From discussion 26. Each model fills these independently before seeing the other's. "Unclear" and "not applicable" are valid in every column.

| Column | What it records |
|---|---|
| Who supposes | The person or group holding the attitude, as the text names them |
| What is supposed | The proposition, in a few words, kept close to the Arabic |
| Scope | How the supposing enters the text: stated as fact, denied, forbidden, asked about, conditional, or inside quoted speech (and whose) |
| How the text presents its truth | The text treats what is supposed as false, as true, or leaves it open |
| Grounds | What ground the text gives the holder for it: a ground is stated, none is stated, or a ground is expressly denied ("they have no knowledge of it") |
| Note | Anything the columns do not hold, including a second defensible reading |

A supposition can be true and still have no ground, and quoted speech is not the text's own view. The columns keep these apart.
