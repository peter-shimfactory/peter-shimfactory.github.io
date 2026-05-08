import { useState, useRef, useEffect, useCallback } from "react";
import {
  AlertCircle, Star, Camera, MessageSquare, Phone, Send,
  ChevronRight, X, Package, CreditCard, Truck,
} from "lucide-react";
import { CopyableOrderId } from "../components/CopyableOrderId";
import { useNavigate } from "react-router";
import { cn } from "../../utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PostType = "urgent" | "review";
type BoardTab = "all" | "urgent" | "review";

export interface BoardPost {
  id: string;
  type: PostType;
  category: string; // e.g. "배송/지연 문의", "포토리뷰", "상품 문의"
  title: string;
  body: string;
  author: string; // masked
  createdAt: Date;
  rating?: number; // 1~5, review only
  hasPhoto?: boolean;
  relatedOrder?: {
    id: string;
    product: string;
    amount: number;
    status: string;
    phone: string;
  };
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const now = new Date();
function minsAgo(m: number) {
  return new Date(now.getTime() - m * 60 * 1000);
}

export const BOARD_POSTS: BoardPost[] = [
  {
    id: "CS-001",
    type: "urgent",
    category: "배송/지연 문의",
    title: "주문한 지 5일 됐는데 아직 출발도 안 했나요?",
    body: "지난 화요일에 주문했는데 아직 송장번호도 없고 배송 시작도 안 됐어요. 언제 출발하나요? 급하게 필요한데 답장 부탁드립니다.",
    author: "이*은",
    createdAt: minsAgo(25),
    relatedOrder: { id: "ORD-1002", product: "코튼 반팔 원피스", amount: 42000, status: "배송준비중", phone: "010-9876-****" },
  },
  {
    id: "CS-002",
    type: "urgent",
    category: "교환/반품 요청",
    title: "사이즈가 달라요, 교환 가능한가요?",
    body: "M 사이즈 주문했는데 L 사이즈로 왔어요. 빠른 교환 부탁드립니다. 포장은 뜯지 않았어요.",
    author: "박*수",
    createdAt: minsAgo(80),
    relatedOrder: { id: "ORD-1011", product: "스트라이프 셔츠", amount: 83000, status: "배송준비중", phone: "010-1111-****" },
  },
  {
    id: "CS-003",
    type: "review",
    category: "포토리뷰",
    title: "옷이 너무 예뻐요! 재구매 예정",
    body: "색감도 실사랑 똑같고 소재도 좋아요. 친구들한테 자랑했더니 다 어디서 샀냐고 물어봤어요 ㅎㅎ 다음엔 다른 색도 도전해보려구요!",
    author: "강*은",
    createdAt: minsAgo(150),
    rating: 5,
    hasPhoto: true,
    relatedOrder: { id: "ORD-1006", product: "실크 블라우스", amount: 189000, status: "배송완료", phone: "010-7777-****" },
  },
  {
    id: "CS-004",
    type: "urgent",
    category: "불량/하자",
    title: "받자마자 실밥 풀렸어요",
    body: "택배 뜯자마자 소매 부분 실밥이 풀려있었어요. 포장 상태는 멀쩡했는데 상품 자체 문제인 것 같아요. 환불 or 새제품으로 교환 원합니다.",
    author: "조*윤",
    createdAt: minsAgo(340),
    rating: 1,
    relatedOrder: { id: "ORD-1007", product: "무지 긴팔 티셔츠", amount: 76000, status: "배송완료", phone: "010-4444-****" },
  },
  {
    id: "CS-005",
    type: "review",
    category: "텍스트 리뷰",
    title: "배송 빠르고 상품 만족해요",
    body: "다음날 바로 왔어요. 상품도 설명이랑 똑같고 착용감도 좋습니다. 포장도 깔끔하게 잘 해주셨어요.",
    author: "윤*늘",
    createdAt: minsAgo(500),
    rating: 4,
    relatedOrder: { id: "ORD-1008", product: "니트 가디건", amount: 98000, status: "배송완료", phone: "010-6666-****" },
  },
  {
    id: "CS-006",
    type: "review",
    category: "상품 문의",
    title: "이 제품 S 사이즈 입고 예정인가요?",
    body: "현재 S 사이즈가 품절인데 재입고 계획이 있나요? 재입고 알림 신청이 가능한지도 알고 싶어요.",
    author: "서*린",
    createdAt: minsAgo(700),
  },
  {
    id: "CS-007",
    type: "urgent",
    category: "취소 요청",
    title: "주문 취소 원합니다, 연락 안 됩니다",
    body: "어제 주문했는데 갑자기 급전이 생겨서 취소하고 싶어요. 전화도 안 받으시고 카카오톡도 답이 없어서 여기에 남깁니다. 빨리 취소 처리 부탁드려요.",
    author: "정*우",
    createdAt: minsAgo(900),
    relatedOrder: { id: "ORD-1005", product: "데님 와이드팬츠", amount: 55000, status: "취소요청", phone: "010-3333-****" },
  },
  {
    id: "CS-008",
    type: "review",
    category: "포토리뷰",
    title: "생각보다 훨씬 퀄리티 좋아요",
    body: "가격 대비 퀄리티 최고예요. 소재도 좋고 봉제도 깔끔해요. 사진으로는 잘 안 나오는데 실물이 훨씬 예쁩니다.",
    author: "한*우",
    createdAt: minsAgo(1200),
    rating: 5,
    hasPhoto: true,
    relatedOrder: { id: "ORD-1010", product: "청바지", amount: 49000, status: "배송완료", phone: "010-0000-****" },
  },
];

const PAGE_SIZE = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn("w-3 h-3", s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")}
        />
      ))}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, onClick }: { post: BoardPost; onClick: () => void }) {
  const isUrgent = post.type === "urgent";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-white rounded-2xl border px-4 py-3.5 shadow-sm active:bg-gray-50 transition-colors",
        isUrgent ? "border-red-100" : "border-gray-100"
      )}
    >
      {/* Badge row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5">
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
          {post.rating !== undefined && <StarRating rating={post.rating} />}
        </div>
        <span className="text-[11px] text-gray-400">{relativeTime(post.createdAt)}</span>
      </div>

      {/* Title */}
      <p className={cn(
        "text-sm font-semibold leading-snug truncate",
        isUrgent ? "text-gray-900" : "text-gray-800"
      )}>
        {post.title}
      </p>

      {/* Body preview */}
      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{post.body}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">{post.author}</span>
        {post.relatedOrder && (
          <CopyableOrderId orderId={post.relatedOrder.id} prefix="#" className="bg-gray-50 px-2 py-0.5 rounded-full" />
        )}
      </div>
    </button>
  );
}

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────

