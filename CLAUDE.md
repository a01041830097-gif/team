# 팀 주간업무보고 — 개발 명세서 (CLAUDE.md)

> **이 문서의 목적**: 본 프로젝트에 대한 사전 맥락이 전혀 없는 개발자가 이 문서 하나만 읽고 전체 시스템을 구현할 수 있도록 모든 결정 사항·스키마·인터페이스·규칙을 구체적으로 기술한다.
> **문서 버전**: 1.0 · **상태**: 구현 착수 가능(Build-ready)

---

## 0. 문서 사용법 / 표기 규칙

- `[필수]` 반드시 구현, `[권장]` 권장 기본값(팀 합의로 변경 가능), `[가정]` 명시 결정이 없어 작성자가 정한 기본값(부록 C 참고).
- 코드/식별자: 컴포넌트·타입 `PascalCase`, 함수·변수 `camelCase`, 상수 `UPPER_SNAKE_CASE`, DB 컬럼·테이블 `snake_case`.
- 모든 날짜/주차 계산의 기준 시간대는 **KST(Asia/Seoul)** 이다. 별도 언급이 없으면 KST를 의미한다.
- 함수는 20줄 이내를 지향하고 모든 I/O·외부 호출은 `try-catch`로 감싼다(8.x, 12.x 규약).

---

## 1. 용어 정의 (Glossary)

| 용어 | 정의 |
| --- | --- |
| 팀원(Member) | 주간 업무를 작성하는 일반 사용자. 총 11명. 모두 동등 권한. |
| 관리자(Admin) | 계정 관리 및 모든 보고 수정·삭제 권한을 가진 사용자. |
| 업무 항목(work report) | 특정 팀원이 특정 날짜에 작성한 1건의 업무 기록. Tiptap 본문 + 첨부로 구성. |
| 출장·근태(attendance) | 특정 팀원이 특정 날짜에 남기는 자유 텍스트 일정/근태 기록. |
| 종합 페이지(weekly board) | 한 주(월~일)의 모든 팀원 업무·근태를 한 화면에 보여주는 메인 화면. |
| 주차(week) | 월요일 00:00 ~ 일요일 23:59:59 (KST) 범위. 주차 식별자는 그 주 월요일의 날짜(`yyyy-MM-dd`). |
| 첨부(attachment) | 업무 항목에 연결된 이미지 파일. Supabase Storage에 저장. |

---

## 2. 제품 개요 및 범위

### 2.1 한 줄 정의
팀원들이 매주 금주 실적과 차주 계획을 작성하고, 팀 전체가 주간 단위로 업무·팀 일정을 한눈에 확인·검색하는 사내 웹 서비스.

### 2.2 범위(In Scope)
- 이메일+비밀번호 로그인 / 비밀번호 재설정 / 비밀번호 변경
- 주간 종합 보드(월~일, 주차 이동, 이번 주 자동 진입)
- 날짜별 업무 작성·수정·삭제(본인 한정), 전체 열람(공개)
- 이미지 첨부(본문 삽입 + 파일 첨부)
- 출장·근태 자유 텍스트 작성
- 검색(키워드 + 작성자 + 기간)
- 관리자(계정 관리 + 전체 보고 수정·삭제)
- 데스크탑/모바일 반응형

### 2.3 범위 외(Out of Scope) — 본 버전 미구현
- 알림/리마인더(이메일·푸시), 댓글, 좋아요/리액션
- 보고 마감·승인 워크플로우, 결재
- 통계 대시보드, 엑셀 내보내기
- 다크모드, 다국어
> 위 항목은 부록 B(향후 과제)에 보관.

---

## 3. 사용자 역할 및 권한 매트릭스

| 동작 | 비로그인 | 팀원(본인) | 팀원(타인 자료) | 관리자 |
| --- | --- | --- | --- | --- |
| 페이지 접근 | ✕ | ○ | ○ | ○ |
| 종합/검색 열람 | ✕ | ○(전체) | ○(전체) | ○(전체) |
| 업무 작성 | ✕ | ○ | — | ○ |
| 업무 수정 | ✕ | ○ | ✕ | ○(모두) |
| 업무 삭제(하드) | ✕ | ○ | ✕ | ○(모두) |
| 근태 작성/수정/삭제 | ✕ | ○(본인) | ✕ | ○(모두) |
| 본인 비밀번호 변경 | ✕ | ○ | — | ○ |
| 계정 생성/비활성/비번 초기화 | ✕ | ✕ | ✕ | ○ |

원칙: **읽기는 전체 공개, 쓰기는 본인 한정(관리자는 전체)**. 이 규칙은 RLS(8.4)와 Server Action(12)에서 **이중으로** 강제한다.

---

## 4. 기술 스택 및 핵심 의존성

| 영역 | 선택 | 버전 기준 |
| --- | --- | --- |
| 런타임/프레임워크 | Next.js (App Router) | 15.x `[가정]` |
| 언어 | TypeScript | 5.x |
| UI 라이브러리 | React | 19.x (Next 15 동반) |
| 스타일 | Tailwind CSS | 3.4.x `[가정]` |
| 컴포넌트 | shadcn/ui (Radix 기반) | 최신 CLI |
| 백엔드 | Supabase (Auth/Postgres/Storage) | 클라우드 |
| 서버 로직 | Next.js Server Actions | — |
| Supabase SDK | `@supabase/supabase-js`, `@supabase/ssr` | 최신 안정 |
| 에디터 | Tiptap (`@tiptap/react`, StarterKit, Image) | 2.x |
| 검증 | Zod | 3.x |
| 날짜 | `date-fns`, `date-fns-tz` | 최신 |
| 배포 | Vercel | — |

