
import React, { useState, useEffect, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import DrinkForm from './DrinkForm';
import HistoryList from './HistoryList';
import Dashboard from './Dashboard';
import { DrinkRecord } from './types';

const App: React.FC = () => {
  const [records, setRecords] = useState<DrinkRecord[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [editingRecord, setEditingRecord] = useState<DrinkRecord | null>(null);

  useEffect(() => {
    const savedRecords = localStorage.getItem('tai_tea_records');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (e) {
        console.error("Failed to parse saved records");
      }
    }
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tai_tea_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const addRecord = (record: DrinkRecord) => {
    setRecords(prev => [record, ...prev]);
  };

  const updateRecord = (updatedRecord: DrinkRecord) => {
    setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    setEditingRecord(null);
  };

  const deleteRecord = (id: string) => {
    if (window.confirm('確定要刪除這筆紀錄嗎？')) {
      setRecords(prev => prev.filter(r => r.id !== id));
      if (editingRecord?.id === id) setEditingRecord(null);
    }
  };

  const startEditing = (record: DrinkRecord) => {
    setEditingRecord(record);
  };

  const cancelEditing = () => {
    setEditingRecord(null);
  };

  // 過濾邏輯：只有點選日期才顯示紀錄
  const filteredRecords = useMemo(() => {
    if (!filterDate) return [];

    return records.filter(r => {
      const d = new Date(r.timestamp);
      return d.getFullYear() === filterDate.getFullYear() &&
             d.getMonth() === filterDate.getMonth() &&
             d.getDate() === filterDate.getDate();
    });
  }, [records, filterDate]);

  return (
    <div className={`min-h-screen transition-all duration-500 pb-20 ${isDarkMode ? 'dark bg-[#2D241E]' : 'bg-[#FFF6EC]'}`}>
      <div className="max-w-md mx-auto px-6 pt-10 pb-6 text-center">
        <div className="flex justify-between items-center mb-8">
           <div className="w-10 h-10"></div>
           <h1 className="text-3xl font-black text-[#4A3F35] dark:text-[#E6D5C3] tracking-tighter">
             心情補給站
           </h1>
           <button 
             onClick={() => setIsDarkMode(!isDarkMode)}
             className="w-10 h-10 rounded-full bg-[#F3EADF] dark:bg-[#3D342E] flex items-center justify-center text-[#4A3F35] dark:text-[#E6D5C3] border border-[#E6D5C3] dark:border-[#4A3F35] shadow-sm"
           >
             <span className="text-xs font-bold">{isDarkMode ? '☀️' : '🌙'}</span>
           </button>
        </div>
        
        <Dashboard 
          records={records} 
          isDarkMode={isDarkMode} 
          onSelectDate={setFilterDate}
          selectedDate={filterDate}
        />
      </div>

      <main className="max-w-md mx-auto px-4">
        <DrinkForm 
          onAdd={addRecord} 
          onUpdate={updateRecord}
          editingRecord={editingRecord}
          onCancelEdit={cancelEditing}
          isDarkMode={isDarkMode} 
        />
        
        <div className="mt-12 px-2">
          <div className="flex items-center justify-between mb-8 border-b border-[#E6D5C3] dark:border-[#4A3F35] pb-4">
            <h2 className="text-xl font-black text-[#4A3F35] dark:text-[#E6D5C3] italic uppercase tracking-tighter">
              {filterDate ? `${filterDate.getMonth() + 1}/${filterDate.getDate()} 紀錄明細` : '紀錄存檔'}
            </h2>
            {filterDate && (
              <button 
                onClick={() => setFilterDate(null)}
                className="text-[10px] font-black text-[#E07A5F] uppercase tracking-widest hover:underline"
              >
                收起清單 ×
              </button>
            )}
          </div>
          
          {/* 紀錄列表區塊 */}
          {filterDate ? (
            <HistoryList 
              records={filteredRecords} 
              onDelete={deleteRecord} 
              onEdit={startEditing}
            />
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-[#E6D5C3] dark:border-[#4A3F35] rounded-[3rem] bg-white/10 group hover:bg-white/20 transition-all cursor-default">
              <span className="text-3xl block mb-4 animate-bounce">☝️</span>
              <p className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest leading-loose">
                請點選上方月曆中的日期<br/>
                查看那天的 🧋 快樂紀錄
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-md mx-auto px-6 mt-20 text-center">
        <p className="text-[9px] font-black text-[#A1887F] uppercase tracking-[0.4em]">
          紀錄每一口純粹的台灣味
        </p>
      </footer>
      <Analytics />
    </div>
  );
};

export default App;
