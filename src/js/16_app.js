/* ===== 앱 ===== */
const KEY = 'gaenyeom-v1', TKEY = 'gaenyeom-teacher-v1';
const STEPS = ['질문', '탐색', '일반화', '정리', '확인', '내 말로'];
/* 구글 폼 자동 제출 설정 (비어 있으면 제출 코드 방식만 사용) */
const CFGKEY = 'gn-cfg-v1', okG = u => typeof u === 'string' && /^https:\/\/docs\.google\.com\//.test(u);
/* 선생님별 설정: 주소의 ?c=… 로 들어오면 이 기기에 저장해 두고, 폼·시트·비밀번호를 그 선생님 것으로 써요. (구글 문서 주소만 허용) */
const CFG = (() => { try { const m = /[?&]c=([^&#]+)/.exec(location.search); let raw = m ? m[1] : null; if (raw) localStorage.setItem(CFGKEY, raw); else raw = localStorage.getItem(CFGKEY); if (!raw) return null;
  const j = JSON.parse(atob(raw.replace(/-/g, '+').replace(/_/g, '/'))); return j && okG(j.fa) && /^entry\.\d+$/.test(j.fe || '') ? j : null; } catch (e) { return null; } })();
const CFGNM = (() => { try { return CFG && CFG.nm ? decodeURIComponent(CFG.nm) : ''; } catch (e) { return ''; } })();
const FORM = CFG ? { action: CFG.fa, entry: CFG.fe } : { action: 'https://docs.google.com/forms/d/e/1FAIpQLSfAkQAEwjacgFf4YnDSVAsvu6KTlMedfOyeA4vDSFv3-7luBQ/formResponse', entry: 'entry.1381249599' };
const OPS_URL = 'https://claude.ai/artifact/CKBVf3g7ThJ4NUVjWu5oST';
let DB = { v: 1, cur: null, profiles: [] }, TD = { v: 1, students: {} };
let view = 'home', vparam = null, curStep = 0, tsel = null, tcls = '전체', toastT = null;
const $ = (s, r = document) => r.querySelector(s);
const pct = v => Math.round(v * 100);
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
/* 학생 식별: 이름+반이 같으면 같은 학생으로 보고 기록을 합친다 */
const skey = r => String(r.name || '').replace(/\s+/g, '').toLowerCase() + '|' + String(r.cls || '').replace(/\s+/g, '').replace(/[학년반]/g, '').replace(/[-–—.]/g, '-').toLowerCase();
function mergeLs(oldR, newR) {
  const out = {}, ids = new Set([...Object.keys(oldR.ls || {}), ...Object.keys(newR.ls || {})]), newer = newR.at >= oldR.at ? newR : oldR;
  ids.forEach(id => { const x = oldR.ls[id], y = newR.ls[id]; if (!x || !y) { out[id] = x || y; return; }
    if ((x.d || 0) !== (y.d || 0)) out[id] = x.d ? x : y; else if ((x.s || 0) !== (y.s || 0)) out[id] = (x.s || 0) > (y.s || 0) ? x : y; else out[id] = newer.ls[id]; });
  return out;
}
function addRep(rep) {
  rep.name = String(rep.name).replace(/\s+/g, ''); rep.cls = String(rep.cls || '').replace(/\s+/g, '');
  let k = skey(rep); const mv = TD.moves && TD.moves[k]; if (mv && TD.students[mv]) { k = mv; rep.cls = TD.students[mv].rep.cls; }
  const ex = TD.students[k];
  if (!ex) { TD.students[k] = { rep, fb: '' }; return 'add'; }
  const nl = mergeLs(ex.rep, rep), newer = rep.at >= ex.rep.at ? rep : ex.rep, merged = { ...newer, ls: nl, at: Math.max(ex.rep.at, rep.at) };
  if (JSON.stringify(nl) === JSON.stringify(ex.rep.ls) && merged.at === ex.rep.at) return null;
  if (JSON.stringify(nl) === JSON.stringify(ex.rep.ls)) { ex.rep.at = merged.at; return null; }
  ex.rep = merged; return 'upd';
}
function moveStudent(key, cls) {
  const x = TD.students[key]; cls = String(cls || '').replace(/\s+/g, ''); if (!x || !cls) return null;
  const rep = { ...x.rep, cls }, nk = skey(rep); if (nk === key) return key;
  delete TD.students[key]; (TD.moves = TD.moves || {})[key] = nk;
  const ex = TD.students[nk]; if (!ex) TD.students[nk] = { rep, fb: x.fb }; else { addRep(rep); if (x.fb && !ex.fb) ex.fb = x.fb; }
  tsave(); return nk;
}
function rekeyTD() { const old = TD.students; TD.students = {}; Object.values(old).forEach(x => { const k = skey(x.rep), ex = TD.students[k]; if (!ex) TD.students[k] = x; else { addRep(x.rep); if (x.fb && !TD.students[k].fb) TD.students[k].fb = x.fb; } }); }
function load() { try { const o = JSON.parse(localStorage.getItem(KEY)); if (o && o.profiles) DB = o; } catch (e) { } try { const o = JSON.parse(localStorage.getItem(TKEY)); if (o && o.students) TD = o; } catch (e) { } rekeyTD(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { } }
function tsave() { try { localStorage.setItem(TKEY, JSON.stringify(TD)); } catch (e) { } }
const me = () => DB.profiles.find(p => p.id === DB.cur) || null;
const lno = l => l.lab || (['Ⅳ', 'Ⅴ', 'Ⅵ'][l.unit] + '-' + (l.wsLabel || l.ws) + '차시' + (l.sub ? ' ' + l.sub : ''));
const lessonOf = id => LESSONS.find(l => l.id === id);
function lst(p, id) { return p.ls[id] || (p.ls[id] = { step: 0, pred: null, task: {}, gen: {}, chk: {}, refl: ['', ''], done: false, upd: 0, use: 0 }); }
const status = (p, l) => { const s = p.ls[l.id]; if (!s || (!s.step && s.pred == null)) return 'new'; return s.done ? 'done' : 'doing'; };
const firstScore = (l, s) => { const n = l.checks.length; let c = 0; l.checks.forEach((_, i) => { const x = s.chk[i]; if (x && x.first) c++; }); return [c, n]; };
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2400); }
function copyText(text, ok) { try { navigator.clipboard.writeText(text).then(() => toast(ok || '복사했어요'), () => toast('복사하지 못했어요. 직접 선택해 복사해 주세요.')); } catch (e) { toast('복사하지 못했어요. 직접 선택해 복사해 주세요.'); } }
const turtle = (n = 34) => h('span', { html: '<svg viewBox="0 0 40 40" width="' + n + '" height="' + n + '" aria-hidden="true"><ellipse cx="20" cy="22" rx="14" ry="10" fill="var(--green)"/><path d="M12 22l4-6h8l4 6-4 6h-8z" fill="none" stroke="var(--paper)" stroke-width="1.6"/><circle cx="35" cy="19" r="4.5" fill="var(--green)"/><circle cx="36.4" cy="17.8" r="1" fill="var(--paper)"/><rect x="9" y="29" width="5" height="6" rx="2" fill="var(--green)"/><rect x="24" y="29" width="5" height="6" rx="2" fill="var(--green)"/><path d="M6 24l-4 3" stroke="var(--green)" stroke-width="3" stroke-linecap="round"/></svg>' });
const brand = () => h('div', { class: 'brand' }, turtle(), h('span', { text: '개념 탐구 노트' }));

/* ---------- 자동 연동 ---------- */
const Sync = {
  db: null, uid: null, edit: false, state: 'init', msg: '', last: null, timer: null,
  async init() {
    try {
      if (!window.claude || !claude.use) { this.state = 'off'; return; }
      this.db = await claude.use('db'); const user = await claude.use('user');
      this.uid = user ? await user.id() : null; this.edit = user ? await user.canEdit() : false;
      if (!this.db || !this.uid) { this.state = 'off'; this.db = null; return; }
      this.state = 'on'; if (this.edit) this.listen();
    } catch (e) { this.state = 'off'; } finally { refreshSync(); }
  },
  listen() {
    try {
      this.db.collection('reports').onSnapshot(snap => {
        let changed = false;
        snap.docs.forEach(d => { const ps = (d.data() || {}).profiles || {};
          Object.keys(ps).forEach(pid => { const rep = ps[pid]; if (!rep || rep.v !== 2 || !rep.id || !rep.name || typeof rep.ls !== 'object' || (rep.app && rep.app !== 'concept')) return;
            if (addRep(rep)) changed = true; }); });
        this.last = Date.now(); if (changed) tsave(); refreshSync();
      }, e => { this.state = 'err'; this.msg = '학생 기록을 읽지 못했어요 (' + (e && e.code) + ')'; refreshSync(); });
    } catch (e) { }
  },
  push(p, now) { if (this.state !== 'on' || !this.db) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.send(p.id), now ? 0 : 1500); },
  async send(pid) {
    const p = DB.profiles.find(x => x.id === pid); if (!p || !this.db) return;
    try {
      const ref = this.db.doc('reports/' + this.uid), cur = await ref.get();
      const data = cur.exists ? JSON.parse(JSON.stringify(cur.data())) : { profiles: {} }; data.profiles = data.profiles || {};
      data.profiles[p.id] = makeReport(p); await ref.set(data); this.last = Date.now(); this.state = 'on'; this.msg = '';
    } catch (e) { this.state = 'err'; this.msg = e && e.code === 'invalid_argument' ? '이 계정은 보기 전용이라 보낼 수 없어요. 선생님께 "참여자" 권한을 요청하세요.' : '보내지 못했어요. 잠시 뒤 다시 시도해 주세요.'; }
    refreshSync();
  },
  label() {
    if (this.state === 'on') return this.edit ? '학생 기록 자동 수신 중 — 학생이 학습하면 여기에 바로 나타나요' : (this.last ? '자동 연동 중 · 마지막 전송 ' + new Date(this.last).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '자동 연동 중');
    if (this.state === 'err') return this.msg; if (this.state === 'init') return '연동 확인 중…';
    return view === 'teacher' ? '자동 연동 꺼짐 — 학생이 보낸 제출 코드를 아래에 붙여 넣으면 돼요 (여러 줄 한꺼번에 가능)' : '이 패드에 자동 저장돼요. 차시를 끝내면 아래에서 "제출 코드"를 만들어 선생님께 보내 주세요.';
  }
};
const syncBar = () => h('div', { class: 'syncline ' + Sync.state }, h('span', { class: 'dot' }), h('span', { text: Sync.label() }));
function refreshSync() { if (view === 'teacher' && !tsel) { const a = document.activeElement; if (a && a.tagName === 'TEXTAREA' && a.value) return; render(); } else if (view === 'home' || view === 'welcome') { const b = $('#syncslot'); if (b) b.replaceChildren(syncBar()); } }