설치 가정: Node.js LTS(20+), 패키지 매니저는 `pnpm` `[권장]`(npm/yarn 가능).

---

## 5. 환경 변수 및 설정

`.env.local`(로컬) 및 Vercel 환경 변수에 동일하게 등록한다.

| 키 | 노출 | 용도 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트 | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트 | 공개(anon) 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용** | 관리자 계정 생성/초기화 등 특권 작업. 절대 클라이언트 번들에 포함 금지 |
| `NEXT_PUBLIC_SITE_URL` | 클라이언트 | 비밀번호 재설정 리다이렉트 base URL (예: `https://report.회사.com`) |

규칙: `SUPABASE_SERVICE_ROLE_KEY`는 **Server Actions / Route Handler에서만** 사용. `NEXT_PUBLIC_*` 외 키는 클라이언트 컴포넌트에서 import 금지.

---

## 6. 시스템 아키텍처

```
[브라우저 데스크탑/모바일]
        │ HTTPS
        ▼
┌───────────────────────────── Next.js (Vercel) ─────────────────────────────┐
│ middleware.ts        : 세션 검사 → 비로그인 시 /login 리다이렉트             │
│ Server Components     : 데이터 조회(SELECT) 후 서버 렌더링                   │
│ Client Components     : Tiptap, 폼, 검색 UI, 표↔카드 전환                    │
│ Server Actions        : INSERT/UPDATE/DELETE + 권한·검증 + revalidatePath    │
│ Route Handlers(필요시): 비밀번호 재설정 콜백 등                              │
└──────────────────────────────────────────────────────────────────────────┘
        │ @supabase/ssr (쿠키 세션)                 │ service role (서버 전용)
        ▼                                           ▼
┌─────────────────────────────── Supabase ──────────────────────────────────┐
│ Auth(이메일+비번)  Postgres(+RLS)  Storage(work-images 버킷)                │
└──────────────────────────────────────────────────────────────────────────┘
```

데이터 접근 규칙:
- **읽기**: 가능한 한 Server Component에서 Supabase 서버 클라이언트로 직접 조회.
- **쓰기**: 반드시 Server Action을 통해서만 수행(클라이언트에서 직접 INSERT/UPDATE 금지).
- **권한**: RLS(DB) + Server Action 내 검증(앱) **이중 방어**.

---

## 7. 디렉터리 구조

```
src/
├─ app/
│  ├─ (auth)/
│  │  ├─ login/page.tsx                # 로그인
│  │  └─ reset-password/page.tsx       # 비밀번호 재설정(메일 링크 진입)
│  ├─ (main)/
│  │  ├─ layout.tsx                    # 상단바/햄버거 네비 포함 보호 레이아웃
│  │  ├─ page.tsx                      # 종합 보드(이번 주). ?week=yyyy-MM-dd 지원
│  │  ├─ report/[date]/page.tsx        # 날짜별 작성/상세 (date=yyyy-MM-dd)
│  │  ├─ search/page.tsx               # 검색
│  │  └─ me/page.tsx                   # 마이페이지(비밀번호 변경)
│  ├─ admin/
│  │  ├─ layout.tsx                    # 관리자 가드
│  │  ├─ members/page.tsx              # 팀원 계정 관리
│  │  └─ reports/page.tsx              # 전체 보고 관리(수정·삭제)
│  ├─ layout.tsx                       # 루트 레이아웃(폰트, Toaster)
│  └─ globals.css                      # Tailwind + 디자인 토큰
├─ components/
│  ├─ ui/                              # shadcn 생성 컴포넌트
│  ├─ nav/ (TopNav, MobileNavSheet)
│  ├─ board/ (WeekNavigator, WeeklyTable, MobileDayAccordion, WorkItemCard, AttendanceRow, EmptyCell)
│  ├─ report/ (WorkEditorForm, AttachmentUploader, ReadonlyWorkItem, AttendanceForm)
│  ├─ search/ (SearchFilters, SearchResultList)
│  └─ editor/ (TiptapEditor, TiptapToolbar)
├─ lib/
│  ├─ supabase/ (client.ts, server.ts, middleware.ts, admin.ts)
│  ├─ actions/ (auth.ts, work.ts, attendance.ts, attachment.ts, admin.ts)
│  ├─ date/ (kst.ts)                   # KST 주차·포맷 유틸 (10장)
│  ├─ validation/ (schemas.ts)         # Zod 스키마 (12장)
│  ├─ html.ts                          # HTML→평문 변환(content_text)
│  └─ types.ts                         # 공용 타입(DB Row, ActionResult)
└─ middleware.ts                       # 인증 가드 진입점
```

---

## 8. 데이터 모델

### 8.1 ERD 요약
```
auth.users 1───1 profiles
profiles   1───N work_reports 1───N attachments   (work 삭제 시 attachment CASCADE)
profiles   1───N attendances
```
유일성 규칙: 한 팀원은 **하루에 근태 1건**만 가진다 → `attendances(author_id, work_date)` UNIQUE. 업무 항목은 하루에 여러 건 가능.

### 8.2 테이블 DDL `[필수]`
```sql
-- 확장: 부분일치 검색용
create extension if not exists pg_trgm;

-- 1) 사용자 프로필 (auth.users와 1:1)
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  email      text not null unique,
  role       text not null default 'member' check (role in ('member','admin')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) 업무 항목
create table public.work_reports (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles(id) on delete cascade,
  work_date    date not null,                 -- KST 일자
  content_html text not null default '',       -- Tiptap 본문(HTML)
  content_text text not null default '',       -- 검색용 평문(HTML 제거)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 3) 출장·근태 (하루 1건)
create table public.attendances (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles(id) on delete cascade,
  work_date  date not null,
  content    text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (author_id, work_date)
);

-- 4) 첨부(업무 항목 종속)
create table public.attachments (
  id             uuid primary key default gen_random_uuid(),
  work_report_id uuid not null references public.work_reports(id) on delete cascade,
  storage_path   text not null,    -- 예: {author_id}/{work_date}/{uuid}.png
  file_url       text not null,    -- 공개 URL
  file_name      text not null,
  file_size      integer not null,
  mime_type      text not null,
  created_at     timestamptz not null default now()
);
```

