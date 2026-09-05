'use strict';
const slides=[...document.querySelectorAll('.slide')];
const menu=document.getElementById('menu'),evidence=document.getElementById('evidence'),lightbox=document.getElementById('lightbox');
let current=0,modelStep=0,lastTouch=null,noticeTimer;
const steps=[
 {letter:'S',name:'Situation Challenge',thai:'เผชิญสถานการณ์ปัญหา',text:'สำรวจวัตถุจริง ระบุสิ่งที่ต้องการหา และพิจารณาเงื่อนไขของการวัด',image:'activity-p3-2.webp',alt:'สำรวจวัตถุและพื้นที่จริงภายในโรงเรียน'},
 {letter:'I',name:'Investigate & Integrate',thai:'ศึกษาและบูรณาการ',text:'เชื่อมกฎของไซน์และตรีโกณมิติกับการทำงานของเซนเซอร์ ตัววัดระยะ และบอร์ดควบคุม',image:'activity-p4-2.webp',alt:'ศึกษาอุปกรณ์และเชื่อมโยงกับแบบจำลองทางคณิตศาสตร์'},
 {letter:'G',name:'Generate Solutions',thai:'วางแผนและออกแบบ',text:'ร่วมกันสร้างแบบจำลองรูปสามเหลี่ยม ออกแบบผังงาน กำหนดบทบาท และวางแนวทางทดสอบ',image:'activity-p5-2.webp',alt:'นักเรียนวางแผนและแลกเปลี่ยนเหตุผลในกลุ่ม'},
 {letter:'H',name:'Hands-on Development',thai:'ลงมือปฏิบัติสร้างชิ้นงาน',text:'ประกอบอุปกรณ์ เขียนโปรแกรม สอบเทียบ ทดลอง และปรับปรุงการทำงานจากปัญหาที่พบ',image:'activity-p6-1.webp',alt:'นักเรียนลงมือต่อวงจรและตรวจสอบการเชื่อมต่อ'},
 {letter:'T',name:'Test, Transfer & Tell',thai:'ทดสอบ นำเสนอ และต่อยอด',text:'เทียบผลกับค่าอ้างอิง วิเคราะห์ความคลาดเคลื่อน นำเสนอข้อค้นพบ และพิจารณาการใช้กับปัญหาอื่น',image:'activity-p7-2.webp',alt:'นักเรียนนำเสนอผลและแลกเปลี่ยนข้อสังเกตหน้าชั้นเรียน'}
];
const photos=[
[3,1,'S · นำเสนอสถานการณ์และแบบจำลอง'],[3,2,'S · สำรวจวัตถุและพื้นที่จริง'],[4,1,'I · อธิบายแบบจำลองทางคณิตศาสตร์'],[4,2,'I · ศึกษาส่วนประกอบและบอร์ดควบคุม'],[5,1,'G · บันทึกแนวทางแก้ปัญหา'],[5,2,'G · แลกเปลี่ยนเหตุผลในกลุ่ม'],[6,1,'H · ลงมือต่อวงจร'],[6,2,'H · เขียนโปรแกรมและเชื่อมต่ออุปกรณ์'],[7,1,'T · ทดสอบเทียบค่าอ้างอิง'],[7,2,'T · นำเสนอและแลกเปลี่ยนข้อสังเกต'],[8,1,'ผลงาน · บันทึกและตรวจสอบแนวคิด'],[8,2,'ผลงาน · โปรแกรมควบคุม'],[9,1,'ผลงาน · ประกอบวงจรและอุปกรณ์'],[9,2,'ผลงาน · ตรวจสอบต้นแบบ'],[10,1,'ชิ้นงาน · ต้นแบบ SineSight'],[10,2,'ชิ้นงาน · การแสดงผลบนจอ OLED'],[11,1,'การแข่งขันระดับภาคกลาง'],[11,2,'เกียรติบัตรครูผู้ฝึกสอน · ชนะเลิศเหรียญทอง ระดับภาคกลาง'],[12,1,'การแข่งขันระดับประเทศ'],[12,2,'เกียรติบัตรครูผู้ฝึกสอน · เหรียญทอง ระดับประเทศ']
];
function showSlide(index,updateHash=true){
 current=Math.max(0,Math.min(slides.length-1,index));
 slides.forEach((slide,i)=>{const visible=i===current;slide.classList.toggle('active',visible);slide.setAttribute('aria-hidden',String(!visible));slide.inert=!visible;});
 document.getElementById('counter').textContent=String(current+1).padStart(2,'0')+' / '+slides.length;
 document.getElementById('currentTitle').textContent=slides[current].dataset.title;
 document.getElementById('progressFill').style.width=((current+1)/slides.length*100)+'%';
 document.getElementById('prev').disabled=current===0;document.getElementById('next').disabled=current===slides.length-1;
 document.querySelectorAll('#slideIndex button').forEach((b,i)=>b.setAttribute('aria-current',String(i===current)));
 if(updateHash)history.replaceState(null,'','#'+(current+1));
 if(matchMedia('(max-width:760px),(max-height:530px)').matches)window.scrollTo({top:0,behavior:'instant'});
}
slides.forEach((slide,i)=>{const b=document.createElement('button');b.type='button';const n=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');b.append(n,document.createTextNode(slide.dataset.title));b.addEventListener('click',()=>{menu.close();showSlide(i);});document.getElementById('slideIndex').append(b);});
function orbitMarkup(interactive){
 let svg='<svg viewBox="0 0 400 400" role="img" aria-label="วงจร SIGHT: S I G H T"><circle class="ring" cx="200" cy="200" r="143"/><circle class="ring" cx="200" cy="200" r="111" stroke-dasharray="2 6"/><text class="orbit-center" x="200" y="197" text-anchor="middle">SIGHT</text><text class="orbit-sub" x="200" y="219" text-anchor="middle">LEARNING CYCLE</text>';
 steps.forEach((s,i)=>{const angle=(-90+i*72)*Math.PI/180,x=200+143*Math.cos(angle),y=200+143*Math.sin(angle);const a1=angle+.17,a2=angle+72*Math.PI/180-.17;svg+='<path class="arc" d="M '+(200+143*Math.cos(a1))+' '+(200+143*Math.sin(a1))+' A 143 143 0 0 1 '+(200+143*Math.cos(a2))+' '+(200+143*Math.sin(a2))+'"/>';
 if(!interactive)svg+='<circle cx="'+x+'" cy="'+y+'" r="23" fill="#102632" stroke="#58867e"/><text class="orbit-letter" x="'+x+'" y="'+(y+8)+'" text-anchor="middle">'+s.letter+'</text>';
 });return svg+'</svg>';
}
document.querySelectorAll('[data-orbit]').forEach(orbit=>{const interactive=orbit.dataset.orbit==='interactive';orbit.innerHTML=orbitMarkup(interactive);if(interactive){steps.forEach((s,i)=>{const a=(-90+i*72)*Math.PI/180;const b=document.createElement('button');b.type='button';b.className='step-node';b.style.left=(50+35.75*Math.cos(a))+'%';b.style.top=(50+35.75*Math.sin(a))+'%';b.textContent=s.letter;b.setAttribute('aria-label',s.letter+' — '+s.name+' : '+s.thai);b.setAttribute('aria-pressed',String(i===0));b.addEventListener('click',()=>selectStep(i));orbit.append(b);});}});
function selectStep(i){modelStep=i;const s=steps[i];document.getElementById('modelLabel').textContent=s.letter+' / 0'+(i+1);document.getElementById('modelName').textContent=s.name;document.getElementById('modelThai').textContent=s.thai;document.getElementById('modelText').textContent=s.text;const img=document.getElementById('modelImage');img.src='assets/'+s.image;img.alt=s.alt;document.querySelectorAll('.step-node').forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));}
document.getElementById('nextStep').addEventListener('click',()=>selectStep((modelStep+1)%5));
photos.forEach(([p,n,caption])=>{const b=document.createElement('button');b.type='button';const img=document.createElement('img');img.src='assets/activity-p'+p+'-'+n+'.webp';img.alt=caption;img.loading='lazy';const span=document.createElement('span');span.textContent=caption+' · หน้า '+p;b.append(img,span);b.addEventListener('click',()=>{document.getElementById('largeImage').src=img.src;document.getElementById('largeImage').alt=caption;document.getElementById('largeCaption').textContent=caption+' — เอกสารหลักฐาน หน้า '+p;lightbox.showModal();});document.getElementById('gallery').append(b);});
document.getElementById('prev').addEventListener('click',()=>showSlide(current-1));document.getElementById('next').addEventListener('click',()=>showSlide(current+1));document.getElementById('openMenu').addEventListener('click',()=>menu.showModal());document.querySelectorAll('[data-open-evidence]').forEach(b=>b.addEventListener('click',()=>evidence.showModal()));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
function notify(message){const n=document.getElementById('notice');n.textContent=message;n.style.display='block';clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>n.style.display='none',5000);}
async function toggleFullscreen(){try{if(document.fullscreenElement){await document.exitFullscreen();}else if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen();}else notify('เบราว์เซอร์นี้ไม่รองรับเต็มจอ ลองหมุนเครื่องเป็นแนวนอน');}catch{notify('เปิดเต็มจอไม่ได้ในเบราว์เซอร์นี้ ลองหมุนเครื่องเป็นแนวนอน');}}
document.getElementById('fullscreen').addEventListener('click',toggleFullscreen);document.addEventListener('fullscreenchange',()=>document.getElementById('fullscreen').textContent=document.fullscreenElement?'ออกเต็มจอ ⛶':'เต็มจอ ⛶');
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();showSlide(current+1);}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();showSlide(current-1);}else if(e.key===' '&&e.target===document.body){e.preventDefault();showSlide(current+1);}else if(e.key==='Home'){e.preventDefault();showSlide(0);}else if(e.key==='End'){e.preventDefault();showSlide(slides.length-1);}else if(e.key.toLowerCase()==='f')toggleFullscreen();else if(e.key.toLowerCase()==='e')evidence.showModal();else if(e.key.toLowerCase()==='m')menu.showModal();});
document.getElementById('stage').addEventListener('touchstart',e=>{if(e.target.closest('button,a'))return;const t=e.changedTouches[0];lastTouch={x:t.clientX,y:t.clientY};},{passive:true});document.getElementById('stage').addEventListener('touchend',e=>{if(!lastTouch)return;const t=e.changedTouches[0],dx=t.clientX-lastTouch.x,dy=t.clientY-lastTouch.y;if(Math.abs(dx)>75&&Math.abs(dx)>Math.abs(dy)*2)showSlide(current+(dx<0?1:-1));lastTouch=null;},{passive:true});
function readHash(){const number=Number(location.hash.slice(1));showSlide(Number.isInteger(number)&&number>=1?number-1:0,false);}window.addEventListener('hashchange',readHash);readHash();

