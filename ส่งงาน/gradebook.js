
/* ===== เมนูเว็บ (drawer) — เพิ่มเว็บใหม่: ก๊อปบรรทัด {icon,label,url} วางต่อท้าย ===== */
var SITE_LINKS=[
  {icon:'🏠', label:'กลับหน้าแรกเว็บรวมหลัก', url:'../index.html'},
  {icon:'📝', label:'ติดตามการส่งงาน (เว็บนี้)', url:''},
  {icon:'🖨️', label:'พิมพ์การ์ด QR Code', url:'qr-card.html'},
  {icon:'✨', label:'เครื่องมือสร้าง QR Code', url:'qr-generator.html'},
  {icon:'📚', label:'เช็คชื่อรายวิชา', url:'../เช็คชื่อรายวิชา/index.html'},
  {icon:'⚙️', label:'เช็คชื่อห้องเตรียมวิศวะ', url:'../เช็คชื่อ-เตรียมวิศวะ.html'},
  {icon:'📊', label:'จัดการคะแนน & ตัดเกรด', url:'../คะแนนเกรด/index-เกรด.html'},
  {icon:'🦆', label:'สุ่มเลขที่ เป็ดแข่งวิ่ง', url:'../สุ่มเลขที่/index.html'},
  {icon:'🎲', label:'เว็บบอร์ดเกมคลับ', url:'../boardgame/index.html'},
  {icon:'📷', label:'ระบบสแกนการ์ดตอบคำถาม', url:'../plickers/index.html'},
];
document.getElementById('drawer-links').innerHTML=SITE_LINKS.map(function(l){
  return l.url
    ? '<a class="drawer-link" href="'+l.url+'" target="_blank" rel="noopener"><span class="ic">'+l.icon+'</span>'+l.label+' ›</a>'
    : '<span class="drawer-link" style="opacity:.55"><span class="ic">'+l.icon+'</span>'+l.label+'</span>';
}).join('');
function openDrawer(){document.getElementById('drawer').classList.add('open');document.getElementById('drawer-backdrop').classList.add('show');}
function closeDrawer(){document.getElementById('drawer').classList.remove('open');document.getElementById('drawer-backdrop').classList.remove('show');}

/* ===== ที่เก็บข้อมูล: localStorage (บันทึกอัตโนมัติ) ===== */
var LS_KEY='hwTrackerApp_v1';
var DB={sets:{}};
var curKey=null, cur=null;

/* ===== ครูแต่ละคนแยกห้องทำงาน (Teacher Workspaces) ===== */
var WS_LIST_KEY = 'hw_workspaces_list';
var ACTIVE_WS_KEY = 'hw_active_workspace';

var workspaces = [];
var activeWorkspace = 'ครูนิวตรอน';

function initWorkspaces() {
  try {
    workspaces = JSON.parse(localStorage.getItem(WS_LIST_KEY));
  } catch(e) {
    workspaces = null;
  }
  
  if (!workspaces || !Array.isArray(workspaces) || workspaces.length === 0) {
    workspaces = [
      { name: 'ครูนิวตรอน', password: 'ครูนิวตรอน' }
    ];
    
    // ย้ายข้อมูลเดิมถ้ามี (Data Migration)
    var oldDb = localStorage.getItem('hwTrackerApp_v1');
    if (oldDb) {
      localStorage.setItem('hwTrackerApp_data_ครูนิวตรอน', oldDb);
    }
    var oldCloudUrl = localStorage.getItem('hwCloudUrl');
    if (oldCloudUrl) {
      localStorage.setItem('hwCloudUrl_ครูนิวตรอน', oldCloudUrl);
    }
    var oldReportTitle = localStorage.getItem('hwReportTitle');
    if (oldReportTitle) {
      localStorage.setItem('hwReportTitle_ครูนิวตรอน', oldReportTitle);
    }
    
    localStorage.setItem(WS_LIST_KEY, JSON.stringify(workspaces));
  }
  
  activeWorkspace = localStorage.getItem(ACTIVE_WS_KEY) || 'ครูนิวตรอน';
  var exists = workspaces.some(function(w) { return w.name === activeWorkspace; });
  if (!exists) {
    activeWorkspace = workspaces[0].name;
  }
  localStorage.setItem(ACTIVE_WS_KEY, activeWorkspace);
}

// โหลดห้องทำงานเมื่อเริ่ม
initWorkspaces();
var ROSTER={};
var rosterReady=null;
function ensureWorkRoster(){
  if(!rosterReady)rosterReady=new Promise(function(resolve,reject){
    var s=document.createElement("script");s.src="roster-data.js?v=1";
    var timer=setTimeout(function(){reject(new Error("โหลดทะเบียนไม่สำเร็จ"));},15000);
    s.onload=function(){clearTimeout(timer);resolve();};
    s.onerror=function(){clearTimeout(timer);reject(new Error("โหลดทะเบียนไม่สำเร็จ"));};document.head.appendChild(s);
  }).catch(function(){rosterReady=null;});
  return rosterReady;
}

if(typeof ROSTER==='undefined'){var ROSTER={};}

/* ===== คลาวด์ส่วนกลาง (Google Apps Script + Sheet) =====
   ลิงก์ /exec ตั้งค่าผ่านปุ่ม "⚙️ ตั้งค่าคลาวด์" (เก็บใน localStorage)
   ถ้าจะฝังลิงก์ให้ทุกเครื่องใช้อัตโนมัติ ใส่ในตัวแปร CLOUD_URL ด้านล่าง */
var CLOUD_URL='https://script.google.com/macros/s/AKfycbyt0HfLY6ZvCc12rFdJI74KGim_wmLapTKNlvhe7U3O3LlNaaCq97iHkZQ-51mLLVKY/exec';  // ลิงก์คลาวด์ (ฝังให้ทุกเครื่องใช้อัตโนมัติ)
var SAVE_PW='2301';               // รหัสผ่านสำหรับบันทึก
var unlocked=(sessionStorage.getItem('hwUnlocked_' + activeWorkspace)==='1');
var pushTimer=null, cloudBusy=false, pendingPush=false, retryChecking=false;

function cloudUrl(){
  var u=(localStorage.getItem('hwCloudUrl_' + activeWorkspace)||CLOUD_URL||'').trim();
  return /^https?:\/\//.test(u)?u:'';
}
function setStatus(txt,cls){
  var el=document.getElementById('save'); if(!el)return;
  el.textContent=txt; el.className=cls||'';
  var detail=document.getElementById('syncDetail');if(detail)detail.textContent=txt;
  var retry=document.getElementById('retrySave');if(retry){retry.hidden=!localDirty||!syncPaused;retry.disabled=cloudBusy||retryChecking;}
 el.style.color=(cls==='ok')?'var(--chalk)':'';
}
function updateLockUI(){
  var b=document.getElementById('lockBtn'); if(!b)return;
  if(unlocked){ b.textContent='🔓 แก้ไข/บันทึกได้'; b.style.borderColor='var(--chalk)'; b.style.color='var(--chalk)'; b.title='แตะเพื่อล็อกกลับเป็นดูอย่างเดียว'; }
  else { b.textContent='🔒 บันทึกถูกล็อก'; b.style.borderColor='#fff'; b.style.color='var(--green-d)'; b.title='แตะเพื่อใส่รหัสปลดล็อกการบันทึก'; }
}

/* BEGIN GRADEBOOK SYNC — local drafts never depend on a network response. */
var localDirty=false,localRevision=0,syncPaused=false,readEpoch=0,footerTimer;
function syncKey(ws){return 'hwSyncState_'+ws;}
function syncMeta(ws){try{return JSON.parse(localStorage.getItem(syncKey(ws)))||{};}catch(e){return {};}}
function persistDraft(){
  try{
    localStorage.setItem('hwTrackerApp_data_'+activeWorkspace,JSON.stringify(DB));
    localStorage.setItem(syncKey(activeWorkspace),JSON.stringify({dirty:localDirty,revision:localRevision,savedAt:syncMeta(activeWorkspace).savedAt||null}));
    return true;
  }catch(e){setStatus('เก็บร่างในเครื่องไม่ได้ กรุณากดสำรองข้อมูลก่อนปิดหน้า','err');return false;}
}
function backupBeforeReplace(ws,next){
  var old=localStorage.getItem('hwTrackerApp_data_'+ws);
  if(!old||old===JSON.stringify(next))return true;
  try{
    var key='hwRecovery_'+ws,items=JSON.parse(localStorage.getItem(key))||[];
    items.unshift({at:new Date().toISOString(),data:JSON.parse(old)});
    localStorage.setItem(key,JSON.stringify(items.slice(0,3)));return true;
  }catch(e){setStatus('พื้นที่สำรองไม่พอ ยังเก็บข้อมูลเดิมไว้ กรุณาสำรองข้อมูล','err');return false;}
}
function load(){
  try{DB=JSON.parse(localStorage.getItem('hwTrackerApp_data_'+activeWorkspace))||{sets:{}};}catch(e){DB={sets:{}};}
  if(!DB.sets)DB.sets={};
  var meta=syncMeta(activeWorkspace);localDirty=!!meta.dirty;localRevision=Number(meta.revision)||0;syncPaused=localDirty;
}
function save(){
  localDirty=true;localRevision++;
  if(!persistDraft()){syncPaused=true;return;}
  setStatus('เก็บร่างในเครื่องแล้ว · รอส่งขึ้นคลาวด์');
  if(!cloudUrl()){setStatus('เก็บร่างแล้ว · ยังไม่ได้ตั้งค่าคลาวด์');return;}
  if(!unlocked){promptUnlock();return;}
  if(syncPaused){setStatus('เก็บร่างแล้ว · กรุณาตรวจและส่งร่างอีกครั้ง');return;}
  schedulePush();
}
function schedulePush(){
  clearTimeout(pushTimer);
  if(!localDirty||syncPaused)return;
  setStatus('เก็บร่างแล้ว · เตรียมบันทึกขึ้นคลาวด์');
  pushTimer=setTimeout(pushNow,1000);
}
function pushNow(){
  var url=cloudUrl();if(!url||!unlocked||!localDirty||syncPaused)return Promise.resolve();
  if(cloudBusy){pendingPush=true;return Promise.resolve();}
  cloudBusy=true;pendingPush=false;
  var ws=activeWorkspace,revision=localRevision,snapshot=JSON.stringify(DB),succeeded=false;
  var enteredPw=sessionStorage.getItem('hwEnteredPassword_'+ws)||'';
  setStatus('เก็บร่างแล้ว · กำลังบันทึกขึ้นคลาวด์');
  return KNTNetwork.json(url,{method:'POST',mutation:true,timeoutMs:30000,headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({password:enteredPw,data:JSON.parse(snapshot)})})
  .then(function(j){
    if(!j||!j.ok)throw new Error((j&&j.error)||'เซิร์ฟเวอร์ยังไม่ยืนยันการบันทึก');
    succeeded=true;
    if(activeWorkspace!==ws)return;
    if(localRevision===revision){
      localDirty=false;persistDraft();
      var meta=syncMeta(ws);meta.savedAt=new Date().toISOString();localStorage.setItem(syncKey(ws),JSON.stringify(meta));
      setStatus('บันทึกขึ้นคลาวด์แล้ว · '+new Date().toLocaleTimeString('th-TH'),'ok');
    }else setStatus('บันทึกรอบก่อนแล้ว · ยังมีร่างใหม่รอส่ง');
  }).catch(function(error){
    if(activeWorkspace!==ws)return;
    syncPaused=true;pendingPush=false;clearTimeout(pushTimer);
    setStatus('ยังยืนยันการบันทึกไม่ได้ · ร่างยังอยู่ในเครื่อง · '+error.message,'err');
  }).finally(function(){
    cloudBusy=false;
    if(succeeded&&activeWorkspace===ws&&localDirty&&!syncPaused) schedulePush();
    var retry=document.getElementById('retrySave');if(retry){retry.hidden=!localDirty||!syncPaused;retry.disabled=retryChecking;}
  });
}
function refreshFromCloud(cb){
  var url=cloudUrl(),ws=activeWorkspace,revision=localRevision,epoch=++readEpoch;
  if(localDirty||cloudBusy){setStatus('มีร่างที่ยังไม่ยืนยันบนคลาวด์ · เก็บร่างไว้ ไม่โหลดทับ');if(cb)cb();return Promise.resolve();}
  if(!url){afterDataReady();if(cb)cb();return Promise.resolve();}
  setStatus(Object.keys(DB.sets).length?'แสดงข้อมูลในเครื่อง · กำลังตรวจข้อมูลล่าสุด':'กำลังโหลดห้องเรียนจากคลาวด์…');
  return KNTNetwork.json(url,{timeoutMs:15000}).then(function(j){
    if(ws!==activeWorkspace||epoch!==readEpoch)return;
    if(localDirty||revision!==localRevision){setStatus('มีการแก้ไขใหม่ · เก็บร่างไว้ ไม่โหลดทับ');return;}
    if(!j||!j.ok||!j.data||!j.data.sets)throw new Error('รูปแบบข้อมูลจากคลาวด์ไม่ถูกต้อง');
    if(!backupBeforeReplace(ws,j.data))return;
    DB=j.data;persistDraft();setStatus('โหลดข้อมูลล่าสุดแล้ว · '+new Date().toLocaleTimeString('th-TH'),'ok');afterDataReady();
  }).catch(function(error){if(ws===activeWorkspace&&epoch===readEpoch)setStatus('โหลดไม่สำเร็จ · ใช้ข้อมูลในเครื่อง · '+error.message,'err');})
  .finally(function(){if(ws===activeWorkspace&&epoch===readEpoch&&cb)cb();});
}
/* END GRADEBOOK SYNC */

