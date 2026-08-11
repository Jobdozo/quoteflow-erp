import React, { useState } from 'react';
import { Package, Plus, Search, Shield, Sparkles, Edit, Trash2, X, FolderPlus, Tag, CheckCircle2 } from 'lucide-react';
import { Product } from '../../types';
import { StorageService } from '../../utils/storage';

interface ProductsViewProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ products, onSaveProduct, onDeleteProduct }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category State
  const [customCategories, setCustomCategories] = useState<string[]>(() => StorageService.getCategories());
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [categoryNotice, setCategoryNotice] = useState<string | null>(null);

  // Product Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Security');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('Month');
  const [rate, setRate] = useState<number>(18500);
  const [gstRate, setGstRate] = useState<number>(18);
  const [costPrice, setCostPrice] = useState<number>(14000);
  const [standardTerms, setStandardTerms] = useState('');

  const filterTabs = ['All', ...customCategories];

  const handleAddCategory = (catNameStr?: string) => {
    const targetName = (catNameStr || newCategoryInput).trim();
    if (!targetName) return;

    if (customCategories.some((c) => c.toLowerCase() === targetName.toLowerCase())) {
      alert(`Category "${targetName}" already exists!`);
      return;
    }

    const updated = [...customCategories, targetName];
    setCustomCategories(updated);
    StorageService.saveCategories(updated);
    setNewCategoryInput('');
    setCategoryNotice(`Category "${targetName}" added successfully!`);
    setTimeout(() => setCategoryNotice(null), 3000);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (customCategories.length <= 1) {
      alert('You must keep at least one category in the catalog.');
      return;
    }

    const countInCat = products.filter((p) => p.category === catToDelete).length;
    const confirmMsg = countInCat > 0
      ? `Category "${catToDelete}" has ${countInCat} active product(s). Are you sure you want to delete this category?`
      : `Are you sure you want to delete category "${catToDelete}"?`;

    if (window.confirm(confirmMsg)) {
      const updated = customCategories.filter((c) => c !== catToDelete);
      setCustomCategories(updated);
      StorageService.saveCategories(updated);

      if (categoryFilter === catToDelete) {
        setCategoryFilter('All');
      }

      setCategoryNotice(`Category "${catToDelete}" deleted!`);
      setTimeout(() => setCategoryNotice(null), 3000);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory(customCategories[0] || 'Security');
    setCustomCategoryName('');
    setDescription('');
    setUnit('Month');
    setRate(15000);
    setGstRate(18);
    setCostPrice(11000);
    setStandardTerms('');
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setCustomCategoryName('');
    setDescription(p.description);
    setUnit(p.unit);
    setRate(p.rate);
    setGstRate(p.gstRate);
    setCostPrice(p.costPrice);
    setStandardTerms(p.standardTerms || '');
    setShowModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    let finalCategory = category;

    if (category === '__NEW__') {
      const trimmed = customCategoryName.trim();
      if (!trimmed) {
        alert('Please enter a valid category name.');
        return;
      }
      if (!customCategories.includes(trimmed)) {
        const updated = [...customCategories, trimmed];
        setCustomCategories(updated);
        StorageService.saveCategories(updated);
      }
      finalCategory = trimmed;
    }

    const product: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name,
      category: finalCategory,
      description,
      unit,
      rate: Number(rate),
      gstRate: Number(gstRate),
      costPrice: Number(costPrice),
      standardTerms,
    };

    onSaveProduct(product);
    setShowModal(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products & Services Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure billing units, rates, GST tax slabs, standard terms, and custom catalog categories.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 flex items-center space-x-1.5 transition-all"
            title="Add or delete product categories"
          >
            <FolderPlus className="w-4 h-4 text-slate-600" />
            <span>Manage Categories ({customCategories.length})</span>
          </button>

          <button
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {categoryNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{categoryNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {filterTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => {
          const margin = p.rate > 0 ? (((p.rate - p.costPrice) / p.rate) * 100).toFixed(0) : '0';
          return (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {p.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5">{p.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(p)}
                      title="Edit Product / Service"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {onDeleteProduct && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete product item '${p.name}'?`)) {
                            onDeleteProduct(p.id);
                          }
                        }}
                        title="Delete Product / Service"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{p.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Selling Rate</span>
                  <p className="text-base font-extrabold text-slate-900">
                    ₹ {p.rate.toLocaleString('en-IN')}{' '}
                    <span className="text-xs text-slate-400 font-normal">/ {p.unit}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">GST Tax / Margin</span>
                  <span className="text-xs font-bold text-slate-700">GST {p.gstRate}%</span> •{' '}
                  <span className="text-xs font-bold text-emerald-600">{margin}% Margin</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Manager Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Manage Catalog Categories</h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Category Form */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                placeholder="Enter new category name..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleAddCategory()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Category List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {customCategories.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800"
                  >
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-indigo-500" />
                      <span>{cat}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {count} item{count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title={`Delete category "${cat}"`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Product / Service' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product / Service Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Armed Gunman (12 Hours Shift)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 font-semibold"
                  >
                    {customCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__NEW__">+ Add New Category...</option>
                  </select>

                  {category === '__NEW__' && (
                    <input
                      type="text"
                      required
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      placeholder="Type custom category..."
                      className="w-full mt-2 bg-indigo-50/60 border border-indigo-200 rounded-xl px-3 py-1.5 text-slate-900 font-bold outline-none focus:border-indigo-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Billing Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Month, Shift, System, Year"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST Tax Slab</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value={18}>18%</option>
                    <option value={12}>12%</option>
                    <option value={5}>5%</option>
                    <option value={0}>0%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scope Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of service provided..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
