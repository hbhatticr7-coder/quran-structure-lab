import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGreek, parseHebrew, mishnahWords, normalizedSurface } from './comparison-corpus.mjs';
test('Greek retains function words and skips excluded payloads before splitting fields', () => {
  const units = new Map([['Mt:1', 1], ['Mt:2', 2]]);
  const text = '010101 C- -------- καί καί καί καί\n010101 V- 3PAI-S-- λέγει λέγει λέγει λέγω\n010201 forbidden malformed payload';
  const rows = parseGreek(text, 'Mt', units, new Set([1]));
  assert.deepEqual(rows[0].words.map((w) => w.token), ['καί', 'λέγω']);
  assert.equal(rows.length, 1);
});
test('Hebrew retains function words, strips segment boundaries, and ignores notes and excluded units', () => {
  const units = new Map([['1Sam:1', 1], ['1Sam:2', 2]]);
  const xml = '<verse osisID="1Sam.1.1"><w lemma="c" morph="HC">וְ</w><w lemma="c/559" morph="HC/Vqw3ms">וַ/יֹּאמֶר</w><note><w lemma="secret">secret</w></note></verse><verse osisID="1Sam.2.1"><w lemma="reserved">reserved</w></verse>';
  const rows = parseHebrew(xml, '1Sam', units, new Set([1]));
  assert.deepEqual(rows[0].words.map((w) => w.token), ['c', '559']);
  assert.equal(rows[0].words[1].form.includes('/'), false);
  assert.equal(rows.length, 1);
});
test('the common surface arm retains one-letter words and strips pointing without dropping Arabic letter hamzas', () => {
  assert.deepEqual(mishnahWords('<b>א בֵּית־אִילָן</b>'), ['א', 'בית', 'אילן']);
  assert.equal(normalizedSurface('ἄνθρωπος'), 'ανθρωπος');
  assert.equal(normalizedSurface('أَمَرَ'), 'أمر');
});
