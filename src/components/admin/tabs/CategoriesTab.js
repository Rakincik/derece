'use client';

import { ArrowUp, ArrowDown, Edit3, Trash2 } from 'lucide-react';

export default function CategoriesTab({
  categoriesList,
  searchQuery,
  handleMoveCategory,
  handleOpenEditCategoryModal,
  handleDeleteCategory
}) {
  const filteredCategories = categoriesList.filter(cat => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      cat.name?.toLowerCase().includes(query) ||
      cat.slug?.toLowerCase().includes(query) ||
      cat.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
      {filteredCategories.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50/50 whitespace-nowrap">
                <th className="py-4 px-3">Kategori Adı</th>
                <th className="py-4 px-3">Slug</th>
                <th className="py-4 px-3">Açıklama</th>
                <th className="py-4 px-3">Sıra</th>
                <th className="py-4 px-3">Ürün Sayısı</th>
                <th className="py-4 px-3 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => {
                const originalIndex = categoriesList.findIndex(c => c.id === cat.id);
                const isFirst = originalIndex === 0;
                const isLast = originalIndex === categoriesList.length - 1;
                return (
                  <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors text-sm">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs whitespace-nowrap">
                        <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${cat.color || 'from-blue-500 to-indigo-600'}`} />
                        <span>{cat.name}</span>
                        {cat.showInNavbar !== false ? (
                          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100" title="Üst menüde gösterilir">Menü</span>
                        ) : (
                          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200" title="Üst menüde gizlidir">Gizli</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-550 text-xs whitespace-nowrap">{cat.slug}</td>
                    <td className="py-3 px-3 text-slate-500 font-medium truncate max-w-[200px] text-xs" title={cat.description}>{cat.description || 'Açıklama belirtilmemiş'}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-750 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>{cat.sortOrder !== undefined ? cat.sortOrder : 0}</span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMoveCategory(cat, 'up')}
                            className="p-0.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Yukarı Taşı"
                          >
                            <ArrowUp className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMoveCategory(cat, 'down')}
                            className="p-0.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Aşağı Taşı"
                          >
                            <ArrowDown className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-850 font-bold text-xs text-center">
                      {cat._count?.products || 0}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditCategoryModal(cat)}
                          className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">Kayıtlı kategori bulunamadı.</div>
      )}
    </div>
  );
}
