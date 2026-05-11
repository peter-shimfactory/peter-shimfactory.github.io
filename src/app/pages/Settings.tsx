import { useState } from "react";
import { Link2, Link2Off, MessageCircle, HelpCircle, ChevronRight, Bell, Zap, CheckCircle2, Crown, FlaskConical, Lock, X, LayoutDashboard, Pin } from "lucide-react";
import { InfoTooltip } from "../components/InfoTooltip";
import { cn } from "../../utils/cn";
import { useProContext } from "../contexts/ProContext";
import { useDashboardContext, REQUIRED_SECTIONS, OPTIONAL_SECTIONS } from "../contexts/DashboardContext";

type BasicAlertKey = "unprocessed" | "cancelRefund" | "shippingDelay";
type CustomAlertKey = "highValue" | "vipCustomer" | "lowStock" | "worstSupplier";
type CustomInputKey = "highValueAmount" | "vipCustomerCount" | "lowStockQty";

const BASIC_ALERTS: { key: BasicAlertKey; label: string; desc: string }[] = [
  { key: "unprocessed", label: "미처리 주문 알림", desc: "매일 특정 시간 요약 발송" },
  { key: "cancelRefund", label: "취소/환불 발생 알림", desc: "발생 즉시 발송" },
  { key: "shippingDelay", label: "배송 지연 경고", desc: "출고 마감 시간 전 발송" },
];

type CustomAlertDef =
  | { key: CustomAlertKey; label: string; desc: string; hasInput?: false }
  | { key: CustomAlertKey; label: string; hasInput: true; inputKey: CustomInputKey; inputPlaceholder: string; prefix: string; suffix: string };

const CUSTOM_ALERTS: CustomAlertDef[] = [
  { key: "highValue", label: "고단가 주문 알림", hasInput: true, inputKey: "highValueAmount", inputPlaceholder: "금액 입력", prefix: "", suffix: "원 이상 결제 시 즉시 알림" },
  { key: "vipCustomer", label: "VIP 단골 신규 주문 알림", hasInput: true, inputKey: "vipCustomerCount", inputPlaceholder: "횟수 입력", prefix: "누적 구매", suffix: "회 이상 고객 주문 시 즉시 알림" },
  { key: "lowStock", label: "품절 임박 방어 알림", hasInput: true, inputKey: "lowStockQty", inputPlaceholder: "수량 입력", prefix: "특정 상품 재고", suffix: "개 미만 시 즉시 알림" },
  { key: "worstSupplier", label: "워스트 공급사 경고 알림", desc: "특정 공급사 배송 지연율 급증 시 경고 알림" },
];

