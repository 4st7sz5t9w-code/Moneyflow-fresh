(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let me='', members=[], notifs=[], chatChannel=null, notifChannel=null, goalMode='mine', pendingCash=null, started=false;
window.__mfHistorySort={by:'date',dir:'desc'};

function animateView(view){const s=document.getElementById(view);if(!s)return;const els=qa('.c,.quick,.g2,.g3',s).filter((x,i,a)=>!a.some(y=>y!==x&&y.contains(x)));els.slice(0,10).forEach((el,i)=>{el.classList.remove('mf-enter');void el.offsetWidth;el.style.animationDelay=(i*28)+'ms';el.classList.add('mf-enter')});setTimeout(()=>els.forEach(el=>{el.classList.remove('mf-enter');el.style.animationDelay=''}),700)}
function cashPop(kind,amount){q('.mfCashPop')?.remove();const d=document.createElement('div');d.className='mfCashPop '+kind;d.innerHTML=`${kind==='expense'?'−':'+'}₪${Math.round(amount).toLocaleString('he-IL')}<small>${kind==='expense'?'הוצאה נוספה':'הכנסה נוספה'}</small>`;document.body.appendChild(d);setTimeout(()=>d.remove(),1150)}

async function detectPerson(){try{if(typeof sb==='undefined')return '';const gs=await sb.auth.getSession();const uid=gs.data?.session?.user?.id;if(!uid)return '';const r=await sb.from('mf_members').select('user_id,display_name').eq('household_id',hid);if(!r.error){members=r.data||[];me=members.find(x=>x.user_id===uid)?.display_name||''}window.__mfCurrentPerson=me;if(!window.__mfScopeInitialized&&me){window.__mfScopePerson=me;window.__mfScopeInitialized=true}return me}catch{return ''}}

function ensureScope(){const home=q('#home');if(!home||!me)return;let wrap=q('#mfScope');if(!wrap){wrap=document.createElement('div');wrap.id='mfScope';const quick=home.querySelector('.quick');if(!quick)return;quick.after(wrap);wrap.addEventListener('click',e=>{const b=e.target.closest('button[data-person]');if(!b)return;const p=b.dataset.person||'';window.__mfScopePerson=p;const fo=q('#fo');if(fo)fo.value=p;renderHome();renderExtras();historyR();updateScope();animateView('home')})}wrap.innerHTML=`<span class="mut sm">הצגה:</span><button class="btn s" data-person="${esc(me)}">${esc(me)}</button><button class="btn s" data-person="">כולם</button>`;updateScope()}
function updateScope(){q('#mfScope')?.querySelectorAll('button[data-person]').forEach(b=>b.classList.toggle('p',(b.dataset.person||'')===(window.__mfScopePerson||'')))}
function applyDefaults(){if(!me)return;const fo=q('#fo');if(fo&&!fo.dataset.mfDefault){fo.value=me;fo.dataset.mfDefault='1'}try{if(typeof ownerSet==='function'&&owner!==me)ownerSet(me)}catch{}ensureScope()}

function setupMoreData(){const home=q('#home');if(!home||q('#mfMoreWrap'))return;const cards=[...home.children].filter(c=>c.classList?.contains('c')&&c.id!=='investCard');const wanted=cards.filter(c=>/6 חודשים|תחזית ליעד|השוואה לשבוע הקודם|מי מתקדם יותר|הוצאות מובילות|תנועות אחרונות|קוד לנועה/.test(c.textContent||''));if(!wanted.length)return;const wrap=document.createElement('div');wrap.id='mfMoreWrap';wrap.innerHTML='<button class="mfMoreBtn" type="button">עוד נתונים</button><div class="mfSecondary"></div>';wanted[0].before(wrap);const box=q('.mfSecondary',wrap);wanted.forEach(c=>box.appendChild(c));q('.mfMoreBtn',wrap).onclick=e=>{box.classList.toggle('on');e.currentTarget.textContent=box.classList.contains('on')?'פחות נתונים':'עוד נתונים'}}

function ensureHistorySort(){const card=q('#history .c');if(!card)return;let box=q('#mfHistorySort');if(!box){box=document.createElement('div');box.id='mfHistorySort';box.innerHTML='<span class="mut sm">מיון</span><div class="mfSortBtns"><button data-sort="date" type="button"></button><button data-sort="amount" type="button"></button></div>';const anchor=q('#fm')||card.querySelector('.g2');anchor?.after(box);box.onclick=e=>{const b=e.target.closest('button[data-sort]');if(!b)return;const s=window.__mfHistorySort;if(s.by===b.dataset.sort)s.dir=s.dir==='desc'?'asc':'desc';else{s.by=b.dataset.sort;s.dir='desc'}updateSort();historyR()}}updateSort()}
function updateSort(){q('#mfHistorySort')?.querySelectorAll('button[data-sort]').forEach(b=>{const active=window.__mfHistorySort.by===b.dataset.sort;b.classList.toggle('on',active);b.textContent=(b.dataset.sort==='date'?'תאריך':'סכום')+(active?(window.__mfHistorySort.dir==='desc'?' ↓':' ↑'):'')})}

function ensureEditOverlay(){if(q('#mfEditOverlay'))return;const o=document.createElement('div');o.id='mfEditOverlay';o.className='mfOverlay';o.innerHTML='<div class="mfSheet"><div class="mfSheetHead"><h2>עריכת תנועה</h2><button class="mfClose" type="button">×</button></div><div class="mfSheetBody"><div class="g2"><input id="mfEA" type="number" placeholder="סכום"><input id="mfED" type="date"><select id="mfEK"><option value="income">הכנסה</option><option value="expense">הוצאה</option></select><select id="mfEO"><option>איתי</option><option>נועה</option></select></div><input id="mfEC" placeholder="קטגוריה" style="margin-top:8px"><input id="mfEN" placeholder="הערה" style="margin-top:8px"><div class="g2" style="margin-top:10px"><button id="mfESave" class="btn p">שמור שינויים</button><button class="btn s mfCancel">ביטול</button></div></div></div>';document.body.appendChild(o);q('.mfClose',o).onclick=q('.mfCancel',o).onclick=()=>o.classList.remove('on');o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('on')})}
function editTx(id){const x=tx.find(t=>String(t.id)===String(id));if(!x||x.virtual)return;ensureEditOverlay();q('#mfEA').value=x.amount;q('#mfED').value=String(x.transaction_date).slice(0,10);q('#mfEK').value=x.kind;q('#mfEO').value=x.person;q('#mfEC').value=x.category||'';q('#mfEN').value=x.note||'';q('#mfEditOverlay').classList.add('on');q('#mfESave').onclick=async()=>{const body={amount:+q('#mfEA').value,transaction_date:q('#mfED').value,kind:q('#mfEK').value,person:q('#mfEO').value,category:q('#mfEC').value||'אחר',note:q('#mfEN').value||null};if(!body.amount)return t('הכנס סכום');const r=await sb.from('mf_transactions').update(body).eq('id',id).eq('household_id',hid);if(r.error)return t('העדכון נכשל');q('#mfEditOverlay').classList.remove('on');await load();t('התנועה עודכנה')};}

function goalCards(){const g=q('#goals');if(!g)return{};const cards=[...g.children].filter(x=>x.classList?.contains('c'));return{g,top:cards[0],rel:q('#releaseGoalCard'),it:cards.find(c=>c.querySelector('h2')?.textContent.trim()==='איתי'),no:cards.find(c=>c.querySelector('h2')?.textContent.trim()==='נועה'),dates:cards.find(c=>c.querySelector('h2')?.textContent.trim()==='תאריכי יעד'),grant:q('#grantCard')}}
function ensureGoalUI(){const {g,top,rel,it,no,dates,grant}=goalCards();if(!g)return;if(top&&!q('#mfGoalEditBtn',top)){const h=top.querySelector('h2');if(h){const row=document.createElement('div');row.className='sectiontitle';h.before(row);row.appendChild(h);const b=document.createElement('button');b.id='mfGoalEditBtn';b.className='btn s';b.type='button';b.textContent='✎ עריכה';b.onclick=openGoalEditor;row.appendChild(b)}}if(!q('#mfGoalMode',g)){const mode=document.createElement('div');mode.id='mfGoalMode';mode.className='mfGoalMode';mode.innerHTML='<button class="btn s" data-mode="mine">היעדים שלי</button><button class="btn s" data-mode="all">כולם</button>';top?.after(mode);mode.onclick=e=>{const b=e.target.closest('button[data-mode]');if(!b)return;goalMode=b.dataset.mode;applyGoals()}}if(dates){dates.classList.add('mfGoalDatesCard');if(!q('.mfGoalDetails',dates)){const d=document.createElement('div');d.className='mfGoalDetails';d.innerHTML='<div class="ins"><b>🎁 מענקים צפויים</b><div style="margin-top:8px">איתי · ₪15,000</div><div style="margin-top:5px">נועה · ₪10,000 + ₪15,000</div></div>';dates.appendChild(d);dates.addEventListener('click',e=>{if(e.target.closest('button,input,select'))return;d.classList.toggle('on')})}}if(grant)grant.style.display='none';applyGoals()}
function applyGoals(){const {top,rel,it,no,dates}=goalCards();if(!me)return;[rel,it,no,dates].forEach(x=>x?.classList.remove('mfHiddenForUser'));if(goalMode==='mine'&&me==='נועה'){rel?.classList.add('mfHiddenForUser');it?.classList.add('mfHiddenForUser')}const order=me==='נועה'?[top,no,dates,it,rel]:[top,rel,it,dates,no];let a=q('#mfGoalMode')||top;for(const el of order.filter(Boolean)){if(el===top)continue;if(a&&a.nextElementSibling!==el)a.after(el);a=el}q('#mfGoalMode')?.querySelectorAll('button').forEach(b=>b.classList.toggle('p',b.dataset.mode===goalMode))}
function ensureGoalEditor(){if(q('#mfGoalEditOverlay'))return;const o=document.createElement('div');o.id='mfGoalEditOverlay';o.className='mfOverlay';o.innerHTML='<div class="mfSheet"><div class="mfSheetHead"><h2>עריכת יעדים</h2><button class="mfClose" type="button">×</button></div><div class="mfSheetBody"><div class="c"><b>🎖️ יעד עד השחרור</b><label>סכום</label><input id="mfReleaseGoalAmount" type="number"><label>תאריך</label><input id="mfReleaseGoalDate" type="date"></div><div class="c"><b>🎯 יעד לשנתיים</b><label>סכום</label><input id="mfTwoYearGoalAmount" type="number"><label>תאריך</label><input id="mfTwoYearGoalDate" type="date"></div><button id="mfGoalSave" class="btn p" style="width:100%">שמור יעדים</button></div></div>';document.body.appendChild(o);q('.mfClose',o).onclick=()=>o.classList.remove('on');o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('on')});q('#mfGoalSave').onclick=saveGoalEditor}
function openGoalEditor(){ensureGoalEditor();q('#mfReleaseGoalAmount').value=+(set.itay_release_goal||150000);q('#mfReleaseGoalDate').value=set.itay_release_date||'2027-04-04';q('#mfTwoYearGoalAmount').value=+(set.joint_goal||280000);q('#mfTwoYearGoalDate').value=set.two_year_goal_date||'2028-08-17';q('#mfGoalEditOverlay').classList.add('on')}
async function saveGoalEditor(){const b={itay_release_goal:+q('#mfReleaseGoalAmount').value,itay_release_date:q('#mfReleaseGoalDate').value,joint_goal:+q('#mfTwoYearGoalAmount').value,two_year_goal_date:q('#mfTwoYearGoalDate').value,updated_at:new Date().toISOString()};if(!b.itay_release_goal||!b.joint_goal||!b.itay_release_date||!b.two_year_goal_date)return t('מלא את כל השדות');const r=await sb.from('mf_settings').update(b).eq('household_id',hid);if(r.error)return t('היעדים לא נשמרו');Object.assign(set,b);q('#mfGoalEditOverlay').classList.remove('on');render();t('היעדים נשמרו ✓')}

function ensureJoinExisting(){const box=q('#loginBox');if(!box||q('#joinExistingBtn'))return;const b=document.createElement('button');b.id='joinExistingBtn';b.type='button';b.className='btn s';b.style='width:100%;margin-top:9px';b.textContent='🔗 הצטרפות ל‑MoneyFlow קיים';b.onclick=()=>{if(typeof mode==='function')mode('signup');const m=q('#msg');if(m)m.innerHTML='צרו משתמש או התחברו. לאחר הכניסה בוחרים את השם ומזינים את קוד ההזמנה.'};box.insertBefore(b,q('#msg'))}

