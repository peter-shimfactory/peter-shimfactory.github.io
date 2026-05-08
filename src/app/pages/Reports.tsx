import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { InfoTooltip } from "../components/InfoTooltip";
import { useProContext } from "../contexts/ProContext";
import { ExternalLink, Lock, ChevronRight, Star, MessageSquare } from "lucide-react";
import { cn } from "../../utils/cn";

// ─── 통계 데이터 (기존 그대로) ─────────────────────────────────────────────────
const salesData = [
  { name: "월", 매출: 120 },
  { name: "화", 매출: 150 },
  { name: "수", 매출: 180 },
  { name: "목", 매출: 140 },
  { name: "금", 매출: 210 },
  { name: "토", 매출: 250 },
  { name: "일", 매출: 190 },
];

// ─── 이번 주 리포트 데이터 (첨부 HTML 기반) ──────────────────────────────────
const THIS_WEEK = {
  period: "2026년 5월 4주차",
  headline: "대체로 맑음, 하지만 배송엔 민감",
  summary:
    "이번 주 리뷰의 85%가 긍정적이었어요. 특히 '소재의 부드러움'에 감동한 고객이 많았습니다.",
  avgSatisfaction: 4.8,
  positiveRate: 85,
  unanswered: 12,
  keywords: [
    { tag: "#실물깡패", count: 12, bg: "bg-gray-100", text: "text-gray-700" },
    { tag: "#빠른배송", count: 8, bg: "bg-blue-50", text: "text-blue-700" },
    { tag: "#단추불안", count: 3, bg: "bg-red-50", text: "text-red-700" },
    { tag: "#단골예정", count: 15, bg: "bg-green-50", text: "text-green-700" },
  ],
};

// ─── 이전 주간 리포팅 목록 (주문 상품 키워드 중심 목업) ─────────────────────
const PREV_REPORTS = [
  {
    id: 1,
    period: "5월 3주차",
    topic: "봄 가디건 시리즈 재구매율 역대 최고",
    keywords: ["#봄가디건", "#소재만족", "#재구매"],
    satisfaction: 4.7,
  },
  {
    id: 2,
    period: "5월 2주차",
    topic: "린넨 블라우스 단추 품질 피드백 집중",
    keywords: ["#린넨블라우스", "#단추불량", "#CS급증"],
    satisfaction: 4.5,
  },
  {
    id: 3,
    period: "5월 1주차",
    topic: "어버이날 선물 수요로 배송 문의 폭증",
    keywords: ["#로맨틱가디건", "#선물포장", "#배송지연"],
    satisfaction: 4.6,
  },
  {
    id: 4,
    period: "4월 4주차",
    topic: "체리블라썸 원피스 품절 대기 수요 급증",
    keywords: ["#체리원피스", "#품절임박", "#재입고요청"],
    satisfaction: 4.9,
  },
  {
    id: 5,
    period: "4월 3주차",
    topic: "봄 신상 언박싱 후기 긍정 반응 급증",
    keywords: ["#봄신상", "#언박싱", "#기대이상"],
    satisfaction: 4.8,
  },
];

