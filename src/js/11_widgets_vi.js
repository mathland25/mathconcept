/* ===== Ⅵ. 경우의 수와 확률 — 새 탐색 위젯 ===== */
const fr = (k, n) => { if (!k) return '0'; const g = gcd2(k, n), a = k / g, b = n / g; return b === 1 ? String(a) : a + '/' + b; };
const f3 = v => (Math.round(v * 1000) / 1000).toFixed(3);
function pieSvg(parts, size = 130) {
  const R = size / 2 - 4, C = size / 2;
  const svg = h('s:svg', { viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': '회전판', style: 'width:' + size + 'px;height:' + size + 'px;background:none;border:0;margin:0 auto' });
  let a0 = -Math.PI / 2;
  parts.forEach(p => {
    const a1 = a0 + p.f * 2 * Math.PI, x0 = C + R * Math.cos(a0), y0 = C + R * Math.sin(a0), x1 = C + R * Math.cos(a1), y1 = C + R * Math.sin(a1);
    svg.append(h('s:path', { d: 'M' + C + ' ' + C + ' L' + x0 + ' ' + y0 + ' A' + R + ' ' + R + ' 0 ' + (p.f > .5 ? 1 : 0) + ' 1 ' + x1 + ' ' + y1 + ' Z', fill: p.c, stroke: 'var(--paper)', 'stroke-width': 2 }));
    const m = (a0 + a1) / 2; if (p.t) svg.append(label(C + R * .6 * Math.cos(m), C + R * .6 * Math.sin(m) + 4, p.t, 'svgm'));
    a0 = a1;
  });
  return svg;
}

/* 6. 수형도와 표로 빠짐없이 세기 */
function wTree(use) {
  const S = { tab: 'coin', lv: 1, rep: false, show: false };
  const tabsBox = h('div'), body = h('div');
  const CFG = {
    coin: { names: ['동전 1', '동전 2', '동전 3'], opts: () => ['앞', '뒤'], note: '서로 다른 동전 3개를 던져요. 동전마다 앞 또는 뒤가 나와요.' },
    line: { names: ['첫째 자리', '둘째 자리', '셋째 자리'], opts: p => ['A', 'B', 'C'].filter(x => !p.includes(x)), note: 'A, B, C 세 사람을 한 줄로 세워요. 앞에 선 사람은 다시 설 수 없어요.' },
    num: { names: ['십의 자리', '일의 자리'], opts: p => ['1', '2', '3'].filter(x => S.rep || !p.includes(x)), note: '카드 1, 2, 3으로 두 자리 정수를 만들어요.' }
  };
  const grow = (c, p, d) => d === c.names.length ? null : c.opts(p).map(x => ({ t: x, p: p.concat(x), k: grow(c, p.concat(x), d + 1) }));
  function layout(nodes, d, lv, st) {
    return nodes.map(n => {
      const o = { n, d, kids: [] };
      if (d < lv && n.k) { o.kids = layout(n.k, d + 1, lv, st); o.y = o.kids.reduce((s, x) => s + x.y, 0) / o.kids.length; } else o.y = st.y++;
      return o;
    });
  }
  const X = d => 30 + d * 100, Y = y => 40 + y * 28;
  function draw() {
    body.replaceChildren();
    if (S.tab === 'chk') {
      const A = ['12', '13', '21', '23', '31'], B = ['12', '13', '21', '21', '23', '31', '32'], seen = new Set();
      body.append(h('p', { class: 'note', text: '카드 1, 2, 3 중 서로 다른 두 장을 뽑아 두 자리 정수를 만들어요. 두 친구가 나열한 목록을 살펴보세요.' }),
        h('p', { style: 'font-weight:600;margin:6px 0 0', text: '철수의 목록' }),
        h('div', { class: 'chips' }, A.map(t => h('span', { text: t })), S.show ? h('span', { style: 'border-style:dashed;border-color:var(--red);color:var(--red)', text: '32 (빠짐)' }) : null),
        h('p', { style: 'font-weight:600;margin:10px 0 0', text: '영희의 목록' }),
        h('div', { class: 'chips' }, B.map(t => { const dup = seen.has(t); seen.add(t); return h('span', { style: S.show && dup ? 'border-color:var(--red);color:var(--red);background:var(--red-soft)' : '', text: t + (S.show && dup ? ' (중복)' : '') }); })),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn sm', text: S.show ? '점검 결과 가리기' : '빠짐·중복 점검하기', onclick: () => { S.show = !S.show; draw(); use(); } })),
        S.show ? h('div', { class: 'verdict yes', text: '빠짐없이, 겹치지 않게 나열하면 12, 13, 21, 23, 31, 32 → 6가지예요. (3 × 2 = 6과 같아요)' }) : '');
      return;
    }
    const c = CFG[S.tab], tree = grow(c, [], 0), max = c.names.length;
    S.lv = Math.min(S.lv, max);
    const st = { y: 0 }, L = layout(tree, 1, S.lv, st), H = 54 + st.y * 28;
    const svg = h('s:svg', { viewBox: '0 0 360 ' + H, role: 'img', 'aria-label': '수형도' });
    const rootY = Y(L.reduce((s, o) => s + o.y, 0) / L.length);
    (function dr(list, px, py, d) { list.forEach(o => { const x = X(d), y = Y(o.y); svg.append(seg([px, py], [x, y], { stroke: 'var(--blue)', 'stroke-width': 1.6 })); dr(o.kids, x, y, d + 1); }); })(L, 30, rootY, 1);
    svg.append(dot([30, rootY], 5, 'var(--ink2)'), label(30, rootY - 10, '시작', 'svgm'));
    (function dn(list, d) { list.forEach(o => { const x = X(d), y = Y(o.y); svg.append(h('s:circle', { cx: x, cy: y, r: 11, fill: 'var(--paper)', stroke: 'var(--blue)', 'stroke-width': 2 }), label(x, y + 4, o.n.t, 'svgt')); dn(o.kids, d + 1); }); })(L, 1);
    for (let d = 1; d <= S.lv; d++) svg.append(label(X(d), 16, c.names[d - 1], 'svgm'));
    const bs = []; let n = tree; while (n) { bs.push(n.length); n = n[0].k; }
    const shown = bs.slice(0, S.lv), prod = shown.reduce((a, b) => a * b, 1), res = [];
    (function g(list, d) { list.forEach(o => { if (d === S.lv || !o.kids.length) res.push(o.n.p.join('')); else g(o.kids, d + 1); }); })(L, 1);
    const ctl = h('div', { class: 'ctl' }, slider('펼친 단계', 1, max, 1, S.lv, v => v + '단계', v => { S.lv = v; draw(); use(); }));
    body.append(h('p', { class: 'note', text: c.note }), svg, ctl,
      S.tab === 'num' ? h('div', { class: 'wtabs', style: 'margin-top:8px' }, [[false, '같은 카드를 두 번 쓸 수 없어요'], [true, '같은 카드를 두 번 써도 돼요']].map(([k, t]) => h('button', { type: 'button', class: S.rep === k ? 'on' : '', 'aria-pressed': S.rep === k ? 'true' : 'false', text: t, onclick: () => { S.rep = k; draw(); use(); } }))) : '',
      h('div', { class: 'chips' }, res.map(t => h('span', { text: t }))),
      h('div', { class: 'verdict yes', text: '지금까지 나온 경우: ' + shown.join(' × ') + ' = ' + prod + '가지' }));
  }
  function paintTabs() { tabsBox.replaceChildren(tabs([['coin', '동전 3개'], ['line', 'A, B, C 한 줄로'], ['num', '두 자리 수'], ['chk', '빠짐·중복 찾기']], S.tab, k => { S.tab = k; S.lv = 1; S.show = false; paintTabs(); draw(); use(); })); }
  paintTabs(); draw();
  return h('div', { class: 'card widget' }, tabsBox, body);
}

/* 7. 확률의 뜻과 상대도수 — 반복 실험 */
function wProb(use) {
  const CFG = {
    coin: { name: '동전 던지기', ev: [['앞면', [1, 2], () => Math.random() < .5]], note: '동전을 던져 앞면이 나온 횟수를 세어요.' },
    dice: { name: '주사위', ev: [['1의 눈', [1, 6], d => d === 1], ['짝수의 눈', [1, 2], d => d % 2 === 0], ['3의 배수의 눈', [1, 3], d => d % 3 === 0]], note: '주사위를 던져 고른 사건이 일어난 횟수를 세어요.' },
    spin: { name: '회전판', ev: [['빨강', [1, 4], k => k < 2]], note: '같은 크기로 8등분한 회전판을 돌려요. 8칸 중 2칸이 빨강이에요.' }
  };
  const S = { tab: 'coin', ev: 0, cum: [] };
  const tabsBox = h('div'), evBox = h('div'), chart = h('div'), read = h('div', { class: 'read' }), btns = h('div', { class: 'row' }), pie = h('div');
  const cur = () => CFG[S.tab].ev[S.ev];
  function trial() {
    if (S.tab === 'coin') return cur()[2]();
    if (S.tab === 'dice') return cur()[2](1 + Math.floor(Math.random() * 6));
    return cur()[2](Math.floor(Math.random() * 8));
  }
  function run(m) {
    for (let i = 0; i < m && S.cum.length < 20000; i++) { const k = (S.cum.length ? S.cum[S.cum.length - 1] : 0) + (trial() ? 1 : 0); S.cum.push(k); }
    draw(); use();
  }
  function draw() {
    const n = S.cum.length, k = n ? S.cum[n - 1] : 0, [num, den] = cur()[1], p = num / den;
    const W = 400, H = 210, x0 = 44, x1 = 384, yT = 16, yB = 176, yy = v => yB - (yB - yT) * v;
    const N = Math.pow(10, Math.max(1, Math.ceil(Math.log10(Math.max(n, 10))))), fx = i => x0 + (x1 - x0) * Math.log10(i) / Math.log10(N);
    const svg = h('s:svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': '시행 횟수에 따른 상대도수 그래프' });
    [0, .5, 1].forEach(v => { svg.append(seg([x0, yy(v)], [x1, yy(v)], { stroke: 'var(--line)', 'stroke-width': 1 }), label(x0 - 6, yy(v) + 4, String(v), 'svgm', 'end')); });
    for (let t = 1; t <= N; t *= 10) { svg.append(seg([fx(t), yB], [fx(t), yB + 4], { stroke: 'var(--ink2)' }), label(fx(t), yB + 17, String(t), 'svgm')); }
    svg.append(label((x0 + x1) / 2, H - 6, '시행 횟수 (10배씩)', 'svgm'), seg([x0, yy(p)], [x1, yy(p)], { stroke: 'var(--green)', 'stroke-width': 2, 'stroke-dasharray': '6 4' }), label(x1, yy(p) - 5, '확률 ' + fr(num, den), 'svgm', 'end'));
    if (n) {
      const step = Math.max(1, Math.ceil(n / 300)), pts = [];
      for (let i = 1; i <= n; i += step) pts.push([fx(i), yy(S.cum[i - 1] / i)]);
      if ((n - 1) % step) pts.push([fx(n), yy(k / n)]);
      svg.append(h('s:polyline', { points: pts.map(q => q.join(',')).join(' '), fill: 'none', stroke: 'var(--blue)', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }), dot(pts[pts.length - 1], 4, 'var(--red)'));
    }
    chart.replaceChildren(svg);
    read.replaceChildren(...[['시행 횟수 ' + n + '번', 0], [cur()[0] + ' ' + k + '번', 0], ['상대도수 ' + (n ? k + ' ÷ ' + n + ' = ' + f3(k / n) : '—'), 1], ['경우의 수의 비율 ' + fr(num, den) + ' = ' + f3(p), 1]].map(([t, hi]) => h('span', { class: hi ? 'hi' : '', text: t })));
    btns.replaceChildren(...[[1, '×1'], [10, '×10'], [100, '×100'], [1000, '×1000']].map(([m, t]) => h('button', { type: 'button', class: 'btn sm', text: t, disabled: n >= 20000, onclick: () => run(m) })), h('button', { type: 'button', class: 'btn sm ghost', text: '처음부터', onclick: () => { S.cum = []; draw(); use(); } }));
    pie.replaceChildren(S.tab === 'spin' ? pieSvg(Array.from({ length: 8 }, (_, i) => ({ f: 1 / 8, c: i < 2 ? 'var(--red-soft)' : 'var(--blue-soft)', t: i < 2 ? '빨강' : '' }))) : '');
  }
  function paint() {
    tabsBox.replaceChildren(tabs([['coin', '동전'], ['dice', '주사위'], ['spin', '회전판']], S.tab, k => { S.tab = k; S.ev = 0; S.cum = []; paint(); use(); }));
    const c = CFG[S.tab];
    evBox.replaceChildren(h('p', { class: 'note', text: c.note }), c.ev.length > 1 ? tabs(c.ev.map((e, i) => [i, e[0]]), S.ev, i => { S.ev = i; S.cum = []; paint(); use(); }) : '');
    draw();
  }
  paint();
  return h('div', { class: 'card widget' }, tabsBox, evBox, pie, chart, btns, read);
}

/* 8. 확률의 기본 성질 — 주머니 속 공 */
function wBag(use) {
  const S = { tab: 'bag', r: 3, b: 5, y: 0, rps: 'tie' };
  const NAMES = { r: ['파인애플 맛', 'var(--gold)'], b: ['포도 맛', 'var(--blue)'], y: ['우유 맛', 'var(--ink2)'] };
  const svgBox = h('div'), ctl = h('div'), read = h('div', { class: 'read' }), verdict = h('div', { class: 'verdict yes' }), tabsBox = h('div'), body = h('div');
  const HAND = ['가위', '바위', '보'], res = (i, j) => i === j ? 'tie' : ((i + 1) % 3 === j ? 'win' : 'lose');
  function drawBag() {
    const T = S.r + S.b + S.y, balls = [].concat(Array(S.r).fill('r'), Array(S.b).fill('b'), Array(S.y).fill('y'));
    const svg = h('s:svg', { viewBox: '0 0 360 190', role: 'img', 'aria-label': '그릇 속 사탕과 확률' });
    balls.forEach((c, i) => svg.append(h('s:circle', { cx: 28 + (i % 9) * 38, cy: 24 + Math.floor(i / 9) * 36, r: 14, fill: NAMES[c][1], 'fill-opacity': .85 })));
    let x = 20;
    ['r', 'b', 'y'].forEach(c => { const w = 320 * S[c] / T; if (S[c]) { svg.append(h('s:rect', { x, y: 108, width: w, height: 26, fill: NAMES[c][1], 'fill-opacity': .8 }), label(x + w / 2, 126, fr(S[c], T), 'svgm')); } x += w; });
    svg.append(h('s:rect', { x: 20, y: 108, width: 320, height: 26, fill: 'none', stroke: 'var(--ink2)', 'stroke-width': 1.5 }), label(20, 154, '0', 'svgm'), label(340, 154, '1', 'svgm'), label(180, 154, '확률의 막대 (전체 = 1)', 'svgm'));
    svgBox.replaceChildren(svg);
    ctl.replaceChildren(...['r', 'b', 'y'].map(c => h('div', { class: 'ctl' }, slider(NAMES[c][0] + ' 사탕 (개)', 0, 6, 1, S[c], v => String(v), v => { S[c] = v; if (S.r + S.b + S.y === 0) { S[c] = 1; } draw(); use(); }))));
    read.replaceChildren(...['r', 'b', 'y'].map(c => h('span', { text: NAMES[c][0] + '이 나올 확률 ' + S[c] + '/' + T + ' = ' + fr(S[c], T) })));
    verdict.textContent = '세 확률의 합 = ' + fr(T, T) + '  ·  파인애플 맛이 나오지 않을 확률 = 1 − ' + fr(S.r, T) + ' = ' + fr(T - S.r, T);
    body.replaceChildren(h('p', { class: 'note', text: '그릇에서 사탕을 임의로 한 개 꺼내요. 사탕의 수를 바꾸며 확률이 어떻게 변하는지 보세요.' }), svgBox, ctl, read, verdict);
  }
  function drawRps() {
    const cnt = { tie: 0, win: 0, lose: 0 }; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cnt[res(i, j)]++;
    const g = h('div', { class: 'dg', style: 'grid-template-columns:repeat(4,minmax(0,1fr))' }, h('span', { class: 'hd', text: '현영＼준서' }), ...HAND.map(t => h('span', { class: 'hd', text: t })));
    for (let i = 0; i < 3; i++) { g.append(h('span', { class: 'hd', text: HAND[i] })); for (let j = 0; j < 3; j++) { const r = res(i, j), on = S.rps === 'tie' ? r === 'tie' : r !== 'tie'; g.append(h('span', { class: on ? 'on' : '', text: r === 'tie' ? '비김' : r === 'win' ? '현영 승' : '준서 승' })); } }
    const k = S.rps === 'tie' ? 3 : 6;
    body.replaceChildren(h('p', { class: 'note', text: '현영이와 준서가 가위바위보를 한 번 해요. 가능한 경우는 모두 9가지이고, 각 경우가 일어날 가능성은 같아요.' }),
      h('div', { class: 'chips' }, [['tie', '비길 때'], ['dec', '승부가 날 때']].map(([key, t]) => h('button', { type: 'button', class: 'btn sm' + (S.rps === key ? ' primary' : ''), text: t, onclick: () => { S.rps = key; draw(); use(); } }))), g,
      h('div', { class: 'read' }, h('span', { text: '비길 확률 ' + cnt.tie + '/9 = ' + fr(3, 9) }), h('span', { text: '승부가 날 확률 ' + (9 - cnt.tie) + '/9 = ' + fr(6, 9) })),
      h('div', { class: 'verdict yes', text: (S.rps === 'tie' ? '비길 확률 ' : '승부가 날 확률 ') + k + '/9 = ' + fr(k, 9) + '  ·  1 − ' + fr(9 - k, 9) + ' = ' + fr(k, 9) + ' (일어나지 않을 확률을 빼서도 구할 수 있어요)' }));
  }
  function draw() { if (S.tab === 'bag') drawBag(); else drawRps(); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['bag', '사탕 그릇'], ['rps', '가위바위보']], S.tab, k => { S.tab = k; paintTabs(); draw(); use(); })); }
  paintTabs(); draw();
  return h('div', { class: 'card widget' }, tabsBox, body);
}

