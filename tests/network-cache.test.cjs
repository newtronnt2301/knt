const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function network(fetch) {
  const events=[];
  const window={dispatchEvent:event=>events.push(event.detail.active)};
  vm.runInNewContext(fs.readFileSync('js/network.js','utf8'), {window,fetch,AbortController,setTimeout,clearTimeout,CustomEvent:class{constructor(type,{detail}){this.detail=detail}},TypeError});
  return {json:window.KNTNetwork.json,events};
}
test('simultaneous reads share transport; later reads refresh',async()=>{
  let count=0;const {json,events}=network(async()=>{count++;return{ok:true,json:async()=>({ok:true})}});
  await Promise.all([json('/read'),json('/read')]);assert.equal(count,1);
  await json('/read');assert.equal(count,2);assert.equal(events.at(-1),0);
});
test('writes are never combined or automatically retried',async()=>{
  let count=0;const {json}=network(async()=>{count++;throw new TypeError('offline')});
  const result=await Promise.allSettled([json('/save',{mutation:true}),json('/save',{mutation:true})]);
  assert.equal(count,2);assert(result.every(item=>item.status==='rejected'&&/ยืนยัน/.test(item.reason.message)));
});
test('timeout covers the body and reports an uncertain write',async()=>{
  const {json,events}=network(async(url,{signal})=>({ok:true,json:()=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Object.assign(new Error('abort'),{name:'AbortError'}))))}));
  await assert.rejects(json('/save',{mutation:true,timeoutMs:5}),/ตรวจข้อมูลบนระบบก่อนส่งซ้ำ/);
  assert.equal(events.at(-1),0);
});
test('failed requests leave no poisoned deduplication entry',async()=>{
  let count=0;const {json}=network(async()=>{count++;return {ok:count>1,status:503,json:async()=>({ok:true})}});
  await assert.rejects(json('/read'),/503/);assert.deepEqual(await json('/read'),{ok:true});assert.equal(count,2);
});
function worker(file,{fetch=async()=>new Response('ok'),cached,keys=[]}={}) {
  const listeners={},deleted=[],writes=[];
  const cache={addAll:async()=>{},match:async()=>cached,put:async(...args)=>writes.push(args)};
  const self={location:{href:`https://example.com/knt/${file}`,origin:'https://example.com'},addEventListener:(name,fn)=>listeners[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}};
  vm.runInNewContext(fs.readFileSync(file,'utf8'),{self,caches:{open:async()=>cache,keys:async()=>keys,delete:async key=>deleted.push(key)},fetch,URL,Response,Set,Promise,setTimeout,clearTimeout});
  function request(url,mode='cors',method='GET') {let response;const background=[];listeners.fetch({request:{url,mode,method},respondWith:p=>response=p,waitUntil:p=>background.push(p)});return {response,background};}
  return {listeners,deleted,writes,request};
}
for(const file of ['app/sw.js','talent/sw.js']) {
 test(`${file} preserves other app caches`,async()=>{
   const prefix=file.startsWith('app/')?'knt-classroom-':'knt-talent-';
   const w=worker(file,{keys:['knt-classroom-v0','knt-talent-v0','other-site']});let done;w.listeners.activate({waitUntil:p=>done=p});await done;
   assert.deepEqual(w.deleted,[prefix+'v0']);
 });
 test(`${file} never intercepts APIs, writes or unknown assets`,()=>{
   const w=worker(file);assert.equal(w.request('https://script.google.com/macros/s/anything/exec?action=save').response,undefined);
   assert.equal(w.request('https://example.com/knt/api').response,undefined);
   assert.equal(w.request(`https://example.com/knt/${file.replace('sw.js','index.html')}`,'cors','POST').response,undefined);
 });
 test(`${file} uses cached static resources without network`,async()=>{
   let calls=0;const w=worker(file,{cached:new Response('cached'),fetch:async()=>{calls++;throw new Error('offline')}});
   const path=file.startsWith('app/')?'app/styles.css?v=10':'talent/styles.css?v=11';
   const res=await w.request('https://example.com/knt/'+path).response;
   assert.equal(await res.text(),'cached');assert.equal(calls,0);
 });
 test(`${file} missing offline JS is an error, never HTML`,async()=>{
   const w=worker(file,{fetch:async()=>{throw new Error('offline')}});
   const path=file.startsWith('app/')?'app/app.js?v=19':'talent/app.js?v=12';
   const res=await w.request('https://example.com/knt/'+path).response;assert.equal(res.type,'error');
 });
}
for (const file of ['app/sw.js','talent/sw.js']) {
 test(`${file} cached navigation does not wait for a slow network`,async()=>{
   const w=worker(file,{cached:new Response('shell'),fetch:()=>new Promise(()=>{})});
   const url='https://example.com/knt/'+file.replace('sw.js','index.html');
   const result = await Promise.race([w.request(url,'navigate').response, new Promise(resolve=>setTimeout(()=>resolve(null),50))]);
   assert(result);assert.equal(await result.text(),'shell');
 });
}
for (const file of ['app/sw.js','talent/sw.js']) {
 test(`${file} tool/query navigations can use their cached shell`,async()=>{
   const w=worker(file,{cached:new Response('shell'),fetch:()=>new Promise(()=>{})});
   const url='https://example.com/knt/'+file.replace('sw.js','')+'?tool=subject-attendance';
   const result=await w.request(url,'navigate').response;assert(result);assert.equal(await result.text(),'shell');
 });
}
