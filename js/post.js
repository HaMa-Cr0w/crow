const $ = (s) => document.querySelector(s);
function getTheme(){ return localStorage.getItem("theme") || "auto"; }
function applyTheme(){
  const t=getTheme();
  if(t==="light") document.documentElement.dataset.theme="light";
  else if(t==="dark") document.documentElement.dataset.theme="dark";
  else document.documentElement.removeAttribute("data-theme");
}
function toggleTheme(){
  const current=getTheme();
  const next=current==="auto"?"dark":current==="dark"?"light":"auto";
  localStorage.setItem("theme",next); applyTheme();
}
function safeText(str){ return String(str ?? "").replace(/[<>&\"]/g, c => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;" }[c])); }
function isYouTube(url){ return /youtube\.com|youtu\.be/.test(url || ""); }
function isEmbed(url){ return /\/embed\//.test(url || ""); }
function buildMedia(p){
  const title=safeText(p.title), src=p.src||"", cover=p.cover||p.src||"";
  if(p.type==="image") return `<div class="hero"><img src="${src}" alt="${title}"></div>`;
  if(p.type==="video"){
    if(isYouTube(src)&&isEmbed(src)) return `<div class="hero"><iframe src="${src}" title="${title}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
    return `<div class="hero"><video src="${src}" controls playsinline poster="${cover}"></video></div>`;
  }
  if(cover) return `<div class="hero"><img src="${cover}" alt="${title}"></div>`;
  return "";
}
async function init(){
  applyTheme(); $("#year").textContent=String(new Date().getFullYear());
  $("#themeBtn")?.addEventListener("click", toggleTheme);
  const params=new URLSearchParams(location.search); const id=params.get("id"); const postEl=$("#post");
  if(!id){ postEl.innerHTML=`<h2>پۆست دیاری نەکراوە</h2><p class="muted">ID نییە.</p>`; return; }
  const res=await fetch("data/posts.json",{cache:"no-store"}); const posts=(await res.json())||[];
  const p=posts.find(x=>x.id===id);
  if(!p){ postEl.innerHTML=`<h2>پۆست نەدۆزرایەوە</h2><p class="muted">ID هەڵەیە یان سڕاوەتەوە.</p>`; return; }
  document.title=`Cr0w — ${p.title}`;
  const tags=(p.tags||[]).map(t=>`<span class="tag">#${safeText(t)}</span>`).join("");
  const content=p.type==="news" ? (p.content_html || `<p>${safeText(p.excerpt||"")}</p>`) : `<p>${safeText(p.caption||"")}</p>`;
  postEl.innerHTML=`
    <h2>${safeText(p.title)}</h2>
    <div class="post-meta"><span>📅 ${safeText(p.date)}</span><span class="badge">${p.type==="news"?"📰 هەوال":p.type==="video"?"🎬 ڤیدیۆ":"🖼️ وێنە"}</span></div>
    ${buildMedia(p)}
    <div class="content">${content}</div>
    <div class="tags" style="margin-top:14px">${tags}</div>
  `;
}
init();