/* 9. 확률로 판단하기 — 가능성이 같은지 확인 */
function wFair(use) {
  const S = { tab: 'sum', sel: 7, eq: true, cnt: Array(13).fill(0), T: 0, spin: { n: 0, k: 0 } };
  const body = h('div'), tabsBox = h('div');
  const ways = s => { let c = 0; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === s) c++; return c; };
  function drawSum() {
    const k = ways(S.sel), grid = h('div', { class: 'dg' });
    grid.append(h('span', { class: 'hd', text: '' }));
    for (let j = 1; j <= 6; j++) grid.append(h('span', { class: 'hd', text: String(j) }));
    for (let i = 1; i <= 6; i++) { grid.append(h('span', { class: 'hd', text: String(i) })); for (let j = 1; j <= 6; j++) grid.append(h('span', { class: i + j === S.sel ? 'on' : '', text: String(i + j) })); }
    const bars = h('s:svg', { viewBox: '0 0 400 150', role: 'img', 'aria-label': '눈의 합별 상대도수' }), mx = Math.max(.2, ...S.cnt.map(c => S.T ? c / S.T : 0));
    for (let s = 2; s <= 12; s++) {
      const x = 12 + (s - 2) * 35, f = S.T ? S.cnt[s] / S.T : 0, hh = 100 * f / mx;
      bars.append(h('s:rect', { x, y: 112 - hh, width: 26, height: hh, fill: s === S.sel ? 'var(--blue)' : 'var(--blue-soft)', stroke: 'var(--blue)' }), label(x + 13, 128, String(s), 'svgm'),
        h('s:circle', { cx: x + 13, cy: 112 - 100 * (ways(s) / 36) / mx, r: 3.5, fill: 'var(--green)' }));
    }
    bars.append(label(200, 146, '막대: 실험한 상대도수 · 초록 점: 계산한 확률', 'svgm'));
    body.replaceChildren(h('p', { class: 'note', text: '서로 구별되는 두 주사위 (첫째, 둘째)를 던져요. 눈의 합을 눌러 보세요.' }),
      h('div', { class: 'wtabs' }, Array.from({ length: 11 }, (_, i) => i + 2).map(s => h('button', { type: 'button', class: s === S.sel ? 'on' : '', 'aria-pressed': s === S.sel ? 'true' : 'false', text: '합 ' + s, onclick: () => { S.sel = s; draw(); use(); } }))),
      grid,
      h('div', { class: 'read' }, h('span', { class: 'hi', text: '합이 ' + S.sel + '인 경우: ' + k + '가지' }), h('span', { text: '모든 경우: 36가지' }), h('span', { class: 'hi', text: '확률 ' + k + '/36 = ' + fr(k, 36) }), h('span', { text: '"합이 11가지"라고 보면 1/11 = ' + f3(1 / 11) + ' (✗)' })),
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn sm', text: '두 주사위 100번 던지기', onclick: () => { for (let i = 0; i < 100; i++) { S.cnt[2 + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6)]++; S.T++; } draw(); use(); } }), h('button', { type: 'button', class: 'btn sm ghost', text: '처음부터', onclick: () => { S.cnt = Array(13).fill(0); S.T = 0; draw(); use(); } })),
      bars,
      h('div', { class: 'read' }, h('span', { text: '던진 횟수 ' + S.T + '번' }), h('span', { class: 'hi', text: '합 ' + S.sel + ': ' + S.cnt[S.sel] + '번 → 상대도수 ' + (S.T ? f3(S.cnt[S.sel] / S.T) : '—') }), h('span', { text: '계산한 확률 ' + f3(k / 36) })));
  }
  const FR = () => S.eq ? [.25, .25, .25, .25] : [.1, .4, .3, .2];
  const COL = ['var(--red-soft)', 'var(--blue-soft)', 'var(--gold-soft)', 'var(--green-soft)'], NM = ['빨강', '파랑', '노랑', '초록'];
  function drawSpin() {
    const f = FR(), sp = S.spin;
    body.replaceChildren(h('p', { class: 'note', text: '회전판이 4칸으로 나뉘어 있어요. 칸의 크기가 같은 경우와 다른 경우를 비교해 보세요.' }),
      h('div', { class: 'wtabs' }, [[true, '칸 크기가 같음'], [false, '칸 크기가 다름']].map(([k, t]) => h('button', { type: 'button', class: S.eq === k ? 'on' : '', 'aria-pressed': S.eq === k ? 'true' : 'false', text: t, onclick: () => { S.eq = k; S.spin = { n: 0, k: 0 }; draw(); use(); } }))),
      pieSvg(f.map((v, i) => ({ f: v, c: COL[i], t: NM[i] })), 150),
      h('div', { class: 'read' }, h('span', { text: '칸의 수로 센 비율: 빨강 1칸 ÷ 4칸 = 1/4' }), h('span', { class: 'hi', text: '실제 크기(넓이)의 비율: 빨강 = ' + f3(f[0]) })),
      h('div', { class: 'verdict ' + (S.eq ? 'yes' : 'no'), text: S.eq ? '칸의 크기가 같아서 각 칸이 나올 가능성이 같아요 → 빨강의 확률은 1/4이라고 해도 돼요.' : '칸의 크기가 달라서 각 칸이 나올 가능성이 같지 않아요 → 빨강의 확률을 1/4이라고 하면 안 돼요.' }),
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn sm', text: '회전판 100번 돌리기', onclick: () => { for (let i = 0; i < 100; i++) { sp.n++; if (Math.random() < f[0]) sp.k++; } draw(); use(); } }), h('button', { type: 'button', class: 'btn sm ghost', text: '처음부터', onclick: () => { S.spin = { n: 0, k: 0 }; draw(); use(); } })),
      h('div', { class: 'read' }, h('span', { text: '돌린 횟수 ' + sp.n + '번' }), h('span', { class: 'hi', text: '빨강 ' + sp.k + '번 → 상대도수 ' + (sp.n ? f3(sp.k / sp.n) : '—') })));
  }
  function draw() { S.tab === 'sum' ? drawSum() : drawSpin(); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['sum', '주사위 두 개의 합'], ['spin', '회전판']], S.tab, k => { S.tab = k; paintTabs(); draw(); use(); })); }
  paintTabs(); draw();
  return h('div', { class: 'card widget' }, tabsBox, body);
}