function ensureSocialUI(){const ha=q('header .ha');if(!ha)return;if(!q('#mfChatBtn')){const b=document.createElement('button');b.id='mfChatBtn';b.className='ib';b.type='button';b.textContent='💬';b.setAttribute('aria-label','צ׳אט');b.onclick=openChat;ha.prepend(b)}if(!q('#mfBellBtn')){const b=document.createElement('button');b.id='mfBellBtn';b.className='ib';b.type='button';b.innerHTML='🔔<span id="mfBellCount"></span>';b.setAttribute('aria-label','התראות');b.onclick=openNotifs;ha.prepend(b)}if(!q('#mfChatOverlay')){const o=document.createElement('div');o.id='mfChatOverlay';o.className='mfOverlay';o.innerHTML='<div class="mfSheet"><div class="mfSheetHead"><h2>הצ׳אט שלנו</h2><button class="mfClose" type="button">×</button></div><div id="mfChatList" class="mfChatList"><div class="empty">טוען הודעות…</div></div><div class="mfComposer"><input id="mfChatInput" autocomplete="off" placeholder="כתבו הודעה…"><button id="mfChatSend" class="btn p" type="button">➤</button></div></div>';document.body.appendChild(o);q('.mfClose',o).onclick=()=>o.classList.remove('on');o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('on')});q('#mfChatSend').onclick=sendChat;q('#mfChatInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sendChat()}})}if(!q('#mfNotifOverlay')){const o=document.createElement('div');o.id='mfNotifOverlay';o.className='mfOverlay';o.innerHTML='<div class="mfSheet"><div class="mfSheetHead"><h2>התראות</h2><button class="mfClose" type="button">×</button></div><div id="mfNotifBody" class="mfSheetBody"><div class="empty">טוען התראות…</div></div></div>';document.body.appendChild(o);q('.mfClose',o).onclick=()=>o.classList.remove('on');o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('on')})}}
async function refreshMembers(){if(!sess||!hid)return false;const r=await sb.from('mf_members').select('user_id,display_name').eq('household_id',hid);if(r.error)return false;members=r.data||[];me=members.find(x=>x.user_id===sess.user.id)?.display_name||me||'אני';window.__mfCurrentPerson=me;return true}
async function openChat(){ensureSocialUI();q('#mfChatOverlay').classList.add('on');q('#mfChatList').innerHTML='<div class="empty">טוען הודעות…</div>';await loadChat();setTimeout(()=>q('#mfChatInput')?.focus(),60)}
async function loadChat(){const l=q('#mfChatList');if(!l||!sess||!hid){if(l)l.innerHTML='<div class="empty">החיבור עדיין נטען.</div>';return}const r=await sb.from('mf_messages').select('id,sender_id,sender_name,body,created_at').eq('household_id',hid).order('created_at',{ascending:true}).limit(120);if(r.error){l.innerHTML='<div class="empty">הצ׳אט לא נטען כרגע.</div>';return}const rows=r.data||[];l.innerHTML=rows.length?rows.map(x=>`<div class="mfMsg ${x.sender_id===sess.user.id?'me':'them'}"><b>${esc(x.sender_name||'')}</b><div>${esc(x.body||'')}</div><div class="mfTime">${new Date(x.created_at).toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit',hour12:false})}</div></div>`).join(''):'<div class="empty">אין הודעות עדיין.</div>';l.scrollTop=l.scrollHeight}
async function sendChat(){const i=q('#mfChatInput'),body=i?.value.trim();if(!body||!sess||!hid)return;i.value='';if(!me)await refreshMembers();const r=await sb.from('mf_messages').insert({household_id:hid,sender_id:sess.user.id,sender_name:me||'אני',body});if(r.error)return t('ההודעה לא נשלחה');await loadChat()}
function updateBell(){const b=q('#mfBellCount');if(!b)return;const n=notifs.filter(x=>!x.read_at).length;b.textContent=n>9?'9+':n;b.style.display=n?'grid':'none'}
async function loadNotifs(){if(!sess||!hid)return false;const r=await sb.from('mf_notifications').select('*').eq('household_id',hid).order('created_at',{ascending:false}).limit(80);if(r.error)return false;notifs=(r.data||[]).filter(n=>!n.recipient_user_id||n.recipient_user_id===sess.user.id);updateBell();return true}
async function openNotifs(){ensureSocialUI();q('#mfNotifOverlay').classList.add('on');const box=q('#mfNotifBody');box.innerHTML='<div class="empty">טוען התראות…</div>';if(!await loadNotifs()){box.innerHTML='<div class="empty">ההתראות לא נטענו כרגע.</div>';return}box.innerHTML=(notifs.length?notifs.map(n=>`<div class="mfNotif ${n.read_at?'':'new'}"><b>${esc(n.title||'התראה')}</b><div>${esc(n.body||'')}</div><div class="mfTime">${new Date(n.created_at).toLocaleString('he-IL')}</div></div>`).join(''):'<div class="empty">אין התראות עדיין</div>')+'<div class="c" style="margin:10px 0 0"><b>שלחו חיזוק אחד לשני</b><div class="g3" id="mfEncourage" style="margin-top:9px"><button class="btn s">אלוף/ה! 🔥</button><button class="btn s">גאה בך ❤️</button><button class="btn s">ממשיכים ליעד 🎯</button></div></div>';q('#mfEncourage')?.addEventListener('click',e=>{const b=e.target.closest('button');if(b)encourage(b.textContent)});const ids=notifs.filter(x=>!x.read_at).map(x=>x.id);if(ids.length){const now=new Date().toISOString(),u=await sb.from('mf_notifications').update({read_at:now}).in('id',ids);if(!u.error){notifs.forEach(x=>{if(ids.includes(x.id))x.read_at=now});updateBell()}}}
async function encourage(text){if(!sess||!hid)return;if(!members.length)await refreshMembers();const other=members.find(x=>x.user_id!==sess.user.id);if(!other)return t('עדיין אין משתמש נוסף בבית');const r=await sb.from('mf_notifications').insert({household_id:hid,recipient_user_id:other.user_id,created_by:sess.user.id,sender_name:me||'MoneyFlow',type:'encouragement',title:'חיזוק מ־'+(me||'MoneyFlow')+' ❤️',body:text});t(r.error?'החיזוק לא נשלח':'החיזוק נשלח ❤️')}
function setupRealtime(){if(!sess||!hid)return;if(chatChannel)sb.removeChannel(chatChannel);if(notifChannel)sb.removeChannel(notifChannel);chatChannel=sb.channel('mf-clean-chat-'+hid).on('postgres_changes',{event:'*',schema:'public',table:'mf_messages',filter:'household_id=eq.'+hid},()=>{if(q('#mfChatOverlay')?.classList.contains('on'))loadChat()}).subscribe();notifChannel=sb.channel('mf-clean-notif-'+hid).on('postgres_changes',{event:'INSERT',schema:'public',table:'mf_notifications',filter:'household_id=eq.'+hid},p=>{const n=p.new;if(!n.recipient_user_id||n.recipient_user_id===sess.user.id){notifs.unshift(n);updateBell();t(n.title||'התראה חדשה')}}).subscribe()}

function checkAchievements(){if(!me||typeof ws!=='function'||typeof ms!=='function')return;const w=ws(0),m=ms(0),keyDate=w.d.toISOString().slice(0,10);const val=me==='נועה'?m.a.filter(x=>x.person==='נועה').reduce((s,x)=>s+(x.kind==='income'?+x.amount:-x.amount),0):w.a.filter(x=>x.person==='איתי').reduce((s,x)=>s+(x.kind==='income'?+x.amount:-x.amount),0);const goal=me==='נועה'?(+set.noa_monthly_goal||7000):(+set.itay_weekly_goal||1779.41);const key='mf_ach_'+me+'_'+(me==='נועה'?new Date().toISOString().slice(0,7):keyDate);if(val>=goal&&!localStorage.getItem(key)){localStorage.setItem(key,'1');const o=document.createElement('div');o.className='mfAch';o.innerHTML=`<div class="mfAchCard"><div class="mfAchEmoji">🎯</div><h2>${esc(me)} הגיע/ה ליעד!</h2><p>${F(val)} — ממשיכים קדימה.</p><button class="btn p">איזה כיף ✨</button></div>`;document.body.appendChild(o);q('button',o).onclick=()=>o.remove();o.onclick=e=>{if(e.target===o)o.remove()};setTimeout(()=>o.remove(),2400)}}

function bindStaticEvents(){document.addEventListener('click',e=>{const row=e.target.closest('#hist .txn[data-txid]');if(row&&!e.target.closest('button'))editTx(row.dataset.txid)},false);const saveBtn=[...document.querySelectorAll('#add button')].find(b=>(b.getAttribute('onclick')||'').includes('saveTx'));saveBtn?.addEventListener('click',()=>{const a=+q('#amount')?.value||0;if(a)pendingCash={kind:q('#kout')?.classList.contains('on')?'expense':'income',amount:a}},true);window.addEventListener('mf:data-loaded',()=>{if(pendingCash){cashPop(pendingCash.kind,pendingCash.amount);pendingCash=null}afterData()});window.addEventListener('mf:view',e=>{animateView(e.detail?.view);if(e.detail?.view==='goals')applyGoals()});window.addEventListener('mf:rendered',()=>{ensureGoalUI();ensureHistorySort();setupMoreData();updateScope()});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&sess&&hid){loadNotifs();refreshMembers()}})}
async function afterData(){await detectPerson();applyDefaults();ensureGoalUI();ensureHistorySort();setupMoreData();ensureSocialUI();await loadNotifs();updateBell();setupRealtime();checkAchievements()}
async function init(){if(started)return;started=true;ensureJoinExisting();ensureEditOverlay();ensureGoalEditor();ensureSocialUI();ensureHistorySort();setupMoreData();bindStaticEvents();animateView('home');if(typeof sess!=='undefined'&&sess&&hid)await afterData();setTimeout(()=>{if(sess&&hid)afterData()},700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
(()=>{const Q=(s,r=document)=>r.querySelector(s),QA=(s,r=document)=>[...r.querySelectorAll(s)];let started=false,lastSig='';function parseMoney(el){if(!el)return null;const t=(el.textContent||'').replace(/[,₪\s]/g,'');return /^[-+]?\d+(?:\.\d+)?$/.test(t)?+t:null}function fmt(v){return '₪'+Math.round(v).toLocaleString('he-IL')}function countTo(el,target,dur=760){if(!el||!Number.isFinite(target))return;const st=performance.now();el.classList.remove('mfCountGlow');void el.offsetWidth;el.classList.add('mfCountGlow');const f=n=>{let p=Math.min(1,(n-st)/dur),e=1-Math.pow(1-p,4);el.textContent=fmt(target*e);p<1?requestAnimationFrame(f):el.textContent=fmt(target)};requestAnimationFrame(f)}function animateMoney(){if(typeof showM!=='undefined'&&!showM)return;['joint','itay','noa','mi','me','ms','weekIncomeHome','weekExpenseHome','weekSavingHome'].forEach(id=>{const el=document.getElementById(id),v=parseMoney(el);if(v!==null)countTo(el,v,id==='joint'?920:650)})}function animateBars(){QA('#home .prog i,#goals .prog i').forEach((el,i)=>{const target=Math.max(0,Math.min(100,parseFloat(el.style.width)||0));el.dataset.mfTarget=target;el.style.transition='none';el.style.width='0%';el.getBoundingClientRect();requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.transition='width 1s cubic-bezier(.16,1,.3,1)';el.style.width=el.dataset.mfTarget+'%';el.classList.add('mfBarPulse');setTimeout(()=>el.classList.remove('mfBarPulse'),1050)}))})}function journeyData(range='all'){if(typeof rs!=='function')return[];let base=(+set.itay_start_capital||72000)+(+set.noa_start_capital||37000),rows=[...rs()].filter(x=>!x.virtual).sort((a,b)=>String(a.transaction_date).localeCompare(String(b.transaction_date)));let full=[{d:rows[0]?.transaction_date||new Date().toISOString().slice(0,10),v:base}];for(const x of rows){base+=x.kind==='income'?+x.amount:-x.amount;full.push({d:String(x.transaction_date).slice(0,10),v:base})}if(full.length===1)full.push({d:new Date().toISOString().slice(0,10),v:base});if(range==='all')return full;const days=range==='week'?7:range==='month'?30:365,cut=new Date();cut.setHours(0,0,0,0);cut.setDate(cut.getDate()-days);let before=full[0],filtered=[];for(const pt of full){const d=new Date(pt.d+'T00:00:00');if(d<cut)before=pt;else filtered.push(pt)}if(!filtered.length)return [before,full.at(-1)];return [{d:cut.toISOString().slice(0,10),v:before.v},...filtered]}
let mfJourneyRange='all';
const mfRangeLabels={week:'שבוע אחרון',month:'חודש אחרון',year:'שנה אחרונה',all:'מההתחלה'};
function ensureJourney(){const home=Q('#home');if(!home)return null;let c=Q('#mfCapitalJourney');if(c)return c;c=document.createElement('div');c.id='mfCapitalJourney';c.className='c';c.innerHTML='<div class="sectiontitle"><h2>📈 ההון לאורך הדרך</h2><div class="mfRangeWrap"><button id="mfJourneyRangeBtn" class="badge" type="button">מההתחלה ▾</button><div id="mfJourneyRangeMenu" class="mfRangeMenu"><button data-range="week">שבוע אחרון</button><button data-range="month">חודש אחרון</button><button data-range="year">שנה אחרונה</button><button data-range="all">מההתחלה</button></div></div></div><div id="mfJourneyDelta" class="mut sm"></div><div id="mfJourneyChart"></div>';const quick=home.querySelector('.quick'),hero=home.querySelector('.hero');(quick||hero)?.after(c);Q('#mfJourneyRangeBtn',c).onclick=e=>{e.stopPropagation();Q('#mfJourneyRangeMenu',c).classList.toggle('on')};Q('#mfJourneyRangeMenu',c).onclick=e=>{const b=e.target.closest('button[data-range]');if(!b)return;mfJourneyRange=b.dataset.range;Q('#mfJourneyRangeBtn',c).textContent=mfRangeLabels[mfJourneyRange]+' ▾';Q('#mfJourneyRangeMenu',c).classList.remove('on');drawJourney(true)};document.addEventListener('click',()=>Q('#mfJourneyRangeMenu',c)?.classList.remove('on'));return c}
function drawJourney(force=false){const c=ensureJourney(),box=Q('#mfJourneyChart'),delta=Q('#mfJourneyDelta');if(!c||!box)return;const data=journeyData(mfJourneyRange),sig=mfJourneyRange+'|'+data.map(x=>x.d+':'+x.v).join('|');if(!force&&sig===lastSig)return;lastSig=sig;const W=340,H=150,p=16,min=Math.min(...data.map(x=>x.v)),max=Math.max(...data.map(x=>x.v)),rng=Math.max(1,max-min),X=i=>p+(W-2*p)*(data.length===1?0:i/(data.length-1)),Y=v=>H-p-(H-2*p)*(v-min)/rng,pts=data.map((d,i)=>[X(i),Y(d.v)]),line=pts.map(a=>a.join(',')).join(' '),area=`${p},${H-p} ${line} ${W-p},${H-p}`,net=data.at(-1).v-data[0].v;delta.innerHTML=`${mfRangeLabels[mfJourneyRange]} · שינוי: <b class="${net>=0?'good':'bad'}">${net>=0?'+':'−'}${fmt(Math.abs(net))}</b>`;box.innerHTML=`<svg id="mfJourneySvg" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="mfJourneyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#43d7c8" stop-opacity=".34"/><stop offset="1" stop-color="#43d7c8" stop-opacity="0"/></linearGradient></defs><polygon class="mfJourneyArea" points="${area}"/><polyline class="mfJourneyLine" points="${line}"/>${pts.map((a,i)=>`<circle class="mfJourneyPoint" style="animation-delay:${Math.min(i*45,500)}ms" cx="${a[0]}" cy="${a[1]}" r="3.2"/>`).join('')}</svg>`;const l=Q('.mfJourneyLine',box);if(l){const len=l.getTotalLength();l.style.strokeDasharray=len;l.style.strokeDashoffset=len;l.getBoundingClientRect();l.style.transition='stroke-dashoffset 1.05s cubic-bezier(.2,.8,.2,1)';l.style.strokeDashoffset='0'}}
function personNet(person,k=0){try{return (ws(-k).a||[]).filter(x=>x.person===person).reduce((s,x)=>s+(x.kind==='income'?+x.amount:-x.amount),0)}catch{return 0}}function streak(){const p=window.__mfCurrentPerson||'איתי';let n=0;for(let k=0;k<52;k++){if(personNet(p,k)>0)n++;else break}return n}function ensureStreak(){const ha=Q('header .ha');if(!ha)return;let b=Q('#mfStreak');if(!b){b=document.createElement('button');b.id='mfStreak';b.className='ib';b.type='button';b.onclick=openStreak;ha.appendChild(b)}b.innerHTML=`🔥<small>${streak()}</small>`}function openStreak(){Q('.mfStreakOverlayV43')?.remove();const p=window.__mfCurrentPerson||'איתי',n=streak(),vals=[0,1,2,3].map(k=>personNet(p,k)),o=document.createElement('div');o.className='mfStreakOverlayV43';o.innerHTML=`<div class="mfStreakCardV43"><div style="font-size:46px">🔥</div><h2>${n} שבועות ברצף</h2><div class="mut sm">${p} · שבועות עם חיסכון חיובי</div><div class="mfStreakGridV43">${vals.map((v,i)=>`<div class="mini"><span class="mut sm">${i?'לפני '+i+' שבועות':'השבוע'}</span><b>${fmt(v)}</b></div>`).join('')}</div><button class="btn p" style="width:100%">סגור</button></div>`;document.body.appendChild(o);Q('button',o).onclick=()=>o.remove();o.onclick=e=>{if(e.target===o)o.remove()}}function ripple(){document.addEventListener('pointerdown',e=>{const b=e.target.closest('button,.q');if(!b)return;const r=document.createElement('i'),z=b.getBoundingClientRect();r.className='mfRipple';r.style.left=(e.clientX-z.left)+'px';r.style.top=(e.clientY-z.top)+'px';r.style.width=r.style.height=Math.max(z.width,z.height)/3+'px';b.appendChild(r);setTimeout(()=>r.remove(),520)},{passive:true})}function cards(){QA('#home>.c,#home>.quick').filter(el=>!el.classList.contains('hero')).slice(0,12).forEach((el,i)=>{el.classList.remove('mfAliveCard');el.style.animationDelay=i*28+'ms';void el.offsetWidth;el.classList.add('mfAliveCard')})}function run(){ensureStreak();drawJourney(true);requestAnimationFrame(()=>{animateMoney();animateBars();cards()})}function init(){if(started)return;started=true;ripple();ensureStreak();ensureJourney();window.addEventListener('mf:data-loaded',()=>setTimeout(run,40));window.addEventListener('mf:rendered',()=>{ensureStreak();drawJourney()});window.addEventListener('mf:view',e=>{if(e.detail?.view==='home')setTimeout(run,40)});Q('#eye')?.addEventListener('click',()=>setTimeout(animateMoney,40));setTimeout(()=>{ensureStreak();drawJourney(true)},900)}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init()})();

