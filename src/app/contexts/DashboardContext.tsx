import { createContext, useContext, useState, type ReactNode } from "react";

// ─── 필수 항목 (항상 표시) ─────────────────────────────────────────────────────
export const REQUIRED_SECTIONS: { id: string; label: string }[] = [
  { id: "sales",     label: "외형 매출과 실질 마진" },
  { id: "issues",    label: "운영 병목 및 리스크 식별" },
  { id: "suppliers", label: "공급사 랭킹" },
];

// ─── 선택 항목 (토글 가능) ────────────────────────────────────────────────────
export const OPTIONAL_SECTIONS: { id: string; label: string; description: string }[] = [
  { id: "vip",       label: "단골/VIP 고객 현황",           description: "재구매 3회 이상 단골 고객의 신규 주문 현황" },
  { id: "inventory", label: "재고 방어 및 주력 상품 모니터링", description: "품절 임박 상품·베스트셀러 실시간 확인" },
];

const LS_KEY = "dashboard_enabled_optionals";

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return ["vip"]; // 기본값: 첫 번째 선택 항목 활성화
    return JSON.parse(raw) as string[];
  } catch {
    return ["vip"];
  }
}

interface DashboardContextType {
  enabledOptionals: string[];
  toggleOptional: (id: string, isPro: boolean) => "ok" | "limit";
  isEnabled: (id: string) => boolean;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [enabledOptionals, setEnabledOptionals] = useState<string[]>(loadFromStorage);

  function toggleOptional(id: string, isPro: boolean): "ok" | "limit" {
    setEnabledOptionals((prev) => {
      if (prev.includes(id)) {
        // 끄기는 항상 허용
        const next = prev.filter((s) => s !== id);
        localStorage.setItem(LS_KEY, JSON.stringify(next));
        return next;
      }
      // 켜기: Free 플랜 1개 제한
      if (!isPro && prev.length >= 1) {
        return prev; // 변경 없음 (limit 반환용)
      }
      const next = [...prev, id];
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });

    // limit 판단: 켜려는데 free이고 이미 1개 이상
    const alreadyEnabled = enabledOptionals.includes(id);
    if (!alreadyEnabled && !isPro && enabledOptionals.length >= 1) {
      return "limit";
    }
    return "ok";
  }

  function isEnabled(id: string): boolean {
    // 필수 항목은 항상 활성
    if (REQUIRED_SECTIONS.some((s) => s.id === id)) return true;
    return enabledOptionals.includes(id);
  }

  return (
    <DashboardContext.Provider value={{ enabledOptionals, toggleOptional, isEnabled }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardContext must be used within DashboardProvider");
  return ctx;
}
