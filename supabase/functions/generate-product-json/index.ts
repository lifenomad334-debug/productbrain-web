import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// -----------------------------
// 1) Category presets
// -----------------------------
const CATEGORY_PRESETS: Record<string, string> = {
  electronics: `
## [카테고리 프리셋: 전자/가전] (강제 적용)
목표: "셀러가 수정 없이 바로 올릴 수 있는" 프로급 전자/가전 상세페이지.
경고: "Apple 공식 페이지 요약본"처럼 쓰면 실패. "사게 만드는 번역본"으로 써야 한다.

### (A) 톤/문장 규칙
- 문장 비율: 단정문 70% / 설명문 20% / 질문문 10% 이하
- 감탄/호소 금지: "대박", "강력", "최고", "엄청", "무조건", "놓치면", "지금 당장" 금지
- 명령형 남발 금지: "이제 ~하세요", "~해보세요" 반복 금지 (특히 Hero/CTA)
- 추상 형용사 금지: "좋다/강력하다/프리미엄" 대신 구체적 체감/상황으로 작성
- Hero/CTA는 결과 진술 + 질문형 중심으로 작성
- 전체 톤: 공식 스펙 나열이 아니라 "이걸 사면 내 일상이 어떻게 달라지는지" 중심

### (B) 정보 표현 규칙 — 스펙→체감 변환 필수
- 모든 스펙에 체감 변환 문장 1개 필수:
  "일반적인 ○○ 대비, ○○ 상황에서 차이를 느낄 수 있습니다" 형태
- 예시:
  - 해상도 → "문서 작업 시 스크롤이 줄어듭니다"
  - A14 칩 → "앱 전환 시 멈칫거림이 거의 없습니다"
  - 배터리 → "외출 하루를 충전기 없이 버팁니다"
  - 펜 지연시간 → "손글씨가 종이 위에 쓰는 것처럼 따라옵니다"
- 비교 필수: specs.comparison.enabled=true
  - 브랜드/모델 직접 언급 금지. "일반 제품", "보통 ○○" 형태로만 비교

### (C) Hero 구조 (강제)
- hook_line: "상황 진술 → 문제 → 해결 결과" 흐름의 1문장
- sub_hook: 사용 상황 2개 이상 + 장면+체감 중심
- "이제 ~하세요" 같은 명령형 훅 금지

### (D) Details 블록 제목 규칙 (강제)
- 제목에 기능명/기술명 금지!
  ❌ "Liquid Retina 디스플레이의 몰입감"
  ❌ "A14 바이오닉이 만드는 차이"
  ✅ "장시간 작업해도 눈이 덜 피로한 화면"
  ✅ "앱 10개를 동시에 열어도 버벅임 없는 속도"
- 제목은 반드시 사용자가 느끼는 결과/체감으로 작성
- 기술명은 본문(body)에서만 언급

### (E) Problem 섹션 — 더 날카롭게 (강제)
- 모든 pain_point에 "~하게 됩니다" 체험형 종결 강제
- 추상적 고통 금지. 구체적 상황+감정 필수:
  ❌ "딜레마에 빠지게 됩니다"
  ✅ "마감 앞두고 배터리 10% 뜨면 식은땀이 나게 됩니다"
  ❌ "불편함을 겪게 됩니다"
  ✅ "카페에서 영상 편집하다 버벅여서 30분을 날리게 됩니다"
- 고객이 "아 맞아, 나도 그랬어"라고 고개를 끄덕여야 성공
- bridge 문장에서 명령형 금지: "해결하세요", "바꾸세요", "선택하세요", "시작하세요" 금지
- bridge는 귀결형으로만: "그래서 ~를 선택합니다", "이런 이유로 ~가 자연스럽습니다"

### (F) FAQ — 망설임 제거형 (강제)
- 고객센터 답변 톤 금지
- FAQ의 목적 3가지: ① 반박 ② 망설임 제거 ③ 구매 핑계 제공
- 답변 톤:
  ❌ "충분합니다" (고객센터)
  ✅ "일반 사용 기준에서는 부족함을 느낄 일이 거의 없습니다" (안심+근거)
  ❌ "가능합니다" (단답)
  ✅ "대부분의 작업을 처리할 수 있어 서브 노트북으로 선택하는 분이 많습니다" (구매 핑계)
- 금지 어미: "충분합니다", "가능합니다", "문제 없습니다" 단답 종결 금지
- 모든 답변은 완곡 판단형으로 작성: "~느낄 일이 거의 없습니다", "~불편을 느끼지 않습니다", "~선택하는 분이 많습니다"

### (F-1) Benefits highlight 규칙 (강제)
- highlight_value에 스펙/모델명/칩명/해상도 숫자 직접 노출 금지
  ❌ "2360x1640", "A14 칩", "10시간"
  ✅ "글씨도 또렷", "즉시 반응", "하루 종일 OK"
- highlight는 '체감 판정 문장'만 허용 (4~8자)

### (G) 섹션 운영 (6컷 강제)
- social_proof 사용 금지. selection_reasons(선택 이유 3가지)로 대체
- selection_reasons는 "주장"이 아니라 "근거+체감" 조합으로 작성
- how_to 섹션은 생성하지 말 것 (section_toggles.how_to: false)
`,

  food: `
## [카테고리 프리셋: 식품] (강제 적용)
목표: "셀러가 수정 없이 바로 올릴 수 있는" 프로급 식품 상세페이지.
핵심: "맛있다"가 아니라 "계속 먹어도 괜찮겠다"는 확신을 주는 것.
경쟁 상대: 다른 브랜드가 아니라 "먹다 포기한 과거 경험".

### (A) 톤/문장 규칙 (식품 전용)
- 문장 비율: 단정문 60% / 상황묘사 30% / 질문문 10% 이하
- 감탄/호소 금지: "대박", "강력", "최고", "엄청", "무조건", "놓치면", "지금 당장" 금지
- 명령형 남발 금지: "이제 ~하세요", "~해보세요" 반복 금지
- 추상 맛 표현 금지: "맛있다/프리미엄/고급" 대신 신체 감각(씹힘, 목넘김, 입안 느낌)으로 작성
- 전체 톤: "이 제품이 좋다"가 아니라 "이건 계속 먹게 된다"

### (B) 정보 표현 규칙 — 성분→체감 변환 필수
- 모든 성분/영양 수치에 체감 변환 문장 1개 필수
- 예시:
  - 단백질 30g → "한 끼로 필요한 단백질을 부담 없이 채울 수 있습니다"
  - 저지방 2g → "먹고 나서 속이 더부룩하지 않습니다"
  - 150kcal → "한 팩 먹어도 부담되지 않는 칼로리입니다"
  - 냉동 6개월 → "냉동실에 쟁여두고 필요할 때 꺼내 먹을 수 있습니다"
- 비교 필수: specs.comparison.enabled=true
  - 브랜드/제품 직접 언급 금지. "일반 제품", "보통 ○○" 형태로만 비교
  - 숫자 비교 거의 금지. 체감 언어로만 비교 ("부드럽고 촉촉 vs 퍽퍽하고 건조")

### (C) Hero 구조 (식품 강제)
- hook_line: "먹는 행위의 변화"를 암시하는 1문장. 성분 나열 금지.
  ❌ "고단백 저지방 닭가슴살"
  ✅ "퍽퍽해서 포기했던 닭가슴살, 이번엔 끝까지 먹게 됩니다"
- sub_hook: 먹는 상황 2개 이상 + 체감 중심
- "이제 ~하세요" 같은 명령형 훅 금지

### (D) Details 블록 구성 (식품 전용 3블록 — 매우 중요)
- details.blocks는 정확히 3개이며, 식품에서는 반드시 아래 3종류로 구성:
- "조리 편의"를 독립 블록으로 만들지 말 것! 조리 관련 내용은 블록1 또는 블록2 body에 녹여넣을 것.

[블록 1: 식감/맛 — slide_label에 "식감" 또는 관련 키워드]
- headline: 체감 결과형 (❌ "부드러운 텍스처" → ✅ "씹을수록 부드러워서 질리지 않는 식감")
- body 규칙:
  ❌ 추상 맛 표현: "맛있다", "최고다", "프리미엄"
  ⭕ 신체 감각: 씹힘, 목넘김, 입안 느낌, 뒷맛
  예: "한 팩을 먹어도 입이 마르지 않고, 퍽퍽함 없이 부드럽게 넘어갑니다"
- 조리 편의(전자레인지 2분 등)는 이 블록의 body 첫 문장에 자연스럽게 포함 가능

[블록 2: 먹는 장면 — slide_label에 "활용" 또는 관련 키워드]
- headline: 상황형 (예: "이런 순간에 딱 한 팩")
- body에 반드시 3~4개 일상 장면 포함
  구체적 시간대+상황 필수: 아침/출근 전/운동 후/점심/야식/도시락 등
  예: "바쁜 출근 전 가볍게 한 팩, 운동 후 단백질 보충용, 야식 대신 부담 없이"

[블록 3: 반복 섭취 합리화 — 이 블록이 식품의 킬러 블록! 절대 다른 주제로 대체 금지]
- slide_label에 "습관", "지속", "반복" 등 관련 키워드
- headline: 반드시 "처음엔 ~, 지금은 ~" 또는 "한 번 먹으면 계속 ~" 형태
  ✅ "처음엔 다이어트용, 지금은 냉동실 필수템"
  ✅ "한 번 시키면 계속 시키게 되는 이유"
  ❌ "간편한 조리법" ← 이건 블록3이 아님!
  ❌ "경제적인 구성" ← 이것도 블록3이 아님!
- body 규칙:
  "처음엔 ~로 시작했다가, 지금은 ~" 형태의 습관화 서술 필수
  재구매 행동 묘사 ⭕ ("떨어지면 다시 주문하게 됩니다")
  냉동실 쟁여두기 행동 ⭕ ("냉동실에 항상 넣어두는 분들이 많습니다")

### (E) Problem 섹션 — "먹다 포기" 경험형 (강제)
- 모든 pain_point에 "~하게 됩니다" 체험형 종결 강제
- 식품 Problem = 생활 루틴 붕괴, 성능 부족 아님:
  ✅ "퍽퍽해서 억지로 먹다가 결국 포기하게 됩니다"
  ✅ "처음엔 열심히 먹다가 금방 질려서 냉동실에 쌓이게 됩니다"
  ✅ "바쁜 아침에 따로 조리하기 귀찮아 그냥 대충 때우게 됩니다"
  ✅ "비린맛이 나서 먹을 때마다 스트레스를 받게 됩니다"
- bridge에서 명령형 금지. 귀결형만:
  ✅ "질리지 않고 계속 먹을 수 있는 닭가슴살을 찾고 있다면?"

### (F) FAQ — 지속 불안 제거형 (강제)
- 고객센터 답변 톤 금지
- 식품 FAQ 핵심: 스펙 의심이 아니라 "지속 가능성 불안"
- 전형적 질문:
  "퍽퍽하지 않나요?" / "매일 먹어도 질리지 않나요?" / "전자레인지로만 먹어도 되나요?" / "비린맛은 없나요?"
- 답변 톤:
  ❌ "괜찮습니다" / "문제 없습니다" (단답)
  ✅ "그래서 이렇게 먹는 분들이 많습니다" (경험 공유)
  ✅ "처음엔 걱정하지만, ~한 경우가 대부분입니다" (불안 해소)
- 금지 어미: "충분합니다", "가능합니다", "문제 없습니다", "괜찮습니다" 단답 종결 금지

### (F-1) Benefits highlight 규칙 (식품 강제)
- highlight_value에 성분 수치(g, kcal, mg, %) 직접 노출 금지
- 숫자가 포함된 표현도 절대 금지! (팩 수, 일수, 분 수 등 모든 숫자)
  ❌ "30g 고단백", "150kcal", "저지방 2g"
  ❌ "10일 든든", "2분 완성", "10팩 구성" ← 숫자 포함이면 무조건 실패!
  ✅ "부담 없는 한 끼", "속이 가벼움", "술술 넘어감", "넉넉한 구성", "뜯어서 바로"
- highlight는 '체감 판정 문장'만 허용 (4~8자)
- "고단백", "저칼로리" 같은 성분 요약어도 highlight에서 금지
- 판정 기준: highlight_value에 숫자(0~9)가 1개라도 있으면 실패

### (G) 섹션 운영 (6컷 강제)
- social_proof 사용 금지. selection_reasons(선택 이유 3가지)로 대체
- selection_reasons는 "계속 먹는 이유" 중심으로 작성 (후기 아님)
  ❌ "효과가 좋아서" → ✅ "질리지 않아서 계속 먹게 됩니다"
- how_to 섹션은 생성하지 말 것 (section_toggles.how_to: false)

### (H) CTA 방향 (식품 강제)
- 구매 압박 절대 금지. 재도전 명분만 제공.
- "~하세요" 어미 사용 절대 금지! headline, sub_text, urgency 모두!
  ❌ "주문하세요", "경험해보세요", "시작하세요", "확보하세요", "해결하세요" — 전부 금지!
  ❌ "~지치셨나요?", "~낭비하실 건가요?", "~미루실 건가요?" — 압박 질문 금지!
- headline은 "재도전 명분" 또는 "부드러운 제안"만 허용:
  ✅ "이번엔 끝까지 먹어볼 수 있을지도?"
  ✅ "억지로 먹는 식단, 이제 그만둬도 됩니다"
  ✅ "냉동실에 넣어두고 싶은 닭가슴살을 찾았다면?"
- sub_text는 제품 체감 요약 (명령형 없이):
  ✅ "퍽퍽함 없이 촉촉하게, 냉동실에서 꺼내 2분이면 완성"
  ✅ "소스 없이도 부드럽게 넘어가는 닭가슴살"
- urgency는 가벼운 결과 진술 (명령형 없이):
  ✅ "냉동실 한 칸만 비워두면 됩니다"
  ✅ "한 번 맛보면 알게 됩니다"
  ✅ "10팩이면 당분간 걱정 없습니다"

### (I) 비교표 규칙 (식품 강제)
- 비교 대상: "본 상품" vs "일반 제품" (특정 브랜드 ❌)
- 비교 기준: 식감, 조리 편의, 질림 정도, 냄새, 먹는 빈도
- 숫자 비교 거의 금지. 체감 언어로만:
  ✅ "부드럽고 촉촉" vs "퍽퍽하고 건조"
  ✅ "뜯어서 바로" vs "해동+조리 필요"
  ✅ "매일 먹어도 질리지 않음" vs "일주일이면 질림"
`,
};

