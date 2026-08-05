import React, { useState } from 'react';
import { LayoutGrid, Plus, ArrowRight, ArrowLeft, CheckCircle2, TrendingUp, Filter } from 'lucide-react';
import type { Quotation, QuotationStatus } from '../../types';

interface PipelineKanbanViewProps {
  quotations: Quotation[];
  onSelectQuotation: (q: Quotation) => void;
  onUpdateStatus: (id: string, status: QuotationStatus) => void;
  onNewQuotation: () => void;
}

export const PipelineKanbanView: React.FC<PipelineKanbanViewProps> = ({
  quotations,
  onSelectQuotation,
  onUpdateStatus,
  onNewQuotation,
}) => {
  const stages: QuotationStatus[] = ['Draft', 'Sent', 'Viewed', 'Negotiation', 'Follow Up', 'Approved', 'Rejected'];

  const getStageHeaderBg = (stage: QuotationStatus) => {
    switch (stage) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Viewed':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Negotiation':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Follow Up':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Pipeline Kanban</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize deal flow from initial draft through negotiation, approval, and conversion.
          </p>
        </div>

        <button
          onClick={onNewQuotation}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-none">
        {stages.map((stage) => {
          const stageQuotes = quotations.filter((q) => q.status === stage);
          const stageValue = stageQuotes.reduce((sum, q) => sum + q.grandTotal, 0);

          return (
            <div
              key={stage}
              className="w-72 shrink-0 bg-slate-100/70 p-3 rounded-2xl border border-slate-200/80 flex flex-col justify-between"
            >
              {/* Column Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${getStageHeaderBg(stage)}`}>
                    {stage}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{stageQuotes.length} Deals</span>
                </div>

                <div className="text-[11px] font-bold text-slate-400 mb-3 pb-2 border-b border-slate-200">
                  Total: <strong className="text-slate-800">₹ {stageValue.toLocaleString('en-IN')}</strong>
                </div>

                {/* Cards List */}
                <div className="space-y-3">
                  {stageQuotes.map((q) => (
                    <div
                      key={q.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {q.quotationNumber}
                          </span>
                          <h4
                            onClick={() => onSelectQuotation(q)}
                            className="font-bold text-slate-900 text-xs mt-1 group-hover:text-indigo-600 transition-colors line-clamp-1"
                          >
                            {q.companyName}
                          </h4>
                          <span className="text-[11px] text-slate-400">{q.customerName}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="font-extrabold text-slate-900">
                          ₹ {q.grandTotal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {q.estimatedMarginPercent}% Margin
                        </span>
                      </div>

                      {/* Quick Move Buttons */}
                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Valid: {q.validUntil}</span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onUpdateStatus(q.id, 'Negotiation')}
                            className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded"
                            title="Move to Negotiation"
                          >
                            Neg
                          </button>
                          <button
                            onClick={() => onUpdateStatus(q.id, 'Approved')}
                            className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded"
                            title="Move to Approved"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageQuotes.length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-xs italic border border-dashed border-slate-300 rounded-xl">
                      No deals in {stage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