/* 10. 게임 공정성 감사관 */
function wGame(use) {
  const GAMES = {
    A: { name: 'A 부스 · 주사위 합', rule: '서로 구별되는 두 주사위를 던져요. 눈의 합이 7 이상이면 갑, 6 이하이면 을이 이겨요.', all: () => { const o = []; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) o.push({ t: String(i + j), tip: i + ',' + j, w: i + j >= 7 ? 'a' : 'b' }); return o; }, cols: 6 },
    B: { name: 'B 부스 · 카드 뽑기', rule: '1부터 10까지 적힌 카드에서 한 장을 뽑아요. 짝수이면 갑, 홀수이면 을이 이겨요.', all: () => Array.from({ length: 10 }, (_, i) => ({ t: String(i + 1), w: (i + 1) % 2 === 0 ? 'a' : 'b' })), cols: 5 },
    C: { name: 'C 부스 · 동전 2개', rule: '서로 다른 동전 2개를 던져요. 서로 같은 면이 나오면 갑, 서로 다른 면이 나오면 을이 이겨요.', all: () => [{ t: '앞앞', w: 'a' }, { t: '앞뒤', w: 'b' }, { t: '뒤앞', w: 'b' }, { t: '뒤뒤', w: 'a' }], cols: 4 }
  };
  const S = { g: 'A', judge: false, a: 0, b: 0 };
  const body = h('div'), tabsBox = h('div');
  function draw() {
    const G = GAMES[S.g], out = G.all(), N = out.length, ka = out.filter(o => o.w === 'a').length, kb = N - ka, T = S.a + S.b;
    const grid = h('div', { class: 'dg', style: 'grid-template-columns:repeat(' + G.cols + ',minmax(0,1fr))' }, out.map(o => h('span', { class: o.w === 'a' ? 'wa' : 'wb', text: o.t })));
    body.replaceChildren(h('p', { class: 'note', text: G.rule }), h('div', { class: 'chips' }, h('span', { text: '파랑 칸 = 갑이 이기는 경우' }), h('span', { style: 'border-color:var(--gold);color:var(--gold)', text: '노랑 칸 = 을이 이기는 경우' })), grid,
      h('div', { class: 'read' }, h('span', { text: '모든 경우: ' + N + '가지' }), h('span', { class: 'hi', text: '갑이 이기는 경우: ' + ka + '가지' }), h('span', { class: 'hi', text: '을이 이기는 경우: ' + kb + '가지' })),
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn sm', text: S.judge ? '판정 가리기' : '확률로 판정하기', onclick: () => { S.judge = !S.judge; draw(); use(); } })),
      S.judge ? h('div', { class: 'verdict ' + (ka === kb ? 'yes' : 'no'), text: '갑 ' + ka + '/' + N + ' = ' + fr(ka, N) + ' · 을 ' + kb + '/' + N + ' = ' + fr(kb, N) + ' → ' + (ka === kb ? '두 확률이 같아서 공정해요' : (ka > kb ? '갑이 유리해서 공정하지 않아요' : '을이 유리해서 공정하지 않아요')) }) : '',
      h('div', { class: 'row' }, ...[100, 1000].map(m => h('button', { type: 'button', class: 'btn sm', text: m + '번 해 보기', onclick: () => { for (let i = 0; i < m; i++) { if (out[Math.floor(Math.random() * N)].w === 'a') S.a++; else S.b++; } draw(); use(); } })), h('button', { type: 'button', class: 'btn sm ghost', text: '처음부터', onclick: () => { S.a = 0; S.b = 0; draw(); use(); } })),
      h('div', { class: 'read' }, h('span', { text: '해 본 횟수 ' + T + '번' }), h('span', { class: 'hi', text: '갑 ' + S.a + '번 (' + (T ? f3(S.a / T) : '—') + ')' }), h('span', { class: 'hi', text: '을 ' + S.b + '번 (' + (T ? f3(S.b / T) : '—') + ')' })));
  }
  function paintTabs() { tabsBox.replaceChildren(tabs(Object.entries(GAMES).map(([k, g]) => [k, g.name]), S.g, k => { S.g = k; S.judge = false; S.a = 0; S.b = 0; paintTabs(); draw(); use(); })); }
  paintTabs(); draw();
  return h('div', { class: 'card widget' }, tabsBox, body);
}

Object.assign(WIDGETS, { tree: wTree, prob: wProb, bag: wBag, fair: wFair, game: wGame });


