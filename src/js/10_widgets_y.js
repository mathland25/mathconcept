/* ===== Ⅴ. 도형의 닮음 — 수행평가 「도형 감정사」 연습용 탐색 위젯 ===== */
const heron = (a, b, c) => { const s = (a + b + c) / 2, v = s * (s - a) * (s - b) * (s - c); return v > 0 ? Math.sqrt(v) : 0; };
const triXY = (ab, bc, ca) => { const x = (ab * ab - ca * ca + bc * bc) / (2 * bc), y = Math.sqrt(Math.max(0, ab * ab - x * x)); return { B: [0, 0], C: [bc, 0], A: [x, y] }; };
const gcd2 = (a, b) => b ? gcd2(b, a % b) : a;

/* 연습 1 · 지붕틀: 세 변의 길이의 비 (SSS 닮음) */
function wSss(use) {
  const S = { de: 8, ef: 12, fd: 14 }, AB = 6, BC = 9, CA = 12;
  const svg = h('s:svg', { viewBox: '0 0 400 260', role: 'img', 'aria-label': '두 지붕틀의 세 변의 길이의 비 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), pre = h('div', { class: 'wtabs' });
  function draw() {
    const { de, ef, fd } = S, ok = de + ef > fd && ef + fd > de && fd + de > ef;
    svg.replaceChildren();
    const T1 = triXY(AB, BC, CA), T2 = ok ? triXY(de, ef, fd) : null;
    const all = [...Object.values(T1), ...(T2 ? Object.values(T2) : [])], maxY = Math.max(...all.map(p => p[1]));
    const w1 = Math.max(...Object.values(T1).map(p => p[0])) - Math.min(...Object.values(T1).map(p => p[0]));
    const w2 = T2 ? Math.max(...Object.values(T2).map(p => p[0])) - Math.min(...Object.values(T2).map(p => p[0])) : 0;
    const sc = Math.min(165 / Math.max(w1, w2, 1), 170 / Math.max(maxY, 1));
    const place = (T, x0) => { const minX = Math.min(...Object.values(T).map(p => p[0])); const f = p => [x0 + (p[0] - minX) * sc, 215 - p[1] * sc]; return { A: f(T.A), B: f(T.B), C: f(T.C) }; };
    let cc = [0, 0];
    const sideLab = (p, q, t) => { const m = mid2(p, q), v = [q[0] - p[0], q[1] - p[1]], L = Math.hypot(...v) || 1; let n = [v[1] / L, -v[0] / L]; if ((m[0] - cc[0]) * n[0] + (m[1] - cc[1]) * n[1] < 0) n = [-n[0], -n[1]]; return label(m[0] + n[0] * 16, m[1] + n[1] * 16 + 4, t, 'svgm'); };
    const P1 = place(T1, 50); cc = [(P1.A[0] + P1.B[0] + P1.C[0]) / 3, (P1.A[1] + P1.B[1] + P1.C[1]) / 3];
    svg.append(poly([P1.A, P1.B, P1.C]), sideLab(P1.A, P1.B, 'AB = ' + AB), sideLab(P1.B, P1.C, 'BC = ' + BC), sideLab(P1.C, P1.A, 'CA = ' + CA), label(P1.A[0], P1.A[1] - 8, 'A'), label(P1.B[0] - 11, P1.B[1] + 6, 'B'), label(P1.C[0] + 11, P1.C[1] + 6, 'C'));
    if (ok) { const P2 = place(T2, 222); cc = [(P2.A[0] + P2.B[0] + P2.C[0]) / 3, (P2.A[1] + P2.B[1] + P2.C[1]) / 3];
      svg.append(poly([P2.A, P2.B, P2.C], { fill: 'var(--red-soft)', stroke: 'var(--red)' }), sideLab(P2.A, P2.B, 'DE = ' + de), sideLab(P2.B, P2.C, 'EF = ' + ef), sideLab(P2.C, P2.A, 'FD = ' + fd), label(P2.A[0], P2.A[1] - 8, 'D'), label(P2.B[0] - 11, P2.B[1] + 6, 'E'), label(P2.C[0] + 11, P2.C[1] + 6, 'F')); }
    else svg.append(label(300, 130, '삼각형이 만들어지지 않아요', 'svgt'));
    const same = de * BC === ef * AB && ef * CA === fd * BC;
    const f2 = v => String(Math.round(v * 100) / 100);
    const items = [['DE ÷ AB = ' + f2(de / AB), de * BC === ef * AB ? 1 : 0], ['EF ÷ BC = ' + f2(ef / BC), 0], ['FD ÷ CA = ' + f2(fd / CA), 0]];
    items[1][1] = de * BC === ef * AB ? 1 : 0; items[2][1] = items[1][1] && ef * CA === fd * BC ? 1 : 0;
    if (ok) { const p1 = AB + BC + CA, p2 = de + ef + fd; items.push(['둘레 ' + p1 + ' : ' + p2 + ' m', 0]); if (same) { const g = gcd2(AB, de); items.push(['둘레의 비 = ' + (AB / g) + ' : ' + (de / g), 1], ['넓이 ' + f2(heron(AB, BC, CA)) + ' : ' + f2(heron(de, ef, fd)) + ' m²', 0], ['넓이의 비 = ' + (AB / g) ** 2 + ' : ' + (de / g) ** 2, 1]); } }
    read.replaceChildren(...items.map(([t, hi]) => h('span', { class: hi ? 'hi' : '', text: t })));
    if (!ok) { verdict.className = 'verdict no'; verdict.textContent = '세 변이 삼각형을 이룰 수 없어요 (가장 긴 변 < 나머지 두 변의 합)'; }
    else if (same) { const g = gcd2(AB, de); verdict.className = 'verdict yes'; verdict.textContent = '세 쌍의 변의 길이의 비가 모두 같아요 → SSS 닮음 (△ABC : △DEF = ' + (AB / g) + ' : ' + (de / g) + ')'; }
    else { verdict.className = 'verdict no'; verdict.textContent = '세 쌍의 변의 길이의 비가 같지 않아요 → 닮음이 아니에요 (SSS 조건을 만족하지 않아요)'; }
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    row('DE', 3, 24, 1, S.de, v => v + ' m', v => { S.de = v; draw(); use(); }); row('EF', 3, 24, 1, S.ef, v => v + ' m', v => { S.ef = v; draw(); use(); }); row('FD', 3, 24, 1, S.fd, v => v + ' m', v => { S.fd = v; draw(); use(); }); }
  const PRE = [['DE=8, EF=12, FD=16', 8, 12, 16], ['DE=8, EF=12, FD=14', 8, 12, 14], ['DE=10, EF=15, FD=20', 10, 15, 20], ['DE=6, EF=9, FD=12', 6, 9, 12]];
  pre.append(...PRE.map(([t, a, b, c]) => h('button', { type: 'button', text: t, onclick: () => { S.de = a; S.ef = b; S.fd = c; paintCtl(); draw(); use(); } })));
  paintCtl(); draw();
  return h('div', { class: 'card widget' }, svg, verdict, ctl, pre, h('p', { class: 'note', text: '△ABC는 그대로 두고 △DEF의 세 변을 바꿔 보세요. 닮음이면 △DEF가 △ABC를 같은 비율로 키우거나 줄인 모양이 돼요.' }), read);
}

/* 연습 2 · 울타리: 삼각형에서 평행선과 선분의 길이의 비 */
function wDe(use) {
  const CFG = { a: { AB: 6, AC: 9, BC: 9, st: 0.5, d: 3, e: 4.5 }, b: { AB: 10, AC: 15, BC: null, st: 1, d: 6, e: 8 } };
  const S = { tab: 'a', a: { d: 3, e: 5 }, b: { d: 6, e: 8 } };
  const svg = h('s:svg', { viewBox: '0 0 400 280', role: 'img', 'aria-label': '삼각형에서 DE와 BC가 평행한지 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div'), pre = h('div', { class: 'wtabs' });
  const lerp2 = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  function draw() {
    const c = CFG[S.tab], { d, e } = S[S.tab], A = [200, 30], B = [45, 240], C = [355, 240], D = lerp2(A, B, d / c.AB), E = lerp2(A, C, e / c.AC);
    const par = Math.abs(d * c.AC - e * c.AB) < 1e-9, DB = c.AB - d, EC = c.AC - e;
    svg.replaceChildren(poly([A, B, C]), seg(D, E, { stroke: par ? 'var(--green)' : 'var(--red)', 'stroke-width': 3 }), dot(D, 4.5, 'var(--red)'), dot(E, 4.5, 'var(--red)'), dot(A), dot(B), dot(C),
      label(A[0], A[1] - 10, 'A'), label(B[0] - 12, B[1] + 6, 'B'), label(C[0] + 12, C[1] + 6, 'C'), label(D[0] - 13, D[1], 'D'), label(E[0] + 13, E[1], 'E'));
    const f = v => r1(Math.round(v * 100) / 100);
    const items = [['AD = ' + f(d) + ' m', 0], ['DB = ' + f(DB) + ' m', 0], ['AE = ' + f(e) + ' m', 0], ['EC = ' + f(EC) + ' m', 0], ['AD ÷ DB = ' + String(Math.round(d / DB * 100) / 100), 1], ['AE ÷ EC = ' + String(Math.round(e / EC * 100) / 100), 1]];
    if (par && c.BC) items.push(['DE = ' + f(c.BC * d / c.AB) + ' m', 1]);
    read.replaceChildren(...items.map(([t, hi]) => h('span', { class: hi ? 'hi' : '', text: t })));
    verdict.className = 'verdict ' + (par ? 'yes' : 'no');
    verdict.textContent = par ? 'AD : DB = AE : EC → DE ∥ BC (평행이 맞아요)' : 'AD : DB ≠ AE : EC → DE와 BC는 평행하지 않아요';
  }
  function paintCtl() { ctl.replaceChildren(); const c = CFG[S.tab], st = S[S.tab], row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    row('AD (AB = ' + c.AB + ' m)', c.st, c.AB - c.st, c.st, st.d, v => r1(v) + ' m', v => { st.d = v; draw(); use(); });
    row('AE (AC = ' + c.AC + ' m)', c.st, c.AC - c.st, c.st, st.e, v => r1(v) + ' m', v => { st.e = v; draw(); use(); }); }
  const PRE = { a: [['AD=4, AE=6 (A 현장)', 4, 6], ['AD=4, AE=5', 4, 5]], b: [['AD=6, AE=9 (B 현장)', 6, 9], ['AD=6, AE=8', 6, 8]] };
  function paintPre() { pre.replaceChildren(...PRE[S.tab].map(([t, d, e]) => h('button', { type: 'button', text: t, onclick: () => { S[S.tab].d = d; S[S.tab].e = e; paintCtl(); draw(); use(); } }))); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['a', 'A 현장 (AB 6, AC 9)'], ['b', 'B 현장 (AB 10, AC 15)']], S.tab, k => { S.tab = k; paintTabs(); paintCtl(); paintPre(); draw(); use(); })); }
  paintTabs(); paintCtl(); paintPre(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, ctl, pre, h('p', { class: 'note', text: 'D, E의 위치를 바꾸면서 AD ÷ DB와 AE ÷ EC의 값이 같아지는 순간을 찾아보세요. 그때 DE는 BC와 평행해요.' }), read);
}

Object.assign(WIDGETS, { sss: wSss, de: wDe, pl_def: u => wPl(u, { a: 'D', b: 'E', c: 'F' }) });