function afterDataReady(){
  renderSetBar();
  var keys=Object.keys(DB.sets);
  if(curKey&&DB.sets[curKey]) openSet(curKey);
  else if(keys.length){var remembered=localStorage.getItem('hwLastSet_'+activeWorkspace);openSet(DB.sets[remembered]?remembered:keys[0]);}
  else {curKey=null;cur=null;renderGrid();updateGradeMetrics();}
}

/* ===== ปลดล็อก/ล็อกการบันทึก ===== */
function toggleLock(){
  if(unlocked){ unlocked=false; sessionStorage.removeItem('hwUnlocked_' + activeWorkspace); sessionStorage.removeItem('hwEnteredPassword_' + activeWorkspace); updateLockUI(); setStatus('🔒 ล็อกการบันทึกแล้ว (ดูได้อย่างเดียว)'); }
  else promptUnlock();
}
function promptUnlock(){
  var dlg=document.getElementById('pwDlg');
  document.getElementById('pwInput').value='';
  document.getElementById('pwMsg').textContent='';
  dlg.showModal();
  setTimeout(function(){document.getElementById('pwInput').focus();},60);
}
function uid(p){return p+Math.random().toString(36).slice(2,8);}
function escapeHtml(s){return String(s||'').replace(/[&<>"]/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

/* ===== ค่าในเซลล์ ===== */
function val(sid,wid){ return cur.data[sid] ? cur.data[sid][wid] : undefined; }
function setVal(sid,wid,v){ if(!cur.data[sid])cur.data[sid]={}; cur.data[sid][wid]=v; }
function isSent(sid,wid){ return val(sid,wid)===true; }
function pendingCount(sid){
  var n=0; cur.works.forEach(function(w){ if(w.type==='ส่ง' && !isSent(sid,w.id)) n++; });
  return n;
}

/* ===== แถบห้อง/วิชา ===== */
function renderSetBar(){
  var bar=document.getElementById('setBar'); bar.innerHTML='';
  var keys=Object.keys(DB.sets);
  if(!keys.length){ bar.innerHTML='<span class="muted">ยังไม่มีห้อง — กด “สร้างห้อง/วิชา” เพื่อเริ่ม</span>'; return; }
  keys.forEach(function(k){
    var s=DB.sets[k];
    var c=document.createElement('div'); c.className='chip'+(k===curKey?' active':'');
    c.innerHTML='📚 '+escapeHtml(s.room)+' · '+escapeHtml(s.subject)+' <small>('+s.students.length+' คน)</small>';
    c.onclick=function(){ openSet(k); };
    bar.appendChild(c);
  });
}
function openSet(k){
  curKey=k; cur=DB.sets[k];
  if(!cur.works)cur.works=[]; if(!cur.students)cur.students=[]; if(!cur.data)cur.data={};
  document.getElementById('curLabel').textContent=cur.room+' · '+cur.subject+' ('+cur.students.length+' คน, '+cur.works.length+' งาน)';
  try{localStorage.setItem('hwLastSet_'+activeWorkspace,k);}catch(e){}
  renderSetBar(); updateGradeMetrics(); updateWorkFilter(); renderGrid();
  if(!document.getElementById('tab-manage').classList.contains('hide')){renderWorks();renderStudents();}
}
function updateLabel(){
  if(cur)document.getElementById('curLabel').textContent=cur.room+' · '+cur.subject+' ('+cur.students.length+' คน, '+cur.works.length+' งาน)';
  renderSetBar();
}

/* รายชื่อห้องที่เคยสร้าง + ดึงรายชื่อนักเรียนของห้องนั้น (เลือกชุดที่มีคนเยอะสุด) */
function existingRooms(){
  var r={}; Object.keys(DB.sets).forEach(function(k){r[DB.sets[k].room]=1;});
  Object.keys(ROSTER).forEach(function(k){r[k]=1;});   // รวมห้องจากทะเบียน
  return Object.keys(r);
}
// ดึงรายชื่อ: ใช้ของครูที่เคยกรอกก่อน ถ้าไม่มีค่อยใช้ทะเบียนกลางจากไฟล์
function roomRoster(room){
  var best=null;
  Object.keys(DB.sets).forEach(function(k){
    var s=DB.sets[k]; if(s.room===room && s.students.length && (!best||s.students.length>best.students.length)) best=s;
  });
  if(best) return best.students.map(function(s){return {id:uid('s'),no:s.no,name:s.name};});
  if(ROSTER[room]) return ROSTER[room].map(function(s){return {id:uid('s'),no:s.no,name:s.name};});
  return [];
}

/* สร้างห้อง/วิชา */
var createDlg=document.getElementById('createDlg');
var cRoomEl=document.getElementById('cRoom'), cRoomHint=document.getElementById('cRoomHint');
function updateRoomHint(){
  var room=cRoomEl.value.trim();
  var n=roomRoster(room).length;
  cRoomHint.innerHTML = (room&&n) ? '✅ มีรายชื่อห้อง '+escapeHtml(room)+' ในทะเบียน — จะดึง '+n+' คนมาให้อัตโนมัติ (ลบรายคนได้ภายหลัง)' : '';
}
cRoomEl.addEventListener('input',updateRoomHint);
document.getElementById('btnCreate').onclick=async function(){
  await ensureWorkRoster();
  cRoomEl.value=''; document.getElementById('cSubject').value=''; cRoomHint.innerHTML='';
  document.getElementById('roomOpts').innerHTML=existingRooms().map(function(r){return '<option value="'+escapeHtml(r)+'">';}).join('');
  createDlg.showModal();
};
document.getElementById('cCancel').onclick=function(){createDlg.close();};
document.getElementById('cOk').onclick=function(){
  var room=cRoomEl.value.trim();
  var subject=document.getElementById('cSubject').value.trim();
  if(!room||!subject){alert('กรอกห้องและรายวิชา');return;}
  var k=room+'|'+subject;
  if(DB.sets[k]){alert('มีห้อง/วิชานี้อยู่แล้ว');}
  else { DB.sets[k]={room:room,subject:subject,works:[],students:roomRoster(room),data:{}}; save(); }
  createDlg.close(); openSet(k);
};
document.getElementById('btnDeleteSet').onclick=function(){
  if(!curKey){alert('ยังไม่ได้เปิดห้อง');return;}
  if(!confirm('ลบ "'+cur.room+' · '+cur.subject+'" ทั้งหมด?'))return;
  delete DB.sets[curKey]; curKey=null; cur=null; save();
  document.querySelector('#grid thead').innerHTML=''; document.querySelector('#grid tbody').innerHTML='';
  document.getElementById('curLabel').textContent='— ยังไม่ได้เลือกห้อง —';
  renderSetBar(); renderWorks(); renderStudents();
};

/* ===== ตารางงาน ===== */
function renderGrid(){
  var thead=document.querySelector('#grid thead'), tbody=document.querySelector('#grid tbody'),
      tfoot=document.querySelector('#grid tfoot');
  if(!cur){thead.innerHTML='';tbody.innerHTML='';tfoot.innerHTML='';return;}
  if(!cur.works.length||!cur.students.length){
    thead.innerHTML='';tfoot.innerHTML='';
    tbody.innerHTML='<tr><td class="muted" style="padding:20px">'+
      (cur.works.length?'':'เพิ่ม “งาน” ')+(!cur.works.length&&!cur.students.length?'และ':'')+
      (cur.students.length?'':'“นักเรียน” ')+'ที่แท็บ ⚙️ ก่อน</td></tr>';
    return;
  }
  var h='<tr><th class="no">เลขที่</th><th class="nm">ชื่อ-สกุล</th>';
  visibleWorks().forEach(function(w){
    var ex=w.type==='สอบ';
    h+='<th class="'+(ex?'exam':'')+'">'+escapeHtml(w.name)+'<br><span class="'+(ex?'tag-exam':'tag-send')+'">'+(ex?'สอบ /'+(w.max||0):'งานส่ง')+'</span></th>';
  });
  h+='<th>ค้างส่ง</th></tr>'; thead.innerHTML=h;
  var fragment=document.createDocumentFragment();
  cur.students.forEach(function(s){
    var tr=document.createElement('tr');tr.dataset.student=s.id;tr.dataset.search=(s.no+' '+s.name).toLowerCase();
    var html='<td class="no">'+escapeHtml(s.no||'')+'</td><td class="nm">'+escapeHtml(s.name||'')+'</td>';
    visibleWorks().forEach(function(w){
      if(w.type==='สอบ'){
        var sc=val(s.id,w.id); sc=(sc==null?'':sc);
        html+='<td class="examcell"><input aria-label="'+escapeHtml(s.name+' · '+w.name)+'" inputmode="decimal" type="number" min="0" max="'+(w.max||999)+'" value="'+sc+'" data-s="'+s.id+'" data-w="'+w.id+'"></td>';
      } else {
        var sent=isSent(s.id,w.id);
        html+='<td class="cell '+(sent?'s-send':'s-miss')+'" data-s="'+s.id+'" data-w="'+w.id+'">'+(sent?'ส่ง':'–')+'</td>';
      }
    });
    var p=pendingCount(s.id);
    html+='<td class="'+(p?'pend':'pend0')+'" data-pend="'+s.id+'">'+p+'</td>';
    tr.innerHTML=html; fragment.appendChild(tr);
  });
  tbody.replaceChildren(fragment);
  renderFooter(); filterStudentRows();
}
/* แถวสรุปท้ายตาราง: สรุปรายงาน (คอลัมน์) ว่าส่งกี่คน/เฉลี่ยเท่าไร */
function renderFooter(){
  var tfoot=document.querySelector('#grid tfoot');
  if(!cur||!cur.works.length||!cur.students.length){tfoot.innerHTML='';return;}
  var n=cur.students.length;
  var h='<tr><th class="no"></th><th class="nm">📊 สรุปรายงาน</th>';
  visibleWorks().forEach(function(w){
    if(w.type==='สอบ'){
      var sum=0,cnt=0;
      cur.students.forEach(function(s){var v=val(s.id,w.id); if(v!==''&&v!=null&&!isNaN(v)){sum+=Number(v);cnt++;}});
      var avg=cnt?Math.round(sum/cnt*100)/100:0;
      h+='<th class="ft-exam"><span class="ft-pct">'+avg+'</span>/'+(w.max||0)+
         '<br><span class="ft-sub">กรอก '+cnt+'/'+n+'</span>'+
         '<br><span class="ft-rpt" data-rptw="'+w.id+'">📤 ผลสอบ/LINE</span></th>';
    } else {
      var c=0; cur.students.forEach(function(s){if(isSent(s.id,w.id))c++;});
      var pct=n?Math.round(c/n*100):0;
      var miss=n-c;
      h+='<th><span class="ft-pct">'+c+'/'+n+'</span> ('+pct+'%)'+
         '<br><span class="ft-sub">ค้าง '+miss+' คน</span>'+
         '<br><span class="ft-rpt" data-rptw="'+w.id+'">📤 ตามงาน/LINE</span></th>';
    }
  });
  // คอลัมน์ค้างส่งรวม
  var totPend=0; cur.students.forEach(function(s){totPend+=pendingCount(s.id);});
  h+='<th><span class="ft-pct" style="color:'+(totPend?'var(--miss)':'var(--green)')+'">'+totPend+'</span><br><span class="ft-sub">ค้างรวม</span></th></tr>';
  tfoot.innerHTML=h;
}
/* คลิกช่องงานส่ง */
document.querySelector('#grid').addEventListener('click',function(e){
  var c=e.target; if(!c.classList.contains('cell'))return;
  if(!unlocked){promptUnlock();return;}
  var sid=c.getAttribute('data-s'), wid=c.getAttribute('data-w');
  var sent=!isSent(sid,wid); setVal(sid,wid,sent);
  c.className='cell '+(sent?'s-send':'s-miss'); c.textContent=sent?'ส่ง':'–';
  var p=pendingCount(sid); var pe=document.querySelector('[data-pend="'+sid+'"]');
  if(pe){pe.textContent=p;pe.className=p?'pend':'pend0';}
  renderFooter(); updateGradeMetrics(); filterStudentRows(); save();
});
/* คลิกลิงก์รายงานในแถวสรุปท้ายตาราง */
document.querySelector('#grid').addEventListener('click',function(e){
  var w=e.target.getAttribute('data-rptw'); if(w)openWorkReport(w);
});
/* กรอกคะแนนข้อสอบ */
document.querySelector('#grid').addEventListener('input',function(e){
  var t=e.target; var sid=t.getAttribute('data-s'), wid=t.getAttribute('data-w');
  if(!sid||!wid||t.type!=='number')return;
  if(!unlocked){t.value=val(sid,wid)==null?'':val(sid,wid);promptUnlock();return;}
  var work=cur.works.find(function(w){return w.id===wid;});
  var score=t.value===''?'':Number(t.value);
  if(t.validity.badInput || (score!=='' && (!Number.isFinite(score)||score<0||(work&&Number(work.max)>0&&score>Number(work.max))))){t.setCustomValidity('คะแนนต้องอยู่ระหว่าง 0 ถึงคะแนนเต็ม');t.reportValidity();return;}
  t.setCustomValidity('');setVal(sid,wid,score); save();
  clearTimeout(footerTimer);footerTimer=setTimeout(function(){renderFooter();updateGradeMetrics();},150);
});

/* ===== จัดการงาน ===== */
function toggleMax(){ document.getElementById('maxWrap').style.display =
  document.getElementById('newWorkType').value==='สอบ'?'':'none'; }
document.getElementById('newWorkType').onchange=toggleMax;
function renderWorks(){
  var box=document.getElementById('workList'); box.innerHTML='';
  if(!cur){box.innerHTML='<div class="muted">เปิดห้องก่อน</div>';return;}
  if(!cur.works.length){box.innerHTML='<div class="muted">ยังไม่มีงาน</div>';return;}
  cur.works.forEach(function(w,i){
    var d=document.createElement('div'); d.className='work-row';
    d.innerHTML='<span class="'+(w.type==='สอบ'?'tag-exam':'tag-send')+'">'+(w.type==='สอบ'?'สอบ':'งานส่ง')+'</span>'+
      '<input value="'+escapeHtml(w.name)+'" data-i="'+i+'" data-f="name" style="flex:2;min-width:160px">'+
      (w.type==='สอบ'?'<input type="number" min="0" value="'+(w.max||0)+'" data-i="'+i+'" data-f="max" title="คะแนนเต็ม" style="width:90px">':'')+
      '<button class="ghost small" data-rptw2="'+escapeHtml(w.id)+'">📤 รายงาน/LINE</button>'+
      '<button class="danger small" data-delw="'+i+'">✕</button>';
    box.appendChild(d);
  });
}
document.getElementById('workList').addEventListener('input',function(e){
  var i=e.target.getAttribute('data-i'); if(i==null)return;
  var f=e.target.getAttribute('data-f');
  cur.works[Number(i)][f]= f==='max'?Number(e.target.value):e.target.value;
  if(f==='name'||f==='max')renderGrid();
  save();
});
document.getElementById('workList').addEventListener('click',function(e){
  var r=e.target.getAttribute('data-rptw2'); if(r){openWorkReport(r);return;}
  var d=e.target.getAttribute('data-delw'); if(d==null)return;
  if(confirm('ลบงานนี้? (คะแนน/สถานะของงานนี้จะหายไป)')){
    var w=cur.works[Number(d)];
    Object.keys(cur.data).forEach(function(sid){ if(cur.data[sid]) delete cur.data[sid][w.id]; });
    cur.works.splice(Number(d),1); renderWorks(); renderGrid(); updateLabel(); save();
  }
});
document.getElementById('btnAddWork').onclick=function(){
  if(!cur){alert('เปิดห้องก่อน');return;}
  var name=document.getElementById('newWorkName').value.trim();
  var type=document.getElementById('newWorkType').value;
  var max=Number(document.getElementById('newWorkMax').value)||0;
  if(!name){alert('ใส่ชื่องาน');return;}
  var w={id:uid('w'),name:name,type:type}; if(type==='สอบ')w.max=max;
  cur.works.push(w);
  document.getElementById('newWorkName').value='';
  renderWorks(); renderGrid(); updateLabel(); save();
};

/* ===== จัดการนักเรียน ===== */
function renderStudents(){
  var thead=document.querySelector('#stuTable thead'), tbody=document.querySelector('#stuTable tbody');
  document.getElementById('stuCount').textContent=(cur?cur.students.length:0)+' คน';
  // เติมเมนูคัดลอกรายชื่อจากชุดอื่นที่มีนักเรียน
  var cf=document.getElementById('copyFrom');
  if(cf){
    var opts='<option value="">📥 คัดลอกรายชื่อจากห้อง/วิชาอื่น…</option>';
    Object.keys(DB.sets).forEach(function(k){
      var s=DB.sets[k]; if(k!==curKey && s.students.length)
        opts+='<option value="'+escapeHtml(k)+'">'+escapeHtml(s.room+' · '+s.subject)+' ('+s.students.length+' คน)</option>';
    });
    cf.innerHTML=opts;
  }
  if(!cur||!cur.students.length){thead.innerHTML='';tbody.innerHTML='<tr><td class="muted" style="padding:14px">ยังไม่มีนักเรียน</td></tr>';return;}
  thead.innerHTML='<tr><th style="width:60px">เลขที่</th><th style="text-align:left">ชื่อ-สกุล</th><th style="width:50px"></th></tr>';
  tbody.innerHTML='';
  cur.students.forEach(function(s,i){
    var tr=document.createElement('tr');
    tr.innerHTML='<td><input value="'+escapeHtml(s.no||'')+'" data-i="'+i+'" data-f="no" style="width:54px;text-align:center"></td>'+
      '<td><input value="'+escapeHtml(s.name||'')+'" data-i="'+i+'" data-f="name" style="text-align:left"></td>'+
      '<td><button class="danger small" data-dels="'+i+'">✕</button></td>';
    tbody.appendChild(tr);
  });
}
document.getElementById('stuTable').addEventListener('input',function(e){
  var i=e.target.getAttribute('data-i'); if(i==null)return;
  cur.students[Number(i)][e.target.getAttribute('data-f')]=e.target.value; save();
});
document.getElementById('stuTable').addEventListener('click',function(e){
  var d=e.target.getAttribute('data-dels'); if(d==null)return;
  if(confirm('ลบนักเรียนคนนี้?')){
    var s=cur.students[Number(d)]; delete cur.data[s.id];
    cur.students.splice(Number(d),1); renderStudents(); renderGrid(); updateLabel(); save();
  }
});
document.getElementById('copyFrom').onchange=function(){
  var k=this.value; this.value='';
  if(!k||!cur||!DB.sets[k])return;
  var src=DB.sets[k];
  if(cur.students.length && !confirm('แทนรายชื่อเดิม '+cur.students.length+' คน ด้วยรายชื่อจาก '+src.room+' · '+src.subject+' ('+src.students.length+' คน)?'))return;
  cur.students=src.students.map(function(s){return {id:uid('s'),no:s.no,name:s.name};});
  renderStudents(); renderGrid(); updateLabel(); save();
};
document.getElementById('btnRoster').onclick=async function(){
  await ensureWorkRoster();
  if(!cur){alert('เปิดห้องก่อน');return;}
  var list=(ROSTER[cur.room]||[]).map(function(s){return {id:uid('s'),no:s.no,name:s.name};});
  if(!list.length){alert('ไม่พบทะเบียนของห้อง '+cur.room+'\n(ห้องนี้ไม่มีในไฟล์รายชื่อ)');return;}
  if(cur.students.length && !confirm('แทนรายชื่อเดิม '+cur.students.length+' คน ด้วยทะเบียนห้อง '+cur.room+' ('+list.length+' คน)?'))return;
  cur.students=list; renderStudents(); renderGrid(); updateLabel(); save();
};
document.getElementById('btnAddStudent').onclick=function(){
  if(!cur){alert('เปิดห้องก่อน');return;}
  cur.students.push({id:uid('s'),no:cur.students.length+1,name:''}); renderStudents(); renderGrid(); updateLabel(); save();
};

/* ===== นำเข้ารายชื่อจากไฟล์ Excel/CSV ===== */
function parseCSV(text){
  text=text.replace(/^﻿/,''); var rows=[],row=[],cur='',q=false;
  for(var i=0;i<text.length;i++){var c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){cur+='"';i++;} else q=false; } else cur+=c; }
    else { if(c==='"')q=true; else if(c===','){row.push(cur);cur='';}
      else if(c==='\n'){row.push(cur);rows.push(row);row=[];cur='';}
      else if(c==='\r'){} else cur+=c; }
  }
  if(cur!==''||row.length){row.push(cur);rows.push(row);}
  return rows;
}
function rowsToStudents(rows){
  var out=[];
  rows.forEach(function(r){
    if(!r)return;
    var cells=r.map(function(c){return (c==null?'':String(c)).trim();});
    if(!cells.join('').length)return;
    var joined=cells.join(' ');
    // ข้ามแถวหัวตาราง (มีคำว่าหัวคอลัมน์ แต่ไม่ใช่ชื่อคน)
    if(/(ชื่อ|เลขที่|ลำดับ|รายชื่อ|ที่|name)/i.test(joined) && !/(เด็ก|นาย|นางสาว|นาง|ด\.ช|ด\.ญ)/.test(joined)) return;
    var no='',rest=[];
    cells.forEach(function(c){ if(no===''&&/^\d{1,3}$/.test(c)) no=c; else if(c) rest.push(c); });
    var name=rest.join(' ').replace(/\s+/g,' ').trim();
    if(!name)return;
    out.push({id:uid('s'),no:no||(out.length+1),name:name});
  });
  return out;
}
function applyImport(rows){
  var studs=rowsToStudents(rows);
  if(!studs.length){alert('อ่านรายชื่อจากไฟล์ไม่ได้ — ตรวจว่ามีคอลัมน์ชื่อ-สกุล');return;}
  if(cur.students.length && !confirm('พบ '+studs.length+' คนในไฟล์ — แทนรายชื่อเดิม '+cur.students.length+' คน?'))return;
  cur.students=studs; renderStudents(); renderGrid(); updateLabel(); save();
  alert('นำเข้า '+studs.length+' คน สำเร็จ');
}
function loadXLSX(cb){ if(window.XLSX)return cb();
  var s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  s.onload=cb; s.onerror=function(){alert('โหลดตัวอ่าน Excel ไม่ได้ (ตรวจอินเทอร์เน็ต) — ลองบันทึกไฟล์เป็น .csv แล้วนำเข้าแทน');};
  document.head.appendChild(s);
}
document.getElementById('btnFile').onclick=function(){ if(!cur){alert('เปิดห้องก่อน');return;} document.getElementById('rosterFile').click(); };
document.getElementById('rosterFile').onchange=function(e){
  var f=e.target.files[0]; if(!f)return; var nm=f.name.toLowerCase();
  if(/\.(xlsx|xls)$/.test(nm)){
    loadXLSX(function(){
      var r=new FileReader();
      r.onload=function(){
        try{ var wb=XLSX.read(new Uint8Array(r.result),{type:'array'});
          var ws=wb.Sheets[wb.SheetNames[0]];
          applyImport(XLSX.utils.sheet_to_json(ws,{header:1,defval:''}));
        }catch(err){alert('อ่านไฟล์ Excel ไม่สำเร็จ');}
      };
      r.readAsArrayBuffer(f);
    });
  } else {
    var r=new FileReader(); r.onload=function(){ applyImport(parseCSV(r.result)); }; r.readAsText(f);
  }
  e.target.value='';
};
var importDlg=document.getElementById('importDlg');
document.getElementById('btnImport').onclick=function(){ if(!cur){alert('เปิดห้องก่อน');return;} importDlg.showModal(); };
document.getElementById('iCancel').onclick=function(){importDlg.close();};
document.getElementById('iOk').onclick=function(){
  var txt=document.getElementById('importText').value.trim();
  if(txt){ txt.split('\n').forEach(function(line){
    line=line.trim(); if(!line)return;
    var parts=line.split(/[\t,]/); var no,name;
    if(parts.length>=2){no=parts[0].trim();name=parts.slice(1).join(',').trim();}
    else{no=cur.students.length+1;name=parts[0].trim();}
    cur.students.push({id:uid('s'),no:no,name:name});
  }); }
  document.getElementById('importText').value=''; importDlg.close();
  renderStudents(); renderGrid(); updateLabel(); save();
};

