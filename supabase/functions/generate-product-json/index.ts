import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// -----------------------------
// 1) Category presets
// -----------------------------
const CATEGORY_PRESETS: Record<string, string> = {
  electronics: `
## [카테고리 프리셋: 전자/가전] (강제 적용)
목표: "셀러가 수정 없이 바로 올릴 수 있는" 프로급 전자/가전 상세페이지.

### (A) 톤/문장 규칙
- 문장 비율: 단정문 70% / 설명문 20% / 질문문 10% 이하
- 감탄/호소 금지: "대박", "강력", "최고", "엄청", "무조건", "놓치면", "지금 당장" 금지
- 명령형 남발 금지: "이제 ~하세요", "~해보세요" 반복 금지 (특히 Hero/CTA)
- 추상 형용사 금지: "좋다/강력하다/프리미엄" 대신 구체적 체감/상황으로 작성
- Hero/CTA는 결과 진술 + 질문형 중심으로 작성

### (B) 정보 표현 규칙
- 스펙마다 체감 문장 1개 필수 (예: "4000mAh → 하루 종일 충전 없이 사용")
- 비교 필수: specs.comparison.enabled=true
  - 브랜드/모델 직접 언급 금지. "일반 제품", "보통 ○○" 형태로만 비교
- Details 마지막 문장은 반드시 체감 결과로 종결

### (C) Hero 구조 (강제)
- hook_line: "상황 진술 → 문제 → 해결 결과" 흐름의 1문장
- sub_hook: 사용 상황 2개 이상 + 장면+체감 중심
- "이제 ~하세요" 같은 명령형 훅 금지

### (D) 섹션 운영
- social_proof 사용 금지. selection_reasons(선택 이유 3가지)로 대체
- 선택 이유는 "주장"이 아니라 "근거+체감" 조합으로 작성
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
    '냉장고','에어컨','세탁기','건조기','전자레인지','로봇청소기'
  ];

  if (electronicsKeywords.some(k => t.includes(k))) return 'electronics';
  return null;
}

// -----------------------------
// 3) System prompt (v5.2 + selection_reasons)
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

## 설득 밀도 규칙 (쿠팡/네이버 상위권 문법)
[RULE 01] 기능이 아니라 장면을 쓴다 — description에 고객 사용 장면 필수
[RULE 02] 혜택 옆에 손실 암시 — benefits 중 2개 이상에 "없으면 ~" 암시
[RULE 03] Hero에 사용 상황 나열 — sub_hook에 최소 2개 사용 상황
[RULE 04] Details 마지막은 체감 결과 — "~느낄 수 있습니다"로 종결
[RULE 05] Specs 수치에 일상 번역 — "4000mAh → 하루 종일 사용"
[RULE 06] FAQ는 반박 제거 — 절반 이상 부정/의심 질문
[RULE 07] Problem은 경험형 — "~하게 됩니다" 체험 문장
[RULE 08] CTA에 이탈 방지 질문 — "~하실 건가요?" 형태

## 전역 품질 규칙
- social_proof(가짜 후기)는 절대 생성하지 않는다.
- 대신 selection_reasons(선택 이유 3가지)를 생성한다.
- selection_reasons는 "후기"가 아니라 "이 제품을 선택해야 하는 근거"이다.

## 플랫폼별 톤
- coupang: 직관적, 모바일 가독성, 큰 임팩트, 문제→해결→확신
- naver: 정보 밀도 높게, 의심 해소형, 상세 설명
- shopify: 깔끔하고 간결한 글로벌 톤

## JSON 스키마 (v5.2) — 이 구조 정확히 따를 것

{
  "schema_version": "5.2",
  "mode": { "type": "production", "relaxed_rules": false },
  "platform": "coupang|naver|shopify",
  "output_format": "image",
  "style": "trust_dense|minimal|premium|tech_pro|cute",
  "language": "ko",
  "category_key": "electronics|food|beauty|fashion|living|null",
  "section_toggles": {
    "problem": true|false,
    "selection_reasons": true|false,
    "how_to": true|false,
    "faq": true|false
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
    "hook_line": "max 60자 — 체감 결과 중심 USP",
    "sub_hook": "max 80자 — 사용 상황 2개 이상",
    "badge": "max 20자 (선택)",
    "primary_image_index": 0
  },
  "problem": {
    "headline": "max 30자",
    "pain_points": [
      { "icon": "이모지", "text": "max 50자 — 경험형 문장" }
    ],
    "bridge": "max 60자"
  },
  "benefits": {
    "section_title": "max 20자",
    "items": [
      {
        "icon": "이모지",
        "title": "max 15자",
        "description": "max 40자 — 장면 중심",
        "highlight_value": "max 15자 (선택, 숫자 강조)"
      }
    ]
  },
  "details": {
    "blocks": [
      {
        "slide_label": "max 20자 (예: POINT 01)",
        "headline": "max 30자",
        "body": "max 150자 — 마지막 문장은 체감 결과",
        "image_index": 0,
        "bg_tone": "warm|cool|fresh|neutral"
      }
    ]
  },
  "selection_reasons": {
    "headline": "max 20자",
    "items": [
      { "icon": "이모지", "title": "max 20자", "text": "max 90자 — 근거+체감 중심" }
    ]
  },
  "specs": {
    "section_title": "max 20자",
    "rows": [
      { "label": "max 10자", "value": "max 40자 — 수치에 일상 번역" }
    ],
    "comparison": {
      "enabled": true|false,
      "items": [
        { "label": "string", "ours": "string", "others": "string" }
      ]
    }
  },
  "how_to": {
    "section_title": "max 20자",
    "steps": [
      { "step_number": 1, "title": "max 15자", "description": "max 50자" }
    ]
  },
  "faq": {
    "section_title": "max 20자",
    "items": [
      { "question": "max 40자 — 절반 이상 부정/의심형", "answer": "max 100자" }
    ]
  },
  "cta": {
    "headline": "max 30자 — 질문형 권장",
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
- details.blocks: 2~4개 (권장 3개)
- specs.rows: 4~10개
- cta.trust_badges: 2~4개
- problem.pain_points: 3~4개
- faq.items: 3~5개
- how_to.steps: 3~5개
- selection_reasons.items: 정확히 3개`;


// -----------------------------
// 4) User prompt builder
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
    `- category_key 필드에 "${categoryKey || ''}" 를 넣으세요.\n` +
    `- JSON만 출력하세요. 설명이나 코드블록 없이 순수 JSON만.`;

  return prompt;
}


