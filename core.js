/* Shared content rules. No DOM, storage, or network side effects. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.JuniCore=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const THEMES=['lounge','manor','stage','desert','stairs','romance','society','dragon'];
 const ARTWORK_RATIOS=['1 / 1','2 / 3','4 / 3'];
 const MOODS={setting:['modern','fantasy','supernatural','fandom'],connection:['strangers','established','history','open'],intensity:['gentle','tangled','devastating']};
 const clone=v=>JSON.parse(JSON.stringify(v));
 function safeUrl(value,image=false){if(typeof value!=='string'||!value.trim())return '';const v=value.trim();if(image&&/^assets\/[a-z0-9/_\-.]+$/i.test(v)&&!v.includes('..'))return v;try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}}
 function spotifyPlaylist(value){
  if(typeof value!=='string'||!value.trim())return null;
  try{const u=new URL(value.trim());const match=u.pathname.match(/^\/(?:intl-[a-z]{2}\/)?(?:embed\/)?playlist\/([a-zA-Z0-9]{22})\/?$/);
   if(u.protocol!=='https:'||u.host!=='open.spotify.com'||u.username||u.password||!match)return null;
   return {url:'https://open.spotify.com/playlist/'+match[1],embedUrl:'https://open.spotify.com/embed/playlist/'+match[1]+'?theme=0'};
  }catch{return null}
 }
 function requestEndpoint(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='formspree.io'&&!u.username&&!u.password&&!u.port&&/^\/f\/[a-zA-Z0-9]+$/.test(u.pathname)&&!u.search&&!u.hash?u.href:''}catch{return ''}}
 function requestMode(home={}){if(home.requestStatus==='paused')return 'paused';if(requestEndpoint(home.requestEndpoint))return 'inline';if(safeUrl(home.requestFormUrl))return 'hosted';return 'unconnected'}
 async function submitRequest(home,payload,send=fetch){
  if(requestMode(home)!=='inline')throw new Error('Inbox unavailable');
  if(!payload.subject||!payload.scene?.trim())throw new Error('Missing scene');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{const response=await send(requestEndpoint(home.requestEndpoint),{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
   if(!response.ok)throw new Error('Delivery not confirmed');const result=await response.json();if(result.errors||result.ok===false)throw new Error('Delivery not confirmed');return true;
  }finally{clearTimeout(timer)}
 }
 const text=(v,n=10000)=>typeof v==='string'&&v.length<=n;
 const optional=(o,k,n=10000)=>o[k]===undefined||text(o[k],n);
 function rows(a,check,max=200){return Array.isArray(a)&&a.length<=max&&a.every(check)}
 function lore(a){return a===undefined||rows(a,x=>x&&text(x.title,100)&&text(x.text)&&typeof x.spoiler==='boolean',40)}
 function website(o){return optional(o,'websiteUrl',2000)&&optional(o,'websiteTitle',100)&&optional(o,'websiteDescription',2000)&&(!o.websiteUrl||!!safeUrl(o.websiteUrl))}
 function valid(v){
  if(!v||!text(v.about)||!text(v.discord,100)||!safeUrl(v.profileUrl))return false;
  for(const key of ['worlds','notes','collections','graveyard']){
   if(v[key]===undefined&&['collections','graveyard'].includes(key))continue;
   const ids=new Set();if(!rows(v[key],o=>{if(!o||!text(o.id,100)||!o.id||!text(o.title,100)||!o.title.trim()||ids.has(o.id))return false;ids.add(o.id);return true}))return false;
  }
  for(const s of v.worlds){if(s.artworkRatio!==undefined&&!ARTWORK_RATIOS.includes(s.artworkRatio))return false;if(s.artworkLayout!==undefined&&!['','poster'].includes(s.artworkLayout))return false;if(!website(s)||!optional(s,'highlight',100)||!optional(s,'chatMilestone',50)||!optional(s,'statsNote',200))return false;if(!text(s.description)||!['original','fandom','fantasy'].includes(s.category)||!optional(s,'subtitle',200)||!optional(s,'playerRole')||!optional(s,'worldId',100)||!optional(s,'coverTitle',100)||!optional(s,'coverNote',300))return false;
   if(s.url&&!safeUrl(s.url)||s.image&&!safeUrl(s.image,true)||s.kind&&!['character','scenario'].includes(s.kind)||s.theme&&!THEMES.includes(s.theme))return false;
   if(s.tags!==undefined&&!rows(s.tags,t=>text(t,100),30)||s.complications!==undefined&&!rows(s.complications,t=>text(t,1000),30))return false;
   if(s.cast!==undefined&&!rows(s.cast,c=>c&&text(c.name,100)&&text(c.role,2000)&&(!c.image||safeUrl(c.image,true)),50))return false;
   if(s.starts!==undefined&&!rows(s.starts,c=>c&&text(c.title,100)&&text(c.text)&&(!c.url||safeUrl(c.url)),30))return false;
   if(!lore(s.lore)||s.moods&&Object.keys(MOODS).some(k=>s.moods[k]&&!MOODS[k].includes(s.moods[k])))return false;
  }
  for(const c of v.collections||[]){if(!website(c))return false;if(!text(c.description)||!optional(c,'subtitle',200)||!optional(c,'atmosphere',1000)||c.image&&!safeUrl(c.image,true)||c.theme&&!THEMES.includes(c.theme)||!lore(c.lore))return false}
  for(const n of v.notes){if(!text(n.description)||!optional(n,'subtitle',200)||!optional(n,'status',100)||!optional(n,'storyId',100)||n.image&&!safeUrl(n.image,true)||n.url&&!safeUrl(n.url))return false}
  for(const g of v.graveyard||[]){if(!text(g.cause,2000)||!text(g.verdict,2000))return false}
  if(v.home){if(!optional(v.home,'requestEndpoint',2000)||!optional(v.home,'requestFormUrl',2000)||v.home.requestEndpoint&&!requestEndpoint(v.home.requestEndpoint)||v.home.requestFormUrl&&!safeUrl(v.home.requestFormUrl)||v.home.requestStatus!==undefined&&!['open','selective','paused'].includes(v.home.requestStatus))return false;if(!optional(v.home,'spotifyTitle',100)||!optional(v.home,'spotifyNote',2000)||!optional(v.home,'spotifyUrl',2000)||v.home.spotifyUrl&&!spotifyPlaylist(v.home.spotifyUrl))return false;if(!optional(v.home,'note',2000)||!optional(v.home,'featuredId',100)||!optional(v.home,'featuredNote',2000)||v.home.cricketMessages!==undefined&&!rows(v.home.cricketMessages,x=>text(x,500),30))return false}
  return true;
 }
 function normalize(value){if(!valid(value))throw new Error('This file is not a valid Junipurrr content backup.');const v=clone(value);v.schemaVersion=2;v.collections||=[];v.graveyard||=[];v.home={requestStatus:'open',requestEndpoint:'',requestFormUrl:'',spotifyUrl:'',spotifyTitle:'The soundtrack',spotifyNote:'A little music for the worlds in my head.',note:'A little lore. A lot of emotional damage.',featuredId:'',featuredNote:'',cricketMessages:['Editor unavailable. Try again after his nap.'],...v.home};v.worlds=v.worlds.map(s=>({kind:'scenario',worldId:'',playerRole:'',cast:[],starts:[],lore:[],complications:[],tags:[],moods:{},...s}));return v}
 function matches(s,{query='',kind='all',category='all',saved=null}={}){const hay=[s.title,s.subtitle,s.description,...s.tags].join(' ').toLowerCase();return (kind==='all'||s.kind===kind)&&(category==='all'||s.category===category||category==='fantasy'&&s.tags.some(t=>t.toLowerCase().includes('fantasy')))&&(!saved||saved.includes(s.id))&&hay.includes(query.trim().toLowerCase())}
 function recommend(stories,choices){const chosen=Object.entries(choices).filter(([k,v])=>MOODS[k]?.includes(v));const ranked=stories.map(s=>{const matched=chosen.filter(([k,v])=>s.moods?.[k]===v).map(([k])=>k);return{story:s,matched,score:matched.length,exact:matched.length===chosen.length}}).filter(r=>!chosen.length||r.score>0).sort((a,b)=>b.score-a.score);const exact=ranked.filter(r=>r.exact);return{results:(exact.length?exact:ranked).slice(0,3),exact:!!exact.length,chosen:chosen.length}}
 return {THEMES,ARTWORK_RATIOS,MOODS,clone,safeUrl,spotifyPlaylist,requestEndpoint,requestMode,submitRequest,valid,normalize,matches,recommend};
});
