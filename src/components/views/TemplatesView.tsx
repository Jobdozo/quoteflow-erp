import React from 'react';
import { Copy, Plus, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { ProposalTemplate } from '../../types';

interface TemplatesViewProps {
  templates: ProposalTemplate[];
  onUseTemplate: (template: ProposalTemplate) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ templates, onUseTemplate }) => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Proposal Templates</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Use ready-made service packages and pre-written proposals to create quotations in under 30 seconds.
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {tpl.category}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {tpl.defaultItems.length} Default Items
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-3">{tpl.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{tpl.description}</p>

              {/* Items summary */}
              <div className="mt-4 space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">INCLUDED SERVICES</span>
                {tpl.defaultItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-700">
                    <span className="font-semibold">{item.name}</span>
                    <span className="font-extrabold text-slate-900">
                      ₹ {item.rate.toLocaleString('en-IN')} / {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onUseTemplate(tpl)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Quotation from Template</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