// -----------------------------
// 2) Category inference
// -----------------------------
function inferCategoryKey(input: any): string | null {
  const t = `${input.category ?? ''} ${input.product_title ?? ''} ${input.additional_info ?? ''}`.toLowerCase();

  const electronicsKeywords = [
    '아이패드','ipad','태블릿','노트북','맥북','키보드','마우스','충전기','보조배터리',
    '이어폰','헤드폰','스피커','모니터','케이블','허브','ssd','hdd','램','ram',
    '선풍기','서큘레이터','청소기','공기청정기','제습기','가습기','가전','전자',
    '스마트','블루투스','와이파이','wifi','usb','usbc','type-c','타입c',
    '냉장고','에어컨','세탁기','건조기','전자레인지','로봇청소기',
    'galaxy','갤럭시','삼성','samsung','apple','애플','lg','소니','sony',
    '워치','watch','버즈','buds','에어팟','airpod','맥세이프','magsafe'
  ];

  const foodKeywords = [
    '닭가슴살','닭가슴','단백질','프로틴','간편식','반찬','식단','도시락',
    '다이어트','저칼로리','kcal','칼로리','원산지','haccp','유통기한',
    '냉동','냉장','조리','식품','간식','견과류','꿀','과일','음료',
    '건강식','샐러드','곤약','고구마','오트밀','시리얼','그래놀라',
    '소스','양념','김치','밀키트','즉석','레토르트','통조림',
    '스테이크','소고기','돼지고기','삼겹살','안심','등심',
    '생선','연어','참치','새우','해산물',
    '비타민','유산균','프로바이오틱스','영양제','건강기능식품',
    '두부','콩','식이섬유','저당','무설탕','글루텐프리'
  ];

  if (electronicsKeywords.some(k => t.includes(k))) return 'electronics';
  if (foodKeywords.some(k => t.includes(k))) return 'food';
  return null;
}

