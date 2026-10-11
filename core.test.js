import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {translateOffline,normalizeText,correctBasicEnglish,makeTutorReply,generateDraft,scoreLevelFromXP,getMedals} from '../src/core.js';
import {createStore} from '../src/store.js';

const courseUrl=new URL('../data/english-course.json',import.meta.url);
const course=JSON.parse(await readFile(fileURLToPath(courseUrl),'utf8'));

test('normalization ignores accents, punctuation and case',()=>{
  assert.equal(normalizeText('Olá, Maputo!'),'ola maputo');
  assert.equal(normalizeText('  GOOD   morning. '),'good morning');
});

test('offline phrasebook returns a reviewed exact phrase',()=>{
  const result=translateOffline('Good morning.','en','pt',course.vocabulary);
  assert.equal(result.text,'Bom dia.');
  assert.equal(result.mode,'phrasebook');
  assert.equal(result.coverage,1);
});

test('offline dictionary labels a word-level draft transparently',()=>{
  const result=translateOffline('apple','en','pt',course.vocabulary);
  assert.equal(result.text,'maçã');
  assert.equal(result.mode,'dictionary-draft');
});

test('unknown language pair does not pretend to translate',()=>{
  const result=translateOffline('A complex sentence not in the phrasebook.','fr','de',course.vocabulary);
  assert.equal(result.mode,'unavailable');
  assert.equal(result.text,'');
});

test('basic corrector explains and fixes common agreement errors',()=>{
  const result=correctBasicEnglish("she don't works here");
  assert.equal(result.corrected,"She doesn't work here.");
  assert.ok(result.changes.length>=3);
});

test('offline tutor responds to a grammar request with examples',()=>{
  const reply=makeTutorReply('Explica Present Simple','A1');
  assert.match(reply,/Present Simple/);
  assert.match(reply,/She works/);
});

test('content generator produces a personalised email draft',()=>{
  const result=generateDraft({type:'email',topic:'job application',name:'Amina',recipient:'Mr Lee',language:'en'});
  assert.match(result.text,/Subject: job application/);
  assert.match(result.text,/Dear Mr Lee/);
  assert.match(result.text,/Amina/);
});

test('level progress and medals have stable thresholds',()=>{
  assert.equal(scoreLevelFromXP(0).name,'Explorador');
  assert.equal(scoreLevelFromXP(350).name,'Comunicador');
  assert.equal(getMedals({lessons:1})[0].earned,true);
});

test('local store persists activities, lesson completion and bookmarks',()=>{
  const memory=new Map();
  const storage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
  const s=createStore(storage);
  assert.equal(s.completeLesson('en_present_simple'),true);
  assert.equal(s.state.xp,20);
  assert.equal(s.completeLesson('en_present_simple'),false);
  assert.deepEqual(s.toggleWord(3),{added:true,awarded:true});
  assert.equal(s.state.learnedWords.includes(3),true);
  assert.deepEqual(s.toggleWord(3),{added:false,awarded:false});
  assert.deepEqual(s.toggleWord(3),{added:true,awarded:false});
  assert.equal(s.toggleBookmark(3),true);
  assert.equal(s.state.bookmarks.includes(3),true);
  const restored=createStore(storage);
  assert.equal(restored.state.xp,22);
  assert.equal(restored.state.completedLessons.length,1);
});