/* ===== สำรอง/กู้คืน ===== */
document.getElementById('btnBackup').onclick=function(){
  var blob=new Blob([JSON.stringify(DB)],{type:'application/json'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='สำรองข้อมูลติดตามงาน_'+new Date().toISOString().slice(0,10)+'.json'; a.click();
};
document.getElementById('btnRestore').onclick=function(){document.getElementById('restoreFile').click();};
document.getElementById('restoreFile').onchange=function(e){
  var f=e.target.files[0]; if(!f)return;
  var r=new FileReader();
  r.onload=function(){
    try{ var d=JSON.parse(r.result); if(!d.sets)throw 0;
      if(!confirm('กู้คืนข้อมูลจากไฟล์? ข้อมูลปัจจุบันจะถูกทับ'))return;
      DB=d; curKey=null; cur=null; save(); renderSetBar();
      document.querySelector('#grid thead').innerHTML=''; document.querySelector('#grid tbody').innerHTML='';
      document.getElementById('curLabel').textContent='— ยังไม่ได้เลือกห้อง —';
      alert('กู้คืนสำเร็จ');
    }catch(err){ alert('ไฟล์ไม่ถูกต้อง'); }
  };
  r.readAsText(f); e.target.value='';
};

/* ===== สรุป ===== */
function renderSummary(){
  document.getElementById('sumLabel').textContent=cur?('— '+cur.room+' · '+cur.subject):'';
  var grid=document.getElementById('statGrid'),bars=document.getElementById('workBars'),miss=document.getElementById('missList');
  if(!cur||!cur.students.length||!cur.works.length){
    grid.innerHTML='<div class="muted">ยังไม่มีข้อมูล</div>';bars.innerHTML='';miss.innerHTML='';return;
  }
  var sendWorks=cur.works.filter(function(w){return w.type==='ส่ง';});
  var examWorks=cur.works.filter(function(w){return w.type==='สอบ';});
  var nStu=cur.students.length;
  var cells=nStu*sendWorks.length, sent=0;
  cur.students.forEach(function(s){sendWorks.forEach(function(w){if(isSent(s.id,w.id))sent++;});});
  var rate=cells?Math.round(sent/cells*100):0;
  grid.innerHTML=stat(nStu,'นักเรียน')+stat(sendWorks.length,'งานส่ง')+stat(examWorks.length,'ข้อสอบ')+
    stat((cells?sent:0)+'/'+cells,'ส่งแล้ว')+stat(rate+'%','อัตราส่งรวม');
  // bars งานส่ง
  bars.innerHTML = sendWorks.length ? sendWorks.map(function(w){
    var c=0; cur.students.forEach(function(s){if(isSent(s.id,w.id))c++;});
    var pct=nStu?Math.round(c/nStu*100):0;
    return '<div class="barline"><div class="nm">'+escapeHtml(w.name)+'</div><div class="barbg">'+
      '<div class="barfill" style="width:'+pct+'%"></div></div><div style="width:96px;font-size:13px">'+c+'/'+nStu+' ('+pct+'%)</div></div>';
  }).join('') : '<div class="muted">ไม่มีงานส่ง</div>';
  // ค่าเฉลี่ยข้อสอบ
  if(examWorks.length){
    bars.innerHTML+='<div style="margin-top:14px;font-weight:700;color:var(--exam)">ค่าเฉลี่ยข้อสอบ</div>';
    bars.innerHTML+=examWorks.map(function(w){
      var sum=0,cnt=0; cur.students.forEach(function(s){var v=val(s.id,w.id); if(v!==''&&v!=null&&!isNaN(v)){sum+=Number(v);cnt++;}});
      var avg=cnt?(sum/cnt):0;
      return '<div class="barline"><div class="nm">'+escapeHtml(w.name)+'</div>'+
        '<div style="flex:1;font-size:13px">เฉลี่ย '+(Math.round(avg*100)/100)+' / '+(w.max||0)+' (กรอกแล้ว '+cnt+'/'+nStu+' คน)</div></div>';
    }).join('');
  }
  // ค้างส่ง
  var rows=cur.students.map(function(s){
    var pend=sendWorks.filter(function(w){return !isSent(s.id,w.id);});
    return {s:s,pend:pend};
  }).filter(function(x){return x.pend.length>0;}).sort(function(a,b){return b.pend.length-a.pend.length;});
  miss.innerHTML = rows.length ? '<ul class="miss-list">'+rows.map(function(x){
    return '<li><b>'+escapeHtml(x.s.no)+'. '+escapeHtml(x.s.name)+'</b> — ค้าง '+x.pend.length+' ชิ้น: '+
      x.pend.map(function(w){return escapeHtml(w.name);}).join(', ')+'</li>';
  }).join('')+'</ul>' : '<div class="ok" style="font-weight:600">🎉 ส่งงานครบทุกคน!</div>';
}
function stat(n,c){return '<div class="stat"><div class="num">'+n+'</div><div class="cap">'+c+'</div></div>';}

/* ===== ส่งรูปสรุปเข้า LINE ===== */
var TH_M=['','มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
function thaiDate(d){return d.getDate()+' '+TH_M[d.getMonth()+1]+' '+(d.getFullYear()+543);}
var reportTitleEl=document.getElementById('reportTitle');
reportTitleEl.value=localStorage.getItem('hwReportTitle_' + activeWorkspace)||'';
reportTitleEl.addEventListener('input',function(){localStorage.setItem('hwReportTitle_' + activeWorkspace,reportTitleEl.value);});
function statBox(num,cap,color){
  return '<div style="flex:1;background:#fff;border:1px solid #e2e0d4;border-radius:11px;padding:12px 8px;text-align:center">'+
    '<div style="font-size:25px;font-weight:800;color:'+color+'">'+num+'</div>'+
    '<div style="font-size:12px;color:#6b7770;margin-top:2px">'+cap+'</div></div>';
}
function buildReportHtml(){
  var sendWorks=cur.works.filter(function(w){return w.type==='ส่ง';});
  var nStu=cur.students.length, cells=nStu*sendWorks.length, sent=0;
  cur.students.forEach(function(s){sendWorks.forEach(function(w){if(isSent(s.id,w.id))sent++;});});
  var rate=cells?Math.round(sent/cells*100):0;
  var rc=rate>=80?'#1f6f3e':rate>=60?'#e0a800':'#c0392b';
  var rows=cur.students.map(function(s){
    var pend=sendWorks.filter(function(w){return !isSent(s.id,w.id);});return {s:s,pend:pend};
  }).filter(function(x){return x.pend.length>0;}).sort(function(a,b){return b.pend.length-a.pend.length;});
  var pendHtml=rows.length
    ? '<table style="width:100%;border-collapse:collapse;font-size:15px"><tr style="background:#2c4a39;color:#f4f1e6">'+
      '<th style="padding:8px;border:1px solid #cfd8d2">เลขที่</th><th style="padding:8px;text-align:left;border:1px solid #cfd8d2">ชื่อ-สกุล</th>'+
      '<th style="padding:8px;border:1px solid #cfd8d2">ค้าง</th><th style="padding:8px;text-align:left;border:1px solid #cfd8d2">งานที่ค้าง</th></tr>'+
      rows.map(function(x){return '<tr><td style="padding:7px;border:1px solid #e2e0d4;text-align:center">'+escapeHtml(x.s.no||'')+'</td>'+
        '<td style="padding:7px;border:1px solid #e2e0d4">'+escapeHtml(x.s.name||'')+'</td>'+
        '<td style="padding:7px;border:1px solid #e2e0d4;text-align:center;color:#c0392b;font-weight:700">'+x.pend.length+'</td>'+
        '<td style="padding:7px;border:1px solid #e2e0d4;color:#555">'+x.pend.map(function(w){return escapeHtml(w.name);}).join(', ')+'</td></tr>';}).join('')+'</table>'
    : '<div style="padding:18px;background:#e8f3ec;color:#1f6f3e;border-radius:10px;text-align:center;font-weight:700;font-size:18px">🎉 ส่งงานครบทุกคน!</div>';
  var title=(reportTitleEl.value||'').trim();
  return '<div style="width:720px;box-sizing:border-box;background:#fffdf7;font-family:Sarabun,sans-serif;color:#26302a;border-radius:14px;overflow:hidden">'+
    '<div style="background:#2c4a39;color:#f4f1e6;padding:20px 26px"><div style="font-size:24px;font-weight:700">📦 รายงานการส่งงาน</div>'+
    (title?'<div style="font-size:17px;margin-top:2px;opacity:.92">'+escapeHtml(title)+'</div>':'')+
    '<div style="font-size:16px;margin-top:4px;opacity:.92">'+escapeHtml(cur.room)+' · '+escapeHtml(cur.subject)+'</div>'+
    '<div style="font-size:14px;margin-top:2px;opacity:.8">ณ วันที่ '+thaiDate(new Date())+'</div></div>'+
    '<div style="padding:18px 26px 22px"><div style="display:flex;gap:10px;margin-bottom:16px">'+
      statBox(nStu,'นักเรียน','#2c4a39')+statBox(sendWorks.length,'งานส่ง','#2c4a39')+
      statBox(sent+'/'+cells,'ส่งแล้ว','#1f6f3e')+statBox(rate+'%','อัตราส่งรวม',rc)+'</div>'+
      '<div style="font-size:17px;font-weight:700;margin:6px 0 10px;color:#0f3d20">นักเรียนที่ค้างส่งงาน ('+rows.length+' คน)</div>'+pendHtml+
      '<div style="margin-top:16px;font-size:12px;color:#8a948e;text-align:right">ระบบติดตามงาน • '+thaiDate(new Date())+'</div></div></div>';
}
function loadH2C(cb){ if(window.html2canvas)return cb();
  var s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  s.onload=cb; s.onerror=function(){alert('โหลด html2canvas ไม่ได้ (ตรวจอินเทอร์เน็ต)');}; document.head.appendChild(s);
}
document.getElementById('btnLine').onclick=function(){
  if(!cur||!cur.students.length||!cur.works.length){alert('ยังไม่มีข้อมูล');return;}
  loadH2C(function(){
    var holder=document.createElement('div'); holder.style.cssText='position:fixed;left:-10000px;top:0';
    holder.innerHTML=buildReportHtml(); document.body.appendChild(holder);
    window.html2canvas(holder.firstChild,{scale:2,backgroundColor:'#fffdf7'}).then(function(canvas){
      document.body.removeChild(holder);
      canvas.toBlob(function(blob){
        var fname=(cur.room+'_'+cur.subject+'_ส่งงาน.png').replace(/\s+/g,'');
        var file=new File([blob],fname,{type:'image/png'});
        if(navigator.canShare&&navigator.canShare({files:[file]})){
          navigator.share({files:[file],title:'รายงานการส่งงาน'}).catch(function(){});
        } else { var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fname;a.click(); }
      },'image/png');
    }).catch(function(){ if(holder.parentNode)document.body.removeChild(holder); alert('สร้างรูปไม่สำเร็จ'); });
  });
};

/* ===== สรุปรวมทุกห้อง ===== */
// คำนวณสถิติของชุด (ห้อง/วิชา) ใด ๆ
function setStats(s){
  var data=s.data||{};
  var sendWorks=(s.works||[]).filter(function(w){return w.type==='ส่ง';});
  var examWorks=(s.works||[]).filter(function(w){return w.type==='สอบ';});
  var nStu=(s.students||[]).length;
  var cells=nStu*sendWorks.length, sent=0;
  (s.students||[]).forEach(function(st){ sendWorks.forEach(function(w){
    if(data[st.id] && data[st.id][w.id]===true) sent++; }); });
  var rate=cells?Math.round(sent/cells*100):0;
  return {sendWorks:sendWorks,examWorks:examWorks,nStu:nStu,cells:cells,sent:sent,rate:rate,data:data};
}
function renderAll(){
  var keys=Object.keys(DB.sets);
  var sg=document.getElementById('allStatGrid'),
      rl=document.getElementById('allRoomList'),
      ml=document.getElementById('allMissList');
  if(!keys.length){ sg.innerHTML='<div class="muted">ยังไม่มีห้อง/วิชา</div>'; rl.innerHTML=''; ml.innerHTML=''; return; }
  var totStu=0,totSend=0,totExam=0,totCells=0,totSent=0;
  keys.forEach(function(k){ var st=setStats(DB.sets[k]);
    totStu+=st.nStu; totSend+=st.sendWorks.length; totExam+=st.examWorks.length;
    totCells+=st.cells; totSent+=st.sent; });
  var rate=totCells?Math.round(totSent/totCells*100):0;
  sg.innerHTML=stat(keys.length,'ห้อง/วิชา')+stat(totStu,'นักเรียนรวม')+stat(totSend,'งานส่ง')+
    stat(totExam,'ข้อสอบ')+stat(totSent+'/'+totCells,'ส่งแล้ว')+stat(rate+'%','อัตราส่งรวม');
  // รายห้อง
  rl.innerHTML=keys.map(function(k){
    var s=DB.sets[k], st=setStats(s);
    var workChips=(s.works||[]).map(function(w){
      if(w.type==='สอบ'){
        var sum=0,cnt=0; (s.students||[]).forEach(function(stu){var v=st.data[stu.id]?st.data[stu.id][w.id]:undefined; if(v!==''&&v!=null&&!isNaN(v)){sum+=Number(v);cnt++;}});
        var avg=cnt?Math.round(sum/cnt*100)/100:0;
        return '<span class="chip" style="cursor:default"><span class="tag-exam">สอบ</span> '+escapeHtml(w.name)+' <small>เฉลี่ย '+avg+'/'+(w.max||0)+'</small></span>';
      }
      var c=0; (s.students||[]).forEach(function(stu){if(st.data[stu.id]&&st.data[stu.id][w.id]===true)c++;});
      var pct=st.nStu?Math.round(c/st.nStu*100):0;
      return '<span class="chip" style="cursor:default"><span class="tag-send">ส่ง</span> '+escapeHtml(w.name)+' <small>'+c+'/'+st.nStu+' ('+pct+'%)</small></span>';
    }).join('');
    var rc=st.rate>=80?'var(--green)':st.rate>=60?'#e0a800':'var(--miss)';
    return '<div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px dashed var(--line)">'+
      '<div style="font-weight:700;color:var(--green-d);font-size:16px;margin-bottom:6px">📚 '+escapeHtml(s.room)+' · '+escapeHtml(s.subject)+
      ' <span class="muted" style="font-weight:400">— '+st.nStu+' คน · อัตราส่ง <b style="color:'+rc+'">'+st.rate+'%</b></span></div>'+
      (workChips? '<div class="sets" style="gap:6px">'+workChips+'</div>' : '<div class="muted">ยังไม่มีงาน</div>')+'</div>';
  }).join('');
  // คนค้างส่งรวมทุกห้อง
  var allRows=[];
  keys.forEach(function(k){
    var s=DB.sets[k], st=setStats(s);
    (s.students||[]).forEach(function(stu){
      var pend=st.sendWorks.filter(function(w){return !(st.data[stu.id]&&st.data[stu.id][w.id]===true);});
      if(pend.length) allRows.push({room:s.room,subject:s.subject,stu:stu,pend:pend});
    });
  });
  allRows.sort(function(a,b){return b.pend.length-a.pend.length;});
  ml.innerHTML=allRows.length? '<ul class="miss-list">'+allRows.map(function(x){
    return '<li><b>'+escapeHtml(x.stu.no)+'. '+escapeHtml(x.stu.name)+'</b> <span class="muted">['+escapeHtml(x.room)+' · '+escapeHtml(x.subject)+']</span> — ค้าง '+x.pend.length+' ชิ้น: '+
      x.pend.map(function(w){return escapeHtml(w.name);}).join(', ')+'</li>';
  }).join('')+'</ul>' : '<div class="ok" style="font-weight:600">🎉 ทุกห้องส่งงานครบ!</div>';
}

/* ===== Export Excel ทั้งหมด ===== */
function sheetName(used,raw){
  var nm=String(raw||'ห้อง').replace(/[:\\\/?*\[\]]/g,' ').trim().slice(0,28)||'ห้อง';
  var base=nm,i=2; while(used[nm]){nm=base.slice(0,25)+' ('+i+')';i++;} used[nm]=1; return nm;
}
document.getElementById('btnExportXLSX').onclick=function(){
  var keys=Object.keys(DB.sets);
  if(!keys.length){alert('ยังไม่มีห้อง/วิชาให้ส่งออก');return;}
  loadXLSX(function(){
    try{
      var wb=XLSX.utils.book_new(), used={};
      // ชีตสรุปรวม
      var sum=[['สรุปรวมทุกห้อง — ระบบติดตามงาน'],['วันที่',thaiDate(new Date())],[],
        ['ห้อง','รายวิชา','นักเรียน','งานส่ง','ข้อสอบ','ส่งแล้ว','รวมช่อง','อัตราส่ง(%)']];
      keys.forEach(function(k){var s=DB.sets[k],st=setStats(s);
        sum.push([s.room,s.subject,st.nStu,st.sendWorks.length,st.examWorks.length,st.sent,st.cells,st.rate]);});
      var wsSum=XLSX.utils.aoa_to_sheet(sum);
      wsSum['!cols']=[{wch:12},{wch:20},{wch:9},{wch:8},{wch:8},{wch:9},{wch:9},{wch:11}];
      XLSX.utils.book_append_sheet(wb,wsSum,'สรุปรวม');
      // ชีตรายห้อง
      keys.forEach(function(k){
        var s=DB.sets[k], st=setStats(s), works=s.works||[];
        var head=['เลขที่','ชื่อ-สกุล'];
        works.forEach(function(w){head.push(w.name+(w.type==='สอบ'?' (สอบ/'+(w.max||0)+')':' (ส่ง)'));});
        head.push('ค้างส่ง');
        var aoa=[[s.room+' · '+s.subject],['อัตราส่งรวม '+st.rate+'%  ·  '+st.sent+'/'+st.cells+' ช่อง  ·  '+thaiDate(new Date())],[],head];
        (s.students||[]).forEach(function(stu){
          var row=[stu.no,stu.name], pend=0;
          works.forEach(function(w){
            var v=st.data[stu.id]?st.data[stu.id][w.id]:undefined;
            if(w.type==='สอบ'){ row.push(v===''||v==null||isNaN(v)?'':Number(v)); }
            else { var sent=(v===true); row.push(sent?'ส่ง':'ไม่ส่ง'); if(!sent)pend++; }
          });
          row.push(pend);
          aoa.push(row);
        });
        // แถวสรุปท้าย
        var foot=['','📊 สรุปรายงาน'];
        works.forEach(function(w){
          if(w.type==='สอบ'){var sm=0,cn=0;(s.students||[]).forEach(function(stu){var v=st.data[stu.id]?st.data[stu.id][w.id]:undefined;if(v!==''&&v!=null&&!isNaN(v)){sm+=Number(v);cn++;}});foot.push('เฉลี่ย '+(cn?Math.round(sm/cn*100)/100:0)+'/'+(w.max||0));}
          else{var c=0;(s.students||[]).forEach(function(stu){if(st.data[stu.id]&&st.data[stu.id][w.id]===true)c++;});foot.push('ส่ง '+c+'/'+st.nStu);}
        });
        var totPend=0;(s.students||[]).forEach(function(stu){st.sendWorks.forEach(function(w){if(!(st.data[stu.id]&&st.data[stu.id][w.id]===true))totPend++;});});
        foot.push(totPend);
        aoa.push(foot);
        var ws=XLSX.utils.aoa_to_sheet(aoa);
        ws['!cols']=[{wch:7},{wch:24}].concat(works.map(function(){return {wch:14};})).concat([{wch:9}]);
        XLSX.utils.book_append_sheet(wb,ws,sheetName(used,s.room+' '+s.subject));
      });
      XLSX.writeFile(wb,'ติดตามงานทั้งหมด_'+new Date().toISOString().slice(0,10)+'.xlsx');
    }catch(err){alert('สร้างไฟล์ Excel ไม่สำเร็จ: '+err);}
  });
};

/* ส่งรูปสรุปรวมเข้า LINE */
document.getElementById('btnLineAll').onclick=function(){
  var keys=Object.keys(DB.sets);
  if(!keys.length){alert('ยังไม่มีข้อมูล');return;}
  loadH2C(function(){
    var holder=document.createElement('div'); holder.style.cssText='position:fixed;left:-10000px;top:0';
    holder.innerHTML=buildAllReportHtml(); document.body.appendChild(holder);
    window.html2canvas(holder.firstChild,{scale:2,backgroundColor:'#fffdf7'}).then(function(canvas){
      document.body.removeChild(holder);
      canvas.toBlob(function(blob){
        var fname='สรุปรวมทุกห้อง_ส่งงาน.png';
        var file=new File([blob],fname,{type:'image/png'});
        if(navigator.canShare&&navigator.canShare({files:[file]})){
          navigator.share({files:[file],title:'สรุปรวมการส่งงาน'}).catch(function(){});
        } else { var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fname;a.click(); }
      },'image/png');
    }).catch(function(){ if(holder.parentNode)document.body.removeChild(holder); alert('สร้างรูปไม่สำเร็จ'); });
  });
};
function buildAllReportHtml(){
  var keys=Object.keys(DB.sets);
  var totStu=0,totCells=0,totSent=0;
  var rowsHtml=keys.map(function(k){
    var s=DB.sets[k],st=setStats(s); totStu+=st.nStu;totCells+=st.cells;totSent+=st.sent;
    var rc=st.rate>=80?'#1f6f3e':st.rate>=60?'#e0a800':'#c0392b';
    return '<tr><td style="padding:7px;border:1px solid #e2e0d4">'+escapeHtml(s.room)+'</td>'+
      '<td style="padding:7px;border:1px solid #e2e0d4">'+escapeHtml(s.subject)+'</td>'+
      '<td style="padding:7px;border:1px solid #e2e0d4;text-align:center">'+st.nStu+'</td>'+
      '<td style="padding:7px;border:1px solid #e2e0d4;text-align:center">'+st.sent+'/'+st.cells+'</td>'+
      '<td style="padding:7px;border:1px solid #e2e0d4;text-align:center;font-weight:700;color:'+rc+'">'+st.rate+'%</td></tr>';
  }).join('');
  var rate=totCells?Math.round(totSent/totCells*100):0;
  var rc=rate>=80?'#1f6f3e':rate>=60?'#e0a800':'#c0392b';
  var title=((document.getElementById('reportTitle')||{}).value||'').trim();
  return '<div style="width:720px;box-sizing:border-box;background:#fffdf7;font-family:Sarabun,sans-serif;color:#26302a;border-radius:14px;overflow:hidden">'+
    '<div style="background:#2c4a39;color:#f4f1e6;padding:20px 26px"><div style="font-size:24px;font-weight:700">🗂️ สรุปรวมการส่งงาน (ทุกห้อง)</div>'+
    (title?'<div style="font-size:17px;margin-top:2px;opacity:.92">'+escapeHtml(title)+'</div>':'')+
    '<div style="font-size:14px;margin-top:4px;opacity:.8">ณ วันที่ '+thaiDate(new Date())+'</div></div>'+
    '<div style="padding:18px 26px 22px"><div style="display:flex;gap:10px;margin-bottom:16px">'+
      statBox(keys.length,'ห้อง/วิชา','#2c4a39')+statBox(totStu,'นักเรียนรวม','#2c4a39')+
      statBox(totSent+'/'+totCells,'ส่งแล้ว','#1f6f3e')+statBox(rate+'%','อัตราส่งรวม',rc)+'</div>'+
      '<table style="width:100%;border-collapse:collapse;font-size:15px"><tr style="background:#2c4a39;color:#f4f1e6">'+
      '<th style="padding:8px;border:1px solid #cfd8d2">ห้อง</th><th style="padding:8px;text-align:left;border:1px solid #cfd8d2">รายวิชา</th>'+
      '<th style="padding:8px;border:1px solid #cfd8d2">นักเรียน</th><th style="padding:8px;border:1px solid #cfd8d2">ส่งแล้ว</th>'+
      '<th style="padding:8px;border:1px solid #cfd8d2">อัตราส่ง</th></tr>'+rowsHtml+'</table>'+
      '<div style="margin-top:16px;font-size:12px;color:#8a948e;text-align:right">ระบบติดตามงาน • '+thaiDate(new Date())+'</div></div></div>';
}

/* ===== รายงานรายชิ้นงาน (ตามงาน/ผลสอบ → รูปเข้า LINE) ===== */
var workRptDlg=document.getElementById('workRptDlg');
var curRptWork=null;
function openWorkReport(wid){
  if(!cur){return;}
  var w=null; cur.works.forEach(function(x){if(x.id===wid)w=x;});
  if(!w){return;}
  if(!cur.students.length){alert('ยังไม่มีนักเรียนในห้องนี้');return;}
  curRptWork=w;
  document.getElementById('wrTitle').textContent=(w.type==='สอบ'?'📋 ผลสอบ: ':'📋 ตามงาน: ')+w.name;
  document.getElementById('wrPreview').innerHTML=buildWorkReportHtml(w);
  workRptDlg.showModal();
}
document.getElementById('wrClose').onclick=function(){workRptDlg.close();};
document.getElementById('wrLine').onclick=function(){
  if(!curRptWork)return;
  var w=curRptWork;
  loadH2C(function(){
    var holder=document.createElement('div'); holder.style.cssText='position:fixed;left:-10000px;top:0';
    holder.innerHTML=buildWorkReportHtml(w); document.body.appendChild(holder);
    window.html2canvas(holder.firstChild,{scale:2,backgroundColor:'#fffdf7'}).then(function(canvas){
      document.body.removeChild(holder);
      canvas.toBlob(function(blob){
        var fname=((w.type==='สอบ'?'ผลสอบ_':'ตามงาน_')+w.name+'_'+cur.room+'.png').replace(/\s+/g,'').replace(/[\/\\:*?"<>|]/g,'');
        var file=new File([blob],fname,{type:'image/png'});
        if(navigator.canShare&&navigator.canShare({files:[file]})){
          navigator.share({files:[file],title:(w.type==='สอบ'?'ผลสอบ ':'ตามงาน ')+w.name}).catch(function(){});
        } else { var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fname;a.click(); }
      },'image/png');
    }).catch(function(){ if(holder.parentNode)document.body.removeChild(holder); alert('สร้างรูปไม่สำเร็จ'); });
  });
};
function buildWorkReportHtml(w){
  var title=((reportTitleEl&&reportTitleEl.value)||'').trim();
  var headLabel=w.type==='สอบ'?'📋 รายงานผลสอบ':'📋 รายงานการตามงาน';
  var head='<div style="background:#2c4a39;color:#f4f1e6;padding:20px 26px">'+
    '<div style="font-size:24px;font-weight:700">'+headLabel+'</div>'+
    '<div style="font-size:18px;margin-top:3px;font-weight:600">'+escapeHtml(w.name)+(w.type==='สอบ'?' <span style="opacity:.85;font-size:15px">(เต็ม '+(w.max||0)+' คะแนน)</span>':'')+'</div>'+
    (title?'<div style="font-size:15px;margin-top:2px;opacity:.92">'+escapeHtml(title)+'</div>':'')+
    '<div style="font-size:15px;margin-top:2px;opacity:.92">'+escapeHtml(cur.room)+' · '+escapeHtml(cur.subject)+'</div>'+
    '<div style="font-size:13px;margin-top:2px;opacity:.8">ณ วันที่ '+thaiDate(new Date())+'</div></div>';
  var n=cur.students.length, body='';

  if(w.type==='สอบ'){
    var scored=[],absent=[];
    cur.students.forEach(function(s){
      var v=val(s.id,w.id);
      if(v!==''&&v!=null&&!isNaN(v)) scored.push({s:s,score:Number(v)});
      else absent.push(s);
    });
    var sum=0,max=null,min=null;
    scored.forEach(function(o){sum+=o.score; if(max==null||o.score>max)max=o.score; if(min==null||o.score<min)min=o.score;});
    var avg=scored.length?Math.round(sum/scored.length*100)/100:0;
    var rows=cur.students.map(function(s){
      var v=val(s.id,w.id); var has=(v!==''&&v!=null&&!isNaN(v));
      return '<tr><td style="padding:7px;border:1px solid #e2e0d4;text-align:center">'+escapeHtml(s.no||'')+'</td>'+
        '<td style="padding:7px;border:1px solid #e2e0d4">'+escapeHtml(s.name||'')+'</td>'+
        (has
          ? '<td style="padding:7px;border:1px solid #e2e0d4;text-align:center;font-weight:700">'+Number(v)+' <span style="color:#8a948e;font-weight:400">/ '+(w.max||0)+'</span></td>'
          : '<td style="padding:7px;border:1px solid #e2e0d4;text-align:center;color:#c0392b;font-weight:700">ขาดสอบ</td>')+'</tr>';
    }).join('');
    body='<div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">'+
      statBox(avg+' / '+(w.max||0),'คะแนนเฉลี่ย','#2c4a39')+
      statBox(scored.length?max:'-','สูงสุด','#1f6f3e')+
      statBox(scored.length?min:'-','ต่ำสุด','#8a5a00')+
      statBox(scored.length+'/'+n,'ทำข้อสอบ','#2c4a39')+
      statBox(absent.length,'ขาดสอบ',absent.length?'#c0392b':'#1f6f3e')+'</div>'+
      '<table style="width:100%;border-collapse:collapse;font-size:15px"><tr style="background:#2c4a39;color:#f4f1e6">'+
      '<th style="padding:8px;border:1px solid #cfd8d2;width:60px">เลขที่</th><th style="padding:8px;text-align:left;border:1px solid #cfd8d2">ชื่อ-สกุล</th>'+
      '<th style="padding:8px;border:1px solid #cfd8d2;width:120px">คะแนน</th></tr>'+rows+'</table>'+
      (absent.length? '<div style="margin-top:14px;padding:12px 14px;background:#fceae8;border-radius:10px;font-size:15px">'+
        '<b style="color:#c0392b">ขาดสอบ '+absent.length+' คน:</b> '+absent.map(function(s){return escapeHtml((s.no?s.no+'. ':'')+s.name);}).join(', ')+'</div>' : '');
  } else {
    var sentL=[],missL=[];
    cur.students.forEach(function(s){ (isSent(s.id,w.id)?sentL:missL).push(s); });
    var pct=n?Math.round(sentL.length/n*100):0;
    var rc=pct>=80?'#1f6f3e':pct>=60?'#e0a800':'#c0392b';
    var rows=cur.students.map(function(s){
      var sent=isSent(s.id,w.id);
      return '<tr><td style="padding:7px;border:1px solid #e2e0d4;text-align:center">'+escapeHtml(s.no||'')+'</td>'+
        '<td style="padding:7px;border:1px solid #e2e0d4">'+escapeHtml(s.name||'')+'</td>'+
        (sent
          ? '<td style="padding:7px;border:1px solid #e2e0d4;text-align:center;color:#1f6f3e;font-weight:700">✓ ส่งแล้ว</td>'
          : '<td style="padding:7px;border:1px solid #e2e0d4;text-align:center;color:#c0392b;font-weight:700">✗ ยังไม่ส่ง</td>')+'</tr>';
    }).join('');
    body='<div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">'+
      statBox(n,'นักเรียน','#2c4a39')+
      statBox(sentL.length,'ส่งแล้ว','#1f6f3e')+
      statBox(missL.length,'ยังไม่ส่ง',missL.length?'#c0392b':'#1f6f3e')+
      statBox(pct+'%','อัตราการส่ง',rc)+'</div>'+
      '<table style="width:100%;border-collapse:collapse;font-size:15px"><tr style="background:#2c4a39;color:#f4f1e6">'+
      '<th style="padding:8px;border:1px solid #cfd8d2;width:60px">เลขที่</th><th style="padding:8px;text-align:left;border:1px solid #cfd8d2">ชื่อ-สกุล</th>'+
      '<th style="padding:8px;border:1px solid #cfd8d2;width:120px">สถานะ</th></tr>'+rows+'</table>'+
      (missL.length? '<div style="margin-top:14px;padding:12px 14px;background:#fceae8;border-radius:10px;font-size:15px">'+
        '<b style="color:#c0392b">ยังไม่ส่ง '+missL.length+' คน:</b> '+missL.map(function(s){return escapeHtml((s.no?s.no+'. ':'')+s.name);}).join(', ')+'</div>'
        : '<div style="margin-top:14px;padding:14px;background:#e8f3ec;color:#1f6f3e;border-radius:10px;text-align:center;font-weight:700;font-size:17px">🎉 ส่งครบทุกคน!</div>');
  }
  return '<div style="width:720px;box-sizing:border-box;background:#fffdf7;font-family:Sarabun,sans-serif;color:#26302a;border-radius:14px;overflow:hidden">'+
    head+'<div style="padding:18px 26px 22px">'+body+
    '<div style="margin-top:16px;font-size:12px;color:#8a948e;text-align:right">ระบบติดตามงาน • '+thaiDate(new Date())+'</div></div></div>';
}

/* ===== แท็บ ===== */
document.querySelectorAll('.tab').forEach(function(t){
  t.onclick=function(){
    document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('active');});
    t.classList.add('active'); var name=t.getAttribute('data-tab');
    ['grid','manage','summary','all'].forEach(function(s){document.getElementById('tab-'+s).classList.toggle('hide',s!==name);});
    if(name==='grid')renderGrid();
    if(name==='manage'){renderWorks();renderStudents();}
    if(name==='summary')renderSummary();
    if(name==='all')renderAll();
  };
});

/* ===== ปุ่ม dialog ปลดล็อก / ตั้งค่าคลาวด์ ===== */
document.getElementById('pwOk').onclick=function(){
  var v=document.getElementById('pwInput').value.trim();
  var isCorrect = false;
  
  if(activeWorkspace==='ครูนิวตรอน'){
    if(v==='ครูนิวตรอน'||v==='2301') isCorrect=true;
  } else {
    var ws = workspaces.find(function(w){return w.name===activeWorkspace;});
    if(ws && ws.password===v) isCorrect=true;
  }
  
  if(isCorrect){
    unlocked=true;
    sessionStorage.setItem('hwUnlocked_' + activeWorkspace,'1');
    sessionStorage.setItem('hwEnteredPassword_' + activeWorkspace,v);
    document.getElementById('pwDlg').close(); updateLockUI();
    setStatus('🔓 ปลดล็อกแล้ว — บันทึกได้','ok');
    if(cloudUrl()&&localDirty&&!syncPaused)pushNow();        // บันทึกการแก้ที่ค้างอยู่ขึ้นคลาวด์
  } else { document.getElementById('pwMsg').textContent='รหัสผ่านไม่ถูกต้อง'; }
};
document.getElementById('pwInput').addEventListener('keydown',function(e){ if(e.key==='Enter')document.getElementById('pwOk').click(); });
document.getElementById('pwCancel').onclick=function(){
  document.getElementById('pwDlg').close();
  setStatus('ยังเก็บร่างไว้ในเครื่อง · ยังไม่บันทึกขึ้นคลาวด์');
};
document.getElementById('btnCfg').onclick=function(){
  document.getElementById('cfgUrl').value=localStorage.getItem('hwCloudUrl_' + activeWorkspace)||CLOUD_URL||'';
  document.getElementById('cfgMsg').textContent='';
  document.getElementById('cfgDlg').showModal();
};
document.getElementById('cfgCancel').onclick=function(){document.getElementById('cfgDlg').close();};
document.getElementById('cfgOk').onclick=function(){
  var u=document.getElementById('cfgUrl').value.trim();
  if(u && !/^https?:\/\/.+\/exec\/?$/.test(u)){ document.getElementById('cfgMsg').style.color='var(--miss)'; document.getElementById('cfgMsg').textContent='ลิงก์ควรลงท้ายด้วย /exec'; return; }
  if(u)localStorage.setItem('hwCloudUrl_' + activeWorkspace,u); else localStorage.removeItem('hwCloudUrl_' + activeWorkspace);
  document.getElementById('cfgDlg').close();
  refreshFromCloud();
};
document.getElementById('btnRefresh').onclick=function(){ refreshFromCloud(); };

/* ===== ระบบจัดการห้องทำงานครู (Teacher Workspace Management) ===== */
var selectedWsToLogin = '';

function renderWorkspaceCards() {
  var container = document.getElementById('wsCardsContainer');
  if (!container) return;
  container.innerHTML = '';
  workspaces.forEach(function(w) {
    var item = document.createElement('div');
    item.className = 'ws-card-item';
    item.innerHTML = '<span class="ws-name">👤 ' + escapeHtml(w.name) + '</span><span class="ws-arrow">›</span>';
    item.onclick = function() {
      showWsLogin(w.name);
    };
    container.appendChild(item);
  });
}

function showWsLogin(name) {
  selectedWsToLogin = name;
  document.getElementById('wsLoginTitle').textContent = '👤 ' + name;
  document.getElementById('wsLoginPw').value = '';
  document.getElementById('wsLoginMsg').textContent = '';
  document.getElementById('wsLandingPageSelect').classList.add('hide');
  document.getElementById('wsLandingPageLogin').classList.remove('hide');
  document.getElementById('wsLoginPw').focus();
}

function hideWsLandingOverlay() {
  document.getElementById('wsLandingScreen').classList.add('hide');
}

function showWsLandingOverlay() {
  if(cloudBusy){setStatus('กำลังบันทึก กรุณารอให้เสร็จก่อนสลับครู');return;}
  renderWorkspaceCards();
  document.getElementById('wsLandingPageSelect').classList.remove('hide');
  document.getElementById('wsLandingPageLogin').classList.add('hide');
  document.getElementById('wsLandingScreen').classList.remove('hide');
}

function switchWorkspace(name) {
  if(cloudBusy){setStatus('กำลังบันทึก กรุณารอก่อนสลับครู');return;}
  clearTimeout(pushTimer);pendingPush=false;readEpoch++;
  activeWorkspace = name;
  ensureWorkRoster();
  localStorage.setItem(ACTIVE_WS_KEY, name);
  
  // โหลดสถานะการปลดล็อกเฉพาะเซสชันของห้องทำงานนี้
  unlocked = (sessionStorage.getItem('hwUnlocked_' + activeWorkspace) === '1');
  
  // รีเซ็ตตัวแปรห้องเรียนปัจจุบัน
  curKey = null;
  cur = null;
  
  // โหลดข้อมูลห้องทำงาน
  load();
  
  // อัปเดตชื่อผู้ใช้บน Header
  var lbl = document.getElementById('lblActiveWs');
  if (lbl) lbl.textContent = name;
  
  // อัปเดต UI ชื่องานรายงาน
  if (reportTitleEl) {
    reportTitleEl.value = localStorage.getItem('hwReportTitle_' + activeWorkspace) || '';
  }
  
  updateLockUI();
  afterDataReady();
  
  if (cloudUrl()) {
    refreshFromCloud();
  } else {
    setStatus('⚠️ ยังไม่ตั้งค่าคลาวด์ — กด ⚙️ ตั้งค่าคลาวด์');
  }
}

// ผูกเหตุการณ์ล็อกอินหน้าแรก
document.getElementById('wsLoginUnlock').onclick = function() {
  var pw = document.getElementById('wsLoginPw').value.trim();
  var isCorrect = false;
  
  if (selectedWsToLogin === 'ครูนิวตรอน') {
    if (pw === 'ครูนิวตรอน' || pw === '2301') isCorrect = true;
  } else {
    var ws = workspaces.find(function(w) { return w.name === selectedWsToLogin; });
    if (ws && ws.password === pw) isCorrect = true;
  }
  
  if (isCorrect) {
    unlocked = true;
    sessionStorage.setItem('hwUnlocked_' + selectedWsToLogin, '1');
    sessionStorage.setItem('hwEnteredPassword_' + selectedWsToLogin, pw);
    hideWsLandingOverlay();
    switchWorkspace(selectedWsToLogin);
    if(localDirty)setStatus('พบร่างที่ยังไม่บันทึก · กรุณาตรวจและส่งร่างอีกครั้ง');
  } else {
    document.getElementById('wsLoginMsg').textContent = '❌ รหัสผ่านไม่ถูกต้อง';
  }
};

document.getElementById('wsLoginPw').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') document.getElementById('wsLoginUnlock').click();
});

document.getElementById('wsLoginReadOnly').onclick = function() {
  unlocked = false;
  sessionStorage.removeItem('hwUnlocked_' + selectedWsToLogin);
  sessionStorage.removeItem('hwEnteredPassword_' + selectedWsToLogin);
  hideWsLandingOverlay();
  switchWorkspace(selectedWsToLogin);
  if(localDirty)setStatus('ดูอย่างเดียว · มีร่างค้างในอุปกรณ์นี้');
};

document.getElementById('wsLoginBack').onclick = function() {
  document.getElementById('wsLandingPageSelect').classList.remove('hide');
  document.getElementById('wsLandingPageLogin').classList.add('hide');
};

document.getElementById('btnLandingCreateWs').onclick = function() {
  var dlg = document.getElementById('wsCreateDlg');
  document.getElementById('wsNewName').value = '';
  document.getElementById('wsNewPw').value = '';
  document.getElementById('wsNewPwConfirm').value = '';
  document.getElementById('wsCreateMsg').textContent = '';
  dlg.showModal();
};

document.getElementById('btnSwitchWsHeader').onclick = function() {
  showWsLandingOverlay();
};

// ยกเลิกสร้างห้องทำงานใหม่
document.getElementById('wsCreateCancel').onclick = function() {
  document.getElementById('wsCreateDlg').close();
};

// ยืนยันสร้างห้องทำงานใหม่
document.getElementById('wsCreateOk').onclick = function() {
  var nameInput = document.getElementById('wsNewName');
  var pwInput = document.getElementById('wsNewPw');
  var pwConfInput = document.getElementById('wsNewPwConfirm');
  var msg = document.getElementById('wsCreateMsg');
  
  var name = nameInput.value.trim();
  var pw = pwInput.value.trim();
  var pwConf = pwConfInput.value.trim();
  
  if (!name) { msg.textContent = 'กรุณากรอกชื่อครู/ชื่อห้องทำงาน'; return; }
  if (name === '__new__') { msg.textContent = 'ชื่อนี้ไม่สามารถใช้ได้'; return; }
  
  var exists = workspaces.some(function(w) { return w.name.toLowerCase() === name.toLowerCase(); });
  if (exists) { msg.textContent = 'ชื่อห้องทำงานนี้มีอยู่แล้ว'; return; }
  if (!pw) { msg.textContent = 'กรุณากรอกรหัสผ่าน'; return; }
  if (pw !== pwConf) { msg.textContent = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน'; return; }
  
  workspaces.push({ name: name, password: pw });
  localStorage.setItem(WS_LIST_KEY, JSON.stringify(workspaces));
  
  document.getElementById('wsCreateDlg').close();
  nameInput.value = '';
  pwInput.value = '';
  pwConfInput.value = '';
  msg.textContent = '';
  
  // ปลดล็อกให้ทันที
  sessionStorage.setItem('hwUnlocked_' + name, '1');
  sessionStorage.setItem('hwEnteredPassword_' + name, pw);
  
  hideWsLandingOverlay();
  switchWorkspace(name);
  setStatus('👤 สร้างและเปิดห้องทำงานใหม่แล้ว', 'ok');
};

// ลบห้องทำงานครูปัจจุบัน
document.getElementById('btnDeleteWs').onclick = function() {
  if (activeWorkspace === 'ครูนิวตรอน') {
    alert('⚠️ ไม่สามารถลบห้องทำงานครูนิวตรอนได้');
    return;
  }
  
  var pw = prompt('🗑️ ยืนยันการลบห้องทำงาน "' + activeWorkspace + '"\n\nคำเตือน: ข้อมูลห้องเรียนทั้งหมดในห้องทำงานนี้จะถูกลบถาวรและไม่สามารถกู้คืนได้!\n\nกรุณาใส่รหัสผ่านของห้องทำงานนี้เพื่อยืนยัน:');
  if (pw === null) return;
  
  var ws = workspaces.find(function(w) { return w.name === activeWorkspace; });
  if (ws && ws.password === pw) {
    if (confirm('⚠️ คุณแน่ใจจริงๆ หรือไม่ว่าต้องการลบห้องทำงานนี้?')) {
      workspaces = workspaces.filter(function(w) { return w.name !== activeWorkspace; });
      localStorage.setItem(WS_LIST_KEY, JSON.stringify(workspaces));
      
      localStorage.removeItem('hwTrackerApp_data_' + activeWorkspace);
      localStorage.removeItem('hwCloudUrl_' + activeWorkspace);
      localStorage.removeItem('hwReportTitle_' + activeWorkspace);
      sessionStorage.removeItem('hwUnlocked_' + activeWorkspace);
      sessionStorage.removeItem('hwEnteredPassword_' + activeWorkspace);
      
      switchWorkspace('ครูนิวตรอน');
      showWsLandingOverlay();
      alert('🗑️ ลบห้องทำงานเรียบร้อยแล้ว');
    }
  } else {
    alert('❌ รหัสผ่านไม่ถูกต้อง การลบล้มเหลว');
  }
};

/* ===== QR/Barcode Scanner ===== */
var html5QrCode = null;
var scanSessionHistory = [];
var scanCooldown = false;
var qrScannerLibPromise = null;

/* โหลดตัวอ่าน QR เฉพาะตอนกดเปิดสแกนเนอร์ ไม่ให้ขวางหน้าใส่รหัสครู */
function loadQrScannerLib() {
  if (window.Html5Qrcode) return Promise.resolve();
  if (qrScannerLibPromise) return qrScannerLibPromise;
  qrScannerLibPromise = new Promise(function(resolve, reject) {
    var script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode';
    script.async = true;
    script.onload = function() {
      if (window.Html5Qrcode) resolve();
      else reject(new Error('QR scanner library unavailable'));
    };
    script.onerror = function() { reject(new Error('QR scanner library failed to load')); };
    document.head.appendChild(script);
  }).catch(function(error) {
    qrScannerLibPromise = null;
    throw error;
  });
  return qrScannerLibPromise;
}

function playScanBeep(success) {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    if (success) {
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else {
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    console.error('Audio beep failed', e);
  }
}

function openScannerModal() {
  if (!cur) { alert('⚠️ กรุณาเลือกหรือสร้างห้อง/วิชาก่อน'); return; }
  if (!unlocked) { promptUnlock(); return; }

  var wSelect = document.getElementById('scanner-work-select');
  wSelect.innerHTML = '';
  if (!cur.works || !cur.works.length) {
    alert('⚠️ กรุณาเพิ่มชิ้นงานที่แท็บ ⚙️ จัดการงาน ก่อนใช้งานสแกนเนอร์');
    return;
  }
  cur.works.forEach(function(w) {
    var option = document.createElement('option');
    option.value = w.id;
    option.textContent = w.name + (w.type === 'สอบ' ? ' (สอบ)' : ' (ส่งงาน)');
    wSelect.appendChild(option);
  });

  wSelect.onchange = function() {
    var w = cur.works.find(function(item) { return item.id === wSelect.value; });
    var act = document.getElementById('scanner-action');
    if (w && w.type === 'สอบ') {
      act.value = 'score';
      document.getElementById('scanner-score-value').max = w.max || 999;
    } else {
      if (act.value === 'score') act.value = 'sent';
    }
    toggleScannerScoreInput();
  };

  wSelect.onchange();

  scanSessionHistory = [];
  document.getElementById('scanner-history').innerHTML = '<div style="color: var(--muted); text-align: center; padding: 10px 0;">ยังไม่มีข้อมูลประวัติการสแกน</div>';
  var logBox = document.getElementById('scanner-status-log');
  logBox.style.background = 'var(--green-l)';
  logBox.style.color = 'var(--green-d)';
  logBox.textContent = 'กำลังเตรียมตัวสแกน QR…';

  document.getElementById('scanDlg').showModal();

  loadQrScannerLib().then(function() {
    return Html5Qrcode.getCameras();
  }).then(function(devices) {
    var select = document.getElementById('scanner-camera-select');
    select.innerHTML = '';
    
    if (devices && devices.length > 0) {
      devices.forEach(function(device, index) {
        var option = document.createElement('option');
        option.value = device.id;
        var label = device.label || 'กล้อง ' + (index + 1);
        if (label.toLowerCase().indexOf('back') !== -1 || label.toLowerCase().indexOf('rear') !== -1) {
          label = '📷 กล้องหลัง (' + label + ')';
        } else if (label.toLowerCase().indexOf('front') !== -1) {
          label = '🤳 กล้องหน้า (' + label + ')';
        }
        option.textContent = label;
        select.appendChild(option);
      });
      
      var rearCamera = devices.find(function(d) {
        var l = d.label.toLowerCase();
        return l.indexOf('back') !== -1 || l.indexOf('rear') !== -1 || l.indexOf('environment') !== -1;
      });
      if (rearCamera) {
        select.value = rearCamera.id;
      }
      
      select.onchange = function() {
        startCamera(select.value);
      };
      
      startCamera(select.value);
    } else {
      logBox.textContent = '❌ ไม่พบกล้องในอุปกรณ์นี้';
      playScanBeep(false);
    }
  }).catch(function(e) {
    console.error('Failed to get cameras', e);
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      logBox.textContent = '❌ กล้องไม่ทำงานเนื่องจากไม่ได้ใช้ HTTPS (กรุณาพิมพ์ https:// นำหน้าชื่อเว็บ)';
      logBox.style.background = '#fde8e8';
      logBox.style.color = '#9b1c1c';
    } else {
      logBox.textContent = '❌ ไม่ได้รับอนุญาตให้เข้าถึงกล้อง หรือไม่พบกล้อง';
    }
    playScanBeep(false);
  });
}

function startCamera(cameraId) {
  if (html5QrCode) {
    html5QrCode.stop().then(function() {
      initCamera(cameraId);
    }).catch(function(err) {
      console.error('Stop camera failed', err);
      initCamera(cameraId);
    });
  } else {
    initCamera(cameraId);
  }
}

function initCamera(cameraId) {
  html5QrCode = new Html5Qrcode("scanner-view");
  var config = { 
    fps: 25, 
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true
    }
  };

  html5QrCode.start(
    cameraId,
    config,
    function(decodedText, decodedResult) {
      handleScannedCode(decodedText.trim());
    },
    function(errorMessage) {
      // verbose error
    }
  ).catch(function(err) {
    console.error('Camera start error', err);
    document.getElementById('scanner-status-log').textContent = '❌ เปิดกล้องไม่สำเร็จ: ' + err.message;
  });
}

function toggleScannerScoreInput() {
  var act = document.getElementById('scanner-action').value;
  var wrap = document.getElementById('scanner-score-wrap');
  if (act === 'score') {
    wrap.style.display = 'block';
  } else {
    wrap.style.display = 'none';
  }
}

function handleScannedCode(code) {
  if (scanCooldown) return;
  scanCooldown = true;
  setTimeout(function() { scanCooldown = false; }, 1800);

  var rosterList = ROSTER[cur.room] || [];
  var rosterStudent = rosterList.find(function(s) { return s.id && String(s.id).trim() === code; });
  var foundStudent = null;

  if (rosterStudent) {
    foundStudent = cur.students.find(function(s) { return s.no === rosterStudent.no; });
  }

  if (!foundStudent && /^\d+$/.test(code)) {
    var seatNo = parseInt(code, 10);
    foundStudent = cur.students.find(function(s) { return s.no === seatNo; });
  }

  if (foundStudent) {
    var wId = document.getElementById('scanner-work-select').value;
    var work = cur.works.find(function(w) { return w.id === wId; });
    var action = document.getElementById('scanner-action').value;
    
    if (!work) return;

    var logBox = document.getElementById('scanner-status-log');
    var actionText = '';
    
    if (work.type === 'สอบ') {
      var scoreVal = document.getElementById('scanner-score-value').value;
      var score = scoreVal === '' ? '' : Number(scoreVal);
      setVal(foundStudent.id, work.id, score);
      actionText = 'กรอกคะแนน ' + (score === '' ? 'ว่าง' : score) + ' คะแนน';
    } else {
      var valNow = isSent(foundStudent.id, work.id);
      var newVal = true;
      if (action === 'toggle') newVal = !valNow;
      else if (action === 'miss') newVal = false;
      
      setVal(foundStudent.id, work.id, newVal);
      actionText = newVal ? 'เช็คว่า ส่ง' : 'เช็คว่า ไม่ส่ง';
    }

    renderGrid();
    save();

    logBox.style.background = 'var(--green-l)';
    logBox.style.color = 'var(--green-d)';
    logBox.textContent = '✅ ' + foundStudent.name + ' (เลขที่ ' + foundStudent.no + ') -> ' + actionText;
    
    playScanBeep(true);
    
    var now = new Date();
    var timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    scanSessionHistory.unshift({
      time: timeStr,
      no: foundStudent.no,
      name: foundStudent.name,
      actionText: actionText
    });
    
    renderScanHistory();
  } else {
    var logBox = document.getElementById('scanner-status-log');
    logBox.style.background = 'var(--miss-bg)';
    logBox.style.color = 'var(--miss)';
    logBox.textContent = '⚠️ ไม่พบข้อมูลนักเรียน: Code "' + code + '"';
    
    playScanBeep(false);
  }
}

function renderScanHistory() {
  var container = document.getElementById('scanner-history');
  if (scanSessionHistory.length === 0) {
    container.innerHTML = '<div style="color: var(--muted); text-align: center; padding: 10px 0;">ยังไม่มีข้อมูลประวัติการสแกน</div>';
    return;
  }
  
  var items = scanSessionHistory.slice(0, 5);
  container.innerHTML = items.map(function(item) {
    return '<div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--line); padding: 4px 0;">' +
      '<span>⏱️ <b>' + item.time + '</b> · เลขที่ ' + item.no + ' ' + item.name + '</span>' +
      '<span style="font-weight: bold; color: var(--green);">' + item.actionText + '</span>' +
      '</div>';
  }).join('');
}

function closeScannerModal() {
  if (html5QrCode) {
    html5QrCode.stop().then(function() {
      html5QrCode = null;
      document.getElementById('scanDlg').close();
    }).catch(function(err) {
      console.error('Stop camera failed on close', err);
      html5QrCode = null;
      document.getElementById('scanDlg').close();
    });
  } else {
    document.getElementById('scanDlg').close();
  }
}

/* Gradebook navigation and focused editing. */
function visibleWorks(){
  if(!cur)return [];
  var chosen=document.getElementById('workFilter').value;
  return cur.works.filter(function(w){return !chosen||w.id===chosen;});
}
function updateWorkFilter(){
  var el=document.getElementById('workFilter'),previous=el.value;
  el.innerHTML='<option value="">แสดงทุกงาน / ข้อสอบ</option>'+(cur?cur.works.map(function(w){return '<option value="'+escapeHtml(w.id)+'">'+escapeHtml(w.name)+' · '+escapeHtml(w.type)+'</option>';}).join(''):'');
  if(cur&&cur.works.some(function(w){return w.id===previous;}))el.value=previous;
}
function updateGradeMetrics(){
  var students=cur?cur.students.length:0,works=cur?cur.works.length:0,filled=0,total=0;
  if(cur)cur.works.forEach(function(w){if(w.type==='สอบ')cur.students.forEach(function(s){total++;var v=val(s.id,w.id);if(v!==''&&v!=null)filled++;});});
  document.getElementById('gradeMetrics').innerHTML=[['นักเรียนในห้อง',students,'คน'],['งาน / ข้อสอบ',works,'รายการ'],['กรอกคะแนนแล้ว',filled,'จาก '+total+' ช่อง'],['ห้อง / วิชาทั้งหมด',Object.keys(DB.sets).length,'ชุด']].map(function(m){return '<article><span>'+m[0]+'</span><strong>'+m[1]+'</strong><small>'+m[2]+'</small></article>';}).join('');
}
function filterStudentRows(){
  var search=document.getElementById('studentSearch').value.trim().toLowerCase(),pending=document.getElementById('onlyPending').checked,count=0;
  document.querySelectorAll('#grid tbody tr[data-student]').forEach(function(row){row.hidden=!row.dataset.search.includes(search)||(pending&&pendingCount(row.dataset.student)===0);if(!row.hidden)count++;});
  document.getElementById('gridCount').textContent=cur?'แสดง '+count+' / '+cur.students.length+' คน · '+visibleWorks().length+' งาน / ข้อสอบ · สรุปท้ายตารางคิดจากนักเรียนทั้งห้อง':'เลือกห้องเรียนเพื่อเริ่มต้น';
}
document.getElementById('studentSearch').addEventListener('input',filterStudentRows);
document.getElementById('onlyPending').addEventListener('change',filterStudentRows);
document.getElementById('workFilter').addEventListener('change',renderGrid);
document.getElementById('focusGrid').onclick=function(){var focused=document.body.classList.toggle('grade-focus');this.setAttribute('aria-pressed',String(focused));this.textContent=focused?'กลับมุมมองปกติ':'ขยายตาราง';};
document.getElementById('retrySave').onclick=async function(){
  if(cloudBusy||retryChecking)return;
  if(!unlocked){promptUnlock();return;}
  var ws=activeWorkspace,revision=localRevision;
  retryChecking=true;this.disabled=true;setStatus('กำลังตรวจข้อมูลบนคลาวด์ก่อนส่งร่างอีกครั้ง…');
  try{
    var current=await KNTNetwork.json(cloudUrl(),{timeoutMs:15000});
    if(ws!==activeWorkspace||revision!==localRevision){setStatus('ร่างเปลี่ยนระหว่างตรวจ กรุณากดตรวจอีกครั้ง');return;}
    if(!current||!current.ok||!current.data)throw new Error('ตรวจข้อมูลบนคลาวด์ไม่ได้');
    if(JSON.stringify(current.data)===JSON.stringify(DB)){localDirty=false;syncPaused=false;persistDraft();setStatus('ตรวจแล้ว ข้อมูลบนคลาวด์ตรงกับร่าง','ok');return;}
    if(!confirm('ข้อมูลบนคลาวด์ต่างจากร่างในอุปกรณ์นี้\nหากมีครูคนอื่นแก้ข้อมูล กรุณายกเลิกแล้วสำรองร่างเพื่อตรวจสอบก่อน\n\nต้องการส่งร่างในอุปกรณ์นี้ขึ้นคลาวด์หรือไม่?')){setStatus('เก็บร่างไว้ในอุปกรณ์ ยังไม่ส่งขึ้นคลาวด์');return;}
    syncPaused=false;await pushNow();
  }catch(error){setStatus('ตรวจไม่สำเร็จ · ร่างยังอยู่ในเครื่อง · '+error.message,'err');}
  finally{retryChecking=false;this.disabled=false;this.hidden=!localDirty||!syncPaused;}
};
window.addEventListener('beforeunload',function(event){if(localDirty||cloudBusy){event.preventDefault();event.returnValue='';}});
window.addEventListener('offline',function(){setStatus('ออฟไลน์ · เก็บร่างในเครื่อง รอเชื่อมต่อก่อนส่งขึ้นคลาวด์');});
window.addEventListener('online',function(){setStatus(localDirty?'กลับมาออนไลน์แล้ว · กรุณาตรวจและส่งร่างอีกครั้ง':'กลับมาออนไลน์แล้ว · กดดึงข้อมูลล่าสุด');});
document.querySelector('#grid').addEventListener('keydown',function(event){
  if(event.key!=='Enter'||event.target.type!=='number')return;
  event.preventDefault();var work=event.target.dataset.w,inputs=Array.from(document.querySelectorAll('#grid input[type="number"]')).filter(function(el){return el.dataset.w===work&&!el.closest('tr').hidden;});var next=inputs[inputs.indexOf(event.target)+1];if(next){next.focus();next.select();}
});

/* ===== เริ่ม ===== */
unlocked = (sessionStorage.getItem('hwUnlocked_' + activeWorkspace) === '1');
showWsLandingOverlay();
load(); toggleMax(); updateLockUI();
setStatus('เลือกห้องทำงานครูเพื่อเริ่ม');
// ยังไม่สร้างตารางหรือดึงคลาวด์ขณะหน้ารหัสเปิดอยู่ เพื่อให้ช่องรหัสตอบสนองทันที
// ข้อมูลจะเริ่มโหลดใน switchWorkspace() หลังผู้ใช้เข้าห้องทำงานแล้ว