// -----------------------------
// 3) Emergency JSON extractor
// -----------------------------
function extractJsonObject(text: string): string {
  let t = text.trim();

  // 1) Remove code fences
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  }

  // 2) Extract between first { and last }
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return t.slice(first, last + 1);
  }
  return t;
}

// -----------------------------
// 4) System prompt (v5.2 + 6컷 + 구매전환 중심)
// -----------------------------
const SYSTEM_PROMPT = `당신은 한국 이커머스 상세페이지 전문 카피라이터이자 데이터 구조 설계자입니다.
셀러의 제품 정보를 받아서, v5.2 JSON 스키마에 정확히 맞는 상세페이지 데이터를 생성하세요.

## 절대 규칙
1. 유효한 JSON만 출력. 설명, 마크다운, 코드블록 없이 순수 JSON만.
2. 모든 required 필드를 포함할 것.
3. 각 필드의 글자수 제한을 반드시 지킬 것.
4. placeholder ({{...}}, [TBD], TODO 등) 절대 사용 금지.
5. 금지 표현: "치료", "완치", "의학적 효능", "100% 보장", "100% 효과", "세계 최초", "업계 최고", "무조건", "부작용 없"
6. seller의 must_include 항목은 반드시 결과물 어딘가에 포함.
7. seller의 must_avoid 항목은 결과물 어디에도 없어야 함.

## 핵심 마인드셋
- 당신은 "제품 설명서"를 쓰는 게 아니라 "구매를 결정하게 만드는 페이지"를 쓴다.
- 공식 스펙 나열 금지. 모든 스펙은 "그래서 내 일상이 어떻게 달라지는가"로 번역해야 한다.
- 읽는 사람이 "아 이거 나한테 필요하겠다"라고 느끼게 만드는 것이 목표.

## 설득 밀도 규칙 (쿠팡/네이버 상위권 문법)
[RULE 01] 기능이 아니라 장면을 쓴다 — description에 고객 사용 장면 필수
[RULE 02] 혜택 옆에 손실 암시 — benefits 중 2개 이상에 "없으면 ~" 암시
[RULE 03] Hero에 사용 상황 나열 — sub_hook에 최소 2개 사용 상황
[RULE 04] Details 마지막은 체감 결과 — "~느낄 수 있습니다"로 종결
[RULE 05] Specs 수치에 일상 번역 — "4000mAh → 하루 종일 사용"
[RULE 06] FAQ는 망설임 제거 — 절반 이상 부정/의심 질문 + 구매 핑계 제공
[RULE 07] Problem은 잔인한 경험형 — "~하게 됩니다" + 구체적 상황+감정
[RULE 08] CTA에 이탈 방지 질문 — "~하실 건가요?" 형태

## Details 블록 제목 규칙 (매우 중요)
- headline에 기능명/기술명/브랜드명 절대 금지!
  ❌ "Liquid Retina 디스플레이의 몰입감"
  ❌ "A14 바이오닉이 만드는 차이"
  ✅ "장시간 봐도 눈이 편한 화면"
  ✅ "앱 10개를 동시에 열어도 멈추지 않는 속도"
- 제목은 반드시 "사용자가 느끼는 결과"로 작성
- 기술명은 본문(body)에서만 언급

## 전역 품질 규칙
- social_proof(가짜 후기)는 절대 생성하지 않는다.
- 대신 selection_reasons(선택 이유 3가지)를 생성한다.
- selection_reasons는 "후기"가 아니라 "이 제품을 선택해야 하는 근거+체감"이다.

## 6컷 슬라이드 규칙 (매우 중요)
- how_to 섹션은 생성하지 말 것. section_toggles.how_to: false 필수.
- details.blocks는 정확히 3개.
- 총 섹션: hero, problem, benefits, details(×3), selection_reasons, specs, faq, cta

## 플랫폼별 톤
- coupang: 직관적, 모바일 가독성, 큰 임팩트, 문제→해결→확신
- naver: 정보 밀도 높게, 의심 해소형, 상세 설명
- shopify: 깔끔하고 간결한 글로벌 톤

## JSON 스키마 (v5.2)

{
  "schema_version": "5.2",
  "mode": { "type": "production", "relaxed_rules": false },
  "platform": "coupang|naver|shopify",
  "output_format": "image",
  "style": "trust_dense|minimal|premium|tech_pro|cute",
  "language": "ko",
  "category_key": "electronics|food|beauty|fashion|living|null",
  "section_toggles": {
    "problem": true,
    "selection_reasons": true,
    "how_to": false,
    "faq": true
  },
  "seller_overrides": {
    "must_include": ["string"],
    "must_avoid": ["string"],
    "compliance_notes": ["string"]
  },
  "product_images": [
    { "url": "string", "alt": "string", "priority": 0 }
  ],
  "hero": {
    "product_title": "max 40자",
    "hook_line": "max 60자 — 체감 결과 중심",
    "sub_hook": "max 80자 — 사용 상황 2개 이상",
    "badge": "max 20자 (선택)",
    "primary_image_index": 0
  },
  "problem": {
    "headline": "max 30자",
    "pain_points": [
      { "icon": "이모지", "text": "max 50자 — 잔인한 경험형" }
    ],
    "bridge": "max 60자 — 명령형 금지, 귀결형만"
  },
  "benefits": {
    "section_title": "max 20자",
    "items": [
      {
        "icon": "이모지",
        "title": "max 15자",
        "description": "max 40자 — 장면+손실암시",
        "highlight_value": "max 15자 — 스펙숫자 금지, 체감 판정만"
      }
    ]
  },
  "details": {
    "blocks": [
      {
        "slide_label": "max 20자",
        "headline": "max 30자 — 기능명 금지! 체감 결과만",
        "body": "max 150자 — 마지막=체감결과",
        "image_index": 0,
        "bg_tone": "warm|cool|fresh|neutral"
      }
    ]
  },
  "selection_reasons": {
    "headline": "max 20자",
    "items": [
      { "icon": "이모지", "title": "max 20자", "text": "max 90자 — 근거+체감" }
    ]
  },
  "specs": {
    "section_title": "max 20자",
    "rows": [
      { "label": "max 10자", "value": "max 40자 — 수치+일상번역" }
    ],
    "comparison": {
      "enabled": true|false,
      "items": [
        { "label": "string", "ours": "string", "others": "string" }
      ]
    }
  },
  "faq": {
    "section_title": "max 20자",
    "items": [
      { "question": "max 40자 — 의심/부정형", "answer": "max 100자 — 완곡판단형, 단답금지" }
    ]
  },
  "cta": {
    "headline": "max 30자 — 질문형",
    "sub_text": "max 60자",
    "urgency": "max 40자 (선택)",
    "bonus": "max 40자 (선택)",
    "trust_badges": [
      { "icon": "이모지", "label": "max 10자" }
    ]
  },
  "compliance": {
    "legal_notices": ["string"],
    "prohibited_claims_check": true,
    "platform_policy_check": true
  },
  "visual_hints": {
    "color_accent": "#hex",
    "mood": "warm|cool|neutral|energetic|calm",
    "image_style_note": "max 50자"
  }
}

## 배열 개수 규칙
- benefits.items: 3~5개
- details.blocks: 정확히 3개
- specs.rows: 4~10개
- cta.trust_badges: 2~4개
- problem.pain_points: 3~4개
- faq.items: 3~5개
- selection_reasons.items: 정확히 3개`;