### 8.3 인덱스 `[필수]`
```sql
create index idx_work_reports_date   on public.work_reports(work_date);
create index idx_work_reports_author on public.work_reports(author_id);
create index idx_work_reports_text   on public.work_reports using gin (content_text gin_trgm_ops);
create index idx_attendances_date    on public.attendances(work_date);
create index idx_attachments_report  on public.attachments(work_report_id);
```

### 8.4 트리거: updated_at 자동 갱신 `[필수]`
```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql as $func$
begin
  new.updated_at = now();
  return new;
end;
$func$;

create trigger trg_work_reports_updated
  before update on public.work_reports
  for each row execute function public.set_updated_at();

create trigger trg_attendances_updated
  before update on public.attendances
  for each row execute function public.set_updated_at();
```

### 8.5 RLS 정책 `[필수]`
원칙: 로그인 사용자는 전체 SELECT, 쓰기는 본인 행만, 관리자는 전체 쓰기.
```sql
-- 관리자 판별 헬퍼 (RLS 재귀 방지를 위해 security definer)
create or replace function public.is_admin()
returns boolean language sql security definer stable as $fn$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.is_active
  );
$fn$;

alter table public.profiles     enable row level security;
alter table public.work_reports enable row level security;
alter table public.attendances  enable row level security;
alter table public.attachments  enable row level security;

-- profiles
create policy profiles_select on public.profiles
  for select to authenticated using (true);
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- 주의: 일반 팀원의 role/is_active 변경은 Server Action에서 차단(앱 레벨).

-- work_reports
create policy work_select on public.work_reports
  for select to authenticated using (true);
create policy work_insert on public.work_reports
  for insert to authenticated with check (author_id = auth.uid());
create policy work_update on public.work_reports
  for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
create policy work_delete on public.work_reports
  for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- attendances (work_reports와 동일 패턴)
create policy att_select on public.attendances
  for select to authenticated using (true);
create policy att_insert on public.attendances
  for insert to authenticated with check (author_id = auth.uid());
create policy att_update on public.attendances
  for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
create policy att_delete on public.attendances
  for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- attachments (소속 업무의 작성자/관리자만 쓰기)
create policy atc_select on public.attachments
  for select to authenticated using (true);
create policy atc_insert on public.attachments
  for insert to authenticated with check (
    exists (select 1 from public.work_reports w
            where w.id = work_report_id
              and (w.author_id = auth.uid() or public.is_admin()))
  );
create policy atc_delete on public.attachments
  for delete to authenticated using (
    exists (select 1 from public.work_reports w
            where w.id = work_report_id
              and (w.author_id = auth.uid() or public.is_admin()))
  );
```

### 8.6 Storage 버킷 및 정책 `[필수]`
- 버킷명: `work-images`, **public** 읽기(`[가정]`; 민감도 낮음). 쓰기/삭제는 본인 폴더만.
- 경로 규칙: `work-images/{author_id}/{work_date}/{uuid}.{ext}`
```sql
-- 읽기: 로그인 사용자 전체
create policy work_images_read on storage.objects
  for select to authenticated using (bucket_id = 'work-images');
-- 업로드: 본인 폴더만
create policy work_images_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'work-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
-- 삭제: 본인 폴더 또는 관리자
create policy work_images_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'work-images'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
```
업로드 제약(앱·버킷 양쪽 강제): 허용 MIME `image/jpeg, image/png, image/webp, image/gif`, 최대 `10MB`.

### 8.7 신규 가입 시 profiles 자동 생성 `[권장]`
관리자가 `auth.admin.createUser`로 사용자를 만들 때 Server Action에서 `profiles`도 함께 insert(12.5). 트리거 방식 대신 앱에서 명시 생성하여 name/role을 함께 세팅한다.

---

## 9. 인증 및 세션

### 9.1 Supabase 클라이언트 (`lib/supabase/`)
- `client.ts` — 브라우저용(`createBrowserClient`, anon key). 클라이언트 컴포넌트 전용.
- `server.ts` — 서버용(`createServerClient`, 쿠키 연동). Server Component/Action에서 사용.
- `middleware.ts` — 미들웨어에서 세션 갱신/검사용 클라이언트.
- `admin.ts` — **service role** 클라이언트. 관리자 Server Action에서만 import. (`auth: { persistSession: false }`)

### 9.2 미들웨어 가드 (`middleware.ts`) `[필수]`
- 모든 경로에 적용하되 정적 자원/`/login`/`/reset-password`는 예외.
- 동작: 세션 없으면 `/login`으로 리다이렉트. 로그인 상태로 `/login` 접근 시 `/`로 리다이렉트.
- `/admin/**`는 추가로 `profiles.role = 'admin'` 확인 → 아니면 `/`로 리다이렉트(서버에서 재확인, 11.7).
```
matcher: ['/((?!_next/static|_next/image|favicon.ico|api/public).*)']
```

### 9.3 로그인 / 로그아웃
- 로그인: 이메일+비밀번호 → `signInWithPassword`. 실패 시 "이메일 또는 비밀번호가 올바르지 않습니다." 노출(어느 쪽 틀렸는지 비공개).
- 비활성 계정(`is_active=false`)은 로그인 후 즉시 차단(레이아웃에서 검사 → 로그아웃 + 안내).
- 로그아웃: `signOut` → `/login`.

