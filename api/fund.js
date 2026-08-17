export default async function handler(req,res){
  try{
    const r=await fetch('https://www.bizportal.co.il/mutualfunds/quote/generalview/5127576',{headers:{'user-agent':'Mozilla/5.0 MoneyFlow/1.0','accept-language':'he-IL,he;q=0.9,en;q=0.8'}});
    const html=await r.text();
    const m=html.match(/מחיר פדיון[\s\S]{0,800}?([0-9]{3,4}(?:\.[0-9]{1,3})?)/) || html.match(/5127576[\s\S]{0,1600}?([0-9]{3,4}(?:\.[0-9]{1,3})?)/);
    if(!m) return res.status(502).json({ok:false,error:'price_not_found'});
    const price=Number(m[1]);
    if(!Number.isFinite(price)) return res.status(502).json({ok:false,error:'invalid_price'});
    res.setHeader('Cache-Control','s-maxage=1800, stale-while-revalidate=86400');
    return res.status(200).json({ok:true,fund:5127576,name:'פסטרנק שהם מניות',price,unit:'agorot',source:'Bizportal',updatedAt:new Date().toISOString()});
  }catch(e){
    return res.status(500).json({ok:false,error:'fetch_failed'});
  }
}