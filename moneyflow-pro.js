(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s);
const titles={home:['סקירה כללית','התמונה הפיננסית שלכם, במקום אחד'],cards:['כרטיסי אשראי','מסגרות, יתרות וחיובים עתידיים'],shifts:['ניהול משמרות','מעקב שעות, הכנסות וטיפים'],add:['תנועה חדשה','רישום הכנסה או הוצאה'],history:['היסטוריית תנועות','כל מה שנכנס ויוצא מהחשבון'],analysis:['ניתוח פיננסי','מגמות, הרגלים וקצב החיסכון'],insights:['תובנות','מה המספרים מספרים לכם'],investment:['תיק השקעות','מעקב אחר ההשקעה המשותפת'],goals:['היעדים שלנו','תכנון הדרך קדימה'],capital:['ההון המשותף','התקדמות מול היעד']};
function wrapHome(){
 const home=$('#home');if(!home||home.dataset.proGrid)return;
 const n=[...home.children];if(n.length<15)return;
 const groups=[['mfDashTop',[n[0],n[1]]],['mfDashSnapshot',[n[2],n[3]]],['mfDashAnalytics',[n[4],n[5],n[6],n[9]]],['mfDashInsights',[n[10],n[11],n[12]]],['mfDashLongTerm',[n[13],n[14]]]];
 const hidden=[n[7],n[8]];
 home.replaceChildren();
 groups.forEach(([cls,els])=>{const g=document.createElement('div');g.className=cls;els.filter(Boolean).forEach(el=>g.append(el));home.append(g)});
 const h=document.createElement('div');h.className='mfDashHidden';hidden.forEach(el=>h.append(el));home.append(h);
 home.dataset.proGrid='1';
}
function wrapCardsAndShifts(){
 const cards=$('#cards');if(cards&&!cards.dataset.proGrid){const n=[...cards.children];if(n.length>=12){const head=n[0],modal=n.find(x=>x.id==='xCardModal');cards.replaceChildren();cards.append(head);const overview=document.createElement('div');overview.className='mfCardsOverview';[n[1],n[2],n[6]].forEach(x=>x&&overview.append(x));cards.append(overview);const list=document.createElement('div');list.className='mfCardsList';[n[3],n[4]].forEach(x=>x&&list.append(x));cards.append(list);const form=document.createElement('div');form.className='mfCardsForm';if(n[7])form.append(n[7]);cards.append(form);const sched=document.createElement('div');sched.className='mfCardsSchedule';[n[8],n[9],n[10],n[11]].forEach(x=>x&&sched.append(x));cards.append(sched);if(modal)cards.append(modal);cards.dataset.proGrid='1'}}
 const shifts=$('#shifts');if(shifts&&!shifts.dataset.proGrid){const n=[...shifts.children];if(n.length>=8){const modal=n.find(x=>x.id==='xEndModal');shifts.replaceChildren();shifts.append(n[0],n[1]);const grid=document.createElement('div');grid.className='mfShiftMainGrid';const setup=document.createElement('div');setup.className='mfShiftSetup';setup.append(n[2]);const history=document.createElement('div');history.className='mfShiftHistory';history.append(n[3],n[4]);const insight=document.createElement('div');insight.className='mfShiftInsights';insight.append(n[5],n[6]);grid.append(setup,history,insight);shifts.append(grid);if(modal)shifts.append(modal);shifts.dataset.proGrid='1'}}
}
function buildShell(){
 const main=$('main.app'),nav=$('nav.nav');if(!main||!nav||document.querySelector('.mfProSidebar'))return;
 const side=document.createElement('aside');side.className='mfProSidebar';
 side.innerHTML='<div class="mfProBrand"><div class="mfProMark"><svg viewBox="0 0 42 42" aria-hidden="true"><path d="M7 29 16 20l7 5 12-14" fill="none" stroke="currentColor" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 11h8v8" fill="none" stroke="currentColor" stroke-width="3.3" stroke-linecap="round"/></svg></div><div><b>MoneyFlow</b><small>FINANCE WORKSPACE</small></div></div>';
 const navLabel=document.createElement('div');navLabel.className='mfProNavLabel';navLabel.textContent='הניהול שלי';
 side.append(navLabel,nav);const foot=document.createElement('div');foot.className='mfProSideFoot';foot.innerHTML='<span class="mfProStatusDot"></span><span>המרחב המשותף</span><small>איתי + נועה</small>';side.append(foot);
 document.body.append(side);
 const header=$('header',main);if(header){header.classList.add('mfProTopbar');const mark=$('#mfBrandMark',header);if(mark)mark.remove();const h=$('h1',header),p=$('p',header);if(h){h.id='mfProPageTitle';h.textContent='סקירה כללית'}if(p){p.id='mfProPageSub';p.textContent=titles.home[1]}const meta=document.createElement('div');meta.className='mfProTopMeta';meta.innerHTML='<span class="mfProToday"></span><span class="mfProSecure"><i></i> הנתונים מסונכרנים</span>';header.prepend(meta)}
 nav.classList.add('mfProNav');const navin=nav.querySelector('.navin');if(navin)navin.removeAttribute('style');wrapHome();wrapCardsAndShifts();
}
function setPage(v){const h=$('#mfProPageTitle'),p=$('#mfProPageSub'),t=titles[v]||[v,''];if(h)h.textContent=t[0];if(p)p.textContent=t[1];document.querySelectorAll('.nav [data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===v))}
function updateDate(){const x=$('.mfProToday');if(x)x.textContent=new Intl.DateTimeFormat('he-IL',{weekday:'long',day:'numeric',month:'long'}).format(new Date())}
function init(){buildShell();setPage(document.querySelector('.v.on')?.id||'home');updateDate();window.addEventListener('mf:view',e=>setPage(e.detail?.view||'home'));document.addEventListener('click',e=>{const b=e.target.closest('.nav [data-v]');if(b)setPage(b.dataset.v)});const observer=new MutationObserver(()=>{if(!document.querySelector('.mfProSidebar'))buildShell()});observer.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
