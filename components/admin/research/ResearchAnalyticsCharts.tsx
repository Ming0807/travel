"use client";

import { Bar, BarChart, CartesianGrid, Cell, Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type ResearchFunnelDatum = { key: string; name: string; count: number; fill: string };
export type ResearchConstructDatum = { constructKey: string; label: string; score: number; scoreLabel: string; fill: string };

export function ResearchFunnelGraphic({ steps }: { steps: ResearchFunnelDatum[] }) {
  if (steps.length === 0) return null;
  return (
    <div className="hidden h-[24rem] min-w-0 lg:block" data-chart-engine="recharts" role="img" aria-label="กราฟเส้นทางผู้เข้าร่วมงานวิจัย">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 280, height: 384 }}>
        <FunnelChart>
          <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 5, boxShadow: "0 4px 8px rgba(15,23,42,0.10)", fontSize: 12 }} formatter={(value) => [`${Number(value).toLocaleString("th-TH")} sessions`, "จำนวน"]} />
          <Funnel dataKey="count" data={steps} isAnimationActive={false}>
            {steps.map((step) => <Cell key={`research-funnel-${step.key}`} fill={step.fill} stroke="#FFFFFF" strokeWidth={2} />)}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ResearchConstructScoreChart({ constructs }: { constructs: ResearchConstructDatum[] }) {
  if (constructs.length === 0) return null;
  return (
    <div className="h-[23rem] min-w-0 border-b border-slate-200 px-3 py-4 sm:px-5" data-chart-engine="recharts" role="img" aria-label="กราฟคะแนนรายองค์ประกอบงานวิจัย">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 760, height: 368 }}>
        <BarChart data={constructs} layout="vertical" margin={{ top: 4, right: 60, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} />
          <YAxis type="category" dataKey="label" width={144} axisLine={false} tickLine={false} tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }} />
          <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 5, boxShadow: "0 4px 8px rgba(15,23,42,0.10)", fontSize: 12 }} formatter={(value) => [`${Number(value).toFixed(2)} / 5`, "คะแนนเฉลี่ย"]} />
          <Bar dataKey="score" barSize={18} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {constructs.map((construct) => <Cell key={`research-construct-${construct.constructKey}`} fill={construct.fill} />)}
            <LabelList dataKey="scoreLabel" position="right" fill="#0F172A" fontSize={11} fontWeight={800} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
