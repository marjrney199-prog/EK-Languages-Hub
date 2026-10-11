import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {LANGUAGES,FUTURE_LANGUAGES,PHRASES} from '../src/catalog.js';

const read=async url=>readFile(fileURLToPath(new URL(url,import.meta.url)),'utf8');
const data=JSON.parse(await read('../data/english-course.json'));
const manifest=JSON.parse(await read('../manifest.webmanifest'));
const html=await read('../index.html');
const app=await read('../src/app.js');
const sw=await read('../sw.js');

test('editorial seed has the expected English course coverage',()=>{
  assert.equal(data.tenses.length,12);
  assert.equal(data.verbs.length,236);
  assert.equal(data.vocabulary.length,1000);
  assert.equal(data.dialogues.length,10);
  assert.equal(data.quizzes.reduce((n,q)=>n+q.items.length,0),598);
  assert.ok(data.quizzes.every(q=>q.items.every(item=>item.question&&item.answer&&item.explanation)));
});

test('all target language codes have an offline phrase sample',()=>{
  const required=['en','pt','fr','es','de','it','ar','zh','sw'];
  assert.deepEqual(LANGUAGES.map(x=>x.id),required);
  for(const code of required)assert.ok(PHRASES.some(phrase=>phrase[code]),`missing sample for ${code}`);
  assert.ok(FUTURE_LANGUAGES.includes('Changana'));
});

test('PWA manifest has standalone display and valid icon declarations',()=>{
  assert.equal(manifest.display,'standalone');
  assert.equal(manifest.start_url,'./');
  assert.ok(manifest.icons.some(x=>x.sizes==='192x192'));
  assert.ok(manifest.icons.some(x=>x.purpose==='maskable'));
});

test('HTML shell includes accessible skip link, theme control and module entry',()=>{
  assert.match(html,/class="skip-link"/);
  assert.match(html,/id="themeToggle"/);
  assert.match(html,/type="module" src="\.\/src\/app\.js"/);
  assert.match(html,/aria-label="Navegação rápida"/);
});

test('service worker precaches app modules and offline course/e-book',()=>{
  for(const path of ['./src/app.js','./src/core.js','./src/catalog.js','./data/english-course.json','./data/Learning_English_Edmilson_Arlindo.pdf'])assert.ok(sw.includes(path),path);
});

test('course screen exposes timed practice and complete quiz-bank sessions',()=>{
  assert.match(app,/quiz-library/);
  assert.ok(app.includes("btn('10 perguntas','start-bank'"));
  assert.match(app,/data-size=.*all/);
  assert.match(app,/case 'start-bank'/);
});