(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
let selectedMonth='';
function injectStyle(){if(q('#mfAnalysisMonthStyle'))return;const s=document.createElement('style');s.id='mfAnalysisMonthStyle';s.textContent=`
#mfMonthCompareCard .mfMonthControls{display:flex;gap:8px;align-items:center;margin:10px 0 14px}
#mfMonthCompareCard select{margin:0;flex:1}
#mfMonthSummary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
#mfMonthSummary .mini{text-align:center}
#mfMonthBars{display:flex;align-items:flex-end;gap:10px;min-height:190px;padding:14px 4px 4px;border-top:1px solid rgba(255,255,255,.05)}
.mfWeekCol{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:7px}
.mfBarPair{height:145px;width:100%;display:flex;align-items:flex-end;justify-content:center;gap:5px}
.mfMonthBar{width:min(34%,26px);height:0;border-radius:7px 7px 3px 3px;transition:height .72s cubic-bezier(.2,.8,.2,1),filter .2s ease;box-shadow:0 8px 20px rgba(0,0,0,.18)}
.mfMonthBar.inc{background:linear-gradient(180deg,#63e9dc,#35bfb3)}
.mfMonthBar.exp{background:linear-gradient(180deg,#ff8fa0,#e65f76)}
.mfMonthBar.mfGrow{filter:drop-shadow(0 0 8px rgba(67,215,200,.18))}
.mfWeekLbl{font-size:10px;color:var(--m);white-space:nowrap}
.mfMonthLegend{display:flex;gap:14px;justify-content:center;margin-top:8px;font-size:11px;color:var(--m)}
.mfMonthLegend i{width:9px;height:9px;border-radius:3px;display:inline-block;margin-left:5px}
.mfMonthLegend .i{background:var(--a)}.mfMonthLegend .e{background:var(--r)}
@media(max-width:360px){#mfMonthSummary{grid-template-columns:1fr 1fr}.mfWeekLbl{font-size:9px}}
`;document.head.appendChild(s)}
function removeOldGoalCards(){const g=q('#goals');if(!g)return;qa(':scope > .c',g).forEach(c=>{const h=c.querySelector('h2')?.textContent.trim();if(h==='מענקים צפויים'||h==='עריכת יעדים')c.remove()})}
function monthKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function monthLabel(k){const [y,m]=k.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('he-IL',{month:'long',year:'numeric'})}
function availableMonths(){let s=new Set();try{(typeof rs==='function'?rs():[]).forEach(x=>s.add(String(x.transaction_date).slice(0,7)))}catch{};s.add(monthKey(new Date()));return [...s].sort().reverse()}
function ensureCard(){const a=q('#analysis');if(!a)return null;let c=q('#mfMonthCompareCard');if(c)return c;c=document.createElement('div');c.id='mfMonthCompareCard';c.className='c';c.innerHTML=`<div class="sectiontitle"><h2>הכנסות מול הוצאות · לפי חודש</h2><span class="badge">חודשי</span></div><div class="mfMonthControls"><select id="mfMonthSelect"></select></div><div id="mfMonthSummary"></div><div id="mfMonthBars"></div><div class="mfMonthLegend"><span><i class="i"></i>הכנסות</span><span><i class="e"></i>הוצאות</span></div>`;const chartCard=qa(':scope > .c',a).find(x=>x.querySelector('h2')?.textContent.trim()==='גרף חודשי');chartCard?.before(c)||a.appendChild(c);q('#mfMonthSelect',c).addEventListener('change',e=>{selectedMonth=e.target.value;renderMonth(true)});return c}
function weekBuckets(k){const [y,m]=k.split('-').map(Number),last=new Date(y,m,0).getDate(),rows=typeof rs==='function'?rs():[];const out=[];for(let start=1;start<=last;start+=7){const end=Math.min(last,start+6),a=rows.filter(x=>{const d=String(x.transaction_date).slice(0,10);if(!d.startsWith(k))return false;const day=+d.slice(8,10);return day>=start&&day<=end});const i=a.filter(x=>x.kind==='income').reduce((s,x)=>s+(+x.amount||0),0),e=a.filter(x=>x.kind==='expense').reduce((s,x)=>s+(+x.amount||0),0);out.push({start,end,i,e})}return out}
function renderMonth(animate=true){const c=ensureCard();if(!c)return;const months=availableMonths();if(!selectedMonth||!months.includes(selectedMonth))selectedMonth=months[0];const sel=q('#mfMonthSelect');sel.innerHTML=months.map(k=>`<option value="${k}" ${k===selectedMonth?'selected':''}>${monthLabel(k)}</option>`).join('');const b=weekBuckets(selectedMonth),inc=b.reduce((s,x)=>s+x.i,0),exp=b.reduce((s,x)=>s+x.e,0),net=inc-exp,Fm=n=>'₪'+Math.round(n||0).toLocaleString('he-IL');q('#mfMonthSummary').innerHTML=`<div class="mini"><span class="mut sm">הכנסות</span><b class="plus">${Fm(inc)}</b></div><div class="mini"><span class="mut sm">הוצאות</span><b class="minus">${Fm(exp)}</b></div><div class="mini"><span class="mut sm">נטו</span><b class="${net>=0?'good':'bad'}">${net>=0?'+':'−'}${Fm(Math.abs(net))}</b></div>`;const mx=Math.max(1,...b.flatMap(x=>[x.i,x.e]));q('#mfMonthBars').innerHTML=b.map((x,i)=>`<div class="mfWeekCol"><div class="mfBarPair"><i class="mfMonthBar inc" data-h="${x.i/mx*100}"></i><i class="mfMonthBar exp" data-h="${x.e/mx*100}"></i></div><span class="mfWeekLbl">${x.start}–${x.end}</span></div>`).join('');requestAnimationFrame(()=>requestAnimationFrame(()=>qa('.mfMonthBar',c).forEach((el,i)=>{el.style.height=(animate?0:+el.dataset.h)+'%';if(animate)setTimeout(()=>{el.classList.add('mfGrow');el.style.height=el.dataset.h+'%'},40+i*45)})))}
function refresh(){injectStyle();removeOldGoalCards();ensureCard();renderMonth(false)}
function init(){injectStyle();removeOldGoalCards();ensureCard();renderMonth(true);window.addEventListener('mf:rendered',()=>{removeOldGoalCards();renderMonth(false)});window.addEventListener('mf:data-loaded',()=>renderMonth(true));window.addEventListener('mf:view',e=>{if(e.detail?.view==='analysis')setTimeout(()=>renderMonth(true),40)})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();

;(()=>{
  function cashPopV46(kind,amount){
    document.querySelector('.mfCashPop')?.remove();
    const d=document.createElement('div');
    d.className='mfCashPop '+kind;
    d.innerHTML=`${kind==='expense'?'−':'+'}₪${Math.round(amount).toLocaleString('he-IL')}<small>${kind==='expense'?'הוצאה נוספה':'הכנסה נוספה'}</small>`;
    document.body.appendChild(d);
    try{navigator.vibrate?.(kind==='expense'?[18]:[12,28,12])}catch{}
    setTimeout(()=>d.remove(),1150);
  }
  function install(){
    if(window.__mfCashWrapV46||typeof window.saveTx!=='function')return false;
    const old=window.saveTx;
    window.saveTx=async function(){
      const el=document.getElementById('amount');
      const amount=+(el?.value||0);
      const before=el?.value;
      const kind=document.getElementById('kout')?.classList.contains('on')?'expense':'income';
      try{if(typeof pendingCash!=='undefined')pendingCash=null}catch{}
      const out=await old.apply(this,arguments);
      if(amount>0&&before&&el?.value==='') setTimeout(()=>cashPopV46(kind,amount),60);
      return out;
    };
    window.__mfCashWrapV46=1;
    return true;
  }
  if(!install()){
    let n=0; const t=setInterval(()=>{if(install()||++n>40)clearInterval(t)},100);
  }
})();

;(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
window.__mfHistoryRange='all';
function ensureHistoryRange(){
  const card=q('#history .c'); if(!card||q('#mfHistoryRange')) return;
  const box=document.createElement('div'); box.id='mfHistoryRange';
  box.innerHTML='<span class="mut sm">טווח זמן</span><div class="mfRangeBtns"><button data-days="0">היום</button><button data-days="3">3 ימים</button><button data-days="7">שבוע</button><button data-days="30">חודש</button><button data-days="all" class="on">הכול</button></div>';
  const anchor=q('#mfHistorySort')||q('#fm')||card.querySelector('.g2'); anchor?.after(box);
  box.addEventListener('click',e=>{const b=e.target.closest('button[data-days]'); if(!b)return; window.__mfHistoryRange=b.dataset.days; qa('button',box).forEach(x=>x.classList.toggle('on',x===b)); window.historyR?.();});
}
function inRange(x){
  const r=window.__mfHistoryRange||'all'; if(r==='all') return true;
  const d=new Date(String(x.transaction_date).slice(0,10)+'T00:00:00'); if(Number.isNaN(+d))return true;
  const now=new Date(); now.setHours(0,0,0,0);
  if(r==='0') return d.getTime()===now.getTime();
  const days=+r; const cut=new Date(now); cut.setDate(cut.getDate()-(days-1)); return d>=cut&&d<=now;
}
function install(){
  if(typeof window.historyR!=='function'||window.__mfHistoryRangeInstalled)return false;
  window.historyR=function(){
    let qq=search.value.trim(),o=fo.value,k=fk.value,m=fm.value,
    a=rs().filter(x=>(!qq||[x.person,x.category,x.note].join(' ').includes(qq))&&(!o||x.person===o)&&(!k||x.kind===k)&&(!m||x.transaction_date.startsWith(m))&&inRange(x));
    let sbx=window.__mfHistorySort||{by:'date',dir:'desc'};
    a.sort((A,B)=>{let c=sbx.by==='amount'?((+A.amount||0)-(+B.amount||0)):String(A.transaction_date||'').localeCompare(String(B.transaction_date||''));return sbx.dir==='asc'?c:-c});
    hist.innerHTML=a.length?a.map(x=>`<div class="txn" data-txid="${esc(x.id)}"><div><b>${esc(x.category)}</b><div class="mut sm">${x.person} · ${new Date(x.transaction_date+'T00:00:00').toLocaleDateString('he-IL')}${x.virtual?' · קבוע':''}</div></div><div><b class="${x.kind==='income'?'plus':'minus'}">${x.kind==='income'?'+':'-'}${F(x.amount)}</b>${x.virtual?'':`<br><button class="btn d" style="min-height:32px" onclick="event.stopPropagation();del('${x.id}')">מחיקה</button>`}</div></div>`).join(''):'<p class=mut>אין תנועות בטווח הזה.</p>';
  };
  window.__mfHistoryRangeInstalled=1; ensureHistoryRange(); return true;
}
const boot=()=>{ensureHistoryRange(); if(!install()) setTimeout(boot,120)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.addEventListener('mf:rendered',ensureHistoryRange); window.addEventListener('mf:view',e=>{if(e.detail?.view==='history')setTimeout(ensureHistoryRange,0)});
})();
;(()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];window.__mfHistCustom={from:'',to:''};function ui(){let b=q('#mfHistoryRange');if(!b||q('#mfHistCustom'))return;let d=document.createElement('div');d.id='mfHistCustom';d.innerHTML='<input id="mfFrom" type="date"><input id="mfTo" type="date"><button id="mfClear">ניקוי</button>';b.after(d);let a=()=>{window.__mfHistCustom={from:q('#mfFrom').value,to:q('#mfTo').value};window.__mfHistoryRange=(window.__mfHistCustom.from||window.__mfHistCustom.to)?'custom':'all';qa('#mfHistoryRange button').forEach(x=>x.classList.remove('on'));historyR()};q('#mfFrom').onchange=a;q('#mfTo').onchange=a;q('#mfClear').onclick=()=>{q('#mfFrom').value=q('#mfTo').value='';window.__mfHistCustom={from:'',to:''};window.__mfHistoryRange='all';q('#mfHistoryRange button[data-days="all"]')?.classList.add('on');historyR()}}
function install(){if(window.__mfHistCustomInstalled||typeof historyR!=='function')return false;const old=historyR;window.historyR=function(){if(window.__mfHistoryRange!=='custom')return old();let c=window.__mfHistCustom||{},qq=search.value.trim(),o=fo.value,k=fk.value,m=fm.value,a=rs().filter(x=>{let d=String(x.transaction_date).slice(0,10);return(!qq||[x.person,x.category,x.note].join(' ').includes(qq))&&(!o||x.person===o)&&(!k||x.kind===k)&&(!m||d.startsWith(m))&&(!c.from||d>=c.from)&&(!c.to||d<=c.to)});let s=window.__mfHistorySort||{by:'date',dir:'desc'};a.sort((A,B)=>{let z=s.by==='amount'?(+A.amount-+B.amount):String(A.transaction_date).localeCompare(String(B.transaction_date));return s.dir==='asc'?z:-z});hist.innerHTML=a.length?a.map(x=>`<div class="txn" data-txid="${esc(x.id)}"><div><b>${esc(x.category)}</b><div class="mut sm">${x.person} · ${new Date(x.transaction_date+'T00:00:00').toLocaleDateString('he-IL')}</div></div><div><b class="${x.kind==='income'?'plus':'minus'}">${x.kind==='income'?'+':'-'}${F(x.amount)}</b></div></div>`).join(''):'<p class=mut>אין תנועות בטווח הזה.</p>';};window.__mfHistCustomInstalled=1;ui();return true}function boot(){ui();if(!install())setTimeout(boot,100)}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();window.addEventListener('mf:view',e=>{if(e.detail?.view==='history')setTimeout(ui,0)})})();


;(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s);
function money(n){return '₪'+Math.round(Math.max(0,n||0)).toLocaleString('he-IL')}
function daysUntil(v){const now=new Date();now.setHours(0,0,0,0);const d=new Date(v+'T00:00:00');return Math.max(0,(d-now)/86400000)}
function ensurePaceCard(){const home=q('#home');if(!home)return null;let c=q('#mfGoalPaceCard');if(c)return c;c=document.createElement('div');c.id='mfGoalPaceCard';c.className='c';c.innerHTML='<div class="sectiontitle"><h2>🎯 כמה צריך לשים כדי להגיע ליעד?</h2><span class="badge">מתעדכן אוטומטית</span></div><div class="g2" style="margin-top:10px"><div class="mini"><span class="mut sm">איתי · בכל שבוע</span><b id="mfItayNeeded">₪0</b><div class="mut sm" id="mfItayNeededMeta" style="margin-top:5px"></div></div><div class="mini"><span class="mut sm">נועה · בכל חודש</span><b id="mfNoaNeeded">₪0</b><div class="mut sm" id="mfNoaNeededMeta" style="margin-top:5px"></div></div></div>';const quick=home.querySelector('.quick');const week=[...home.children].find(x=>x.querySelector?.('h2')?.textContent.trim()==='השבוע');(week||quick)?.before(c);return c}
function renderPace(){const c=ensurePaceCard();if(!c||typeof set==='undefined')return;const goalDate=set.itay_release_date||'2027-04-04',days=daysUntil(goalDate),weeks=Math.max(1,days/7),months=Math.max(1,days/30.4375);const itGoal=+set.itay_release_goal||150000,noGoal=+set.noa_goal||130000;const itGrant=15000,noGrant=25000;const inv=(typeof invVals==='function'?invVals():{iv:0,nv:0});const itInvest=Math.max(0,+inv.iv||0),noInvest=Math.max(0,+inv.nv||0);const itNeed=Math.max(0,(itGoal-itInvest-itGrant)/weeks),noNeed=Math.max(0,(noGoal-noInvest-noGrant)/months);q('#mfItayNeeded').textContent=money(itNeed);q('#mfNoaNeeded').textContent=money(noNeed);q('#mfItayNeededMeta').textContent=Math.ceil(weeks)+' שבועות · השקעה '+money(itInvest)+' · מענק '+money(itGrant);q('#mfNoaNeededMeta').textContent=Math.ceil(months)+' חודשים · השקעה '+money(noInvest)+' · מענקים '+money(noGrant)}
function init(){ensurePaceCard();renderPace();window.addEventListener('mf:data-loaded',()=>setTimeout(renderPace,40));window.addEventListener('mf:rendered',renderPace);window.addEventListener('mf:view',e=>{if(e.detail?.view==='home')setTimeout(renderPace,20)})}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();})();

;(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
function units(){return{it:+set.inv_itay_units||14170,no:+set.inv_noa_units||7179.467}}
function values(){const u=units(),p=+(set.inv_price_agorot||localStorage.getItem('mf_inv_price_agorot')||0);return{u,p,iv:u.it*p/100,nv:u.no*p/100,j:(u.it+u.no)*p/100}}
function fmtUnits(n){return (+n||0).toLocaleString('he-IL',{maximumFractionDigits:3})}
function renderInvV54(){
 const x=values(),pp=+(set.inv_prev_price_agorot||localStorage.getItem('mf_inv_prev_price_agorot')||0),tot=x.u.it+x.u.no,itShare=tot?x.u.it/tot*100:0,noShare=tot?x.u.no/tot*100:0;
 const dm=n=>showM?F(n):'•••••• ₪';
 if(q('#invItay'))q('#invItay').textContent=x.p?dm(x.iv):'הזן שער'; if(q('#invNoa'))q('#invNoa').textContent=x.p?dm(x.nv):'הזן שער'; if(q('#invJoint'))q('#invJoint').textContent=x.p?dm(x.j):'הזן שער';
 if(q('#invPriceLabel'))q('#invPriceLabel').textContent=x.p?x.p.toFixed(2)+' אג׳':'לא הוגדר';
 if(q('#invPageJoint'))q('#invPageJoint').textContent=x.p?dm(x.j):'הזן שער'; if(q('#invPageItay'))q('#invPageItay').textContent=x.p?dm(x.iv):'—'; if(q('#invPageNoa'))q('#invPageNoa').textContent=x.p?dm(x.nv):'—';
 if(q('#invPagePrice'))q('#invPagePrice').textContent=x.p?x.p.toFixed(2)+' אג׳':'לא הוגדר'; if(q('#invItayShare'))q('#invItayShare').textContent=itShare.toFixed(1)+'%'; if(q('#invNoaShare'))q('#invNoaShare').textContent=noShare.toFixed(1)+'%';
 if(q('#invItayBar'))q('#invItayBar').style.width=itShare+'%'; if(q('#invNoaBar'))q('#invNoaBar').style.width=noShare+'%'; if(q('#invPriceInput'))q('#invPriceInput').value=x.p||'';
 if(q('#invPageChange')){if(x.p&&pp){const prev=tot*pp/100,d=x.j-prev;q('#invPageChange').innerHTML=`<span class="${d>=0?'good':'bad'}">${d>=0?'+':'-'}${F(Math.abs(d))} (${((x.p-pp)/pp*100).toFixed(2)}%)</span>`}else q('#invPageChange').textContent='אין עדכון קודם'}
 const card=q('#investCard'),ss=card?qa('.mini .mut.sm',card):[]; if(ss[0])ss[0].textContent=`איתי · ${fmtUnits(x.u.it)} יח׳`;if(ss[1])ss[1].textContent=`נועה · ${fmtUnits(x.u.no)} יח׳`;
 qa('#investment .rank').forEach(r=>{const a=r.querySelector('span'),b=r.querySelector('b');if(!a||!b)return;const t=a.textContent.trim();if(t==='יחידות'){const who=r.closest('.c')?.querySelector('.mut.sm')?.textContent.trim();if(who==='איתי')b.textContent=fmtUnits(x.u.it);if(who==='נועה')b.textContent=fmtUnits(x.u.no)}if(t==='סה״כ יחידות')b.textContent=fmtUnits(tot)});
 if(q('#mfInvUnitsNow'))q('#mfInvUnitsNow').textContent=`כמות נוכחית · איתי ${fmtUnits(x.u.it)} · נועה ${fmtUnits(x.u.no)}`;
}
function hideCards(){const home=q('#home');if(!home)return;qa(':scope > .c',home).forEach(c=>{const t=(c.querySelector('h2')?.textContent||'').trim();if(t==='מדד השבוע'||t==='תובנת השבוע')c.style.display='none'})}
function ensureUnitsUI(){const sec=q('#investment');if(!sec||q('#mfInvUnitsCard'))return;const c=document.createElement('div');c.id='mfInvUnitsCard';c.className='c';c.innerHTML='<h2>➕ הוספת מניות / יחידות</h2><div class="mut sm">בחר למי שייכת הקנייה והזן כמה יחידות נוספו.</div><div class="g2" style="margin-top:10px"><select id="mfInvBuyer"><option>איתי</option><option>נועה</option></select><input id="mfInvAddUnits" type="number" inputmode="decimal" step="0.001" placeholder="מספר יחידות שנקנו"></div><button id="mfInvAddBtn" class="btn p" style="width:100%;margin-top:9px">הוסף להשקעה</button><div id="mfInvUnitsNow" class="mut sm" style="margin-top:9px"></div>';const price=qa(':scope > .c',sec).find(x=>(x.querySelector('h2')?.textContent||'').trim()==='עדכון שער');(price||sec.lastElementChild)?.after(c);q('#mfInvAddBtn').onclick=addUnits;renderInvV54()}
async function addUnits(){const who=q('#mfInvBuyer').value,add=+q('#mfInvAddUnits').value;if(!(add>0))return t('הכנס מספר יחידות');const key=who==='נועה'?'inv_noa_units':'inv_itay_units',base=+(set[key]||(who==='נועה'?7179.467:14170)),next=base+add,b=q('#mfInvAddBtn');b.disabled=true;b.textContent='שומר…';const r=await sb.from('mf_settings').update({[key]:next,updated_at:new Date().toISOString()}).eq('household_id',hid);b.disabled=false;b.textContent='הוסף להשקעה';if(r.error)return t('לא נשמר');set[key]=next;q('#mfInvAddUnits').value='';renderInvV54();window.dispatchEvent(new CustomEvent('mf:data-loaded'));t('היחידות נוספו ✓')}
function install(){window.invVals=()=>{const x=values();return{p:x.p,iv:x.iv,nv:x.nv,j:x.j}};window.renderInvestment=renderInvV54;if(!window.__mfPrivacy54){window.privacy=function(){showM=!showM;if(q('#eye'))q('#eye').textContent=showM?'🙈':'👁️';render();renderInvV54()};window.__mfPrivacy54=1}hideCards();ensureUnitsUI();renderInvV54()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();window.addEventListener('mf:rendered',()=>setTimeout(install,0));window.addEventListener('mf:data-loaded',()=>setTimeout(install,20));window.addEventListener('mf:view',e=>{if(e.detail?.view==='investment'||e.detail?.view==='home')setTimeout(install,10)});
})();
// INV_UNITS_PRIVACY_CLEAN_DASH_V54_VERIFIED

;(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
window.__mfHistRange=window.__mfHistRange||'week';
function dayLabel(ds){const d=new Date(ds+'T00:00:00'),n=new Date();n.setHours(0,0,0,0);const y=new Date(n);y.setDate(y.getDate()-1);if(+d===+n)return 'היום';if(+d===+y)return 'אתמול';return d.toLocaleDateString('he-IL',{weekday:'long',day:'numeric',month:'long'})}
function rangeOk(x){const r=window.__mfHistRange;if(r==='all'||r==='month')return true;const d=new Date(String(x.transaction_date).slice(0,10)+'T00:00:00'),n=new Date();n.setHours(0,0,0,0);const cut=new Date(n);cut.setDate(cut.getDate()-(r==='today'?0:r==='3d'?2:6));return d>=cut&&d<=n}
function ensureUI(){const card=q('#history .c'),hist=q('#hist');if(!card||!hist)return;let range=q('#mfHistoryRangeV59');if(!range){range=document.createElement('div');range.id='mfHistoryRangeV59';range.innerHTML='<div class="mfRangeBtnsV59"><button data-r="today">היום</button><button data-r="3d">3 ימים</button><button data-r="week">שבוע</button><button data-r="month">חודש</button><button data-r="all">הכול</button></div>';q('#fm')?.after(range);range.onclick=e=>{const b=e.target.closest('button[data-r]');if(!b)return;window.__mfHistRange=b.dataset.r;if(b.dataset.r==='month'){const d=new Date();q('#fm').value=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}else q('#fm').value='';historyR()}}range.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.r===window.__mfHistRange));let s=q('#mfHistSummaryV59');if(!s){s=document.createElement('div');s.id='mfHistSummaryV59';s.className='mfHistSummaryV59';hist.before(s)}}
function install(){if(window.__mfHist59||typeof historyR!=='function')return false;window.historyR=function(){ensureUI();const qq=(q('#search')?.value||'').trim(),o=q('#fo')?.value||'',k=q('#fk')?.value||'',m=q('#fm')?.value||'';let a=rs().filter(x=>x.category!=='משכורת צבאית'&&rangeOk(x)&&(!qq||[x.person,x.category,x.note].join(' ').includes(qq))&&(!o||x.person===o)&&(!k||x.kind===k)&&(!m||String(x.transaction_date).startsWith(m)));a.sort((A,B)=>String(B.transaction_date).localeCompare(String(A.transaction_date)));const inc=a.filter(x=>x.kind==='income').reduce((s,x)=>s+ +x.amount,0),exp=a.filter(x=>x.kind==='expense').reduce((s,x)=>s+ +x.amount,0),net=inc-exp;q('#mfHistSummaryV59').innerHTML='<div class="mfHistStatV59 in"><span>הכנסות</span><b>'+F(inc)+'</b></div><div class="mfHistStatV59 ex"><span>הוצאות</span><b>'+F(exp)+'</b></div><div class="mfHistNetV59"><span>נטו</span><b class="'+(net>=0?'plus':'minus')+'">'+F(net)+'</b></div>';let out='',last='';for(const x of a){const ds=String(x.transaction_date).slice(0,10);if(ds!==last){out+='<div class="mfDayHead">'+dayLabel(ds)+'<span>'+new Date(ds+'T00:00:00').toLocaleDateString('he-IL')+'</span></div>';last=ds}out+='<div class="mfHistRowV59"><div class="mfHistIconV59 '+x.kind+'">'+(x.kind==='income'?'＋':'−')+'</div><div class="mfHistInfoV59"><b>'+esc(x.category||'אחר')+'</b><span>'+esc(x.person)+(x.note?' · '+esc(x.note):'')+'</span></div><div class="mfHistAmtV59 '+(x.kind==='income'?'plus':'minus')+'">'+(x.kind==='income'?'+':'−')+F(x.amount)+'</div></div>'}q('#hist').innerHTML=out||'<div class="empty">אין תנועות בתקופה הזו</div>';ensureUI()};window.__mfHist59=1;return true}
function boot(){ensureUI();if(!install())setTimeout(boot,80);else historyR()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();window.addEventListener('mf:view',e=>{if(e.detail?.view==='history')setTimeout(()=>historyR(),0)})
})();
// HISTORY_GROUPED_V59_VERIFIED

