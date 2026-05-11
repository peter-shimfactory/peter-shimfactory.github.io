import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { app } from "../../lib/firebase";

type Status = "loading" | "success" | "error";

export function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("카페24 인증코드를 처리하고 있어요...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      setStatus("error");
      setMessage("카페24 인증이 거부됐어요. 다시 시도해 주세요.");
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("인증코드를 찾을 수 없어요. 카페24에서 다시 시도해 주세요.");
      return;
    }

    // mallId: URL params 또는 localStorage에서 읽기
    const mallId = params.get("mall_id") || localStorage.getItem("cafe24_mall_id");

    if (!mallId) {
      setStatus("error");
      setMessage("쇼핑몰 ID를 찾을 수 없어요. 설정 페이지에서 다시 연동해 주세요.");
      return;
    }

    // Firebase Functions를 통해 code → access_token 교환
    (async () => {
      try {
        const { getFunctions, httpsCallable } = await import("firebase/functions");
        const functions = getFunctions(app, "asia-northeast3");
        const exchangeToken = httpsCallable<
          { code: string; mallId: string },
          { success: boolean; mallId: string; userId: string; expiresAt: string }
        >(functions, "cafe24ExchangeToken");

        const result = await exchangeToken({ code, mallId });

        if (result.data.success) {
          localStorage.setItem("cafe24_mall_id", result.data.mallId);
          localStorage.setItem("cafe24_connected", "true");

          setStatus("success");
          setMessage("카페24 연동이 완료됐어요! 이제 실시간 데이터를 확인할 수 있어요.");

          setTimeout(() => navigate("/", { replace: true }), 2500);
        } else {
          throw new Error("토큰 교환 응답 오류");
        }
      } catch (err) {
        console.error("[AuthCallback] 토큰 교환 실패:", err);
        setStatus("error");
        setMessage("토큰 교환에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm text-center space-y-5">
        {/* 아이콘 */}
        <div className="flex justify-center">
          {status === "loading" && (
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          )}
          {status === "success" && (
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          )}
          {status === "error" && (
            <AlertCircle className="w-12 h-12 text-red-500" />
          )}
        </div>

        {/* 타이틀 */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            카페24 연동
          </p>
          <h1 className="text-lg font-bold text-gray-900">
            {status === "loading" && "인증 처리 중..."}
            {status === "success" && "인증 성공!"}
            {status === "error" && "인증 실패"}
          </h1>
        </div>

        {/* 메시지 */}
        <p className="text-sm text-gray-500 leading-relaxed">{message}</p>

        {/* 에러 시 재시도 버튼 */}
        {status === "error" && (
          <button
            onClick={() => navigate("/settings", { replace: true })}
            className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            설정으로 돌아가기
          </button>
        )}

        {/* 성공 시 홈 이동 안내 */}
        {status === "success" && (
          <p className="text-xs text-gray-400">잠시 후 홈 화면으로 이동합니다...</p>
        )}
      </div>
    </div>
  );
}
