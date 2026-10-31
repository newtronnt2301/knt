const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(){
  const scripts=[];let callback;
  const context={window:{},Promise,Error,setTimeout:fn=>{callback=fn;return 1},clearTimeout:()=>{},document:{head:{appendChild:script=>scripts.push(script)},createElement:()=>({remove(){this.removed=true}})}};
  vm.runInNewContext(fs.readFileSync('assets/libraries.js','utf8'),context);
  return {context,scripts,timeout:()=>callback()};
}
test('Excel is not requested on page entry; simultaneous export requests share one download',async()=>{
 const {context,scripts}=setup();assert.equal(scripts.length,0);
 const a=context.window.KNTLibraries.excel(),b=context.window.KNTLibraries.excel();assert.equal(a,b);assert.equal(scripts.length,1);
 context.window.ExcelJS={Workbook:function(){}};scripts[0].onload();await a;
 await context.window.KNTLibraries.excel();assert.equal(scripts.length,1);
});
test('a failed export-library request can be retried without leaving a rejected cache',async()=>{
 const {context,scripts}=setup();const request=context.window.KNTLibraries.excel();scripts[0].onerror();await assert.rejects(request);assert.equal(scripts[0].removed,true);
 const retry=context.window.KNTLibraries.excel();context.window.ExcelJS={Workbook:function(){}};scripts[1].onload();await retry;assert.equal(scripts.length,2);
});
test('a stalled export-library download has a bounded wait and cleans up',async()=>{
 const {context,scripts,timeout}=setup();const request=context.window.KNTLibraries.excel();timeout();await assert.rejects(request);assert.equal(scripts[0].removed,true);
});
