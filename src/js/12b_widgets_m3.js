/* ===== 중3 Ⅴ. 통계 — 탐색 위젯 (대푯값 · 이상값 · 산포도 · 산점도 · 상관관계) ===== */
const f2s = v => String(Math.round(v * 100) / 100);
const f1s = v => (Math.round(v * 10) / 10).toFixed(1);
const mean3 = a => a.reduce((s, x) => s + x, 0) / a.length;
const median3 = a => { const b = a.slice().sort((x, y) => x - y), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const modes3 = a => { const c = {}; a.forEach(x => c[x] = (c[x] || 0) + 1); const m = Math.max(...Object.values(c)); return Object.keys(c).filter(k => c[k] === m).map(Number).sort((x, y) => x - y); };
/* 수직선 위의 점 그림(점도표) — vals, 범위 [lo, hi], 표시할 마커 */
function dotStrip(vals, lo, hi, opt = {}) {
  const W = 400, H = 170, L = 24, R = 376, base = 128, sc = v => L + (v - lo) / (hi - lo) * (R - L);
  const svg = h('s:svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opt.aria || '자료의 점 그림' });
  svg.append(h('s:line', { x1: L - 6, y1: base + 10, x2: R + 6, y2: base + 10, stroke: 'var(--ink2)', 'stroke-width': 1.5 }));
  const step = opt.step || (hi - lo > 60 ? 10 : hi - lo > 20 ? 5 : hi - lo > 10 ? 2 : 1);
  for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) svg.append(h('s:line', { x1: sc(t), y1: base + 10, x2: sc(t), y2: base + 15, stroke: 'var(--ink2)' }), label(sc(t), base + 28, String(t), 'svgm'));
  const cnt = {}, hit = opt.hit || [];
  vals.forEach((v, i) => { const k = v; cnt[k] = (cnt[k] || 0) + 1; const x = sc(v), y = base - (cnt[k] - 1) * 15 - 2;
    svg.append(h('s:circle', { cx: x, cy: y, r: 6, fill: hit.includes(v) ? 'var(--red)' : (opt.fill || 'var(--blue)'), 'fill-opacity': .88, stroke: 'var(--paper)', 'stroke-width': 1 })); });
  (opt.lines || []).forEach(([v, name, col, dy]) => { if (v < lo || v > hi) return; const x = sc(v);
    svg.append(h('s:line', { x1: x, y1: 18 + (dy || 0), x2: x, y2: base + 10, stroke: col, 'stroke-width': 2, 'stroke-dasharray': '5 3' }), label(Math.min(Math.max(x, 44), 356), 13 + (dy || 0), name + ' ' + f2s(v), 'svgm'));
    svg.lastChild.setAttribute('style', 'fill:' + col + ';font-weight:700'); });
  return { svg, sc };
}

/* 1. 대푯값 (평균 · 중앙값 · 최빈값) */
function wDp(use) {
  const DS = {
    sleep: { name: '수면 10일', head: '지한이의 10일 동안 수면 시간', u: '시간', v: [8, 7, 6, 5, 8, 9, 8, 7, 6, 7] },
    piano: { name: '피아노 10일', head: '형진이의 10일 동안 피아노 연습 시간', u: '시간', v: [3, 7, 2, 4, 5, 1, 5, 8, 5, 2] },
    odd: { name: '자료 7개', head: '자료가 7개 (홀수)', u: '', v: [3, 5, 5, 8, 10, 11, 12] },
    even: { name: '자료 8개', head: '자료가 8개 (짝수)', u: '', v: [3, 5, 5, 8, 10, 11, 12, 15] },
    two: { name: '최빈값 2개', head: '가장 많이 나온 값이 두 개인 자료', u: '', v: [2, 4, 4, 5, 5, 7, 8] }
  };
  const S = { k: 'sleep', mean: true, med: false, mode: false };
  const tabsBox = h('div'), body = h('div');
  function draw() {
    const D = DS[S.k], v = D.v, n = v.length, sorted = v.slice().sort((a, b) => a - b), m = mean3(v), md = median3(v), mo = modes3(v), sum = v.reduce((a, b) => a + b, 0);
    const lines = []; if (S.mean) lines.push([m, '평균', 'var(--blue)', 0]); if (S.med) lines.push([md, '중앙값', 'var(--gold)', 14]);
    const { svg } = dotStrip(v, Math.min(...v) - 1, Math.max(...v) + 1, { hit: S.mode ? mo : [], lines, aria: D.head + '의 점 그림', step: 1 });
    const mid = n % 2 ? '한가운데 값 ' + sorted[(n - 1) / 2] : '한가운데 두 값 ' + sorted[n / 2 - 1] + ', ' + sorted[n / 2] + '의 평균';
    const btn = (k, t) => h('button', { type: 'button', class: 'btn sm' + (S[k] ? ' primary' : ''), text: t + (S[k] ? ' ✓' : ''), onclick: () => { S[k] = !S[k]; draw(); use(); } });
    body.replaceChildren(h('p', { class: 'note', text: D.head + (D.u ? ' (단위: ' + D.u + ')' : '') + '. 한 칸의 점이 자료 하나예요.' }), svg,
      h('div', { class: 'chips' }, btn('mean', '평균'), btn('med', '중앙값'), btn('mode', '최빈값')),
      h('div', { class: 'chips' }, sorted.map(x => h('span', { text: String(x), style: S.mode && mo.includes(x) ? 'background:var(--red);color:var(--paper);border-color:var(--red)' : '' }))),
      h('div', { class: 'read' },
        h('span', { text: '평균 = ' + sum + ' ÷ ' + n + ' = ' + f2s(m) }), h('span', { text: '중앙값 = ' + (n % 2 ? '홀수 개 → ' : '짝수 개 → ') + mid + ' = ' + f2s(md) }), h('span', { text: '최빈값 = ' + mo.join(', ') + ' (' + sorted.filter(x => x === mo[0]).length + '번)' })),
      h('div', { class: 'verdict yes', text: '평균 ' + f2s(m) + ' · 중앙값 ' + f2s(md) + ' · 최빈값 ' + mo.join('과 ') }));
  }
  function paintTabs() { tabsBox.replaceChildren(tabs(Object.entries(DS).map(([k, d]) => [k, d.name]), S.k, k => { S.k = k; paintTabs(); draw(); use(); })); }
  paintTabs(); draw();
  return h('div', { class: 'card widget' }, tabsBox, body);
}

/* 2. 대푯값 고르기 — 극단적인 값의 영향 */
function wOut(use) {
  const DS = {
    fish: { name: '물고기 몸길이', head: '수족관 물고기 8마리의 몸길이(cm)', base: [49, 52, 47, 49, 51, 45, 52], big: { lo: 45, hi: 130, val: 119 }, lab: '한 마리의 몸길이 (cm)', lo: 40, hi: 135 },
    elec: { name: '전기 사용량', head: '5가구의 12월 전기 사용량(kWh)', base: [124, 153, 172, 189], big: { lo: 100, hi: 560, val: 537 }, lab: '한 가구의 사용량 (kWh)', lo: 100, hi: 560 }
  };
  const S = { k: 'fish', x: { fish: 119, elec: 537 } };
  const tabsBox = h('div'), body = h('div');
  function draw() {
    const D = DS[S.k], x = S.x[S.k], v = D.base.concat([x]), m = mean3(v), md = median3(v);
    const lo = (m2 => m2)(D.lo), hi = D.hi, { svg } = dotStrip(v, lo, hi, { hit: [x], lines: [[m, '평균', 'var(--blue)', 0], [md, '중앙값', 'var(--gold)', 14]], aria: D.head + ' 점 그림', step: S.k === 'fish' ? 10 : 100 });
    const below = t => v.filter(a => a < t).length, above = t => v.filter(a => a > t).length;
    body.replaceChildren(h('p', { class: 'note', text: D.head + '. 빨간 점의 값을 슬라이더로 바꿔 보세요.' }),
      h('div', { class: 'ctl' }, slider(D.lab, D.big.lo, D.big.hi, 1, x, t => String(t), t => { S.x[S.k] = t; draw(); use(); })),
      svg,
      h('div', { class: 'read' }, h('span', { text: '평균 ' + f2s(m) + ' → 평균보다 작은 자료 ' + below(m) + '개, 큰 자료 ' + above(m) + '개' }), h('span', { text: '중앙값 ' + f2s(md) + ' → 작은 자료 ' + below(md) + '개, 큰 자료 ' + above(md) + '개' })),
      h('div', { class: 'verdict ' + (Math.abs(m - md) > (hi - lo) * 0.05 ? '' : 'yes'), text: Math.abs(m - md) > (hi - lo) * 0.05 ? '평균과 중앙값 차이가 커요. 평균이 극단적인 값에 끌려갔어요.' : '평균과 중앙값이 비슷해요.' }));
  }
  function paintTabs() { tabsBox.replaceChildren(tabs(Object.entries(DS).map(([k, d]) => [k, d.name]), S.k, k => { S.k = k; paintTabs(); draw(); use(); })); }
  paintTabs(); draw();
  return h('div', { class: 'card widget' }, tabsBox, body);
}

/* 3. 산포도 — 편차 · 분산 · 표준편차 */
function wSp(use) {
  const DS = {
    c1: { name: '1반 합창', v: [83, 84, 87, 85, 86], lo: 70, hi: 100, head: '합창 대회 1반의 심사 점수(점)' },
    c2: { name: '2반 합창', v: [84, 94, 77, 95, 75], lo: 70, hi: 100, head: '합창 대회 2반의 심사 점수(점)' },
    bb: { name: '야구팀 점수', v: [8, 5, 3, 7, 5, 2], lo: 0, hi: 10, head: '야구팀이 일주일 동안 낸 점수(점)' }
  };
  const S = { k: 'c1', st: 'dev' };
  const tabsBox = h('div'), stepBox = h('div'), body = h('div');
  function draw() {
    const D = DS[S.k], v = D.v, n = v.length, m = mean3(v), dev = v.map(x => x - m), sq = dev.map(d => d * d), vr = sq.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(vr);
    const W = 400, L = 24, R = 376, sc = t => L + (t - D.lo) / (D.hi - D.lo) * (R - L), svg = h('s:svg', { viewBox: '0 0 400 150', role: 'img', 'aria-label': D.head + '와 평균의 거리' });
    svg.append(h('s:line', { x1: L - 6, y1: 100, x2: R + 6, y2: 100, stroke: 'var(--ink2)', 'stroke-width': 1.5 }));
    const stp = D.hi - D.lo > 20 ? 5 : 1; for (let t = D.lo; t <= D.hi; t += stp) svg.append(h('s:line', { x1: sc(t), y1: 100, x2: sc(t), y2: 105, stroke: 'var(--ink2)' }), label(sc(t), 119, String(t), 'svgm'));
    svg.append(h('s:line', { x1: sc(m), y1: 14, x2: sc(m), y2: 100, stroke: 'var(--blue)', 'stroke-width': 2, 'stroke-dasharray': '5 3' }), label(sc(m), 11, '평균 ' + f2s(m), 'svgm'));
    svg.lastChild.setAttribute('style', 'fill:var(--blue);font-weight:700');
    const cnt = {}; v.forEach((x, i) => { cnt[x] = (cnt[x] || 0) + 1; const y = 88 - (cnt[x] - 1) * 14, col = dev[i] >= 0 ? 'var(--gold)' : 'var(--red)';
      if (S.st !== 'dev' || true) svg.append(h('s:line', { x1: sc(m), y1: y - 0.5 + 6 * 0, x2: sc(x), y2: y, stroke: col, 'stroke-width': 2.2, 'stroke-opacity': .55 }));
      svg.append(h('s:circle', { cx: sc(x), cy: y, r: 6, fill: col, stroke: 'var(--paper)', 'stroke-width': 1 })); });
    const row = (t, a, fmt) => h('tr', {}, h('th', { text: t }), a.map(z => h('td', { text: fmt(z) })));
    const tbl = h('div', { class: 'tscroll' }, h('table', { class: 'mx', style: 'min-width:0;font-variant-numeric:tabular-nums;text-align:center' },
      row('변량', v, f2s), row('편차', dev, z => (z > 0 ? '+' : '') + f2s(z)), S.st !== 'dev' ? row('(편차)²', sq, f2s) : null));
    let msg;
    if (S.st === 'dev') msg = '편차 = 변량 − 평균. 편차의 합 = ' + f2s(dev.reduce((a, b) => a + b, 0)) + ' (항상 0이라서 흩어진 정도를 알 수 없어요)';
    else if (S.st === 'sq') msg = '(편차)²의 합 = ' + f2s(sq.reduce((a, b) => a + b, 0)) + '  →  분산 = ' + f2s(sq.reduce((a, b) => a + b, 0)) + ' ÷ ' + n + ' = ' + f2s(vr);
    else msg = '분산 ' + f2s(vr) + ' → 표준편차 = √' + f2s(vr) + ' ≈ ' + f2s(sd) + ' (분산·표준편차가 작을수록 평균 가까이 모여 있어요)';
    body.replaceChildren(h('p', { class: 'note', text: D.head + '. 노란 점은 평균보다 크고, 빨간 점은 평균보다 작아요. 선의 길이가 편차의 크기예요.' }), svg, tbl, h('div', { class: 'verdict yes', text: msg }));
  }
  function paintTabs() { tabsBox.replaceChildren(tabs(Object.entries(DS).map(([k, d]) => [k, d.name]), S.k, k => { S.k = k; paintTabs(); draw(); use(); })); stepBox.replaceChildren(tabs([['dev', '① 편차'], ['sq', '② 편차의 제곱·분산'], ['sd', '③ 표준편차']], S.st, k => { S.st = k; paintTabs(); draw(); use(); })); }
  paintTabs(); draw();
  return h('div', { class: 'card widget' }, tabsBox, stepBox, body);
}

/* 4. 산점도 */
const SC_DS = {
  lat: { name: '위도와 기온', xl: '위도 x (°N)', yl: '12월 최고 기온 y (℃)', xr: [28, 54, 4], yr: [0, 22, 5], pts: [[51, 8.2, '런던'], [37, 4.2, '서울'], [35, 12.3, '도쿄'], [47, 7.3, '시애틀'], [33, 12.2, '애틀랜타'], [40, 10.1, '마드리드'], [30, 20.3, '카이로'], [49, 6.2, '밴쿠버']] },
  eye: { name: '왼쪽·오른쪽 시력', xl: '왼쪽 눈 시력 x', yl: '오른쪽 눈 시력 y', xr: [0, 2.2, 0.5], yr: [0, 2.2, 0.5], pts: [[.9, .8], [1, 1.2], [1.5, 1.5], [.6, .4], [1, 1.5], [.8, .7], [.5, .7], [1.5, 1], [1.2, 1], [.6, .7], [1.5, 2], [.3, .5], [2, 1.5], [1.2, 1.2], [1.5, 1.2], [1.2, 1.5], [.2, .2], [.4, .9], [2, 2], [.3, .2]].map((p, i) => [p[0], p[1], (i + 1) + '번']) },
  car: { name: '차량 수와 속력', xl: '차량의 수 x (대)', yl: '평균 통과 속력 y (km/h)', xr: [28, 56, 4], yr: [20, 60, 10], pts: [[54, 25], [44, 36], [32, 52], [30, 54], [35, 50], [50, 28], [42, 44], [30, 52], [48, 35], [52, 28], [37, 45], [40, 40]].map((p, i) => [p[0], p[1], (i + 1) + '회']) }
};
function lsq(pts) { const n = pts.length, mx = mean3(pts.map(p => p[0])), my = mean3(pts.map(p => p[1])); let sxy = 0, sxx = 0; pts.forEach(p => { sxy += (p[0] - mx) * (p[1] - my); sxx += (p[0] - mx) ** 2; }); const b = sxy / sxx; return { b, a: my - b * mx }; }
function wSc(use) {
  const S = { k: 'lat', n: 8, line: false };
  const tabsBox = h('div'), body = h('div');
  function draw() {
    const D = SC_DS[S.k], n = Math.min(S.n, D.pts.length), W = 400, Ht = 260, L = 46, R = 384, T = 14, B = 218, [x0, x1, xs] = D.xr, [y0, y1, ys] = D.yr;
    const X = v => L + (v - x0) / (x1 - x0) * (R - L), Y = v => B - (v - y0) / (y1 - y0) * (B - T);
    const svg = h('s:svg', { viewBox: '0 0 ' + W + ' ' + Ht, role: 'img', 'aria-label': D.name + ' 산점도' });
    svg.append(h('s:line', { x1: L, y1: B, x2: R, y2: B, stroke: 'var(--ink2)', 'stroke-width': 1.5 }), h('s:line', { x1: L, y1: T, x2: L, y2: B, stroke: 'var(--ink2)', 'stroke-width': 1.5 }));
    for (let t = x0; t <= x1 + 1e-9; t += xs) svg.append(h('s:line', { x1: X(t), y1: T, x2: X(t), y2: B, stroke: 'var(--line)' }), label(X(t), B + 15, f2s(t), 'svgm'));
    for (let t = y0; t <= y1 + 1e-9; t += ys) svg.append(h('s:line', { x1: L, y1: Y(t), x2: R, y2: Y(t), stroke: 'var(--line)' }), label(L - 6, Y(t) + 4, f2s(t), 'svgm', 'end'));
    svg.append(label((L + R) / 2, Ht - 6, D.xl, 'svgm'), h('s:text', { x: 12, y: (T + B) / 2, class: 'svgm', 'text-anchor': 'middle', transform: 'rotate(-90 12 ' + (T + B) / 2 + ')', text: D.yl }));
    if (S.line && n >= 3) { const { a, b } = lsq(D.pts.slice(0, n)); const xa = x0, xb = x1; let ya = a + b * xa, yb = a + b * xb;
      svg.append(h('s:line', { x1: X(xa), y1: Y(Math.max(y0, Math.min(y1, ya))), x2: X(xb), y2: Y(Math.max(y0, Math.min(y1, yb))), stroke: 'var(--gold)', 'stroke-width': 2.5, 'stroke-dasharray': '6 4' })); }
    D.pts.slice(0, n).forEach((p, i) => { const last = i === n - 1; svg.append(h('s:circle', { cx: X(p[0]), cy: Y(p[1]), r: last ? 7 : 5, fill: last ? 'var(--red)' : 'var(--blue)', 'fill-opacity': .9, stroke: 'var(--paper)', 'stroke-width': 1 })); });
    const lp = n ? D.pts[n - 1] : null;
    if (lp) { const lx = X(lp[0]), tx = Math.min(Math.max(lx, 70), 340); svg.append(label(tx, Math.max(Y(lp[1]) - 12, 12), '(' + f2s(lp[0]) + ', ' + f2s(lp[1]) + ')', 'svgt')); svg.lastChild.setAttribute('style', 'fill:var(--red)'); }
    const ctl = h('div', { class: 'ctl' }, slider('찍은 점의 수', 0, D.pts.length, 1, n, t => t + '개', t => { S.n = t; draw(); use(); }));
    body.replaceChildren(h('p', { class: 'note', text: D.xl + '와 ' + D.yl + '를 순서쌍 (x, y)로 하여 점을 찍어요. 슬라이더를 움직이면 점이 하나씩 찍혀요.' }), ctl, svg,
      h('div', { class: 'chips' }, h('button', { type: 'button', class: 'btn sm' + (S.line ? ' primary' : ''), text: '경향선 보기' + (S.line ? ' ✓' : ''), onclick: () => { S.line = !S.line; draw(); use(); } })),
      h('div', { class: 'verdict yes', text: lp ? '마지막으로 찍은 점: ' + (lp[2] ? lp[2] + ' ' : '') + '(' + f2s(lp[0]) + ', ' + f2s(lp[1]) + ')' : '점을 찍어 보세요.' }));
  }
  function paintTabs() { tabsBox.replaceChildren(tabs(Object.entries(SC_DS).map(([k, d]) => [k, d.name]), S.k, k => { S.k = k; S.n = SC_DS[k].pts.length; paintTabs(); draw(); use(); })); }
  paintTabs(); draw();
  return h('div', { class: 'card widget' }, tabsBox, body);
}

/* 5. 상관관계 */
function rng3(seed) { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
function wCr(use) {
  const N = 30, base = (() => { const r = rng3(12345), o = []; for (let i = 0; i < N; i++) { const gx = (i + r()) / N; let u = 0; for (let j = 0; j < 6; j++) u += r(); o.push({ x: gx, g: (u - 3) / 0.7071, u: r() }); } return o; })();
  const S = { dir: 'pos', s: 0.15 };
  const DIRS = { pos: ['양의 상관', '예) 한 학생의 키와 몸무게'], neg: ['음의 상관', '예) 차량의 수와 평균 속력'], none: ['고르게 흩어짐', '예) 국어 점수와 체육 점수'], flat: ['x축에 평행', '예) 학생 번호와 키'] };
  const tabsBox = h('div'), body = h('div');
  function pts() { const cl = v => Math.max(0.02, Math.min(0.98, v)); return base.map(b => { let y; if (S.dir === 'pos') y = b.x + S.s * b.g; else if (S.dir === 'neg') y = 1 - b.x + S.s * b.g; else if (S.dir === 'none') y = b.u; else y = 0.5 + 0.12 * b.g; return [b.x, cl(y)]; }); }
  function pearson(p) { const mx = mean3(p.map(q => q[0])), my = mean3(p.map(q => q[1])); let a = 0, b = 0, c = 0; p.forEach(q => { a += (q[0] - mx) * (q[1] - my); b += (q[0] - mx) ** 2; c += (q[1] - my) ** 2; }); return a / Math.sqrt(b * c); }
  function draw() {
    const p = pts(), r = pearson(p), W = 400, Ht = 250, L = 40, R = 384, T = 12, B = 214, X = v => L + v * (R - L), Y = v => B - v * (B - T);
    const svg = h('s:svg', { viewBox: '0 0 ' + W + ' ' + Ht, role: 'img', 'aria-label': '두 변량의 산점도' });
    svg.append(h('s:line', { x1: L, y1: B, x2: R, y2: B, stroke: 'var(--ink2)', 'stroke-width': 1.5 }), h('s:line', { x1: L, y1: T, x2: L, y2: B, stroke: 'var(--ink2)', 'stroke-width': 1.5 }), label(R, B + 16, 'x', 'svgt', 'end'), label(L - 8, T + 8, 'y', 'svgt', 'end'));
    p.forEach(q => svg.append(h('s:circle', { cx: X(q[0]), cy: Y(q[1]), r: 5, fill: 'var(--blue)', 'fill-opacity': .85, stroke: 'var(--paper)', 'stroke-width': 1 })));
    const a = Math.abs(r); let verdict;
    if (a < 0.3) verdict = '상관관계가 없어요'; else verdict = (a >= 0.8 ? '강한 ' : '약한 ') + (r > 0 ? '양의' : '음의') + ' 상관관계가 있어요';
    const ctl = S.dir === 'pos' || S.dir === 'neg' ? h('div', { class: 'ctl' }, slider('점들이 흩어진 정도', 0.05, 0.6, 0.05, S.s, t => (t <= 0.2 ? '조금' : t <= 0.4 ? '보통' : '많이') + ' (' + f2s(t) + ')', t => { S.s = t; draw(); use(); })) : null;
    body.replaceChildren(h('p', { class: 'note', text: '두 변량 x, y의 산점도예요. ' + DIRS[S.dir][1] }), ...(ctl ? [ctl] : []), svg,
      h('div', { class: 'verdict ' + (a < 0.3 ? '' : 'yes'), text: verdict }),
      h('p', { class: 'note', text: S.dir === 'pos' ? 'x가 커질 때 y도 커지는 경향이에요. 점들이 한 직선 가까이 모일수록 상관관계가 강해요.' : S.dir === 'neg' ? 'x가 커질 때 y는 작아지는 경향이에요. 점들이 한 직선 가까이 모일수록 상관관계가 강해요.' : S.dir === 'none' ? '점들이 각 방향으로 고르게 흩어져 있어요.' : '점들이 x축에 평행한 직선 가까이 있어요. x가 변해도 y는 거의 일정해요.' }));
  }
  function paintTabs() { tabsBox.replaceChildren(tabs(Object.entries(DIRS).map(([k, d]) => [k, d[0]]), S.dir, k => { S.dir = k; paintTabs(); draw(); use(); })); }
  paintTabs(); draw();
  return h('div', { class: 'card widget' }, tabsBox, body);
}
Object.assign(WIDGETS, { dp: wDp, out: wOut, sp: wSp, sc: wSc, cr: wCr });
