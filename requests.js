/* Scene requests are sent only to a configured private inbox. Nothing is stored locally. */
(() => {
 'use strict';
 const C=window.JuniCore,$=s=>document.querySelector(s),form=$('#scene-request-form'),feedback=$('#request-feedback');
 let content,preview=false,sending=false;
 function values(){const raw=Object.fromEntries(new FormData(form));return {subject:raw.subject||'',scene:(raw.scene||'').trim(),mood:raw.mood||'Not specified',detail:(raw.detail||'').trim(),handle:(raw.handle||'').trim(),credit:raw.credit&&raw.handle?.trim()?'Yes':'No',_gotcha:raw._gotcha||''}}
 function requestText(){const v=values();return ['A scene request for Juni ♡','Who: '+(v.subject||'Still deciding'),'Scene: '+v.scene,'Mood: '+v.mood,v.detail?'The part I’m attached to: '+v.detail:'','From: '+(v.handle||'A mysterious influence'),'Public credit: '+v.credit].filter(Boolean).join('\n\n')}
 function state(){const mode=C.requestMode(content.home),paused=mode==='paused',ready=mode==='inline'&&!preview;
  $('#request-availability').textContent=preview?'creator preview · sending disabled':paused?'catching up · requests paused':mode==='unconnected'?'inbox opening soon':content.home.requestStatus==='selective'?'selectively accepting':'open for suggestions';
  $('#request-delivery').textContent=preview?'This is a browser draft. Requests cannot be sent from the creator preview.':paused?'the pile has developed its own weather system. i’m catching up before taking more requests.':mode==='unconnected'?'Cricket is still setting up the inbox. You can write an idea and keep a copy, but requests aren’t being sent yet.':mode==='hosted'?'Leave your idea in the private request form. It opens in a new tab; your request won’t appear on this website.':'Your request goes to Juni’s private inbox through Formspree. Your handle is optional; requests aren’t posted publicly.';
  form.hidden=mode==='hosted'&&!preview;
  const hosted=$('#request-hosted');hosted.hidden=mode!=='hosted'||preview;if(!hosted.hidden)hosted.href=C.safeUrl(content.home.requestFormUrl);else hosted.removeAttribute('href');
  $('#request-send').disabled=!ready||sending;
  $('#request-send').textContent=sending?'placing it gently…':'place this gently on my desk';
  $('#request-send').setAttribute('aria-describedby','request-delivery');
  $('#request-fields').disabled=sending;
 }
 function render(next,isPreview=false){content=next;preview=isPreview;const select=$('#request-subject'),selected=select.value;select.replaceChildren(new Option('choose your next unfortunate attachment',''));
  for(const [name,list] of [['Bots',content.worlds],['Universes',content.collections]]){const group=document.createElement('optgroup');group.label=name;list.forEach(item=>group.append(new Option(item.title,item.title)));select.append(group)}
  select.append(new Option('I haven’t thought that far ahead.','I haven’t thought that far ahead.'));if([...select.options].some(o=>o.value===selected))select.value=selected;state();
 }
 $('#request-cricket').addEventListener('click',()=>{feedback.textContent='Cricket has reviewed your proposal. His only note is “more naps.”';});
 $('#request-copy').addEventListener('click',async()=>{const text=requestText();try{await navigator.clipboard.writeText(text);feedback.textContent='copied ♡ this is your own copy; nothing has been sent to Juni.';$('#request-copy-fallback').hidden=true}catch{$('#request-copy-text').value=text;$('#request-copy-fallback').hidden=false;$('#request-copy-text').focus();$('#request-copy-text').select();feedback.textContent='Select and copy your request below. Nothing has been sent to Juni.'}});
 form.addEventListener('submit',async e=>{e.preventDefault();if(sending)return;if(preview||C.requestMode(content.home)!=='inline'){feedback.textContent='The inbox isn’t accepting requests here yet. Nothing has been sent; you can keep a copy of your idea.';return}const payload=values();if(!payload.scene){$('#request-idea').setCustomValidity('Give me a little scene to work with.');form.reportValidity();return}if(!form.reportValidity())return;
  sending=true;feedback.textContent='one moment. Cricket is supervising.';state();form.setAttribute('aria-busy','true');
  try{await C.submitRequest(content.home,payload);form.reset();feedback.textContent='your idea has joined the pile. Cricket has been informed. he has offered no useful feedback. ♡';$('#request-copy-fallback').hidden=true}
  catch{feedback.textContent='We couldn’t confirm delivery. Your idea is still here—keep a copy, or try again. If you already received confirmation elsewhere, don’t resend.'}
  finally{sending=false;form.removeAttribute('aria-busy');state()}
 });
 $('#request-idea').addEventListener('input',()=>$('#request-idea').setCustomValidity(''));
 window.JuniRequests={render};
})();