;(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const money=n=>'₪'+Math.round(+n||0).toLocaleString('he-IL');
function inv(){const it=+(set?.inv_itay_units||14170),no=+(set?.inv_noa_units||7179.467),p=+(set?.inv_price_agorot||localStorage.getItem('mf_inv_price_agorot')||0);return{it,no,p,iv:it*p/100,nv:no*p/100,j:(it+no)*p/100}}
function paintInvestment(){const x=inv(),dm=n=>showM?money(n):'•••••• ₪';[['#invItay',x.iv],['#invNoa',x.nv],['#invJoint',x.j],['#invPageJoint',x.j],['#invPageItay',x.iv],['#invPageNoa',x.nv]].forEach(([s,v])=>{const el=q(s);if(el)el.textContent=x.p?dm(v):(s==='#invPageItay'||s==='#invPageNoa'?'—':'הזן שער')});const labs=qa('#investCard .mini .mut.sm');if(labs[0])labs[0].textContent='איתי · '+x.it.toLocaleString('he-IL',{maximumFractionDigits:3})+' יח׳';if(labs[1])labs[1].textContent='נועה · '+x.no.toLocaleString('he-IL',{maximumFractionDigits:3})+' יח׳'}
function cardByTitle(title){return qa('#home>.c,#mfMoreWrap .c').find(c=>(c.querySelector('h2')?.textContent||'').trim()===title)}
function organizeDashboard(){const home=q('#home');if(!home)return;
 // Keep legacy calculation nodes alive but invisible.
 ['מדד השבוע','תובנת השבוע'].forEach(t=>{const c=cardByTitle(t);if(c)c.style.display='none'});
 const quick=q('#home>.quick'),scope=q('#mfScope'),journey=q('#mfCapitalJourney'),week=cardByTitle('השבוע'),pace=q('#mfGoalPaceCard'),momentum=q('#mfMomentumCard'),invest=q('#investCard');
 let anchor=quick;
 [scope,journey,week,pace,momentum,invest].filter(Boolean).forEach(el=>{if(anchor&&anchor.nextElementSibling!==el)anchor.after(el);anchor=el});
 // Less useful dashboard cards stay available, but only behind one "עוד נתונים" control.
 let wrap=q('#mfMoreWrap');if(!wrap){wrap=document.createElement('div');wrap.id='mfMoreWrap';wrap.innerHTML='<button class="mfMoreBtn" type="button">עוד נתונים</button><div class="mfSecondary"></div>';anchor?.after(wrap);q('.mfMoreBtn',wrap).onclick=e=>{const box=q('.mfSecondary',wrap);box.classList.toggle('on');e.currentTarget.textContent=box.classList.contains('on')?'פחות נתונים':'עוד נתונים'}}
 const box=q('.mfSecondary',wrap);['6 חודשים · הכנסות מול הוצאות','תחזית ליעד','השוואה לשבוע הקודם','מי מתקדם יותר השבוע?','הוצאות מובילות','תנועות אחרונות'].forEach(t=>{const c=cardByTitle(t);if(c&&c.parentElement!==box)box.appendChild(c)});
 if(anchor&&anchor.nextElementSibling!==wrap)anchor.after(wrap);
}
function installPrivacy(){window.privacy=function(){showM=!showM;const e=q('#eye');if(e)e.textContent=showM?'🙈':'👁️';
  // Avoid the old all-in-one render path; update visible areas independently so one hidden card cannot break privacy.
  try{renderHome()}catch{}try{goalsR()}catch{}try{renderCapital()}catch{}try{renderWeek()}catch{}try{renderMomentum()}catch{}try{renderInvestment()}catch{}
  paintInvestment();setTimeout(paintInvestment,30);
 };paintInvestment()}
function refresh(){organizeDashboard();installPrivacy();paintInvestment()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
window.addEventListener('mf:data-loaded',()=>setTimeout(refresh,40));window.addEventListener('mf:rendered',()=>setTimeout(refresh,0));window.addEventListener('mf:view',e=>{if(e.detail?.view==='home'||e.detail?.view==='investment')setTimeout(refresh,20)});
})();
// DASHBOARD_PRIVACY_V60_VERIFIED

;(()=>{'use strict';const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];const M=n=>'₪'+Math.round(+n||0).toLocaleString('he-IL'),D=n=>showM?M(n):'•••••• ₪';function ensure(){let h=q('#home');if(!h)return;let c=q('#mfUsefulDash');if(!c){c=document.createElement('div');c.id='mfUsefulDash';c.className='c';c.innerHTML='<div class="sectiontitle"><h2>⚡ מה חשוב עכשיו</h2><span class="badge" id="mfUsefulStatus">מתעדכן</span></div><div class="mfUsefulGrid"><div class="mini"><span class="mut sm">חיסכון החודש</span><b id="mfUsefulMonth">—</b><small>הכנסות פחות הוצאות</small></div><div class="mini"><span class="mut sm">קצב ליעד שלי</span><b id="mfUsefulPace">—</b><small id="mfUsefulPaceSub"></small></div></div><div id="mfUsefulAction" class="mfUsefulAction"></div>';let w=[...h.children].find(x=>x.querySelector?.('h2')?.textContent.trim()==='השבוע');w?.before(c)}let inv=q('#investCard');if(inv&&c.nextElementSibling!==inv)c.after(inv);qa(':scope > .c',h).forEach(x=>{let t=(x.querySelector('h2')?.textContent||'').trim();x.classList.toggle('mfDashSecondary',['6 חודשים · הכנסות מול הוצאות','תחזית ליעד','השוואה לשבוע הקודם','מי מתקדם יותר השבוע?','הוצאות מובילות','תנועות אחרונות','קוד לנועה'].includes(t))})}function renderU(){ensure();if(typeof ms!=='function')return;let p=window.__mfScopePerson||window.__mfCurrentPerson||'איתי',m=mfScopeStats(ms(0)),w=mfWeekScopeStats(ws(0)),g=p==='נועה'?(+set.noa_monthly_goal||7000):(+set.itay_weekly_goal||1779.41),v=p==='נועה'?m.s:w.s,r=Math.max(0,g-v),pct=Math.round(v/Math.max(1,g)*100);q('#mfUsefulMonth').textContent=D(m.s);q('#mfUsefulPace').textContent=pct+'%';q('#mfUsefulPaceSub').textContent=p==='נועה'?'מהיעד החודשי':'מהיעד השבועי';q('#mfUsefulStatus').textContent=pct>=100?'היעד הושג':pct>=70?'קרובים':pct>0?'מתקדמים':'מתחילים';q('#mfUsefulAction').innerHTML=r?('נשארו <b>'+M(r)+'</b> כדי להגיע ליעד '+(p==='נועה'?'החודשי.':'השבועי.')):'✅ היעד הושג כרגע.'}function inv(){try{renderInvestment()}catch{}let x=typeof invVals==='function'?invVals():null;if(!x)return;[['#invItay','iv'],['#invNoa','nv'],['#invJoint','j']].forEach(([s,k])=>{let e=q(s);if(e)e.textContent=x.p?D(x[k]):'הזן שער'})}function icon(){let l=q('#logo'),a=q('#authLogo');if(l)l.src='/icon-512.png?v=61';if(a)a.src='/icon-512.png?v=61'}function run(){ensure();renderU();inv();icon()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('mf:data-loaded',()=>setTimeout(run,20));window.addEventListener('mf:rendered',()=>setTimeout(run,0));window.addEventListener('mf:view',e=>{if(e.detail?.view==='home')setTimeout(run,20)});q('#eye')?.addEventListener('click',()=>setTimeout(()=>{inv();renderU()},0));})();
// DASH_USEFUL_ICON_PRIVACY_V61

;(()=>{'use strict';const q=(s,r=document)=>r.querySelector(s);const M=n=>'₪'+Math.round(+n||0).toLocaleString('he-IL'),D=n=>showM?M(n):'•••••• ₪';const milestones=[{v:50000,e:'🌱',n:'בסיס ראשון'},{v:100000,e:'🛡️',n:'100K ראשונים'},{v:150000,e:'🚀',n:'הון משמעותי'},{v:200000,e:'💎',n:'אבן דרך זוגית'},{v:280000,e:'🎯',n:'היעד שלנו'},{v:350000,e:'🏠',n:'מתחילים לחשוב דירה'},{v:500000,e:'🔑',n:'הון עצמי לדירה'},{v:750000,e:'🏡',n:'קפיצת מדרגה'},{v:1000000,e:'👑',n:'המיליון הראשון'}];function ensureJourney(){let h=q('#home');if(!h)return;let old=q('#mfJourney');if(!old){let c=document.createElement('div');c.id='mfJourney';c.className='c mfJourney';c.innerHTML='<div class="sectiontitle"><h2>🛣️ המסלול שלנו</h2><span class="badge">MoneyFlow Journey</span></div><div id="mfNextMilestone" class="mfNextMilestone"></div><div id="mfRoad" class="mfRoad"></div>';let inv=q('#investCard');(inv||q('#mfUsefulDash'))?.after(c)}if(!q('#mfFuture')){let c=document.createElement('div');c.id='mfFuture';c.className='c mfFuture';c.innerHTML='<div class="sectiontitle"><h2>🔮 העתיד שלנו</h2><span class="badge">תחזית</span></div><div class="mfForecastGrid"><div><span>בעוד 3 חודשים</span><b id="mfF3">—</b></div><div><span>בעוד 6 חודשים</span><b id="mfF6">—</b></div><div><span>בעוד שנה</span><b id="mfF12">—</b></div><div><span>בעוד שנתיים</span><b id="mfF24">—</b></div></div><div class="mfWhatIf"><div class="row"><b>מה אם נחסוך יותר?</b><span id="mfExtraLabel">+₪1,000 בחודש</span></div><input id="mfExtra" type="range" min="0" max="3000" step="250" value="1000"><div id="mfWhatIfText" class="mut sm"></div></div>';q('#mfJourney')?.after(c);q('#mfExtra')?.addEventListener('input',renderJourney)}}function monthlyPace(){let a=[0,-1,-2].map(o=>mfScopeStats(ms(o)).s);let good=a.filter(x=>Number.isFinite(x));return Math.max(0,good.reduce((s,x)=>s+x,0)/Math.max(1,good.length))}function eta(cur,target,monthly,ret=0){if(cur>=target)return'כבר הושג';if(monthly<=0)return'אין מספיק קצב';let v=cur,r=Math.pow(1+ret,1/12)-1,n=0;while(v<target&&n<240){v=v*(1+r)+monthly;n++}if(n>=240)return'מעל 20 שנה';let d=new Date();d.setMonth(d.getMonth()+n);return d.toLocaleDateString('he-IL',{month:'short',year:'numeric'})}function project(cur,monthly,n,ret){let r=Math.pow(1+ret,1/12)-1,v=cur;for(let i=0;i<n;i++)v=v*(1+r)+monthly;return v}function renderJourney(){ensureJourney();if(typeof calc!=='function')return;let c=calc(),cur=c.j,pace=monthlyPace(),ret=+set.annual_return_rate||.07,next=milestones.find(x=>x.v>cur)||milestones[milestones.length-1],prev=[...milestones].reverse().find(x=>x.v<=cur),remain=Math.max(0,next.v-cur),pct=prev?Math.min(100,(cur-prev.v)/(next.v-prev.v)*100):Math.min(100,cur/next.v*100);q('#mfNextMilestone').innerHTML='<div><span class="mut sm">התחנה הבאה</span><h3>'+next.e+' '+next.n+'</h3><div class="mfNextNums"><b>'+D(next.v)+'</b><span>חסרים '+D(remain)+'</span></div></div><div class="mfEta"><span>צפי בקצב הנוכחי</span><b>'+eta(cur,next.v,pace,ret)+'</b></div><div class="prog"><i style="width:'+pct+'%"></i></div>';q('#mfRoad').innerHTML=milestones.map((x,i)=>{let done=cur>=x.v,active=x===next;return '<div class="mfStop '+(done?'done ':'')+(active?'active':'')+'"><div class="mfDot">'+(done?'✓':x.e)+'</div><div class="mfStopText"><b>'+x.n+'</b><span>'+D(x.v)+'</span></div>'+(done?'<em>הושג</em>':active?'<em>הבא</em>':'')+'</div>'}).join('');[3,6,12,24].forEach(n=>{let e=q('#mfF'+n);if(e)e.textContent=D(project(cur,pace,n,ret))});let extra=+q('#mfExtra')?.value||0;q('#mfExtraLabel').textContent='+'+M(extra)+' בחודש';let base=eta(cur,500000,pace,ret),better=eta(cur,500000,pace+extra,ret);q('#mfWhatIfText').innerHTML=extra?'יעד 🔑 500K: בקצב הנוכחי <b>'+base+'</b> · עם התוספת <b>'+better+'</b>.':'יעד 🔑 500K בקצב הנוכחי: <b>'+base+'</b>.'}function run(){ensureJourney();renderJourney()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('mf:data-loaded',()=>setTimeout(run,30));window.addEventListener('mf:rendered',()=>setTimeout(run,0));window.addEventListener('mf:view',e=>{if(e.detail?.view==='home')setTimeout(run,20)});q('#eye')?.addEventListener('click',()=>setTimeout(renderJourney,0));})();
// MONEYFLOW_JOURNEY_FORECAST_V62

;(()=>{'use strict';const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],M=n=>'₪'+Math.round(+n||0).toLocaleString('he-IL'),D=n=>showM?M(n):'•••••• ₪';const stops=[25000,50000,75000,100000,125000,150000,175000,200000,225000,250000,275000,280000];const names={25000:'🌱 ההתחלה',50000:'🧱 בסיס ראשון',75000:'💪 צוברים כוח',100000:'🛡️ 100K ראשונים',125000:'📈 ממשיכים לעלות',150000:'🚀 150K',175000:'⚡ מתקרבים ל־200K',200000:'💎 200K',225000:'🏗️ בונים הון',250000:'🏠 רבע מיליון',275000:'🏁 כמעט שם',280000:'🎯 היעד שלנו'};function nav(){let n=q('nav');if(!n)return;if(!q('[data-v="journey"]',n)){let b=document.createElement('button');b.dataset.v='journey';b.innerHTML='<span>🛣️</span><small>מסלול</small>';b.onclick=()=>{qa('main>section').forEach(s=>s.classList.remove('on'));q('#journey')?.classList.add('on');qa('nav button').forEach(x=>x.classList.toggle('on',x===b));render()};n.appendChild(b)}if(!q('#journey')){let s=document.createElement('section');s.id='journey';s.innerHTML='<div class="c journeyHero"><span class="mut sm">MoneyFlow Journey</span><h1>המסלול הכלכלי שלנו 🛣️</h1><p>לא רק לעקוב אחרי כסף — לראות לאן אנחנו מתקדמים.</p><div id="journeyHeroNums"></div></div><div class="c"><div class="sectiontitle"><h2>🏁 אבני הדרך שלנו</h2><span class="badge">עד ₪280K</span></div><div id="journeyStops"></div></div><div class="c"><div class="sectiontitle"><h2>🔮 התחנה הבאה</h2><span class="badge">תחזית</span></div><div id="journeyForecast"></div></div>';q('main').appendChild(s)}}function pace(){let a=[0,-1,-2].map(o=>mfScopeStats(ms(o)).s);return Math.max(0,a.reduce((x,y)=>x+y,0)/3)}function eta(cur,t,p){if(cur>=t)return'הושג';if(p<=0)return'אין מספיק נתונים';let n=Math.ceil((t-cur)/p),d=new Date();d.setMonth(d.getMonth()+n);return d.toLocaleDateString('he-IL',{month:'long',year:'numeric'})}function render(){nav();if(typeof calc!=='function')return;let cur=calc().j,p=pace(),next=stops.find(v=>v>cur)||280000,prev=[...stops].reverse().find(v=>v<=cur)||0,pct=Math.min(100,(cur-prev)/Math.max(1,next-prev)*100);q('#journeyHeroNums').innerHTML='<b>'+D(cur)+'</b><span>מתוך '+D(280000)+' · '+Math.round(cur/280000*100)+'%</span><div class="prog"><i style="width:'+Math.min(100,cur/280000*100)+'%"></i></div>';q('#journeyStops').innerHTML=stops.map(v=>'<div class="jStop '+(cur>=v?'done ':'')+(v===next?'active':'')+'"><div class="jMark">'+(cur>=v?'✓':v===280000?'🎯':'◆')+'</div><div><b>'+names[v]+'</b><span>'+D(v)+'</span></div><em>'+(cur>=v?'הושג':v===next?'הבא':'')+'</em></div>').join('');q('#journeyForecast').innerHTML='<div class="jNext"><span>היעד הבא</span><b>'+names[next]+' · '+D(next)+'</b><small>חסרים '+D(Math.max(0,next-cur))+'</small></div><div class="jNext"><span>צפי בקצב האחרון</span><b>'+eta(cur,next,p)+'</b><small>קצב ממוצע '+D(p)+' לחודש</small></div><div class="prog"><i style="width:'+pct+'%"></i></div>'}function cleanHome(){q('#mfJourney')?.remove();q('#mfFuture')?.remove();let h=q('#home');if(!h)return;qa(':scope>.c',h).forEach(c=>{let t=(c.querySelector('h2')?.textContent||'').trim(),txt=c.textContent||'';if(t.includes('איתי מול נועה')||t.includes('מי מתקדם יותר')||t.includes('קוד לנועה')||txt.includes('קוד לנועה'))c.style.display='none'});['personCompare','inviteCode','joinCode','mfPersonCompare'].forEach(id=>{let e=q('#'+id);if(e)e.closest('.c')?.style.setProperty('display','none','important')})}function icon(){let l=q('#logo');if(!l)return;l.src='/icon-512.png?v=63';l.removeAttribute('hidden');l.style.cssText+=';display:block!important;visibility:visible!important;opacity:1!important;width:38px!important;height:38px!important'}function run(){nav();cleanHome();icon();if(q('#journey')?.classList.contains('on'))render()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('mf:rendered',run);window.addEventListener('mf:data-loaded',run);window.addEventListener('mf:view',run)})();
// JOURNEY_TAB_CLEAN_DASH_ICON_V63

;(()=>{'use strict';function fix(){let n=document.querySelector('nav');if(!n)return;let journey=n.querySelector('[data-v="journey"]'),analysis=n.querySelector('[data-v="analysis"]');if(!journey)return;if(analysis){analysis.replaceWith(journey);analysis.style.display='none'}let buttons=[...n.querySelectorAll('button')];buttons.forEach(b=>{if(b.dataset.v==='analysis')b.style.display='none'});journey.style.display='';journey.innerHTML='<span>🛣️</span><small>מסלול</small>'}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix);else fix();window.addEventListener('mf:rendered',fix)})();
// JOURNEY_REPLACES_ANALYSIS_V64

