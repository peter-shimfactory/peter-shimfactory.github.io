import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../../utils/cn";

interface CopyableOrderIdProps {
  orderId: string;
  className?: string;
  /** prefix 텍스트. 기본값 "주문번호" */
  prefix?: string;
}

export function CopyableOrderId({ orderId, className, prefix = "주문번호" }: CopyableOrderIdProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(orderId);
    } catch {
      // fallback for non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = orderId;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center space-x-1.5 group",
        className
      )}
      aria-label={`주문번호 ${orderId} 복사`}
    >
      <span className="text-xs text-gray-400">
        {prefix} <span className="font-medium text-gray-500">{orderId}</span>
      </span>
      <span className={cn(
        "transition-colors shrink-0",
        copied ? "text-green-500" : "text-gray-300 group-hover:text-gray-400"
      )}>
        {copied
          ? <Check className="w-3.5 h-3.5" />
          : <Copy className="w-3.5 h-3.5" />
        }
      </span>
      {copied && (
        <span className="text-[10px] font-semibold text-green-500">복사됨</span>
      )}
    </button>
  );
}