### 9.4 비밀번호 재설정(이메일 링크)
1. `/login`의 "비밀번호 찾기" → 이메일 입력 → `resetPasswordForEmail(email, { redirectTo: ${NEXT_PUBLIC_SITE_URL}/reset-password })`.
2. 메일 링크 클릭 → `/reset-password` 진입(복구 세션) → 새 비밀번호 입력 → `updateUser({ password })`.
3. 보안상 "존재하지 않는 이메일"도 동일하게 "메일을 보냈습니다" 응답.

### 9.5 비밀번호 변경(마이페이지 `/me`)
- 로그인 상태에서 새 비밀번호 입력 → `updateUser({ password })`. 정책: 최소 8자(12.1).

### 9.6 계정 생성(관리자 전용)
- 일반 회원가입 화면 없음. 관리자가 `/admin/members`에서 생성(12.5).
- 초기 비밀번호는 관리자가 설정하거나 임시발급 후 팀원이 9.5로 변경.

---

## 10. 날짜·주차 유틸 (KST) — `lib/date/kst.ts`

기준: **월요일 시작, 일요일 종료**. 타임존 `Asia/Seoul`. 모두 순수 함수, 입력/출력은 `yyyy-MM-dd` 문자열 또는 명시 객체.

| 함수 | 시그니처 | 설명 |
| --- | --- | --- |
| `getKstToday` | `() => string` | 오늘(KST) `yyyy-MM-dd` |
| `getWeekStart` | `(dateStr: string) => string` | 해당 날짜가 속한 주의 **월요일** `yyyy-MM-dd` |
| `getWeekRange` | `(weekStart: string) => { start: string; end: string; days: WeekDay[] }` | 월~일 7일 |
| `getCurrentWeekStart` | `() => string` | 이번 주 월요일 |
| `shiftWeek` | `(weekStart: string, delta: number) => string` | delta주 이동(±) |
| `formatDateLabel` | `(dateStr: string) => string` | 표시용 라벨(예: `6/1(월)`) |

```ts
export type WeekDay = {
  date: string;        // yyyy-MM-dd (KST)
  weekdayKo: string;   // 월~일
  isToday: boolean;
};
```
구현 메모: `date-fns-tz`의 `toZonedTime`/`formatInTimeZone`로 KST 변환 후 계산. 월요일 시작은 `startOfWeek(d, { weekStartsOn: 1 })`. **서버·클라이언트 모두 동일 함수 사용**(불일치 방지).

엣지 케이스: 자정 경계, 월/연 경계(예: 12/30(월)~1/5(일))에서도 동일 주차로 묶여야 한다(테스트 21.x).

---

## 11. 라우트(화면) 명세

각 페이지는 다음을 정의한다: URL · 접근권한 · 입력(쿼리/파라미터) · 데이터 조회 · 주요 컴포넌트 · 상태(로딩/빈/에러) · 동작.

### 11.1 `/login` (비로그인)
- 입력: 없음.
- UI: 서비스명, 이메일/비밀번호 `Input`, 로그인 `Button`, "비밀번호 찾기" 링크.
- 동작: `signInAction`(12.1). 성공 → `/`. 실패 → 인라인 에러 + `Toast`.
- 상태: 제출 중 버튼 로딩/비활성.

### 11.2 `/reset-password` (비로그인, 복구 세션)
- 입력: 메일 링크의 복구 토큰(Supabase가 세션화).
- UI: 새 비밀번호/확인 `Input`, 저장 `Button`.
- 동작: `updatePasswordAction`. 성공 → `/login` 안내. 토큰 만료 → 재요청 안내.

### 11.3 `/` 종합 보드 (로그인) `[필수·핵심]`
- 입력(쿼리): `?week=yyyy-MM-dd`(생략 시 이번 주 월요일).
- 데이터: 해당 주(월~일) 범위의 `work_reports`(+작성자 name, 첨부 개수), `attendances`(+name)를 한 번에 조회. 작성자명은 `profiles` join.
- 데스크탑 UI(`WeeklyTable`):
  - 1행: 요일 헤더(월~일) + 날짜 라벨. 오늘 열 강조.
  - 「업무」 영역: 날짜별 열에 `WorkItemCard`(작성자 배지 + 본문 요약 + 첨부 아이콘) 세로 나열. 항목 수에 따라 자동 증가.
  - 「출장·근태」 행: 날짜별 `AttendanceRow`(작성자명 + 내용).
  - 빈 셀: `EmptyCell`("+ 작성").
  - 셀/날짜 클릭 → `/report/{date}`.
- 모바일 UI(`MobileDayAccordion`): 상단 `WeekNavigator` + 요일 칩 고정, 요일 탭 시 해당 날짜의 업무·근태 목록 펼침. 항목 탭 → `/report/{date}`.
- 공통: 상단 `WeekNavigator`(◀ 이전 / 주 범위 + "이번 주" 배지 / 다음 ▶). 이동 시 `?week=` 변경(URL 동기화).
- 상태: 로딩(Skeleton), 빈 주(안내 문구), 조회 에러(재시도 안내).

### 11.4 `/report/[date]` 날짜별 작성·상세 (로그인) `[필수·핵심]`
- 파라미터: `date = yyyy-MM-dd`(유효성 검사, 잘못된 형식 → 404/안내).
- 데이터: 그 날짜의 모든 `work_reports`(+작성자, 첨부), 본인 `attendance`.
- UI 구성:
  - 헤더: 날짜 라벨 + "종합으로" 링크.
  - 본인 작성 영역: `WorkEditorForm`(Tiptap 본문 + `AttachmentUploader`) — 새 항목 추가 / 기존 본인 항목 수정·삭제.
  - 타인 항목: `ReadonlyWorkItem`(작성자명 + 본문 + 첨부 보기). 편집 버튼 없음.
  - 근태: `AttendanceForm`(본인 1건 upsert) + 타인 근태 읽기 표시.