/* ---------- 보고서 / 코드 ---------- */
function makeReport(p) {
  const ls = {};
  Object.keys(p.ls).forEach(id => { const l = lessonOf(id), s = p.ls[id]; if (!l || !l.checks) return;
    if (!s.step && s.pred == null) return; const [c, n] = firstScore(l, s);
    ls[id] = { s: s.step, d: s.done ? 1 : 0, c: [c, n], p: s.pred != null ? l.pred.opts[s.pred] : '', r: s.refl, u: s.upd }; });
  return { v: 2, app: 'concept', id: p.id, name: p.name, cls: p.cls || '', at: Date.now(), day: today(), ls };
}
const b64u = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = str => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/')), b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; };
async function packReport(p) {
  const bytes = new TextEncoder().encode(JSON.stringify(makeReport(p)));
  if (typeof CompressionStream !== 'undefined') { try { const cs = new CompressionStream('deflate-raw'), w = cs.writable.getWriter(); w.write(bytes); w.close(); return 'GN2z.' + b64u(new Uint8Array(await new Response(cs.readable).arrayBuffer())); } catch (e) { } }
  return 'GN2.' + b64u(bytes);
}
async function unpackReport(code) {
  const m = /^GN2(z?)\.([A-Za-z0-9_-]+)$/.exec(code.trim()); if (!m) throw new Error('형식');
  let bytes = unb64u(m[2]);
  if (m[1] === 'z') { const ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter(); w.write(bytes); w.close(); bytes = new Uint8Array(await new Response(ds.readable).arrayBuffer()); }
  const rep = JSON.parse(new TextDecoder().decode(bytes)); if (!rep || rep.v !== 2 || !rep.id || !rep.name || typeof rep.ls !== 'object') throw new Error('내용'); if (rep.app && rep.app !== 'concept') throw new Error('다른 앱'); return rep;
}