export function Settings() {
  const { isPro, setIsPro } = useProContext();
  const { enabledOptionals, toggleOptional } = useDashboardContext();
  const [showDashboardUpsell, setShowDashboardUpsell] = useState(false);
  const [isConnected, setIsConnected] = useState(
    () => localStorage.getItem("cafe24_connected") === "true"
  );
  const [mallId, setMallId] = useState(
    () => localStorage.getItem("cafe24_mall_id") || ""
  );
  const [showMallIdInput, setShowMallIdInput] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [basicAlerts, setBasicAlerts] = useState<Record<BasicAlertKey, boolean>>({
    unprocessed: true,
    cancelRefund: true,
    shippingDelay: true,
  });
  const [customAlerts, setCustomAlerts] = useState<Record<CustomAlertKey, boolean>>({
    highValue: false,
    vipCustomer: false,
    lowStock: false,
    worstSupplier: false,
  });
  const [customInputs, setCustomInputs] = useState<Record<CustomInputKey, string>>({
    highValueAmount: "",
    vipCustomerCount: "",
    lowStockQty: "",
  });
  const [showUpsell, setShowUpsell] = useState(false);

  const selectedCustomCount = Object.values(customAlerts).filter(Boolean).length;

  function handleCustomToggle(key: CustomAlertKey, checked: boolean) {
    if (checked && !isPro && selectedCustomCount >= 1) {
      setShowUpsell(true);
      return;
    }
    setCustomAlerts((prev) => ({ ...prev, [key]: checked }));
    if (!checked) setShowUpsell(false);
  }

  // 카페24 OAuth 인증 URL로 이동
  const CAFE24_CLIENT_ID = import.meta.env.VITE_CAFE24_CLIENT_ID as string;
  const REDIRECT_URI = "https://peter-shimfactory.github.io/auth/callback";
  const SCOPES = [
    "mall.read_order",
    "mall.read_product",
    "mall.read_customer",
    "mall.read_supply",
    "mall.read_shipment",
  ].join(",");

  function handleConnect() {
    if (!mallId.trim()) {
      setShowMallIdInput(true);
      return;
    }
    const trimmed = mallId.trim().toLowerCase();
    localStorage.setItem("cafe24_mall_id", trimmed);

    const authUrl =
      `https://${trimmed}.cafe24api.com/api/v2/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${CAFE24_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(SCOPES)}`;

    window.location.href = authUrl;
  }

  function handleDisconnect() {
    localStorage.removeItem("cafe24_connected");
    localStorage.removeItem("cafe24_mall_id");
    setIsConnected(false);
    setMallId("");
  }

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-full pb-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-900">설정</h1>
        {isPro ? (
          <span className="inline-flex items-center space-x-1 bg-linear-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            <Zap className="w-3 h-3" />
            <span>PRO</span>
          </span>
        ) : (
          <span className="inline-flex items-center bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full">
            FREE
          </span>
        )}
      </div>

      {/* Pro Plan Card */}
      {isPro ? (
        <div className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Crown className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm">Pro 요금제</span>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">구독 중</span>
                </div>
                <span className="text-xs text-indigo-100">다음 갱신일 · 2026. 06. 07</span>
              </div>
            </div>
            <Zap className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-1.5">
            {["단골/VIP 고객 현황", "합배송 지연 알림", "재고 모니터링", "공급사 성과 추적"].map((feature) => (
              <div key={feature} className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-300 shrink-0" />
                <span className="text-xs text-indigo-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-xl">
                <Crown className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-gray-800">FREE 플랜</span>
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">사용 중</span>
                </div>
                <span className="text-xs text-gray-400">PRO로 업그레이드하면 더 많은 기능을 사용할 수 있어요.</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-1.5 mb-3">
            {["단골/VIP 고객 현황", "합배송 지연 알림", "재고 모니터링", "공급사 성과 추적"].map((feature) => (
              <div key={feature} className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <span className="text-xs text-gray-400">{feature}</span>
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center space-x-1.5">
            <Zap className="w-4 h-4" />
            <span>PRO 14일 무료 체험 시작</span>
          </button>
        </div>
      )}

      {/* Dashboard Section Settings */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 px-1 flex items-center space-x-1.5">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>대시보드 항목 설정</span>
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* 필수 항목 */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center space-x-1.5 mb-2">
              <Pin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500">필수 노출 항목</span>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">항상 표시</span>
            </div>
            <ul className="space-y-2">
              {REQUIRED_SECTIONS.map((sec) => (
                <li key={sec.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">{sec.label}</span>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] text-gray-400">필수</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mx-4 border-t border-gray-100 my-1" />

          {/* 선택 항목 */}
          <div className="px-4 pb-4 pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">선택 노출 항목</span>
              {!isPro && (
                <span className="text-[10px] text-gray-400">{enabledOptionals.length}/1 선택</span>
              )}
            </div>

            {/* FREE 업셀 배너 */}
            {showDashboardUpsell && !isPro && (
              <div className="mb-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-700">선택 항목을 더 추가하려면 PRO가 필요해요</p>
                    <p className="text-[11px] text-indigo-500 mt-0.5">FREE 플랜은 선택 항목을 1개까지 대시보드에 표시할 수 있어요.</p>
                    <button className="mt-2 inline-flex items-center space-x-1 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                      <Zap className="w-3 h-3" />
                      <span>PRO 14일 무료 체험</span>
                    </button>
                  </div>
                </div>
                <button onClick={() => setShowDashboardUpsell(false)} className="text-indigo-300 hover:text-indigo-500 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <ul className="space-y-2">
              {OPTIONAL_SECTIONS.map((sec) => {
                const isChecked = enabledOptionals.includes(sec.id);
                const isBlocked = !isPro && !isChecked && enabledOptionals.length >= 1;
                return (
                  <li
                    key={sec.id}
                    className={cn(
                      "flex items-start justify-between py-2.5 px-3 rounded-xl border transition-colors",
                      isChecked ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-transparent",
                      isBlocked && "opacity-50"
                    )}
                  >
                    <div className="flex-1 pr-3">
                      <span className="text-sm font-medium text-gray-800 block">{sec.label}</span>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">{sec.description}</span>
                    </div>
                    <button
                      onClick={() => {
                        const result = toggleOptional(sec.id, isPro);
                        if (result === "limit") setShowDashboardUpsell(true);
                        else setShowDashboardUpsell(false);
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none mt-0.5",
                        isChecked ? "bg-blue-500" : "bg-gray-200"
                      )}
                      aria-pressed={isChecked}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                          isChecked ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            {!isPro && (
              <p className="text-[11px] text-gray-400 mt-3 text-center">
                FREE 플랜은 선택 항목 1개까지 · PRO는 전체 표시 가능
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Account Integration */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 px-1">계정 연동</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("p-2 rounded-lg", isConnected ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400")}>
                {isConnected ? <Link2 className="w-5 h-5" /> : <Link2Off className="w-5 h-5" />}
              </div>
              <div>
                <span className="block font-medium text-gray-900">카페24 쇼핑몰</span>
                <span className="text-xs text-gray-500">
                  {isConnected
                    ? `${mallId || localStorage.getItem("cafe24_mall_id") || "연동됨"}.cafe24.com (연동됨)`
                    : "연동이 필요합니다."}
                </span>
              </div>
            </div>
            <button
              onClick={isConnected ? handleDisconnect : handleConnect}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                isConnected ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {isConnected ? "해제" : "연동하기"}
            </button>
          </div>

          {/* 쇼핑몰 ID 입력창 (미연동 상태에서만 표시) */}
          {!isConnected && showMallIdInput && (
            <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500">카페24 쇼핑몰 ID를 입력해 주세요.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mallId}
                  onChange={(e) => setMallId(e.target.value)}
                  placeholder="예: myshop"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleConnect}
                  disabled={!mallId.trim()}
                  className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg disabled:opacity-40"
                >
                  인증 시작
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                카페24 관리자 페이지 URL에서 확인: <span className="font-mono">https://[여기].cafe24.com</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 px-1 flex items-center">
          알림 설정
          <InfoTooltip content="앱이 백그라운드에 있을 때도 푸시 알림을 받을 수 있습니다." />
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Master toggle */}
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-700">푸시 알림 수신</span>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                notificationsEnabled ? "bg-blue-600" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  notificationsEnabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* Basic alerts */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-1.5 mb-3">
              <span className="text-xs font-bold text-gray-700">기본 운영 알림</span>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">FREE 기본 제공</span>
            </div>
            <div className="space-y-3">
              {BASIC_ALERTS.map((item) => (
                <label key={item.key} className={cn("flex items-start justify-between gap-3 cursor-pointer", !notificationsEnabled && "opacity-40")}>
                  <div>
                    <span className="text-sm font-medium text-gray-800 block">{item.label}</span>
                    <span className="text-xs text-gray-400">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={basicAlerts[item.key]}
                    onChange={(e) => setBasicAlerts((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                    disabled={!notificationsEnabled}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 shrink-0"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Custom alerts */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-gray-700">맞춤형 조건 알림</span>
                {!isPro && <Lock className="w-3.5 h-3.5 text-indigo-400" />}
                {isPro && <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">PRO</span>}
              </div>
              {!isPro && (
                <span className="text-[10px] text-gray-400">
                  {selectedCustomCount}/1 선택
                </span>
              )}
            </div>
            {!isPro && (
              <p className="text-[11px] text-gray-400 mb-3">FREE 플랜은 맞춤형 조건 알림을 1개까지 설정할 수 있어요.</p>
            )}

            {/* PRO upsell banner */}
            {showUpsell && !isPro && (
              <div className="mb-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-700">맞춤형 알림을 모두 사용하려면 PRO가 필요해요</p>
                    <p className="text-[11px] text-indigo-500 mt-0.5">PRO 플랜에서는 조건 알림을 무제한으로 설정할 수 있어요.</p>
                    <button className="mt-2 inline-flex items-center space-x-1 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                      <Zap className="w-3 h-3" />
                      <span>PRO 14일 무료 체험</span>
                    </button>
                  </div>
                </div>
                <button onClick={() => setShowUpsell(false)} className="text-indigo-300 hover:text-indigo-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-4">
              {CUSTOM_ALERTS.map((item) => {
                const isChecked = customAlerts[item.key];
                const isDisabledByPlan = !isPro && !isChecked && selectedCustomCount >= 1;
                return (
                  <div key={item.key} className={cn("transition-opacity", (!notificationsEnabled || isDisabledByPlan) && "opacity-40")}>
                    <label className="flex items-start justify-between gap-3 cursor-pointer">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-800 block">{item.label}</span>
                        {item.hasInput ? (
                          <div className="flex items-center flex-wrap gap-1 mt-1.5">
                            {item.prefix && <span className="text-xs text-gray-500">{item.prefix}</span>}
                            <input
                              type="number"
                              value={customInputs[item.inputKey]}
                              onChange={(e) => setCustomInputs((prev) => ({ ...prev, [item.inputKey]: e.target.value }))}
                              placeholder={item.inputPlaceholder}
                              disabled={!isChecked || !notificationsEnabled}
                              className="w-24 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-300"
                            />
                            <span className="text-xs text-gray-500">{item.suffix}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 mt-0.5 block">{item.desc}</span>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleCustomToggle(item.key, e.target.checked)}
                        disabled={!notificationsEnabled}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 shrink-0"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Support */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 px-1">고객 지원</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-700">자주 묻는 질문 (FAQ)</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-700">1:1 문의하기</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </section>
      
      <div className="text-center pt-4 space-y-1">
        <span className="text-xs text-gray-400">앱 버전 1.0.0 (MVP)</span>
      </div>

      {/* Debug: 요금제 전환 */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 px-1 flex items-center space-x-1.5">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>디버깅 (임시)</span>
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-200 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="block font-medium text-gray-700 text-sm">현재 요금제</span>
              <span className="text-xs text-gray-400">{isPro ? 'PRO 구독 중' : '무료 플랜'}</span>
            </div>
            <button
              onClick={() => setIsPro(!isPro)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-full transition-colors",
                isPro
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              {isPro ? 'Free로 전환' : 'Pro로 전환'}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