- 동작: 작성/수정/삭제 → 각 Server Action(12.2~12.4) → `revalidatePath('/')` + 현재 경로.
- 권한: 본인 항목에만 수정/삭제 버튼 노출. 서버에서도 재검증.
- 상태: 저장 중 비활성, 성공/실패 `Toast`, 삭제 시 `AlertDialog` 확인.

### 11.5 `/search` 검색 (로그인) `[필수]`
- 입력(쿼리 동기화): `?q=&author=&from=&to=`.
- UI: `SearchFilters`(키워드 `Input`, 작성자 `Select`(전체 + 11명), 기간 `Calendar`/`Popover` from~to), 검색 `Button`.
- 데이터: `content_text ILIKE %q%`(pg_trgm) AND `author_id = author?` AND `work_date BETWEEN from AND to`. 최신순 정렬.
- 결과: `SearchResultList`(목록형, 항목당 날짜·작성자·본문 미리보기) → 클릭 시 `/report/{date}`로 이동.
- 상태: 결과 없음 안내, 검색 중 로딩.

### 11.6 `/me` 마이페이지 (로그인)
- UI: 내 이름/이메일(읽기), 비밀번호 변경 폼.
- 동작: `updatePasswordAction`(본인 세션).

### 11.7 `/admin/**` 관리자 (관리자 전용)
- 가드: `admin/layout.tsx`에서 서버 측 `role==='admin'` 확인. 아니면 `/`로.
- `/admin/members`: 팀원 목록 표(`Table`), 계정 생성 `Dialog`, 비활성 토글, 비밀번호 초기화 버튼.
- `/admin/reports`: 전체 보고 검색/목록 + 수정·삭제(관리자 권한).
- 동작: 12.5 관리자 액션. 위험 동작은 `AlertDialog` 확인.

---

## 12. Server Actions 명세 (`lib/actions/`)

### 12.0 공통 규약
- 모든 액션은 `'use server'`. 반환 타입 통일:
```ts
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
```
- 절차(모든 쓰기 액션 공통):
  1) 세션 확인(없으면 `UNAUTHENTICATED`).
  2) Zod로 입력 검증(실패 시 `VALIDATION`).
  3) 권한 확인(본인/관리자, 실패 시 `FORBIDDEN`).
  4) Supabase 작업(`try-catch`, 실패 시 `DB_ERROR`).
  5) `revalidatePath` 후 `{ ok: true }` 반환.
- 에러 코드: `UNAUTHENTICATED | FORBIDDEN | VALIDATION | NOT_FOUND | DB_ERROR | STORAGE_ERROR | CONFLICT`.
- 사용자 메시지는 한국어, 내부 원인은 로깅(민감정보 제외).

### 12.1 인증 (`actions/auth.ts`)
```ts
signInAction(input: { email: string; password: string }): Promise<ActionResult>
requestPasswordResetAction(input: { email: string }): Promise<ActionResult>
updatePasswordAction(input: { password: string }): Promise<ActionResult> // 본인 세션
signOutAction(): Promise<ActionResult>
```
검증: email 형식, password 최소 8자.

### 12.2 업무 (`actions/work.ts`)
```ts
createWorkReportAction(input: {
  workDate: string;        // yyyy-MM-dd
  contentHtml: string;     // Tiptap HTML
  attachmentIds?: string[];// 사전 업로드된 첨부 연결(또는 업로드 후 연결)
}): Promise<ActionResult<{ id: string }>>

updateWorkReportAction(input: {
  id: string; contentHtml: string;
}): Promise<ActionResult>

deleteWorkReportAction(input: { id: string }): Promise<ActionResult> // 하드 삭제
```
규칙:
- `author_id`는 세션 사용자로 **서버에서 강제**(클라이언트 값 무시).
- `content_text`는 서버에서 `contentHtml`을 평문 변환(`lib/html.ts`)하여 저장.
- 수정/삭제: 대상 행 `author_id === auth.uid()` 또는 관리자만(아니면 `FORBIDDEN`).
- 삭제 시 연결 첨부의 Storage 파일 정리 후 행 삭제(CASCADE로 DB row 삭제, Storage는 코드로 삭제).
- `workDate` 형식·실존 검증.

### 12.3 근태 (`actions/attendance.ts`)
```ts
upsertAttendanceAction(input: { workDate: string; content: string }): Promise<ActionResult>
deleteAttendanceAction(input: { workDate: string }): Promise<ActionResult>
```
규칙: `(author_id, work_date)` UNIQUE 기준 upsert. 본인만. `content` 최대 1000자.

### 12.4 첨부 (`actions/attachment.ts`)
```ts
// 업로드는 클라이언트가 Storage로 직접 수행(서명/공개), 메타데이터만 서버에 기록
registerAttachmentAction(input: {
  workReportId: string; storagePath: string; fileUrl: string;
  fileName: string; fileSize: number; mimeType: string;
}): Promise<ActionResult<{ id: string }>>

deleteAttachmentAction(input: { id: string }): Promise<ActionResult>
```
규칙:
- 업로드 전 클라이언트 1차 검증(MIME/10MB), 서버 2차 검증.
- 소속 업무의 작성자/관리자만 등록·삭제 가능.
- 삭제 시 Storage 파일 + DB row 함께 제거.
- 업로드 플로우 상세는 14장.

