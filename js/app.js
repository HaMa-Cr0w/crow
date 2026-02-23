const $ = (s) => document.querySelector(s);
const grid = $("#grid"), empty = $("#empty"), q = $("#q"), sortSel = $("#sort");
const viewer = $("#viewer"), viewerBody = $("#viewerBody"), closeViewer = $("#closeViewer");
const themeBtn = $("#themeBtn"), tickerTrack = $("#tickerTrack"), typebarText = $("#typebarText");
const featuredTitle = $("#featuredTitle"), featuredDesc = $("#featuredDesc"), featuredDate = $("#featuredDate");
const featuredMedia = $("#featuredMedia"), openFeatured = $("#openFeatured"), openFeaturedPost = $("#openFeaturedPost");
const statPosts = $("#statPosts"), statPhotos = $("#statPhotos"), statVideos = $("#statVideos");
const newsGrid = $("#newsGrid"), loadMoreBtn = $("#loadMore");

let allPosts = [], filter = "all", pageSize = 9, visibleCount = pageSize, featured = null;

function getTheme(){ return localStorage.getItem("theme") || "auto"; }
function applyTheme(){
  const t = getTheme();
  if (t === "light") document.documentElement.dataset.theme = "light";
  else if (t === "dark") document.documentElement.dataset.theme = "dark";
  else document.documentElement.removeAttribute("data-theme");
}
function toggleTheme(){
  const current = getTheme();
  const next = current === "auto" ? "dark" : current === "dark" ? "light" : "auto";
  localStorage.setItem("theme", next); applyTheme();
}
function safeText(str){ return String(str ?? "").replace(/[<>&\"]/g, c => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;" }[c])); }
function typeLabel(type){ return type==="image"?"🖼️ وێنە": type==="video"?"🎬 ڤیدیۆ":"📰 هەوال"; }
function isYouTube(url){ return /youtube\.com|youtu\.be/.test(url || ""); }
function isEmbed(url){ return /\/embed\//.test(url || ""); }

function buildMedia(p, mode="cover"){
  const title = safeText(p.title), src = p.src || "", cover = p.cover || p.src || "";
  if (p.type === "image") return `<img src="${mode==='cover'?cover:src}" alt="${title}">`;
  if (p.type === "video"){
    if (isYouTube(src) && isEmbed(src)) return `<iframe src="${src}" title="${title}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    return mode==="cover" ? `<img src="${cover}" alt="${title}">` : `<video src="${src}" controls playsinline></video>`;
  }
  return cover ? `<img src="${cover}" alt="${title}">` : `<div></div>`;
}

function openViewer(p){
  const title = safeText(p.title), caption = safeText(p.caption || p.excerpt || "");
  viewerBody.innerHTML = `
    <h2 style="margin:0 0 6px">${title}</h2>
    <div class="muted" style="font-size:13px">📅 ${safeText(p.date)} • ${typeLabel(p.type)}</div>
    <p class="muted" style="margin:10px 0 14px">${caption}</p>
    <div class="hero">${buildMedia(p,'full')}</div>
  `;
  viewer.showModal();
}
function closeIt(){ viewer.close(); viewerBody.innerHTML = ""; }

function filtered(){
  const query = (q.value || "").trim().toLowerCase();
  let arr = [...allPosts];
  if (filter !== "all") arr = arr.filter(p => p.type === filter);
  if (query){
    arr = arr.filter(p => ([p.title,p.caption,p.excerpt,...(p.tags||[])].join(" ").toLowerCase()).includes(query));
  }
  const sortMode = sortSel.value;
  arr.sort((a,b)=> sortMode==="new" ? (new Date(b.date)-new Date(a.date)) : (new Date(a.date)-new Date(b.date)));
  return arr;
}

function renderGrid(){
  const posts = filtered();
  const slice = posts.slice(0, visibleCount);
  grid.innerHTML = "";
  empty.classList.toggle("hidden", slice.length !== 0);

  for (const p of slice){
    const cover = p.cover || p.src || "";
    const card = document.createElement("article");
    card.className = "card glass";
    card.tabIndex = 0;

    card.innerHTML = `
      ${cover ? `<img class="thumb" src="${cover}" alt="${safeText(p.title)}">` : `<div class="thumb"></div>`}
      <div class="card-body">
        <div class="meta">
          <span class="badge">${typeLabel(p.type)}</span>
          <span>${safeText(p.date)}</span>
        </div>
        <h3 class="title">${safeText(p.title)}</h3>
        <p class="excerpt">${safeText(p.excerpt || p.caption || "")}</p>
        <div class="tags">${(p.tags||[]).slice(0,4).map(t=>`<span class="tag">#${safeText(t)}</span>`).join("")}</div>
      </div>
    `;

    const open = () => p.type==="news"
      ? (window.location.href = `post.html?id=${encodeURIComponent(p.id)}`)
      : openViewer(p);

    card.addEventListener("click", open);
    card.addEventListener("keydown", (e)=>{ if(e.key==="Enter"||e.key===" ") open(); });
    grid.appendChild(card);
  }
  loadMoreBtn.style.display = posts.length > visibleCount ? "inline-flex" : "none";
}

function renderNews(){
  const news = allPosts.filter(p=>p.type==="news").sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6);
  newsGrid.innerHTML = "";
  for(const n of news){
    const el = document.createElement("article");
    el.className = "news-item glass";
    el.innerHTML = `
      <h3>${safeText(n.title)}</h3>
      <div class="muted">📅 ${safeText(n.date)} • ${(n.tags||[]).slice(0,2).map(t=>`#${safeText(t)}`).join(" ")}</div>
      <p class="muted" style="margin:10px 0 0">${safeText(n.excerpt || "")}</p>
      <div style="margin-top:12px">
        <a class="btn btn-primary" href="post.html?id=${encodeURIComponent(n.id)}">خوێندنەوە</a>
      </div>
    `;
    newsGrid.appendChild(el);
  }
}

function setupTicker(){
  const items = allPosts.filter(p=>p.type==="news").sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8).map(p=>p.title);
  const fallback = ["پەیجی Cr0w ئامادەیە — پۆستە نوێکان زیاد بکە", "وێنە و ڤیدیۆ ڕۆژانە — بە شێوەی مۆدێرن", "Cloudflare Pages — خێرا و خۆڕایی"];
  const list = items.length ? items : fallback;
  const doubled = [...list, ...list];
  tickerTrack.innerHTML = doubled.map(t=>`<span class="ticker-item">${safeText(t)}</span>`).join("");
}

function setupFeatured(){
  featured = allPosts.find(p=>p.featured) || allPosts[0] || null;
  if(!featured) return;
  featuredTitle.textContent = featured.title;
  featuredDesc.textContent = featured.caption || featured.excerpt || "";
  featuredDate.textContent = featured.date;
  featuredMedia.innerHTML = buildMedia(featured, "cover");
  openFeatured.onclick = () => featured.type==="news" ? (window.location.href=`post.html?id=${encodeURIComponent(featured.id)}`) : openViewer(featured);
  openFeaturedPost.href = featured.type==="news" ? `post.html?id=${encodeURIComponent(featured.id)}` : "#latest";
}

function updateStats(){
  statPosts.textContent = String(allPosts.length);
  statPhotos.textContent = String(allPosts.filter(p=>p.type==="image").length);
  statVideos.textContent = String(allPosts.filter(p=>p.type==="video").length);
}

function setupTypebar(){
  const phrases = ["Cr0w • New drops every day","وێنەی ڕۆژانە — دابنێ لە media/","هەواڵەکان — لە posts.json","ڤیدیۆ — mp4 یان YouTube embed"];
  let p=0,i=0,dir=1;
  setInterval(()=>{
    const text = phrases[p]; i += dir; typebarText.textContent = text.slice(0,i);
    if (i >= text.length + 12) dir = -1;
    if (i <= 0){ dir = 1; p = (p+1) % phrases.length; }
  }, 70);
}

async function init(){
  applyTheme(); $("#year").textContent = String(new Date().getFullYear());
  document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active"); filter = btn.dataset.filter; visibleCount = pageSize; renderGrid();
  }));
  q.addEventListener("input", ()=>{ visibleCount = pageSize; renderGrid(); });
  sortSel.addEventListener("change", ()=>{ visibleCount = pageSize; renderGrid(); });
  closeViewer.addEventListener("click", closeIt);
  viewer.addEventListener("click", (e)=>{ const r=viewer.getBoundingClientRect(); const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom; if(!inside) closeIt(); });
  themeBtn?.addEventListener("click", toggleTheme);
  loadMoreBtn.addEventListener("click", ()=>{ visibleCount += pageSize; renderGrid(); });

  const res = await fetch("data/posts.json", { cache: "no-store" });
  allPosts = (await res.json()) || [];
  allPosts = allPosts.filter(p=>p&&p.id&&p.type&&p.title&&p.date).sort((a,b)=>new Date(b.date)-new Date(a.date));

  setupTicker(); setupFeatured(); renderNews(); updateStats(); renderGrid(); setupTypebar();

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
}
init();
