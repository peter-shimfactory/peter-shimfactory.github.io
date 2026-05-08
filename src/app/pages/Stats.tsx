import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { InfoTooltip } from "../components/InfoTooltip";

const data = [
  { name: "월", 매출: 120 },
  { name: "화", 매출: 150 },
  { name: "수", 매출: 180 },
  { name: "목", 매출: 140 },
  { name: "금", 매출: 210 },
  { name: "토", 매출: 250 },
  { name: "일", 매출: 190 },
];

export function Stats() {
  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-full pb-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-900">통계 및 분석</h1>
      </div>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center">
            일간 매출 요약 (최근 7일)
            <InfoTooltip content="단위: 만원. 실시간 집계가 아니므로 최종 정산과 다를 수 있습니다." />
          </h2>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="매출" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
         <h2 className="text-sm font-semibold text-gray-800">월간 핵심 지표</h2>
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
      </section>
    </div>
  );
}
