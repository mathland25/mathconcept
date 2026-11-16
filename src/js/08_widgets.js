/* ===== 탐색 위젯 (SVG) ===== */
const NS = 'http://www.w3.org/2000/svg';
function h(tag, a, ...k) {
  const svg = tag.startsWith('s:');
  const el = svg ? document.createElementNS(NS, tag.slice(2)) : document.createElement(tag);
  for (const [key, v] of Object.entries(a || {})) {
    if (v == null || v === false) continue;
    if (key === 'class') el.setAttribute('class', v);
    else if (key === 'text') el.textContent = v;
    else if (key === 'html') el.innerHTML = v;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2), v);
    else el.setAttribute(key, v === true ? '' : v);
  }
  el.append(...k.flat(Infinity).filter(x => x != null && x !== false));
  return el;
}
const deg = r => r * 180 / Math.PI;
const r1 = v => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, '');
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const angleAt = (p, a, b) => { // p에서 a, b가 이루는 각(도)
  const u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]];
  return deg(Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))))));
};
function slider(label, min, max, step, val, fmt, onInput) {
  const out = h('output', { text: fmt(val) });
  const inp = h('input', { type: 'range', min, max, step, value: val, 'aria-label': label });
  inp.addEventListener('input', () => { const v = +inp.value; out.textContent = fmt(v); onInput(v); });
  return [h('span', { text: label }), inp, out];
}
const tabs = (items, cur, onPick) => h('div', { class: 'wtabs', role: 'group' }, items.map(([k, l]) =>
  h('button', { type: 'button', class: k === cur ? 'on' : '', 'aria-pressed': k === cur ? 'true' : 'false', text: l, onclick: () => onPick(k) })));
const label = (x, y, t, cls = 'svgt', anchor) => h('s:text', { x, y, class: cls, 'text-anchor': anchor || 'middle', text: t });
const poly = (pts, attrs) => h('s:polygon', Object.assign({ points: pts.map(p => p.join(',')).join(' '), fill: 'var(--blue-soft)', stroke: 'var(--blue)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, attrs));
const seg = (p, q, attrs) => h('s:line', Object.assign({ x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: 'var(--ink2)', 'stroke-width': 1.8 }, attrs));
const dot = (p, rr = 4.5, fill = 'var(--blue)') => h('s:circle', { cx: p[0], cy: p[1], r: rr, fill });
const tick = (p, q, n = 1) => { // 선분 pq의 같은 길이 표시
  const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], d = [q[0] - p[0], q[1] - p[1]], L = Math.hypot(...d) || 1, nx = -d[1] / L, ny = d[0] / L;
  return h('s:g', {}, Array.from({ length: n }, (_, i) => { const o = (i - (n - 1) / 2) * 5; return seg([m[0] + d[0] / L * o + nx * 6, m[1] + d[1] / L * o + ny * 6], [m[0] + d[0] / L * o - nx * 6, m[1] + d[1] / L * o - ny * 6], { stroke: 'var(--red)', 'stroke-width': 2.5 }); }));
};

/* 1. 이등변삼각형 */
function wIso(use) {
  const S = { b: 9, c: 9, alt: false };
  const svg = h('s:svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': '이등변삼각형 탐색' });
  const read = h('div', { class: 'read' });
  const verdict = h('div', { class: 'verdict' });
  function draw() {
    const U = 16, B = [120, 255], C = [280, 255], BC = 10, { b, c } = S;
    const x = (b * b - c * c + BC * BC) / (2 * BC), y = Math.sqrt(Math.max(0, b * b - x * x));
    const A = [B[0] + x * U, B[1] - y * U];
    const angB = angleAt(B, C, A), angC = angleAt(C, B, A), angA = 180 - angB - angC;
    svg.replaceChildren(poly([A, B, C]), label(A[0], A[1] - 10, 'A'), label(B[0] - 12, B[1] + 6, 'B'), label(C[0] + 12, C[1] + 6, 'C'), dot(A), dot(B), dot(C));
    if (Math.abs(b - c) < 1e-9) svg.append(tick(A, B), tick(A, C));
    const H = [A[0], B[1]];
    if (S.alt) svg.append(seg(A, H, { stroke: 'var(--red)', 'stroke-dasharray': '5 4' }), dot(H, 3.5, 'var(--red)'), label(H[0], H[1] + 18, 'H', 'svgt'));
    const hx = (A[0] - B[0]) / U;
    const items = [['AB = ' + r1(b), 0], ['AC = ' + r1(c), 0], ['∠B = ' + r1(angB) + '°', 1], ['∠C = ' + r1(angC) + '°', 1], ['∠A = ' + r1(angA) + '°', 0]];
    if (S.alt) items.push(['BH = ' + r1(hx), 1], ['CH = ' + r1(BC - hx), 1], ['∠BAH = ' + r1(angleAt(A, B, H)) + '°', 1], ['∠HAC = ' + r1(angleAt(A, H, C)) + '°', 1]);
    read.replaceChildren(...items.map(([t, hi]) => h('span', { class: hi ? 'hi' : '', text: t })));
    const eq = Math.abs(b - c) < 1e-9;
    verdict.className = 'verdict' + (eq ? ' yes' : '');
    verdict.textContent = eq ? 'AB = AC (이등변삼각형)' : 'AB ≠ AC';
  }
  const el = h('div', { class: 'card widget' },
    svg, verdict,
    h('div', {}, h('div', { class: 'ctl' }, slider('AB', 6, 13, 0.5, S.b, v => r1(v), v => { S.b = v; draw(); use(); })),
      h('div', { class: 'ctl' }, slider('AC', 6, 13, 0.5, S.c, v => r1(v), v => { S.c = v; draw(); use(); }))),
    h('div', { class: 'row' }, h('label', {}, h('input', { type: 'checkbox', id: 'iso-alt', onchange: e => { S.alt = e.target.checked; draw(); use(); } }), ' A에서 밑변 BC에 수직선 긋기')),
    read);
  draw();
  return el;
}

/* 2. 평행사변형 */
function wPara(use) {
  const S = { tab: 'side', A: [110, 215], B: [250, 215], D: [165, 105] };
  const svg = h('s:svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': '평행사변형 탐색. 점 A, B, D를 끌어 보세요' });
  const read = h('div', { class: 'read' }), note = h('div', { class: 'note' });
  const tabsBox = h('div'); const U = 16; let drag = null;
  function draw() {
    const { A, B, D } = S, C = [B[0] + D[0] - A[0], B[1] + D[1] - A[1]], O = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2];
    const cross = (B[0] - A[0]) * (D[1] - A[1]) - (B[1] - A[1]) * (D[0] - A[0]);
    svg.replaceChildren();
    const ok = Math.abs(cross) > 900;
    svg.append(poly([A, B, C, D], { fill: ok ? 'var(--blue-soft)' : 'none' }));
    const lab = (p, t, dx, dy) => label(p[0] + dx, p[1] + dy, t);
    svg.append(lab(A, 'A', -12, 4), lab(B, 'B', 12, 4), lab(C, 'C', 12, 4), lab(D, 'D', -12, 4));
    if (S.tab === 'side') svg.append(tick(A, B, 1), tick(D, C, 1), tick(A, D, 2), tick(B, C, 2));
    if (S.tab === 'diag') svg.append(seg(A, C, { stroke: 'var(--red)' }), seg(B, D, { stroke: 'var(--red)' }), dot(O, 4, 'var(--red)'), lab(O, 'O', 4, -9), tick(A, O, 1), tick(O, C, 1), tick(B, O, 2), tick(O, D, 2));
    [['A', A], ['B', B], ['D', D]].forEach(([n, p]) => svg.append(dot(p, 6), h('s:circle', { cx: p[0], cy: p[1], r: 16, fill: 'transparent', style: 'cursor:grab', 'data-p': n })));
    svg.append(dot(C, 5, 'var(--ink2)'));
    const L = (p, q) => dist(p, q) / U;
    let items;
    if (!ok) items = [['꼭짓점을 끌어 사각형을 다시 만들어 보세요', 0]];
    else if (S.tab === 'side') items = [['AB = ' + r1(L(A, B)), 1], ['CD = ' + r1(L(D, C)), 1], ['AD = ' + r1(L(A, D)), 0], ['BC = ' + r1(L(B, C)), 0]];
    else if (S.tab === 'angle') { const a = angleAt(A, B, D), b = angleAt(B, A, C), c = angleAt(C, B, D), d = angleAt(D, A, C); items = [['∠A = ' + r1(a) + '°', 1], ['∠C = ' + r1(c) + '°', 1], ['∠B = ' + r1(b) + '°', 0], ['∠D = ' + r1(d) + '°', 0], ['∠A + ∠B = ' + r1(a + b) + '°', 1]]; }
    else items = [['AO = ' + r1(L(A, O)), 1], ['CO = ' + r1(L(O, C)), 1], ['BO = ' + r1(L(B, O)), 0], ['DO = ' + r1(L(O, D)), 0]];
    read.replaceChildren(...items.map(([t, hi]) => h('span', { class: hi ? 'hi' : '', text: t })));
  }
  const pt = e => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 400, (e.clientY - r.top) / r.height * 300]; };
  svg.addEventListener('pointerdown', e => { const n = e.target.getAttribute && e.target.getAttribute('data-p'); if (!n) return; drag = n; svg.setPointerCapture(e.pointerId); e.preventDefault(); });
  svg.addEventListener('pointermove', e => { if (!drag) return; const p = pt(e), old = S[drag]; S[drag] = [Math.max(24, Math.min(376, p[0])), Math.max(24, Math.min(276, p[1]))];
    const C = [S.B[0] + S.D[0] - S.A[0], S.B[1] + S.D[1] - S.A[1]]; if (C[0] < 20 || C[0] > 380 || C[1] < 20 || C[1] > 280) { S[drag] = old; return; }
    draw(); use(); });
  const end = () => { drag = null; }; svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  function paintTabs() { tabsBox.replaceChildren(tabs([['side', '변'], ['angle', '각'], ['diag', '대각선']], S.tab, k => { S.tab = k; paintTabs(); draw(); use(); })); }
  paintTabs(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, h('p', { class: 'note', text: '파란 점 A, B, D를 손가락으로 끌어 모양을 바꿔 보세요. C는 자동으로 따라와요.' }), read);
}

