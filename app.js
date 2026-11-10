/* CD Estrella de Simo: lógica de la web. Los datos están en data.json */
setTimeout(() => { const s = document.querySelector("#splash"); if (s) { s.classList.add("out"); setTimeout(() => s.remove(), 900); } }, 2600);

fetch("data.json").then((r) => r.json()).then(boot).catch(() => {
  document.querySelector("#splash")?.remove();
  document.querySelector("main").innerHTML = '<div class="card p-8 text-center"><p class="font-bold">No se pudo cargar data.json</p><p class="text-sm text-muted mt-2">Si abres index.html con doble clic, el navegador lo bloquea. Súbela a GitHub Pages o Vercel, o ábrela con un servidor local.</p></div>';
});

function boot(D) {
const DATA = D, CAL = D.calendar, CODES = D.codes, ME = D.me, ADDR = D.addresses, CREST = "crest.webp";

/* ========================= LÓGICA ========================= */
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const nice = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\b(Cd|Fc|Ud|Cf)\b/g, (x) => x.toUpperCase()).replace("C.f.", "C.F.").replace(/\bDe\b/g, "de");
const TN = CAL.teams.map(nice);
const fmtDate = (d) => new Date(d + "T12:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
const short = (d) => new Date(d + "T12:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" });

// Todos los partidos con estado calculado
const M = CAL.rows.map(([j, h, a, d, t, v]) => {
  const key = `${j} ${CODES[h]}-${CODES[a]}`, score = DATA.results[key] || null;
  const start = new Date(`${d}T${t}`), pending = !score && start.getTime() + 90 * 60000 < Date.now();
  return { j, h, a, d, t, v, score, start, pending };
});
const mine = M.filter((m) => m.h === ME || m.a === ME);
const rivalOf = (m) => TN[m.h === ME ? m.a : m.h];
const res = (m) => { const [a, b] = m.score, us = m.h === ME ? a : b, th = m.h === ME ? b : a; return { txt: `${a} - ${b}`, r: us > th ? "Victoria" : us < th ? "Derrota" : "Empate" }; };
const mapLink = (m) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CAL.venues[m.v] + ", " + ADDR[m.v] + ", Sevilla")}`;
const place = (m) => `${CAL.venues[m.v].replace("CD. ", "").replace("CESPED", "césped")}`;

const shield = (cls) => `<img src="${CREST}" alt="Escudo del CD Estrella de Simo" class="${cls}">`;
$("#splashShield").innerHTML = shield("w-44 max-w-[55vw]");
$("#logoSm").innerHTML = shield("w-7 h-9 object-contain");
$("#lnkIg").href = DATA.social.instagram; $("#lnkWa").href = DATA.social.whatsapp;

const TABS = [["inicio", "Inicio"], ["plantilla", "Plantilla"], ["calendario", "Partidos"], ["equipaciones", "Equipación"], ["estadisticas", "Clasificación"], ["palmares", "Palmarés"]];
$("#nav").innerHTML = TABS.map(([id, l]) => `<a class="navlink" data-id="${id}" href="#${id}">${l}</a>`).join("");
const head = (t, sub) => `<div class="mb-6"><h2 class="text-3xl font-extrabold">${t}</h2><div class="rule mt-3"></div>${sub ? `<p class="text-muted mt-3 max-w-xl">${sub}</p>` : ""}</div>`;
const vsText = (m) => `${TN[m.h]} vs ${TN[m.a]}`;
const empty = (t, s) => `<div class="card p-8 text-center"><p class="font-bold">${t}</p><p class="text-sm text-muted mt-2">${s}</p></div>`;

function renderHome() {
  const next = mine.find((m) => !m.score && !m.pending);
  const lastPlayed = [...mine].reverse().find((m) => m.score);
  const awaiting = [...mine].reverse().find((m) => m.pending);
  const upcoming = mine.filter((m) => !m.score && !m.pending).slice(1, 4);
  let lastCard = "";
  if (lastPlayed) { const r = res(lastPlayed); lastCard = `<span class="tag">Último resultado</span><p class="text-5xl font-head font-extrabold mt-5">${r.txt}</p><p class="font-semibold mt-2">${r.r} contra ${esc(rivalOf(lastPlayed))}</p><p class="text-sm text-muted mt-1">Jornada ${lastPlayed.j}, ${short(lastPlayed.d)}</p>`; }
  else if (awaiting) lastCard = `<span class="tag">Último partido</span><p class="text-2xl font-head font-extrabold mt-5">Resultado pendiente</p><p class="font-semibold mt-2">Contra ${esc(rivalOf(awaiting))}</p><p class="text-sm text-muted mt-1">Jornada ${awaiting.j}, ${short(awaiting.d)}</p>`;
  else lastCard = `<span class="tag">Último resultado</span><p class="text-2xl font-head font-extrabold mt-5">La temporada empieza</p><p class="text-sm text-muted mt-2">Aquí verás el resultado del último partido.</p>`;
  $("#inicio").innerHTML = `
  <div class="grid md:grid-cols-5 gap-4 mb-10">
    ${next ? `<div class="card p-6 md:col-span-3 flex flex-col justify-between" style="border-left:4px solid var(--red)">
      <div><span class="tag red">Próximo partido, jornada ${next.j}</span>
      <h1 class="text-3xl sm:text-4xl font-extrabold mt-4 leading-tight">${esc(rivalOf(next))}</h1>
      <p class="text-muted mt-2">${next.h === ME ? "Jugamos como locales" : "Jugamos como visitantes"}</p></div>
      <div class="mt-6 text-sm space-y-1"><p><b class="capitalize">${fmtDate(next.d)}</b>, ${next.t}</p><p class="text-muted">${place(next)}. ${ADDR[next.v]}</p></div>
      <div class="mt-5 flex gap-3 items-center"><a href="${mapLink(next)}" target="_blank" rel="noopener" class="btn">Cómo llegar</a><a href="#calendario" class="text-sm font-semibold hover:text-red">Ver calendario</a></div></div>`
      : `<div class="card p-6 md:col-span-3"><h1 class="text-3xl font-extrabold">Temporada completada</h1><p class="text-muted mt-2">No quedan partidos por jugar en este calendario.</p></div>`}
    <div class="card p-6 md:col-span-2">${lastCard}</div>
  </div>
  ${upcoming.length ? head("Después de esto") + `<div class="grid sm:grid-cols-3 gap-4">` + upcoming.map((m) => `<div class="card p-5"><p class="text-xs text-muted">Jornada ${m.j}</p><h3 class="font-bold mt-1">${esc(rivalOf(m))}</h3><p class="text-sm text-muted mt-2 capitalize">${fmtDate(m.d)}, ${m.t}</p></div>`).join("") + `</div>` : ""}`;
}

function renderSquad() {
  const P = [...DATA.players].sort((a, b) => a.number - b.number);
  $("#plantilla").innerHTML = head("Plantilla", "Los que defienden el escudo esta temporada.") + (!P.length ? empty("Plantilla en preparación", "Aquí aparecerán los jugadores con su dorsal, posición y cita.") :
    `<div class="grid grid-cols-2 lg:grid-cols-3 gap-4">` + P.map((p) => `<article class="card overflow-hidden pcard">
      <div class="relative aspect-[4/5] overflow-hidden" style="background:var(--sand)">
        ${p.img ? `<img src="${p.img}" alt="${esc(p.name)}" class="ph w-full h-full object-cover">` : `<svg class="ph w-full h-full" viewBox="0 0 100 125" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><circle cx="50" cy="52" r="17" fill="var(--line)"/><path d="M12 125c0-30 16-47 38-47s38 17 38 47z" fill="var(--line)"/></svg>`}
        ${p.number !== "" && p.number != null ? `<span class="absolute top-3 left-3 font-head font-extrabold text-2xl w-11 h-11 grid place-items-center rounded-full" style="background:var(--card);color:var(--red)">${p.number}</span>` : ""}
      </div>
      <div class="p-4"><h3 class="font-bold leading-tight">${esc(p.name)}</h3>${p.pos ? `<p class="text-sm text-muted">${esc(p.pos)} • <span class="text-red font-semibold">${p.goles || 0} goles</span></p>` : ""}
      ${p.quote ? `<div class="rule my-3" style="width:24px"></div><p class="text-sm italic text-muted">“${esc(p.quote)}”</p>` : ""}</div></article>`).join("") + `</div>`);
}

function renderCalendar() {
  const nextId = mine.findIndex((m) => !m.score && !m.pending);
  $("#calendario").innerHTML = head("Calendario y partidos", DATA.team.group) + `<ol class="relative ml-3 border-l-2 border-line space-y-4">` +
    mine.map((m, i) => { const r = m.score && res(m);
      const tag = m.score ? `<span class="tag">Jugado</span>` : m.pending ? `<span class="tag">Resultado pendiente</span>` : `<span class="tag red">${i === nextId ? "Próximo" : "Por jugar"}</span>`;
      return `<li class="pl-6 relative" ${i === nextId ? 'id="nextm"' : ""}><span class="absolute -left-[9px] top-6 w-4 h-4 rounded-full border-2" style="border-color:var(--red);background:${m.score ? "var(--red)" : "var(--bg)"}"></span>
      <div class="card p-5 flex flex-wrap items-center justify-between gap-3">
        <div><div class="flex items-center gap-2 mb-2">${tag}<span class="text-xs text-muted">Jornada ${m.j}, ${m.h === ME ? "local" : "visitante"}</span></div>
        <h3 class="font-bold">${esc(vsText(m))}</h3>
        <p class="text-sm text-muted mt-1 capitalize">${fmtDate(m.d)}, ${m.t}</p>
        <p class="text-sm text-muted">${place(m)}. <a class="underline hover:text-red" target="_blank" rel="noopener" href="${mapLink(m)}">Cómo llegar</a></p></div>
        ${m.score ? `<div class="text-right"><p class="font-head font-extrabold text-3xl">${r.txt}</p><p class="text-xs text-muted">${r.r}</p></div>` : ""}
      </div></li>`; }).join("") + `</ol>
    <p class="text-sm text-muted mt-6">Jornadas de recuperación: 5 dic, 27 dic, 3 ene y 28 feb. Si se aplaza un partido, se jugará en una de esas fechas.</p>`;
}

function renderKits() {
  const container = document.getElementById("equipaciones");
  if (!container) return;
  
  container.innerHTML = `
    <div class="max-w-xl mx-auto p-4 text-center">
      <h2 class="text-2xl font-bold mb-4 font-head">Equipación Oficial</h2>
      <p class="text-muted mb-6">Los colores con los que salimos al campo.</p>
      <div class="bg-card border border-line rounded-2xl p-6 shadow-sm">
        <img src="equipacion1.jpg" alt="Equipación Triana Simo" class="w-full rounded-xl shadow-md border border-line object-cover">
        <h3 class="font-bold text-lg mt-4">Primera equipación</h3>
        <span class="inline-block bg-red/10 text-red text-xs px-3 py-1 rounded-full font-semibold mt-1">Roja y blanca</span>
        <p class="text-sm text-muted mt-2">Camiseta oficial del equipo.</p>
      </div>
    </div>
  `;
}

function renderStats() {
  const T = CAL.teams.map((n, i) => ({ i, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 }));
  M.forEach((m) => { if (!m.score) return; const [a, b] = m.score, H = T[m.h], A = T[m.a];
    H.pj++; A.pj++; H.gf += a; H.gc += b; A.gf += b; A.gc += a;
    if (a > b) { H.g++; A.p++; } else if (a < b) { A.g++; H.p++; } else { H.e++; A.e++; } });
  T.forEach((t) => { t.pts = t.g * 3 + t.e; t.dg = t.gf - t.gc; });
  T.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || TN[a.i].localeCompare(TN[b.i]));
  $("#estadisticas").innerHTML = head("Clasificación", DATA.team.group + ". Los " + DATA.team.qualify + " primeros se clasifican.") +
  `<div class="card scroll-x"><table class="w-full text-sm min-w-[520px]"><thead class="text-muted"><tr class="border-b border-line"><th>Pos</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr></thead><tbody>` +
  T.map((t, k) => `<tr class="border-b border-line last:border-0" style="${t.i === ME ? "background:var(--sand);font-weight:600;" : ""}${k < DATA.team.qualify ? "box-shadow:inset 3px 0 var(--red)" : ""}"><td>${k + 1}</td><td>${esc(TN[t.i])}</td><td>${t.pj}</td><td>${t.g}</td><td>${t.e}</td><td>${t.p}</td><td>${t.gf}</td><td>${t.gc}</td><td>${t.dg > 0 ? "+" : ""}${t.dg}</td><td class="font-bold">${t.pts}</td></tr>`).join("") +
  `</tbody></table></div><p class="text-sm text-muted mt-4">La marca roja señala los puestos de clasificación. La tabla se recalcula con los resultados del grupo.</p>`;
}

function renderHonours() {
  $("#palmares").innerHTML = head("Palmarés e historia", "Lo que hemos conseguido hasta ahora.") + `<ol class="border-l-2 border-line ml-3 space-y-6">` +
    DATA.honours.map((h) => `<li class="pl-6 relative"><span class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red"></span>
      <p class="text-sm font-semibold text-red">${h.year}</p><h3 class="font-bold text-xl mt-1">${esc(h.title)}</h3><p class="text-muted mt-1 max-w-lg">${esc(h.text)}</p></li>`).join("") + `</ol>`;
}

[renderHome, renderSquad, renderCalendar, renderKits, renderStats, renderHonours].forEach((f) => f());

function route() {
  const id = TABS.some(([t]) => t === location.hash.slice(1)) ? location.hash.slice(1) : "inicio";
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("on", v.id === id));
  document.querySelectorAll(".navlink").forEach((a) => { const on = a.dataset.id === id; a.classList.toggle("on", on); if (on) a.scrollIntoView({ inline: "center", block: "nearest" }); });
  window.scrollTo(0, 0);
  if (id === "calendario" && $("#nextm")) $("#nextm").scrollIntoView({ block: "center" });
}
window.addEventListener("hashchange", route); route();

}