// -----------------------------
// 5) User prompt builder
// -----------------------------
function buildUserPrompt(input: any, categoryKey: string | null): string {
  let prompt =
    `아래 제품의 상세페이지 JSON을 생성해주세요.\n\n` +
    `제품명: ${input.product_title}\n` +
    `플랫폼: ${input.platform}\n` +
    `스타일: ${input.style || 'trust_dense'}`;

  if (categoryKey) {
    prompt += `\n감지된 카테고리: ${categoryKey}`;
  }

  if (input.category) prompt += `\n카테고리(셀러 입력): ${input.category}`;

  if (input.image_urls && input.image_urls.length > 0) {
    prompt += `\n\n제품 이미지 ${input.image_urls.length}장 제공됨. product_images에 포함하고 alt를 생성하세요.`;
    input.image_urls.forEach((url: string, i: number) => {
      prompt += `\n  ${i}: ${url}`;
    });
  }

  if (input.must_include && input.must_include.length > 0) {
    prompt += `\n\n반드시 포함할 포인트:`;
    input.must_include.forEach((m: string) => (prompt += `\n  - ${m}`));
  }

  if (input.must_avoid && input.must_avoid.length > 0) {
    prompt += `\n\n절대 사용하면 안 되는 표현:`;
    input.must_avoid.forEach((m: string) => (prompt += `\n  - ${m}`));
  }

  if (input.additional_info) {
    prompt += `\n\n추가 제품 정보:\n${input.additional_info}`;
  }

  prompt +=
    `\n\n중요:\n` +
    `- social_proof는 절대 생성하지 마세요. selection_reasons(정확히 3개)로 대체.\n` +
    `- how_to는 생성하지 마세요. section_toggles.how_to: false로 설정.\n` +
    `- category_key 필드에 "${categoryKey || ''}" 를 넣으세요.\n` +
    `- details.blocks의 headline에 기능명/기술명/성분명 넣지 마세요. 체감 결과만.\n` +
    `- problem의 pain_points는 구체적 상황+감정으로. "딜레마" 같은 추상어 금지.\n` +
    `- problem.bridge에 "해결하세요/시작하세요" 같은 명령형 금지. "~라면?", "~라면 어떨까요?" 질문형 귀결만.\n` +
    `- FAQ 답변에 "충분합니다/가능합니다/문제 없습니다/괜찮습니다" 절대 금지. 반드시 완곡 판단형으로.\n`;

  if (categoryKey === 'food') {
    prompt +=
      `\n[HIGHLIGHT RULE - 식품 전용]\n` +
      `- highlight_value에 숫자(0~9) 1개라도 있으면 실패. 성분 요약어(고단백/저칼로리)도 금지.\n` +
      `  ❌ "30g 고단백" / "10일 든든" / "2분 완성" → ✅ "부담 없는 한 끼" / "넉넉한 구성" / "뜯어서 바로"\n` +
      `\n=== FOOD DETAILS 강제 구조 ===\n` +
      `details.blocks는 정확히 3개. slide_label을 아래 한국어 값으로 정확히 고정하세요.\n\n` +
      `(1) blocks[0] — slide_label: "식감"\n` +
      `  - headline에 반드시 "촉촉" 또는 "퍽퍽" 중 1개 포함\n` +
      `  - body: 신체 감각 묘사 (씹힘, 목넘김, 입안 느낌)\n` +
      `  - ⚠️ 이 블록의 headline과 body에 조리/시간/도구 단어 금지!\n` +
      `    ("전자레인지", "2분", "조리", "해동", "간편" 포함 시 실패)\n\n` +
      `(2) blocks[1] — slide_label: "먹는 장면"\n` +
      `  - headline: 일상 상황 중심\n` +
      `  - body에 아래 키워드 중 3개 이상 반드시 포함:\n` +
      `    [아침, 출근, 운동 후, 도시락, 야식, 간식, 퇴근, 점심, 저녁]\n\n` +
      `(3) blocks[2] — slide_label: "먹는 습관"\n` +
      `  - headline: 반드시 "처음엔"으로 시작!\n` +
      `  - body: 반드시 "처음엔" + "지금은" + "계속" 3개 단어 모두 포함!\n` +
      `  - 예: "처음엔 다이어트용으로 시작했지만, 지금은 냉동실에 넣어두고 계속 찾게 됩니다"\n` +
      `  - ⚠️ 이 블록을 조리/맛/경제성 등 다른 주제로 바꾸면 실패!\n` +
      `\n⚠️ 조리 편의(전자레인지, 2분, 해동 등)는 Hero와 Benefits에서만 언급하세요.\n` +
      `Details 블록 안에서 조리 편의를 언급하면 실패합니다!\n` +
      `\n=== CTA 톤 강제 ===\n` +
      `"~하세요/~마세요" 어미가 CTA 어디에든 있으면 실패!\n` +
      `"~하실 건가요?" 같은 행동 유도 질문도 금지!\n\n` +
      `[좋은 예시 3개]\n` +
      `1) headline: "이번엔 끝까지 먹어볼 수 있을지도?" / sub_text: "퍽퍽함 없이 촉촉하게, 부담 없는 한 끼" / urgency: "냉동실 한 칸만 비워두면 됩니다"\n` +
      `2) headline: "억지로 먹는 닭가슴살, 계속할 필요 없습니다" / sub_text: "소스 없이도 부드럽게 넘어가는 식감" / urgency: "한 번 맛보면 알게 됩니다"\n` +
      `3) headline: "이런 닭가슴살이라면 어떨까요?" / sub_text: "냉동실에서 꺼내면 2분 뒤엔 따뜻한 한 끼" / urgency: "당분간 걱정 없는 구성입니다"\n\n` +
      `[나쁜 예시 — 절대 금지!]\n` +
      `- "시작하실 건가요?" / "지치셨나요?" / "낭비하실 건가요?" ← 압박 질문\n` +
      `- "해결하세요" / "경험해보세요" / "주문하세요" / "확보하세요" / "포기하지 마세요" ← 명령형\n`;
  } else {
    prompt +=
      `\n[HIGHLIGHT RULE - 반드시 지킬 것]\n` +
      `- benefits의 highlight_value에 칩명/인치/시간/해상도/숫자단위 직접 표기 절대 금지!\n` +
      `  ❌ "A14 바이오닉" → ✅ "끊김 없는 속도"\n` +
      `  ❌ "10.9인치" → ✅ "넓은 작업 화면"\n` +
      `  ❌ "10시간" → ✅ "하루 종일 OK"\n` +
      `  ❌ "2360x1640" → ✅ "글씨도 또렷"\n` +
      `  ❌ "가성비" → ✅ "절반 가격에 핵심 기능"\n` +
      `- highlight_value는 4~8자의 체감 판정 문장만 허용. 숫자가 들어가면 실패.\n`;
  }

  prompt += `- JSON만 출력하세요. 설명이나 코드블록 없이 순수 JSON만.`;

  return prompt;
}