;(()=>{'use strict';const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];function navFix(){let n=q('nav');if(!n)return;let journey=q('[data-v="journey"]',n),analysis=q('[data-v="analysis"]',n);if(analysis&&journey){analysis.replaceWith(journey);qa('[data-v="analysis"]',n).forEach(x=>x.remove())}else if(analysis&&!journey){analysis.dataset.v='journey';analysis.innerHTML='<span>🛣️</span><small>מסלול</small>';analysis.onclick=()=>{qa('main>section').forEach(s=>s.classList.remove('on'));q('#journey')?.classList.add('on');qa('nav button').forEach(x=>x.classList.toggle('on',x===analysis));window.dispatchEvent(new CustomEvent('mf:view',{detail:{view:'journey'}}))}}}function logoFix(){let old=q('#logo');if(!old)return;let wrap=old.parentElement;old.style.display='none';let x=q('#mfTopLogo');if(!x){x=document.createElement('div');x.id='mfTopLogo';x.innerHTML='<img src="/icon-512.png?v=64" alt="MoneyFlow">';wrap.insertBefore(x,old)}x.style.display='grid'}function run(){navFix();logoFix()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('mf:rendered',run);window.addEventListener('mf:data-loaded',run)})();
// NAV_REPLACE_ANALYSIS_LOGO_WRAPPER_V64

;(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
function fixNav(){
  const box=q('.navin'); if(!box)return;
  // Remove malformed/duplicate Journey buttons that earlier versions appended outside .navin.
  qa('nav > button[data-v="journey"], nav > [data-v="journey"]').forEach(x=>x.remove());
  // Analysis and Goals are no longer bottom-navigation destinations.
  qa('[data-v="analysis"],[data-v="goals"]',box).forEach(x=>x.remove());
  let js=qa('[data-v="journey"]',box); js.slice(1).forEach(x=>x.remove());
  let j=js[0];
  if(!j){ j=document.createElement('button'); j.dataset.v='journey'; box.appendChild(j); }
  j.className=j.classList.contains('on')?'on':'';
  j.innerHTML='<b>◇</b>מסלול';
  j.onclick=()=>show('journey');
  const hist=q('[data-v="history"]',box); if(hist&&hist.nextElementSibling!==j)hist.after(j);
  box.style.gridTemplateColumns='repeat(4,1fr)';
}
function fixJourney(){
  const s=q('#journey'); if(!s)return;
  s.classList.add('v');
  const active=q('.navin [data-v="journey"].on');
  s.classList.toggle('on',!!active);
}
function fixQuick(){
  const b=qa('#home .q').find(x=>(x.textContent||'').includes('יעדים'));
  if(b){b.innerHTML='<b>◇</b>מסלול';b.onclick=()=>show('journey')}
}
function fixBrand(){
  q('#mfTopLogo')?.remove();
  const old=q('#logo'); if(old)old.style.display='none';
  const mark=q('#mfBrandMark'); if(mark)mark.style.display='grid';
}
function cleanHome(){
  // Journey cards belong only to the Journey page, never the dashboard.
  q('#mfJourney')?.remove(); q('#mfFuture')?.remove();
  const home=q('#home'); if(!home)return;
  qa(':scope > .c',home).forEach(c=>{
    const t=(c.querySelector('h2')?.textContent||'').trim(),txt=c.textContent||'';
    if(t.includes('איתי מול נועה')||t.includes('מי מתקדם יותר')||t.includes('קוד לנועה')||txt.includes('קוד לנועה')) c.style.display='none';
  });
}
function run(){fixNav();fixJourney();fixQuick();fixBrand();cleanHome()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
window.addEventListener('mf:rendered',()=>setTimeout(run,0));
window.addEventListener('mf:data-loaded',()=>setTimeout(run,0));
window.addEventListener('mf:view',()=>setTimeout(run,0));
})();
// NAV4_JOURNEY_ONLY_INLINE_BRAND_V65

;(()=>{'use strict';const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],M=n=>'₪'+Math.round(+n||0).toLocaleString('he-IL'),D=n=>showM?M(n):'•••••• ₪';const stops=[25000,50000,75000,100000,125000,150000,175000,200000,225000,250000,275000,280000],names={25000:'התחלה',50000:'בסיס ראשון',75000:'צוברים כוח',100000:'100K ראשונים',125000:'ממשיכים לעלות',150000:'150K',175000:'מתקרבים ל־200K',200000:'200K',225000:'בונים הון',250000:'רבע מיליון',275000:'כמעט שם',280000:'היעד שלנו'};
function ensure(){let main=q('main.app');if(!main)return;let s=q('#journey');if(!s){s=document.createElement('section');s.className='v';s.id='journey';s.innerHTML='<div class="c hero"><div class="mut sm">MoneyFlow Journey</div><h2 style="margin-top:5px">המסלול הכלכלי שלנו</h2><div class="big" id="jvTotal"></div><div class="prog"><i id="jvAll"></i></div><div class="mut sm" id="jvSub" style="margin-top:8px"></div></div><div class="c"><div class="sectiontitle"><h2>אבני הדרך</h2><span class="badge">עד ₪280K</span></div><div id="jvStops"></div></div><div class="c"><div class="sectiontitle"><h2>התחנה הבאה</h2><span class="badge">תחזית</span></div><div id="jvNext"></div></div>';main.appendChild(s)}}
function cur(){try{return calc().j}catch{return 0}}function monthly(){try{let a=[ms(0).s,ms(-1).s,ms(-2).s];return Math.max(0,a.reduce((x,y)=>x+y,0)/3)}catch{return 0}}function eta(c,t,p){if(c>=t)return'הושג';if(!p)return'עוד אין מספיק נתונים';let n=Math.ceil((t-c)/p),d=new Date();d.setMonth(d.getMonth()+n);return d.toLocaleDateString('he-IL',{month:'long',year:'numeric'})}
function paint(){ensure();let c=cur(),nx=stops.find(x=>x>c)||280000,p=monthly();q('#jvTotal').textContent=D(c);q('#jvAll').style.width=Math.min(100,c/280000*100)+'%';q('#jvSub').textContent=Math.round(Math.min(100,c/280000*100))+'% מתוך '+D(280000);q('#jvStops').innerHTML=stops.map(x=>'<div class="jv '+(c>=x?'done ':'')+(x===nx?'next':'')+'"><i>'+(c>=x?'✓':x===nx?'◆':'·')+'</i><div><b>'+names[x]+'</b><small>'+D(x)+'</small></div><em>'+(c>=x?'הושג':x===nx?'הבא':'')+'</em></div>').join('');q('#jvNext').innerHTML='<div class="mini"><span class="mut sm">היעד הבא</span><b>'+names[nx]+' · '+D(nx)+'</b></div><div class="mini" style="margin-top:8px"><span class="mut sm">נשאר</span><b>'+D(Math.max(0,nx-c))+'</b><div class="mut sm" style="margin-top:5px">צפי: '+eta(c,nx,p)+'</div></div>'}
window.mfShowJourney=function(){ensure();qa('main.app>section.v').forEach(s=>s.classList.toggle('on',s.id==='journey'));qa('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==='journey'));paint();scrollTo(0,0)};
function clean(){ensure();let nav=q('.navin');if(nav){qa('button[data-v="analysis"],button[data-v="goals"]',nav).forEach(x=>x.remove());let j=q('button[data-v="journey"]',nav);if(!j){j=document.createElement('button');j.dataset.v='journey';j.innerHTML='<b>◇</b>מסלול';j.onclick=window.mfShowJourney;nav.appendChild(j)}nav.style.gridTemplateColumns='repeat(4,1fr)'}let home=q('#home');if(home){qa(':scope>.c',home).forEach(c=>{let t=(c.querySelector('h2')?.textContent||'').trim(),txt=c.textContent||'';if(t.includes('מי מתקדם יותר')||txt.includes('קוד לנועה'))c.style.display='none'});qa('#mfJourney,#mfFuture,#mfJourneyCard,#mfFutureCard',home).forEach(x=>x.remove())}let old=q('#mfBrandMark');if(old)old.remove();let hdr=q('header');if(hdr&&!q('#mfRealLogo',hdr)){let d=document.createElement('div');d.id='mfRealLogo';d.innerHTML='<svg viewBox="0 0 48 48" aria-label="MoneyFlow"><rect x="1" y="1" width="46" height="46" rx="14"/><path d="M11 32L20 23L27 27L37 16"/><path d="M31 16H37V22"/></svg>';hdr.prepend(d)}qa('#logo,#mfTopLogo',hdr||document).forEach(x=>x.style.display='none');}
function run(){clean();if(q('#journey')?.classList.contains('on'))paint()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('mf:data-loaded',run);window.addEventListener('mf:rendered',run);})();
// JOURNEY_SOURCE_FIX_V66

;(()=>{'use strict';const q=(s,r=document)=>r.querySelector(s),M=n=>'₪'+Math.round(+n||0).toLocaleString('he-IL'),D=n=>showM?M(n):'•••••• ₪';function addSim(){let s=q('#journey');if(!s)return;let c=q('#mfJourneySim');if(!c){c=document.createElement('div');c.id='mfJourneySim';c.className='c';c.innerHTML='<div class="sectiontitle"><h2>מה אם נחסוך יותר?</h2><span class="badge">סימולטור</span></div><div class="simtop"><b id="mfSimAdd">+₪1,000</b><span class="mut sm">נוספים בכל חודש</span></div><input id="mfSimRange" type="range" min="0" max="5000" step="250" value="1000"><div class="g2"><div class="mini"><span class="mut sm">צפי ל־₪280K</span><b id="mfSimDate">—</b></div><div class="mini"><span class="mut sm">מוקדם יותר בכ־</span><b id="mfSimEarlier">—</b></div></div><div class="mut sm" id="mfSimPace" style="margin-top:9px"></div>';s.appendChild(c);q('#mfSimRange').addEventListener('input',sim)}sim()}
function base(){try{return Math.max(0,calc().j)}catch{return 0}}function pace(){try{let a=[ms(0).s,ms(-1).s,ms(-2).s].map(Number);return Math.max(0,a.reduce((x,y)=>x+y,0)/3)}catch{return 0}}function monthsTo(cur,target,monthly){if(cur>=target)return 0;if(monthly<=0)return Infinity;return Math.ceil((target-cur)/monthly)}function fmtDate(n){if(!isFinite(n))return'אין מספיק נתונים';let d=new Date();d.setMonth(d.getMonth()+n);return d.toLocaleDateString('he-IL',{month:'short',year:'numeric'})}function sim(){let r=q('#mfSimRange');if(!r)return;let add=+r.value,b=pace(),cur=base(),a=monthsTo(cur,280000,b),n=monthsTo(cur,280000,b+add);q('#mfSimAdd').textContent='+'+M(add);q('#mfSimDate').textContent=fmtDate(n);q('#mfSimEarlier').textContent=isFinite(a)&&isFinite(n)?Math.max(0,a-n)+' חודשים':'—';q('#mfSimPace').textContent='קצב חודשי משוער: '+M(b)+' → '+M(b+add)}
function run(){addSim()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('mf:data-loaded',run);window.addEventListener('mf:view',e=>{if(e.detail?.view==='journey')setTimeout(run,0)});window.addEventListener('mf:rendered',run)})();
// JOURNEY_COMPACT_SIM_V67

;(()=>{'use strict';const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
function cleanHeader(){qa('#mfChatBtn,#mfStreak').forEach(x=>x.remove());q('#mfChatOverlay')?.remove();q('.mfStreakOverlayV43')?.remove()}
function fixJourneyTouch(){const j=q('#journey');if(!j)return;j.style.touchAction='pan-y';j.style.webkitOverflowScrolling='touch';const r=q('#mfSimRange');if(r){r.style.touchAction='pan-y';r.style.webkitUserSelect='none';r.style.userSelect='none';r.setAttribute('aria-label','תוספת חיסכון חודשית')}}
function run(){cleanHeader();fixJourneyTouch()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('mf:data-loaded',()=>setTimeout(run,0));window.addEventListener('mf:rendered',()=>setTimeout(run,0));window.addEventListener('mf:view',e=>{if(e.detail?.view==='journey')setTimeout(run,0)});new MutationObserver(()=>{if(q('#mfChatBtn')||q('#mfStreak'))cleanHeader()}).observe(document.documentElement,{childList:true,subtree:true});})();
// HEADER_CLEAN_JOURNEY_TOUCH_V68

;(()=>{'use strict';const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];function cleanHeader(){qa('#mfChatBtn,#mfStreak').forEach(x=>x.remove());q('#mfChatOverlay')?.remove();q('.mfStreakOverlayV43')?.remove()}function fixJourneyTouch(){const j=q('#journey');if(!j)return;j.style.touchAction='pan-y';j.style.webkitOverflowScrolling='touch';const r=q('#mfSimRange');if(r){r.style.touchAction='pan-y';r.style.webkitUserSelect='none';r.style.userSelect='none'}}function run(){cleanHeader();fixJourneyTouch()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('mf:data-loaded',()=>setTimeout(run,0));window.addEventListener('mf:rendered',()=>setTimeout(run,0));window.addEventListener('mf:view',e=>{if(e.detail?.view==='journey')setTimeout(run,0)});new MutationObserver(()=>{if(q('#mfChatBtn')||q('#mfStreak'))cleanHeader()}).observe(document.documentElement,{childList:true,subtree:true});})();
// HEADER_CLEAN_JOURNEY_TOUCH_V68

;(()=>{'use strict';const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];function brand(){const h=q('header');if(!h)return;qa('#mfBrandMark,#mfRealLogo,#mfTopLogo,#logo',h).forEach(x=>x.remove());let img=q('#mfUserLogo',h);if(!img){img=document.createElement('img');img.id='mfUserLogo';img.alt='MoneyFlow';img.src='/icon-512.png?v=69';h.prepend(img)}}function dashboard(){const h=q('#home');if(!h)return;qa(':scope>.c',h).forEach(c=>{const t=(c.querySelector('h2')?.textContent||'').trim(),txt=c.textContent||'';if(['6 חודשים · הכנסות מול הוצאות','תחזית ליעד','השוואה לשבוע הקודם','מי מתקדם יותר השבוע?','הוצאות מובילות','תנועות אחרונות'].includes(t)||txt.includes('קוד לנועה'))c.style.display='none'});q('#mfMoreWrap')?.remove();q('#mfCapitalJourney')?.remove();let hero=q(':scope>.hero',h),quick=q(':scope>.quick',h),scope=q('#mfScope'),use=q('#mfUsefulDash'),pace=q('#mfGoalPaceCard'),mom=q('#mfMomentumCard'),invest=q('#investCard'),week=qa(':scope>.c',h).find(x=>(x.querySelector('h2')?.textContent||'').trim()==='השבוע');qa(':scope>.g2',h).forEach(x=>{if(x.querySelector('#itay,#noa,#mi,#me,#sr,#iw'))x.style.display='none'});let anchor=quick||hero;[scope,use,pace,week,mom,invest].filter(Boolean).forEach(el=>{if(anchor&&anchor.nextElementSibling!==el)anchor.after(el);anchor=el});if(quick){quick.classList.add('mfProQuick');const btns=qa('.q',quick),map=[['−','הוצאה'],['＋','הכנסה'],['◷','היסטוריה'],['◇','מסלול']];btns.forEach((b,i)=>{if(map[i])b.innerHTML='<b>'+map[i][0]+'</b><span>'+map[i][1]+'</span>'});if(btns[3])btns[3].onclick=()=>window.mfShowJourney?.()}if(hero){hero.classList.add('mfProHero');const chip=q('.chip',hero);if(chip)chip.textContent='פירוט ההון'}if(pace)pace.classList.add('mfPriorityCard');if(mom)mom.classList.add('mfPriorityCard');if(invest)invest.classList.add('mfInvestPro')}function run(){brand();dashboard();q('#journey')?.classList.add('mfProJourney');qa('#mfChatBtn,#mfStreak').forEach(x=>x.remove())}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('mf:rendered',()=>setTimeout(run,0));window.addEventListener('mf:data-loaded',()=>setTimeout(run,0));window.addEventListener('mf:view',()=>setTimeout(run,0));})();
// MONEYFLOW_PRO_UI_V69

;(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s);
function releaseWeeklyGoal(){
  try{
    const goal=+set.itay_release_goal||150000;
    const d=new Date((set.itay_release_date||'2027-04-04')+'T00:00:00');
    const now=new Date(); now.setHours(0,0,0,0);
    const weeks=Math.max(1,(d-now)/86400000/7);
    const inv=typeof invVals==='function'?invVals():{iv:0};
    const current=Math.max(0,+inv.iv||0);
    const grant=15000;
    return Math.max(0,(goal-current-grant)/weeks);
  }catch{return +set.itay_weekly_goal||1779.41}
}
function currentWeekNet(who){
  try{
    const w=ws(0),a=(w.a||[]).filter(x=>x.person===who),i=a.filter(x=>x.kind==='income'&&x.category!=='משכורת צבאית').reduce((s,x)=>s+(+x.amount||0),0),e=a.filter(x=>x.kind==='expense').reduce((s,x)=>s+(+x.amount||0),0);return{i,e,s:i-e,w}
  }catch{return{i:0,e:0,s:0,w:{d:new Date()}}}
}
function paintAddGoal(){
  if(!q('#add'))return;
  const who=window.__mfCurrentPerson||owner||'איתי',x=currentWeekNet(who);
  const goal=who==='איתי'?releaseWeeklyGoal():((+set.noa_monthly_goal||7000)/4.345);
  const rem=Math.max(0,goal-x.s),pct=Math.max(0,Math.min(100,x.s/Math.max(1,goal)*100));
  if(q('#wrem'))q('#wrem').textContent=F(rem);
  if(q('#wp'))q('#wp').style.width=pct+'%';
  if(q('#wstat'))q('#wstat').textContent=x.s>=goal?'היעד הושג ✓':x.s>0?'בתהליך':'עוד לא התחלת';
  const lab=q('#wrem')?.previousElementSibling;if(lab)lab.textContent=who==='איתי'?'נשאר לקצב השחרור':'נשאר ליעד';
  let hint=q('#mfAddDynamicGoal');
  if(!hint&&q('#wrem')){hint=document.createElement('div');hint.id='mfAddDynamicGoal';hint.className='mut sm';hint.style='margin-top:8px';q('#add .hero')?.appendChild(hint)}
  if(hint)hint.textContent=who==='איתי'?'יעד שבועי דינמי לפי מה שנדרש כרגע להגיע ל־₪150,000 עד השחרור: '+F(goal):'יעד שבועי נגזר מהיעד החודשי.';
}
function install(){
  const old=window.renderWeek;
  if(typeof old==='function'&&!window.__mfRenderWeek70){window.renderWeek=function(){old.apply(this,arguments);paintAddGoal()};window.__mfRenderWeek70=1}
  paintAddGoal();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
window.addEventListener('mf:data-loaded',()=>setTimeout(paintAddGoal,20));
window.addEventListener('mf:rendered',()=>setTimeout(paintAddGoal,0));
window.addEventListener('mf:view',e=>{if(e.detail?.view==='add')setTimeout(paintAddGoal,0)});
})();
// ADD_GOAL_SYNC_RELEASE_PACE_V70

;(()=>{'use strict';
function journeyCapital(){
  try{const v=typeof invVals==='function'?invVals():null;if(v){const iv=Math.max(0,+v.iv||0),nv=Math.max(0,+v.nv||0);return iv+nv}}
  catch(e){}
  return 0;
}
function money(n){return '₪'+Math.round(Math.max(0,+n||0)).toLocaleString('he-IL')}
function patchJourney(){
 const s=document.querySelector('#journey'); if(!s)return;
 const c=journeyCapital(); const masked=typeof showM!=='undefined'&&!showM;
 const disp=n=>masked?'•••••• ₪':money(n);
 const total=s.querySelector('#jvTotal'); if(total)total.textContent=disp(c);
 const bar=s.querySelector('#jvAll'); if(bar)bar.style.width=Math.min(100,c/280000*100)+'%';
 const sub=s.querySelector('#jvSub'); if(sub)sub.textContent=Math.round(Math.min(100,c/280000*100))+'% מתוך '+disp(280000);
 const stops=[25000,50000,75000,100000,125000,150000,175000,200000,225000,250000,275000,280000];
 const nx=stops.find(x=>x>c)||280000;
 const next=s.querySelector('#jvNext'); if(next){
   const remain=Math.max(0,nx-c);
   const minis=next.querySelectorAll('.mini');
   if(minis[0]){const b=minis[0].querySelector('b');if(b)b.textContent=(b.textContent.split('·')[0].trim()||'היעד הבא')+' · '+disp(nx)}
   if(minis[1]){const b=minis[1].querySelector('b');if(b)b.textContent=disp(remain)}
 }
}
const old=window.mfShowJourney; if(typeof old==='function')window.mfShowJourney=function(){old.apply(this,arguments);setTimeout(patchJourney,0)};
window.addEventListener('mf:data-loaded',()=>setTimeout(patchJourney,0));window.addEventListener('mf:rendered',()=>setTimeout(patchJourney,0));document.addEventListener('DOMContentLoaded',()=>setTimeout(patchJourney,250));setTimeout(patchJourney,600);
})();
// JOURNEY_INVESTMENT_CAPITAL_V71

;(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s);
function invCapital(){try{const x=window.invVals?.();return x?Math.max(0,+x.j||0):0}catch{return 0}}
function D(n){return (typeof showM!=='undefined'&&!showM)?'•••••• ₪':'₪'+Math.round(+n||0).toLocaleString('he-IL')}
function patch(){const s=q('#journey');if(!s)return;const c=invCapital();if(!c)return;
 const total=q('#jvTotal',s); if(total&&total.textContent!==D(c)) total.textContent=D(c);
 const bar=q('#jvAll',s); if(bar){const w=Math.min(100,c/280000*100)+'%';if(bar.style.width!==w)bar.style.width=w}
 const sub=q('#jvSub',s); if(sub){const v=Math.round(Math.min(100,c/280000*100))+'% מתוך '+D(280000);if(sub.textContent!==v)sub.textContent=v}
 const stops=[25000,50000,75000,100000,125000,150000,175000,200000,225000,250000,275000,280000],nx=stops.find(v=>v>c)||280000;
 const next=q('#jvNext',s),mins=next?[...next.querySelectorAll('.mini')]:[]; if(mins[0]){const b=mins[0].querySelector('b');if(b)b.textContent='היעד הבא · '+D(nx)} if(mins[1]){const b=mins[1].querySelector('b');if(b)b.textContent=D(Math.max(0,nx-c))}
 const sim=q('#mfJourneySim',s); if(sim){const r=q('#mfSimRange',sim),add=+(r?.value||0);let p=0;try{const a=[ms(0).s,ms(-1).s,ms(-2).s].map(Number);p=Math.max(0,a.reduce((x,y)=>x+y,0)/3)}catch{} const mt=(cur,t,m)=>cur>=t?0:m>0?Math.ceil((t-cur)/m):Infinity; const fmt=n=>{if(!isFinite(n))return'אין מספיק נתונים';let d=new Date();d.setMonth(d.getMonth()+n);return d.toLocaleDateString('he-IL',{month:'short',year:'numeric'})}; const a=mt(c,280000,p),n=mt(c,280000,p+add); const date=q('#mfSimDate',sim),early=q('#mfSimEarlier',sim); if(date)date.textContent=fmt(n); if(early)early.textContent=isFinite(a)&&isFinite(n)?Math.max(0,a-n)+' חודשים':'—'; }
}
let busy=false;const run=()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{patch();busy=false})};
window.addEventListener('mf:data-loaded',run);window.addEventListener('mf:rendered',run);window.addEventListener('mf:view',e=>{if(e.detail?.view==='journey')setTimeout(run,0)});document.addEventListener('input',e=>{if(e.target?.id==='mfSimRange')setTimeout(run,0)});
new MutationObserver(()=>{if(q('#journey.on'))run()}).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']});
setInterval(()=>{if(q('#journey.on'))patch()},500);
})();
// JOURNEY_FORCE_INVESTMENT_SOURCE_V72

