import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const episodes=readFileSync(path.join(root,'src/data/episodes.ts'),'utf8');
const characters=readFileSync(path.join(root,'src/data/characters.ts'),'utf8');
test('two drop-in video filenames are configured',()=>{
 assert.match(episodes,/pilot-the-resume\.mp4/);
 assert.match(episodes,/s01e01-reconnected\.mp4/);
 assert.match(episodes,/release: 'coming-soon'/);
});
test('all seven original character art crops are present',()=>{
 for(const name of ['zo','algo','nia','jay','mom','nova','cache']){
  assert.match(characters,new RegExp(`id: '${name}'`));
  assert.ok(existsSync(path.join(root,'public/assets/characters',`${name}.webp`)),name);
  assert.ok(existsSync(path.join(root,'public/assets/characters',`${name}-sheet.webp`)),name);
 }
});
test('world locations and poster are present',()=>{
 assert.ok(existsSync(path.join(root,'public/assets/brand/the-algorithm-poster.webp')));
 for(const name of ['algoverse','zo-loft','legacy-district','compute-heights','processing-center','cold-storage'])
  assert.ok(existsSync(path.join(root,'public/assets/worlds',`${name}.webp`)));
});
test('Tailwind v4 plugin and React plugin are configured',()=>{
 const vite=readFileSync(path.join(root,'vite.config.ts'),'utf8');
 const css=readFileSync(path.join(root,'src/styles.css'),'utf8');
 assert.match(vite,/@tailwindcss\/vite/);
 assert.match(css,/@import "tailwindcss"/);
});