### 12.5 관리자 (`actions/admin.ts`) — service role 사용
```ts
createMemberAction(input: { email: string; name: string; initialPassword: string; role?: 'member'|'admin' }): Promise<ActionResult<{ id: string }>>
setMemberActiveAction(input: { userId: string; isActive: boolean }): Promise<ActionResult>
resetMemberPasswordAction(input: { userId: string; newPassword?: string }): Promise<ActionResult> // 미지정 시 임시발급
adminUpdateReportAction(input: { id: string; contentHtml: string }): Promise<ActionResult>
adminDeleteReportAction(input: { id: string }): Promise<ActionResult>
```
규칙:
- **호출 전 반드시 관리자 검증**(`is_admin`/role 재확인). 비관리자 → `FORBIDDEN`.
- `createMemberAction`: `auth.admin.createUser`로 인증 사용자 생성 → `profiles` insert(name/role). 이메일 중복 → `CONFLICT`.
- 일반 팀원의 role/is_active 변경은 이 액션(관리자)으로만 가능. 팀원 자기 자신은 변경 불가.

---

## 13. 컴포넌트 인벤토리

설치할 shadcn 컴포넌트: `button input label form card table badge avatar dialog alert-dialog select calendar popover sheet accordion separator tabs skeleton sonner(toast) dropdown-menu`.

핵심 커스텀 컴포넌트(주요 props):

| 컴포넌트 | 위치 | props(요약) | 책임 |
| --- | --- | --- | --- |
| `TopNav` | nav | `user, isAdmin` | 데스크탑 상단 메뉴 |
| `MobileNavSheet` | nav | `user, isAdmin` | 모바일 햄버거(`Sheet`) |
| `WeekNavigator` | board | `weekStart, isCurrentWeek` | 주차 이동(URL `?week=`) |
| `WeeklyTable` | board | `weekDays, workItemsByDate, attendanceByDate` | 데스크탑 격자 표 |
| `MobileDayAccordion` | board | 동일 데이터 | 모바일 카드/아코디언 |
| `WorkItemCard` | board | `item, canEdit` | 업무 카드(작성자 배지+요약) |
| `AttendanceRow` | board | `date, items` | 근태 표시 |
| `EmptyCell` | board | `date` | 빈 셀 "작성" |
| `TiptapEditor` | editor | `value, onChange, onImageUpload` | 본문 에디터 |
| `WorkEditorForm` | report | `date, initial?` | 작성/수정 폼(액션 연결) |
| `AttachmentUploader` | report | `workReportId?, onUploaded` | 첨부 업로드 |
| `SearchFilters` | search | `members` | 검색 필터(URL 동기화) |
| `SearchResultList` | search | `results` | 결과 목록 |

작성자 표시 규칙: `Avatar`(이름 이니셜) + 이름 텍스트 `Badge`. 업무·근태 모두 동일 적용.

---

## 14. 에디터(Tiptap) 및 이미지 업로드

### 14.1 에디터 구성
- `StarterKit`(굵게/기울임/목록/제목/링크 등) + `Image` 확장.
- 출력: `editor.getHTML()` → `contentHtml`로 저장. 저장 직전 서버에서 평문화하여 `content_text` 생성.
- 보안: 저장/표시 시 HTML 살균(sanitize) `[필수]`(허용 태그 화이트리스트). 표시 측에서도 신뢰 HTML만 렌더.

### 14.2 이미지 업로드 플로우(본문 삽입 & 파일 첨부 공통)
1. 클라이언트 1차 검증: MIME ∈ {jpeg,png,webp,gif}, size ≤ 10MB. 위반 시 즉시 거부 + 안내.
2. Storage 업로드: 경로 `{auth.uid()}/{workDate}/{uuid}.{ext}`로 `work-images` 버킷에 put.
3. 공개 URL 획득.
4. 본문 삽입: 에디터에 `<img src=URL>` 삽입(본문 일부로 저장됨).
   파일 첨부: 업무 저장 후 `registerAttachmentAction`으로 메타데이터 기록(`attachments`).
5. 삭제: 첨부 삭제 시 Storage 객체 + `attachments` row 동시 삭제. 업무 삭제 시 일괄 정리(12.2).

주의: 본문 내 인라인 이미지는 `content_html`에 URL로 포함되어 별도 첨부 레코드 없이도 표시 가능. "파일 첨부"는 목록형 관리를 위해 `attachments`에 기록.

---

## 15. 검색 명세

- 입력: `q`(키워드, 선택) / `author`(profiles.id, 선택) / `from`,`to`(날짜 범위, 선택).
- 쿼리: `work_reports`에서
  - `q` → `content_text ILIKE '%q%'`(공백 trim, 빈 값이면 조건 제외)
  - `author` → `author_id = author`
  - 기간 → `work_date >= from AND work_date <= to`(둘 중 하나만 와도 동작)
- 정렬: `work_date DESC, created_at DESC`. 페이지네이션 `[권장]`(20건/페이지).
- 결과 항목: 날짜 라벨, 작성자명, 본문 미리보기(평문 80자) + 클릭 시 `/report/{date}`.
- 모바일: 필터를 `Sheet` 또는 접이식으로 제공.

---

## 16. 관리자 기능 명세

- `/admin/members`
  - 목록: 이름·이메일·역할·활성 상태.
  - 계정 생성(`Dialog`): 이메일·이름·초기 비밀번호·역할 → `createMemberAction`.
  - 비활성/활성 토글 → `setMemberActiveAction`(비활성 사용자는 로그인 차단).
  - 비밀번호 초기화 → `resetMemberPasswordAction`(임시 비번 표시 또는 메일 안내).
