import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const parts=[];
for(const name of ['data','engine','app']){
 const text=await readFile(resolve(root,`src/${name}.mjs`),'utf8');
 parts.push(text.replace(/^import[^\n]+\n/gm,'').replace(/^export \{[^}]+\};?\n/gm,'').replace(/^export /gm,''));
}
const css=await readFile(resolve(root,'src/styles.css'),'utf8');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#214b3d"><meta name="description" content="织见 Weave 面料企业持续售前增长演示"><title>织见 Weave · 让面料遇见新的生意</title><style>${css}</style></head><body><div id="app"></div><div id="portal"></div><div id="toast" role="status" aria-live="polite"></div><script type="module">${parts.join('\n').replaceAll('</script','<\\/script')}</script></body></html>`;
await writeFile(resolve(root,'index.html'),html);
console.log(`Built standalone index.html (${Math.round(Buffer.byteLength(html)/1024)} KB)`);