/* 3. 삼각형의 닮음 조건 */
function wSim(use) {
  const S = { tab: 'sss', sss: [6, 8, 12], sas: [6, 9, 90], aa: [60, 80, 1] };
  const svg = h('s:svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': '삼각형 닮음 조건 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div'), ref = h('div', { class: 'note' });
  const eq = (a, b) => Math.abs(a - b) < 1e-6;
  // 점 계산: 한 변을 밑으로 놓은 삼각형. 꼭짓점 P,Q,R의 좌표(단위) 반환
  const fromSides = (pq, qr, rp) => { // P(0,0), Q(pq,0), R: |PR|=rp, |QR|=qr
    if (pq + qr <= rp || qr + rp <= pq || rp + pq <= qr) return null;
    const x = (rp * rp - qr * qr + pq * pq) / (2 * pq), y = Math.sqrt(Math.max(0, rp * rp - x * x)); return [[0, 0], [pq, 0], [x, y]];
  };
  const fromSAS = (pq, pr, angP) => { const a = angP * Math.PI / 180; return [[0, 0], [pq, 0], [pr * Math.cos(a), pr * Math.sin(a)]]; };
  const fromAng = (angP, angQ, k) => { // PQ = 10k 로 놓고 사인법칙
    const P = angP * Math.PI / 180, Q = angQ * Math.PI / 180, Rr = Math.PI - P - Q, pq = 6 * k, pr = pq * Math.sin(Q) / Math.sin(Rr);
    return [[0, 0], [pq, 0], [pr * Math.cos(P), pr * Math.sin(P)]];
  };
  function drawTri(pts, ox, oy, sc, names, color) {
    const maxY = Math.max(...pts.map(p => p[1]));
    const T = pts.map(p => [ox + p[0] * sc, oy - p[1] * sc + 0 * maxY]);
    const g = h('s:g', {}, poly(T, { fill: color === 'g' ? 'var(--green-soft)' : 'var(--blue-soft)', stroke: color === 'g' ? 'var(--green)' : 'var(--blue)' }), T.map((p, i) => [dot(p, 3.5, color === 'g' ? 'var(--green)' : 'var(--blue)'), label(p[0] + (i === 0 ? -10 : i === 1 ? 10 : 0), p[1] + (i === 2 ? -9 : 15), names[i])]));
    return g;
  }
  function draw() {
    let T1, T2, refText, rows = [], verdictYes = null, vmsg = '';
    if (S.tab === 'sss') {
      T1 = fromSides(4, 5, 6); T2 = fromSides(...S.sss.slice(0, 1), S.sss[1], S.sss[2]);
      refText = '△ABC: AB = 4, BC = 5, AC = 6. △DEF의 세 변을 조절해 보세요.';
      const [de, ef, fd] = S.sss, r = [de / 4, ef / 5, fd / 6];
      rows = [['DE : AB = ' + r1(de) + ' : 4', 1], ['EF : BC = ' + r1(ef) + ' : 5', 1], ['DF : AC = ' + r1(fd) + ' : 6', 1], ['비의 값 ' + r.map(x => r1(Math.round(x * 100) / 100)).join(', '), 0]];
      if (!T2) { vmsg = '이 길이로는 삼각형이 만들어지지 않아요'; verdictYes = null; }
      else if (eq(r[0], r[1]) && eq(r[1], r[2])) { verdictYes = true; vmsg = '세 쌍의 대응변의 비가 같아요 → 닮음 (SSS)'; }
      else { verdictYes = false; vmsg = '세 비가 같지 않아서 닮음이 아니에요'; }
    } else if (S.tab === 'sas') {
      T1 = fromSAS(4, 6, 60); const [de, df, ad] = S.sas; T2 = fromSAS(de, df, ad);
      refText = '△ABC: AB = 4, AC = 6, ∠A = 60°. △DEF의 두 변과 끼인각 ∠D를 조절해 보세요.';
      const r = [de / 4, df / 6];
      rows = [['DE : AB = ' + r1(de) + ' : 4', 1], ['DF : AC = ' + r1(df) + ' : 6', 1], ['∠D = ' + ad + '°', 1], ['∠A = 60°', 0]];
      const sameR = eq(r[0], r[1]), sameA = ad === 60;
      if (sameR && sameA) { verdictYes = true; vmsg = '두 변의 비가 같고 끼인각도 같아요 → 닮음 (SAS)'; }
      else { verdictYes = false; vmsg = sameR ? '두 변의 비는 같지만 끼인각이 달라서 닮음이 아니에요' : sameA ? '끼인각은 같지만 두 변의 비가 달라서 닮음이 아니에요' : '두 변의 비도, 끼인각도 달라서 닮음이 아니에요'; }
    } else {
      T1 = fromAng(50, 60, 1); const [ae, af, k] = S.aa; T2 = fromAng(180 - ae - af, ae, k);
      refText = '△ABC: ∠A = 50°, ∠B = 60°, ∠C = 70°. △DEF의 ∠E, ∠F를 조절해 보세요. (∠D는 자동으로 정해져요)';
      const D = 180 - ae - af, same = [D === 50, ae === 60, af === 70], n = same.filter(Boolean).length;
      rows = [['∠D = ' + D + '°', n && same[0] ? 1 : 0], ['∠E = ' + ae + '°', 1], ['∠F = ' + af + '°', 1], ['같은 대응각 ' + n + '쌍', 0]];
      if (D <= 0) { verdictYes = null; vmsg = '각의 합이 180°를 넘어 삼각형이 안 돼요'; T2 = null; }
      else if (n >= 2) { verdictYes = true; vmsg = '두 쌍의 대응각이 같아요 → 닮음 (AA)'; }
      else { verdictYes = false; vmsg = '같은 대응각이 ' + n + '쌍뿐이라 닮음이라고 할 수 없어요'; }
    }
    // 공통 축척
    const bb = p => p ? [Math.max(...p.map(q => q[0])) - Math.min(...p.map(q => q[0])), Math.max(...p.map(q => q[1]))] : [0, 0];
    const b1 = bb(T1), b2 = bb(T2);
    const sc = Math.min(165 / Math.max(b1[0], b2[0], 1), 120 / Math.max(b1[1], b2[1], 1));
    svg.replaceChildren(drawTri(T1, 20 + 0 - Math.min(...T1.map(q => q[0])) * sc, 150, sc, ['A', 'B', 'C'], 'b'));
    if (T2) svg.append(drawTri(T2, 215 - Math.min(...T2.map(q => q[0])) * sc, 150, sc, ['D', 'E', 'F'], 'g'));
    svg.append(label(100, 20, '기준 △ABC', 'svgm'), label(300, 20, '조절하는 △DEF', 'svgm'));
    ref.textContent = refText;
    read.replaceChildren(...rows.map(([t, hi]) => h('span', { class: hi ? 'hi' : '', text: t })));
    verdict.className = 'verdict' + (verdictYes === true ? ' yes' : verdictYes === false ? ' no' : ''); verdict.textContent = vmsg;
  }
  function paintCtl() {
    ctl.replaceChildren();
    const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    if (S.tab === 'sss') { ['DE', 'EF', 'DF'].forEach((n, i) => row(n, 1, 18, 1, S.sss[i], v => String(v), v => { S.sss[i] = v; draw(); use(); })); }
    else if (S.tab === 'sas') { row('DE', 1, 18, 1, S.sas[0], v => String(v), v => { S.sas[0] = v; draw(); use(); }); row('DF', 1, 18, 1, S.sas[1], v => String(v), v => { S.sas[1] = v; draw(); use(); }); row('∠D', 30, 120, 5, S.sas[2], v => v + '°', v => { S.sas[2] = v; draw(); use(); }); }
    else { row('∠E', 30, 100, 5, S.aa[0], v => v + '°', v => { S.aa[0] = v; draw(); use(); }); row('∠F', 30, 100, 5, S.aa[1], v => v + '°', v => { S.aa[1] = v; draw(); use(); }); row('크기', 0.5, 3, 0.5, S.aa[2], v => '×' + v, v => { S.aa[2] = v; draw(); use(); }); }
  }
  function paintTabs() { tabsBox.replaceChildren(tabs([['sss', 'SSS'], ['sas', 'SAS'], ['aa', 'AA']], S.tab, k => { S.tab = k; paintTabs(); paintCtl(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, ref, svg, verdict, ctl, read);
}

/* 4. 경우의 수 */
function wCount(use) {
  const S = { tab: 'ev', a: 3, b: 4, n: 3, m: 2, subj: 'dice', ev: 0 };
  const EV = {
    dice: { head: '주사위 한 개를 한 번 던진다', all: ['1', '2', '3', '4', '5', '6'], list: [['짝수의 눈이 나온다', ['2', '4', '6']], ['5 이상의 눈이 나온다', ['5', '6']], ['3의 배수의 눈이 나온다', ['3', '6']], ['소수의 눈이 나온다', ['2', '3', '5']]] },
    coin: { head: '동전 2개(앞·뒤)를 동시에 던진다', all: ['(앞, 앞)', '(앞, 뒤)', '(뒤, 앞)', '(뒤, 뒤)'], list: [['서로 다른 면이 나온다', ['(앞, 뒤)', '(뒤, 앞)']], ['두 개 모두 앞면이 나온다', ['(앞, 앞)']], ['적어도 한 개는 뒷면이 나온다', ['(앞, 뒤)', '(뒤, 앞)', '(뒤, 뒤)']]] }
  };
  const body = h('div'), tabsBox = h('div');
  function draw() {
    body.replaceChildren();
    if (S.tab === 'ev') {
      const E = EV[S.subj], cur = E.list[Math.min(S.ev, E.list.length - 1)];
      body.append(h('div', { class: 'wtabs', role: 'group' }, [['dice', '주사위 1개'], ['coin', '동전 2개']].map(([k, l]) => h('button', { type: 'button', class: S.subj === k ? 'on' : '', text: l, onclick: () => { S.subj = k; S.ev = 0; draw(); use(); } }))),
        h('p', { class: 'note', text: '실험(관찰): ' + E.head + '.' }),
        h('p', { class: 'note', text: '아래에서 사건을 눌러 보세요. 그 사건이 일어나는 "경우"에 색이 칠해져요.' }),
        h('div', { class: 'chips' }, E.list.map(([t], i) => h('button', { type: 'button', class: 'btn sm' + (i === S.ev ? ' primary' : ''), text: t, onclick: () => { S.ev = i; draw(); use(); } }))),
        h('div', { class: 'chips gold' }, E.all.map(c => h('span', { class: cur[1].includes(c) ? 'hit' : '', style: cur[1].includes(c) ? 'background:var(--blue);color:var(--paper);border-color:var(--blue);font-weight:700' : '', text: c }))),
        h('div', { class: 'verdict yes', text: '사건: "' + cur[0] + '" → 경우: ' + cur[1].join(', ') + ' → 경우의 수 = ' + cur[1].length + '가지' }));
    } else if (S.tab === 'sum') {
      body.append(h('p', { class: 'note', text: '푸드코트 차림표에서 한식 또는 중식 중 한 가지를 주문해요.' }),
        h('div', { class: 'ctl' }, slider('한식 (종류)', 1, 6, 1, S.a, v => String(v), v => { S.a = v; draw(); use(); })),
        h('div', { class: 'ctl' }, slider('중식 (종류)', 1, 6, 1, S.b, v => String(v), v => { S.b = v; draw(); use(); })),
        h('div', { class: 'chips' }, Array.from({ length: S.a }, (_, i) => h('span', { text: '한식 ' + (i + 1) }))),
        h('div', { class: 'chips gold' }, Array.from({ length: S.b }, (_, i) => h('span', { text: '중식 ' + (i + 1) }))),
        h('div', { class: 'verdict yes', text: '한 가지 주문하는 방법: ' + S.a + ' + ' + S.b + ' = ' + (S.a + S.b) + '가지' }));
    } else {
      body.append(h('p', { class: 'note', text: '스케이트보드 가게에서 판과 바퀴를 각각 한 종류씩 골라 조립해요.' }),
        h('div', { class: 'ctl' }, slider('판 (종류)', 1, 5, 1, S.n, v => String(v), v => { S.n = v; draw(); use(); })),
        h('div', { class: 'ctl' }, slider('바퀴 (종류)', 1, 5, 1, S.m, v => String(v), v => { S.m = v; draw(); use(); })));
      const g = h('div', { class: 'grid-combo', style: 'grid-template-columns:repeat(' + S.m + ',minmax(0,1fr))' });
      for (let i = 1; i <= S.n; i++) for (let j = 1; j <= S.m; j++) g.append(h('span', { text: '판' + i + '·바퀴' + j }));
      body.append(g, h('div', { class: 'verdict yes', text: '조립하는 방법: ' + S.n + ' × ' + S.m + ' = ' + (S.n * S.m) + '가지' }));
    }
  }
  function paintTabs() { tabsBox.replaceChildren(tabs([['ev', '사건·경우의 수'], ['sum', '또는 (합)'], ['prod', '그리고 (곱)']], S.tab, k => { S.tab = k; paintTabs(); draw(); use(); })); }
  paintTabs(); draw();
  return h('div', { class: 'card widget' }, tabsBox, body);
}

/* 5. 닮은 도형 */
function wFig(use) {
  const S = { tab: 'same', k: 2, kx: 2, ky: 1 };
  const svg = h('s:svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': '닮은 도형 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div');
  const P0 = [[0, 0], [4, 0], [5, 2.5], [2, 4], [-1, 2]], NM = ['A', 'B', 'C', 'D', 'E'];
  function draw() {
    const kx = S.tab === 'same' ? S.k : S.kx, ky = S.tab === 'same' ? S.k : S.ky;
    const P1 = P0.map(p => [p[0] * kx, p[1] * ky]);
    const sc = Math.min(370 / (6 + 6 * kx + 1.5), 255 / Math.max(4, 4 * ky)), y0 = 280, x0 = 15 + sc;
    const T0 = P0.map(p => [x0 + p[0] * sc, y0 - p[1] * sc]), off = x0 + 6 * sc + 0.8 * sc + sc;
    const T1 = P1.map(p => [off + p[0] * sc, y0 - p[1] * sc]);
    svg.replaceChildren(poly(T0), poly(T1, { fill: 'var(--green-soft)', stroke: 'var(--green)' }));
    NM.forEach((n, i) => { const p = T0[i], c = [T0.reduce((a, q) => a + q[0], 0) / 5, T0.reduce((a, q) => a + q[1], 0) / 5], dx = p[0] - c[0], dy = p[1] - c[1], L = Math.hypot(dx, dy) || 1; svg.append(label(p[0] + dx / L * 12, p[1] + dy / L * 12 + 4, n)); });
    NM.forEach((n, i) => { const p = T1[i], c = [T1.reduce((a, q) => a + q[0], 0) / 5, T1.reduce((a, q) => a + q[1], 0) / 5], dx = p[0] - c[0], dy = p[1] - c[1], L = Math.hypot(dx, dy) || 1; svg.append(label(p[0] + dx / L * 12, p[1] + dy / L * 12 + 4, n + '′')); });
    const L0 = i => dist(P0[i], P0[(i + 1) % 5]), L1 = i => dist(P1[i], P1[(i + 1) % 5]);
    const items = [0, 1, 2].map(i => [NM[i] + NM[i + 1] + ' → ' + NM[i] + '′' + NM[i + 1] + '′ : ' + r1(L1(i) / L0(i)) + '배', 1]);
    const ang = i => angleAt(P0[i], P0[(i + 4) % 5], P0[(i + 1) % 5]), ang1 = i => angleAt(P1[i], P1[(i + 4) % 5], P1[(i + 1) % 5]);
    items.push(['∠B = ' + r1(ang(1)) + '°', 0], ['∠B′ = ' + r1(ang1(1)) + '°', 0]);
    read.replaceChildren(...items.map(([t, hi]) => h('span', { class: hi ? 'hi' : '', text: t })));
    const same = Math.abs(kx - ky) < 1e-9;
    verdict.className = 'verdict ' + (same ? 'yes' : 'no'); verdict.textContent = same ? '대응변의 비가 모두 같고 대응각도 같아요 → 닮음' : '변마다 늘어난 배수가 달라서 닮음이 아니에요';
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    if (S.tab === 'same') row('배율', 0.5, 2, 0.5, S.k, v => '×' + v, v => { S.k = v; draw(); use(); });
    else { row('가로', 0.5, 2, 0.5, S.kx, v => '×' + v, v => { S.kx = v; draw(); use(); }); row('세로', 0.5, 2, 0.5, S.ky, v => '×' + v, v => { S.ky = v; draw(); use(); }); } }
  function paintTabs() { tabsBox.replaceChildren(tabs([['same', '같은 비율로'], ['stretch', '가로·세로 따로']], S.tab, k => { S.tab = k; paintTabs(); paintCtl(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, ctl, read);
}

/* 6. 삼각형에서 평행선과 선분의 길이의 비 */
function wPar(use) {
  const S = { tab: 'par', t: 0.6, s: 0.4 };
  const svg = h('s:svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': '평행선과 선분의 길이의 비 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div');
  const A = [200, 30], B = [60, 265], C = [350, 265], lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  function draw() {
    const t = S.t, s = S.tab === 'par' ? S.t : S.s, D = lerp(A, B, t), E = lerp(A, C, s);
    svg.replaceChildren(poly([A, B, C]), seg(D, E, { stroke: 'var(--red)', 'stroke-width': 3 }), dot(A), dot(B), dot(C), dot(D, 5, 'var(--red)'), dot(E, 5, 'var(--red)'),
      label(A[0], A[1] - 10, 'A'), label(B[0] - 12, B[1] + 6, 'B'), label(C[0] + 12, C[1] + 6, 'C'), label(D[0] - 13, D[1] + 4, 'D'), label(E[0] + 13, E[1] + 4, 'E'));
    const n = v => Math.round(v * 10), parallel = Math.abs(t - s) < 1e-9;
    const items = [['AD : BD = ' + n(t) + ' : ' + (10 - n(t)), 1], ['AE : CE = ' + n(s) + ' : ' + (10 - n(s)), 1], ['AD : AB = ' + n(t) + ' : 10', 0], ['AE : AC = ' + n(s) + ' : 10', 0], ['DE : BC = ' + r1(Math.round(dist(D, E) / dist(B, C) * 100) / 100 * 10) + ' : 10', 0]];
    read.replaceChildren(...items.map(([x, hi]) => h('span', { class: hi ? 'hi' : '', text: x })));
    verdict.className = 'verdict ' + (parallel ? 'yes' : 'no'); verdict.textContent = parallel ? 'AD : BD = AE : CE → DE ∥ BC' : 'AD : BD ≠ AE : CE → DE와 BC는 평행하지 않아요';
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    row('D 위치', 0.1, 0.9, 0.1, S.t, v => 'AD = ' + Math.round(v * 10) + '/10', v => { S.t = v; draw(); use(); });
    if (S.tab === 'free') row('E 위치', 0.1, 0.9, 0.1, S.s, v => 'AE = ' + Math.round(v * 10) + '/10', v => { S.s = v; draw(); use(); }); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['par', '평행하게'], ['free', '자유롭게']], S.tab, k => { S.tab = k; paintTabs(); paintCtl(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, ctl, h('p', { class: 'note', text: '"평행하게"에서는 E가 자동으로 따라와요. "자유롭게"에서는 E를 따로 움직여 보세요.' }), read);
}

/* 7. 피타고라스 정리 */
function wPyth(use) {
  const S = { tab: 'sq', a: 3, b: 4, ang: 70 };
  const svg = h('s:svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': '피타고라스 정리 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div');
  function draw() {
    svg.replaceChildren();
    if (S.tab === 'sq') {
      const { a, b } = S, c = Math.hypot(a, b), sc = Math.min(370 / (a + 2 * b), 270 / (2 * a + b)), ox = 15 + b * sc + (370 - (a + 2 * b) * sc) / 2, oy = 15 + (a + b) * sc + (270 - (2 * a + b) * sc) / 2;
      const P = (x, y) => [ox + x * sc, oy - y * sc], Cc = P(0, 0), B = P(a, 0), A = P(0, b), nx = b / c, ny = a / c;
      const sqa = [Cc, B, P(a, -a), P(0, -a)], sqb = [Cc, A, P(-b, b), P(-b, 0)], sqc = [A, B, P(a + c * nx, c * ny), P(c * nx, b + c * ny)];
      svg.append(poly(sqa, { fill: 'var(--blue-soft)', 'fill-opacity': .8 }), poly(sqb, { fill: 'var(--green-soft)' }), poly(sqc, { fill: 'var(--red-soft)', stroke: 'var(--red)' }), poly([Cc, B, A], { fill: 'var(--paper)', stroke: 'var(--ink)' }),
        h('s:path', { d: 'M' + (Cc[0] + 10) + ' ' + Cc[1] + ' v-10 h-10', fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.5 }));
      const cen = q => [q.reduce((s, p) => s + p[0], 0) / 4, q.reduce((s, p) => s + p[1], 0) / 4 + 4];
      const lb = (q, side, t) => label(...cen(q), side * sc < 60 ? t.replace(' = ', '=') : t, side * sc < 60 ? 'svgm' : 'svgt');
      svg.append(lb(sqa, a, 'a² = ' + a * a), lb(sqb, b, 'b² = ' + b * b), lb(sqc, c, 'c² = ' + r1(a * a + b * b)));
      const sl = (p, q, dx, dy, t) => { if (Math.hypot(q[0] - p[0], q[1] - p[1]) > 34) svg.append(label((p[0] + q[0]) / 2 + dx, (p[1] + q[1]) / 2 + dy, t, 'svgt')); };
      sl(Cc, B, 0, -7, 'a'); sl(Cc, A, 9, 4, 'b'); sl(A, B, -9, 14, 'c');
      read.replaceChildren(...[['a = ' + a, 0], ['b = ' + b, 0], ['c = ' + r1(c), 0], ['a² + b² = ' + (a * a + b * b), 1], ['c² = ' + r1(c * c), 1]].map(([t, hi]) => h('span', { class: hi ? 'hi' : '', text: t })));
      verdict.className = 'verdict yes'; verdict.textContent = 'a² + b² = c² (' + a * a + ' + ' + b * b + ' = ' + r1(a * a + b * b) + ')';
    } else {
      const a = 3, b = 4, ang = S.ang, rad = ang * Math.PI / 180, c2 = a * a + b * b - 2 * a * b * Math.cos(rad), sc = 38;
      const C0 = [90, 235], B = [C0[0] + a * sc, C0[1]], A = [C0[0] + b * sc * Math.cos(rad), C0[1] - b * sc * Math.sin(rad)];
      svg.append(poly([C0, B, A]), label(C0[0] - 12, C0[1] + 6, 'C'), label(B[0] + 12, B[1] + 6, 'B'), label(A[0], A[1] - 10, 'A'), dot(C0), dot(B), dot(A),
        label((C0[0] + B[0]) / 2, C0[1] + 20, 'a = 3', 'svgt'), label((C0[0] + A[0]) / 2 - 16, (C0[1] + A[1]) / 2, 'b = 4', 'svgt'), label((A[0] + B[0]) / 2 + 16, (A[1] + B[1]) / 2, 'c', 'svgt'),
        label(200, 285, 'a = 3, b = 4 로 고정하고 ∠C만 바꿔요', 'svgm'));
      if (ang === 90) svg.append(h('s:path', { d: 'M' + (C0[0] + 12) + ' ' + C0[1] + ' v-12 h-12', fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.5 }));
      read.replaceChildren(...[['∠C = ' + ang + '°', 1], ['a² + b² = 25', 0], ['c² = ' + r1(c2), 1]].map(([t, hi]) => h('span', { class: hi ? 'hi' : '', text: t })));
      const d = Math.abs(c2 - 25) < 1e-6 ? 0 : c2 < 25 ? -1 : 1;
      verdict.className = 'verdict ' + (d === 0 ? 'yes' : 'no'); verdict.textContent = d === 0 ? '∠C = 90° → a² + b² = c²' : d < 0 ? '∠C < 90° → c² < a² + b² (예각)' : '∠C > 90° → c² > a² + b² (둔각)';
    }
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    if (S.tab === 'sq') { row('a', 3, 12, 1, S.a, v => String(v), v => { S.a = v; draw(); use(); }); row('b', 3, 12, 1, S.b, v => String(v), v => { S.b = v; draw(); use(); }); }
    else row('∠C', 50, 130, 5, S.ang, v => v + '°', v => { S.ang = v; draw(); use(); }); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['sq', '정사각형 넓이'], ['ang', '각 C 바꾸기']], S.tab, k => { S.tab = k; paintTabs(); paintCtl(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, ctl, read);
}

/* 8. 평행선 사이의 선분의 길이의 비 */
function wPl(use, N) {
  N = N || { a: 'A′', b: 'B′', c: 'C′' };
  const S = { tab: 'par', t: 0.4, q: 0, y1: 120, y2: 160 };
  const svg = h('s:svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': '평행선 사이의 선분의 길이의 비 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div');
  const yl = 45, yn = 255, K = 20; // 20px = 1cm
  const hit = (P, Q, yA, yB, x) => { // 직선(x1,y1)-(x2,y2)와 직선 y = yA + (yB-yA)*(x-20)/360 의 교점
    const dx = Q[0] - P[0], dy = Q[1] - P[1], sl = (yB - yA) / 360;
    const t = (yA + sl * (P[0] - 20) - P[1]) / (dy - sl * dx); return [P[0] + dx * t, P[1] + dy * t]; };
  function draw() {
    const par = S.tab === 'par', ym = yl + (yn - yl) * S.t;
    const y1 = par ? ym : S.y1, y2 = par ? ym : S.y2;
    const P = [[110, 20], [90 + S.q * 0.4, 280]], Q = [[300, 20], [310 + S.q, 280]];
    const pts = (L) => [hit(L[0], L[1], yl, yl, 0), hit(L[0], L[1], y1, y2, 0), hit(L[0], L[1], yn, yn, 0)];
    const [A, B, C] = pts(P), [A2, B2, C2] = pts(Q);
    svg.replaceChildren(
      seg([20, yl], [380, yl], { stroke: 'var(--blue)', 'stroke-width': 2.5 }), seg([20, y1], [380, y2], { stroke: par ? 'var(--blue)' : 'var(--red)', 'stroke-width': 2.5 }), seg([20, yn], [380, yn], { stroke: 'var(--blue)', 'stroke-width': 2.5 }),
      seg(P[0], P[1]), seg(Q[0], Q[1]), dot(A), dot(B), dot(C), dot(A2), dot(B2), dot(C2),
      label(A[0] - 12, A[1] - 6, 'A'), label(B[0] - 12, B[1] - 6, 'B'), label(C[0] - 12, C[1] + 16, 'C'), label(A2[0] + 14, A2[1] - 6, N.a), label(B2[0] + 14, B2[1] - 6, N.b), label(C2[0] + 14, C2[1] + 16, N.c),
      label(372, yl - 8, 'l'), label(372, Math.min(y1, y2) - 8 > yl + 12 ? Math.min(y1, y2) - 8 : y2 + 16, 'm'), label(372, yn - 8, 'n'), label(P[0][0] - 10, 18, 'p'), label(Q[0][0] + 10, 18, 'q'));
    const ab = dist(A, B) / K, bc = dist(B, C) / K, ab2 = dist(A2, B2) / K, bc2 = dist(B2, C2) / K, f = v => r1(Math.round(v * 10) / 10);
    const r = ab / bc, r2 = ab2 / bc2, same = Math.abs(r - r2) < 0.015;
    read.replaceChildren(...[['AB = ' + f(ab) + ' cm', 0], ['BC = ' + f(bc) + ' cm', 0], [N.a + N.b + ' = ' + f(ab2) + ' cm', 0], [N.b + N.c + ' = ' + f(bc2) + ' cm', 0], ['AB ÷ BC = ' + (Math.round(r * 100) / 100), 1], [N.a + N.b + ' ÷ ' + N.b + N.c + ' = ' + (Math.round(r2 * 100) / 100), 1]].map(([x, hi]) => h('span', { class: hi ? 'hi' : '', text: x })));
    verdict.className = 'verdict ' + (same ? 'yes' : 'no'); verdict.textContent = same ? 'AB : BC = ' + N.a + N.b + ' : ' + N.b + N.c + ' (비가 같아요)' : 'AB : BC ≠ ' + N.a + N.b + ' : ' + N.b + N.c + ' (비가 달라졌어요)';
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    if (S.tab === 'par') row('m 높이', 0.2, 0.8, 0.05, S.t, v => Math.round(v * 100) + '%', v => { S.t = v; draw(); use(); });
    else { row('m 왼쪽', 90, 210, 5, S.y1, v => String(v), v => { S.y1 = v; draw(); use(); }); row('m 오른쪽', 90, 210, 5, S.y2, v => String(v), v => { S.y2 = v; draw(); use(); }); }
    row('q 기울기', -60, 60, 10, S.q, v => String(v), v => { S.q = v; draw(); use(); }); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['par', 'l ∥ m ∥ n'], ['free', 'm 기울이기']], S.tab, k => { S.tab = k; paintTabs(); paintCtl(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, ctl, h('p', { class: 'note', text: '"m 기울이기"에서 m의 양 끝 높이를 서로 다르게 하면 m은 l, n과 평행하지 않게 돼요.' }), read);
}

/* 9. 삼각형의 무게중심 */
function wCen(use) {
  const S = { tab: 'med', ax: 190, ay: 60 };
  const svg = h('s:svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': '삼각형의 무게중심 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div');
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], area = (p, q, r) => Math.abs((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) / 2 / 400;
  function draw() {
    const A = [S.ax, S.ay], B = [60, 250], C = [340, 250], D = mid(B, C), E = mid(A, C), F = mid(A, B), G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    svg.replaceChildren();
    if (S.tab === 'area') {
      const cols = ['var(--blue-soft)', 'var(--green-soft)', 'var(--red-soft)', 'var(--gold-soft)', 'var(--blue-soft)', 'var(--green-soft)'];
      const tr = [[A, F, G], [F, B, G], [B, D, G], [D, C, G], [C, E, G], [E, A, G]];
      tr.forEach((t, i) => svg.append(poly(t, { fill: cols[i], stroke: 'var(--ink2)', 'stroke-width': 1.5 })));
      svg.append(poly([A, B, C], { fill: 'none' }));
      tr.forEach((t, i) => svg.append(h('s:text', { x: (t[0][0] + t[1][0] + t[2][0]) / 3, y: (t[0][1] + t[1][1] + t[2][1]) / 3 + 8, 'text-anchor': 'middle', style: 'font-size:24px;font-weight:800;fill:var(--ink);paint-order:stroke;stroke:#fff;stroke-width:3px', text: String(i + 1) })));
      const ar = tr.map(t => area(...t)), tot = area(A, B, C);
      read.replaceChildren(...ar.map((v, i) => h('span', { class: 'hi', text: (i + 1) + '번 = ' + r1(v) + ' cm²' })), h('span', { text: '전체 = ' + r1(tot) + ' cm²' }));
      verdict.className = 'verdict yes'; verdict.textContent = '여섯 삼각형의 넓이가 모두 같고, 각각 전체의 1/6이에요';
    } else {
      svg.append(poly([A, B, C]), seg(A, D, { stroke: 'var(--red)', 'stroke-width': 2.2 }), seg(B, E, { stroke: 'var(--red)', 'stroke-width': 2.2 }), seg(C, F, { stroke: 'var(--red)', 'stroke-width': 2.2 }),
        tick(B, D), tick(D, C), tick(A, E), tick(E, C), tick(A, F), tick(F, B), dot(A), dot(B), dot(C), dot(D, 3.5, 'var(--red)'), dot(E, 3.5, 'var(--red)'), dot(F, 3.5, 'var(--red)'), dot(G, 6, 'var(--gold)'),
        label(A[0], A[1] - 10, 'A'), label(B[0] - 12, B[1] + 6, 'B'), label(C[0] + 12, C[1] + 6, 'C'), label(D[0], D[1] + 20, 'D'), label(E[0] + 13, E[1], 'E'), label(F[0] - 13, F[1], 'F'), label(G[0] + 13, G[1] + 18, 'G'));
      const u = 20, d = (p, q) => dist(p, q) / u, ag = d(A, G), gd = d(G, D), bg = d(B, G), ge = d(G, E), cg = d(C, G), gf = d(G, F);
      read.replaceChildren(...[['AG = ' + r1(ag), 0], ['DG = ' + r1(gd), 0], ['BG = ' + r1(bg), 0], ['EG = ' + r1(ge), 0], ['CG = ' + r1(cg), 0], ['FG = ' + r1(gf), 0], ['AG ÷ DG = ' + (Math.round(ag / gd * 100) / 100), 1], ['BG ÷ EG = ' + (Math.round(bg / ge * 100) / 100), 1], ['CG ÷ FG = ' + (Math.round(cg / gf * 100) / 100), 1]].map(([x, hi]) => h('span', { class: hi ? 'hi' : '', text: x })));
      verdict.className = 'verdict yes'; verdict.textContent = '세 중선은 한 점 G에서 만나고, (꼭짓점에서 G까지) : (G에서 변 위의 점까지) = 2 : 1';
    }
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    row('A 가로', 80, 320, 10, S.ax, v => String(v), v => { S.ax = v; draw(); use(); }); row('A 높이', 40, 170, 10, S.ay, v => String(250 - v), v => { S.ay = v; draw(); use(); }); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['med', '중선'], ['area', '넓이']], S.tab, k => { S.tab = k; paintTabs(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, ctl, h('p', { class: 'note', text: 'A를 움직여 삼각형의 모양을 바꿔도 같은 결과가 나오는지 확인해 보세요.' }), read);
}

/* 10. 닮은 도형의 넓이와 부피의 비 */
function wRat(use) {
  const S = { tab: 'area', m: 1, n: 2 };
  const svg = h('s:svg', { viewBox: '0 0 400 300', role: 'img', 'aria-label': '닮은 도형의 넓이와 부피의 비 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div');
  function draw() {
    const { m, n } = S; svg.replaceChildren();
    if (S.tab === 'area') {
      const a = 3, b = 2, u = Math.min(42, 360 / ((m + n) * a + 1.5), 250 / (Math.max(m, n) * b + 1)), base = 235;
      const x1 = 200 - ((m + n) * a * u + 24) / 2; let x = x1;
      [[m, 'var(--blue-soft)', 'P'], [n, 'var(--green-soft)', 'Q']].forEach(([k, col, nm]) => {
        const W = k * a * u, H = k * b * u;
        svg.append(h('s:rect', { x, y: base - H, width: W, height: H, fill: col, stroke: 'var(--ink)', 'stroke-width': 2 }));
        if (u * 1 >= 7) for (let i = 1; i < k * a; i++) svg.append(seg([x + i * u, base - H], [x + i * u, base], { stroke: 'var(--line)', 'stroke-width': .8, opacity: .6 }));
        if (u * 1 >= 7) for (let j = 1; j < k * b; j++) svg.append(seg([x, base - j * u], [x + W, base - j * u], { stroke: 'var(--line)', 'stroke-width': .8, opacity: .6 }));
        svg.append(label(x + W / 2, base + 22, nm + ': 가로 ' + k * a + ', 세로 ' + k * b, 'svgm')); x += W + 24; });
      const A1 = m * m * a * b, A2 = n * n * a * b;
      read.replaceChildren(...[['닮음비 ' + m + ' : ' + n, 1], ['P의 넓이 = ' + A1, 0], ['Q의 넓이 = ' + A2, 0], ['넓이의 비 = ' + A1 + ' : ' + A2, 1], ['m² : n² = ' + m * m + ' : ' + n * n, 1]].map(([t, hi]) => h('span', { class: hi ? 'hi' : '', text: t })));
      verdict.className = 'verdict yes'; verdict.textContent = '닮음비 ' + m + ' : ' + n + ' → 넓이의 비 ' + m * m + ' : ' + n * n + ' (칸 수 기준)';
    } else {
      const ux = Math.min(34, 360 / ((m + n) * 2.5 + 2)), uy = Math.min(34, 230 / (Math.max(m, n) * 1.5 + .5)), u = Math.min(ux, uy), base = 245, off = 0.5;
      let x = 200 - (((m + n) * 2.5) * u + 20) / 2;
      [[m, 'var(--blue-soft)', 'P'], [n, 'var(--green-soft)', 'Q']].forEach(([k, col, nm]) => {
        const W = 2 * k * u, H = k * u, dx = off * k * u, dy = off * k * u;
        const f = [[x, base], [x + W, base], [x + W, base - H], [x, base - H]], top = [[x, base - H], [x + W, base - H], [x + W + dx, base - H - dy], [x + dx, base - H - dy]], side = [[x + W, base], [x + W + dx, base - dy], [x + W + dx, base - H - dy], [x + W, base - H]];
        svg.append(poly(f, { fill: col, stroke: 'var(--ink)', 'stroke-width': 2 }), poly(top, { fill: col, 'fill-opacity': .7, stroke: 'var(--ink)', 'stroke-width': 2 }), poly(side, { fill: col, 'fill-opacity': .5, stroke: 'var(--ink)', 'stroke-width': 2 }),
          label(x + W / 2, base + 22, nm + ': ' + 2 * k + '×' + k + '×' + k, 'svgm')); x += W + dx + 20; });
      const V1 = 2 * m * m * m, V2 = 2 * n * n * n;
      read.replaceChildren(...[['닮음비 ' + m + ' : ' + n, 1], ['P의 부피 = ' + V1, 0], ['Q의 부피 = ' + V2, 0], ['부피의 비 = ' + V1 + ' : ' + V2, 1], ['m³ : n³ = ' + m ** 3 + ' : ' + n ** 3, 1]].map(([t, hi]) => h('span', { class: hi ? 'hi' : '', text: t })));
      verdict.className = 'verdict yes'; verdict.textContent = '닮음비 ' + m + ' : ' + n + ' → 부피의 비 ' + m ** 3 + ' : ' + n ** 3 + ' (단위 상자 수 기준)';
    }
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    const mx = S.tab === 'area' ? 5 : 4;
    row('m', 1, mx, 1, S.m, v => String(v), v => { S.m = v; draw(); use(); }); row('n', 1, mx, 1, S.n, v => String(v), v => { S.n = v; draw(); use(); }); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['area', '넓이'], ['vol', '부피']], S.tab, k => { S.tab = k; S.m = Math.min(S.m, k === 'area' ? 5 : 4); S.n = Math.min(S.n, k === 'area' ? 5 : 4); paintTabs(); paintCtl(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, ctl, h('p', { class: 'note', text: '기준 도형(직사각형 3×2, 직육면체 2×1×1)을 m배, n배 한 도형이에요. 넓이는 칸의 수, 부피는 단위 상자의 수로 세어요.' }), read);
}


function wRt(use) {
  const S = { tab: 't1', t: 0, a: 5 };
  const svg = h('s:svg', { viewBox: '0 0 400 346', role: 'img', 'aria-label': '직각삼각형에서 수선으로 나뉜 삼각형의 닮음 탐색' });
  const read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict' }), ctl = h('div'), tabsBox = h('div');
  const U = 20, B0 = [60, 150];
  const CFG = {
    t1: { X: ['A', 'B', 'C'], Y: ['H', 'B', 'A'], r: 0, rel: ['BC', 'AB', 'BH'], eq: ['AB²', 'BH × BC'] },
    t2: { X: ['A', 'B', 'C'], Y: ['H', 'A', 'C'], r: 0, rel: ['BC', 'AC', 'CH'], eq: ['AC²', 'CH × BC'] },
    t3: { X: ['C', 'A', 'H'], Y: ['A', 'B', 'H'], r: 2, rel: ['BH', 'AH', 'CH'], eq: ['AH²', 'BH × CH'] }
  };
  const geo = () => { const a = S.a, b = 13 - a, hh = Math.sqrt(a * b), H = [B0[0] + a * U, 150]; return { B: B0, C: [B0[0] + 13 * U, 150], H, A: [H[0], 150 - hh * U], a, b, hh }; };
  const away = (p, c, d) => { const v = [p[0] - c[0], p[1] - c[1]], L = Math.hypot(...v) || 1; return [p[0] + v[0] / L * d, p[1] + v[1] / L * d]; };
  const cen = P => [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  const cross = P => (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[1][1] - P[0][1]) * (P[2][0] - P[0][0]);
  const rot = (w, an) => [w[0] * Math.cos(an) - w[1] * Math.sin(an), w[0] * Math.sin(an) + w[1] * Math.cos(an)];
  const rtm = (V, p, q) => { const u = [p[0] - V[0], p[1] - V[1]], w = [q[0] - V[0], q[1] - V[1]], lu = Math.hypot(...u), lw = Math.hypot(...w), s = 11, uu = [u[0] / lu * s, u[1] / lu * s], ww = [w[0] / lw * s, w[1] / lw * s];
    return h('s:path', { d: 'M' + (V[0] + uu[0]) + ' ' + (V[1] + uu[1]) + ' l' + ww[0] + ' ' + ww[1] + ' l' + (-uu[0]) + ' ' + (-uu[1]), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.5 }); };
  const colored = (x, y, t, c) => { const n = label(x, y + 5, t, 'svgt'); n.setAttribute('fill', c); return n; };
  const len = (G, nm) => dist(G[nm[0]], G[nm[1]]) / U;
  function draw() {
    const G = geo(), cfg = CFG[S.tab], X = cfg.X.map(n => G[n]), Y0 = cfg.Y.map(n => G[n]), r = cfg.r, s = (r + 1) % 3, t = S.t;
    const u = [Y0[s][0] - Y0[r][0], Y0[s][1] - Y0[r][1]], v = [X[s][0] - X[r][0], X[s][1] - X[r][1]], au = Math.atan2(u[1], u[0]), av = Math.atan2(v[1], v[0]), refl = cross(Y0) * cross(X) < 0;
    let th = av - au; while (th > Math.PI) th -= 2 * Math.PI; while (th <= -Math.PI) th += 2 * Math.PI;
    const s1 = refl ? Math.min(1, t / .65) : t, s2 = refl ? Math.max(0, (t - .65) / .35) : 0, e = [Math.cos(av), Math.sin(av)];
    const Mv = w => { let w1 = rot(w, th * s1); if (refl) { const k = w1[0] * e[0] + w1[1] * e[1], par = [k * e[0], k * e[1]], pp = [w1[0] - par[0], w1[1] - par[1]], f = 1 - 2 * s2; w1 = [par[0] + f * pp[0], par[1] + f * pp[1]]; } return w1; };
    const p0 = [Y0[r][0], Y0[r][1] + 175], anc = [p0[0] + (X[r][0] - p0[0]) * t, p0[1] + (X[r][1] - p0[1]) * t];
    const Yt = Y0.map(p => { const q = Mv([p[0] - Y0[r][0], p[1] - Y0[r][1]]); return [anc[0] + q[0], anc[1] + q[1]]; });
    const cx = cen(X), cy = cen(Yt), ox = cen([G.A, G.B, G.C]);
    svg.replaceChildren(
      poly([G.A, G.B, G.C], { fill: 'none', stroke: 'var(--line)', 'stroke-width': 1.5 }),
      seg(G.A, G.H, { stroke: 'var(--ink3, var(--ink2))', 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }),
      poly(X, { fill: 'var(--blue-soft)', 'fill-opacity': .75, stroke: 'var(--blue)', 'stroke-width': 2.5 }),
      poly(Yt, { fill: 'var(--red-soft)', 'fill-opacity': .7, stroke: 'var(--red)', 'stroke-width': 2.5 }),
      ...['A', 'B', 'C', 'H'].filter(n => !cfg.X.includes(n)).flatMap(n => { const q = n === 'H' ? [G.H[0], G.H[1] + 17] : away(G[n], ox, 16); return [dot(G[n], 4, n === 'H' ? 'var(--blue)' : 'var(--ink2)'), colored(q[0], q[1], n, n === 'H' ? 'var(--blue)' : 'var(--ink2)')]; }),
      rtm(X[r], X[(r + 1) % 3], X[(r + 2) % 3]), rtm(Yt[r], Yt[(r + 1) % 3], Yt[(r + 2) % 3]),
      ...X.map((p, i) => { const q = away(p, cx, 15); return colored(q[0], q[1], cfg.X[i], 'var(--blue)'); }),
      ...Yt.map((p, i) => { const q = i === r && t > .85 ? away(p, cy, -22) : away(p, cy, 15); return colored(q[0], q[1] + (i === r && t > .85 ? 4 : 0), cfg.Y[i], 'var(--red)'); }));
    const L = cfg.rel.map(n => len(G, n)), f = x => r1(Math.round(x * 10) / 10), g2 = x => String(Math.round(x * 100) / 100);
    const e1 = L[1] * L[1], e2 = cfg.eq[1] === 'BH × BC' ? G.a * 13 : cfg.eq[1] === 'CH × BC' ? G.b * 13 : G.a * G.b;
    const e1v = cfg.eq[0] === 'AB²' ? len(G, 'AB') ** 2 : cfg.eq[0] === 'AC²' ? len(G, 'AC') ** 2 : len(G, 'AH') ** 2;
    read.replaceChildren(...[[cfg.rel[0] + ' = ' + f(L[0]) + ' cm', 0], [cfg.rel[1] + ' = ' + f(L[1]) + ' cm', 0], [cfg.rel[2] + ' = ' + f(L[2]) + ' cm', 0],
      [cfg.rel[0] + ' ÷ ' + cfg.rel[1] + ' = ' + g2(L[0] / L[1]), 1], [cfg.rel[1] + ' ÷ ' + cfg.rel[2] + ' = ' + g2(L[1] / L[2]), 1],
      [cfg.eq[0] + ' = ' + f(e1v), 1], [cfg.eq[1] + ' = ' + f(e2), 1]].map(([x, hi]) => h('span', { class: hi ? 'hi' : '', text: x })));
    if (t < .98) { verdict.className = 'verdict'; verdict.textContent = '슬라이더를 끝까지 밀어서 빨간 삼각형을 파란 삼각형과 같은 방향으로 겹쳐 보세요.'; }
    else { verdict.className = 'verdict yes'; verdict.textContent = cfg.X.map((n, i) => n + '↔' + cfg.Y[i]).join('  ') + ' 대응 → ' + cfg.rel[0] + ' : ' + cfg.rel[1] + ' = ' + cfg.rel[1] + ' : ' + cfg.rel[2] + ', 그래서 ' + cfg.eq[0] + ' = ' + cfg.eq[1]; }
  }
  function paintCtl() { ctl.replaceChildren(); const row = (...a) => ctl.append(h('div', { class: 'ctl' }, slider(...a)));
    row('겹쳐 보기', 0, 1, 0.02, S.t, v => Math.round(v * 100) + '%', v => { S.t = v; draw(); use(); });
    row('BH 길이', 3, 10, 1, S.a, v => v + ' cm', v => { S.a = v; draw(); use(); }); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['t1', '△ABC · △HBA'], ['t2', '△ABC · △HAC'], ['t3', '△ABH · △CAH']], S.tab, k => { S.tab = k; S.t = 0; paintTabs(); paintCtl(); draw(); use(); })); }
  paintTabs(); paintCtl(); draw();
  return h('div', { class: 'card widget' }, tabsBox, svg, verdict, ctl, h('p', { class: 'note', text: '직각 표시(ㄴ)가 있는 꼭짓점끼리 먼저 겹쳐요. 빨간 삼각형이 돌고 뒤집히며 파란 삼각형과 같은 방향이 되면, 같은 자리에 오는 꼭짓점이 서로 대응해요. ∠A = 90°이고 AH ⊥ BC인 삼각형이에요.' }), read);
}

const WIDGETS = { iso: wIso, para: wPara, sim: wSim, count: wCount, fig: wFig, par: wPar, pyth: wPyth, pl: wPl, cen: wCen, rat: wRat, rt: wRt };

