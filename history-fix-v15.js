(()=>{
function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()}
function addStyle(){if(document.getElementById('mfHistory15Style'))return;const s=document.createElement('style');s.id='mfHistory15Style';s.textContent=`
#history>.c{padding:14px!important;overflow:hidden!important}
#history h2{margin-bottom:12px!important}
#history #search{height:48px!important;min-height:48px!important;border-radius:14px!important;padding:0 14px!important}
#history .g2{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin-top:8px!important}
#history .g2 select{height:46px!important;min-height:46px!important;border-radius:13px!important;padding:0 12px!important;font-size:15px!important}
#history #fm{height:44px!important;min-height:44px!important;margin-top:8px!important;border-radius:13px!important;padding:0 12px!important;font-size:14px!important;background:#0b1725!important}
#history #hist{width:100%!important;min-width:0!important;margin-top:12px!important;overflow:visible!important}
#history #hist .txn{display:grid!important;grid-template-columns:minmax(0,1fr) 96px!important;grid-template-rows:auto!important;align-items:center!important;gap:10px!important;width:100%!important;max-width:100%!important;min-width:0!important;padding:12px 13px!important;margin:8px 0!important;border-radius:16px!important;overflow:hidden!important}
#history #hist .txn>div:first-child{min-width:0!important;text-align:right!important;overflow:hidden!important}
#history #hist .txn>div:first-child>b{display:block!important;font-size:15px!important;line-height:1.25!important;white-space:normal!important;overflow-wrap:anywhere!important;margin:0!important}
#history #hist .txn .mut.sm{display:block!important;margin-top:4px!important;font-size:11px!important;line-height:1.35!important;white-space:normal!important;overflow-wrap:anywhere!important;color:#9fb0c4!important}
#history #hist .txn>div:last-child{min-width:0!important;width:96px!important;max-width:96px!important;display:grid!important;grid-template-columns:1fr!important;justify-items:start!important;align-content:center!important;gap:6px!important;text-align:left!important}
#history #hist .txn>div:last-child>b{display:block!important;max-width:96px!important;font-size:14px!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;text-align:left!important;margin:0!important}
#history #hist .txn>div:last-child br{display:none!important}
#history #hist .txn .btn.d{height:29px!important;min-height:29px!important;padding:0 10px!important;border-radius:9px!important;font-size:10px!important;line-height:29px!important;width:auto!important;margin:0!important}
@media(max-width:430px){
 #history>.c{padding:12px!important}
 #history #hist .txn{grid-template-columns:minmax(0,1fr) 88px!important;gap:8px!important;padding:11px!important}
 #history #hist .txn>div:last-child{width:88px!important;max-width:88px!important}
 #history #hist .txn>div:last-child>b{max-width:88px!important;font-size:13px!important}
}
@media(max-width:350px){
 #history #hist .txn{grid-template-columns:1fr!important;gap:8px!important}
 #history #hist .txn>div:last-child{width:100%!important;max-width:none!important;display:flex!important;justify-content:space-between!important;align-items:center!important;border-top:1px solid #24344a!important;padding-top:8px!important}
 #history #hist .txn>div:last-child>b{max-width:65%!important;text-align:right!important}
}
`;document.head.appendChild(s)}
function labelMonth(){const fm=document.getElementById('fm');if(!fm||fm.dataset.mfHistory15)return;fm.dataset.mfHistory15='1';fm.setAttribute('aria-label','סינון לפי חודש');fm.title='סינון לפי חודש'}
function init(){addStyle();labelMonth();new MutationObserver(()=>labelMonth()).observe(document.body,{childList:true,subtree:true})}
ready(init)
})();