/* ---------- 라우터 ---------- */
/* 응답 시트 CSV 게시 주소 (교사용 화면 자동 가져오기). 비어 있으면 붙여넣기만 사용 */
const SHEET_CSV = CFG ? (okG(CFG.sc) ? CFG.sc : '') : 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyOJTJaDyblGIOZwX4RYLuB9S9DDGTJkszb-Kz7tVMbLt_6-SDL8XY2_kAk3oPToZRu6sZVddAVKz4/pub?gid=93813440&single=true&output=csv';
let sheetBusy = false, sheetAt = 0;
let sheetInfo = null, sheetTimer = null;
async function importCodes(text) {
  const codes = text.match(/GN2z?\.[A-Za-z0-9_-]+/g) || []; let add = 0, upd = 0, bad = 0, other = 0, latest = 0;
  for (const c of codes) { try { const rep = await unpackReport(c); latest = Math.max(latest, rep.at || 0); const r = addRep(rep); if (r === 'add') add++; else if (r === 'upd') upd++; } catch (e) { if (e && e.message === '다른 앱') other++; else bad++; } }   // 다른 앱(연산 등) 코드는 읽지 못함으로 세지 않고 건너뛴다
  if (add || upd) tsave(); return { n: codes.length - other, add, upd, bad, other, latest };
}
const hm = t => new Date(t).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
function sheetNote() { if (!SHEET_CSV) return ''; if (!sheetInfo) return '시트 확인 중…'; if (sheetInfo.err) return '시트를 읽지 못했어요 (' + sheetInfo.err + ') · ' + hm(sheetInfo.at) + ' 시도'; return hm(sheetInfo.at) + ' 확인 · 시트에 제출 ' + sheetInfo.n + '건' + (sheetInfo.latest ? ' · 가장 최근 제출 ' + hm(sheetInfo.latest) : '') + ' (구글 시트 반영은 몇 분 늦을 수 있어요)'; }
async function sheetPull(manual) {
  if (!SHEET_CSV || sheetBusy) return; sheetBusy = true;
  if (!sheetTimer) sheetTimer = setInterval(() => { if (view === 'teacher' && tOpen() && !tsel && !document.hidden) sheetPull(false); }, 60000);
  try { const r = await fetch(SHEET_CSV + (SHEET_CSV.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status);
    const res = await importCodes(await r.text()); sheetAt = Date.now(); sheetInfo = { at: sheetAt, n: res.n, latest: res.latest };
    const a = document.activeElement, typing = a && a.tagName === 'TEXTAREA' && a.value;
    if (view === 'teacher' && !tsel && !typing && (res.add || res.upd || manual)) render(); else { const sn = $('#sheetnote'); if (sn) sn.textContent = sheetNote(); }
    if (manual) toast('시트에서 ' + res.n + '건 확인 · 추가 ' + res.add + '명 · 갱신 ' + res.upd + '명');
  } catch (e) { sheetInfo = { at: Date.now(), err: String((e && e.message) || e).slice(0, 40) }; if (view === 'teacher' && !tsel) { const sn = $('#sheetnote'); if (sn) sn.textContent = sheetNote(); else render(); } if (manual) toast('시트를 읽지 못했어요. 게시 설정을 확인해 주세요'); }
  sheetBusy = false;
}
async function formSend(p, quiet) {
  if (!FORM.action || !FORM.entry) return false;
  try {
    const code = await packReport(p), body = new URLSearchParams(); body.append(FORM.entry, code);
    await fetch(FORM.action, { method: 'POST', mode: 'no-cors', body });
    p.sent = Date.now(); save(); if (!quiet) toast('선생님께 제출했어요'); return true;
  } catch (e) { if (!quiet) toast('제출하지 못했어요. 인터넷을 확인하고 다시 눌러 주세요'); return false; }
}
function go(v, param) { try { Board.clear(); } catch (e) { } if (v === 'lesson' && isLocked(param.id)) { toast('선생님이 아직 열지 않은 차시예요'); v = 'home'; } view = v; vparam = param; if (v === 'lesson') curStep = Math.min(param.step, STEPS.length - 1); render(); window.scrollTo(0, 0); }
function render() {
  const app = $('#app'); app.replaceChildren();
  const p = me();
  if (view === 'teacher') return app.append(viewTeacher());
  if (view === 'setup') return app.append(viewSetup());
  if (!p) view = 'welcome';
  if (view === 'welcome') return app.append(viewWelcome());
  if (view === 'lesson' && vparam) return app.append(viewLesson(p, lessonOf(vparam.id)));
  view = 'home'; app.append(viewHome(p));
}

/* ---------- 시작 / 학생 선택 ---------- */
function viewWelcome() {
  const name = h('input', { class: 'in', id: 'nm', placeholder: '이름', maxlength: '12', autocomplete: 'off' });
  const cls = h('input', { class: 'in', id: 'cl', placeholder: '예: 2-3', maxlength: '6', autocomplete: 'off' });
  const go1 = () => { const nm = name.value.trim(); if (!nm) { toast('이름을 입력해 주세요'); name.focus(); return; }
    const p = { id: 'p' + Date.now().toString(36) + Math.floor(Math.random() * 900 + 100), name: nm, cls: cls.value.trim(), ls: {}, created: today() };
    DB.profiles.push(p); DB.cur = p.id; save(); Sync.push(p); go('home'); };
  const list = DB.profiles.length ? h('section', { class: 'card' }, h('h2', { class: 'h2', text: '이어서 하기' }), h('div', { class: 'pcards' }, DB.profiles.map(p =>
    h('button', { class: 'btn pcard', onclick: () => { DB.cur = p.id; save(); go('home'); } }, h('b', { text: p.name }), h('span', { class: 'chip gray', text: p.cls || '반 없음' })))), null) : null;
  return h('div', { class: 'welcome' }, h('div', { class: 'top' }, brand()),
    h('section', { class: 'card' }, h('h1', { class: 'h1', text: '중학교 수학 개념 탐구' }), h('p', { class: 'note', text: '개념을 직접 만져 보고, 내 말로 정리하는 노트예요.' }),
      h('div', { class: 'fieldrow' }, h('div', {}, h('label', { class: 'l', for: 'nm', text: '이름' }), name), h('div', {}, h('label', { class: 'l', for: 'cl', text: '반' }), cls)),
      h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', text: '시작하기', onclick: go1 }))),
    list, h('div', { id: 'syncslot' }, syncBar()));
}

/* ---------- 홈 ---------- */
let GRADE = (() => { try { const g = +localStorage.getItem('gn-grade'); return g === 3 ? 3 : 2; } catch (e) { return 2; } })();
function setGrade(g) { GRADE = g; try { localStorage.setItem('gn-grade', String(g)); } catch (e) { } render(); }
function viewHome(p) {
  const gl = LESSONS.filter(l => gradeOf(l) === GRADE);
  const ready = gl.filter(l => l.ready), done = ready.filter(l => status(p, l) === 'done').length;
  const next = ready.find(l => status(p, l) !== 'done');
  return h('div', {}, h('header', { class: 'top' }, brand(), h('div', { class: 'row', style: 'margin:0' },
    h('span', { class: 'chip', text: p.name + (p.cls ? ' · ' + p.cls : '') }), h('button', { class: 'btn sm ghost', onclick: () => { DB.cur = null; save(); go('welcome'); }, text: '학생 바꾸기' }))),
    h('section', { class: 'card hero' }, h('div', {}, h('h1', { class: 'h1', text: '오늘은 어떤 개념을 탐구해 볼까요?' }),
      h('p', { class: 'note', text: '열린 차시 ' + ready.length + '개 중 ' + done + '개를 끝냈어요. 나머지 차시는 선생님이 순서대로 열어 줄 거예요.' }),
      h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': pct(done / ready.length), 'aria-valuemin': '0', 'aria-valuemax': '100' }, h('i', { style: 'width:' + pct(done / ready.length) + '%' }))),
      next ? h('button', { class: 'btn primary', onclick: () => go('lesson', { id: next.id, step: lst(p, next.id).step }), text: (status(p, next) === 'new' ? '시작: ' : '이어서: ') + lno(next) + ' ' + next.title }) : null),
    h('div', { class: 'gtabs', role: 'tablist', 'aria-label': '학년' }, GRADES.map(([g, t]) => h('button', { type: 'button', role: 'tab', 'aria-selected': g === GRADE ? 'true' : 'false', class: 'gtab' + (g === GRADE ? ' on' : ''), text: t + ' 수학', onclick: () => setGrade(g) }))),
    h('div', { class: 'units' }, UNITS.filter(u => u.grade === GRADE).map(u => h('section', { class: 'unit' }, h('h2', { text: u.name }), h('p', { class: 'sub', text: u.sub }),
      h('div', { class: 'lgrid' }, LESSONS.filter(l => l.unit === u.id).map(l => lcard(p, l)))))),
    h('div', { id: 'syncslot' }, syncBar()),
    submitCard(p),
    h('div', { class: 'row' }, h('a', { class: 'btn ghost', href: OPS_URL, target: '_blank', rel: 'noopener', text: '연산 연습하러 가기 ↗' })));
}
function submitCard(p) {
  const out = h('textarea', { class: 'in', rows: '3', readonly: true, hidden: true, 'aria-label': '제출 코드' });
  const copy = h('button', { class: 'btn', type: 'button', hidden: true, text: '코드 복사', onclick: () => { out.select(); copyText(out.value, '복사했어요. 선생님께 보내 주세요'); } });
  const mk = h('button', { class: 'btn', type: 'button', text: '제출 코드 만들기', onclick: async () => { mk.disabled = true; try { out.value = await packReport(p); out.hidden = false; copy.hidden = false; out.select(); } catch (e) { toast('코드를 만들지 못했어요'); } mk.disabled = false; } });
  if (FORM.action && FORM.entry) {
    const last = h('p', { class: 'note', style: 'margin:6px 0 0', text: p.sent ? '마지막 제출: ' + new Date(p.sent).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '아직 제출하지 않았어요.' });
    const send = h('button', { class: 'btn primary', type: 'button', text: '선생님께 제출하기', onclick: async () => { send.disabled = true; const ok = await formSend(p); if (ok) last.textContent = '방금 제출했어요. (차시를 끝낼 때도 자동으로 제출돼요)'; send.disabled = false; } });
    const det = h('details', { style: 'margin-top:10px' }, h('summary', { class: 'note', text: '제출이 안 될 때: 코드로 직접 보내기' }), h('div', { class: 'row', style: 'margin:8px 0 0' }, mk, copy), out);
    return h('section', { class: 'card', style: 'margin-top:14px' }, h('h2', { class: 'h2', text: '선생님께 진도 보내기' }), h('p', { class: 'note', text: '버튼을 한 번 누르면 이름과 풀이 기록이 선생님께 전달돼요. 차시를 끝낼 때도 자동으로 보내요.' }), h('div', { class: 'row', style: 'margin:0' }, send), last, det);
  }
  return h('section', { class: 'card', style: 'margin-top:14px' }, h('h2', { class: 'h2', text: '선생님께 진도 보내기' }), h('p', { class: 'note', text: (Sync.state === 'on' ? '자동으로 전달되고 있어요. 안 보이면 코드를 만들어 직접 보내도 돼요.' : '차시를 끝낼 때마다 코드를 만들어 선생님께 보내 주세요. 이름과 풀이 기록이 담겨요. 새로 만들면 이전 기록까지 모두 들어 있어요.') }), h('div', { class: 'row', style: 'margin:0' }, mk, copy), out);
}
/* ---------- 차시 열람 설정(구글 시트 탭) ---------- */
/* 시트의 '열람 설정' 탭을 웹에 게시한 CSV 주소. 비어 있으면 모든 차시가 열려 있어요. 읽지 못해도 모두 열려요. */
const LOCK_CSV = CFG && okG(CFG.lc) ? CFG.lc : '';
let LOCKS = new Set(), lockAt = 0;
try { const o = JSON.parse(sessionStorage.getItem('gn-locks')); if (o && Array.isArray(o.ids)) { LOCKS = new Set(o.ids); lockAt = o.at || 0; } } catch (e) { }
const isLocked = id => LOCKS.has(id);
async function pullLocks(force) {
  if (!LOCK_CSV || (!force && Date.now() - lockAt < 45000)) return; lockAt = Date.now();
  try {
    const r = await fetch(LOCK_CSV + (LOCK_CSV.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return;
    const ids = []; (await r.text()).split(/\r?\n/).forEach(ln => { const m = /(?:^|[",\s])(l\d\d)(?:[",\s]|$)/.exec(ln); if (m && /잠/.test(ln) && !/열림/.test(ln)) ids.push(m[1]); });
    const changed = ids.slice().sort().join() !== [...LOCKS].sort().join(); LOCKS = new Set(ids);
    try { sessionStorage.setItem('gn-locks', JSON.stringify({ ids, at: Date.now() })); } catch (e) { }
    if (changed && view === 'home') render();
  } catch (e) { }
}

function lcard(p, l) {
  const st = status(p, l), s = p.ls[l.id];
  const lk = l.ready && isLocked(l.id), chip = lk ? h('span', { class: 'chip gray', text: '🔒 아직 열리지 않았어요' }) : !l.ready ? h('span', { class: 'chip gray', text: '준비 중' }) : st === 'done' ? h('span', { class: 'chip green', text: '완료 · 확인 ' + firstScore(l, s)[0] + '/' + l.checks.length }) : st === 'doing' ? h('span', { class: 'chip gold', text: '진행 중 ' + (Math.min(s.step, 5) + 1) + '/6' }) : h('span', { class: 'chip', text: '시작하기' });
  return h('button', { class: 'lcard' + (l.ready && !lk ? '' : ' soon') + (st === 'done' ? ' done' : ''), disabled: !l.ready || lk, onclick: () => go('lesson', { id: l.id, step: lst(p, l.id).step }) },
    h('div', { class: 'row', style: 'margin:0;justify-content:space-between' }, h('span', { class: 'no', text: lno(l) + ' · ' + l.lens }), chip), h('div', { class: 't', text: l.title }), h('div', { class: 'q', text: l.q }), l.el ? h('div', { class: 'note', style: 'margin:6px 0 0;font-size:12px', text: (l.elp || '시험 범위') + ' · ' + l.el + (l.src ? ' (' + l.src + ')' : '') }) : null);
}

/* ---------- 차시 ---------- */
function viewLesson(p, l) {
  const s = lst(p, l.id);
  const stepBox = h('div'), stepper = h('div', { class: 'stepper', role: 'tablist' });
  const touch = () => { s.upd = Date.now(); save(); Sync.push(p); };
  const unlocked = i => i <= s.step;
  const advance = to => { if (to > s.step) s.step = to; touch(); curStep = to; paintAll(); window.scrollTo(0, 0); };
  function paintStepper() { stepper.replaceChildren(...STEPS.map((n, i) => h('button', { type: 'button', role: 'tab', class: (i === curStep ? 'on ' : '') + (i < s.step || s.done ? 'ok' : ''), disabled: !unlocked(i), 'aria-selected': i === curStep ? 'true' : 'false', onclick: () => { curStep = i; paintAll(); }, text: (i + 1) + ' ' + n }))); }
  function paintAll() { try { Board.clear(); } catch (e) { } paintStepper(); stepBox.replaceChildren([stepQ, stepExplore, stepGen, stepSum, stepCheck, stepRefl][curStep](p, l, s, advance, touch, () => go('home'))); }
  paintAll();
  return h('div', {}, h('header', { class: 'top' }, h('div', { class: 'row', style: 'margin:0' }, h('button', { class: 'btn sm ghost', onclick: () => go('home'), text: '← 차시 목록' }), h('b', { text: lno(l) + ' · ' + l.title })), brand()), stepper, stepBox);
}
const nextBtn = (label, enabled, fn) => h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', disabled: !enabled, text: label, onclick: fn }));

function stepQ(p, l, s, advance, touch) {
  const box = h('div'); const optsEl = h('div', { class: 'opts' }); const nb = h('div');
  function paint() {
    optsEl.replaceChildren(...l.pred.opts.map((o, i) => h('button', { type: 'button', class: 'opt' + (s.pred === i ? ' sel' : ''), text: o, onclick: () => { s.pred = i; touch(); paint(); } })));
    nb.replaceChildren(nextBtn('탐색하러 가기', s.pred != null, () => advance(Math.max(s.step, 1))));
  }
  paint();
  return h('section', { class: 'card' }, h('span', { class: 'chip', text: '핵심 개념 · ' + l.lens }), h('div', { class: 'qbig', text: l.q }),
    h('p', { class: 'note', text: '먼저 예상해 봐요. 맞아도 틀려도 괜찮아요. 탐색한 뒤에 예상과 비교해 볼 거예요.' }), h('p', { style: 'font-weight:600', text: l.pred.ask }), l.pred.fig ? l.pred.fig() : null, optsEl, nb);
}

function stepExplore(p, l, s, advance, touch) {
  const need = 3; const taskBox = h('div'), nb = h('div');
  const widget = WIDGETS[l.widget](() => { s.use = (s.use || 0) + 1; if (s.use <= need) paintNb(); if (s.use === need || s.use % 10 === 0) touch(); });
  const allOk = () => l.tasks.every((_, i) => s.task[i]);
  function paintNb() { nb.replaceChildren(...[nextBtn('일반화로 가기', allOk() && (s.use || 0) >= need, () => advance(Math.max(s.step, 2))), (s.use || 0) < need ? h('p', { class: 'note', text: '도형이나 슬라이더를 몇 번 움직여 보면 열려요.' }) : null].filter(Boolean)); }
  function paintTasks() {
    taskBox.replaceChildren(...l.tasks.map((t, i) => {
      const ok = s.task[i], wrong = s.taskWrong && s.taskWrong[i];
      return h('div', { class: 'task' }, h('p', { style: 'font-weight:600;margin:0 0 8px', text: (i + 1) + '. ' + t.ask }),
        h('div', { class: 'opts' }, t.opts.map((o, j) => h('button', { type: 'button', class: 'opt' + (ok && j === t.ans ? ' good' : wrong === j ? ' bad' : ''), disabled: !!ok,
          text: o, onclick: () => { if (j === t.ans) { s.task[i] = true; if (s.taskWrong) delete s.taskWrong[i]; } else { s.taskWrong = Object.assign(s.taskWrong || {}, { [i]: j }); } touch(); paintTasks(); paintNb(); } }))),
        ok ? h('div', { class: 'fb good', text: t.why }) : wrong != null ? h('div', { class: 'fb hint', text: '다시 도형을 움직여서 확인해 보세요.' }) : null);
    }));
  }
  paintTasks(); paintNb();
  return h('div', { class: 'cols' }, widget, h('section', { class: 'card' }, h('h2', { class: 'h2', text: '움직이며 발견하기' }), taskBox, nb));
}

function stepGen(p, l, s, advance, touch) {
  const list = h('div'), nb = h('div');
  const allOk = () => l.gen.items.every((_, i) => s.gen[i]);
  /* 보기 순서를 학생·문항마다 다르게 섞어요(첫 칸만 누르고 넘어가는 것을 막기 위해). 같은 학생은 항상 같은 순서. */
  const ord = (it, i) => { let x = 7; for (const c of l.id + ':' + i + ':' + (p.id || p.name || '')) x = (Math.imul(x, 31) + c.charCodeAt(0)) >>> 0;
    const a = it.opts.map((_, j) => j); for (let k = a.length - 1; k > 0; k--) { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; const r = x % (k + 1); [a[k], a[r]] = [a[r], a[k]]; } return a; };
  function paint() {
    list.replaceChildren(...l.gen.items.map((it, i) => {
      const ok = s.gen[i], wr = s.genWrong && s.genWrong[i];
      const blank = h('span', { class: 'blank' }, ok ? h('button', { type: 'button', class: 'good', disabled: true, text: it.opts[it.ans] }) : ord(it, i).map(j => h('button', { type: 'button', class: wr === j ? 'bad' : '', text: it.opts[j],
        onclick: () => { if (j === it.ans) { s.gen[i] = true; if (s.genWrong) delete s.genWrong[i]; } else s.genWrong = Object.assign(s.genWrong || {}, { [i]: j }); touch(); paint(); } })));
      return h('div', { class: 'genitem gen' }, it.pre, blank, it.post, wr != null && !ok ? h('div', { class: 'fb hint', text: '탐색에서 직접 확인한 것을 떠올려 보세요. (위의 "탐색" 단계로 돌아가도 돼요)' }) : null);
    }));
    nb.replaceChildren(nextBtn('정리하러 가기', allOk(), () => advance(Math.max(s.step, 3))));
  }
  paint();
  return h('section', { class: 'card' }, h('h2', { class: 'h2', text: '발견을 문장으로' }), h('p', { class: 'note', text: l.gen.lead }), l.gen.fig ? l.gen.fig() : null, list, nb);
}

function stepSum(p, l, s, advance) {
  const pr = s.pred != null ? l.pred.opts[s.pred] : null;
  return h('div', {}, h('section', { class: 'card sumcard' }, h('h2', { class: 'h2', text: '정리: ' + l.sum.title }),
    l.sum.defs.map(([a, b]) => h('div', { class: 'def' }, h('b', { text: a }), ' — ' + b)),
    h('ul', { class: 'points' }, l.sum.points.map(t => h('li', { text: t }))),
    h('div', { class: 'fb hint', text: '주의: ' + l.sum.note })),
    pr ? h('section', { class: 'card', style: 'margin-top:12px' }, h('p', { class: 'note', style: 'margin:0', text: '처음 내 예상' }), h('p', { style: 'margin:2px 0 0;font-weight:600', text: '"' + pr + '"' }), h('p', { class: 'note', text: '정리한 내용과 비교하면 어땠나요? 마지막 단계에서 적어 볼 수 있어요.' })) : null,
    nextBtn('확인 문제 풀기', true, () => advance(Math.max(s.step, 4))));
}


/* ---------- 풀이 쓰기(필기) ---------- */
const PW = 600, PH = 440, PCOL = { k: '#1f2937', b: '#1d5fa0', r: '#c0392b', w: '#ffffff' };
function inkPad(x) {
  x.ink = x.ink || []; const st = { col: 'k', era: false };
  const cv = h('canvas', { class: 'padcv', width: PW * 2, height: PH * 2, 'aria-label': '풀이 쓰는 칸' }), g = cv.getContext('2d');
  function stroke(s) {
    g.save(); g.scale(2, 2); g.lineCap = 'round'; g.lineJoin = 'round';
    g.globalCompositeOperation = s.e ? 'destination-out' : 'source-over'; g.strokeStyle = PCOL[s.c] || PCOL.k; g.lineWidth = s.e ? 22 : 2.6;
    const p = s.p; g.beginPath(); g.moveTo(p[0], p[1]); if (p.length === 2) g.lineTo(p[0] + .1, p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]);
    if (s.c === 'w' && !s.e) { g.strokeStyle = 'rgba(60,70,80,.45)'; g.lineWidth = 5.4; g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 2.6; }
    g.stroke(); g.restore();
  }
  const redraw = () => { g.clearRect(0, 0, PW * 2, PH * 2); x.ink.forEach(stroke); };
  let cur = null;
  const pos = e => { const r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * PW), Math.round((e.clientY - r.top) / r.height * PH)]; };
  cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) { } cur = { c: st.col, e: st.era, p: pos(e) }; x.ink.push(cur); stroke(cur); });
  cv.addEventListener('pointermove', e => { if (!cur) return; e.preventDefault(); const q = pos(e), p = cur.p, n = p.length; if (Math.abs(q[0] - p[n - 2]) + Math.abs(q[1] - p[n - 1]) < 2) return; p.push(q[0], q[1]); redraw(); });
  const end = () => { if (cur) { cur = null; save(); } };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end); cv.addEventListener('pointerleave', end);
  const tools = h('div', { class: 'padtools' });
  const btn = (txt, cls, fn) => h('button', { type: 'button', class: 'pt ' + (cls || ''), text: txt, onclick: fn });
  function bar() {
    tools.replaceChildren(
      ...['k', 'b', 'r', 'w'].map(c => h('button', { type: 'button', class: 'pt dot' + (!st.era && st.col === c ? ' on' : ''), style: 'background:' + PCOL[c], 'aria-label': { k: '검정', b: '파랑', r: '빨강', w: '하양' }[c] + ' 펜', onclick: () => { st.col = c; st.era = false; bar(); } })),
      btn('지우개', st.era ? 'on' : '', () => { st.era = !st.era; bar(); }),
      btn('되돌리기', '', () => { x.ink.pop(); redraw(); save(); }),
      btn('모두 지우기', '', () => { if (!x.ink.length || confirm('쓴 풀이를 모두 지울까요?')) { x.ink.length = 0; redraw(); save(); } }));
  }
  bar(); redraw();
  return h('div', { class: 'pad' }, h('div', { class: 'padhd', text: '✏️ 풀이 쓰기 (손가락이나 펜으로 써 보세요)' }), h('div', { class: 'padwrap' }, cv), tools);
}
function normNum(str) { const t = String(str).replace(/[−–]/g, '-').replace(/,/g, '').replace(/[（]/g, '(').replace(/[）]/g, ')').trim(); const rm = /^(-?)(\d+)\.(\d*)\((\d+)\)$/.exec(t); if (rm) { const np = rm[3], rp = rm[4], whole = parseInt(rm[2], 10), fr = (parseInt(np + rp, 10) - (np ? parseInt(np, 10) : 0)) / (Math.pow(10, np.length) * (Math.pow(10, rp.length) - 1)); return (rm[1] ? -1 : 1) * (whole + fr); } const fm = /^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/.exec(t); if (fm && parseFloat(fm[2]) !== 0) return parseFloat(fm[1]) / parseFloat(fm[2]); const m = /^-?\d+(\.\d+)?/.exec(t); return m ? parseFloat(m[0]) : NaN; }
/* 보기 순서를 학생·문항마다 섞어요(같은 학생은 항상 같은 순서) */
function shufOrd(n, seed) { let x = 7; for (const c of seed) x = (Math.imul(x, 31) + c.charCodeAt(0)) >>> 0; const a = Array.from({ length: n }, (_, j) => j); for (let k = n - 1; k > 0; k--) { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; const r = x % (k + 1); [a[k], a[r]] = [a[r], a[k]]; } return a; }
function stepCheck(p, l, s, advance, touch) {
  const list = h('div', { class: 'checks' }), nb = h('div');
  const allOk = () => l.checks.every((_, i) => s.chk[i] && s.chk[i].ok);
  function paint() {
    list.replaceChildren(...l.checks.map((c, i) => {
      const x = s.chk[i] || (s.chk[i] = { tries: 0, ok: false, first: false, show: false });
      let ctrl;
      if (c.opts) ctrl = h('div', { class: 'opts' }, shufOrd(c.opts.length, l.id + ':c' + i + ':' + (p.id || p.name || '')).map(j => h('button', { type: 'button', class: 'opt' + (x.ok && j === c.ans ? ' good' : x.pick === j && !x.ok ? ' bad' : ''), disabled: x.ok || x.show, text: c.opts[j],
        onclick: () => submit(i, j) })));
      else { const inp = h('input', { class: 'in', id: 'chk' + i, inputmode: 'decimal', autocomplete: 'off', 'aria-label': '답', value: x.val || '', disabled: x.ok || x.show });
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(i, inp.value); });
        const keys = h('div', { class: 'keys' }, ['/', '.', '(', ')'].map(k => h('button', { type: 'button', class: 'btn sm', 'aria-label': k + ' 입력', disabled: x.ok || x.show, text: k, onclick: () => { const a = inp.selectionStart == null ? inp.value.length : inp.selectionStart, e2 = inp.selectionEnd == null ? a : inp.selectionEnd; inp.value = inp.value.slice(0, a) + k + inp.value.slice(e2); inp.focus(); try { inp.setSelectionRange(a + 1, a + 1); } catch (e) {} } })));
        const nt = typeof c.ans === 'number' && Math.abs(Math.round(c.ans * 1e6) / 1e6 - c.ans) > 1e-9;
        ctrl = h('div', null, h('div', { class: 'ans' }, inp, c.unit ? h('span', { text: c.unit }) : null, h('button', { class: 'btn', type: 'button', disabled: x.ok || x.show, text: '확인', onclick: () => submit(i, inp.value) })), x.ok || x.show ? null : keys, nt && !x.ok && !x.show ? h('div', { class: 'note', text: '분수는 1/3처럼, 순환소수는 0.(3)이나 0.1(6)처럼 괄호로 써요.' }) : null); }
      return h('div', { class: 'card chk' }, h('div', { class: 'qt', text: (i + 1) + '. ' + c.q }), c.fig ? c.fig() : null, inkPad(x), ctrl,
        x.ok ? h('div', { class: 'fb good', text: '정답! ' + c.why }) : x.show ? h('div', { class: 'fb hint', text: '정답 확인: ' + c.why }) : x.tries ? h('div', { class: 'fb bad', text: '아쉬워요. 힌트: ' + c.hint }) : null,
        !x.ok && !x.show && x.tries >= 2 ? h('button', { class: 'btn sm', type: 'button', text: '정답 보기', onclick: () => { x.show = true; x.ok = true; touch(); paint(); } }) : null);
    }));
    nb.replaceChildren(nextBtn('내 말로 정리하러 가기', allOk(), () => advance(Math.max(s.step, 5))));
  }
  function submit(i, v) {
    const c = l.checks[i], x = s.chk[i]; if (x.ok) return;
    let good; if (c.opts) { good = v === c.ans; x.pick = v; } else { x.val = String(v); const n = normNum(v); if (isNaN(n)) { toast('숫자로 답을 써 주세요'); return; } good = Math.abs(n - c.ans) < (c.tol || (Math.abs(Math.round(c.ans * 1e6) / 1e6 - c.ans) > 1e-9 ? 6e-3 : 1e-9)); }
    x.tries++; if (good) { x.ok = true; if (x.tries === 1) x.first = true; } touch(); paint();
  }
  paint();
  const [fc] = firstScore(l, s);
  return h('div', {}, h('section', { class: 'card' }, h('h2', { class: 'h2', text: '확인 문제' }), h('p', { class: 'note', text: '풀면서 막히면 힌트가 나와요. 두 번 틀리면 정답을 볼 수 있어요.' })), h('div', { style: 'height:12px' }), list, nb);
}

