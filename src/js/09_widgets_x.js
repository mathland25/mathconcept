/* ===== Ⅳ. 도형의 성질 — 새 탐색 위젯 ===== */
const mid2 = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
const foot = (P, A, B) => { const d = [B[0] - A[0], B[1] - A[1]], t = ((P[0] - A[0]) * d[0] + (P[1] - A[1]) * d[1]) / (d[0] * d[0] + d[1] * d[1]); return [A[0] + t * d[0], A[1] + t * d[1]]; };
const circum = (A, B, C) => { const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1])), a2 = A[0] ** 2 + A[1] ** 2, b2 = B[0] ** 2 + B[1] ** 2, c2 = C[0] ** 2 + C[1] ** 2;
  return [(a2 * (B[1] - C[1]) + b2 * (C[1] - A[1]) + c2 * (A[1] - B[1])) / d, (a2 * (C[0] - B[0]) + b2 * (A[0] - C[0]) + c2 * (B[0] - A[0])) / d]; };
const incen = (A, B, C) => { const a = dist(B, C), b = dist(C, A), c = dist(A, B), s = a + b + c; return [(a * A[0] + b * B[0] + c * C[0]) / s, (a * A[1] + b * B[1] + c * C[1]) / s]; };
const rmk = (V, p, q, s = 10) => { const u = [p[0] - V[0], p[1] - V[1]], w = [q[0] - V[0], q[1] - V[1]], lu = Math.hypot(...u) || 1, lw = Math.hypot(...w) || 1, uu = [u[0] / lu * s, u[1] / lu * s], ww = [w[0] / lw * s, w[1] / lw * s];
  return h('s:path', { d: 'M' + (V[0] + uu[0]) + ' ' + (V[1] + uu[1]) + ' l' + ww[0] + ' ' + ww[1] + ' l' + (-uu[0]) + ' ' + (-uu[1]), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.5 }); };
const arcM = (V, p, q, r, col = 'var(--red)') => { const a1 = Math.atan2(p[1] - V[1], p[0] - V[0]); let d = Math.atan2(q[1] - V[1], q[0] - V[0]) - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  const P1 = [V[0] + r * Math.cos(a1), V[1] + r * Math.sin(a1)], P2 = [V[0] + r * Math.cos(a1 + d), V[1] + r * Math.sin(a1 + d)];
  return h('s:path', { d: 'M' + P1[0] + ' ' + P1[1] + ' A' + r + ' ' + r + ' 0 0 ' + (d > 0 ? 1 : 0) + ' ' + P2[0] + ' ' + P2[1], fill: 'none', stroke: col, 'stroke-width': 2 }); };
const vlabel = (p, c, t, d = 15, col) => { const v = [p[0] - c[0], p[1] - c[1]], L = Math.hypot(...v) || 1, n = label(p[0] + v[0] / L * d, p[1] + v[1] / L * d + 5, t, 'svgt'); if (col) n.setAttribute('fill', col); return n; };
const spans = (box, items) => box.replaceChildren(...items.map(([t, hi]) => h('span', { class: hi ? 'hi' : '', text: t })));
const RED = { stroke: 'var(--red)', 'stroke-width': 2.2 }, RDASH = { stroke: 'var(--red)', 'stroke-width': 2, 'stroke-dasharray': '6 4' };

