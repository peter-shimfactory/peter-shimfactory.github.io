import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell, ShoppingBag, DollarSign, AlertCircle, PackageX, Truck,
  TrendingUp, AlertTriangle, Crown, PackageMinus, Sparkles, ChevronRight, GripVertical, Zap, Lock, Camera, MessageSquare,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { InfoTooltip } from "../components/InfoTooltip";
import { useProContext } from "../contexts/ProContext";
import { BOARD_POSTS, type BoardPost } from "./Board";
import { cn } from "../../utils/cn";

interface SortableSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

const PRO_FEATURES = new Set(["vip", "inventory", "suppliers"]);

function ProBadge() {
  return (
    <span className="inline-flex items-center space-x-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
      <Zap className="w-2.5 h-2.5" />
      <span>PRO</span>
    </span>
  );
}

function LockedValue({ value, unit, className }: { value: string; unit: string; className?: string }) {
  return (
    <div className="flex items-center space-x-1">
      <span className={`font-bold blur-sm select-none ${className ?? ""}`}>{value}</span>
      <span className="text-sm text-gray-400 font-medium">{unit}</span>
      <Lock className="w-3.5 h-3.5 text-gray-400" />
    </div>
  );
}

function SortableSection({ id, title, children }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`space-y-3${isDragging ? " opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-600">{title}</h2>
        <button
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          className="p-1 touch-none cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 focus:outline-none"
          aria-label="드래그하여 순서 변경"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>
      {children}
    </section>
  );
}

// Mock Data
const MOCK_DATA = {
  lastUpdated: "2026. 05. 06 14:30",
  vipOrders: 8,
  lowStockProducts: [
    { id: 1, name: "썸머 쿨링 슬랙스 (블랙/M)", stock: 3 },
    { id: 2, name: "린넨 오버핏 셔츠 (화이트)", stock: 5 },
    { id: 3, name: "베이직 무지 반팔티 (네이비)", stock: 8 },
  ],
  todaySales: 15420000,
  todayOrders: 214,
  todayMargin: 4250000,
  issues: {
    unprocessed: 42,
    cancelRefund: 18,
    combinedShippingDelayed: 7,
  },
  topSuppliers: [
    { id: 1, name: "동대문 도매상가 A", sales: 1540 },
    { id: 2, name: "제일어패럴", sales: 1220 },
    { id: 3, name: "성수팩토리", sales: 945 },
    { id: 4, name: "트렌드아이", sales: 650 },
    { id: 5, name: "도매마켓B", sales: 435 },
  ],
  topProducts: [
    { id: 1, name: "베이직 무지 반팔티", qty: 230 },
    { id: 2, name: "와이드 핏 데님 팬츠", qty: 185 },
    { id: 3, name: "린넨 오버핏 셔츠", qty: 150 },
    { id: 4, name: "썸머 쿨링 슬랙스", qty: 120 },
    { id: 5, name: "데일리 볼캡", qty: 85 },
  ],
  worstSuppliers: [
    { id: 1, name: "스피드배송(지연)", reason: "평균 배송 5.2일 지연", severity: "high" },
    { id: 2, name: "퀄리티마켓(불량)", reason: "불량 반품률 12% 급증", severity: "high" },
    { id: 3, name: "가성비어패럴", reason: "오배송 5건 발생", severity: "medium" },
  ]
};

export function Home() {
  const { isPro } = useProContext();
  const navigate = useNavigate();

  const [sectionOrder, setSectionOrder] = useState([
    "sales", "vip", "issues", "inventory", "suppliers",
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const sections: Record<string, { title: string; content: React.ReactNode }> = {
    sales: {
      title: "외형 매출과 실질 마진",
      content: (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-linear-to-br from-blue-50/50 to-white">
            <div className="flex items-center text-gray-600 mb-2">
              <TrendingUp className="w-4 h-4 mr-1.5 text-blue-600" />
              <span className="text-sm font-medium">오늘 예상 마진 (수익)</span>
              <InfoTooltip content="공급사별/카테고리별 원가율을 반영한 추정치입니다." />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
                {MOCK_DATA.todayMargin.toLocaleString()}
              </span>
              <span className="text-lg font-bold text-gray-700">원</span>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-4">
              <div className="flex items-center text-gray-500 mb-1.5">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">총 결제 매출</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {MOCK_DATA.todaySales.toLocaleString()}원
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center text-gray-500 mb-1.5">
                <ShoppingBag className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">신규 주문</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {MOCK_DATA.todayOrders.toLocaleString()}건
              </span>
            </div>
          </div>
        </div>
      ),
    },
    vip: {
      title: "단골/VIP 고객 현황",
      content: MOCK_DATA.vipOrders > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-indigo-50/40">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-gray-800 block">단골/VIP 신규 주문</span>
                <span className="text-xs text-gray-500">재구매 3회 이상 단골 고객</span>
              </div>
            </div>
            {isPro ? (
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-extrabold text-indigo-600">{MOCK_DATA.vipOrders}</span>
                <span className="text-sm text-gray-500 font-medium">건</span>
              </div>
            ) : (
              <LockedValue value={String(MOCK_DATA.vipOrders)} unit="건" className="text-2xl text-indigo-600" />
            )}
          </div>
        </div>
      ) : null,
    },
    issues: {
      title: "운영 병목 및 리스크 식별",
      content: (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          <div className="flex items-center justify-between p-4.5 bg-red-50/40" id="issues-unprocessed">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="font-semibold text-gray-800">미처리 주문</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-extrabold text-red-600">{MOCK_DATA.issues.unprocessed}</span>
              <span className="text-sm text-gray-500 font-medium">건</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-4.5 bg-orange-50/40">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <PackageX className="w-5 h-5" />
              </div>
              <span className="font-semibold text-gray-800">취소/환불 요청</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-extrabold text-orange-600">{MOCK_DATA.issues.cancelRefund}</span>
              <span className="text-sm text-gray-500 font-medium">건</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-4.5 bg-yellow-50/40">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-gray-800 flex items-center space-x-1.5">
                  <span>합배송 지연 묶임</span>
                  <InfoTooltip content="2개 이상의 상품 중 일부 상품 미입고로 배송이 지연되는 주문 건수입니다." />
                </span>
              </div>
            </div>
            {isPro ? (
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-extrabold text-yellow-600">{MOCK_DATA.issues.combinedShippingDelayed}</span>
                <span className="text-sm text-gray-500 font-medium">건</span>
              </div>
            ) : (
              <LockedValue value={String(MOCK_DATA.issues.combinedShippingDelayed)} unit="건" className="text-2xl text-yellow-600" />
            )}
          </div>
        </div>
      ),
    },
    inventory: {
      title: "재고 방어 및 주력 상품 모니터링",
      content: (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4">
          <h3 className="text-sm font-bold text-orange-600 mb-3 flex items-center justify-between">
            <div className="flex items-center">
              <PackageMinus className="w-4 h-4 mr-1.5" />
              품절 임박 상품 리스트
            </div>
            <span className="text-xs font-normal text-gray-400">잔여 재고 기준</span>
          </h3>
          <ul className="space-y-3">
            {MOCK_DATA.lowStockProducts.map((product) => (
              <li key={product.id} className="flex items-center justify-between p-3 bg-orange-50/40 rounded-lg border border-orange-50">
                <span className="text-sm font-medium text-gray-800 truncate pr-4">{product.name}</span>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <span className="text-xs text-gray-500">잔여</span>
                  {isPro ? (
                    <span className="text-sm font-bold text-orange-600">{product.stock}개</span>
                  ) : (
                    <LockedValue value={String(product.stock)} unit="개" className="text-sm text-orange-600" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    suppliers: {
      title: "공급사 성과 및 문제 추적",
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-4">
            <h3 className="text-sm font-bold text-red-600 mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              문제 발생 워스트 공급사 TOP 3
            </h3>
            <ul className="space-y-3">
              {MOCK_DATA.worstSuppliers.map((supplier, index) => (
                <li key={supplier.id} className="flex flex-col space-y-1 p-3 bg-red-50/50 rounded-lg border border-red-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-red-500 bg-white px-1.5 py-0.5 rounded-md border border-red-100">
                        {index + 1}위
                      </span>
                      <span className="text-sm font-bold text-gray-800">{supplier.name}</span>
                    </div>
                  </div>
                  {isPro ? (
                    <span className="text-xs font-medium text-red-600 pl-9">{supplier.reason}</span>
                  ) : (
                    <span className="text-xs font-medium text-gray-300 blur-sm select-none pl-9">{supplier.reason}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-between">
              공급사 랭킹
              <span className="text-xs font-normal text-gray-400">판매금액 기준</span>
            </h3>
            <ul className="space-y-3">
              {MOCK_DATA.topSuppliers.map((supplier, index) => (
                <li key={supplier.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${index < 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700 font-medium">{supplier.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{supplier.sales.toLocaleString()}건</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-between">
              상품 랭킹
              <span className="text-xs font-normal text-gray-400">판매수량 기준</span>
            </h3>
            <ul className="space-y-3">
              {MOCK_DATA.topProducts.map((product, index) => (
                <li key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${index < 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700 font-medium truncate w-40">{product.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{product.qty.toLocaleString()}개</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="p-4 space-y-5 bg-gray-50 pb-20">

      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">스타일플러스 대시보드</h1>
            {isPro && (
              <span className="inline-flex items-center space-x-1 bg-linear-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Zap className="w-2.5 h-2.5" />
                <span>PRO</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            마지막 업데이트: {MOCK_DATA.lastUpdated}
            <InfoTooltip content="데이터는 10분 주기로 동기화됩니다." />
          </p>
        </div>
        <button className="relative p-2 text-gray-600 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>

      {/* Free: PRO 체험 배너 / Pro: 홍보 배너 */}
      {!isPro ? (
        <div className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl px-4 py-3 shadow-sm text-white overflow-hidden relative flex items-center justify-between">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute -right-2 bottom-0 w-12 h-12 bg-white/10 rounded-full" />
          <div className="flex items-center space-x-2.5">
            <Zap className="w-4 h-4 text-yellow-300 shrink-0" />
            <div>
              <span className="text-xs font-bold text-indigo-100 uppercase tracking-wide">스타일플러스 PRO</span>
              <p className="text-sm font-bold leading-snug">PRO 14일 무료 체험하기</p>
            </div>
          </div>
          <button className="relative flex items-center space-x-1 bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ml-3">
            <span>시작하기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 overflow-hidden relative flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">스타일플러스 멤버십</span>
              <p className="text-sm font-bold leading-snug text-purple-700">단골 고객을 위한 특별 혜택</p>
            </div>
          </div>
          <button className="flex items-center space-x-1 bg-purple-100 hover:bg-purple-200 transition-colors text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ml-3">
            <span>혜택 보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Draggable Sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-5">
            {sectionOrder.map((id) => {
              const section = sections[id];
              if (!section.content) return null;
              return (
                <SortableSection key={id} id={id} title={section.title}>
                  {section.content}
                </SortableSection>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* CS / 리뷰 미리보기 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600">최신 고객의 소리 (CS/리뷰)</h2>
          <button
            onClick={() => navigate("/board")}
            className="flex items-center space-x-0.5 text-xs text-blue-500 font-semibold"
          >
            <span>전체보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          onClick={() => navigate("/board")}
          className="w-full text-left space-y-2.5"
        >
          {BOARD_POSTS.slice(0, 3).map((post: BoardPost) => {
            const isUrgent = post.type === "urgent";
            return (
              <div
                key={post.id}
                className={cn(
                  "bg-white rounded-2xl border px-4 py-3 shadow-sm",
                  isUrgent ? "border-red-100" : "border-gray-100"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  {isUrgent ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      <span>{post.category}</span>
                    </span>
                  ) : (
                    <span className={cn(
                      "inline-flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                      post.hasPhoto ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                    )}>
                      {post.hasPhoto ? <Camera className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                      <span>{post.category}</span>
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400">{post.author}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.body}</p>
              </div>
            );
          })}
        </button>
      </section>

    </div>
  );
}