function stepRefl(p, l, s, advance, touch, home) {
  const nb = h('div'), box = h('div');
  const okLen = () => (s.refl[0] || '').trim().length >= 10;
  function paintNb() {
    if (s.done) { const [c, n] = firstScore(l, s); nb.replaceChildren(h('div', { class: 'card done-box', style: 'margin-top:12px' }, h('div', { class: 'stamp', text: '○' }), h('div', {}, h('b', { text: lno(l) + '를 끝냈어요!' }), h('p', { class: 'note', style: 'margin:2px 0 0', text: '확인 문제 첫 시도 ' + c + '/' + n + (Sync.state === 'on' ? ' · 선생님께 자동으로 전달돼요.' : (FORM.action ? ' · 선생님께 자동으로 제출했어요. (홈 화면에서 다시 제출할 수 있어요)' : ' · 홈 화면 아래에서 제출 코드를 만들어 보내 주세요.')) })), h('button', { class: 'btn primary', onclick: home, text: '차시 목록으로' }))); return; }
    nb.replaceChildren(...[nextBtn('이 차시 끝내기', okLen(), () => { s.done = true; touch(); Sync.push(p, true); formSend(p, true); paintNb(); }), okLen() ? null : h('p', { class: 'note', text: '첫 번째 질문에 10자 이상 써 주세요.' })].filter(Boolean));
  }
  box.append(...l.refl.map((q, i) => { const ta = h('textarea', { class: 'in', id: 'refl' + i, placeholder: i === 0 ? '여기에 내 말로 써 보세요' : '', 'aria-label': q }); ta.value = s.refl[i] || '';
    ta.addEventListener('input', () => { s.refl[i] = ta.value; s.upd = Date.now(); save(); Sync.push(p); if (i === 0) paintNb(); });
    return h('div', { class: 'card', style: i ? 'margin-top:12px' : '' }, h('label', { class: 'l', for: 'refl' + i, style: 'font-size:1rem;color:var(--ink)', text: (l.rlab ? l.rlab[i] : i === 0 ? '내 말로 설명하기' : '남은 궁금증') + ' — ' + q }), ta); }));
  if (l.self) {
    const k = l.refl.length, cur = () => { const a = (s.refl[k] || '').padEnd(l.self.length, '-').split(''); return a; };
    const selBox = h('div', { class: 'card', style: 'margin-top:12px' }, h('b', { text: '자기평가 (○ 잘함 · △ 보통 · × 더 연습)' }));
    const paintSel = () => { const a = cur(); selBox.replaceChildren(h('b', { text: '자기평가 (○ 잘함 · △ 보통 · × 더 연습)' }), ...l.self.map((t, j) => h('div', { style: 'margin-top:10px' }, h('div', { text: (j + 1) + '. ' + t }),
      h('div', { class: 'row', style: 'gap:8px;margin:6px 0 0' }, ['○', '△', '×'].map(m => h('button', { type: 'button', class: 'btn sm' + (a[j] === m ? ' primary' : ''), text: m, 'aria-label': t + ' ' + m, onclick: () => { const b = cur(); b[j] = m; s.refl[k] = b.join(''); s.upd = Date.now(); save(); Sync.push(p); paintSel(); } })))))); };
    paintSel(); box.append(selBox);
  }
  paintNb();
  return h('div', {}, box, nb);
}