- `/admin/reports`
  - 전체 보고 검색/목록 + 수정(`adminUpdateReportAction`)·삭제(`adminDeleteReportAction`).
  - 삭제는 `AlertDialog` 확인 필수.
- 모든 관리자 액션은 호출 전 관리자 검증(12.5). 감사 로그 `[권장]`.

---

## 17. 디자인 시스템

### 17.1 테마
- **라이트 고정**(다크모드 미지원). 배경 백색 기반, 회색 단계로 영역 구분.

### 17.2 컬러 토큰 (shadcn HSL CSS 변수, `globals.css`) `[가정]`
"차분한 파랑"을 primary로 사용. 값은 가이드이며 톤 조정 가능.
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 20% 18%;
  --primary: 217 71% 45%;          /* 차분한 파랑 */
  --primary-foreground: 0 0% 100%;
  --secondary: 215 16% 95%;
  --muted: 215 16% 95%;
  --muted-foreground: 215 12% 45%;
  --border: 215 16% 88%;
  --ring: 217 71% 45%;
  --destructive: 0 72% 51%;        /* 삭제/위험 */
  --success: 142 55% 40%;          /* 성공 */
  --warning: 32 90% 50%;           /* 경고 */
  --radius: 0.5rem;
}
```
사용: 주요 버튼/링크/활성 탭/오늘 강조 = primary. 삭제 버튼 = destructive. 토스트 상태색 매핑.

### 17.3 타이포 / 간격
- 폰트: Pretendard `[권장]`(한글 가독성). fallback system-ui.
- 본문 기본 15~16px, 표 셀 14px. 표 셀 패딩 충분히(터치 고려).
- 작성자 배지: 작은 텍스트 + Avatar 이니셜.

### 17.4 브레이크포인트
- 전환 기준 `md`(768px). `md` 이상 = 데스크탑 표, 미만 = 모바일 카드.

---

## 18. 반응형 규칙(상세)

- 동일 데이터(주간 업무·근태)를 **단일 데이터 소스**로 받아 화면 폭에 따라 표(`WeeklyTable`) ↔ 카드(`MobileDayAccordion`)만 전환. 데이터 재요청 없음.
- 데스크탑 표: 요일 헤더 7열 고정, 업무 항목 많아지면 셀 내부 세로 스택. 가로 스크롤은 지양(부득이할 때만 컨테이너 스크롤 + 헤더 고정).
- 모바일: 주차 네비 + 요일 칩 sticky 상단. 한 번에 한 날짜 펼침(아코디언). 오늘 자동 펼침 `[권장]`.
- 터치 타깃 ≥ 40px. 에디터/업로드 버튼 모바일 사용성 확보.

---

## 19. 에러 처리 및 검증 규칙(전역)

### 19.1 검증(Zod, `lib/validation/schemas.ts`)
- email: 이메일 형식. password: 최소 8자(공백 불가) `[가정]`.
- workDate/from/to: `^\d{4}-\d{2}-\d{2}$` + 실존 날짜.
- contentHtml: 비어있지 않음(텍스트 1자 이상), 최대 길이 제한 `[권장]` 50,000자.
- attendance.content: 0~1000자.
- 파일: MIME 화이트리스트 + 10MB.

### 19.2 에러 표면화
- Server Action 실패 → `ActionResult.error` → 화면 인라인 메시지 + `Toast(sonner)`.
- 예측 못한 예외 → 경계 컴포넌트(`error.tsx`)에서 안전 화면 + 재시도.
- 빈 상태/로딩 상태 컴포넌트 명시(Skeleton, 안내 문구).

### 19.3 코딩 규약
- 함수 20줄 이내 지향, 단일 책임. 외부 호출은 `try-catch`.
- 클라이언트에서 DB 직접 변경 금지(반드시 Server Action).
- 매직 넘버는 상수화(`MAX_FILE_SIZE = 10 * 1024 * 1024`).
- lint(ESLint) 무오류 상태로만 머지. 타입 `any` 지양.

---

## 20. 비기능 요구사항

- **보안**: RLS + 앱 이중검증, service role 키 서버 전용, HTML sanitize, 비밀번호 정책, 비활성 계정 차단.
- **성능**: 주간 조회는 인덱스 활용 단일 라운드트립 목표. RSC로 초기 렌더 최소화.
- **접근성**: 키보드 포커스/대비, 라벨/aria, shadcn 기본 접근성 유지.
- **가용성**: Vercel 기본 가동. 환경 변수 누락 시 빌드/기동 단계에서 명확히 실패.
- **유지보수**: 타입·스키마 단일 출처, 컴포넌트 폴더 규약 준수.

---

## 21. 수용 기준(Acceptance Criteria) 및 테스트 시나리오

Given/When/Then 형식. 각 항목은 테스트 포인트이자 단계 완료 판정 기준이다.

### 21.1 인증
- 비로그인으로 `/`·`/report/*`·`/search` 접근 → `/login` 리다이렉트.
- 올바른 이메일+비번 로그인 → `/`로 이동, 상단에 본인 이름 표시.
- 비활성 계정 로그인 → 차단 + 안내, 세션 종료.
- 비밀번호 재설정: 메일 링크 → 새 비번 설정 → 새 비번으로 로그인 성공.

### 21.2 종합 보드
- 접속 시 기본으로 **이번 주(KST 월~일)** 표시, "이번 주" 배지 노출.
- 이전/다음 주 이동 시 URL `?week=` 갱신 및 해당 주 데이터 표시.
- 모든 팀원의 업무·근태가 날짜별로 보인다(전체 공개).
- 각 업무·근태 항목에 작성자 이름이 보인다.
- 데스크탑=표, 모바일(<768px)=카드/아코디언으로 동일 데이터 표시.
- 연/월 경계 주(예: 12/30~1/5)도 한 주로 정확히 묶인다.

### 21.3 작성/수정/삭제
- 날짜 칸/항목 클릭 → `/report/{date}` 진입.
- 본인 업무 작성(Tiptap) 저장 → 종합·상세에 즉시 반영(revalidate).
- 본인 항목만 수정/삭제 버튼 노출. 타인 항목은 읽기 전용.
- 타인 항목 수정/삭제를 강제로 호출해도 서버에서 `FORBIDDEN`(RLS+액션).
- 과거 주 항목도 수정·삭제 가능(마감 제한 없음).
- 삭제는 하드 삭제. 첨부가 있던 경우 Storage 파일도 사라진다.

### 21.4 첨부/이미지
- 10MB 초과 또는 비허용 형식 업로드 → 거부 + 안내.
- 본문 삽입 이미지가 저장 후에도 표시된다.
- 첨부 파일 삭제 시 화면·Storage·DB에서 모두 제거.

### 21.5 근태
- 본인 근태는 하루 1건(같은 날 재작성=수정). 자유 텍스트 저장·표시.
- 타인 근태는 읽기만.

### 21.6 검색
- 키워드만/작성자만/기간만, 그리고 조합 검색이 모두 동작.
- 결과는 최신순, 항목에 날짜·작성자 표시, 클릭 시 해당 상세로 이동.
- 결과 없음 시 안내.

### 21.7 관리자
- 관리자만 `/admin/**` 접근(비관리자는 `/`로).
- 계정 생성/비활성/비번 초기화 동작.
- 관리자는 임의 팀원 보고 수정·삭제 가능.

### 21.8 공통
- 데스크탑/모바일 모두에서 보고·작성·조회·열람·검색 가능.
- 모든 표시 날짜·주차가 KST 기준.
- lint·타입체크·빌드 무오류.

---

## 22. 개발 로드맵 (UI 우선 → 기능 연결)

전략: 모든 화면을 더미 데이터로 먼저 구현(Phase 1) 후 기능을 연결한다. 각 Phase는 DoD(완료 기준)를 만족해야 다음으로 진행.

| Phase | 내용 | 완료 기준(DoD) |
| --- | --- | --- |
| 0. 셋업 | Next.js+TS+Tailwind+shadcn, Supabase 프로젝트, env, 폴더·KST 유틸 골격 | 로컬·Vercel 빌드 성공, shadcn 렌더, lint 통과 |
| 1. UI 전체(더미) | 로그인/종합/상세/검색/마이/관리자 정적 구현, 네비, 표↔카드 전환 | 전 화면 라우팅·반응형 동작, 더미 표시, lint 통과 |
| 2. 인증 | Supabase Auth, SSR 세션, 미들웨어, 비번 재설정/변경 | 보호 라우트 차단, 로그인/로그아웃/재설정 정상, role 구분 |
| 3. DB/RLS | 테이블·인덱스·트리거·RLS·Storage 정책 | 본인 쓰기/전체 읽기/관리자 전체 확인, 비인가 차단 |
| 4. 종합 조회 | 이번 주 자동, 주차 이동, 업무·근태 조회 렌더 | 실데이터 표/카드 표시, 주차·KST 경계 정확 |
| 5. 작성/수정/삭제 | Server Actions, Tiptap, 이미지/첨부, 근태 | 작성→반영, 권한 차단, 첨부 업로드/삭제, 과거 수정 |
| 6. 검색 | 키워드+작성자+기간, 최신순 결과 | 단독·조합 동작, 모바일 사용성 |
| 7. 관리자 | 계정 관리, 전체 보고 수정·삭제 | 관리자 전용 접근, 전체 관리 동작 |
| 8. QA/배포 | 반응형·접근성·에러처리, 도메인 연결 | 전 기능 통과, 무오류 빌드, 도메인+로그인 게이트 |

각 Phase 종료 시 21장의 해당 시나리오로 검수한다.

---

## 부록 A. 데이터 흐름 빠른 참조
- 조회: 브라우저 → RSC(`/`,`/report/[date]`,`/search`) → Supabase(server client, RLS) → 렌더.
- 쓰기: 클라이언트 폼 → Server Action(검증·권한) → Supabase → `revalidatePath` → 화면 갱신.
- 이미지: 클라이언트 검증 → Storage 업로드 → URL → (본문 삽입) 또는 `registerAttachmentAction`.

## 부록 B. 향후 과제(현재 범위 외)
알림/리마인더, 댓글/리액션, 마감·승인 워크플로우, 통계 대시보드, 엑셀 내보내기, 다크모드, 다국어, 한국어 형태소 기반 검색 고도화.

## 부록 C. 작성자 결정 `[가정]` 목록 (착수 전 확인 권장)
1. 프레임워크/스타일 버전(Next 15, Tailwind 3.4) — 최신 안정으로 조정 가능.
2. 비밀번호 정책 최소 8자.
3. Storage 버킷 public 읽기(민감도 낮음 가정). 필요 시 서명 URL로 전환.
4. primary 컬러 HSL 구체값(차분한 파랑 톤) — 디자인 검토 시 미세 조정.
5. 검색 페이지네이션 20건/페이지.
6. 패키지 매니저 pnpm.
이 항목들은 합의되면 본문 `[가정]` 표기를 `[확정]`으로 갱신한다.

## 부록 D. 첨부 원본(요구사항) 표 형식
종합 보드는 첨부 이미지 형식을 따른다: 주차별로 상단 요일/날짜 헤더(월~일), 그 아래 「업무」 다행(팀원들이 항목 추가 시 증가), 하단 「출장·근태」 행. 데스크탑은 이 격자를 그대로, 모바일은 날짜별 카드로 표현한다.

