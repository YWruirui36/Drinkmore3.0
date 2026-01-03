
import React from 'react';
import { DrinkRecord } from './types';

interface HistoryListProps {
  records: DrinkRecord[];
  onDelete: (id: string) => void;
  onEdit: (record: DrinkRecord) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ records, onDelete, onEdit }) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-24 bg-white/50 dark:bg-black/10 rounded-[3rem] border border-[#E6D5C3] dark:border-[#4A3F35]">
        <p className="text-[#A1887F] text-xs font-black uppercase tracking-[0.3em]">尚未建立任何紀錄</p>
      </div>
    );
  }

  const MoodHearts = ({ score }: { score: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= score ? "#ff4d6d" : "#E6D5C3"} className={s <= score ? "opacity-100" : "opacity-30"}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {records.map(record => (
        <div key={record.id} className="bg-white dark:bg-[#3D342E] p-8 rounded-[3.5rem] border border-[#E6D5C3] dark:border-[#4A3F35] hover:border-[#C8A27A] transition-all group relative shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#C8A27A] text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest">{record.brand}</span>
                <span className="text-[#A1887F] text-[10px] font-black uppercase tracking-tighter">{new Date(record.timestamp).toLocaleDateString()}</span>
              </div>
              <h3 className="text-2xl font-black text-[#4A3F35] dark:text-[#E6D5C3] tracking-tighter mb-3 leading-tight">
                {record.itemName}
                {record.price > 0 && <span className="ml-3 text-[#A1887F] font-bold text-base tracking-normal">${record.price}</span>}
              </h3>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-yellow-700 dark:text-yellow-300 text-[10px] font-black bg-yellow-50 dark:bg-yellow-900/30 px-4 py-1.5 rounded-full uppercase tracking-tighter border border-yellow-100/50">{record.size}</span>
                <span className="text-pink-700 dark:text-pink-300 text-[10px] font-black bg-pink-50 dark:bg-pink-900/30 px-4 py-1.5 rounded-full uppercase tracking-tighter border border-pink-100/50">{record.sugar}</span>
                <span className="text-blue-700 dark:text-blue-300 text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full uppercase tracking-tighter border border-blue-100/50">{record.ice}</span>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end shrink-0 pl-4">
              <MoodHearts score={record.moodScore} />
              <div className="mt-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(record)} className="p-3 text-[#A1887F] hover:text-[#C8A27A] bg-[#FFF6EC] dark:bg-[#2D241E] rounded-full shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                <button onClick={() => onDelete(record.id)} className="p-3 text-[#A1887F] hover:text-[#E07A5F] bg-[#FFF6EC] dark:bg-[#2D241E] rounded-full shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
              </div>
            </div>
          </div>
          {(record.toppings.length > 0 || record.notes) && (
            <div className="border-t border-[#F4E9DC] dark:border-[#4A3F35] pt-5 space-y-4">
              {record.toppings.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {record.toppings.map(t => <span key={t} className="text-[#8D6E63] dark:text-[#A1887F] bg-[#FFF6EC] dark:bg-[#2D241E] text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-[#E6D5C3] dark:border-[#4A3F35]">+ {t}</span>)}
                </div>
              )}
              {record.notes && <p className="text-[11px] text-[#8D6E63] dark:text-[#A1887F] font-bold leading-relaxed italic tracking-tight bg-[#FFF6EC]/50 dark:bg-black/10 p-4 rounded-2xl border border-[#E6D5C3]/30">「 {record.notes} 」</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HistoryList;
