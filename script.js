// Basic client-side logic for DevMind demo
(function(){
  const chatEl = document.getElementById('chat');
  const form = document.getElementById('inputForm');
  const input = document.getElementById('userInput');
  const pwModal = document.getElementById('pwModal');
  const pwInput = document.getElementById('pwInput');
  const pwSet = document.getElementById('pwSet');
  const approveModal = document.getElementById('approveModal');
  const approveDetails = document.getElementById('approveDetails');
  const approveBtn = document.getElementById('approveBtn');
  const denyBtn = document.getElementById('denyBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettings = document.getElementById('closeSettings');
  const saveSettings = document.getElementById('saveSettings');

  // Simple storage helpers
  const store = {
    get(k){ try{return JSON.parse(localStorage.getItem(k))}catch(e){return null} },
    set(k,v){ localStorage.setItem(k,JSON.stringify(v)) }
  };

  // Password gate
  function requireOwner(){
    const pw = store.get('ownerPassword');
    if(!pw){ showModal(pwModal); return false; }
    const signed = store.get('signedIn');
    if(!signed){ showModal(pwModal); return false; }
    return true;
  }

  pwSet.onclick = ()=>{
    const val = pwInput.value.trim();
    if(!val){ alert('Enter a password to continue'); return; }
    store.set('ownerPassword', val);
    store.set('signedIn', true);
    hideModal(pwModal);
    appendSystemMessage('Signed in as owner.');
  };

  // Settings
  settingsBtn.onclick = ()=>{ showModal(settingsModal);
    const cfg = store.get('cfg')||{};
    document.getElementById('baseUrl').value = cfg.baseUrl||'';
    document.getElementById('modelName').value = cfg.model||'';
    document.getElementById('apiKey').value = cfg.apiKey||'';
    document.getElementById('ownerPw').value = '';
  };
  closeSettings.onclick = ()=> hideModal(settingsModal);
  saveSettings.onclick = ()=>{
    const cfg = {
      baseUrl: document.getElementById('baseUrl').value.trim(),
      model: document.getElementById('modelName').value.trim(),
      apiKey: document.getElementById('apiKey').value.trim() || null
    };
    store.set('cfg', cfg);
    const newPw = document.getElementById('ownerPw').value.trim();
    if(newPw) store.set('ownerPassword', newPw);
    hideModal(settingsModal);
    appendSystemMessage('Settings saved locally.');
  };

  function showModal(el){ el.classList.add('show'); }
  function hideModal(el){ el.classList.remove('show'); }

  // Chat helpers
  function appendMessage(text, who='ai'){
    const div = document.createElement('div');
    div.className = 'message '+(who==='user'? 'user':'ai');
    div.textContent = text;
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
  }
  function appendSystemMessage(text){ appendMessage(text,'ai'); }

  // Simple local fallback responder
  function localResponder(userText){
    const t = userText.toLowerCase();
    if(t.includes('scale')||t.includes('load')) return 'To scale: add caching (redis), read replicas, and a queue (rabbit/redis) for background jobs. Start with metrics (cpu, latency).';
    if(t.includes('oops')||t.includes('bug')) return 'Trace the stack, reproduce with a minimal test, add logging, and fix the failing assertion. I can make a step-by-step plan.';
    if(t.includes('hello')||t.includes('hi')) return 'Hello — I am DevMind. How can I help? Provide a short task or say "plan" to get a build pipeline outline.';
    return 'I have no API configured. Provide a BASE_URL+MODEL in Settings to call an external LLM, or ask for a local plan.';
  }

  // Approval flow before model calls
  function requestApproval(details){
    return new Promise((resolve)=>{
      approveDetails.textContent = details;
      showModal(approveModal);
      approveBtn.onclick = ()=>{ hideModal(approveModal); resolve(true); };
      denyBtn.onclick = ()=>{ hideModal(approveModal); resolve(false); };
    });
  }

  async function callModel(messages){
    const cfg = store.get('cfg')||{};
    // Estimate: 1 model call per send
    const estimate = 1;
    const approved = await requestApproval('Estimated model calls: '+estimate+' — Approve to proceed?');
    if(!approved) return 'Owner denied model call.';

    if(!cfg.baseUrl || !cfg.model){
      return localResponder(messages[messages.length-1].content || '');
    }

    // Build request payload for OpenAI-compatible chat completions
    const payload = {
      model: cfg.model,
      messages: messages
    };

    const headers = {'Content-Type':'application/json'};
    if(cfg.apiKey){ headers['Authorization'] = 'Bearer '+cfg.apiKey; }

    try{
      const resp = await fetch(cfg.baseUrl.replace(/\/$/,'') + '/v1/chat/completions', {
        method: 'POST', headers, body: JSON.stringify(payload)
      });
      if(!resp.ok) throw new Error('Model API error: '+resp.status+' '+resp.statusText);
      const data = await resp.json();
      // Try to extract text
      const txt = (data.choices && data.choices[0].message && data.choices[0].message.content) || JSON.stringify(data);
      return txt;
    }catch(err){
      return 'Model call failed: '+err.message;
    }
  }

  // Lessons memory saving (requires owner approval)
  async function saveLesson(lesson){
    const approved = await requestApproval('Save lesson to memory? "'+lesson.slice(0,120)+'"');
    if(!approved) return false;
    const mem = store.get('lessons')||[];
    mem.push({text:lesson,ts:new Date().toISOString()});
    store.set('lessons', mem);
    appendSystemMessage('Lesson saved locally.');
    return true;
  }

  // Wire the form
  form.onsubmit = async (e)=>{
    e.preventDefault();
    if(!requireOwner()) return;
    const text = input.value.trim(); if(!text) return;
    appendMessage(text,'user'); input.value='';

    // Prepare conversation: system prompt + last messages
    const messages = [
      {role:'system', content: SYSTEM_PROMPT},
      {role:'user', content: text}
    ];

    appendSystemMessage('Preparing model call (approval required)...');
    const reply = await callModel(messages);
    appendMessage(reply,'ai');

    // Example: if reply contains 'lesson:' ask to save
    if(reply.toLowerCase().includes('lesson')){
      await saveLesson(reply);
    }
  };

  // On first load, prompt owner if not signed in
  window.addEventListener('load', ()=>{
    const signed = store.get('signedIn');
    if(!signed) showModal(pwModal);
    appendSystemMessage('DevMind ready.');
  });
})();