/* ---------- 직각삼각형의 합동 조건 ---------- */
function wRtc(use) {
  const S = { tab: 'hyp', c: 10, a1: 6, a2: 8, t1: 40, t2: 40 };
  const svg = h('s:svg', { viewBox: '0 0 400 250', role: 'img', 'aria-label': '두 직각삼각형의 합동 조건 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div'), U = 15;
  const par = (a, t) => { // 빗변 c, 변 BC(a) 또는 예각 ∠B(t) → [BC, AC]
    if (S.tab === 'rha') { const r = t * Math.PI / 180; return [S.c * Math.cos(r), S.c * Math.sin(r)]; }
    const c = S.tab === 'hyp' ? 10 : S.c; return [a, Math.sqrt(Math.max(0, c * c - a * a))]; };
  function draw() {
    const [a1, b1] = par(S.a1, S.t1), [a2, b2] = par(S.a2, S.t2), y0 = 215;
    const C = [25, y0], B = [25 + a1 * U, y0], A = [25, y0 - b1 * U], F = [375, y0], E = [375 - a2 * U, y0], D = [375, y0 - b2 * U];
    const c1 = Math.hypot(a1, b1), c2 = Math.hypot(a2, b2), same = S.tab === 'rha' ? Math.abs(S.t1 - S.t2) < .01 : Math.abs(a1 - a2) < .03, eqh = Math.abs(c1 - c2) < .03;
    svg.replaceChildren(poly([A, B, C], { fill: same ? 'var(--green-soft)' : 'var(--blue-soft)', 'fill-opacity': .8 }), poly([D, E, F], { fill: same ? 'var(--green-soft)' : 'var(--red-soft)', 'fill-opacity': .8, stroke: same ? 'var(--green)' : 'var(--red)' }),
      rmk(C, B, A), rmk(F, E, D), eqh ? tick(A, B, 3) : null, eqh ? tick(D, E, 3) : null,
      S.tab === 'rha' ? arcM(B, C, A, 24) : null, S.tab === 'rha' ? arcM(E, F, D, 24, same ? 'var(--red)' : 'var(--gold)') : null,
      S.tab === 'rhs' && same ? tick(B, C, 1) : null, S.tab === 'rhs' && same ? tick(E, F, 1) : null,
      vlabel(A, C, 'A'), vlabel(B, C, 'B'), vlabel(C, [200, 120], 'C'), vlabel(D, F, 'D'), vlabel(E, F, 'E'), vlabel(F, [200, 120], 'F'));
    const f = x => r1(Math.round(x * 10) / 10);
    spans(read, [['AB = ' + f(c1) + ' cm', eqh], ['DE = ' + f(c2) + ' cm', eqh], S.tab === 'rha' ? ['∠B = ' + f(S.t1) + '°', 1] : ['BC = ' + f(a1) + ' cm', S.tab === 'rhs'], S.tab === 'rha' ? ['∠E = ' + f(S.t2) + '°', 1] : ['EF = ' + f(a2) + ' cm', S.tab === 'rhs'],
      ['AC = ' + f(b1) + ' cm', 0], ['DF = ' + f(b2) + ' cm', 0]]);
    if (S.tab === 'hyp') { verdict.className = 'verdict' + (same ? ' yes' : ' no'); verdict.textContent = same ? '두 직각삼각형이 같은 모양이 되었어요 (BC도 같아졌어요)' : '빗변이 같아도 BC, AC가 달라서 합동이 아니에요'; }
    else if (S.tab === 'rha') { verdict.className = 'verdict' + (same ? ' yes' : ' no'); verdict.textContent = same ? '빗변과 한 예각이 각각 같아요 → 완전히 겹쳐져요 (RHA 합동)' : '한 예각의 크기가 달라서 합동이 아니에요'; }
    else { verdict.className = 'verdict' + (same ? ' yes' : ' no'); verdict.textContent = same ? '빗변과 다른 한 변이 각각 같아요 → 완전히 겹쳐져요 (RHS 합동)' : '다른 한 변의 길이가 달라서 합동이 아니에요'; }
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    if (S.tab === 'hyp') { row('BC (△ABC)', 3, 9, 0.5, S.a1, v => v + ' cm', v => { S.a1 = v; draw(); use(); }); row('EF (△DEF)', 3, 9, 0.5, S.a2, v => v + ' cm', v => { S.a2 = v; draw(); use(); }); }
    else if (S.tab === 'rha') { row('빗변 (공통)', 6, 10, 1, S.c, v => v + ' cm', v => { S.c = v; draw(); use(); }); row('∠B', 20, 70, 5, S.t1, v => v + '°', v => { S.t1 = v; draw(); use(); }); row('∠E', 20, 70, 5, S.t2, v => v + '°', v => { S.t2 = v; draw(); use(); }); }
    else { row('빗변 (공통)', 6, 10, 1, S.c, v => v + ' cm', v => { S.c = v; S.a1 = Math.min(S.a1, v - 1); S.a2 = Math.min(S.a2, v - 1); paintCtl(); draw(); use(); }); row('BC (△ABC)', 2, S.c - 1, 0.5, S.a1, v => v + ' cm', v => { S.a1 = v; draw(); use(); }); row('EF (△DEF)', 2, S.c - 1, 0.5, S.a2, v => v + ' cm', v => { S.a2 = v; draw(); use(); }); } }
  function paintTabs() { tabsBox.replaceChildren(tabs([['hyp', '빗변만 같을 때'], ['rha', '빗변 + 한 예각'], ['rhs', '빗변 + 다른 한 변']], S.tab, k => { S.tab = k; if (k !== 'hyp') { S.c = Math.max(6, Math.min(10, S.c)); S.a1 = Math.min(S.a1, S.c - 1); S.a2 = Math.min(S.a2, S.c - 1); } paintTabs(); paintCtl(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, ctl, h('p', { class: 'note', text: '∠C = ∠F = 90°인 두 직각삼각형이에요. 슬라이더로 두 삼각형의 조건을 같게 맞춰 보고, 두 삼각형이 완전히 겹쳐지는지(합동인지) 확인해 보세요.' }), read);
}

/* ---------- 삼각형의 외심 ---------- */
function wCc(use) {
  const S = { tab: 'pb', ax: 200, h: 130, t: 60 }, U = 20, B = [70, 180], C = [330, 180];
  const svg = h('s:svg', { viewBox: '0 0 400 340', role: 'img', 'aria-label': '삼각형의 외심 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div'), pre = h('div', { class: 'wtabs' });
  function draw() {
    const A = [S.ax, 180 - S.h], O = circum(A, B, C), R = dist(O, A), cen = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3], f = x => r1(Math.round(x / U * 10) / 10);
    const angs = [angleAt(A, B, C), angleAt(B, A, C), angleAt(C, A, B)], mx = Math.max(...angs);
    const kind = Math.abs(mx - 90) < 0.8 ? 'right' : mx > 90 ? 'obt' : 'acu';
    svg.replaceChildren(poly([A, B, C]));
    const sides = [[B, C, 1], [C, A, 2], [A, B, 3]];
    if (S.tab === 'pb') {
      sides.forEach(([p, q, n]) => { const m = mid2(p, q), d = [q[0] - p[0], q[1] - p[1]], L = Math.hypot(...d), nv = [-d[1] / L, d[0] / L]; svg.append(seg([m[0] - nv[0] * 500, m[1] - nv[1] * 500], [m[0] + nv[0] * 500, m[1] + nv[1] * 500], RDASH), tick(p, m, n), tick(m, q, n), rmk(m, q, [m[0] + nv[0] * 20, m[1] + nv[1] * 20], 8)); });
      [A, B, C].forEach(P => svg.append(seg(O, P, { stroke: 'var(--ink3, var(--ink2))', 'stroke-width': 1, 'stroke-dasharray': '2 3' })));
      const P = [200, 180 - S.t]; svg.append(seg(P, B, { stroke: 'var(--blue)', 'stroke-width': 2 }), seg(P, C, { stroke: 'var(--blue)', 'stroke-width': 2 }), dot(P, 5.5, 'var(--blue)'), label(P[0] + 14, P[1] - 6, 'P'));
      spans(read, [['OA = ' + f(dist(O, A)) + ' cm', 1], ['OB = ' + f(dist(O, B)) + ' cm', 1], ['OC = ' + f(dist(O, C)) + ' cm', 1], ['PB = ' + f(dist(P, B)) + ' cm', 0], ['PC = ' + f(dist(P, C)) + ' cm', 0]]);
      verdict.className = 'verdict yes'; verdict.textContent = '세 수직이등분선이 한 점 O에서 만나요. P는 BC의 수직이등분선 위의 점이에요 (PB = PC)';
    } else if (S.tab === 'circ') {
      svg.append(h('s:circle', { cx: O[0], cy: O[1], r: R, fill: 'none', stroke: 'var(--blue)', 'stroke-width': 2 }), seg(O, A, RED), seg(O, B, RED), seg(O, C, RED));
      spans(read, [['OA = ' + f(dist(O, A)) + ' cm', 1], ['OB = ' + f(dist(O, B)) + ' cm', 1], ['OC = ' + f(dist(O, C)) + ' cm', 1], ['외접원의 반지름 = ' + f(R) + ' cm', 0]]);
      verdict.className = 'verdict yes'; verdict.textContent = '세 꼭짓점을 지나는 원(외접원)의 중심이 외심 O예요. OA = OB = OC가 반지름이에요';
    } else {
      svg.append(h('s:circle', { cx: O[0], cy: O[1], r: R, fill: 'none', stroke: 'var(--line)', 'stroke-width': 1.5 }));
      if (kind === 'right') svg.append(rmk(A, B, C), seg(A, mid2(B, C), { stroke: 'var(--red)', 'stroke-width': 2 }));
      spans(read, [['∠A = ' + r1(angs[0]) + '°', 0], ['∠B = ' + r1(angs[1]) + '°', 0], ['∠C = ' + r1(angs[2]) + '°', 0], [kind === 'right' ? '직각삼각형' : kind === 'obt' ? '둔각삼각형' : '예각삼각형', 1], ['O의 위치: ' + (kind === 'right' ? '빗변 BC 위 (중점)' : kind === 'obt' ? '삼각형의 바깥쪽' : '삼각형의 안쪽'), 1]]);
      verdict.className = 'verdict' + (kind === 'right' ? ' yes' : ''); verdict.textContent = kind === 'right' ? '직각삼각형의 외심은 빗변의 중점이에요 (OA = OB = OC = BC의 절반)' : kind === 'obt' ? '둔각삼각형의 외심은 삼각형 바깥에 있어요' : '예각삼각형의 외심은 삼각형 안쪽에 있어요';
    }
    svg.append(dot(O, 6, 'var(--gold)'), label(O[0] + 14, O[1] + 18, 'O'), dot(A), dot(B), dot(C), vlabel(A, cen, 'A'), vlabel(B, cen, 'B'), vlabel(C, cen, 'C'));
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    row('A 가로', 130, 270, 10, S.ax, v => String(v), v => { S.ax = v; draw(); use(); }); row('A 높이', 50, 160, 10, S.h, v => r1(v / U) + ' cm', v => { S.h = v; draw(); use(); });
    if (S.tab === 'pb') row('점 P의 높이', -50, 130, 10, S.t, v => String(v), v => { S.t = v; draw(); use(); }); }
  function paintPre() { pre.replaceChildren(...(S.tab === 'pos' ? [['예각삼각형', 200, 160], ['직각삼각형', 200, 130], ['둔각삼각형', 200, 60]].map(([t, x, hh]) => h('button', { type: 'button', text: t, onclick: () => { S.ax = x; S.h = hh; paintCtl(); draw(); use(); } })) : [])); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['pb', '수직이등분선'], ['circ', '외접원'], ['pos', '외심의 위치']], S.tab, k => { S.tab = k; paintTabs(); paintCtl(); paintPre(); draw(); use(); })); }
  paintTabs(); paintCtl(); paintPre(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, pre, ctl, h('p', { class: 'note', text: '꼭짓점 A의 위치를 바꿔 삼각형의 모양을 바꿔 보세요. 모양이 바뀌어도 같은 결과가 나오는지 확인해 봐요.' }), read);
}

/* ---------- 삼각형의 내심 ---------- */
const TRIPLES = [[4, 3, 5], [8, 6, 10], [12, 5, 13], [15, 8, 17]]; // [BC, AC, AB]  (∠C = 90°)
function drawRt(svg, T, mode) {
  const [a, b, c] = T, U = 16, C = [55, 250], B = [55 + a * U, 250], A = [55, 250 - b * U], r = (a + b - c) / 2, items = [];
  svg.replaceChildren(poly([A, B, C]), rmk(C, B, A));
  if (mode === 'in') {
    const I = [C[0] + r * U, C[1] - r * U], D = [I[0], C[1]], F = [C[0], I[1]], E = foot(I, A, B);
    svg.append(h('s:circle', { cx: I[0], cy: I[1], r: r * U, fill: 'var(--gold-soft)', 'fill-opacity': .5, stroke: 'var(--blue)', 'stroke-width': 2 }), seg(I, D, RED), seg(I, E, RED), seg(I, F, RED), rmk(D, B, I, 7), rmk(E, A, I, 7), rmk(F, A, I, 7),
      dot(I, 5.5, 'var(--gold)'), label(I[0] + 12, I[1] - 9, 'I'), dot(D, 3.5, 'var(--red)'), dot(E, 3.5, 'var(--red)'), dot(F, 3.5, 'var(--red)'), label(D[0], D[1] + 18, 'D'), label(E[0] + 13, E[1] - 3, 'E'), label(F[0] - 13, F[1] + 4, 'F'));
    items.push(['CD = CF = r = ' + r1(r) + ' cm', 1], ['BD = BE = a − r = ' + r1(a - r) + ' cm', 0], ['AF = AE = b − r = ' + r1(b - r) + ' cm', 0], ['BD + AF = ' + r1(a - r + b - r) + ' cm = AB', 1]);
  } else {
    const M = mid2(A, B);
    svg.append(h('s:circle', { cx: M[0], cy: M[1], r: c * U / 2, fill: 'none', stroke: 'var(--blue)', 'stroke-width': 2 }), seg(M, C, RED), seg(M, A, RED), seg(M, B, RED), dot(M, 6, 'var(--gold)'), label(M[0] + 14, M[1] - 8, 'O'));
    items.push(['OA = ' + r1(c / 2) + ' cm', 1], ['OB = ' + r1(c / 2) + ' cm', 1], ['OC = ' + r1(c / 2) + ' cm', 1], ['AB = ' + c + ' cm', 0]);
  }
  svg.append(dot(A), dot(B), dot(C), label(A[0] - 13, A[1] + 4, 'A'), label(B[0] + 13, B[1] + 5, 'B'), label(C[0] - 13, C[1] + 16, 'C'), label((B[0] + C[0]) / 2, C[1] + 20, 'a = ' + a + ' cm', 'svgm'), label(C[0] - 12, (A[1] + C[1]) / 2, 'b = ' + b, 'svgm', 'end'), label((A[0] + B[0]) / 2 + 24, (A[1] + B[1]) / 2 - 8, 'c = ' + c, 'svgm'));
  return items;
}
function wIc(use) {
  const S = { tab: 'bis', ax: 200, h: 130, t: 60, k: 0 }, U = 20, B = [70, 180], C = [330, 180];
  const svg = h('s:svg', { viewBox: '0 0 400 340', role: 'img', 'aria-label': '삼각형의 내심 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div'), f = x => r1(Math.round(x / U * 10) / 10);
  function draw() {
    if (S.tab === 'rt') {
      const items = drawRt(svg, TRIPLES[S.k], 'in'), [a, b, c] = TRIPLES[S.k];
      spans(read, [['a + b − c = ' + (a + b - c) + ' cm', 1], ['(a + b − c) ÷ 2 = ' + r1((a + b - c) / 2) + ' cm', 1], ['내접원의 반지름 r = ' + r1((a + b - c) / 2) + ' cm', 1], ...items]);
      verdict.className = 'verdict yes'; verdict.textContent = '접선의 길이가 같아서 (a − r) + (b − r) = c 이므로 r = (a + b − c) ÷ 2';
      return;
    }
    const A = [S.ax, 180 - S.h], I = incen(A, B, C), cen = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3], r = dist(I, foot(I, B, C));
    const bis = (V, P, Q) => { const t = dist(V, P) / (dist(V, P) + dist(V, Q)); return [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]; }; // V에서 PQ에 내린 이등분선의 발
    const Da = bis(A, B, C), Db = bis(B, A, C), Dc = bis(C, A, B);
    svg.replaceChildren(poly([A, B, C]));
    if (S.tab === 'bis') {
      svg.append(seg(A, Da, RDASH), seg(B, Db, RDASH), seg(C, Dc, RDASH), arcM(A, B, I, 20), arcM(A, I, C, 20), arcM(B, A, I, 24), arcM(B, I, C, 24), arcM(C, A, I, 28), arcM(C, I, B, 28));
      const P = [B[0] + (Db[0] - B[0]) * S.t / 100, B[1] + (Db[1] - B[1]) * S.t / 100], F1 = foot(P, B, A), F2 = foot(P, B, C);
      svg.append(seg(P, F1, { stroke: 'var(--blue)', 'stroke-width': 2 }), seg(P, F2, { stroke: 'var(--blue)', 'stroke-width': 2 }), rmk(F1, A, P, 7), rmk(F2, C, P, 7), dot(P, 5.5, 'var(--blue)'), label(P[0] + 4, P[1] - 10, 'P'));
      spans(read, [['P에서 BA까지 = ' + f(dist(P, F1)) + ' cm', 1], ['P에서 BC까지 = ' + f(dist(P, F2)) + ' cm', 1], ['∠ABI = ' + r1(angleAt(B, A, I)) + '°', 0], ['∠IBC = ' + r1(angleAt(B, I, C)) + '°', 0]]);
      verdict.className = 'verdict yes'; verdict.textContent = '세 각의 이등분선이 한 점 I에서 만나요. ∠B의 이등분선 위의 점 P에서 두 변까지의 거리는 같아요';
    } else {
      const D = foot(I, B, C), E = foot(I, C, A), F = foot(I, A, B);
      svg.append(h('s:circle', { cx: I[0], cy: I[1], r, fill: 'var(--gold-soft)', 'fill-opacity': .5, stroke: 'var(--blue)', 'stroke-width': 2 }), seg(I, D, RED), seg(I, E, RED), seg(I, F, RED), rmk(D, C, I, 7), rmk(E, A, I, 7), rmk(F, B, I, 7),
        dot(D, 3.5, 'var(--red)'), dot(E, 3.5, 'var(--red)'), dot(F, 3.5, 'var(--red)'), vlabel(D, I, 'D', 14), vlabel(E, I, 'E', 14), vlabel(F, I, 'F', 14));
      spans(read, [['ID = ' + f(dist(I, D)) + ' cm', 1], ['IE = ' + f(dist(I, E)) + ' cm', 1], ['IF = ' + f(dist(I, F)) + ' cm', 1], ['내접원의 반지름 = ' + f(r) + ' cm', 0]]);
      verdict.className = 'verdict yes'; verdict.textContent = '세 변에 접하는 원(내접원)의 중심이 내심 I예요. 내심에서 세 변까지의 거리는 모두 같아요 (반지름)';
    }
    svg.append(dot(I, 6, 'var(--gold)'), label(I[0] + 14, I[1] + 18, 'I'), dot(A), dot(B), dot(C), vlabel(A, cen, 'A'), vlabel(B, cen, 'B'), vlabel(C, cen, 'C'));
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    if (S.tab === 'rt') { row('직각을 낀 두 변', 0, TRIPLES.length - 1, 1, S.k, v => TRIPLES[v][0] + ', ' + TRIPLES[v][1], v => { S.k = v; draw(); use(); }); return; }
    row('A 가로', 130, 270, 10, S.ax, v => String(v), v => { S.ax = v; draw(); use(); }); row('A 높이', 50, 160, 10, S.h, v => r1(v / U) + ' cm', v => { S.h = v; draw(); use(); });
    if (S.tab === 'bis') row('점 P 위치', 10, 100, 5, S.t, v => v + '%', v => { S.t = v; draw(); use(); }); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['bis', '각의 이등분선'], ['inc', '내접원'], ['rt', '직각삼각형']], S.tab, k => { S.tab = k; paintTabs(); paintCtl(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, ctl, h('p', { class: 'note', text: '꼭짓점 A의 위치를 바꿔 삼각형의 모양을 바꿔 보세요. "직각삼각형" 탭에서는 ∠C = 90°인 직각삼각형의 내접원을 살펴봐요.' }), read);
}

/* ---------- 직각삼각형의 외심과 내심 (수행평가 연습용) ---------- */
function wRw(use) {
  const S = { tab: 'out', k: 1 }, svg = h('s:svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': '직각삼각형의 외심과 내심' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict yes' }), ctl = h('div'), tabsBox = h('div');
  function draw() { const items = drawRt(svg, TRIPLES[S.k], S.tab === 'out' ? 'out' : 'in'); spans(read, items);
    verdict.textContent = S.tab === 'out' ? '세 꼭짓점에서 같은 거리에 있는 점은 빗변의 중점이에요 (OA = OB = OC)' : '세 변에서 같은 거리에 있는 점은 내심이에요 (ID = IE = IF = r)'; }
  function paintCtl() { ctl.replaceChildren(h('div', { class: 'ctl' }, slider('직각을 낀 두 변', 0, TRIPLES.length - 1, 1, S.k, v => TRIPLES[v][0] + ', ' + TRIPLES[v][1], v => { S.k = v; draw(); use(); }))); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['out', '세 꼭짓점에서 같은 거리'], ['in', '세 변에서 같은 거리']], S.tab, k => { S.tab = k; paintTabs(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, ctl, read);
}

/* ---------- 이등변삼각형과 중점 ---------- */
function wMd(use) {
  const S = { b: 9, c: 9, m: 5 }, svg = h('s:svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': '이등변삼각형에서 꼭짓점과 밑변 위의 점을 이은 선분' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div');
  function draw() {
    const U = 16, B = [120, 255], C = [280, 255], BC = 10, { b, c, m } = S, x = (c * c - b * b + BC * BC) / (2 * BC), y = Math.sqrt(Math.max(0, c * c - x * x)), A = [B[0] + x * U, B[1] - y * U], M = [B[0] + m * U, B[1]];
    const e = Math.abs(b - c) < 1e-9, mp = Math.abs(m - 5) < 1e-9, aM = angleAt(M, B, A), ok = Math.abs(aM - 90) < .05;
    svg.replaceChildren(poly([A, B, C]), seg(A, M, RED), dot(M, 4.5, 'var(--red)'), label(A[0], A[1] - 10, 'A'), label(B[0] - 12, B[1] + 6, 'B'), label(C[0] + 12, C[1] + 6, 'C'), label(M[0], M[1] + 20, 'M'), dot(A), dot(B), dot(C));
    if (e) svg.append(tick(A, B), tick(A, C)); if (mp) svg.append(tick(B, M, 2), tick(M, C, 2)); if (ok) svg.append(rmk(M, C, A, 9));
    spans(read, [['AB = ' + r1(c), e], ['AC = ' + r1(b), e], ['BM = ' + r1(m), mp], ['CM = ' + r1(BC - m), mp], ['∠AMB = ' + r1(aM) + '°', 1], ['∠AMC = ' + r1(180 - aM) + '°', 1], ['∠BAM = ' + r1(angleAt(A, B, M)) + '°', 0], ['∠MAC = ' + r1(angleAt(A, M, C)) + '°', 0]]);
    verdict.className = 'verdict' + (ok ? ' yes' : ' no');
    verdict.textContent = ok ? 'AM이 BC와 수직이에요 (∠AMB = ∠AMC = 90°)' : e && !mp ? 'AB = AC이지만 M이 중점이 아니라서 수직이 아니에요' : !e && mp ? 'M은 중점이지만 AB ≠ AC라서 수직이 아니에요' : '수직이 아니에요 (∠AMB ≠ 90°)';
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    row('AB', 7, 12, 0.5, S.c, v => r1(v), v => { S.c = v; draw(); use(); }); row('AC', 7, 12, 0.5, S.b, v => r1(v), v => { S.b = v; draw(); use(); }); row('점 M 위치', 1, 9, 0.5, S.m, v => 'BM = ' + r1(v), v => { S.m = v; draw(); use(); }); }
  paintCtl(); draw();
  return h('div', { class: 'card widget' }, svg, verdict, ctl, h('p', { class: 'note', text: '밑변 BC의 길이는 10 cm예요. M이 BC의 한가운데(BM = CM)일 때와 아닐 때, AB = AC일 때와 아닐 때를 비교해 보세요.' }), read);
}

/* ---------- 평행사변형이 되는 조건 ---------- */
function wPcond(use) {
  const S = { tab: 'len', p: 6, q: 4, th: 70, m1: 5, m2: 3, phi: 60, L: 6, sh: 2, mode: 'a', w: 8, hh: 3.5, s: 2 }, U = 20;
  const svg = h('s:svg', { viewBox: '0 0 400 260', role: 'img', 'aria-label': '평행사변형이 되는 조건 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div'), modeBox = h('div', { class: 'wtabs' }), cond = h('p', { class: 'note', style: 'margin:6px 0 0' });
  const TX = { len: '두 쌍의 대변의 길이가 각각 같다', ang: '두 쌍의 대각의 크기가 각각 같다', dia: '두 대각선이 서로 다른 것을 이등분한다', one: '한 쌍의 대변이 평행하고 그 길이가 같다', f1: '한 쌍의 대변이 평행하고, 다른 한 쌍의 대변의 길이가 같다', f2: '두 대각선의 길이가 같다' };
  const rad = d => d * Math.PI / 180;
  function shape() { // ABCD 꼭짓점 (cm 좌표, y는 위쪽이 +)
    const t = S.tab;
    if (t === 'len') { const B = [0, 0], C = [S.q, 0], A = [S.p * Math.cos(rad(S.th)), S.p * Math.sin(rad(S.th))]; return [A, B, C, [A[0] + S.q, A[1]]]; }
    if (t === 'ang') { const B = [0, 0], C = [S.q, 0], A = [S.p * Math.cos(rad(S.th)), S.p * Math.sin(rad(S.th))]; return [A, B, C, [A[0] + S.q, A[1]]]; }
    if (t === 'dia') { const A = [S.m1 * Math.cos(rad(S.phi)), S.m1 * Math.sin(rad(S.phi))]; return [A, [-S.m2, 0], [-A[0], -A[1]], [S.m2, 0]]; }
    if (t === 'one') { const B = [0, 0], C = [S.L, 0], A = [S.sh, S.hh], D = [S.sh + S.L, S.hh]; return [A, B, C, D]; }
    if (t === 'f1') { const B = [0, 0], C = [10, 0]; if (S.mode === 'a') return [[S.s, S.hh], B, C, [10 - S.s, S.hh]]; return [[S.s, S.hh], B, C, [10 + S.s, S.hh]]; }
    const B = [0, 0], C = [S.w, 0]; if (S.mode === 'a') return [[0, S.hh], B, C, [S.w, S.hh]]; return [[S.s, S.hh], B, C, [S.w - S.s, S.hh]];
  }
  function draw() {
    const P = shape();
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), k = Math.min(U, 300 / Math.max(x1 - x0, .1), 180 / Math.max(y1 - y0, .1));
    const Q = P.map(p => [200 + (p[0] - (x0 + x1) / 2) * k, 130 - (p[1] - (y0 + y1) / 2) * k]), [A, B, C, D] = Q, cm = (p, q) => dist(p, q) / k, cr = (u, v) => u[0] * v[1] - u[1] * v[0];
    const par1 = Math.abs(cr([B[0] - A[0], B[1] - A[1]], [C[0] - D[0], C[1] - D[1]])) < 0.05, par2 = Math.abs(cr([D[0] - A[0], D[1] - A[1]], [C[0] - B[0], C[1] - B[1]])) < 0.05;
    const cen = [(A[0] + B[0] + C[0] + D[0]) / 4, (A[1] + B[1] + C[1] + D[1]) / 4], isP = par1 && par2, O = mid2(A, C);
    svg.replaceChildren(poly([A, B, C, D], { fill: isP ? 'var(--green-soft)' : 'var(--red-soft)', 'fill-opacity': .7, stroke: isP ? 'var(--green)' : 'var(--red)' }));
    const t = S.tab, f = x => r1(Math.round(x * 10) / 10);
    if (t === 'len') svg.append(tick(A, B, 1), tick(D, C, 1), tick(A, D, 2), tick(B, C, 2));
    if (t === 'ang') svg.append(arcM(A, D, B, 18), arcM(C, B, D, 18), arcM(B, A, C, 18, 'var(--blue)'), arcM(D, C, A, 18, 'var(--blue)'));
    if (t === 'dia') svg.append(seg(A, C, RED), seg(B, D, RED), tick(A, O, 1), tick(O, C, 1), tick(B, O, 2), tick(O, D, 2), dot(O, 4, 'var(--red)'), label(O[0] + 12, O[1] - 7, 'O'));
    if (t === 'one') svg.append(tick(A, D, 1), tick(B, C, 1));
    if (t === 'f1') svg.append(tick(A, B, 2), tick(D, C, 2));
    if (t === 'f2') svg.append(seg(A, C, RED), seg(B, D, RED), tick(A, C, 3), tick(B, D, 3));
    svg.append(dot(A), dot(B), dot(C), dot(D), vlabel(A, cen, 'A'), vlabel(B, cen, 'B'), vlabel(C, cen, 'C'), vlabel(D, cen, 'D'));
    const an = (V, p, q) => r1(angleAt(V, p, q)) + '°';
    const items = { len: [['AB = ' + f(cm(A, B)), 1], ['CD = ' + f(cm(C, D)), 1], ['AD = ' + f(cm(A, D)), 1], ['BC = ' + f(cm(B, C)), 1]], ang: [['∠A = ' + an(A, B, D), 1], ['∠C = ' + an(C, B, D), 1], ['∠B = ' + an(B, A, C), 1], ['∠D = ' + an(D, A, C), 1]],
      dia: [['AO = ' + f(cm(A, O)), 1], ['CO = ' + f(cm(O, C)), 1], ['BO = ' + f(cm(B, O)), 1], ['DO = ' + f(cm(O, D)), 1]], one: [['AD = ' + f(cm(A, D)), 1], ['BC = ' + f(cm(B, C)), 1], ['AB = ' + f(cm(A, B)), 0], ['CD = ' + f(cm(C, D)), 0]],
      f1: [['AD ∥ BC', 1], ['AB = ' + f(cm(A, B)), 1], ['CD = ' + f(cm(C, D)), 1], ['AD = ' + f(cm(A, D)), 0], ['BC = ' + f(cm(B, C)), 0]], f2: [['AC = ' + f(cm(A, C)), 1], ['BD = ' + f(cm(B, D)), 1], ['AB = ' + f(cm(A, B)), 0], ['CD = ' + f(cm(C, D)), 0]] }[t];
    spans(read, items);
    verdict.className = 'verdict ' + (isP ? 'yes' : 'no');
    verdict.textContent = isP ? '평행사변형이에요 (AB ∥ DC, AD ∥ BC)' : '평행사변형이 아니에요 (' + (!par1 && !par2 ? '두 쌍의 대변이 모두 평행하지 않아요' : '한 쌍의 대변만 평행해요') + ')';
  }
  function paintCtl() { ctl.replaceChildren(); modeBox.replaceChildren(); cond.textContent = '조건: ' + TX[S.tab]; const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a))), t = S.tab, up = () => { draw(); use(); };
    if (t === 'len' || t === 'ang') { row('AB (= CD)', 3, 8, 1, S.p, v => v + ' cm', v => { S.p = v; up(); }); row('BC (= AD)', 3, 8, 1, S.q, v => v + ' cm', v => { S.q = v; up(); }); row('∠B', 40, 140, 5, S.th, v => v + '°', v => { S.th = v; up(); }); }
    if (t === 'dia') { row('AC의 절반', 3, 8, 1, S.m1, v => v + ' cm', v => { S.m1 = v; up(); }); row('BD의 절반', 3, 8, 1, S.m2, v => v + ' cm', v => { S.m2 = v; up(); }); row('두 대각선이 이루는 각', 30, 150, 10, S.phi, v => v + '°', v => { S.phi = v; up(); }); }
    if (t === 'one') { row('AD (= BC)', 4, 9, 1, S.L, v => v + ' cm', v => { S.L = v; up(); }); row('옆으로 밀기', -3, 4, 1, S.sh, v => v + ' cm', v => { S.sh = v; up(); }); row('높이', 2, 6, 1, S.hh, v => v + ' cm', v => { S.hh = v; up(); }); }
    if (t === 'f1') { modeBox.append(...[['a', 'A, D를 안쪽으로 모으기'], ['b', 'A, D를 옆으로 밀기']].map(([k, l]) => h('button', { type: 'button', class: S.mode === k ? 'on' : '', text: l, onclick: () => { S.mode = k; paintCtl(); up(); } }))); row('A, D가 움직인 거리', 1, 4, 1, S.s, v => v + ' cm', v => { S.s = v; up(); }); row('높이', 2, 6, 1, S.hh, v => v + ' cm', v => { S.hh = v; up(); }); }
    if (t === 'f2') { modeBox.append(...[['a', '직사각형 모양'], ['b', 'A, D를 안쪽으로 모으기']].map(([k, l]) => h('button', { type: 'button', class: S.mode === k ? 'on' : '', text: l, onclick: () => { S.mode = k; paintCtl(); up(); } }))); row('가로(BC)', 6, 10, 1, S.w, v => v + ' cm', v => { S.w = v; up(); }); row('높이', 2, 6, 1, S.hh, v => v + ' cm', v => { S.hh = v; up(); }); if (S.mode === 'b') row('A, D가 움직인 거리', 1, 3, 1, S.s, v => v + ' cm', v => { S.s = v; up(); }); } }
  function paintTabs() { tabsBox.replaceChildren(tabs([['len', '대변의 길이'], ['ang', '대각의 크기'], ['dia', '대각선 이등분'], ['one', '한 쌍의 대변'], ['f1', '한 쌍 평행 + 다른 쌍 길이?'], ['f2', '대각선의 길이?']], S.tab, k => { S.tab = k; S.mode = 'a'; S.s = k === 'f1' ? 2 : 1; S.hh = 3; paintTabs(); paintCtl(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, cond, svg, verdict, modeBox, ctl, h('p', { class: 'note', text: '조건을 만족하는 사각형을 여러 모양으로 만들어 보고, 항상 평행사변형이 되는지 확인해 보세요. 조건은 ?가 붙은 탭도 있어요.' }), read);
}

/* ---------- 여러 가지 사각형과 대각선 ---------- */
function wQd(use, names) {
  const NM = { rect: '직사각형', rhomb: '마름모', sq: '정사각형', para: '평행사변형', kite: '연 모양', all: '여러 가지 사각형' };
  const S = { tab: names[0], p: 8, q: 5, al: 70, s: 6, u: 3, m: 4 }, U = 18;
  const svg = h('s:svg', { viewBox: '0 0 400 260', role: 'img', 'aria-label': '여러 가지 사각형과 대각선 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div'), tbl = h('div');
  const rad = d => d * Math.PI / 180;
  function quad() {
    const t = S.tab;
    if (t === 'kite') { const L = 12, u = S.u, m = S.m; return [[0, 0], [u, -m], [L, 0], [u, m]]; } // A, B, C, D (y 위쪽 +)
    let p = S.p, q = S.q, al = S.al; if (t === 'rect') al = 90; if (t === 'rhomb') { p = S.s; q = S.s; } if (t === 'sq') { p = S.s; q = S.s; al = 90; }
    const B = [0, 0], C = [p, 0], A = [q * Math.cos(rad(al)), q * Math.sin(rad(al))]; return [A, B, C, [A[0] + p, A[1]]];
  }
  function draw() {
    const P = quad(), xs = P.map(p => p[0]), ys = P.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), k = Math.min(U, 330 / Math.max(x1 - x0, .1), 190 / Math.max(y1 - y0, .1));
    const Q = P.map(p => [200 + (p[0] - (x0 + x1) / 2) * k, 130 - (p[1] - (y0 + y1) / 2) * k]), [A, B, C, D] = Q, cm = (a, b) => dist(a, b) / k, cen = [(A[0] + B[0] + C[0] + D[0]) / 4, (A[1] + B[1] + C[1] + D[1]) / 4];
    const eq = (a, b) => Math.abs(a - b) < 0.02, I = (() => { const d1 = [C[0] - A[0], C[1] - A[1]], d2 = [D[0] - B[0], D[1] - B[1]], cr = d1[0] * d2[1] - d1[1] * d2[0], t = ((B[0] - A[0]) * d2[1] - (B[1] - A[1]) * d2[0]) / cr; return [A[0] + d1[0] * t, A[1] + d1[1] * t]; })();
    const bis1 = eq(cm(A, I), cm(I, C)), bis2 = eq(cm(B, I), cm(I, D)), isP = bis1 && bis2, ac = cm(A, C), bd = cm(B, D), same = eq(ac, bd), ang = angleAt(I, A, B), perp = Math.abs(ang - 90) < .4;
    const name = isP ? (same && perp ? '정사각형' : same ? '직사각형' : perp ? '마름모' : '평행사변형') : perp && (bis1 || bis2) ? '연 모양 (마름모가 아니에요)' : '일반 사각형';
    svg.replaceChildren(poly([A, B, C, D], { fill: isP ? (name === '평행사변형' ? 'var(--blue-soft)' : 'var(--green-soft)') : 'var(--gold-soft)', 'fill-opacity': .8 }), seg(A, C, RED), seg(B, D, RED), dot(I, 5, 'var(--red)'), label(I[0] + 13, I[1] - 7, 'O'));
    if (bis1) svg.append(tick(A, I, 1), tick(I, C, 1)); if (bis2) svg.append(tick(B, I, 2), tick(I, D, 2)); if (perp) svg.append(rmk(I, A, B, 9)); if (same) svg.append(tick(A, C, 3), tick(B, D, 3));
    if (isP && Math.abs(angleAt(B, A, C) - 90) < .4) svg.append(rmk(B, A, C, 11));
    svg.append(dot(A), dot(B), dot(C), dot(D), vlabel(A, cen, 'A'), vlabel(B, cen, 'B'), vlabel(C, cen, 'C'), vlabel(D, cen, 'D'));
    const f = x => r1(Math.round(x * 10) / 10);
    spans(read, [['AC = ' + f(ac) + ' cm', same], ['BD = ' + f(bd) + ' cm', same], ['∠AOB = ' + r1(ang) + '°', perp], ['서로 이등분: ' + (isP ? 'AC, BD 모두' : bis1 ? 'AC만' : bis2 ? 'BD만' : '둘 다 아님'), isP]]);
    verdict.className = 'verdict' + (name.startsWith('연') || name === '일반 사각형' ? '' : ' yes'); verdict.textContent = '이 사각형은 ' + (name === '마름모' ? '마름모예요' : name.startsWith('연') ? '연 모양이에요 (마름모가 아니에요)' : name === '일반 사각형' ? '일반적인 사각형이에요' : name + '이에요') + '  ·  대각선: ' + [isP ? '서로 이등분' : '', same ? '길이가 같음' : '', perp ? '수직' : ''].filter(Boolean).join(', ');
    if (S.tab === 'all') { const row = (nm, a, b, c, on) => h('tr', { class: on ? 'on' : '' }, h('th', { text: nm }), h('td', { text: a }), h('td', { text: b }), h('td', { text: c }));
      tbl.replaceChildren(h('table', { class: 'qdt' }, h('thead', {}, h('tr', {}, h('th', { text: '사각형' }), h('th', { text: '서로 이등분' }), h('th', { text: '길이가 같다' }), h('th', { text: '수직' }))),
        h('tbody', {}, row('평행사변형', 'O', 'X', 'X', name === '평행사변형'), row('직사각형', 'O', 'O', 'X', name === '직사각형'), row('마름모', 'O', 'X', 'O', name === '마름모'), row('정사각형', 'O', 'O', 'O', name === '정사각형')))); }
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a))), t = S.tab, up = () => { draw(); use(); };
    if (t === 'rect') { row('가로', 4, 12, 1, S.p, v => v + ' cm', v => { S.p = v; up(); }); row('세로', 3, 8, 1, S.q, v => v + ' cm', v => { S.q = v; up(); }); }
    if (t === 'rhomb') { row('한 변', 4, 8, 1, S.s, v => v + ' cm', v => { S.s = v; up(); }); row('∠B', 40, 140, 10, S.al, v => v + '°', v => { S.al = v; up(); }); }
    if (t === 'sq') row('한 변', 3, 8, 1, S.s, v => v + ' cm', v => { S.s = v; up(); });
    if (t === 'para' || t === 'all') { row('BC', 4, 10, 1, S.p, v => v + ' cm', v => { S.p = v; up(); }); row('AB', 4, 10, 1, S.q, v => v + ' cm', v => { S.q = v; up(); }); row('∠B', 40, 140, 10, S.al, v => v + '°', v => { S.al = v; up(); }); }
    if (t === 'kite') { row('O의 위치 (AO)', 3, 9, 1, S.u, v => 'AO = ' + v + ' cm (AC = 12)', v => { S.u = v; up(); }); row('BD의 절반', 2, 6, 1, S.m, v => v + ' cm', v => { S.m = v; up(); }); } }
  function paintTabs() { if (names.length < 2) { tabsBox.replaceChildren(); return; } tabsBox.replaceChildren(tabs(names.map(n => [n, NM[n]]), S.tab, k => { S.tab = k; if (k === 'kite') { S.u = 3; S.m = 4; } if (k === 'all') { S.p = 8; S.q = 5; S.al = 70; } if (k === 'para') { S.p = 8; S.q = 5; S.al = 70; } paintTabs(); paintCtl(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, ctl, tbl, h('p', { class: 'note', text: '슬라이더로 사각형을 바꾸면서 두 대각선 AC, BD가 어떻게 되는지 살펴봐요. 같은 길이는 같은 표시로, 직각은 ㄴ 표시로 나타나요.' }), read);
}

Object.assign(WIDGETS, {
  rtc: wRtc, cc: wCc, ic: wIc, rw: wRw, md: wMd, pcond: wPcond,
  qd_rect: u => wQd(u, ['rect', 'para']), qd_rhomb: u => wQd(u, ['rhomb', 'para', 'kite']), qd_sq: u => wQd(u, ['sq', 'all']), qd_kite: u => wQd(u, ['kite', 'rhomb', 'para'])
});

