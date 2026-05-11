import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

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

    // TODO: Firebase Functions를 통해 code → access_token 교환
    // 현재는 code 수신 확인까지만 처리
    console.info("[AuthCallback] 인증코드 수신 완료:", code);

    setStatus("success");
    setMessage("인증코드를 받았어요! 곧 토큰 교환 기능이 연결됩니다.");

    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 2500);

    return () => clearTimeout(timer);
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
