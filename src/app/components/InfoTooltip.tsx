import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current && !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleClick() {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        left: rect.left + rect.width / 2,
      });
    }
    setIsOpen((v) => !v);
  }

  return (
    <span className="inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        className="text-gray-400 hover:text-gray-600 focus:outline-none ml-1"
        aria-label="정보"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && createPortal(
        <div
          ref={tooltipRef}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[9999] w-48 -translate-x-1/2 p-2 text-xs leading-tight text-white bg-gray-800 rounded-lg shadow-lg before:content-[''] before:absolute before:-top-1 before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-gray-800"
        >
          {content}
        </div>,
        document.body
      )}
    </span>
  );
}
