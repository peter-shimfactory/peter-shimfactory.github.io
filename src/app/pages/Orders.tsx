import { useState, useRef, useEffect, useCallback } from "react";
import { Crown, X, ChevronDown, MapPin, Phone, Package, Calendar } from "lucide-react";
import { CopyableOrderId } from "../components/CopyableOrderId";
import { cn } from "../../utils/cn";

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderStatus =
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancel_request"
  | "cancelled"
  | "refunded";

type OrderTab = "new" | "unprocessed" | "cancel" | "vip";

interface OrderItem {
  name: string;
  qty: number;
}

interface Order {
  id: string;
  createdAt: Date;
  customerName: string;
  isVip: boolean;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  address: string;
  phone: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const now = new Date();
function minsAgo(m: number) {
  return new Date(now.getTime() - m * 60 * 1000);
}

const ALL_ORDERS: Order[] = [
  { id: "ORD-1001", createdAt: minsAgo(18), customerName: "김민준", isVip: true, items: [{ name: "여성용 베이직 티셔츠", qty: 2 }, { name: "린넨 슬랙스", qty: 1 }, { name: "캐주얼 자켓", qty: 1 }], total: 128000, status: "paid", address: "서울 강남구 테헤란로 123", phone: "010-1234-****" },
  { id: "ORD-1002", createdAt: minsAgo(45), customerName: "이서연", isVip: false, items: [{ name: "코튼 반팔 원피스", qty: 1 }], total: 42000, status: "preparing", address: "경기 성남시 분당구 판교로 7", phone: "010-9876-****" },
  { id: "ORD-1003", createdAt: minsAgo(90), customerName: "박지호", isVip: true, items: [{ name: "오버핏 후드티", qty: 3 }, { name: "조거 팬츠", qty: 2 }], total: 215000, status: "paid", address: "서울 마포구 합정동 99", phone: "010-5555-****" },
  { id: "ORD-1004", createdAt: minsAgo(200), customerName: "최수아", isVip: false, items: [{ name: "플리츠 미니스커트", qty: 1 }, { name: "크롭 블라우스", qty: 1 }], total: 67500, status: "preparing", address: "부산 해운대구 좌동 12", phone: "010-2222-****" },
  { id: "ORD-1005", createdAt: minsAgo(800), customerName: "정현우", isVip: false, items: [{ name: "데님 와이드팬츠", qty: 1 }], total: 55000, status: "cancel_request", address: "인천 남동구 논현로 55", phone: "010-3333-****" },
  { id: "ORD-1006", createdAt: minsAgo(1200), customerName: "강나은", isVip: true, items: [{ name: "실크 블라우스", qty: 2 }, { name: "하이웨스트 팬츠", qty: 1 }, { name: "벨트", qty: 1 }], total: 189000, status: "shipped", address: "대구 수성구 범어동 44", phone: "010-7777-****" },
  { id: "ORD-1007", createdAt: minsAgo(1800), customerName: "조태윤", isVip: false, items: [{ name: "무지 긴팔 티셔츠", qty: 4 }], total: 76000, status: "paid", address: "광주 서구 치평동 200", phone: "010-4444-****" },
  { id: "ORD-1008", createdAt: minsAgo(2400), customerName: "윤하늘", isVip: false, items: [{ name: "니트 가디건", qty: 1 }, { name: "이너 티셔츠", qty: 2 }], total: 98000, status: "cancelled", address: "대전 유성구 노은동 88", phone: "010-6666-****" },
  { id: "ORD-1009", createdAt: minsAgo(3000), customerName: "임도현", isVip: true, items: [{ name: "트위드 자켓", qty: 1 }, { name: "트위드 스커트", qty: 1 }], total: 320000, status: "paying", address: "서울 용산구 이태원동 5", phone: "010-8888-****" } as unknown as Order,
  { id: "ORD-1010", createdAt: minsAgo(5000), customerName: "한지우", isVip: false, items: [{ name: "청바지", qty: 1 }], total: 49000, status: "refunded", address: "울산 남구 삼산로 30", phone: "010-0000-****" },
  { id: "ORD-1011", createdAt: minsAgo(50), customerName: "서예린", isVip: false, items: [{ name: "스트라이프 셔츠", qty: 2 }, { name: "치노 팬츠", qty: 1 }], total: 83000, status: "paid", address: "서울 동작구 사당동 11", phone: "010-1111-****" },
  { id: "ORD-1012", createdAt: minsAgo(120), customerName: "문준호", isVip: false, items: [{ name: "기모 맨투맨", qty: 1 }], total: 38000, status: "preparing", address: "경기 고양시 일산동구 정발산로 3", phone: "010-2345-****" },
];

// Make ORD-1009 paid
(ALL_ORDERS[8] as Order).status = "paid";

const PAGE_SIZE = 6;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + "*";
  return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}

function relativeTime(date: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}

function formatShortDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${min}`;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  paid: "결제완료",
  preparing: "배송준비중",
  shipped: "배송중",
  delivered: "배송완료",
  cancel_request: "취소요청",
  cancelled: "취소완료",
  refunded: "환불완료",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  paid: "bg-blue-50 text-blue-600",
  preparing: "bg-amber-50 text-amber-600",
  shipped: "bg-indigo-50 text-indigo-600",
  delivered: "bg-green-50 text-green-600",
  cancel_request: "bg-red-50 text-red-500",
  cancelled: "bg-gray-100 text-gray-500",
  refunded: "bg-rose-50 text-rose-500",
};

function getTabOrders(tab: OrderTab): Order[] {
  switch (tab) {
    case "new":
      return ALL_ORDERS.filter((o) => o.status === "paid");
    case "unprocessed":
      return ALL_ORDERS.filter((o) => o.status === "paid" || o.status === "preparing");
    case "cancel":
      return ALL_ORDERS.filter((o) =>
        o.status === "cancel_request" || o.status === "cancelled" || o.status === "refunded"
      );
    case "vip":
      return ALL_ORDERS.filter((o) => o.isVip);
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", STATUS_COLOR[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const diffMin = Math.floor((now.getTime() - order.createdAt.getTime()) / 60000);
  const timeLabel = diffMin < 60 * 24 ? relativeTime(order.createdAt) : formatShortDate(order.createdAt);
  const representative = order.items[0].name;
  const extra = order.items.length - 1;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-100 rounded-2xl px-4 py-3.5 shadow-sm active:bg-gray-50 transition-colors"
    >
      {/* Row 1: time + status */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-gray-400">{timeLabel}</span>
        <StatusBadge status={order.status} />
      </div>

      {/* Row 2: name + amount */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className="text-sm font-semibold text-gray-900">{maskName(order.customerName)}</span>
          {order.isVip && (
            <span className="inline-flex items-center space-x-0.5 bg-amber-50 text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              <Crown className="w-2.5 h-2.5" />
              <span>VIP</span>
            </span>
          )}
        </div>
        <span className="text-sm font-bold text-gray-900">
          {order.total.toLocaleString()}원
        </span>
      </div>

      {/* Row 3: product summary */}
      <p className="text-xs text-gray-500 mt-1 truncate">
        {representative}{extra > 0 ? ` 외 ${extra}건` : ""}
      </p>
    </button>
  );
}

function BottomSheet({ order, onClose }: { order: Order; onClose: () => void }) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on backdrop tap
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={handleBackdrop}
    >
      <div
        ref={sheetRef}
        className="w-full max-w-md bg-white rounded-t-3xl pb-safe animate-slide-up"
        style={{ maxHeight: "72vh", overflowY: "auto" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-900">주문 #{order.id}</span>
            <span className="text-xs text-gray-400">{formatShortDate(order.createdAt)}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Customer */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">고객 정보</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-900">{maskName(order.customerName)}</span>
              {order.isVip && (
                <span className="inline-flex items-center space-x-0.5 bg-amber-50 text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  <Crown className="w-2.5 h-2.5" />
                  <span>VIP 단골</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1.5 mt-1.5 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{order.phone}</span>
            </div>
            <div className="flex items-start space-x-1.5 mt-1 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{order.address}</span>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">주문 상태</p>
            <StatusBadge status={order.status} />
          </div>

          {/* Items */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">주문 상품</p>
            <ul className="space-y-2">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                  <div className="flex items-center space-x-2">
                    <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-800 truncate max-w-52">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 shrink-0 ml-2">×{item.qty}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-600">총 결제금액</span>
            <span className="text-base font-extrabold text-gray-900">
              {order.total.toLocaleString()}원
            </span>
          </div>

          {/* Order number */}
          <div className="flex items-center space-x-1.5 pb-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <CopyableOrderId orderId={order.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { key: OrderTab; label: string }[] = [
  { key: "new", label: "신규 주문" },
  { key: "unprocessed", label: "미처리" },
  { key: "cancel", label: "취소/환불" },
  { key: "vip", label: "단골(VIP)" },
];

export function Orders() {
  const [activeTab, setActiveTab] = useState<OrderTab>("new");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const tabOrders = getTabOrders(activeTab);
  const visibleOrders = tabOrders.slice(0, page * PAGE_SIZE);
  const hasMore = visibleOrders.length < tabOrders.length;

  // Reset pagination when tab changes
  function changeTab(tab: OrderTab) {
    setActiveTab(tab);
    setPage(1);
  }

  // Infinite scroll via IntersectionObserver
  const loadMore = useCallback(() => {
    if (hasMore) setPage((p) => p + 1);
  }, [hasMore]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="flex flex-col bg-gray-50 min-h-full pb-16">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-0 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3">주문 내역</h1>

        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 gap-0">
          {TABS.map(({ key, label }) => {
            const count = getTabOrders(key).length;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => changeTab(key)}
                className={cn(
                  "flex items-center space-x-1.5 px-3 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0",
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                <span>{label}</span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center",
                    isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {visibleOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-2">
            <Package className="w-10 h-10 text-gray-200" />
            <p className="text-sm">해당 주문이 없습니다.</p>
          </div>
        ) : (
          visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
          ))
        )}

        {/* Infinite scroll trigger */}
        <div ref={loaderRef} className="h-4" />

        {hasMore && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      {selectedOrder && (
        <BottomSheet order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
