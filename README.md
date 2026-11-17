# mathconcept

## 소스 구조 (수정 방법)
- `src/` 아래 파일을 고친 뒤 `python3 build.py` 를 실행하면 `index.html` 이 만들어집니다. (index.html 을 직접 고치지 마세요)
- `src/style.css` 스타일 · `src/js/01~07_content*.js` 차시 내용(문제·정리) · `08~12_widgets*.js` 탐색 위젯 · `13~15_figs*.js` 확인 문제 그림 · `16_app.js` 앱 동작
- 중3 통계: 차시 내용 `src/js/07b_content_m3.js`, 위젯 `src/js/12b_widgets_m3.js`. 학년 탭은 `UNITS`의 `grade` 값(01_content.js)으로 나뉩니다.
- 차시 순서와 이름(lab)은 `07_content_z.js` 끝의 "차시 순서" 부분, 차시 목록 `catalog.json` 은 별도로 관리합니다.
- 작업 순서: 수정 → `python3 build.py` → 확인 → 커밋·푸시
