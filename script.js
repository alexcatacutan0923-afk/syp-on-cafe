const topbar=document.getElementById('topbar');
const toggle=document.getElementById('menuToggle');
const nav=document.getElementById('nav');
addEventListener('scroll',()=>topbar.classList.toggle('scrolled',scrollY>25),{passive:true});
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'✕':'☰';});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';}));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.13});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
function updateStoreStatus(){
  const el=document.getElementById('storeStatus');
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',hour:'numeric',hour12:false}).formatToParts(new Date());
  const hour=Number(parts.find(p=>p.type==='hour').value)%24;
  const open=hour>=17||hour<4;
  el.classList.toggle('closed',!open);
  el.querySelector('b').textContent=open?'Open now · serving until 4AM':'Currently closed · opens at 5PM';
}
updateStoreStatus();setInterval(updateStoreStatus,60000);
