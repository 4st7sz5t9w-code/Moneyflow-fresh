(()=>{
function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()}
function inject(){if(document.getElementById('mfHistoryMobileFix'))return;const s=document.createElement('style');s.id='mfHistoryMobileFix';s.textContent=`
#history .c{overflow:hidden}
#history #hist{min-width:0;width:100%;overflow:hidden}
#history .txn{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:start!important;gap:10px!important;width:100%!important;max-width:100%!important;overflow:hidden!important}
#history .txn>div{min-width:0!important;max-width:100%!important}
#history .txn>div:first-child{overflow:hidden!important}
#history .txn>div:first-child b{display:block;overflow-wrap:anywhere;word-break:break-word}
#history .txn .mut.sm{display:block;max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:break-word!important;line-height:1.45}
#history .txn>div:last-child{display:flex!important;flex-direction:column!important;align-items:flex-end!important;justify-content:flex-start!important;min-width:82px!important;max-width:42vw!important;gap:6px!important;text-align:left!important}
#history .txn>div:last-child>b{display:block;max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:break-word!important;line-height:1.25;text-align:left}
#history .txn .btn.d{min-height:30px!important;height:30px!important;padding:0 9px!important;border-radius:9px!important;font-size:11px!important;width:auto!important;max-width:100%!important}
#history input,#history select{width:100%!important;max-width:100%!important;min-width:0!important}
@media(max-width:390px){
 #history .txn{grid-template-columns:minmax(0,1fr) minmax(74px,34%)!important;padding:11px!important;gap:8px!important}
 #history .txn>div:last-child{min-width:0!important;max-width:none!important;width:100%!important}
 #history .txn .mut.sm{font-size:11px!important}
 #history .txn>div:last-child>b{font-size:14px!important}
}
@media(max-width:340px){
 #history .txn{grid-template-columns:1fr!important}
 #history .txn>div:last-child{align-items:flex-start!important;text-align:right!important;border-top:1px solid #24344a;padding-top:8px}
 #history .txn>div:last-child>b{text-align:right!important}
}
`;document.head.appendChild(s)}
ready(inject)
})();