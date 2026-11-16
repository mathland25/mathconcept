/* ===== Ⅳ. 도형의 성질 — 질문·일반화·확인 문제 그림 ===== */
(() => {
  const L = Object.fromEntries(LESSONS.map(l => [l.id, l]));
  const put = (id, i, fn) => { L[id].checks[i].fig = fn; };
  const lp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const md = (p, q) => lp(p, q, .5);

  /* 공통 도형 */
  const iso = { A: [130, 15], B: [76, 135], C: [184, 135] };
  const tri = { A: [120, 18], B: [28, 140], C: [232, 140] };           // 일반 예각삼각형
  const rt = { A: [40, 20], B: [220, 130], C: [40, 130] };             // ∠C = 90°
  const rect = { A: [40, 25], B: [40, 125], C: [230, 125], D: [230, 25] };
  const rectO = Object.assign({ O: [135, 75] }, rect);
  const pg = { A: [75, 25], B: [35, 125], C: [170, 125], D: [210, 25] };
  const pgO = Object.assign({ O: md(pg.A, pg.C) }, pg);
  const rh = { A: [130, 8], B: [40, 78], C: [130, 148], D: [220, 78] };
  const rhO = Object.assign({ O: [130, 78] }, rh);
  const sq = { A: [70, 10], B: [70, 135], C: [195, 135], D: [195, 10] };
  const sqO = Object.assign({ O: [132.5, 72.5] }, sq);

  /* ----- l01 이등변삼각형 (추가 확인 문제) ----- */
  put('l01', 4, () => F({ P: iso, poly: [['A', 'B', 'C']], ang: [['B', 'C', 'A', '50°'], ['C', 'A', 'B', '50°']], txt: [['A', 'B', 'AB = 8 cm', 28]], h: 170, alt: '∠B = ∠C = 50°, AB = 8 cm인 삼각형' }));
  put('l01', 6, () => F({ P: Object.assign({ M: [130, 135] }, iso), poly: [['A', 'B', 'C']], seg: [['A', 'M', 'd']], tk: [['A', 'B'], ['A', 'C']], ang: [['A', 'B', 'M', '32°']], h: 170, alt: 'AB = AC, M은 BC의 중점, ∠BAM = 32°' }));

  /* ----- l18 직각삼각형의 합동 조건 ----- */
  const k = 14, T1 = { C: [18, 150], B: [18 + 8 * k, 150], A: [18, 150 - 6 * k] }, T2 = { F: [262, 150], E: [262 - 5 * k, 150], D: [262, 150 - 8.66 * k] };
  L.l18.pred.fig = () => F({ w: 280, h: 172, P: Object.assign({}, T1, T2), poly: [['A', 'B', 'C'], ['D', 'E', 'F']], rt: [['C', 'B', 'A'], ['F', 'E', 'D']], tk: [['A', 'B', 3], ['D', 'E', 3]], txt: [['A', 'B', '빗변 10 cm', 22], ['D', 'E', '빗변 10 cm', 22]], alt: '빗변이 10 cm로 같지만 모양이 다른 두 직각삼각형' });
  const U2 = { C: [18, 150], B: [18 + 7 * k, 150], A: [18, 150 - 7 * k * .75] }, V2 = { F: [262, 150], E: [262 - 7 * k, 150], D: [262, 150 - 7 * k * .75] };
  L.l18.gen.fig = () => F({ w: 280, h: 172, P: Object.assign({}, U2, V2), poly: [['A', 'B', 'C'], ['D', 'E', 'F']], rt: [['C', 'B', 'A'], ['F', 'E', 'D']], tk: [['A', 'B', 3], ['D', 'E', 3]], ang: [['B', 'C', 'A', ''], ['E', 'F', 'D', '']], txt: [[140, 168, '∠C = ∠F = 90°']], alt: '직각삼각형 ABC와 DEF' });
  put('l18', 0, () => F({ w: 280, h: 172, P: Object.assign({}, U2, V2), poly: [['A', 'B', 'C'], ['D', 'E', 'F']], rt: [['C', 'B', 'A'], ['F', 'E', 'D']], tk: [['A', 'B', 3], ['D', 'E', 3]], ang: [['B', 'C', 'A', '35°'], ['E', 'F', 'D', '35°']], txt: [[140, 168, 'AB = DE = 10 cm,  ∠A = ∠D = 35°']], alt: '직각삼각형 ABC, DEF에서 AB = DE, ∠A = ∠D' }));
  put('l18', 1, () => F({ w: 280, h: 172, P: Object.assign({}, U2, V2), poly: [['A', 'B', 'C'], ['D', 'E', 'F']], rt: [['C', 'B', 'A'], ['F', 'E', 'D']], tk: [['A', 'B', 3], ['D', 'E', 3], ['B', 'C', 1], ['E', 'F', 1]], txt: [['A', 'B', '13', 16], ['B', 'C', '5', 14], ['A', 'C', 'AC = 12', 22], ['D', 'F', 'DF = ?', 22]], alt: 'AB = DE = 13, BC = EF = 5인 직각삼각형' }));
  const bi = (() => { const O = [20, 100], u = [Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6)], d = 140 * Math.cos(Math.PI / 6), A = [O[0] + d * u[0], O[1] + d * u[1]], P = [160, 100], B = [A[0], 200 - A[1]]; return { O, P, A, B, X: [O[0] + 210 * u[0], O[1] + 210 * u[1]], Y: [O[0] + 210 * u[0], 200 - (O[1] + 210 * u[1])] }; })();
  put('l18', 3, () => F({ w: 240, h: 200, P: bi, fill: [[['O', 'A', 'P'], 'rgba(232,180,90,.5)'], [['O', 'B', 'P'], 'rgba(111,207,159,.4)']], raw: [seg(bi.O, bi.X, { stroke: 'var(--ink2)', 'stroke-width': 2 }), seg(bi.O, bi.Y, { stroke: 'var(--ink2)', 'stroke-width': 2 })], seg: [['O', 'P', 'd'], ['P', 'A', 'r'], ['P', 'B', 'r']], rt: [['A', 'O', 'P'], ['B', 'O', 'P']], nodot: ['X', 'Y'], alt: '∠XOY의 이등분선 OP와 P에서 두 변에 내린 수선 PA, PB' }));
  put('l18', 4, () => F({ w: 280, h: 172, P: Object.assign({}, U2, V2), poly: [['A', 'B', 'C'], ['D', 'E', 'F']], rt: [['C', 'B', 'A'], ['F', 'E', 'D']], tk: [['A', 'B', 3], ['D', 'E', 3], ['A', 'C', 2], ['D', 'F', 2]], txt: [['A', 'B', '17', 16], ['A', 'C', '8', 14], ['B', 'C', 'BC = 15', 18], ['E', 'F', 'EF = ?', 18]], alt: 'AB = DE = 17, AC = DF = 8인 직각삼각형' }));

  /* ----- l02 외심 ----- */
  const O2 = circum(tri.A, tri.B, tri.C), R2 = dist(O2, tri.A), T2o = Object.assign({ O: O2 }, tri);
  L.l02.pred.fig = () => F({ P: tri, poly: [['A', 'B', 'C']], tk: [['B', 'C', 1], ['C', 'A', 2], ['A', 'B', 3]], h: 160, txt: [[116, 172, '각 변의 중점에 같은 표시']], alt: '세 변의 중점이 표시된 삼각형 ABC' });
  L.l02.gen.fig = () => F({ P: T2o, circ: [O2[0], O2[1], R2, 'none'], poly: [['A', 'B', 'C']], seg: [['O', 'A', 'r'], ['O', 'B', 'r'], ['O', 'C', 'r']], h: 190, alt: '삼각형 ABC의 외접원과 외심 O' });
  put('l02', 0, () => F({ P: T2o, poly: [['A', 'B', 'C']], seg: [['O', 'A', 'r'], ['O', 'B', 'r'], ['O', 'C', 'r']], h: 160, alt: '외심 O가 있는 삼각형 ABC. ∠OAB = 30°, ∠OBC = 20°', ang: [['A', 'B', 'O', '30°'], ['B', 'C', 'O', '20°'], ['C', 'O', 'A', '?']] }));
  put('l02', 1, () => F({ P: T2o, poly: [['A', 'B', 'C']], seg: [['O', 'B', 'r'], ['O', 'C', 'r']], ang: [['A', 'B', 'C', '70°'], ['O', 'B', 'C', '?']], h: 160, alt: '예각삼각형 ABC의 외심 O, ∠A = 70°' }));
  const rtO = Object.assign({ O: md(rt.A, rt.B) }, rt);
  put('l02', 2, () => F({ P: rtO, circ: [rtO.O[0], rtO.O[1], dist(rtO.O, rt.A), 'none'], poly: [['A', 'B', 'C']], rt: [['C', 'B', 'A']], txt: [['A', 'C', '5 cm', 16], ['B', 'C', '12 cm', 16], ['A', 'B', '13 cm', 24]], h: 200, w: 260, alt: '∠C = 90°, AC = 5, BC = 12, AB = 13인 직각삼각형과 외접원' }));
  put('l02', 3, () => F({ P: T2o, poly: [['A', 'B', 'C']], seg: [['O', 'A', 'r'], ['O', 'B', 'r'], ['O', 'C', 'r']], txt: [['O', 'A', 'OA = 5 cm', 12], ['B', 'C', 'BC = 8 cm', 20]], h: 175, alt: '외심 O, OA = 5 cm, BC = 8 cm' }));

  /* ----- l03 내심 ----- */
  const I3 = incen(tri.A, tri.B, tri.C), r3 = dist(I3, foot(I3, tri.B, tri.C)), T3 = Object.assign({ I: I3, D: foot(I3, tri.B, tri.C), E: foot(I3, tri.C, tri.A), F: foot(I3, tri.A, tri.B) }, tri);
  L.l03.pred.fig = () => F({ P: tri, poly: [['A', 'B', 'C']], ang: [['A', 'B', 'C', ''], ['B', 'C', 'A', ''], ['C', 'A', 'B', '']], h: 160, alt: '삼각형 ABC의 세 내각' });
  L.l03.gen.fig = () => F({ P: T3, circ: [I3[0], I3[1], r3, 'rgba(232,180,90,.35)'], poly: [['A', 'B', 'C']], seg: [['I', 'D', 'r'], ['I', 'E', 'r'], ['I', 'F', 'r']], rt: [['D', 'C', 'I'], ['E', 'A', 'I'], ['F', 'B', 'I']], h: 165, alt: '삼각형 ABC의 내접원과 내심 I, 접점 D, E, F' });
  const Ic = Object.assign({ I: I3 }, tri);
  put('l03', 0, () => F({ P: Ic, poly: [['A', 'B', 'C']], seg: [['A', 'I', 'd'], ['B', 'I', 'd'], ['C', 'I', 'd']], ang: [['A', 'B', 'I', '25°'], ['B', 'I', 'C', '30°'], ['C', 'A', 'I', '?']], h: 160, alt: '내심 I, ∠IAB = 25°, ∠IBC = 30°' }));
  put('l03', 1, () => F({ P: Ic, poly: [['A', 'B', 'C']], seg: [['B', 'I', 'd'], ['C', 'I', 'd']], ang: [['B', 'A', 'C', '80°']], txt: [[116, 172, '∠BIC = ?']], h: 175, alt: '내심 I, ∠A = 80°' }));
  const Ir = (() => { const A = rt.A, B = rt.B, C = rt.C, a = dist(B, C), b = dist(C, A), c = dist(A, B), s = a + b + c, I = [(a * A[0] + b * B[0] + c * C[0]) / s, (a * A[1] + b * B[1] + c * C[1]) / s]; return { P: Object.assign({ I }, rt), r: dist(I, [I[0], C[1]]) }; })();
  put('l03', 2, () => F({ P: Ir.P, circ: [Ir.P.I[0], Ir.P.I[1], Ir.r, 'rgba(232,180,90,.35)'], poly: [['A', 'B', 'C']], rt: [['C', 'B', 'A']], txt: [['B', 'C', 'BC = 8', 16], ['A', 'C', 'AC = 15', 16], ['A', 'B', 'AB = 17', 24]], w: 260, h: 195, alt: '∠C = 90°인 직각삼각형과 내접원' }));
  put('l03', 3, () => F({ P: T3, circ: [I3[0], I3[1], r3, 'rgba(232,180,90,.35)'], poly: [['A', 'B', 'C']], seg: [['I', 'D', 'r']], rt: [['D', 'C', 'I']], txt: [['I', 'D', 'r = 3 cm', -12], [116, 172, '둘레 20 cm']], h: 180, alt: '내접원의 반지름 3 cm, 둘레 20 cm인 삼각형' }));

  /* ----- l19 평행사변형이 되는 조건 ----- */
  const qd = { A: [60, 25], B: [30, 125], C: [200, 125], D: [185, 25] };
  L.l19.pred.fig = () => F({ P: qd, poly: [['A', 'B', 'C', 'D']], tk: [['A', 'B', 1], ['D', 'C', 1], ['A', 'D', 2], ['B', 'C', 2]], h: 160, txt: [[115, 172, '마주 보는 변의 길이가 각각 같다']], alt: '마주 보는 두 쌍의 변의 길이가 각각 같은 사각형 ABCD' });
  L.l19.gen.fig = () => F({ P: pgO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], tk: [['A', 'O', 1], ['O', 'C', 1], ['B', 'O', 2], ['O', 'D', 2]], h: 160, alt: '두 대각선이 서로 이등분하는 사각형' });
  put('l19', 1, () => F({ P: pg, poly: [['A', 'B', 'C', 'D']], par: [['A', 'B'], ['D', 'C']], txt: [['A', 'B', 'AB = 7 cm', 18], ['D', 'C', 'DC = ?', 18]], h: 160, alt: 'AB ∥ DC인 사각형 ABCD' }));
  put('l19', 2, () => F({ P: pgO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], txt: [['A', 'O', '5', 12], ['O', 'C', '5', 12], ['B', 'O', '4', 12], ['O', 'D', '?', 12]], h: 160, alt: '대각선의 교점 O, AO = CO = 5, BO = 4' }));
  put('l19', 4, () => F({ P: pg, poly: [['A', 'B', 'C', 'D']], par: [['A', 'D'], ['B', 'C']], tk: [['A', 'D', 2], ['B', 'C', 2]], txt: [['A', 'B', '3x + 1', 18], ['D', 'C', '13', 18]], h: 160, alt: 'AD ∥ BC, AD = BC인 사각형 ABCD' }));

  /* ----- l20 직사각형 ----- */
  L.l20.pred.fig = () => F({ P: rect, poly: [['A', 'B', 'C', 'D']], rt: [['A', 'B', 'D'], ['B', 'A', 'C'], ['C', 'B', 'D'], ['D', 'A', 'C']], h: 150, alt: '네 각이 모두 직각인 직사각형 ABCD' });
  L.l20.gen.fig = () => F({ P: rectO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], tk: [['A', 'C', 3], ['B', 'D', 3]], rt: [['A', 'B', 'D']], h: 150, alt: '직사각형 ABCD와 두 대각선' });
  put('l20', 0, () => F({ P: rectO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], rt: [['A', 'B', 'D']], txt: [['A', 'O', 'AC = 14 cm', 0], [135, 140, 'BO = ?']], h: 160, alt: '직사각형 ABCD, AC = 14 cm' }));
  put('l20', 1, () => F({ P: rectO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], rt: [['A', 'B', 'D']], ang: [['A', 'B', 'O', '35°'], ['O', 'A', 'B', '?']], h: 160, alt: '직사각형 ABCD, ∠OAB = 35°' }));

  /* ----- l21 마름모 ----- */
  L.l21.pred.fig = () => F({ P: rh, poly: [['A', 'B', 'C', 'D']], tk: [['A', 'B', 1], ['B', 'C', 1], ['C', 'D', 1], ['D', 'A', 1]], h: 160, alt: '네 변의 길이가 모두 같은 마름모 ABCD' });
  L.l21.gen.fig = () => F({ P: rhO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], tk: [['A', 'O', 1], ['O', 'C', 1], ['B', 'O', 2], ['O', 'D', 2]], rt: [['O', 'A', 'B']], h: 160, alt: '마름모 ABCD와 두 대각선' });
  put('l21', 0, () => F({ P: rhO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], rt: [['O', 'A', 'B']], txt: [[130, 168, 'AC = 10 cm,  BD = 24 cm']], h: 175, alt: '마름모 ABCD, AC = 10, BD = 24' }));
  put('l21', 1, () => F({ P: rhO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], rt: [['O', 'A', 'B']], ang: [['A', 'O', 'B', '28°'], ['B', 'A', 'O', '?']], h: 160, alt: '마름모 ABCD, ∠OAB = 28°' }));
  put('l21', 2, () => F({ P: rhO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], txt: [['A', 'O', '4x − 1', 14], ['O', 'C', '3x + 2', 14]], h: 160, alt: '마름모 ABCD, AO = 4x − 1, CO = 3x + 2' }));

  /* ----- l05 정사각형 ----- */
  L.l05.pred.fig = () => F({ P: sq, poly: [['A', 'B', 'C', 'D']], tk: [['A', 'B', 1], ['B', 'C', 1], ['C', 'D', 1], ['D', 'A', 1]], rt: [['A', 'B', 'D'], ['B', 'A', 'C'], ['C', 'B', 'D'], ['D', 'A', 'C']], h: 150, alt: '정사각형 ABCD' });
  L.l05.gen.fig = () => F({ P: sqO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], tk: [['A', 'C', 3], ['B', 'D', 3]], rt: [['O', 'A', 'B']], h: 150, alt: '정사각형 ABCD와 두 대각선' });
  put('l05', 0, () => F({ P: sqO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], rt: [['O', 'A', 'B']], txt: [['A', 'C', 'AC = 10 cm', 0]], h: 160, alt: '정사각형 ABCD, AC = 10 cm' }));
  put('l05', 1, () => F({ P: sqO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], ang: [['A', 'B', 'O', '?']], rt: [['O', 'A', 'B']], h: 160, alt: '정사각형 ABCD, ∠OAB = ?' }));

  /* ----- l22 지붕 기둥 ----- */
  const rf = Object.assign({ M: [130, 135] }, iso);
  L.l22.pred.fig = () => F({ P: rf, poly: [['A', 'B', 'C']], seg: [['A', 'M', 'd']], tk: [['A', 'B', 1], ['A', 'C', 1], ['B', 'M', 2], ['M', 'C', 2]], h: 160, txt: [[130, 172, 'AB = AC,  BM = CM']], alt: 'AB = AC인 지붕과 밑변의 중점 M까지의 기둥 AM' });
  L.l22.gen.fig = () => F({ P: rf, fill: [[['A', 'B', 'M'], 'rgba(232,180,90,.5)'], [['A', 'M', 'C'], 'rgba(111,207,159,.4)']], poly: [['A', 'B', 'C']], seg: [['A', 'M', 'r']], tk: [['A', 'B', 1], ['A', 'C', 1], ['B', 'M', 2], ['M', 'C', 2]], h: 160, alt: '△ABM과 △ACM' });
  put('l22', 0, () => F({ P: iso, poly: [['A', 'B', 'C']], tk: [['A', 'B'], ['A', 'C']], ang: [['C', 'A', 'B', '50°']], h: 160, alt: 'AB = AC, ∠A = 50°' }));
  put('l22', 1, () => F({ P: rf, poly: [['A', 'B', 'C']], seg: [['A', 'M', 'd']], tk: [['A', 'B', 1], ['A', 'C', 1], ['B', 'M', 2], ['M', 'C', 2]], ang: [['A', 'B', 'M', '32°']], h: 160, alt: 'AB = AC, BD = CD, ∠BAD = 32°' }));

  /* ----- l23 직각삼각형 모양 공터 ----- */
  L.l23.pred.fig = () => F({ P: rt, poly: [['A', 'B', 'C']], rt: [['C', 'B', 'A']], txt: [['A', 'C', '6 m', 16], ['B', 'C', '8 m', 16], ['A', 'B', '10 m', 22]], h: 165, w: 260, alt: '∠C = 90°, AC = 6 m, BC = 8 m, AB = 10 m인 직각삼각형 공터' });
  L.l23.gen.fig = () => F({ P: Object.assign({ O: md(rt.A, rt.B) }, rt), circ: [md(rt.A, rt.B)[0], md(rt.A, rt.B)[1], dist(rt.A, rt.B) / 2, 'none'], poly: [['A', 'B', 'C']], rt: [['C', 'B', 'A']], seg: [['O', 'C', 'r']], h: 200, w: 260, alt: '직각삼각형 ABC와 외접원, 외심 O는 빗변의 중점' });
  put('l23', 0, () => F({ P: rt, poly: [['A', 'B', 'C']], rt: [['C', 'B', 'A']], txt: [['A', 'B', 'AB = 20 m', 24]], h: 165, w: 260, alt: '∠C = 90°, 빗변 AB = 20 m' }));

  /* ----- l24 창틀 ----- */
  const kt = { A: [30, 80], B: [90, 140], C: [230, 80], D: [90, 20] }, ktO = Object.assign({ O: [90, 80] }, kt);
  L.l24.pred.fig = () => F({ P: ktO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], rt: [['O', 'A', 'B']], h: 160, txt: [[130, 172, 'AC ⊥ BD']], alt: '두 대각선이 수직으로 만나는 사각형 창틀 ABCD' });
  L.l24.gen.fig = () => F({ P: ktO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], rt: [['O', 'A', 'B']], tk: [['B', 'O', 2], ['O', 'D', 2]], h: 160, alt: '대각선이 수직이지만 AO ≠ CO인 사각형' });
  put('l24', 1, () => F({ P: ktO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], rt: [['O', 'A', 'B']], tk: [['A', 'O', 1], ['O', 'C', 1]], h: 160, txt: [[130, 172, 'AC ⊥ BD,  AO = CO']], alt: 'AC ⊥ BD, AO = CO인 사각형' }));
  put('l24', 2, () => F({ P: rhO, poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C', 'r'], ['B', 'D', 'r']], rt: [['O', 'A', 'B']], txt: [[130, 168, 'AC = 12 cm,  BD = 16 cm']], h: 175, alt: '마름모 ABCD, AC = 12, BD = 16' }));
})();