// -----------------------------
// 5) Validator
// -----------------------------
function validateProductJSON(json: any): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields (core only)
  const requiredRoot = ['schema_version', 'platform', 'hero', 'benefits', 'details', 'specs', 'cta'];
  requiredRoot.forEach(key => {
    if (!json[key]) errors.push(`필수 필드 누락: ${key}`);
  });

  // Recommended fields (warnings, not errors)
  const recommended = ['selection_reasons', 'category_key', 'section_toggles'];
  recommended.forEach(key => {
    if (!json[key]) warnings.push(`권장 필드 누락: ${key}`);
  });

  if (json.schema_version && json.schema_version !== '5.2') errors.push(`schema_version이 5.2가 아님`);

  // Placeholder detection
  const placeholderPattern = /\{\{.*?\}\}|\[placeholder\]|\[TBD\]|\[TODO\]/gi;
  const allText = JSON.stringify(json);
  if (placeholderPattern.test(allText)) errors.push('Placeholder 발견');

  // Prohibited claims
  const prohibited = ['치료', '완치', '의학적 효능', '100% 보장', '100% 효과', '세계 최초', '업계 최고', '무조건', '부작용 없'];
  const jsonCopy = { ...json };
  delete jsonCopy.seller_overrides;
  const contentText = JSON.stringify(jsonCopy);
  prohibited.forEach(word => {
    if (contentText.includes(word)) errors.push(`금지 표현: "${word}"`);
  });

  // Length checks
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

  // social_proof should NOT exist
  if (json.social_proof) warnings.push('social_proof가 생성됨 — selection_reasons로 대체 권장');

  // selection_reasons validation
  const reasons = json.selection_reasons?.items;
  if (reasons) {
    if (!Array.isArray(reasons)) warnings.push('selection_reasons.items는 배열이어야 함');
    else if (reasons.length !== 3) warnings.push(`selection_reasons.items는 3개 권장 (현재 ${reasons.length})`);
  }

  // Electronics-specific checks
  if (json.category_key === 'electronics') {
    if (json.specs?.comparison?.enabled !== true) {
      warnings.push('전자/가전: specs.comparison.enabled=true 권장');
    }
    // Brand name detection in comparison
    const compItems = json.specs?.comparison?.items ?? [];
    const compText = JSON.stringify(compItems);
    const brandPattern = /(삼성|애플|lg|샤오미|sony|소니|갤럭시|아이폰|맥북)/i;
    if (brandPattern.test(compText)) {
      warnings.push('비교표에 브랜드명 감지 — "일반적인 ○○"로 변경 권장');
    }
  }

  // Tone warnings
  const nowPattern = /이제\s*(바로|곧|당장)?\s*(하세요|해보세요|사용하세요|확인하세요)/g;
  const imperativePattern = /(하세요|해보세요|바로\s*하세요)/g;
  const hitsNow = (contentText.match(nowPattern) ?? []).length;
  const hitsImp = (contentText.match(imperativePattern) ?? []).length;
  if (hitsNow >= 1) warnings.push(`명령형 패턴("이제~하세요") 감지: ${hitsNow}회`);
  if (hitsImp >= 6) warnings.push(`명령형 어미 과다: ${hitsImp}회`);

  return { valid: errors.length === 0, errors, warnings };
}


// -----------------------------
// 6) Main server
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

    // Build user prompt
    const userPrompt = buildUserPrompt(body, categoryKey);
    const start = Date.now();

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
        max_tokens: 3200,
        temperature: 0.5,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
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
    const rawText = (data.content ?? [])
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('');
    const llm_time_ms = Date.now() - start;

    // Parse JSON
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    let json: any;
    try {
      json = JSON.parse(cleaned);
    } catch (_e) {
      return new Response(
        JSON.stringify({ error: 'JSON 파싱 실패', raw: cleaned.substring(0, 500) }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Validate
    const validation = validateProductJSON(json);

    return new Response(
      JSON.stringify({
        status: validation.valid ? 'complete' : 'validation_warning',
        json,
        validation,
        llm_time_ms,
        category_detected: categoryKey,
      }),
      {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