// ─── 전체 리포트 HTML (새 창 출력용) ─────────────────────────────────────────
function buildFullReportHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>업텐도 C/S &amp; 리뷰 위클리 보이스</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Pretendard',-apple-system,sans-serif;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
    style="max-width:600px;margin:20px auto;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);">

    <tr>
      <td style="padding:40px 30px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);text-align:center;">
        <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;font-weight:600;letter-spacing:2px;">CUSTOMER VOICE REPORT</p>
        <h1 style="color:#ffffff;margin:10px 0 0 0;font-size:26px;font-weight:800;">이번 주 고객의 마음 온도</h1>
        <div style="margin-top:20px;display:inline-block;background:rgba(255,255,255,0.2);padding:8px 20px;border-radius:30px;color:#ffffff;font-size:14px;">
          평균 만족도 <span style="font-size:18px;font-weight:800;">4.8 / 5.0</span>
        </div>
      </td>
    </tr>

    <tr>
      <td style="padding:40px 30px 20px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="60" style="vertical-align:top;"><div style="font-size:40px;">🌡️</div></td>
            <td>
              <h3 style="margin:0;font-size:18px;color:#1a202c;">"대체로 맑음, 하지만 배송엔 민감"</h3>
              <p style="margin:8px 0 0 0;font-size:15px;color:#4a5568;line-height:1.6;">
                이번 주 리뷰의 85%가 긍정적이었어요. 특히 <b>'소재의 부드러움'</b>에 감동한 고객이 많았습니다.
                다만, 금요일 오후 주문자들의 배송 재촉 문의가 평소보다 12% 증가했네요.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:20px 30px;">
        <p style="margin:0 0 15px 0;font-size:13px;font-weight:700;color:#718096;">자주 언급된 키워드</p>
        <div>
          <span style="display:inline-block;background-color:#edf2f7;color:#2d3748;padding:10px 18px;border-radius:20px;font-size:14px;margin:0 8px 10px 0;border:1px solid #e2e8f0;">#실물깡패 (12회)</span>
          <span style="display:inline-block;background-color:#ebf8ff;color:#2b6cb0;padding:10px 18px;border-radius:20px;font-size:14px;margin:0 8px 10px 0;border:1px solid #bee3f8;">#빠른배송 (8회)</span>
          <span style="display:inline-block;background-color:#fff5f5;color:#c53030;padding:10px 18px;border-radius:20px;font-size:14px;margin:0 8px 10px 0;border:1px solid #fed7d7;">#단추불안 (3회)</span>
          <span style="display:inline-block;background-color:#f0fff4;color:#2f855a;padding:10px 18px;border-radius:20px;font-size:14px;margin:0 8px 10px 0;border:1px solid #c6f6d5;">#단골예정 (15회)</span>
        </div>
      </td>
    </tr>

    <tr>
      <td style="padding:20px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffaf0;border:1px solid #feebc8;border-radius:4px;">
          <tr>
            <td style="padding:25px;position:relative;">
              <div style="position:absolute;top:10px;right:15px;font-size:20px;color:#dd6b20;">📌</div>
              <p style="margin:0;font-size:14px;font-weight:800;color:#dd6b20;">지금 확인해야 할 소리</p>
              <p style="margin:15px 0 0 0;font-size:15px;color:#744210;font-style:italic;line-height:1.6;">
                "디자인은 너무 예쁜데, 소매 단목 부분이 한 번 세탁하니 조금 헐거워지네요. 다른 건 다 좋은데 이 부분만 보완되면 완벽할 것 같아요."
              </p>
              <p style="margin:15px 0 0 0;font-size:13px;color:#975a16;font-weight:600;">- 주문번호: 20260504-00021 (김*진 고객님)</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:20px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf5ff;border:1px solid #e9d8fd;border-radius:16px;">
          <tr>
            <td style="padding:25px;text-align:center;">
              <div style="font-size:24px;margin-bottom:10px;">🌟</div>
              <h4 style="margin:0;font-size:16px;color:#553c9a;">인스타그램에 자랑하세요!</h4>
              <p style="margin:10px 0 15px 0;font-size:14px;color:#6b46c1;line-height:1.5;">
                "여기 옷은 늘 믿고 사요. 이번 가디건도 색감이 미쳤네요. 주변 친구들이 다 어디서 샀냐고 물어봐요!"
              </p>
              <p style="margin:0;font-size:12px;color:#805ad5;font-weight:500;">- 구매 확정 고객 <span style="text-decoration:underline;">lee***</span>님의 포토리뷰</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:40px 30px;text-align:center;">
        <table align="center" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <a href="#" style="background-color:#4c51bf;color:#ffffff;padding:18px 35px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 5px 15px rgba(76,81,191,0.3);">미답변 리뷰 12건 처리하러 가기</a>
            </td>
          </tr>
        </table>
        <p style="margin:25px 0 0 0;font-size:14px;color:#a0aec0;">진심 어린 답변 하나가 단골을 만듭니다.</p>
      </td>
    </tr>

    <tr>
      <td style="padding:30px;background-color:#f7fafc;border-top:1px solid #edf2f7;text-align:center;">
        <p style="margin:0;font-size:12px;color:#cbd5e0;">
          Uptendo PRO | 고객 통찰력 리포트<br>
          본 메일은 수신동의를 하신 쉼팩토리 사장님께 발송됩니다.<br><br>
          © 2026 Uptendo. All voices matter.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function openFullReport() {
  const win = window.open("", "_blank", "width=640,height=800,scrollbars=yes");
  if (win) {
    win.document.write(buildFullReportHtml());
    win.document.close();
  }
}

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────────
export function Reports() {
  const { isPro } = useProContext();

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-full pb-20">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">리포트</h1>
      </div>

      {/* ── 섹션 1: 이번 주 주간 리포팅 ──────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          이번 주 주간 리포팅
        </h2>

        {/* 히어로 카드 */}
        <div
          onClick={isPro ? openFullReport : undefined}
          className={cn(
            "rounded-2xl overflow-hidden shadow-sm border border-indigo-100",
            isPro ? "cursor-pointer active:scale-[0.99] transition-transform" : ""
          )}
        >
          {/* 그라디언트 헤더 영역 */}
          <div className="bg-linear-to-br from-indigo-500 to-purple-600 p-5 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold tracking-widest text-indigo-200 uppercase">
                  Customer Voice Report
                </p>
                <p className="text-xs text-indigo-200 mt-0.5">{THIS_WEEK.period}</p>
              </div>
              {isPro ? (
                <div className="flex items-center gap-1 text-xs text-white bg-white/20 rounded-full px-2.5 py-1 shrink-0">
                  <ExternalLink className="w-3 h-3" />
                  <span>전체 보기</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-indigo-200 bg-white/10 rounded-full px-2.5 py-1 shrink-0">
                  <Lock className="w-3 h-3" />
                  <span>PRO</span>
                </div>
              )}
            </div>

            <h3 className="mt-3 text-base font-bold leading-snug">
              "{THIS_WEEK.headline}"
            </h3>
            <p className="mt-1.5 text-xs text-indigo-200 leading-relaxed line-clamp-2">
              {THIS_WEEK.summary}
            </p>

            {/* 핵심 KPI 칩 */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <div className="bg-white/20 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                <span className="text-sm font-bold">{THIS_WEEK.avgSatisfaction}</span>
                <span className="text-xs text-white/70">/ 5.0</span>
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <span className="text-sm font-bold">{THIS_WEEK.positiveRate}%</span>
                <span className="text-xs text-white/70">긍정리뷰</span>
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-sm font-bold">{THIS_WEEK.unanswered}건</span>
                <span className="text-xs text-white/70">미답변</span>
              </div>
            </div>
          </div>

          {/* 키워드 + PRO 안내 */}
          <div className="bg-white px-4 py-4">
            <p className="text-xs font-semibold text-gray-400 mb-2">자주 언급된 키워드</p>
            <div className="flex flex-wrap gap-2">
              {THIS_WEEK.keywords.map((kw) => (
                <span
                  key={kw.tag}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full font-medium",
                    kw.bg,
                    kw.text
                  )}
                >
                  {kw.tag}{" "}
                  <span className="opacity-60 font-normal">{kw.count}</span>
                </span>
              ))}
            </div>

            {!isPro && (
              <div className="mt-4 flex items-center gap-2 py-2.5 px-3 bg-indigo-50 rounded-xl">
                <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <p className="text-xs text-indigo-600 font-semibold">
                  PRO로 업그레이드하면 전체 리포트를 열람할 수 있어요
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 섹션 2: 이전 주간 리포팅 목록 ──────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          이전 주간 리포팅
        </h2>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-50">
          {PREV_REPORTS.map((report) => (
            <div
              key={report.id}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-gray-400 shrink-0">{report.period}</span>
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-yellow-500 shrink-0">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {report.satisfaction}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{report.topic}</p>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {report.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* ── 섹션 3: 통계 (기존 데이터 유지) ─────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">통계</h2>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center">
              일간 매출 요약 (최근 7일)
              <InfoTooltip content="단위: 만원. 실시간 집계가 아니므로 최종 정산과 다를 수 있습니다." />
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <Tooltip
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="매출" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">월간 핵심 지표</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500 block mb-1">총 매출</span>
              <span className="text-lg font-bold text-gray-900">1,240만원</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500 block mb-1">총 주문수</span>
              <span className="text-lg font-bold text-gray-900">342건</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