// Keep navigation available without occupying the presentation canvas.
let chromeTimer;
function hideChrome(){clearTimeout(chromeTimer);document.body.classList.remove('controls-visible');}
function revealChrome(){document.body.classList.add('controls-visible');clearTimeout(chromeTimer);chromeTimer=setTimeout(()=>{if(!document.activeElement.closest('.topbar,.controls'))hideChrome();},2600);}
document.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&(e.clientY<24||e.clientY>innerHeight-24||e.target.closest('.topbar,.controls')))revealChrome();});
document.getElementById('stage').addEventListener('click',e=>{if(e.target.closest('button,a,img'))return;document.body.classList.contains('controls-visible')?hideChrome():revealChrome();});
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||document.querySelector('dialog[open]'))return;if(e.key.toLowerCase()==='c'){e.preventDefault();document.body.classList.contains('controls-visible')?hideChrome():revealChrome();}else if(e.key==='Tab')revealChrome();});
document.addEventListener('fullscreenchange',()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();hideChrome();});
document.querySelectorAll('.topbar,.controls').forEach(el=>{el.addEventListener('focusin',revealChrome);el.addEventListener('focusout',revealChrome);el.addEventListener('pointerleave',revealChrome);});

document.querySelectorAll('.topbar,.controls').forEach(el=>el.addEventListener('pointerup',()=>setTimeout(()=>{if(document.activeElement.closest('.topbar,.controls'))document.activeElement.blur();revealChrome();},0)));