;(()=>{
 function currentInvestmentCapital(){
  var it=Number(set.inv_itay_units||14170), no=Number(set.inv_noa_units||7179.467), price=Number(set.inv_price_agorot||localStorage.getItem('mf_inv_price_agorot')||0);
  var i=it*price/100, n=no*price/100;
  return {i:i,n:n,j:i+n,g:Number(set.joint_goal||280000)};
 }
 window.calc=function(){return currentInvestmentCapital()};
 function sync(){
  window.calc=function(){return currentInvestmentCapital()};
  try{renderHome()}catch(e){}
  try{renderCapital()}catch(e){}
  try{goalsR()}catch(e){}
  var c=currentInvestmentCapital(), el=document.getElementById('jvTotal');
  if(el)el.textContent=(typeof showM!=='undefined'&&!showM)?'•••••• ₪':'₪'+Math.round(c.j).toLocaleString('he-IL');
 }
 document.addEventListener('DOMContentLoaded',function(){setTimeout(sync,100)});
 window.addEventListener('mf:data-loaded',function(){setTimeout(sync,20)});
 window.addEventListener('mf:view',function(){setTimeout(sync,20)});
 window.addEventListener('mf:rendered',function(){setTimeout(sync,0)});
})();
// CAPITAL_FROM_INVESTMENT_V73

;(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const fmt=n=>'₪'+Math.round(Math.max(0,+n||0)).toLocaleString('he-IL');
const disp=n=>(typeof showM!=='undefined'&&!showM)?'•••••• ₪':fmt(n);
const stops=[25000,50000,75000,100000,125000,150000,175000,200000,225000,250000,275000,280000];
function capital(){try{return Math.max(0,+window.calc?.().j||0)}catch{return 0}}
function snapshot(){
 const home=q('#home');if(!home)return;
 q('#mfUsefulDash')?.remove();q('#mfMomentumCard')?.remove();q(':scope>.quick',home)?.remove();
 let c=q('#mfDashboardSnapshot');
 if(!c){c=document.createElement('div');c.id='mfDashboardSnapshot';c.className='c mfSnapshot';c.innerHTML='<div class="sectiontitle"><h2>תמונת מצב</h2><span class="badge">MoneyFlow</span></div><div class="mfSnapshotGrid"><div class="mini"><span class="mut sm">הון מושקע</span><b id="mfSnapCapital">—</b></div><div class="mini"><span class="mut sm">חסר ל־₪280K</span><b id="mfSnapRemain">—</b></div><div class="mini"><span class="mut sm">התחנה הבאה</span><b id="mfSnapNext">—</b></div></div>';const hero=q(':scope>.hero',home);hero?.after(c)}
 const cur=capital(),next=stops.find(x=>x>cur)||280000;q('#mfSnapCapital').textContent=disp(cur);q('#mfSnapRemain').textContent=disp(Math.max(0,280000-cur));q('#mfSnapNext').textContent=disp(next);
 const scope=q('#mfScope'),pace=q('#mfGoalPaceCard'),week=qa(':scope>.c',home).find(x=>(x.querySelector('h2')?.textContent||'').trim()==='השבוע'),invest=q('#investCard');let a=c;[scope,pace,week,invest].filter(Boolean).forEach(el=>{if(a.nextElementSibling!==el)a.after(el);a=el});
}
function run(){snapshot()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
window.addEventListener('mf:data-loaded',()=>setTimeout(run,0));window.addEventListener('mf:rendered',()=>setTimeout(run,0));window.addEventListener('mf:view',e=>{if(e.detail?.view==='home')setTimeout(run,0)});
new MutationObserver(()=>{const h=q('#home');if(h&&(q('#mfUsefulDash')||q('#mfMomentumCard')||q(':scope>.quick',h)))setTimeout(run,0)}).observe(document.documentElement,{subtree:true,childList:true});
})();
// DASHBOARD_FOCUS_V74


;(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s);
const money=n=>'₪'+Math.round(Math.max(0,+n||0)).toLocaleString('he-IL');
const disp=n=>(typeof showM!=='undefined'&&!showM)?'•••••• ₪':money(n);
function invSeries(){
  try{
    const it=Number(set.inv_itay_units||14170),no=Number(set.inv_noa_units||7179.467),units=it+no;
    const curP=Number(set.inv_price_agorot||localStorage.getItem('mf_inv_price_agorot')||0);
    const prevP=Number(set.inv_prev_price_agorot||localStorage.getItem('mf_inv_prev_price_agorot')||curP);
    const cur=units*curP/100,prev=units*prevP/100;
    return {prev,cur,prevP,curP};
  }catch{return {prev:0,cur:0,prevP:0,curP:0}}
}
function ensure(){
  const home=q('#home');if(!home)return null;
  let c=q('#mfCapitalJourney');
  if(!c){
    c=document.createElement('div');c.id='mfCapitalJourney';c.className='c';
    const snap=q('#mfDashboardSnapshot'),invest=q('#investCard');
    (snap||invest||q(':scope>.hero',home))?.after(c);
  }
  return c;
}
function draw(){
 const c=ensure();if(!c)return;const x=invSeries();if(!x.cur)return;
 const vals=[x.prev,x.cur],W=340,H=150,p=18,min=Math.min(...vals),max=Math.max(...vals),rng=Math.max(1,max-min);
 const pts=vals.map((v,i)=>[p+i*(W-2*p),H-p-(H-2*p)*(v-min)/rng]);
 const line=pts.map(a=>a.join(',')).join(' '),delta=x.cur-x.prev,pct=x.prev?delta/x.prev*100:0;
 c.innerHTML='<div class="sectiontitle"><h2>📈 ההון בהשקעות לאורך הדרך</h2><span class="badge">השקעות בלבד</span></div>'+
 '<div class="mut sm">השווי מחושב רק לפי יחידות ההשקעה והשערים שנשמרו באפליקציה.</div>'+
 '<div style="display:flex;justify-content:space-between;align-items:end;margin:12px 0 6px"><div><span class="mut sm">שווי נוכחי</span><div style="font-size:24px;font-weight:850">'+disp(x.cur)+'</div></div><div class="'+(delta>=0?'good':'bad')+'" style="font-weight:800">'+(delta>=0?'+':'−')+disp(Math.abs(delta))+' · '+Math.abs(pct).toFixed(2)+'%</div></div>'+
 '<div id="mfJourneyChart"><svg viewBox="0 0 '+W+' '+H+'" aria-label="גרף שווי ההשקעות"><defs><linearGradient id="mfInvGraphFill75" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#43d7c8" stop-opacity=".30"/><stop offset="1" stop-color="#43d7c8" stop-opacity="0"/></linearGradient></defs><polygon points="'+p+','+(H-p)+' '+line+' '+(W-p)+','+(H-p)+'" fill="url(#mfInvGraphFill75)"/><polyline points="'+line+'" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="'+pts[0][0]+'" cy="'+pts[0][1]+'" r="4"/><circle cx="'+pts[1][0]+'" cy="'+pts[1][1]+'" r="4"/></svg></div>'+
 '<div style="display:flex;justify-content:space-between" class="mut sm"><span>שער קודם · '+(x.prevP?x.prevP.toFixed(2)+' אג׳':'—')+'</span><span>שער נוכחי · '+(x.curP?x.curP.toFixed(2)+' אג׳':'—')+'</span></div>';
}
function run(){draw()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,250));else setTimeout(run,0);
window.addEventListener('mf:data-loaded',()=>setTimeout(run,30));
window.addEventListener('mf:rendered',()=>setTimeout(run,20));
window.addEventListener('mf:view',e=>{if(e.detail?.view==='home')setTimeout(run,20)});
new MutationObserver(()=>{if(q('#home.on')&&!q('#mfCapitalJourney'))setTimeout(run,0)}).observe(document.documentElement,{subtree:true,childList:true});
})();
// INVESTMENT_ONLY_CAPITAL_GRAPH_V75