/* ---------- 교사용 ---------- */
function analyze(rep) {
  const rows = LESSONS.filter(l => l.ready).map(l => { const r = rep.ls[l.id]; return { l, r }; });
  const done = rows.filter(x => x.r && x.r.d).length;
  const tot = rows.reduce((a, x) => a + (x.r ? x.r.c[1] : 0), 0), ok = rows.reduce((a, x) => a + (x.r ? x.r.c[0] : 0), 0);
  const weak = rows.filter(x => x.r && x.r.d && x.r.c[1] && x.r.c[0] / x.r.c[1] < 0.6);
  const stuck = rows.filter(x => x.r && !x.r.d && x.r.s >= 4);
  return { rows, done, tot, ok, weak, stuck };
}
function draftFeedback(rep) {
  const a = analyze(rep), L = [];
  L.push(rep.name + ' 학생, 지금까지 ' + a.done + '개 차시를 마쳤어요.' + (a.tot ? ' 확인 문제는 첫 시도에서 ' + pct(a.ok / a.tot) + '를 맞혔어요.' : ''));
  if (a.weak.length) L.push(a.weak.map(x => '「' + x.l.title + '」').join(', ') + '은(는) 첫 시도 정답률이 낮아요. 정리 단계를 한 번 더 읽고 확인 문제를 다시 풀어 봐요.');
  if (a.stuck.length) L.push(a.stuck.map(x => '「' + x.l.title + '」').join(', ') + '을(를) 거의 다 했는데 마무리하지 못했어요. 내 말로 정리하는 단계까지 이어 가 봐요.');
  const conf = a.rows.filter(x => x.r && x.r.r && x.r.r[1] && !/^\s*(없음|없어요|없습니다)\s*$/.test(x.r.r[1]));
  if (conf.length) L.push('남은 궁금증으로 적은 내용(' + conf.map(x => lno(x.l)).join(', ') + ')은 수업에서 함께 이야기해 봐요.');
  L.push('(여기에 개인별 칭찬이나 다음 목표를 한 줄 적어 주세요.)');
  return L.join(' ');
}
function elTable(list) {
  const els = LESSONS.filter(l => l.ready && l.el);
  if (!els.length || !list.length) return null;
  return h('section', { class: 'card', style: 'margin-top:12px' }, h('h2', { class: 'h2', text: '평가 요소별 현황 (2회고사 범위)' }),
    h('p', { class: 'note', text: '평가 요소는 임시 표시예요. 평가계획이 정해지면 요소 이름만 바꾸면 돼요. 정답률은 차시를 마친 학생의 확인 문제 첫 시도 기준이에요.' }),
    h('div', { class: 'tscroll' }, h('table', { class: 'mx' }, h('thead', {}, h('tr', {}, ['평가 요소', '차시', '완료', '첫 시도 정답률'].map(t => h('th', { text: t })))),
      h('tbody', {}, els.map(l => { let d = 0, ok = 0, n = 0; list.forEach(a => { const x = a.rows.find(y => y.l.id === l.id); if (x && x.r && x.r.d) { d++; ok += x.r.c[0]; n += x.r.c[1]; } });
        const rate = n ? ok / n : null;
        return h('tr', {}, h('td', { text: l.el }), h('td', { text: lno(l) }), h('td', { text: d + '/' + list.length }), h('td', {}, rate == null ? '–' : h('span', { class: 'cell ' + (rate < .6 ? 'p' : 'd'), text: pct(rate) + '%' }))); })))));
}
/* 교사용 화면 잠금 (화면 가림막 수준: 비밀번호는 암호화된 값으로만 들어 있음) */
const TPW = CFG && /^[0-9a-f]{64}$/.test(CFG.tp || '') ? CFG.tp : '77aaf6696fe83c2a93b1bffa6dba83d81830efc2949294c59129d245102b3f9f';
function sha256hex(str) {
  const w = new TextEncoder().encode(str), rr = (x, n) => (x >>> n) | (x << (32 - n)), K = [], Hh = [];
  for (let c = 2, n = 0; n < 64; c++) { let p = true; for (let d = 2; d * d <= c; d++) if (c % d === 0) { p = false; break; } if (p) { if (n < 8) Hh[n] = (Math.pow(c, 1 / 2) % 1 * 4294967296) | 0; K[n++] = (Math.pow(c, 1 / 3) % 1 * 4294967296) | 0; } }
  const bl = w.length * 8, len = ((w.length + 9 + 63) >> 6) << 6, m = new Uint8Array(len); m.set(w); m[w.length] = 0x80;
  const dv = new DataView(m.buffer); dv.setUint32(len - 4, bl >>> 0); dv.setUint32(len - 8, Math.floor(bl / 4294967296));
  for (let o = 0; o < len; o += 64) { const W = new Array(64); for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) { const s0 = rr(W[i - 15], 7) ^ rr(W[i - 15], 18) ^ (W[i - 15] >>> 3), s1 = rr(W[i - 2], 17) ^ rr(W[i - 2], 19) ^ (W[i - 2] >>> 10); W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0; }
    let [a, b, c, d, e, f, g, hh] = Hh;
    for (let i = 0; i < 64; i++) { const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25), ch = (e & f) ^ (~e & g), t1 = (hh + S1 + ch + K[i] + W[i]) | 0, S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) | 0; hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0; }
    Hh[0] = (Hh[0] + a) | 0; Hh[1] = (Hh[1] + b) | 0; Hh[2] = (Hh[2] + c) | 0; Hh[3] = (Hh[3] + d) | 0; Hh[4] = (Hh[4] + e) | 0; Hh[5] = (Hh[5] + f) | 0; Hh[6] = (Hh[6] + g) | 0; Hh[7] = (Hh[7] + hh) | 0; }
  return Hh.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}
