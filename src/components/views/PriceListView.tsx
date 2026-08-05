import React from 'react';
import { BadgePercent, Shield, Check, Zap } from 'lucide-react';
import { Product } from '../../types';

interface PriceListViewProps {
  products: Product[];
  onSelectPackage: (product: Product) => void;
}

export const PriceListView: React.FC<PriceListViewProps> = ({ products, onSelectPackage }) => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Price List</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Standardized pricing tiers, volume discounts, and service packages for instant quotation lookup.
        </p>
      </div>

      {/* Pricing Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Security & Facility Rate Card</h3>
          <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full">
            FY 2026-27 Approved Rates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Service Category</th>
                <th className="py-3 px-4">Product / Item Name</th>
                <th className="py-3 px-4 text-center">Unit</th>
                <th className="py-3 px-4 text-right">Standard Rate (₹)</th>
                <th className="py-3 px-4 text-right">Corporate Rate (₹)</th>
                <th className="py-3 px-4 text-right">GST Slab</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const corporateRate = Math.round(p.rate * 0.92);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-indigo-600">{p.category}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{p.description}</p>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-600">{p.unit}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      ₹ {p.rate.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                      ₹ {corporateRate.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-600">{p.gstRate}%</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectPackage(p)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg transition-colors"
                      >
                        Quote This
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
