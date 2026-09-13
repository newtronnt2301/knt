'use strict';
(() => {
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const announce = message => { const el = document.getElementById('announcement'); el.textContent = message; clearTimeout(announce.timer); announce.timer = setTimeout(() => el.textContent = '', 2500); };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { announce('อุปกรณ์นี้ไม่อนุญาตให้เก็บข้อมูล จะจำไว้เฉพาะรอบนี้'); return false; } };
  const cards = [...document.querySelectorAll('.tool')];
  const known = id => cards.find(card => card.dataset.id === id);
  const list = key => { const value = read(key, []); return Array.isArray(value) ? value.filter(id => typeof id === 'string' && known(id)) : []; };
  let pins = list('knt-portal-pins'), recent = list('knt-portal-recent'), filter = 'ทั้งหมด';
  const search = document.getElementById('search');
  const normalize = text => text.toLowerCase().replaceAll('เช็ค', 'เช็ก').replace(/[็๊๋่้์\s]/g, '');
  function refresh() {
    let count = 0;
    cards.forEach(card => {
      const pinned = pins.includes(card.dataset.id);
      const pin = card.querySelector('.pin'); pin.setAttribute('aria-pressed', String(pinned)); pin.textContent = pinned ? '★' : '☆';
      pin.setAttribute('aria-label', `${pinned ? 'เลิกปักหมุด' : 'ปักหมุด'} ${card.querySelector('h3').textContent}`);
      card.hidden = !((filter === 'ทั้งหมด' || (filter === 'ปักหมุด' ? pinned : card.dataset.category === filter)) && normalize(card.textContent).includes(normalize(search.value.trim())));
      if (!card.hidden) count++;
    });
    document.getElementById('resultCount').textContent = `${count} เครื่องมือ${filter === 'ปักหมุด' ? 'ที่ปักหมุดในอุปกรณ์นี้' : ''}`;
    document.getElementById('empty').hidden = count > 0;
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    const target = document.getElementById('recent'); target.replaceChildren();
    recent.slice(0,4).forEach(id => { const source=known(id); if (!source) return; const a=document.createElement('a'); a.href=source.querySelector('a').getAttribute('href'); a.dataset.open=id; a.textContent=source.querySelector('h3').textContent+' ↗'; target.append(a); });
    document.getElementById('personal').hidden = !target.children.length;
  }
  function setRole(role) {
    const teacher = role === 'teacher';
    document.querySelectorAll('[data-role]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.role === role)));
    const ids = teacher ? ['classroom','attendance','work','grades'] : ['exam','learning','results','talent'];
    const descriptions = teacher ? ['ทำงานในพื้นที่เดียว','รายวิชาและรายคาบ','ตรวจและติดตามการส่ง','ระบบจัดการคะแนนเต็มรูปแบบ'] : ['ข้อสอบจากคุณครู','เนื้อหาและแบบฝึกหัด','ตรวจคะแนนและงานที่ต้องแก้','โจทย์ฝึกและทบทวน'];
    const target = document.getElementById('quick'); target.replaceChildren();
    ids.forEach((id,i) => { const card=known(id), a=document.createElement('a'); a.href=card.querySelector('a').getAttribute('href'); a.dataset.open=id; const label=document.createElement('span'); label.className='quick-label'; label.textContent=card.querySelector('h3').textContent+' ↗'; const desc=document.createElement('small'); desc.textContent=descriptions[i]; a.append(label,desc);target.append(a); });
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-pin],[data-filter],[data-role]');
    if (button?.dataset.pin) { const id=button.dataset.pin; pins=pins.includes(id)?pins.filter(item=>item!==id):[...pins,id]; write('knt-portal-pins',pins); refresh(); }
    if (button?.dataset.filter) { filter=button.dataset.filter; refresh(); }
    if (button?.dataset.role) { write('knt-portal-role',button.dataset.role); setRole(button.dataset.role); }
    const link=event.target.closest('a[data-open]'); if(link) {recent=[link.dataset.open,...recent.filter(id=>id!==link.dataset.open)].slice(0,4);write('knt-portal-recent',recent);}
  });
  search.addEventListener('input',refresh);
  document.getElementById('reset').addEventListener('click',()=>{search.value='';filter='ทั้งหมด';refresh();search.focus();});
  const memo=document.getElementById('memoInput'), status=document.getElementById('memoStatus');
  try { memo.value=localStorage.getItem('knt_neural_notepad')||''; } catch {}
  status.textContent=memo.value?'บันทึกเดิมในอุปกรณ์นี้':'';
  memo.addEventListener('input',()=>{try{localStorage.setItem('knt_neural_notepad',memo.value);status.textContent='เก็บในอุปกรณ์นี้แล้ว · '+new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});}catch{status.textContent='ยังเก็บไม่ได้ กรุณาคัดลอกข้อความไว้ก่อนปิดหน้า';}});
  document.getElementById('today').textContent=new Intl.DateTimeFormat('th-TH',{dateStyle:'long'}).format(new Date());
  setRole(read('knt-portal-role','student')==='teacher'?'teacher':'student');refresh();
  window.addEventListener('pageshow',refresh);
})();
