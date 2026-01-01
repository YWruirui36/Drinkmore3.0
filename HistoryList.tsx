
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
        <div key={record.id} className="bg-white dark:bg-[#3D342E] p-8 rounded-[3.5rem] border border-[#E6D5C3] dark:border-[#4A3F35] group relative shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#C8A27A] text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest">{record.brand}</span>
                <span className="text-[#A1887F] text-[10px] font-black uppercase">{new Date(record.timestamp).toLocaleDateString()}</span>
              </div>
              <h3 className="text-2xl font-black text-[#4A3F35] dark:text-[#E6D5C3] tracking-tighter mb-3">
                {record.itemName}
                {record.price > 0 && <span className="ml-3 text-[#A1887F] font-bold text-base">${record.price}</span>}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-black bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 rounded-full">{record.size}</span>
                <span className="text-[10px] font-black bg-pink-50 dark:bg-pink-900/30 px-3 py-1 rounded-full">{record.sugar}</span>
                <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">{record.ice}</span>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end">
              <MoodHearts score={record.moodScore} />
              <div className="mt-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(record)} className="p-2 text-[#A1887F] hover:text-[#C8A27A]"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                <button onClick={() => onDelete(record.id)} className="p-2 text-[#A1887F] hover:text-[#E07A5F]"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
            </div>
          </div>
          {(record.toppings.length > 0 || record.notes) && (
            <div className="border-t border-[#F4E9DC] dark:border-[#4A3F35] pt-5 space-y-4">
              {record.toppings.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {record.toppings.map(t => <span key={t} className="text-[#8D6E63] dark:text-[#A1887F] bg-[#FFF6EC] dark:bg-[#2D241E] text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">+ {t}</span>)}
                </div>
              )}
              {record.notes && <p className="text-[11px] text-[#8D6E63] dark:text-[#A1887F] font-bold italic leading-relaxed">「 {record.notes} 」</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HistoryList;