const tOpen = () => { try { return sessionStorage.getItem('gn-t-ok') === TPW; } catch (e) { return false; } };
function viewLock() {
  const pw = h('input', { class: 'in', type: 'password', id: 't-pw', placeholder: '비밀번호', autocomplete: 'off', 'aria-label': '교사용 비밀번호' }), msg = h('p', { class: 'note', style: 'color:var(--red);min-height:1.2em;margin:6px 0 0' });
  const go2 = () => { if (sha256hex('mathconcept:' + pw.value) === TPW) { try { sessionStorage.setItem('gn-t-ok', TPW); } catch (e) { } render(); } else { msg.textContent = '비밀번호가 맞지 않아요'; pw.value = ''; } };
  pw.addEventListener('keydown', e => { if (e.key === 'Enter') go2(); });
  return h('div', {}, h('header', { class: 'top' }, h('div', { class: 'row', style: 'margin:0' }, h('b', { text: '교사용' })), brand()),
    h('section', { class: 'card', style: 'margin-top:12px' }, h('h2', { class: 'h2', text: '교사용 화면' }), h('p', { class: 'note', text: '선생님만 들어갈 수 있어요. 비밀번호를 입력해 주세요.' }), h('div', { class: 'row' }, pw, h('button', { class: 'btn primary', type: 'button', text: '열기', onclick: go2 })), msg,
      h('div', { class: 'row' }, h('button', { class: 'btn sm ghost', type: 'button', text: '← 학생 화면', onclick: () => { location.hash = ''; go(DB.cur ? 'home' : 'welcome'); } }))));
}
/* ---------- 선생님별 설정 만들기 (#setup) ---------- */
function viewSetup() {
  const inp = (id, ph, t) => h('input', { class: 'in', id, placeholder: ph, type: t || 'text', autocomplete: 'off', style: 'width:100%' });
  const nm = inp('s-nm', '선생님 이름 (선택, 예: 김수학)'), fl = inp('s-fl', '① 구글 폼의 "미리 채워진 링크"'), sc = inp('s-sc', '② 응답 시트를 "웹에 게시"한 CSV 주소'), lc = inp('s-lc', '③ (선택) "열람 설정" 탭의 CSV 주소'), pw = inp('s-pw', '④ 교사용 비밀번호', 'password');
  const out = h('div'), msg = h('p', { class: 'note', style: 'color:var(--red);min-height:1.2em;margin:6px 0 0' });
  const b64 = o => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  function make() {
    msg.textContent = ''; out.replaceChildren();
    const m = /forms\/d\/e\/([\w-]+)\/viewform/.exec(fl.value), en = /(entry\.\d+)=/.exec(fl.value);
    if (!m || !en) return void (msg.textContent = '① 미리 채워진 링크가 맞는지 확인해 주세요. (…/viewform?usp=pp_url&entry.123456=… 모양)');
    const scv = sc.value.trim(), lcv = lc.value.trim();
    if (!/^https:\/\/docs\.google\.com\/spreadsheets\/.*output=csv/.test(scv)) return void (msg.textContent = '② 응답 시트 CSV 주소가 맞는지 확인해 주세요. (…output=csv 로 끝나는 주소)');
    if (lcv && !/^https:\/\/docs\.google\.com\/spreadsheets\/.*output=csv/.test(lcv)) return void (msg.textContent = '③ 열람 설정 CSV 주소가 맞는지 확인해 주세요. 없으면 비워 두세요.');
    if (pw.value.length < 4) return void (msg.textContent = '④ 비밀번호는 4자 이상으로 정해 주세요.');
    const base = { fa: 'https://docs.google.com/forms/d/e/' + m[1] + '/formResponse', fe: en[1], nm: encodeURIComponent(nm.value.trim().slice(0, 12)) };
    if (lcv) base.lc = lcv;
    const base0 = location.origin + location.pathname, stu = base0 + '?c=' + b64(base), tea = base0 + '?c=' + b64(Object.assign({ sc: scv, tp: sha256hex('mathconcept:' + pw.value) }, base)) + '#teacher';
    const cp = (t, v) => { const ta = h('textarea', { class: 'lnk', rows: '4', style: 'width:100%;margin-top:6px;font-size:12px;word-break:break-all', 'aria-label': t }); ta.value = v; ta.readOnly = true; return h('div', { class: 'card', style: 'margin-top:10px' }, h('b', { text: t }), ta, h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', text: '복사', onclick: () => copyText(v, '복사했어요') }))); };
    out.append(cp('학생용 링크 (학생들에게 나눠 주세요)', stu), cp('교사용 링크 (선생님만 쓰세요 — 학생에게 주지 마세요)', tea),
      h('p', { class: 'note', text: '교사용 링크를 선생님 컴퓨터에서 한 번 열고 비밀번호를 입력하면 결과를 볼 수 있어요. 학생용 링크에는 시트 주소와 비밀번호가 들어 있지 않아요. 먼저 학생 이름 "테스트"로 제출해 보고 응답 시트에 한 줄이 생기는지 확인해 보세요.' }));
  }
  const st = CFG ? '이 기기는 ' + (CFGNM ? CFGNM + ' 선생님' : '사용자') + ' 설정을 쓰고 있어요.' : '이 기기는 기본 설정을 쓰고 있어요.';
  const step = (t, ...c) => h('details', { style: 'margin-top:8px' }, h('summary', { style: 'font-weight:600', text: t }), h('div', { class: 'note', style: 'margin:6px 0 0 4px' }, ...c));
  return h('div', {}, h('header', { class: 'top' }, h('div', { class: 'row', style: 'margin:0' }, h('b', { text: '선생님 전용 링크 만들기' })), brand()),
    h('section', { class: 'card', style: 'margin-top:12px' }, h('h2', { class: 'h2', text: '내 반만의 링크 만들기' }), h('p', { class: 'note', text: '내 구글 폼과 시트를 연결한 링크를 만들어요. 학생 기록이 내 시트에만 들어오고, 다른 선생님 반과 섞이지 않아요. 처음 한 번만 하면 돼요. (' + st + ')' }),
      step('준비 1. 구글 폼 만들기', '새 폼을 만들고 질문을 1개만 넣어요. 질문 유형은 "장문형(단락)", 제목은 아무거나 괜찮아요. 오른쪽 위 ⋮ → "미리 채워진 링크 가져오기" → 질문 칸에 test라고 쓰고 "링크 가져오기" → 링크 복사. 그 링크를 아래 ①에 붙여넣어요.'),
      step('준비 2. 응답 시트 게시하기', '폼의 "응답" 탭 → "스프레드시트에 연결" → 만들어진 시트에서 파일 → 공유 → 웹에 게시 → 응답 시트 탭, 형식은 "쉼표로 구분된 값(.csv)" → 게시 → 주소를 복사해 ②에 붙여넣어요. 이 주소는 선생님만 알고 있어야 해요.'),
      step('준비 3. (선택) 차시 열람 설정', '같은 시트에 "열람 설정" 탭을 만들고(차시 번호와 잠금 표시) 같은 방법으로 CSV 주소를 게시하면 ③에 넣어요. 필요 없으면 비워 두세요.'),
      h('div', { style: 'display:grid;gap:8px;margin-top:12px' }, nm, fl, sc, lc, pw), msg, h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', text: '링크 만들기', onclick: make }), h('button', { class: 'btn sm ghost', type: 'button', text: '이 기기 설정 초기화', onclick: () => { try { localStorage.removeItem(CFGKEY); } catch (e) { } toast('기본 설정으로 돌렸어요'); setTimeout(() => location.href = location.pathname + '#setup', 300); setTimeout(() => location.reload(), 350); } }), h('button', { class: 'btn sm ghost', type: 'button', text: '← 돌아가기', onclick: () => { location.hash = ''; go(DB.cur ? 'home' : 'welcome'); } })), out));
}
function viewTeacher() {
  if (!tOpen()) return viewLock();
  const rec = tsel && TD.students[tsel];
  const wrap = h('div', {}, h('header', { class: 'top' }, h('div', { class: 'row', style: 'margin:0' }, h('button', { class: 'btn sm ghost', onclick: () => { if (rec) { tsel = null; render(); } else go(DB.cur ? 'home' : 'welcome'); }, text: rec ? '← 학급 목록' : '← 학생 화면' }), h('b', { text: rec ? rec.rep.name + ' 학생' : '교사용 · 학급 진도' })), brand()));
  wrap.append(syncBar());
  if (SHEET_CSV && !rec) wrap.append(h('div', { class: 'row' }, h('button', { class: 'btn sm', type: 'button', text: '시트에서 새로고침', onclick: () => sheetPull(true) }), h('span', { class: 'note', id: 'sheetnote', style: 'margin:0', text: sheetNote() })));
  if (rec) { wrap.append(...teacherDetail(rec)); return wrap; }
  const rows = Object.keys(TD.students).map(k => ({ key: k, rep: TD.students[k].rep, a: analyze(TD.students[k].rep) })).sort((a, b) => ((a.rep.cls ? 0 : 1) - (b.rep.cls ? 0 : 1)) || (a.rep.cls || '').localeCompare(b.rep.cls || '', 'ko', { numeric: true }) || a.rep.name.localeCompare(b.rep.name, 'ko'));
  const ready = LESSONS.filter(l => l.ready);
  const ta = h('textarea', { class: 'in', id: 't-in', rows: '3', placeholder: '학생이 보낸 제출 코드를 붙여 넣으세요. 여러 명이면 줄을 바꿔 한꺼번에 붙여도 돼요.', 'aria-label': '제출 코드' });
  const imp = h('button', { class: 'btn primary', type: 'button', text: '불러오기', onclick: async () => {
    const res = await importCodes(ta.value); if (!res.n) { toast('제출 코드를 찾지 못했어요'); return; } const { add, upd, bad } = res;
    render(); toast('추가 ' + add + '명 · 갱신 ' + upd + '명' + (bad ? ' · 읽지 못함 ' + bad : '')); } });
  if (SHEET_CSV && !sheetAt) setTimeout(() => sheetPull(false), 0);
  const shareCard = h('section', { class: 'card', style: 'margin-top:12px' }, h('b', { text: '다른 선생님과 함께 쓰기' }), h('p', { class: 'note', text: '다른 선생님도 자기 구글 폼·시트를 연결한 전용 링크를 만들어 쓸 수 있어요. ' + (CFG ? '(지금은 ' + (CFGNM ? CFGNM + ' 선생님' : '사용자') + ' 설정으로 열려 있어요)' : '') }), h('button', { class: 'btn sm', type: 'button', text: '전용 링크 만들기', onclick: () => { location.hash = '#setup'; go('setup'); } }));
  const importCard = h('section', { class: 'card', style: 'margin-top:12px' }, h('h2', { class: 'h2', text: '제출 코드 불러오기' }), h('p', { class: 'note', text: '자동 연동이 안 되는 학생은 학생 화면 설정에서 만든 코드를 보내면 돼요. ' }), ta, h('div', { class: 'row' }, imp));
  if (!rows.length) return (wrap.append(h('section', { class: 'card' }, h('p', { text: '아직 불러온 학생이 없어요. 학생이 차시를 시작하면 이곳에 나타나요.' })), importCard, shareCard), wrap);
  const clsList = [...new Set(rows.map(r => r.rep.cls || '반 없음'))].sort((x, y) => (x === '반 없음') - (y === '반 없음') || x.localeCompare(y, 'ko', { numeric: true }));
  if (tcls !== '전체' && !clsList.includes(tcls)) tcls = '전체';
  const shown = rows.filter(r => tcls === '전체' || (r.rep.cls || '반 없음') === tcls);
  wrap.append(h('div', { class: 'row', style: 'flex-wrap:wrap;gap:6px' }, ['전체', ...clsList].map(c => h('button', { class: 'btn sm' + (c === tcls ? ' primary' : ''), type: 'button', text: c === '전체' ? '전체 ' + rows.length + '명' : c + ' · ' + rows.filter(r => (r.rep.cls || '반 없음') === c).length + '명', onclick: () => { tcls = c; render(); } }))));
  (tcls === '전체' ? clsList : [tcls]).forEach(c => { const g = shown.filter(r => (r.rep.cls || '반 없음') === c); if (!g.length) return;
    const done = g.reduce((s, r) => s + r.a.done, 0), tot = g.reduce((s, r) => s + r.a.tot, 0), ok = g.reduce((s, r) => s + r.a.ok, 0);
    wrap.append(h('section', { class: 'card', style: 'margin-top:12px' }, h('div', { class: 'row', style: 'margin:0 0 8px;justify-content:space-between' }, h('b', { text: c + ' (' + g.length + '명)' }), h('span', { class: 'note', style: 'margin:0', text: '완료 ' + done + '/' + g.length * ready.length + ' 차시 · 첫 시도 ' + (tot ? pct(ok / tot) + '%' : '–') })),
      h('div', { class: 'tscroll' }, h('table', { class: 'mx' }, h('thead', {}, h('tr', {}, h('th', { text: '학생' }), ready.map(l => h('th', { title: l.title, text: lno(l) })), h('th', { text: '첫 시도 정답률' }))),
        h('tbody', {}, g.map(r => h('tr', { onclick: () => { tsel = r.key; render(); } }, h('td', {}, h('b', { text: r.rep.name })),
          r.a.rows.map(x => h('td', {}, !x.r ? h('span', { class: 'cell n', text: '–' }) : x.r.d ? h('span', { class: 'cell d', text: '✓ ' + x.r.c[0] + '/' + x.r.c[1] }) : h('span', { class: 'cell p', text: (Math.min(x.r.s, 5) + 1) + '/6' }))),
          h('td', { text: r.a.tot ? pct(r.a.ok / r.a.tot) + '%' : '–' }))))))));
  });
  wrap.append(elTable(shown.map(r => r.a)),
    h('p', { class: 'note', text: '이름과 반이 같으면 같은 학생으로 보고 기록을 이어서 쌓아요. ✓는 차시 완료(확인 문제 첫 시도 정답 수), 노란 칸은 진행 중인 단계예요.' }), importCard, shareCard);
  return wrap;
}
function teacherDetail(rec) {
  const rep = rec.rep, a = analyze(rep), out = [];
  out.push(h('section', { class: 'card' }, h('div', { class: 'row', style: 'margin:0' }, h('span', { class: 'chip gray', text: rep.cls || '반 없음' }), h('span', { class: 'note', style: 'margin:0', text: '완료 ' + a.done + '/' + a.rows.length + ' · 첫 시도 ' + (a.tot ? pct(a.ok / a.tot) + '%' : '–') }))));
  const mvIn = h('input', { class: 'in', placeholder: '예: 2-1', maxlength: '6', style: 'max-width:110px', 'aria-label': '옮길 반' });
  out.push(h('section', { class: 'card', style: 'margin-top:12px' }, h('div', { class: 'row', style: 'margin:0;gap:8px;flex-wrap:wrap' }, h('b', { text: '반 옮기기' }), mvIn, h('button', { class: 'btn sm', type: 'button', text: '옮기기', onclick: () => { const nk = moveStudent(tsel, mvIn.value); if (!nk) { toast('옮길 반을 입력해 주세요'); return; } tsel = nk; render(); toast('반을 옮겼어요. 이 학생이 이전 반으로 다시 제출해도 새 반에 합쳐져요'); } })),
    h('p', { class: 'note', text: '학생이 다음에 2-1반으로 접속해 제출해도 같은 이름이면 이 기록과 합쳐져요.' })));
  a.rows.forEach(x => { const r = x.r;
    out.push(h('section', { class: 'card', style: 'margin-top:12px' }, h('div', { class: 'row', style: 'margin:0;justify-content:space-between' }, h('div', {}, h('b', { text: lno(x.l) + ' · ' + x.l.title }), x.l.el ? h('div', { class: 'note', style: 'margin:2px 0 0;font-size:12px', text: '평가 요소 · ' + x.l.el }) : null), !r ? h('span', { class: 'chip gray', text: '미시작' }) : r.d ? h('span', { class: 'chip green', text: '완료 · 확인 ' + r.c[0] + '/' + r.c[1] }) : h('span', { class: 'chip gold', text: '진행 ' + (Math.min(r.s, 5) + 1) + '/6' })),
      r && r.p ? h('div', { class: 'refl' }, h('small', { text: '처음 예상' }), r.p) : null,
      r && r.r && r.r[0] ? h('div', { class: 'refl' }, h('small', { text: x.l.rlab ? x.l.rlab[0] : '내 말로 설명하기' }), r.r[0]) : null,
      r && r.r && r.r[1] ? h('div', { class: 'refl' }, h('small', { text: x.l.rlab ? x.l.rlab[1] : '남은 궁금증' }), r.r[1]) : null,
      r && r.r && r.r[2] && x.l.self ? h('div', { class: 'refl' }, h('small', { text: '자기평가' }), x.l.self.map((t, j) => (j + 1) + ' ' + (r.r[2][j] || '-')).join('  ·  ')) : null)); });
  const fb = h('textarea', { class: 'in', id: 't-fb', rows: '7', 'aria-label': '피드백 글' }); fb.value = rec.fb || draftFeedback(rep); fb.addEventListener('input', () => { rec.fb = fb.value; tsave(); });
  out.push(h('section', { class: 'card', style: 'margin-top:12px' }, h('h2', { class: 'h2', text: '피드백 초안' }), h('p', { class: 'note', text: '기록으로 만든 초안이에요. 고치면 자동으로 저장돼요.' }), fb,
    h('div', { class: 'row' }, h('button', { class: 'btn primary', text: '복사', onclick: () => copyText(fb.value, '피드백을 복사했어요') }), h('button', { class: 'btn', text: '초안 다시 만들기', onclick: () => { fb.value = draftFeedback(rep); rec.fb = ''; tsave(); toast('초안을 다시 만들었어요'); } }))));
  return out;
}

/* ---------- 판서(화면 위에 직접 쓰기) : 전자칠판·수업용 ---------- */
const Board = (() => {
  const COL = { k: '#111827', b: '#1d5fa0', r: '#d33a2c', g: '#1f9d55', w: '#ffffff' };
  const st = { on: false, pen: true, col: 'k', tool: 'pen' }, strokes = [];
  let cv = null, g = null, bar = null, fab = null, cur = null, raf = 0;
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  function size() { if (!cv) return; const d = dpr(); cv.width = innerWidth * d; cv.height = innerHeight * d; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; redraw(); }
  function one(s) {
    const d = dpr(), sy = scrollY, p = s.p; if (!p.length) return;
    g.save(); g.scale(d, d); g.lineCap = 'round'; g.lineJoin = 'round';
    g.globalCompositeOperation = s.t === 'e' ? 'destination-out' : 'source-over';
    g.strokeStyle = s.t === 'h' ? 'rgba(255,214,10,.38)' : COL[s.c] || COL.k; g.lineWidth = s.t === 'e' ? 40 : s.t === 'h' ? 24 : 4;
    g.beginPath(); g.moveTo(p[0], p[1] - sy); if (p.length === 2) g.lineTo(p[0] + .1, p[1] - sy); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1] - sy);
    if (s.c === 'w' && s.t === 'p') { g.strokeStyle = 'rgba(40,50,60,.55)'; g.lineWidth = 7.5; g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 4; }
    g.stroke(); g.restore();
  }
  function redraw() { if (!g) return; g.clearRect(0, 0, cv.width, cv.height); strokes.forEach(one); }
  const later = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; redraw(); }); };
  const pos = e => [Math.round(e.clientX), Math.round(e.clientY + scrollY)];
  function build() {
    cv = h('canvas', { class: 'bcv', 'aria-label': '판서 화면' }); g = cv.getContext('2d');
    cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) { } cur = { t: st.tool === 'pen' ? 'p' : st.tool === 'hl' ? 'h' : 'e', c: st.col, p: pos(e) }; strokes.push(cur); one(cur); });
    cv.addEventListener('pointermove', e => { if (!cur) return; e.preventDefault(); const q = pos(e), p = cur.p, n = p.length; if (Math.abs(q[0] - p[n - 2]) + Math.abs(q[1] - p[n - 1]) < 2) return; p.push(q[0], q[1]); redraw(); });
    const end = () => { cur = null; }; cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    bar = h('div', { class: 'bbar', role: 'toolbar', 'aria-label': '판서 도구' });
    fab = h('button', { class: 'bfab', type: 'button', 'aria-label': '판서 켜기', onclick: () => open() }, h('span', { text: '✏️' }), h('small', { text: '판서' }));
    document.body.append(cv, bar, fab); addEventListener('resize', size); addEventListener('scroll', later, { passive: true });
  }
  function paintBar() {
    const b = (t, cls, fn, label) => h('button', { type: 'button', class: 'bt ' + (cls || ''), text: t, 'aria-label': label || t, onclick: fn });
    bar.replaceChildren(
      b(st.pen ? '✏️ 쓰기' : '👆 스크롤·조작', st.pen ? 'on' : '', () => { st.pen = !st.pen; apply(); }, st.pen ? '지금은 쓰기 모드 (누르면 스크롤·조작)' : '지금은 스크롤·조작 모드 (누르면 쓰기)'),
      ...['k', 'b', 'r', 'g', 'w'].map(c => h('button', { type: 'button', class: 'bt dot' + (st.tool === 'pen' && st.col === c ? ' on' : ''), style: 'background:' + COL[c], 'aria-label': { k: '검정', b: '파랑', r: '빨강', g: '초록', w: '하양' }[c] + ' 펜', onclick: () => { st.col = c; st.tool = 'pen'; st.pen = true; apply(); } })),
      b('🖍 형광펜', st.tool === 'hl' ? 'on' : '', () => { st.tool = 'hl'; st.col = st.col; st.pen = true; apply(); }),
      b('지우개', st.tool === 'er' ? 'on' : '', () => { st.tool = 'er'; st.pen = true; apply(); }),
      b('되돌리기', '', () => { strokes.pop(); redraw(); }),
      b('모두 지우기', '', () => { strokes.length = 0; redraw(); }),
      b('✕ 끝내기', 'x', () => close()));
  }
  function apply() { cv.style.pointerEvents = st.pen ? 'auto' : 'none'; paintBar(); }
  function open() { if (!cv) build(); st.on = true; cv.classList.add('on'); bar.classList.add('on'); fab.classList.add('hide'); size(); apply(); }
  function close() { st.on = false; strokes.length = 0; if (cv) { cv.classList.remove('on'); cv.style.pointerEvents = 'none'; bar.classList.remove('on'); fab.classList.remove('hide'); g.clearRect(0, 0, cv.width, cv.height); } }
  return { init() { if (!cv) build(); }, clear() { if (cv && strokes.length) { strokes.length = 0; redraw(); } } };
})();

/* ---------- 시작 ---------- */
load();
if (DB.profiles.length && !DB.profiles.some(p => p.id === DB.cur)) DB.cur = DB.profiles.length === 1 ? DB.profiles[0].id : null;
view = DB.cur ? 'home' : 'welcome'; if (location.hash === '#teacher') view = 'teacher'; if (location.hash === '#setup') view = 'setup';
render(); Sync.init(); Board.init(); pullLocks(true); setInterval(() => { if (!document.hidden) pullLocks(); }, 60000); document.addEventListener('visibilitychange', () => { if (!document.hidden) pullLocks(); });
window.__app = { DB: () => DB, TD: () => TD, go, render, makeReport, packReport, unpackReport, LESSONS };

