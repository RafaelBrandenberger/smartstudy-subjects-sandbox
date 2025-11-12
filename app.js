// CONFIG
const COLORS = ["#5377d1","#8b5cf6","#a78bfa","#ec4899","#22c55e","#f59e0b","#22d3ee"];
const STORAGE_KEY = "smartstudy:demo:subjects";

// STATE
let state = load();
let selectedColor = COLORS[0];

// INIT
renderSwatches();
renderSubjects();
document.getElementById("subject-form").addEventListener("submit", onAddSubject);

// STORAGE
function load(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }catch{ return []; } }
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

// UI: swatches
function renderSwatches(){
  const box = document.getElementById("colorSwatches");
  box.innerHTML = "";
  COLORS.forEach((c,i)=>{
    const id = "c"+i;
    const input = Object.assign(document.createElement("input"),{type:"radio",name:"color",id,checked:i===0});
    input.addEventListener("change",()=>selectedColor=c);
    const lab = document.createElement("label");
    lab.style.background = c;
    box.append(input, lab);
  });
}

// SUBJECTS RENDER
function renderSubjects(){
  const grid = document.getElementById("subjectsGrid");
  grid.innerHTML = "";
  state.forEach(sub=>{
    const tpl = document.getElementById("subjectCardTpl").content.cloneNode(true);
    const card = tpl.querySelector(".subject-card");
    card.dataset.id = sub.id;

    // header
    tpl.querySelector(".accent").style.background = sub.color;
    tpl.querySelector(".subject-name").textContent = sub.name;

    // counters
    const total = sub.items?.length || 0;
    const done = sub.items?.filter(i=>i.done).length || 0;
    tpl.querySelector(".total").textContent = total;
    tpl.querySelector(".done").textContent = done;

    // progress
    const pct = total === 0 ? 0 : Math.round((done/total)*100);
    tpl.querySelector(".bar span").style.width = pct + "%";
    if(total>0 && done===total) tpl.querySelector(".done-badge").classList.remove("hidden");

    // actions
    tpl.querySelector(".trash").onclick = ()=>removeSubject(sub.id);
    tpl.querySelector(".settings").onclick = ()=>{
      alert("Você pode ajustar metas/descrições aqui futuramente. (Opcional)");
    };

    // add item
    tpl.querySelector(".add-item").onclick = ()=>{
      const input = card.querySelector(".sub-input");
      const title = (input.value||"").trim();
      if(!title) return;
      addItem(sub.id, title);
      input.value = "";
      renderSubjects();
    };

    // list items
    const list = tpl.querySelector(".items");
    (sub.items||[]).forEach(it=>{
      const li = document.createElement("li");
      li.className = "item" + (it.done ? " done" : "");
      li.dataset.itemId = it.id;

      const chk = document.createElement("button");
      chk.className = "icon-btn";
      chk.title = it.done ? "Marcar como não concluído" : "Marcar como concluído";
      chk.textContent = it.done ? "✅" : "☐";
      chk.onclick = ()=>{ toggleItem(sub.id, it.id); renderSubjects(); };

      const span = document.createElement("span");
      span.className = "item-title";
      span.textContent = it.title;

      const del = document.createElement("button");
      del.className = "icon-btn";
      del.title = "Remover";
      del.textContent = "🗑️";
      del.onclick = ()=>{ removeItem(sub.id, it.id); renderSubjects(); };

      li.append(chk, span, del);
      list.appendChild(li);
    });

    grid.appendChild(tpl);
  });
}

// SUBJECTS CRUD
function onAddSubject(e){
  e.preventDefault();
  const name = document.getElementById("subjectName").value.trim();
  if(!name) return;
  state.push({ id: crypto.randomUUID(), name, color: selectedColor, items: [] });
  save();
  e.target.reset();
  renderSubjects();
}

function removeSubject(id){
  state = state.filter(s=>s.id!==id);
  save(); renderSubjects();
}

// ITEMS CRUD
function addItem(subjectId, title){
  const s = state.find(x=>x.id===subjectId);
  if(!s) return;
  s.items = s.items || [];
  s.items.push({ id: crypto.randomUUID(), title, done:false });
  save();
}
function toggleItem(subjectId, itemId){
  const s = state.find(x=>x.id===subjectId);
  if(!s || !s.items) return;
  const it = s.items.find(x=>x.id===itemId);
  if(it){ it.done = !it.done; save(); }
}
function removeItem(subjectId, itemId){
  const s = state.find(x=>x.id===subjectId);
  if(!s || !s.items) return;
  s.items = s.items.filter(x=>x.id!==itemId);
  save();
}
