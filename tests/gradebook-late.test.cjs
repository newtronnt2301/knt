const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const src=fs.readFileSync('ส่งงาน/gradebook.js','utf8');
function section(a,b){return src.slice(src.indexOf(a),src.indexOf(b,src.indexOf(a)));}
function setup(initial=false){
 const handlers={},timers=new Map(),nodes={
  'scanner-work-select':{value:'work'},'scanner-action':{value:'late'},
  'scanner-submission-modes':{hidden:false},'scanner-mode-label':{style:{}},'scanner-score-wrap':{style:{}},
  'scanner-status-log':{style:{}},'scanner-score-value':{value:'7'},'scanner-history':{}};
 let saves=0,filtered=0,unlocks=0;
 const grid={addEventListener:(name,fn)=>handlers[name]=fn};
 const buttons=['sent','late','miss'].map(mode=>({mode,pressed:'false',getAttribute:()=>mode,setAttribute:(name,value)=>{buttons.find(b=>b.mode===mode).pressed=value;}}));
 const ctx={cur:{room:'ม.4/1',students:[{id:'student',no:1,name:'นักเรียน'}],works:[{id:'work',type:'ส่ง'}],data:{student:{work:initial}}},unlocked:true,ROSTER:{'ม.4/1':[{id:'11228',no:1}]},scanCooldown:false,scanSessionHistory:[],Date,Number,String,Array,Math,
  document:{querySelectorAll:()=>buttons,querySelector:q=>q==='#grid'?grid:{textContent:'',className:''},getElementById:id=>nodes[id]},
  save:()=>saves++,promptUnlock:()=>unlocks++,renderFooter:()=>{},updateGradeMetrics:()=>{},filterStudentRows:()=>filtered++,renderGrid:()=>{},playScanBeep:()=>{},renderScanHistory:()=>{},setTimeout:(fn,ms)=>{const id=timers.size+1;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)};
 vm.createContext(ctx);
 vm.runInContext(section('function val(', '/* ===== แถบห้อง/วิชา')+section('/* คลิกครั้งเดียวสลับส่ง/ไม่ส่ง','/* คลิกลิงก์รายงาน')+section('function setStats(', 'function renderAll(')+section('function setScannerSubmissionMode(', 'function handleScannedCode(')+section('function handleScannedCode(', 'function renderScanHistory('),ctx);
 const cell={className:'cell',textContent:'',classList:{contains:c=>c==='cell'},getAttribute:k=>k==='data-s'?'student':'work'};
 const click=detail=>handlers.click({target:cell,detail});
 const double=()=>handlers.dblclick({target:cell,preventDefault(){}});
 return {ctx,nodes,buttons,cell,timers,click,double,counts:()=>({saves,filtered,unlocks})};
}
test('single click toggles normal sent and unsent without creating late',()=>{const h=setup();h.click(1);assert.equal(h.ctx.cur.data.student.work,true);h.click(1);assert.equal(h.ctx.cur.data.student.work,false);assert.equal(h.counts().saves,2);});
for(const initial of [false,true,'late'])test('native double-click sequence marks late from '+initial,()=>{const h=setup(initial);h.click(1);h.click(2);h.double();assert.equal(h.ctx.cur.data.student.work,'late');assert.equal(h.cell.textContent,'ส่งสาย');assert.equal(h.cell.className,'cell s-late');assert.equal(h.counts().saves,2);assert.equal(h.counts().filtered,1);assert.equal(h.timers.size,0);});
test('pending-only filtering waits so first click does not hide double-click target',()=>{const h=setup();h.click(1);assert.equal(h.counts().filtered,0);assert.equal([...h.timers.values()][0].ms,600);});
test('late counts as received in current and all-room summaries',()=>{const h=setup('late');assert.equal(h.ctx.pendingCount('student'),0);const stats=h.ctx.setStats(h.ctx.cur);assert.equal(stats.sent,1);assert.equal(stats.rate,100);assert.equal(h.ctx.submissionLabel('late'),'ส่งสาย');});
test('scanner late mode records late, saves, and labels history',()=>{const h=setup();h.ctx.handleScannedCode('11228');assert.equal(h.ctx.cur.data.student.work,'late');assert.match(h.nodes['scanner-status-log'].textContent,/ส่งสาย/);assert.match(h.ctx.scanSessionHistory[0].actionText,/ส่งสาย/);assert.equal(h.counts().saves,1);});
test('scanner normal and miss modes can correct a late mark',()=>{for(const [action,result] of [['sent',true],['miss',false],['toggle',false]]){const h=setup('late');h.nodes['scanner-action'].value=action;h.ctx.handleScannedCode('1');assert.equal(h.ctx.cur.data.student.work,result);}});
test('late scan setting preserves numeric exam scoring',()=>{const h=setup();h.ctx.cur.works[0].type='สอบ';h.ctx.handleScannedCode('1');assert.equal(h.ctx.cur.data.student.work,7);});
test('locked workspace blocks manual and scanned edits',()=>{const h=setup();h.ctx.unlocked=false;h.click(1);h.double();h.ctx.handleScannedCode('1');assert.equal(h.ctx.cur.data.student.work,false);assert.equal(h.counts().saves,0);});

test('visible late button selects scanner mode and highlights it',()=>{const h=setup();h.ctx.setScannerSubmissionMode('late');assert.equal(h.nodes['scanner-action'].value,'late');assert.equal(h.buttons.find(b=>b.mode==='late').pressed,'true');assert.match(h.nodes['scanner-mode-label'].textContent,/ส่งสาย/);h.ctx.handleScannedCode('1');assert.equal(h.ctx.cur.data.student.work,'late');});
test('exam selection hides submission buttons and cannot change exam mode',()=>{const h=setup();h.ctx.cur.works[0].type='สอบ';h.nodes['scanner-action'].value='score';h.ctx.toggleScannerScoreInput();assert.equal(h.nodes['scanner-submission-modes'].hidden,true);h.ctx.setScannerSubmissionMode('late');assert.equal(h.nodes['scanner-action'].value,'score');});
test('late scanner button is visible above camera, without opening a dropdown',()=>{const html=fs.readFileSync('ส่งงาน/index-ส่งงาน.html','utf8');assert(html.indexOf('data-scan-mode="late"')<html.indexOf('id="scanner-view-container"'));assert.match(html,/data-scan-mode="late"[^>]*>◷ ส่งสาย/);});
