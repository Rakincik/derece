'use client';

import { MessageSquare, Clock, Eye, CheckSquare, Trash } from 'lucide-react';

export default function SupportMessagesTab({
  messages,
  searchQuery,
  handleUpdateMessageStatus,
  handleDeleteMessage
}) {
  const filteredMessages = messages.filter(msg => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      msg.name?.toLowerCase().includes(query) ||
      msg.email?.toLowerCase().includes(query) ||
      msg.subject?.toLowerCase().includes(query) ||
      msg.message?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {filteredMessages.length > 0 ? (
        filteredMessages.map((msg) => (
          <div key={msg.id} className={`bg-white border rounded-3xl p-6 flex flex-col md:flex-row justify-between gap-5 transition-all shadow-sm ${
            msg.status === 'UNREAD' ? 'border-amber-500/40 bg-amber-500/[0.01] shadow-md shadow-amber-500/[0.01]' : 'border-slate-200/80 hover:border-slate-350'
          }`}>
            <div className="space-y-2.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-black text-slate-800">{msg.name}</span>
                <span className="text-xs text-slate-400 font-mono font-medium">{msg.email}</span>
                <span className="text-slate-200 text-xs">|</span>
                <span className="text-xs text-slate-550 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(msg.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="text-sm font-bold text-slate-700">
                Konu: {msg.subject || 'Konu Belirtilmemiş'}
              </div>
              
              <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {msg.message}
              </p>
            </div>

            <div className="flex md:flex-col justify-end items-end gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                  msg.status === 'UNREAD' 
                    ? 'bg-amber-50 text-amber-600 border-amber-100' 
                    : msg.status === 'READ'
                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {msg.status === 'UNREAD' ? 'OKUNMADI' : msg.status === 'READ' ? 'OKUNDU' : 'ÇÖZÜLDÜ'}
                </span>
              </div>

              <div className="flex gap-2">
                {msg.status === 'UNREAD' && (
                  <button
                    onClick={() => handleUpdateMessageStatus(msg.id, 'READ')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 border border-blue-100 text-blue-650 hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Okundu
                  </button>
                )}
                {msg.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleUpdateMessageStatus(msg.id, 'RESOLVED')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Çözüldü
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="p-1.5 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
          <MessageSquare className="w-12 h-12 text-slate-450 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Destek Talebi Bulunmuyor</h3>
          <p className="text-slate-500 text-sm leading-relaxed">İletişim formundan gönderilen tüm mesajlar burada listelenecektir.</p>
        </div>
      )}
    </div>
  );
}
