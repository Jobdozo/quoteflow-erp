import React, { useState } from 'react';
import { Sparkles, X, MessageSquare, TrendingUp, Zap, Shield, FileText, Send, Check } from 'lucide-react';
import type { Quotation } from '../../types';

interface FloatingAiAssistantProps {
  quotations: Quotation[];
  onOpenQuotationBuilder: () => void;
}

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = ({
  quotations,
  onOpenQuotationBuilder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'win-predictor' | 'upsells' | 'sentiment'>('win-predictor');
  const [selectedQuoteId, setSelectedQuoteId] = useState(quotations[0]?.id || '');
  const [aiThinking, setAiThinking] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const selectedQuote = quotations.find((q) => q.id === selectedQuoteId) || quotations[0];

  const handlePredictWin = () => {
    setAiThinking(true);
    setAiResult(null);
    setTimeout(() => {
      setAiThinking(false);
      if (selectedQuote?.grandTotal > 200000) {
        setAiResult(
          `🎯 High Win Probability: 84%\n\nKey Win Factors:\n• Long-term contract requested\n• Multi-guard deployment bundle\n• Competitive profit margin (43.3%)\n\nSuggested Action: Send contract agreement today to close before month-end.`
        );
      } else {
        setAiResult(
          `🎯 Moderate Win Probability: 72%\n\nKey Win Factors:\n• Fast 30-day validity\n• Standard 18% GST slab\n\nSuggested Action: Follow up via phone call tomorrow.`
        );
      }
    }, 600);
  };

  const handleSentimentAnalysis = () => {
    setAiThinking(true);
    setAiResult(null);
    setTimeout(() => {
      setAiThinking(false);
      setAiResult(
        `😊 Customer Sentiment: Highly Interested & Receptive\n\nInteraction Insights:\n• Opened quotation PDF within 12 minutes\n• Requested armed gunman license verification\n• Budget aligned with standard rate card`
      );
    }, 600);
  };

  const handleSuggestUpsell = () => {
    setAiThinking(true);
    setAiResult(null);
    setTimeout(() => {
      setAiThinking(false);
      setAiResult(
        `💡 Recommended AI Upsell Bundle:\n\n1. Add CCTV 8-Channel HD System (₹45,000) — Saves client ₹24,000/yr in physical guard overtime.\n2. Add Property Theft Insurance Coverage (₹12,500/yr) — Zero liability risk for client.`
      );
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button at Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 text-white p-3.5 rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 border border-white/20"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-extrabold text-xs tracking-wide pr-1 hidden sm:inline">
            QuoteFlow AI Assistant
          </span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
        </button>
      </div>

      {/* Floating Modal Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-full max-w-md bg-slate-900 text-white rounded-3xl shadow-2xl border border-indigo-500/30 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-950 to-slate-900 p-4 border-b border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/40 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-white">QuoteFlow AI Copilot</h3>
                <span className="text-[10px] text-emerald-400 font-semibold">Online & Analyzing</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Pills */}
          <div className="flex bg-slate-950 p-2 gap-1 border-b border-slate-800 text-[11px]">
            <button
              onClick={() => {
                setActiveTab('win-predictor');
                setAiResult(null);
              }}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'win-predictor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Win Probability
            </button>

            <button
              onClick={() => {
                setActiveTab('sentiment');
                setAiResult(null);
              }}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'sentiment' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Sentiment
            </button>

            <button
              onClick={() => {
                setActiveTab('upsells');
                setAiResult(null);
              }}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'upsells' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Upsell AI
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Target Quotation</label>
              <select
                value={selectedQuoteId}
                onChange={(e) => setSelectedQuoteId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold outline-none"
              >
                {quotations.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.quotationNumber} - {q.companyName} (₹{q.grandTotal.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'win-predictor' && (
              <button
                onClick={handlePredictWin}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-1.5"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Calculate Win Probability</span>
              </button>
            )}

            {activeTab === 'sentiment' && (
              <button
                onClick={handleSentimentAnalysis}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Analyze Customer Sentiment</span>
              </button>
            )}

            {activeTab === 'upsells' && (
              <button
                onClick={handleSuggestUpsell}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>Generate Smart Upsell Package</span>
              </button>
            )}

            {/* AI Result Display Box */}
            {aiThinking && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-500/40 text-center text-indigo-300 py-6">
                <Zap className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                <span>AI analyzing deal metrics & customer data...</span>
              </div>
            )}

            {aiResult && !aiThinking && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-500/40 text-slate-200 leading-relaxed font-sans space-y-2 whitespace-pre-line animate-in fade-in">
                {aiResult}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