// -----------------------------
// 6) Validator
// -----------------------------
function validateProductJSON(json: any): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const requiredRoot = ['schema_version', 'platform', 'hero', 'benefits', 'details', 'specs', 'cta'];
  requiredRoot.forEach(key => {
    if (!json[key]) errors.push(`필수 필드 누락: ${key}`);
  });

  const recommended = ['selection_reasons', 'category_key', 'section_toggles'];
  recommended.forEach(key => {
    if (!json[key]) warnings.push(`권장 필드 누락: ${key}`);
  });

  if (json.schema_version && json.schema_version !== '5.2') errors.push(`schema_version이 5.2가 아님`);

  const placeholderPattern = /\{\{.*?\}\}|\[placeholder\]|\[TBD\]|\[TODO\]/gi;
  const allText = JSON.stringify(json);
  if (placeholderPattern.test(allText)) errors.push('Placeholder 발견');

  const prohibited = ['치료', '완치', '의학적 효능', '100% 보장', '100% 효과', '세계 최초', '업계 최고', '무조건', '부작용 없'];
  const jsonCopy = { ...json };
  delete jsonCopy.seller_overrides;
  const contentText = JSON.stringify(jsonCopy);
  prohibited.forEach(word => {
    if (contentText.includes(word)) errors.push(`금지 표현: "${word}"`);
  });

  const lc: [string, any, number][] = [
    ['hero.product_title', json.hero?.product_title, 40],
    ['hero.hook_line', json.hero?.hook_line, 60],
    ['hero.sub_hook', json.hero?.sub_hook, 80],
    ['cta.headline', json.cta?.headline, 30],
    ['cta.sub_text', json.cta?.sub_text, 60],
  ];
  lc.forEach(([f, v, m]) => {
    if (v && typeof v === 'string' && v.length > (m as number))
      errors.push(`글자수 초과: ${f} (${(v as string).length}>${m})`);
  });

  if (json.social_proof) warnings.push('social_proof가 생성됨 — selection_reasons로 대체 권장');
  if (json.how_to) warnings.push('how_to가 생성됨 — 6컷 규칙상 제거 권장');

  const reasons = json.selection_reasons?.items;
  if (reasons) {
    if (!Array.isArray(reasons)) warnings.push('selection_reasons.items는 배열이어야 함');
    else if (reasons.length !== 3) warnings.push(`selection_reasons.items는 3개 권장 (현재 ${reasons.length})`);
  }

  // Details headline에 기술명 감지
  const techTerms = ['retina', 'oled', 'amoled', 'bionic', '바이오닉', 'snapdragon', 'mediatek', 'usb-c', 'thunderbolt', 'wifi', 'wi-fi', 'bluetooth'];
  const detailBlocks = json.details?.blocks ?? [];
  detailBlocks.forEach((b: any, i: number) => {
    const hl = (b.headline ?? '').toLowerCase();
    techTerms.forEach(term => {
      if (hl.includes(term)) warnings.push(`details.blocks[${i}].headline에 기술명 "${term}" 감지 — 체감 결과로 변경 권장`);
    });
  });

  // FAQ 단답 감지
  const faqItems = json.faq?.items ?? [];
  const shortEndings = ['충분합니다', '가능합니다', '문제 없습니다', '있습니다'];
  faqItems.forEach((f: any, i: number) => {
    const ans = f.answer ?? '';
    if (ans.length < 30) warnings.push(`faq.items[${i}].answer가 너무 짧음 (${ans.length}자) — 완곡 판단형으로 보강 권장`);
    shortEndings.forEach(ending => {
      if (ans.endsWith(ending) && ans.length < 20) warnings.push(`faq.items[${i}].answer 단답 감지: "${ending}"`);
    });
  });

  // Benefits highlight에 스펙 직노출 감지
  const specPatterns = [/^\d{3,}/, /x\d{3,}/, /mah/i, /gb$/i, /ghz/i];
  const benefitItems = json.benefits?.items ?? [];
  benefitItems.forEach((b: any, i: number) => {
    const hl = b.highlight_value ?? '';
    specPatterns.forEach(pat => {
      if (pat.test(hl)) warnings.push(`benefits.items[${i}].highlight_value에 스펙 숫자 감지: "${hl}" — 체감 판정으로 변경 권장`);
    });
  });

  // Bridge 명령형 감지
  const bridge = json.problem?.bridge ?? '';
  const imperativeBridge = /(해결하세요|바꾸세요|선택하세요|시작하세요|해보세요)/;
  if (imperativeBridge.test(bridge)) {
    warnings.push(`problem.bridge에 명령형 감지: "${bridge}" — 귀결형으로 변경 권장`);
  }

  if (json.category_key === 'electronics') {
    if (json.specs?.comparison?.enabled !== true) {
      warnings.push('전자/가전: specs.comparison.enabled=true 권장');
    }
    const compItems = json.specs?.comparison?.items ?? [];
    const compText = JSON.stringify(compItems);
    const brandPattern = /(삼성|애플|lg|샤오미|sony|소니|갤럭시|아이폰|맥북)/i;
    if (brandPattern.test(compText)) {
      warnings.push('비교표에 브랜드명 감지 — "일반적인 ○○"로 변경 권장');
    }
  }

  // Food-specific validation
  if (json.category_key === 'food') {
    if (json.specs?.comparison?.enabled !== true) {
      warnings.push('식품: specs.comparison.enabled=true 권장');
    }

    // Benefits highlight에 성분 수치 감지
    const foodSpecPatterns = [/\d+g/i, /\d+kcal/i, /\d+mg/i, /\d+%/, /고단백/, /저칼로리/, /저지방/];
    const foodBenefitItems = json.benefits?.items ?? [];
    foodBenefitItems.forEach((b: any, i: number) => {
      const hl = b.highlight_value ?? '';
      foodSpecPatterns.forEach(pat => {
        if (pat.test(hl)) warnings.push(`[식품] benefits.items[${i}].highlight_value에 성분수치/성분요약 감지: "${hl}"`);
      });
      if (/\d/.test(hl)) warnings.push(`[식품] benefits.items[${i}].highlight_value에 숫자 감지: "${hl}"`);
    });

    // === HARD FAIL: Details 블록 구조 검증 (한국어 라벨) ===
    const foodBlocks = json.details?.blocks ?? [];
    if (foodBlocks.length === 3) {
      const b0 = foodBlocks[0], b1 = foodBlocks[1], b2 = foodBlocks[2];

      // 라벨 체크 (한국어 고정)
      if (b0?.slide_label !== '식감') errors.push('FOOD: blocks[0].slide_label이 "식감"이 아님 (현재: "' + (b0?.slide_label ?? '') + '")');
      if (b1?.slide_label !== '먹는 장면') errors.push('FOOD: blocks[1].slide_label이 "먹는 장면"이 아님 (현재: "' + (b1?.slide_label ?? '') + '")');
      if (b2?.slide_label !== '먹는 습관') errors.push('FOOD: blocks[2].slide_label이 "먹는 습관"이 아님 (현재: "' + (b2?.slide_label ?? '') + '")');

      // 식감 블록 앵커: 촉촉/퍽퍽
      const hasJuicy = (s: any) => typeof s === 'string' && (s.includes('촉촉') || s.includes('퍽퍽'));
      if (!hasJuicy(b0?.headline) && !hasJuicy(b0?.body)) {
        errors.push('FOOD: 식감 블록(headline 또는 body)에 "촉촉" 또는 "퍽퍽" 필수');
      }

      // 먹는 장면 블록: 장면 키워드 3개 이상
      const scenesAll = `${b1?.headline ?? ''} ${b1?.body ?? ''}`;
      const sceneWords = ['아침', '출근', '운동 후', '운동후', '도시락', '야식', '간식', '퇴근', '점심', '저녁'];
      const sceneHits = sceneWords.filter(w => scenesAll.includes(w)).length;
      if (sceneHits < 3) errors.push(`FOOD: 먹는 장면 블록에 장면 키워드 ${sceneHits}개 (3개 이상 필요)`);

      // 먹는 습관 블록: 처음엔 + 지금은 + 계속
      const routineAll = `${b2?.headline ?? ''} ${b2?.body ?? ''}`;
      ['처음엔', '지금은', '계속'].forEach(w => {
        if (!routineAll.includes(w)) errors.push(`FOOD: 먹는 습관 블록에 앵커 "${w}" 누락`);
      });

      // === HARD FAIL: 조리 편의 Details 격리 ===
      // Details 전체 블록에서 조리 관련 키워드 감지 → error
      const cookingWords = ['전자레인지', '2분', '조리', '해동', '간편'];
      foodBlocks.forEach((b: any, i: number) => {
        const blockText = `${b.headline ?? ''} ${b.body ?? ''}`;
        cookingWords.forEach(w => {
          if (blockText.includes(w)) errors.push(`FOOD: details.blocks[${i}]에 조리 편의 키워드 "${w}" 감지 — Details에서 조리 언급 금지 (Hero/Benefits에서만 허용)`);
        });
      });
    }

    // === HARD FAIL: CTA 명령형/압박 체크 ===
    const ctaText = JSON.stringify(json.cta ?? {});
    const ctaImperative = /(하세요|해보세요|시작하세요|해결하세요|확보하세요|주문하세요|확인하세요|마세요)/;
    if (ctaImperative.test(ctaText)) {
      errors.push(`FOOD: CTA에 명령형 감지 — "~하세요/~마세요" 계열 금지`);
    }
    const ctaPressure = /(지치셨나요|시간 낭비|낭비하실|미루실|후회|망설이|하실 건가요)/;
    if (ctaPressure.test(ctaText)) {
      errors.push(`FOOD: CTA에 압박형 표현 감지`);
    }

    // 비교표에 숫자 과다 감지 (warning 유지)
    const foodCompItems = json.specs?.comparison?.items ?? [];
    const foodCompText = JSON.stringify(foodCompItems);
    const digitMatches = foodCompText.match(/\d+/g) ?? [];
    if (digitMatches.length > 4) {
      warnings.push(`[식품] 비교표에 숫자 ${digitMatches.length}개 감지 — 체감 언어 비교 권장`);
    }

    // FAQ에 식품용 단답 감지 (warning 유지)
    const foodFaqItems = json.faq?.items ?? [];
    const foodShortEndings = ['괜찮습니다', '문제 없습니다', '가능합니다', '충분합니다'];
    foodFaqItems.forEach((f: any, i: number) => {
      const ans = f.answer ?? '';
      foodShortEndings.forEach(ending => {
        if (ans.endsWith(ending)) warnings.push(`[식품] faq.items[${i}].answer 단답 감지: "${ending}"`);
      });
    });

    // Details headline에 성분명 직접 노출 감지 (warning 유지)
    const ingredientTerms = ['단백질', '칼로리', '탄수화물', '지방', '나트륨', 'kcal', '비타민', '콜라겐', '유산균'];
    foodBlocks.forEach((b: any, i: number) => {
      const hl = (b.headline ?? '').toLowerCase();
      ingredientTerms.forEach(term => {
        if (hl.includes(term)) warnings.push(`[식품] details.blocks[${i}].headline에 성분명 "${term}" 감지`);
      });
    });
  }

  const nowPattern = /이제\s*(바로|곧|당장)?\s*(하세요|해보세요|사용하세요|확인하세요)/g;
  const imperativePattern = /(하세요|해보세요|바로\s*하세요)/g;
  const hitsNow = (contentText.match(nowPattern) ?? []).length;
  const hitsImp = (contentText.match(imperativePattern) ?? []).length;
  if (hitsNow >= 1) warnings.push(`명령형 패턴("이제~하세요") 감지: ${hitsNow}회`);
  if (hitsImp >= 6) warnings.push(`명령형 어미 과다: ${hitsImp}회`);

  return { valid: errors.length === 0, errors, warnings };
}


