/* ===== Ⅵ 5·6차시: 확률의 계산 (교복 스티커 · 음악 수행평가) ===== */
function wPcalc(use) {
  const S = { tab: 'uni', uni: { A: false, B: true, C: true }, pA: true, pB: true };
  const UNI = { A: 4, B: 12, C: 9 }, TOTAL = 25, COL = { A: 'var(--ink2)', B: 'var(--blue)', C: 'var(--gold)' };
  const tabsBox = h('div'), body = h('div');
  function drawUni() {
    const sel = ['A', 'B', 'C'].filter(k => S.uni[k]);
    const dots = h('div', { class: 'chips' });
    ['A', 'B', 'C'].forEach(k => { for (let i = 0; i < UNI[k]; i++) { const on = S.uni[k]; dots.append(h('span', { style: 'min-width:30px;text-align:center;border-color:' + COL[k] + ';' + (on ? 'background:' + COL[k] + ';color:var(--paper);font-weight:700' : 'opacity:.55'), text: k })); } });
    const cnt = sel.reduce((s, k) => s + UNI[k], 0);
    const parts = sel.map(k => fr(UNI[k], TOTAL));
    let msg;
    if (!sel.length) msg = '안을 눌러 골라 보세요.';
    else if (sel.length === 1) msg = sel[0] + '안을 선택한 학생이 뽑힐 확률 = ' + UNI[sel[0]] + '/' + TOTAL + ' = ' + fr(UNI[sel[0]], TOTAL);
    else msg = sel.join(' 또는 ') + '안: ' + sel.map(k => UNI[k] + '/' + TOTAL).join(' + ') + ' = ' + cnt + '/' + TOTAL + (fr(cnt, TOTAL) !== cnt + '/' + TOTAL ? ' = ' + fr(cnt, TOTAL) : '');
    body.replaceChildren(h('p', { class: 'note', text: '학생 25명이 교복 디자인 A, B, C안 중 하나씩 스티커를 붙였어요. 한 명을 임의로 뽑아요. (A안 4명, B안 12명, C안 9명)' }),
      h('div', { class: 'chips' }, ['A', 'B', 'C'].map(k => h('button', { type: 'button', class: 'btn sm' + (S.uni[k] ? ' primary' : ''), text: k + '안' + (S.uni[k] ? ' ✓' : ''), onclick: () => { S.uni[k] = !S.uni[k]; draw(); use(); } }))),
      dots,
      h('div', { class: 'read' }, ['A', 'B', 'C'].map(k => h('span', { text: k + '안 ' + UNI[k] + '/' + TOTAL + (UNI[k] % 1 === 0 && fr(UNI[k], TOTAL) !== UNI[k] + '/' + TOTAL ? ' = ' + fr(UNI[k], TOTAL) : '') }))),
      h('div', { class: 'verdict yes', text: msg }),
      h('p', { class: 'note', text: '세 안은 동시에 선택될 수 없으니 (한 명은 한 가지만 선택) 확률을 그대로 더할 수 있어요.' }));
  }
  function drawMusic() {
    const R = 7, C = 8, pr = r => r >= 4, gc = c => c >= 3;
    const g = h('div', { style: 'display:grid;grid-template-columns:repeat(' + C + ',minmax(0,1fr));gap:3px;margin:8px 0' });
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const a = S.pA && pr(r), b = S.pB && gc(c);
      const st = a && b ? 'background:var(--blue);border-color:var(--blue)' : a ? 'background:var(--blue-soft);border-color:var(--blue)' : b ? 'background:var(--gold-soft);border-color:var(--gold)' : '';
      g.append(h('span', { style: 'border:1.5px solid var(--line);border-radius:5px;height:20px;' + st }));
    }
    const nA = S.pA ? 3 : 7, nB = S.pB ? 5 : 8;
    const both = (S.pA ? 3 : 0) * (S.pB ? 5 : 0);
    let msg = '판소리(3/7)와 가곡(5/8)을 모두 눌러 보세요.';
    if (S.pA && S.pB) msg = '동시에 일어날 확률 = 3/7 × 5/8 = 15/56   (모든 경우 7 × 8 = 56가지 중 3 × 5 = 15가지)';
    else if (S.pA) msg = '듣기에서 판소리: 3/7';
    else if (S.pB) msg = '가창에서 가곡: 5/8';
    body.replaceChildren(h('p', { class: 'note', text: '듣기 7곡(아리아 4, 판소리 3)과 가창 8곡(민요 3, 가곡 5)에서 각각 한 곡씩 제비를 뽑아요. 세로 줄은 듣기 곡, 가로 줄은 가창 곡이에요.' }),
      h('div', { class: 'chips' }, [['pA', '듣기: 판소리'], ['pB', '가창: 가곡']].map(([k, t]) => h('button', { type: 'button', class: 'btn sm' + (S[k] ? ' primary' : ''), text: t + (S[k] ? ' ✓' : ''), onclick: () => { S[k] = !S[k]; draw(); use(); } }))),
      g,
      h('div', { class: 'read' }, h('span', { text: '판소리 3/7' }), h('span', { text: '가곡 5/8' }), h('span', { text: '진한 칸 ' + (S.pA && S.pB ? 15 : 0) + '개 / 56개' })),
      h('div', { class: 'verdict yes', text: msg }));
  }
  function draw() { if (S.tab === 'uni') drawUni(); else drawMusic(); }
  function paintTabs() { tabsBox.replaceChildren(tabs([['uni', '또는 (더하기)'], ['music', '동시에 (곱하기)']], S.tab, k => { S.tab = k; paintTabs(); draw(); use(); })); }
  paintTabs(); draw();
  return h('div', { class: 'card widget' }, tabsBox, body);
}
Object.assign(WIDGETS, { pcalc: wPcalc });

