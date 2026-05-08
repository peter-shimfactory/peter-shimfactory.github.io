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
import { ExternalLink, Lock, ChevronRight, Star, MessageSquare, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { useState } from "react";

// ─── 타입 정의 ──────────────────────────────────────────────────────────────────
type ReportType = "business" | "review" | "operations";

interface DetailSection {
  type: "highlight" | "tmi" | "praise" | "warning";
  icon: string;
  label: string;
  heading: string;
  body: string;
}

interface PrevReport {
  id: number;
  period: string;
  topic: string;
  type: ReportType;
  keywords: string[];
  satisfaction: number;
  detail: {
    subtitle: string;
    greeting: string;
    sections: DetailSection[];
  };
}

// ─── 리포트 타입별 스타일 메타 ──────────────────────────────────────────────────
const TYPE_META: Record<
  ReportType,
  { label: string; badgeBg: string; badgeText: string; tagBg: string; tagText: string; tagBorder: string }
> = {
  business: {
    label: "비즈니스 브리핑",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-600",
    tagBg: "bg-blue-50",
    tagText: "text-blue-600",
    tagBorder: "border-blue-100",
  },
  review: {
    label: "고객 리뷰 / CS",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-600",
    tagBg: "bg-purple-50",
    tagText: "text-purple-600",
    tagBorder: "border-purple-100",
  },
  operations: {
    label: "운영 & 배송",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-600",
    tagBg: "bg-amber-50",
    tagText: "text-amber-600",
    tagBorder: "border-amber-100",
  },
};

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

// ─── 이번 주 리포트 데이터 ────────────────────────────────────────────────────
const THIS_WEEK = {
  period: "5월 4주차",
  headline: "대체로 맑음, 하지만 배송엔 민감",
  summary:
    "이번 주 리뷰의 85%가 긍정적이었어요. 특히 '소재의 부드러움'에 감동한 고객이 많았습니다.",
  avgSatisfaction: 4.8,
  positiveRate: 85,
  unanswered: 12,
};

// ─── 이전 주간 리포팅 목록 (최대 3개) ──────────────────────────────────────────
const PREV_REPORTS: PrevReport[] = [
  {
    id: 1,
    period: "5월 3주차",
    topic: "수요일 밤 주문 폭발, 봄 가디건이 효자 상품",
    type: "business",
    keywords: ["#수요일피크타임", "#봄가디건", "#단골타이밍"],
    satisfaction: 4.7,
    detail: {
      subtitle: "주간 비즈니스 브리핑",
      greeting: "쉼팩토리 김사장님,\n지난 한 주 정말 수고 많으셨습니다! ☕",
      sections: [
        {
          type: "highlight",
          icon: "🏆",
          label: "이번 주 결정적 한 장면",
          heading: '"수요일 밤 11시, 주문이 폭발했어요!"',
          body: "이번 주 가장 뜨거웠던 순간은 수요일 밤이었습니다. 특히 밤 11시부터 자정 사이에 주문의 30%가 집중되었네요. 효자 상품은 [자체제작] 봄맞이 가디건이었습니다.",
        },
        {
          type: "tmi",
          icon: "👀",
          label: "흥미로운 데이터 TMI",
          heading: '"단골들은 목요일 퇴근길에 지갑을 엽니다."',
          body: "우리 쇼핑몰의 찐 단골 고객들은 목요일 오후 6시~8시 사이에 가장 많이 결제합니다. 다음 주 신상 알림이나 쿠폰은 이 시간에 맞춰 쏴보시는 건 어떨까요?",
        },
        {
          type: "praise",
          icon: "👏",
          label: "참 잘했어요!",
          heading: "취소/환불 방어율 98%",
          body: "빠른 사전 안내로 고객의 마음을 돌린 사장님의 디테일이 빛났습니다.",
        },
        {
          type: "warning",
          icon: "🚨",
          label: "주의가 필요해요!",
          heading: "지연 주문 12건 중 9건이 동대문상회",
          body: "이 거래처는 다음 주 월요일에 꼭 압박해 보세요!",
        },
      ],
    },
  },
  {
    id: 2,
    period: "5월 2주차",
    topic: "린넨 블라우스 단추 품질 피드백 집중",
    type: "review",
    keywords: ["#린넨블라우스", "#단추CS", "#품질개선요청"],
    satisfaction: 4.5,
    detail: {
      subtitle: "고객 리뷰 / CS 리포트",
      greeting: "이번 주 고객의 목소리를 모아봤어요.",
      sections: [
        {
          type: "highlight",
          icon: "📌",
          label: "지금 확인해야 할 소리",
          heading: '"세탁 후 단추가 헐거워졌어요"',
          body: "린넨 블라우스 구매 고객 중 3명이 세탁 후 단추 마감 품질에 대한 피드백을 남겼습니다. 구체적으로는 단추 실밥이 풀리는 현상으로, 공급사 품질 점검이 필요합니다.",
        },
        {
          type: "tmi",
          icon: "💡",
          label: "흥미로운 리뷰 패턴",
          heading: '"구매 후 2주+가 피드백의 골든타임"',
          body: "이번 주 접수된 품질 리뷰의 70%는 구매 후 2주~3주 사이에 작성되었어요. 세탁 경험이 축적되는 시점이라 제품 케어 가이드 발송 타이밍을 이 구간에 맞춰보세요.",
        },
        {
          type: "praise",
          icon: "👏",
          label: "참 잘했어요!",
          heading: "CS 평균 응답 1.2시간",
          body: "이번 주 CS 평균 응답 시간이 업계 평균 대비 3배 빠릅니다. 고객 재구매 의향이 올라가고 있어요.",
        },
        {
          type: "warning",
          icon: "🚨",
          label: "주의가 필요해요!",
          heading: "린넨 블라우스 잔여 재고 42개",
          body: "품질 이슈가 확인된 배치의 잔여 재고를 공급사와 반품 협의해 보세요. 추가 CS 발생을 예방할 수 있습니다.",
        },
      ],
    },
  },
  {
    id: 3,
    period: "5월 1주차",
    topic: "어버이날 선물 수요로 배송 문의 폭증",
    type: "operations",
    keywords: ["#선물포장", "#배송지연", "#합배송처리"],
    satisfaction: 4.6,
    detail: {
      subtitle: "운영 & 배송 리포트",
      greeting: "황금연휴가 끼인 한 주, 수고 많으셨습니다! 🌸",
      sections: [
        {
          type: "highlight",
          icon: "🎁",
          label: "이번 주 결정적 한 장면",
          heading: '"어버이날 D-3, 선물 주문이 쏟아졌어요"',
          body: "5월 4일(일)부터 6일(화) 사이에 '선물포장 요청' 건수가 평소 대비 340% 급증했습니다. 가디건·블라우스 세트 구성 상품이 선물 수요를 주도했습니다.",
        },
        {
          type: "tmi",
          icon: "📦",
          label: "배송 패턴 TMI",
          heading: '"합배송 묶음이 오히려 독이 됐어요"',
          body: "선물 수요 고객 중 상당수가 각각 다른 수령지로 발송을 요청했지만, 합배송 처리로 묶여 오히려 배송이 지연된 케이스가 7건 발생했습니다.",
        },
        {
          type: "praise",
          icon: "👏",
          label: "참 잘했어요!",
          heading: "선물포장 만족도 4.9점",
          body: "직접 손으로 작성한 메시지 카드 덕분에 포토리뷰 15건이 올라왔어요. 감동 경험이 단골을 만들고 있습니다.",
        },
        {
          type: "warning",
          icon: "🚨",
          label: "주의가 필요해요!",
          heading: "지연 배송 미답변 고객 8명",
          body: "배송 조회 후 연락이 끊긴 고객 8명에게 먼저 사과 메시지를 발송하세요. 선제적 대응이 리뷰 폭탄을 방어합니다.",
        },
      ],
    },
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

// ─── 이전 리포트 상세 시트 ──────────────────────────────────────────────────────
function ReportDetailSheet({
  report,
  onClose,
}: {
  report: PrevReport;
  onClose: () => void;
}) {
  const meta = TYPE_META[report.type];

  // praise + warning 연속 시 2열로 묶기
  const grouped: Array<DetailSection | [DetailSection, DetailSection]> = [];
  let i = 0;
  while (i < report.detail.sections.length) {
    const curr = report.detail.sections[i];
    const next = report.detail.sections[i + 1];
    if (
      next &&
      ((curr.type === "praise" && next.type === "warning") ||
        (curr.type === "warning" && next.type === "praise"))
    ) {
      grouped.push([curr, next]);
      i += 2;
    } else {
      grouped.push(curr);
      i++;
    }
  }

  function sectionStyle(type: DetailSection["type"]) {
    switch (type) {
      case "highlight":
        return {
          wrap: "bg-blue-50 border-l-4 border-blue-400 rounded-r-xl",
          label: "text-blue-600",
          heading: "text-blue-900",
          body: "text-blue-800",
        };
      case "tmi":
        return {
          wrap: "bg-amber-50 border-l-4 border-amber-400 rounded-r-xl",
          label: "text-amber-600",
          heading: "text-amber-900",
          body: "text-amber-800",
        };
      case "praise":
        return {
          wrap: "bg-green-50 rounded-xl",
          label: "text-green-600",
          heading: "text-green-900",
          body: "text-green-700",
        };
      case "warning":
        return {
          wrap: "bg-red-50 rounded-xl",
          label: "text-red-600",
          heading: "text-red-900",
          body: "text-red-700",
        };
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ maxWidth: 448, margin: "0 auto" }}>
      {/* 딤 배경 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {/* 시트 */}
      <div className="absolute inset-x-0 bottom-0 top-12 bg-gray-50 rounded-t-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="flex-none bg-white px-4 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  meta.badgeBg,
                  meta.badgeText
                )}
              >
                {meta.label}
              </span>
              <span className="text-xs text-gray-400">{report.period}</span>
            </div>
            <h2 className="text-base font-bold text-gray-900 leading-snug mt-1">
              {report.topic}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-3 shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 스크롤 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 인트로 인사 */}
          <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed px-1">
            {report.detail.greeting}
          </p>

          {/* 섹션 */}
          {grouped.map((item, idx) => {
            if (Array.isArray(item)) {
              const [a, b] = item;
              const sa = sectionStyle(a.type);
              const sb = sectionStyle(b.type);
              return (
                <div key={idx} className="grid grid-cols-2 gap-3">
                  {[{ s: sa, d: a }, { s: sb, d: b }].map(({ s, d }) => (
                    <div key={d.label} className={cn("p-3.5", s.wrap)}>
                      <p className={cn("text-base mb-1")}>{d.icon}</p>
                      <p className={cn("text-xs font-bold mb-1", s.label)}>{d.label}</p>
                      <p className={cn("text-sm font-semibold leading-snug mb-1.5", s.heading)}>
                        {d.heading}
                      </p>
                      <p className={cn("text-xs leading-relaxed", s.body)}>{d.body}</p>
                    </div>
                  ))}
                </div>
              );
            }
            const s = sectionStyle(item.type);
            return (
              <div key={idx} className={cn("p-4", s.wrap)}>
                <p className="text-xl mb-2">{item.icon}</p>
                <p className={cn("text-xs font-bold uppercase tracking-wide mb-1", s.label)}>
                  {item.label}
                </p>
                <p className={cn("text-base font-bold leading-snug mb-2", s.heading)}>
                  {item.heading}
                </p>
                <p className={cn("text-sm leading-relaxed", s.body)}>{item.body}</p>
              </div>
            );
          })}

          {/* 만족도 */}
          <div className="flex items-center justify-center gap-2 py-3 bg-white rounded-xl border border-gray-100">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-800">{report.satisfaction}</span>
            <span className="text-xs text-gray-400">/ 5.0 · 주차 평균 만족도</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Reports() {
  const { isPro } = useProContext();
  const [selectedReport, setSelectedReport] = useState<PrevReport | null>(null);

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
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  고객 리뷰 / CS
                </span>
                <span className="text-xs text-indigo-200 font-medium">{THIS_WEEK.period}</span>
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

          {/* PRO 비활성 안내 (비Pro 전용) */}
          {!isPro && (
            <div className="bg-white px-4 py-3.5 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <p className="text-xs text-indigo-600 font-semibold">
                PRO로 업그레이드하면 전체 리포트를 열람할 수 있어요
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── 섹션 2: 이전 주간 리포팅 목록 ──────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          이전 주간 리포팅
        </h2>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-50">
          {PREV_REPORTS.map((report) => {
            const meta = TYPE_META[report.type];
            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
                        meta.badgeBg,
                        meta.badgeText
                      )}
                    >
                      {meta.label}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">{report.period}</span>
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-yellow-500 shrink-0 ml-auto">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {report.satisfaction}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{report.topic}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {report.keywords.map((kw) => (
                      <span
                        key={kw}
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full border font-medium",
                          meta.tagBg,
                          meta.tagText,
                          meta.tagBorder
                        )}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </div>
            );
          })}
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

      {/* ── 이전 리포트 상세 시트 ──────────────────────────────────────────────── */}
      {selectedReport && (
        <ReportDetailSheet
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}