// -----------------------------
// 7) Main server
// -----------------------------
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
      },
    });
  }

  try {
    const body = await req.json();

    if (!body.product_title || !body.platform) {
      return new Response(JSON.stringify({ error: 'product_title과 platform은 필수' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY 미설정' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Category detection + prompt composition
    const categoryKey = inferCategoryKey(body);
    const categoryPreset = categoryKey ? (CATEGORY_PRESETS[categoryKey] ?? '') : '';
    const systemPrompt = categoryPreset
      ? `${SYSTEM_PROMPT}\n\n${categoryPreset}`
      : SYSTEM_PROMPT;

    const userPrompt = buildUserPrompt(body, categoryKey);
    const start = Date.now();

    const MAX_ATTEMPTS = categoryKey === 'food' ? 2 : 1;
    let lastJson: any = null;
    let lastValidation: any = null;
    let totalLlmTime = 0;
    let attempt = 0;

    for (attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const attemptStart = Date.now();

      // Build prompt — on retry, append error feedback
      let currentPrompt = userPrompt;
      if (attempt > 1 && lastValidation?.errors?.length > 0) {
        currentPrompt += `\n\n[⚠️ 이전 생성에서 다음 오류가 발생했습니다. 반드시 수정하세요!]\n`;
        lastValidation.errors.forEach((e: string) => {
          currentPrompt += `- ${e}\n`;
        });
        currentPrompt += `위 오류를 모두 수정한 JSON을 다시 생성하세요.\n`;
        console.log(`RETRY attempt ${attempt}: feeding back ${lastValidation.errors.length} errors`);
      }

      // Claude API call
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          temperature: 0.3,
          system: systemPrompt,
          messages: [{ role: 'user', content: currentPrompt }],
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        return new Response(
          JSON.stringify({ error: `Claude API 오류: ${response.status} ${errBody}` }),
          { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const data = await response.json();
      totalLlmTime += Date.now() - attemptStart;

      const stopReason = data.stop_reason ?? 'unknown';
      console.log(`CLAUDE attempt ${attempt} stop_reason:`, stopReason);

      const rawText = (data.content ?? [])
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('');

      console.log('RAW length:', rawText.length);
      console.log('RAW tail(200):', rawText.slice(-200));

      if (stopReason === 'max_tokens') {
        console.warn('WARNING: Claude output was truncated (max_tokens reached)');
      }

      // Emergency JSON extraction
      const candidate = extractJsonObject(rawText);

      try {
        lastJson = JSON.parse(candidate);
      } catch (_e: any) {
        console.error('JSON PARSE ERROR:', _e?.message);
        if (attempt === MAX_ATTEMPTS) {
          return new Response(
            JSON.stringify({
              error: 'JSON 파싱 실패',
              parse_error: _e?.message,
              stop_reason: stopReason,
              raw_length: rawText.length,
              candidate_length: candidate.length,
              raw_head: candidate.substring(0, 300),
              raw_tail: candidate.slice(-300),
            }),
            { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        }
        continue; // retry on parse error
      }

      // Validate
      lastValidation = validateProductJSON(lastJson);
      console.log(`Attempt ${attempt} validation: valid=${lastValidation.valid}, errors=${lastValidation.errors.length}, warnings=${lastValidation.warnings.length}`);

      if (lastValidation.valid || attempt === MAX_ATTEMPTS) {
        break; // success or last attempt — use this result
      }
      // else: loop continues to retry
    }

    const llm_time_ms = totalLlmTime;

    return new Response(
      JSON.stringify({
        status: lastValidation.valid ? 'complete' : 'validation_warning',
        json: lastJson,
        validation: lastValidation,
        llm_time_ms,
        category_detected: categoryKey,
        attempts: attempt,
      }),
      {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (err: any) {
    console.error('UNHANDLED ERROR:', err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