function PostBottomSheet({ post, onClose, onGoToOrder }: {
  post: BoardPost;
  onClose: () => void;
  onGoToOrder: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isUrgent = post.type === "urgent";

  const handleCall = () => {
    if (post.relatedOrder?.phone) {
      const raw = post.relatedOrder.phone.replace(/[^0-9]/g, "");
      window.location.href = `tel:${raw}`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl animate-slide-up"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            {isUrgent ? (
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" />
                <span>{post.category}</span>
              </span>
            ) : (
              <span className={cn(
                "inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                post.hasPhoto ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
              )}>
                {post.hasPhoto ? <Camera className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                <span>{post.category}</span>
              </span>
            )}
            <span className="text-xs text-gray-400">{relativeTime(post.createdAt)}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Post content */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">
              고객 문의 / 리뷰
            </p>
            <div className={cn(
              "rounded-2xl p-4 border",
              isUrgent ? "bg-red-50/40 border-red-100" : "bg-blue-50/30 border-blue-100/60"
            )}>
              {post.rating !== undefined && (
                <div className="flex items-center space-x-1.5 mb-2">
                  <StarRating rating={post.rating} />
                  <span className="text-xs font-semibold text-gray-500">{post.rating}.0점</span>
                </div>
              )}
              <p className="text-sm font-bold text-gray-900 mb-1.5">{post.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{post.body}</p>
              <p className="text-[11px] text-gray-400 mt-2">— {post.author}</p>
            </div>
          </div>

          {/* Related order */}
          {post.relatedOrder && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                연관 주문 요약
              </p>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Package className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-44">{post.relatedOrder.product}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                    post.relatedOrder.status === "취소요청" ? "bg-red-50 text-red-500" :
                    post.relatedOrder.status === "배송완료" ? "bg-green-50 text-green-600" :
                    "bg-amber-50 text-amber-600"
                  )}>
                    {post.relatedOrder.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <CreditCard className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-semibold text-gray-800">{post.relatedOrder.amount.toLocaleString()}원</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <CopyableOrderId orderId={post.relatedOrder.id} />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2.5 pb-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">빠른 실행</p>
            {post.relatedOrder && (
              <button
                onClick={onGoToOrder}
                className="w-full flex items-center justify-between bg-blue-600 text-white rounded-xl px-4 py-3"
              >
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-semibold">주문 상세 보기</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {post.relatedOrder && (
              <button
                onClick={handleCall}
                className="w-full flex items-center justify-between bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-3"
              >
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-semibold">고객에게 전화걸기</span>
                </div>
                <span className="text-xs text-green-500">{post.relatedOrder.phone}</span>
              </button>
            )}
            <button className="w-full flex items-center justify-between bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl px-4 py-3">
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span className="text-sm font-semibold">문자 / 알림톡 발송</span>
              </div>
              <span className="text-xs text-indigo-400">템플릿 선택</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { key: BoardTab; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "urgent", label: "🚨 긴급 CS" },
  { key: "review", label: "🌟 리뷰" },
];

function getTabPosts(tab: BoardTab) {
  if (tab === "all") return BOARD_POSTS;
  return BOARD_POSTS.filter((p) => p.type === tab);
}

export function Board() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<BoardTab>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<BoardPost | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const tabPosts = getTabPosts(activeTab);
  const visible = tabPosts.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < tabPosts.length;

  function changeTab(tab: BoardTab) {
    setActiveTab(tab);
    setPage(1);
  }

  const loadMore = useCallback(() => {
    if (hasMore) setPage((p) => p + 1);
  }, [hasMore]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const urgentCount = BOARD_POSTS.filter((p) => p.type === "urgent").length;
  const reviewCount = BOARD_POSTS.filter((p) => p.type === "review").length;

  function tabCount(tab: BoardTab) {
    if (tab === "all") return BOARD_POSTS.length;
    if (tab === "urgent") return urgentCount;
    return reviewCount;
  }

  return (
    <div className="flex flex-col bg-gray-50 min-h-full pb-16">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-0 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">고객의 소리</h1>
          {urgentCount > 0 && (
            <span className="inline-flex items-center space-x-1 bg-red-50 text-red-500 text-xs font-bold px-2.5 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>긴급 {urgentCount}건</span>
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          {TABS.map(({ key, label }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => changeTab(key)}
                className={cn(
                  "flex items-center space-x-1.5 px-3 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0",
                  isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                <span>{label}</span>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center",
                  key === "urgent" && isActive ? "bg-red-100 text-red-500" :
                  isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                )}>
                  {tabCount(key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-2">
            <MessageSquare className="w-10 h-10 text-gray-200" />
            <p className="text-sm">게시글이 없습니다.</p>
          </div>
        ) : (
          visible.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => setSelected(post)} />
          ))
        )}
        <div ref={loaderRef} className="h-4" />
        {hasMore && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      {selected && (
        <PostBottomSheet
          post={selected}
          onClose={() => setSelected(null)}
          onGoToOrder={() => { setSelected(null); navigate("/orders"); }}
        />
      )}
    </div>
  );
}
