"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendData {
    month: string;
    searchVolume: number;
    videoCount: number;
}

// Custom Dot for Min/Max annotations
const CustomDot = (props: any) => {
    const { cx, cy, payload, dataMax, dataMin } = props;
    if (payload.searchVolume === dataMax || payload.searchVolume === dataMin) {
        return (
            <g transform={`translate(${cx},${cy})`}>
                <circle r={4} fill="#22c55e" stroke="#fff" strokeWidth={2} />
                <text x={0} y={payload.searchVolume === dataMax ? -10 : 20} textAnchor="middle" fill="#15803d" fontSize={10} fontWeight="bold">
                    {payload.month}
                </text>
            </g>
        );
    }
    return null;
};

export function VolumeTrendChart({ data }: { data: TrendData[] }) {
    // Calculate Min/Max for annotation
    const volumes = data.map(d => d.searchVolume);
    const maxVol = Math.max(...volumes);
    const minVol = Math.min(...volumes);

    return (
        <Card className="col-span-2 border-none shadow-none bg-transparent">
            {/* Title is handled by parent for dynamic % change */}
            <CardContent className="h-[300px] p-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickFormatter={(value) => value >= 10000 ? `${(value / 10000).toFixed(1)}만` : value}
                        />
                        {/* 오른쪽 Y축 제거 - 두 데이터를 동일한 스케일로 비교하기 위해 왼쪽 Y축만 사용 */}
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#374151', fontSize: '13px' }}
                            labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />

                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="searchVolume"
                            stroke="#22c55e"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorVolume)"
                            name="월간 검색량"
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            dot={<CustomDot dataMax={maxVol} dataMin={minVol} />}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="videoCount"
                            stroke="#3b82f6"
                            name="월간 발행 영상"
                            strokeWidth={2}
                            dot={false}
                            strokeDasharray="5 5" // Dashed line for secondary metric
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function DeviceRatioChart({ pc, mobile }: { pc: number, mobile: number }) {
    const total = pc + mobile;
    const pcPercent = total > 0 ? Math.round((pc / total) * 100) : 0;
    const mobilePercent = total > 0 ? 100 - pcPercent : 0;

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="pb-2 px-0">
                <CardTitle className="text-sm text-gray-500">기기별 검색 비율</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="space-y-6">
                    {/* Bar 1: Mobile (Green) vs PC (Gray/Right) -> Actually reference has 2 separate ratio bars? 
                        Reference: Green Bar (Mobile 97%) ... PC 3% (Gray remainder)
                        Let's implement one single bar for Mobile vs PC since they sum to 100%.
                    */}
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
                            <div style={{ width: `${mobilePercent}%` }} className="h-full bg-emerald-400 rounded-full" />
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                            <span>모바일 {mobilePercent}%</span>
                            <span>PC {pcPercent}%</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function MarketSaturationChart({ volume, saturation }: { volume: number, saturation: number }) {
    // Determine max for scaling bar widths relative to each other (log scale or linear?)
    // Volume (Demand) is usually much larger than Saturation (Supply).
    // Let's just show full bars with clear labels.

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="pb-2 px-0">
                <CardTitle className="text-sm text-gray-500">시장 수급 비교</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                {/* Demand Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>월간 검색량 (수요)</span>
                        <span className="font-bold text-gray-900">{volume.toLocaleString()}</span>
                    </div>
                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full w-full" />
                    </div>
                </div>

                {/* Supply Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>월간 발행량 (공급)</span>
                        <span className="font-bold text-gray-900">{saturation.toLocaleString()}</span>
                    </div>
                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                        {/* Scale visually relative to volume? Might be too small. Just show relative intensity color? */}
                        {/* Let's make it a fixed full bar but Orange/Red based on intensity? Reference shows full orange bar. */}
                        <div className="h-full bg-orange-400 rounded-full w-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function ScoreGaugeChart({ score, max, label, color, insight }: { score: number, max: number, label: string, color: string, insight?: string }) {
    // Ensure score doesn't exceed max for percentage calc
    const validScore = Math.min(score, max);
    const percentage = (validScore / max) * 100;

    // Data for Pie Chart: [Score, Remainder]
    // Remainder should be (Max - Score).
    // If score is 50/100, data is [50, 50].
    const data = [
        { name: 'Score', value: validScore },
        { name: 'Remainder', value: max - validScore }
    ];

    return (
        <Card className="border-none shadow-none bg-transparent flex flex-col items-center justify-center p-0">
            <CardContent className="h-[160px] w-full relative flex flex-col items-center p-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="90%" // Moved down to utilize space
                            startAngle={180}
                            endAngle={0}
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell key="cell-0" fill={color} />
                            <Cell key="cell-1" fill="#f3f4f6" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Label */}
                <div className="absolute top-[80%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-3xl font-bold mb-1" style={{ color: color }}>{label}</div>
                    <div className="text-lg font-bold text-gray-400">
                        <span className="text-gray-900 text-xl">{score}점</span>
                        <span className="text-sm"> /{max}점</span>
                    </div>
                </div>
            </CardContent>

            {/* Dynamic Insight Banner */}
            <div className={`mt-2 px-4 py-3 rounded-full flex items-center gap-2 text-sm font-bold w-full justify-center ${score < 20 ? "bg-red-50 text-red-600" :
                score < 30 ? "bg-amber-50 text-amber-600" :
                    "bg-blue-50 text-blue-600"
                }`}>
                {insight || (
                    score < 20 ? "⚠️ 판매 하락에 영향을 미칠 수 있는 문제 발견!" :
                        score < 35 ? "⚡ 조금만 더 개선하면 떡상 가능해요!" :
                            "🎉 완벽합니다! 이대로 진행하세요!"
                )}
            </div>
        </Card>
    );
}

export function MicroTrendChart({ data, color, label }: { data: { day: string, value: number }[], color: string, label: string }) {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border shadow-md rounded-md p-2.5 text-xs min-w-[100px]">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full ring-1 ring-offset-1 ring-offset-background" style={{ backgroundColor: color }}></span>
                        <span className="font-bold text-foreground text-sm">{payload[0].value.toLocaleString()}</span>
                    </div>
                    <p className="text-muted-foreground px-0.5">{label}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-12 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="day" hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
