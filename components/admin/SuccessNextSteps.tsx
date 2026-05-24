"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";
import React from "react";

export type NextStepAction = {
  label: string;
  href: string;
  icon: React.ElementType;
  primary?: boolean;
};

type SuccessNextStepsProps = {
  title: string;
  description?: string;
  actions: NextStepAction[];
};

export function SuccessNextSteps({ title, description, actions }: SuccessNextStepsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-teal/10 text-teal rounded-full flex items-center justify-center mb-6 ring-8 ring-teal/5">
        <CheckCircle size={56} weight="fill" />
      </div>
      
      <h2 className="text-3xl font-black text-slate-800 mb-3 text-center">{title}</h2>
      
      {description && (
        <p className="text-slate-500 text-center max-w-md mb-10">
          {description}
        </p>
      )}

      <div className="w-full max-w-lg space-y-4">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={idx}
              href={action.href}
              className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                action.primary
                  ? "bg-teal border-teal text-white shadow-md hover:bg-teal/90 hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-white border-slate-200 text-slate-700 hover:border-teal/30 hover:bg-teal/5 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${action.primary ? "bg-white/20" : "bg-slate-100 text-slate-500 group-hover:bg-teal/10 group-hover:text-teal"}`}>
                  <Icon size={24} weight={action.primary ? "fill" : "duotone"} />
                </div>
                <span className={`font-bold text-lg ${action.primary ? "text-white" : "text-slate-700"}`}>
                  {action.label}
                </span>
              </div>
              <ArrowRight 
                size={20} 
                weight="bold" 
                className={`transition-transform group-hover:translate-x-1 ${action.primary ? "text-white/70" : "text-slate-400"}`} 
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
