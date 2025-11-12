// CONFIG
const COLORS = ["#5377d1","#8b5cf6","#a78bfa","#ec4899","#22c55e","#f59e0b","#22d3ee"];
const STORAGE_KEY = "smartstudy:demo:subjects";

// STATE
let state = load();
let selectedColor = COLORS[0];

// INIT
renderSwatches();
renderSubjects();
document.getElementById("subject-form").addEventListener("submit", onAdd);

// HELPERS STORAGE
function load(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }catch{ return []; } }
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

// UI
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

function renderSubjects(){
  const grid = document.getElementById("subjectsGrid");
  grid.innerHTML = "";
  state.forEach(sub=>{
    const tpl = document.getElementById("subjectCardTpl").content.cloneNode(true);
    const card = tpl.querySelector(".subject-card");
    card.dataset.id = sub.id;
    tpl.querySelector(".accent").style.background = sub.color;
    tpl.querySelector(".subject-name").textContent = sub.name;
    tpl.querySelector(".total").textContent = sub.total ?? 10;
    tpl.querySelector(".done").textContent = sub.done ?? 0;
    const pct = Math.min(100, Math.round(((sub.done||0)/(sub.total||10))*100));
    tpl.querySelector(".bar span").style.width = pct + "%";
    if((sub.done||0) >= (sub.total||10)) tpl.querySelector(".done-badge").classList.remove("hidden");

    tpl.querySelector(".trash").onclick = ()=>removeSubject(sub.id);
    tpl.querySelector(".add-progress").onclick = (e)=>{
      const input = card.querySelector("input[type=number]");
      const add = parseInt(input.value||"0",10);
      if(!Number.isFinite(add) || add<=0) return;
      sub.done = (sub.done||0)+add;
      save(); renderSubjects();
    };
    tpl.querySelector(".settings").onclick = ()=>{
      const newTotal = parseInt(prompt("Defina o total de conteúdos-alvo:", sub.total ?? 10),10);
      if(Number.isFinite(newTotal) && newTotal>0){ sub.total = newTotal; save(); renderSubjects(); }
    };
    grid.appendChild(tpl);
  });
}

function onAdd(e){
  e.preventDefault();
  const name = document.getElementById("subjectName").value.trim();
  if(!name) return;
  state.push({ id: crypto.randomUUID(), name, color: selectedColor, total: 10, done: 0 });
  save();
  e.target.reset(); renderSubjects();
}

function removeSubject(id){
  state = state.filter(s=>s.id!==id);
  save(); renderSubjects();
}