;(()=>{'use strict';
function redrawInvestmentGraph(){
  try{
    const c=document.querySelector('#mfCapitalJourney');
    if(!c)return;
    const it=Number(set.inv_itay_units||14170), no=Number(set.inv_noa_units||7179.467), units=it+no;
    const curP=Number(set.inv_price_agorot||localStorage.getItem('mf_inv_price_agorot')||0);
    const prevP=Number(set.inv_prev_price_agorot||localStorage.getItem('mf_inv_prev_price_agorot')||curP);
    const cur=units*curP/100, prev=units*prevP/100, delta=cur-prev, pct=prev?delta/prev*100:0;
    const hidden=(typeof showM!=='undefined'&&!showM);
    const money=n=>'₪'+Math.round(Math.max(0,+n||0)).toLocaleString('he-IL');
    const disp=n=>hidden?'•••••• ₪':money(n);
    const vals=[prev,cur],W=340,H=150,p=18,min=Math.min(...vals),max=Math.max(...vals),rng=Math.max(1,max-min);
    const pts=vals.map((v,i)=>[p+i*(W-2*p),H-p-(H-2*p)*(v-min)/rng]);
    const line=pts.map(a=>a.join(',')).join(' ');
    c.innerHTML='<div class="sectiontitle"><h2>📈 ההון בהשקעות לאורך הדרך</h2><span class="badge">השקעות בלבד</span></div>'+
    '<div class="mut sm">השווי מחושב רק לפי יחידות ההשקעה והשערים שנשמרו באפליקציה.</div>'+
    '<div style="display:flex;justify-content:space-between;align-items:end;margin:12px 0 6px"><div><span class="mut sm">שווי נוכחי</span><div style="font-size:24px;font-weight:850">'+disp(cur)+'</div></div><div class="'+(delta>=0?'good':'bad')+'" style="font-weight:800">'+(hidden?'••••••':((delta>=0?'+':'−')+money(Math.abs(delta))+' · '+Math.abs(pct).toFixed(2)+'%'))+'</div></div>'+
    '<div id="mfJourneyChart"><svg viewBox="0 0 '+W+' '+H+'" aria-label="גרף שווי ההשקעות"><defs><linearGradient id="mfInvGraphFill76" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#43d7c8" stop-opacity=".30"/><stop offset="1" stop-color="#43d7c8" stop-opacity="0"/></linearGradient></defs><polygon points="'+p+','+(H-p)+' '+line+' '+(W-p)+','+(H-p)+'" fill="url(#mfInvGraphFill76)"/><polyline points="'+line+'" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="'+pts[0][0]+'" cy="'+pts[0][1]+'" r="4"/><circle cx="'+pts[1][0]+'" cy="'+pts[1][1]+'" r="4"/></svg></div>'+
    '<div style="display:flex;justify-content:space-between" class="mut sm"><span>שער קודם · '+(prevP?prevP.toFixed(2)+' אג׳':'—')+'</span><span>שער נוכחי · '+(curP?curP.toFixed(2)+' אג׳':'—')+'</span></div>';
  }catch(e){}
}
function bind(){
 const eye=document.querySelector('#eye');
 if(eye&&!eye.dataset.mfGraphPrivacy76){eye.dataset.mfGraphPrivacy76='1';eye.addEventListener('click',()=>setTimeout(redrawInvestmentGraph,80));}
 redrawInvestmentGraph();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,300));else setTimeout(bind,0);
window.addEventListener('mf:data-loaded',()=>setTimeout(bind,40));
window.addEventListener('mf:rendered',()=>setTimeout(bind,30));
window.addEventListener('mf:view',e=>{if(e.detail?.view==='home')setTimeout(bind,30)});
})();
// INVESTMENT_GRAPH_PRIVACY_SYNC_V76
;(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s);
let range='all';
const labels={week:'שבוע אחרון',month:'חודש אחרון',all:'מתחילת הדרך'};
function money(n){return '₪'+Math.round(Math.max(0,+n||0)).toLocaleString('he-IL')}
function hidden(){return typeof showM!=='undefined'&&!showM}
function series(){
 try{
  const it=Number(set.inv_itay_units||14170),no=Number(set.inv_noa_units||7179.467),u=it+no;
  const cp=Number(set.inv_price_agorot||localStorage.getItem('mf_inv_price_agorot')||0),pp=Number(set.inv_prev_price_agorot||localStorage.getItem('mf_inv_prev_price_agorot')||cp);
  const cur=u*cp/100,prev=u*pp/100;
  let pts=[{d:new Date(Date.now()-86400000).toISOString().slice(0,10),v:prev},{d:new Date().toISOString().slice(0,10),v:cur}];
  return {pts,cur,prev,cp,pp};
 }catch{return {pts:[],cur:0,prev:0,cp:0,pp:0}}
}
function draw(){const c=q('#mfCapitalJourney');if(!c)return;const x=series();if(!x.cur)return;let data=x.pts;
 const W=340,H=135,p=15,min=Math.min(...data.map(z=>z.v)),max=Math.max(...data.map(z=>z.v)),rng=Math.max(1,max-min),X=i=>p+(W-2*p)*(i/Math.max(1,data.length-1)),Y=v=>H-p-(H-2*p)*(v-min)/rng,pts=data.map((z,i)=>[X(i),Y(z.v)]),line=pts.map(a=>a.join(',')).join(' '),d=x.cur-x.prev,pct=x.prev?d/x.prev*100:0;
 c.innerHTML='<div class="sectiontitle"><h2>גרף שינוי ההשקעה</h2><div class="mfRangeBtnsV77"><button data-r="week">שבוע</button><button data-r="month">חודש</button><button data-r="all">מההתחלה</button></div></div><div class="mfGraphBrief"><b>'+(hidden()?'•••••• ₪':money(x.cur))+'</b><span class="'+(d>=0?'good':'bad')+'">'+(hidden()?'••••••':((d>=0?'+':'−')+money(Math.abs(d))+' · '+Math.abs(pct).toFixed(2)+'%'))+'</span></div><div id="mfJourneyChart"><svg viewBox="0 0 '+W+' '+H+'"><polygon points="'+p+','+(H-p)+' '+line+' '+(W-p)+','+(H-p)+'" class="mfInvArea77"/><polyline points="'+line+'" class="mfInvLine77"/></svg></div><div class="mut sm mfGraphFoot">'+labels[range]+'</div>';
 c.querySelectorAll('[data-r]').forEach(b=>{b.classList.toggle('on',b.dataset.r===range);b.onclick=()=>{range=b.dataset.r;draw()}})
}
function bind(){const e=q('#eye');if(e&&!e.dataset.graph77){e.dataset.graph77='1';e.addEventListener('click',()=>setTimeout(draw,90))}draw()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,250));else setTimeout(bind,0);window.addEventListener('mf:data-loaded',()=>setTimeout(bind,30));window.addEventListener('mf:rendered',()=>setTimeout(bind,20));window.addEventListener('mf:view',e=>{if(e.detail?.view==='home')setTimeout(bind,20)});
})();
// INVESTMENT_GRAPH_COMPACT_RANGES_V77
;(()=>{'use strict';
let hist=[],range='all',busy=false;
const q=(s,r=document)=>r.querySelector(s), M=n=>'₪'+Math.round(+n||0).toLocaleString('he-IL');
const masked=()=>typeof showM!=='undefined'&&!showM;
function client(){return window.sb||window.supabaseClient||window._supabase||null}
function hid(){try{return householdId||window.householdId||window.HOUSEHOLD_ID||'624774ee-dda3-4c4e-9708-9f279ac09d1d'}catch{return '624774ee-dda3-4c4e-9708-9f279ac09d1d'}}
async function loadHist(){const s=client();if(!s?.from)return;try{const {data,error}=await s.from('mf_investment_history').select('snapshot_date,price_agorot,itay_units,noa_units').eq('household_id',hid()).order('snapshot_date');if(!error&&data?.length){hist=data.map(x=>({d:x.snapshot_date,p:+x.price_agorot,iu:+x.itay_units,nu:+x.noa_units,v:(+x.itay_units + +x.noa_units)*(+x.price_agorot)/100}));draw()}}catch(e){}}
async function snap(){const s=client();if(!s?.from||busy)return;try{busy=true;const v=typeof invVals==='function'?invVals():null;if(!v)return;const today=new Date().toISOString().slice(0,10),iu=+(set.inv_itay_units||0),nu=+(set.inv_noa_units||0),p=+(set.inv_price_agorot||0);if(!iu&&!nu||!p)return;await s.from('mf_investment_history').upsert({household_id:hid(),snapshot_date:today,price_agorot:p,itay_units:iu,noa_units:nu,source:'MoneyFlow automatic snapshot'},{onConflict:'household_id,snapshot_date'});await loadHist()}catch(e){}finally{busy=false}}
function subset(){if(!hist.length)return[];const last=new Date(hist[hist.length-1].d+'T12:00:00');let days=99999;if(range==='week')days=7;if(range==='month')days=31;const cut=new Date(last);cut.setDate(cut.getDate()-days);return hist.filter(x=>new Date(x.d+'T12:00:00')>=cut)}
function draw(){const c=q('#mfCapitalJourney');if(!c||!hist.length)return;const a=subset(),cur=a[a.length-1],first=a[0],delta=cur.v-first.v,pct=first.v?delta/first.v*100:0,W=340,H=135,pad=15,vals=a.map(x=>x.v),mn=Math.min(...vals),mx=Math.max(...vals),rg=Math.max(1,mx-mn),X=i=>pad+(W-2*pad)*(i/Math.max(1,a.length-1)),Y=v=>H-pad-(H-2*pad)*(v-mn)/rg,pts=a.map((x,i)=>X(i)+','+Y(x.v)).join(' '),labels={week:'שבוע אחרון',month:'חודש אחרון',all:'מתחילת הדרך'};
 c.innerHTML='<div class="sectiontitle"><h2>גרף שינוי ההשקעה</h2><div class="mfRangeBtnsV78"><button data-r="week">שבוע</button><button data-r="month">חודש</button><button data-r="all">מההתחלה</button></div></div><div class="mfGraphBrief"><b>'+(masked()?'•••••• ₪':M(cur.v))+'</b><span class="'+(delta>=0?'good':'bad')+'">'+(masked()?'••••••':((delta>=0?'+':'−')+M(Math.abs(delta))+' · '+Math.abs(pct).toFixed(2)+'%'))+'</span></div><div id="mfJourneyChart"><svg viewBox="0 0 '+W+' '+H+'"><polygon points="'+pad+','+(H-pad)+' '+pts+' '+(W-pad)+','+(H-pad)+'" class="mfInvArea77"/><polyline points="'+pts+'" class="mfInvLine77"/></svg></div><div class="mut sm mfGraphFoot">'+labels[range]+' · '+a.length+' נקודות</div>';
 c.querySelectorAll('[data-r]').forEach(b=>{b.classList.toggle('on',b.dataset.r===range);b.onclick=()=>{range=b.dataset.r;draw()}})}
function bind(){const e=q('#eye');if(e&&!e.dataset.hist78){e.dataset.hist78='1';e.addEventListener('click',()=>setTimeout(draw,100))}loadHist();setTimeout(snap,600)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,350));else setTimeout(bind,50);window.addEventListener('mf:data-loaded',()=>setTimeout(bind,80));window.addEventListener('mf:rendered',()=>setTimeout(loadHist,50));window.addEventListener('mf:view',e=>{if(e.detail?.view==='home')setTimeout(loadHist,50)});
})();
// TRUE_INVESTMENT_HISTORY_V78
;(()=>{'use strict';
let hist=[],range='all',who='all';
const q=(s,r=document)=>r.querySelector(s),M=n=>'₪'+Math.round(+n||0).toLocaleString('he-IL'),masked=()=>typeof showM!=='undefined'&&!showM;
function client(){try{if(typeof sb!=='undefined'&&sb?.from)return sb}catch{}return window.supabaseClient||window._supabase||null}
function hid79(){try{if(typeof hid!=='undefined'&&hid)return hid}catch{}return window.householdId||window.HOUSEHOLD_ID||'624774ee-dda3-4c4e-9708-9f279ac09d1d'}
function val(x){const units=who==='itay'?x.iu:who==='noa'?x.nu:x.iu+x.nu;return units*x.p/100}
async function load(){const s=client();if(!s?.from)return;try{const r=await s.from('mf_investment_history').select('snapshot_date,price_agorot,itay_units,noa_units').eq('household_id',hid79()).order('snapshot_date',{ascending:true});if(!r.error&&r.data?.length){hist=r.data.map(x=>({d:x.snapshot_date,p:+x.price_agorot,iu:+x.itay_units,nu:+x.noa_units}));draw()}}catch(e){}}
function subset(){if(!hist.length)return[];if(range==='all')return hist;const last=new Date(hist.at(-1).d+'T12:00:00'),cut=new Date(last);cut.setDate(cut.getDate()-(range==='week'?7:31));return hist.filter(x=>new Date(x.d+'T12:00:00')>=cut)}
function draw(){const c=q('#mfCapitalJourney');if(!c||!hist.length)return;const a=subset(),vals=a.map(val),first=vals[0],cur=vals.at(-1),delta=cur-first,pct=first?delta/first*100:0,W=340,H=140,pad=15,mn=Math.min(...vals),mx=Math.max(...vals),rg=Math.max(1,mx-mn),X=i=>pad+(W-2*pad)*(i/Math.max(1,a.length-1)),Y=v=>H-pad-(H-2*pad)*(v-mn)/rg,pts=vals.map((v,i)=>X(i)+','+Y(v)).join(' '),rl={week:'שבוע אחרון',month:'חודש אחרון',all:'מתחילת הדרך'},wl={all:'כולם',itay:'איתי',noa:'נועה'};
c.innerHTML='<div class="sectiontitle"><h2>גרף שינוי ההשקעה</h2><div class="mfWhoBtns79"><button data-w="itay">איתי</button><button data-w="noa">נועה</button><button data-w="all">כולם</button></div></div><div class="mfRangeBtnsV78"><button data-r="week">שבוע</button><button data-r="month">חודש</button><button data-r="all">מההתחלה</button></div><div class="mfGraphBrief"><b>'+(masked()?'•••••• ₪':M(cur))+'</b><span class="'+(delta>=0?'good':'bad')+'">'+(masked()?'••••••':((delta>=0?'+':'−')+M(Math.abs(delta))+' · '+Math.abs(pct).toFixed(2)+'%'))+'</span></div><div id="mfJourneyChart"><svg viewBox="0 0 '+W+' '+H+'"><polygon points="'+pad+','+(H-pad)+' '+pts+' '+(W-pad)+','+(H-pad)+'" class="mfInvArea77"/><polyline points="'+pts+'" class="mfInvLine77"/></svg></div><div class="mut sm mfGraphFoot">'+wl[who]+' · '+rl[range]+' · '+a.length+' נקודות</div>';
c.querySelectorAll('[data-r]').forEach(b=>{b.classList.toggle('on',b.dataset.r===range);b.onclick=()=>{range=b.dataset.r;draw()}});c.querySelectorAll('[data-w]').forEach(b=>{b.classList.toggle('on',b.dataset.w===who);b.onclick=()=>{who=b.dataset.w;draw()}})}
function bind(){const e=q('#eye');if(e&&!e.dataset.g79){e.dataset.g79='1';e.addEventListener('click',()=>setTimeout(draw,90))}load()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,400));else setTimeout(bind,60);window.addEventListener('mf:data-loaded',()=>setTimeout(load,100));window.addEventListener('mf:rendered',()=>setTimeout(load,80));window.addEventListener('mf:view',e=>{if(e.detail?.view==='home')setTimeout(load,80)});
})();
// TRUE_INVESTMENT_HISTORY_PERSON_FILTER_V79
;(()=>{'use strict';
function enhance(){const c=document.querySelector('#mfCapitalJourney');if(!c)return;const svg=c.querySelector('#mfJourneyChart svg');if(!svg||svg.dataset.points80)return;svg.dataset.points80='1';
let hs=[];try{hs=(typeof hist!=='undefined'?hist:[])}catch{};
// v79 history is closure-scoped, so reconstruct from rendered polyline and displayed range; dots map to current SVG points.
const pl=svg.querySelector('polyline');if(!pl)return;const raw=(pl.getAttribute('points')||'').trim().split(/\s+/).filter(Boolean);if(!raw.length)return;
const vb=(svg.getAttribute('viewBox')||'0 0 340 140').split(/\s+/).map(Number), W=vb[2]||340,H=vb[3]||140;
const layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.setAttribute('class','mfPointLayer80');
raw.forEach((p,i)=>{const [x,y]=p.split(',').map(Number);const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','mfDot80');g.setAttribute('data-i',i);const hit=document.createElementNS('http://www.w3.org/2000/svg','circle');hit.setAttribute('cx',x);hit.setAttribute('cy',y);hit.setAttribute('r','11');hit.setAttribute('class','mfDotHit80');const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r','3.2');dot.setAttribute('class','mfDotVisual80');g.append(hit,dot);layer.appendChild(g)});svg.appendChild(layer);
const tip=document.createElement('div');tip.className='mfGraphTip80';tip.style.visibility='hidden';c.querySelector('#mfJourneyChart')?.appendChild(tip);
function valuesFromGraph(){const brief=c.querySelector('.mfGraphBrief b')?.textContent||'';const change=c.querySelector('.mfGraphBrief span')?.textContent||'';return {brief,change}}
layer.querySelectorAll('.mfDot80').forEach((g,i)=>{const show=e=>{e.preventDefault();e.stopPropagation();layer.querySelectorAll('.mfDot80').forEach(x=>x.classList.remove('sel'));g.classList.add('sel');let text='נקודה '+(i+1);try{const a=(typeof subset==='function'?subset():[]);if(a[i]&&typeof val==='function'){const v=val(a[i]);text=new Date(a[i].d+'T12:00:00').toLocaleDateString('he-IL')+' · ₪'+Math.round(v).toLocaleString('he-IL')}}catch{};if(text.startsWith('נקודה')){const {brief}=valuesFromGraph();if(i===raw.length-1&&brief)text=brief}tip.textContent=(typeof showM!=='undefined'&&!showM)?'•••••• ₪':text;tip.style.left=Math.max(8,Math.min(82,(parseFloat(g.querySelector('circle').getAttribute('cx'))/W)*100))+'%';tip.style.top=Math.max(5,(parseFloat(g.querySelector('circle').getAttribute('cy'))/H)*100-8)+'%';tip.style.visibility='visible'};g.addEventListener('click',show);g.addEventListener('touchstart',show,{passive:false})});
}
function run(){setTimeout(enhance,80)}
document.addEventListener('click',e=>{if(e.target.closest('#mfCapitalJourney button'))run()});window.addEventListener('mf:rendered',run);window.addEventListener('mf:data-loaded',run);window.addEventListener('mf:view',run);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
// GRAPH_CLICK_POINTS_STABLE_PRIVACY_V80
;(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
function purgeMore(){q('#mfMoreWrap')?.remove();qa('.mfMoreBtn').forEach(x=>x.remove())}
function lockGraph(){const c=q('#mfCapitalJourney');if(!c)return;c.classList.add('mfGraphStable81');const b=q('.mfGraphBrief',c),ch=q('#mfJourneyChart',c),f=q('.mfGraphFoot',c);if(b)b.style.minHeight='34px';if(ch){ch.style.height='160px';ch.style.minHeight='160px';ch.style.maxHeight='160px'}if(f)f.style.minHeight='18px'}
function run(){purgeMore();lockGraph()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
window.addEventListener('mf:data-loaded',()=>setTimeout(run,0));window.addEventListener('mf:rendered',()=>setTimeout(run,0));window.addEventListener('mf:view',()=>setTimeout(run,0));
new MutationObserver(()=>{if(q('#mfMoreWrap')||q('.mfMoreBtn')||q('#mfCapitalJourney'))requestAnimationFrame(run)}).observe(document.documentElement,{subtree:true,childList:true});
})();
// REMOVE_MORE_LOCK_GRAPH_V81
;(()=>{'use strict';
let H=[],R='all',W='all';
const q=(s,r=document)=>r.querySelector(s),M=n=>'₪'+Math.round(+n||0).toLocaleString('he-IL');
function sbc(){try{if(typeof sb!=='undefined'&&sb?.from)return sb}catch{}return window.supabaseClient||window._supabase||null}
function hh(){try{if(typeof hid!=='undefined'&&hid)return hid}catch{}return window.householdId||window.HOUSEHOLD_ID||'624774ee-dda3-4c4e-9708-9f279ac09d1d'}
function v(x){const u=W==='itay'?x.iu:W==='noa'?x.nu:x.iu+x.nu;return u*x.p/100}
function arr(){if(R==='all')return H;const last=new Date(H.at(-1).d+'T12:00:00'),cut=new Date(last);cut.setDate(cut.getDate()-(R==='week'?7:31));return H.filter(x=>new Date(x.d+'T12:00:00')>=cut)}
function place(){const c=q('#mfCapitalJourney'),home=q('#home'),snap=q('#mfDashboardSnapshot');if(!c||!home)return;if(snap){if(snap.nextElementSibling!==c)snap.after(c)}else{const hero=q(':scope>.hero',home);if(hero&&hero.nextElementSibling!==c)hero.after(c)}}
async function load82(){const s=sbc();if(!s?.from)return;const r=await s.from('mf_investment_history').select('snapshot_date,price_agorot,itay_units,noa_units').eq('household_id',hh()).order('snapshot_date',{ascending:true});if(!r.error&&r.data?.length){H=r.data.map(x=>({d:x.snapshot_date,p:+x.price_agorot,iu:+x.itay_units,nu:+x.noa_units}));draw82()}}
function draw82(){const c=q('#mfCapitalJourney');if(!c||!H.length)return;const a=arr(),vals=a.map(v),first=vals[0],cur=vals.at(-1),delta=cur-first,pct=first?delta/first*100:0,Wd=340,Hh=150,p=16,mn=Math.min(...vals),mx=Math.max(...vals),rg=Math.max(1,mx-mn),X=i=>p+(Wd-2*p)*(i/Math.max(1,a.length-1)),Y=z=>Hh-p-(Hh-2*p)*(z-mn)/rg,pts=vals.map((z,i)=>[X(i),Y(z)]),line=pts.map(x=>x.join(',')).join(' '),area=`${p},${Hh-p} ${line} ${Wd-p},${Hh-p}`,mask=typeof showM!=='undefined'&&!showM,rl={week:'שבוע',month:'חודש',all:'מההתחלה'},wl={all:'כולם',itay:'איתי',noa:'נועה'};
c.innerHTML='<div class="sectiontitle"><h2>גרף שינוי ההשקעה</h2><div class="mfWhoBtns82"><button data-w="itay">איתי</button><button data-w="noa">נועה</button><button data-w="all">כולם</button></div></div><div class="mfRangeBtns82"><button data-r="week">שבוע</button><button data-r="month">חודש</button><button data-r="all">מההתחלה</button></div><div class="mfGraphBrief82"><b>'+(mask?'•••••• ₪':M(cur))+'</b><span class="'+(delta>=0?'good':'bad')+'">'+(mask?'••••••':((delta>=0?'+':'−')+M(Math.abs(delta))+' · '+Math.abs(pct).toFixed(2)+'%'))+'</span></div><div id="mfJourneyChart82"><svg viewBox="0 0 '+Wd+' '+Hh+'" preserveAspectRatio="none"><polygon points="'+area+'" class="mfInvArea77"/><polyline points="'+line+'" class="mfInvLine77"/>'+pts.map((xy,i)=>'<circle class="mfP82" data-i="'+i+'" cx="'+xy[0]+'" cy="'+xy[1]+'" r="7"/>').join('')+'</svg><div id="mfTip82"></div></div><div class="mut sm mfGraphFoot82">'+wl[W]+' · '+rl[R]+' · '+a.length+' נקודות</div>';
c.querySelectorAll('[data-r]').forEach(b=>{b.classList.toggle('on',b.dataset.r===R);b.onclick=()=>{R=b.dataset.r;draw82();place()}});c.querySelectorAll('[data-w]').forEach(b=>{b.classList.toggle('on',b.dataset.w===W);b.onclick=()=>{W=b.dataset.w;draw82();place()}});
c.querySelectorAll('.mfP82').forEach(el=>{const show=e=>{e.preventDefault();e.stopPropagation();const i=+el.dataset.i,x=a[i],val=v(x),tip=q('#mfTip82',c);c.querySelectorAll('.mfP82').forEach(z=>z.classList.remove('sel'));el.classList.add('sel');tip.textContent=mask?'•••••• ₪':(new Date(x.d+'T12:00:00').toLocaleDateString('he-IL')+' · '+M(val));tip.style.left=(parseFloat(el.getAttribute('cx'))/Wd*100)+'%';tip.style.top=Math.max(3,(parseFloat(el.getAttribute('cy'))/Hh*100)-6)+'%';tip.classList.add('on')};el.addEventListener('click',show);el.addEventListener('pointerup',show)});place()}
function clean(){q('#mfMoreWrap')?.remove();document.querySelectorAll('.mfMoreBtn').forEach(x=>x.remove());place()}
function boot(){clean();load82();const eye=q('#eye');if(eye&&!eye.dataset.g82){eye.dataset.g82='1';eye.addEventListener('click',()=>setTimeout(()=>{draw82();place()},120))}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,350));else setTimeout(boot,80);window.addEventListener('mf:data-loaded',()=>setTimeout(boot,120));window.addEventListener('mf:rendered',()=>setTimeout(()=>{draw82();clean()},100));window.addEventListener('mf:view',e=>{if(e.detail?.view==='home')setTimeout(()=>{draw82();clean()},100)});
new MutationObserver(()=>requestAnimationFrame(place)).observe(document.documentElement,{subtree:true,childList:true});
})();
// GRAPH_FULL_OVERRIDE_CLICK_FIXED_POSITION_V82
;(()=>{'use strict';
function polish(){const c=document.querySelector('#mfCapitalJourney');if(!c)return;const chart=c.querySelector('#mfJourneyChart');const svg=chart?.querySelector('svg');if(!svg)return;
// Restore the clean old visual: tiny dots only. Keep a large invisible tap target around each one.
svg.querySelectorAll('circle').forEach((dot,i)=>{if(dot.classList.contains('mfTap83'))return;dot.setAttribute('r','3.1');dot.classList.add('mfPrettyDot83');const hit=document.createElementNS('http://www.w3.org/2000/svg','circle');hit.setAttribute('cx',dot.getAttribute('cx'));hit.setAttribute('cy',dot.getAttribute('cy'));hit.setAttribute('r','13');hit.setAttribute('class','mfTap83');hit.setAttribute('data-point',i);dot.parentNode.insertBefore(hit,dot);});
// If older tooltip exists, restyle/reuse it. Otherwise create a compact floating bubble.
let tip=chart.querySelector('.mfGraphTip82,.mfGraphTip80,.mfTip82,.mfPointTip82,.mfMiniTip83');if(!tip){tip=document.createElement('div');tip.className='mfMiniTip83';chart.appendChild(tip)}else tip.classList.add('mfMiniTip83');
chart.querySelectorAll('.mfTap83').forEach(hit=>{if(hit.dataset.bound83)return;hit.dataset.bound83='1';const show=e=>{e.preventDefault();e.stopPropagation();const i=+hit.dataset.point;let label='';
// Prefer any value/date already attached by v82.
label=hit.dataset.label||hit.getAttribute('aria-label')||'';
if(!label){const vis=hit.nextElementSibling;label=vis?.dataset?.label||vis?.getAttribute?.('aria-label')||''}
// If v82 click handler exists on the visible dot, trigger it first and then mirror its tooltip text.
const vis=hit.nextElementSibling;if(vis){try{vis.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))}catch{}}
setTimeout(()=>{const old=[...chart.querySelectorAll('.mfGraphTip82,.mfGraphTip80,.mfTip82,.mfPointTip82')].find(x=>x!==tip&&x.textContent.trim());if(old)label=old.textContent.trim();if(!label){const brief=c.querySelector('.mfGraphBrief b')?.textContent?.trim()||'';label=i===chart.querySelectorAll('.mfTap83').length-1?brief:'נקודה '+(i+1)}tip.textContent=label;const svgBox=svg.getBoundingClientRect(),chBox=chart.getBoundingClientRect(),cx=+hit.getAttribute('cx'),cy=+hit.getAttribute('cy'),vb=svg.viewBox.baseVal;let left=(cx-vb.x)/vb.width*svgBox.width+(svgBox.left-chBox.left),top=(cy-vb.y)/vb.height*svgBox.height+(svgBox.top-chBox.top);tip.style.left=Math.max(34,Math.min(chBox.width-34,left))+'px';tip.style.top=Math.max(8,top-8)+'px';tip.classList.add('on')},20)};hit.addEventListener('click',show);hit.addEventListener('touchstart',show,{passive:false})});
}
function run(){setTimeout(polish,90)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('mf:data-loaded',run);window.addEventListener('mf:rendered',run);window.addEventListener('mf:view',run);document.addEventListener('click',e=>{if(e.target.closest('#mfCapitalJourney button'))run()});
})();
// GRAPH_PRETTY_DOTS_TINY_TOOLTIP_V83
;(()=>{'use strict';
function restyle(){const box=document.querySelector('#mfCapitalJourney');if(!box)return;const svg=box.querySelector('svg');if(!svg)return;
// v82 uses .mfP82 as the visible/tappable circle. Make it visually identical to the original subtle point,
// while preserving a separate invisible large hit target cloned around it.
svg.querySelectorAll('.mfP82').forEach((p,i)=>{p.classList.add('mfOldLook84');p.setAttribute('r','3');p.style.pointerEvents='none';if(!svg.querySelector('.mfHit84[data-i="'+i+'"]')){const h=p.cloneNode(false);h.classList.remove('mfP82','mfOldLook84','sel');h.classList.add('mfHit84');h.dataset.i=i;h.setAttribute('r','13');h.style.pointerEvents='all';p.parentNode.insertBefore(h,p.nextSibling);const fire=e=>{e.preventDefault();e.stopPropagation();try{p.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:e.clientX||0,clientY:e.clientY||0}))}catch{};};h.addEventListener('click',fire);h.addEventListener('touchend',fire,{passive:false});}}
);
}
const obs=new MutationObserver(()=>requestAnimationFrame(restyle));function start(){const b=document.querySelector('#mfCapitalJourney');if(b){obs.observe(b,{childList:true,subtree:true});restyle()}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,250));else setTimeout(start,100);window.addEventListener('mf:rendered',()=>setTimeout(restyle,80));window.addEventListener('mf:data-loaded',()=>setTimeout(restyle,80));
})();
// OLD_POINT_LOOK_BIG_HITBOX_V84
;(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],M=n=>'₪'+Math.round(+n||0).toLocaleString('he-IL'),D=n=>(typeof showM!=='undefined'&&!showM)?'•••••• ₪':M(n);
function ensure(){const main=q('main.app'),nav=q('.navin');if(!main||!nav)return;let s=q('#smartpro');if(!s){s=document.createElement('section');s.id='smartpro';s.className='v mfSmartPro';s.innerHTML=`
<div class="c mfSmartHero"><div class="mfSmartTop"><div><span class="mfProPill">MONEYFLOW PRO</span><h2>🧠 המרכז החכם</h2><p>תמונה אחת שמתרגמת את הנתונים שלך להחלטות.</p></div><div class="mfScoreRing" id="mfProScoreRing"><b id="mfProScore">0</b><small>ציון פיננסי</small></div></div></div>
<div class="c"><div class="sectiontitle"><h2>מה אפשר לעשות עכשיו?</h2><span class="badge">LIVE</span></div><div class="mfSmartGrid"><div class="mini"><span class="mut sm">בטוח להוציא עד סוף החודש</span><b id="mfSafeSpend">—</b><small id="mfSafeSpendSub"></small></div><div class="mini"><span class="mut sm">תקציב יומי חכם</span><b id="mfDailyBudget">—</b><small id="mfDailyBudgetSub"></small></div><div class="mini"><span class="mut sm">שיעור חיסכון</span><b id="mfProSaveRate">—</b><small>החודש</small></div><div class="mini"><span class="mut sm">תחזית לסוף החודש</span><b id="mfMonthEnd">—</b><small id="mfMonthEndSub"></small></div></div></div>
<div class="c mfAiCard"><div class="sectiontitle"><h2>✨ AI PRO</h2><span class="mfProPill smp">PRO</span></div><div id="mfAiProText" class="mfAiText">מנתח את החודש…</div></div>
<div class="c"><div class="sectiontitle"><h2>חריגות ודפוסים</h2><span class="badge">חכם</span></div><div id="mfAnomalies"></div></div>
<div class="c"><div class="sectiontitle"><h2>היעד הבא</h2><span class="badge">תחזית</span></div><div class="mfGoalForecast"><div><span class="mut sm">שווי מושקע</span><b id="mfProCapital">—</b></div><div><span class="mut sm">חסר ל־₪280K</span><b id="mfProGap">—</b></div><div><span class="mut sm">צפי לפי הקצב</span><b id="mfProEta">—</b></div></div></div>`;main.appendChild(s)}
let b=q('[data-v="smartpro"]',nav);if(!b){b=document.createElement('button');b.dataset.v='smartpro';b.innerHTML='<b>✦</b><span>חכם</span><em>PRO</em>';b.onclick=window.mfShowSmartPro;nav.appendChild(b)}nav.style.gridTemplateColumns='repeat(5,1fr)'}
function currentMonth(){try{return typeof mfScopeStats==='function'?mfScopeStats(ms(0)):ms(0)}catch{return {a:[],i:0,e:0,s:0}}}
function prevMonth(){try{return typeof mfScopeStats==='function'?mfScopeStats(ms(-1)):ms(-1)}catch{return {a:[],i:0,e:0,s:0}}}
function inv(){try{return typeof invVals==='function'?invVals():{j:0}}catch{return {j:0}}}
function calcSmart(){const m=currentMonth(),pm=prevMonth(),now=new Date(),daysIn=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),left=Math.max(1,daysIn-now.getDate()+1),elapsed=Math.max(1,now.getDate()),dailyExp=m.e/elapsed,projectedExp=dailyExp*daysIn,projectedNet=m.i-projectedExp,rate=m.i?m.s/m.i:0;let targetSave=Math.max(0,m.i*.35),safe=Math.max(0,m.i-m.e-targetSave),daily=safe/left;const cap=Math.max(0,+inv().j||0),goal=+set.joint_goal||280000,gap=Math.max(0,goal-cap);let recent=[];try{recent=[0,-1,-2].map(o=>mfScopeStats(ms(o)).s)}catch{}let pace=Math.max(0,recent.reduce((a,b)=>a+(+b||0),0)/Math.max(1,recent.length)),months=pace>0?Math.ceil(gap/pace):Infinity;let eta='עוד אין קצב';if(gap<=0)eta='היעד הושג';else if(isFinite(months)){const d=new Date();d.setMonth(d.getMonth()+months);eta=d.toLocaleDateString('he-IL',{month:'short',year:'numeric'})}const improve=pm.e?((pm.e-m.e)/pm.e):0,score=Math.round(Math.max(0,Math.min(100,45*Math.max(0,Math.min(1,rate/.35))+25*Math.max(0,Math.min(1,(m.s>0?m.s:0)/Math.max(1,targetSave)))+20*Math.max(0,Math.min(1,cap/goal))+10*Math.max(0,Math.min(1,.5+improve)))));return{m,pm,left,elapsed,dailyExp,projectedExp,projectedNet,rate,safe,daily,cap,gap,pace,eta,score}}
function anomalyRows(x){const rows=(x.m.a||[]).filter(z=>z.kind==='expense'),avg=rows.length?x.m.e/rows.length:0,big=rows.filter(z=>+z.amount>Math.max(250,avg*1.8)).sort((a,b)=>+b.amount-+a.amount).slice(0,2),cats={};rows.forEach(z=>cats[z.category]=(cats[z.category]||0)+ +z.amount);const top=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0];let out=[];if(big[0])out.push(`<div class="mfSignal warn"><i>!</i><div><b>הוצאה חריגה</b><span>${big[0].category} · ${D(big[0].amount)}</span></div></div>`);if(top)out.push(`<div class="mfSignal"><i>↗</i><div><b>הקטגוריה המובילה</b><span>${top[0]} · ${D(top[1])}</span></div></div>`);if(x.pm.e&&x.m.e>x.pm.e*1.15)out.push(`<div class="mfSignal warn"><i>∆</i><div><b>קצב הוצאות גבוה</b><span>כבר עברתם את החודש הקודם ב־${Math.round((x.m.e/x.pm.e-1)*100)}%</span></div></div>`);if(!out.length)out.push('<div class="mfSignal good"><i>✓</i><div><b>אין חריגה משמעותית</b><span>ההתנהלות החודש נראית יציבה.</span></div></div>');return out.join('')}
function aiText(x){if(x.m.i<=0)return 'עדיין אין מספיק הכנסות החודש כדי לבנות המלצה מדויקת. אחרי שיצטברו עוד נתונים המרכז יתחדד אוטומטית.';if(x.rate>=.35)return `אתם בקצב חיסכון חזק של ${Math.round(x.rate*100)}%. לפי הנתונים כרגע אפשר לשמור על הקצב ועדיין להשאיר כ־${D(x.safe)} להוצאות עד סוף החודש.`;if(x.projectedNet<0)return `בקצב ההוצאות הנוכחי החודש עלול להסתיים במינוס של כ־${D(Math.abs(x.projectedNet))}. ההמלצה החכמה כרגע היא להוריד את ההוצאה היומית לכ־${D(x.daily)}.`;return `החודש חיובי, אבל יש מקום לשיפור. אם תשמרו על תקציב יומי של כ־${D(x.daily)}, תוכלו להגן על יעד חיסכון של כ־35% מההכנסות.`}
function paint(){ensure();const s=q('#smartpro');if(!s)return;const x=calcSmart(),mask=typeof showM!=='undefined'&&!showM;q('#mfProScore').textContent=x.score;q('#mfProScoreRing').style.setProperty('--score',x.score);q('#mfSafeSpend').textContent=mask?'•••••• ₪':M(x.safe);q('#mfSafeSpendSub').textContent=x.left+' ימים נותרו';q('#mfDailyBudget').textContent=mask?'•••••• ₪':M(x.daily);q('#mfDailyBudgetSub').textContent='ליום עד סוף החודש';q('#mfProSaveRate').textContent=Math.round(x.rate*100)+'%';q('#mfMonthEnd').textContent=mask?'•••••• ₪':M(x.projectedNet);q('#mfMonthEnd').className=x.projectedNet>=0?'good':'bad';q('#mfMonthEndSub').textContent='נטו חזוי';q('#mfAiProText').textContent=mask?'מצב פרטיות פעיל — פתח את העין כדי לראות המלצה חכמה.':aiText(x);q('#mfAnomalies').innerHTML=anomalyRows(x);q('#mfProCapital').textContent=mask?'•••••• ₪':M(x.cap);q('#mfProGap').textContent=mask?'•••••• ₪':M(x.gap);q('#mfProEta').textContent=x.eta}
window.mfShowSmartPro=function(){ensure();qa('main.app>section.v').forEach(s=>s.classList.toggle('on',s.id==='smartpro'));qa('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.v==='smartpro'));paint();scrollTo(0,0);window.dispatchEvent(new CustomEvent('mf:view',{detail:{view:'smartpro'}}))};
function boot(){ensure();paint();const e=q('#eye');if(e&&!e.dataset.pro85){e.dataset.pro85='1';e.addEventListener('click',()=>setTimeout(paint,100))}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,300));else setTimeout(boot,80);window.addEventListener('mf:data-loaded',()=>setTimeout(paint,80));window.addEventListener('mf:rendered',()=>setTimeout(boot,50));window.addEventListener('mf:view',e=>{if(e.detail?.view==='smartpro')setTimeout(paint,30)});
})();
// SMART_CENTER_PRO_V85
;(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s);
function install(){
 // The grouped-history renderer from v59 replaced the earlier renderer and dropped its delete control.
 // Add a compact delete action to every real transaction after each render.
 const hist=q('#hist'); if(!hist)return;
 hist.querySelectorAll('.mfHistRowV59').forEach((row,i)=>{
   if(row.querySelector('.mfHistDelete86'))return;
   // Match the rendered row back to the currently visible transaction using its displayed data.
   const info=row.querySelector('.mfHistInfoV59'), amt=row.querySelector('.mfHistAmtV59');
   const category=info?.querySelector('b')?.textContent?.trim()||'';
   const meta=info?.querySelector('span')?.textContent||'';
   const person=meta.split(' · ')[0].trim();
   const amount=Number((amt?.textContent||'').replace(/[^0-9.]/g,''));
   const kind=amt?.classList.contains('plus')?'income':'expense';
   let candidates=[];try{candidates=rs().filter(x=>!x.virtual&&x.category!=='משכורת צבאית'&&x.kind===kind&&x.person===person&&String(x.category||'אחר')===category&&Math.abs((+x.amount||0)-amount)<0.01)}catch{}
   // Day header immediately above this group lets us narrow by date where possible.
   let p=row.previousElementSibling,date='';while(p&&!p.classList.contains('mfDayHead'))p=p.previousElementSibling;if(p){const txt=p.querySelector('span')?.textContent||'';try{const parts=txt.split('.');if(parts.length===3)date=parts[2]+'-'+parts[1].padStart(2,'0')+'-'+parts[0].padStart(2,'0')}catch{}}
   if(date)candidates=candidates.filter(x=>String(x.transaction_date).slice(0,10)===date);
   const x=candidates[0];if(!x)return;
   row.dataset.txid=x.id;
   const btn=document.createElement('button');btn.type='button';btn.className='mfHistDelete86';btn.setAttribute('aria-label','מחיקת תנועה');btn.textContent='מחיקה';btn.onclick=async e=>{e.stopPropagation();if(!confirm('למחוק את התנועה הזו?'))return;btn.disabled=true;btn.textContent='מוחק…';try{if(typeof del==='function'){await del(String(x.id));setTimeout(()=>{try{historyR()}catch{}},120)}else{const r=await sb.from('mf_transactions').delete().eq('id',x.id).eq('household_id',hid);if(r.error)throw r.error;await load();}}catch{btn.disabled=false;btn.textContent='מחיקה';try{t('המחיקה נכשלה')}catch{}}};
   const amountBox=row.querySelector('.mfHistAmtV59');if(amountBox){const wrap=document.createElement('div');wrap.className='mfHistActions86';amountBox.replaceWith(wrap);wrap.append(amountBox,btn)}
 });
}
function run(){setTimeout(install,30)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
window.addEventListener('mf:view',e=>{if(e.detail?.view==='history')run()});window.addEventListener('mf:data-loaded',run);window.addEventListener('mf:rendered',run);
const h=q('#hist');if(h)new MutationObserver(()=>requestAnimationFrame(install)).observe(h,{childList:true,subtree:true});
})();
// HISTORY_DELETE_ACTION_V86
