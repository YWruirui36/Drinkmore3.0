
import React, { useState, useMemo } from 'react';
import { DrinkRecord } from './types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

interface DashboardProps {
  records: DrinkRecord[];
  isDarkMode?: boolean;
  onSelectDate: (date: Date) => void;
  selectedDate: Date | null;
}

const Dashboard: React.FC<DashboardProps> = ({ records, isDarkMode, onSelectDate, selectedDate }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'analysis'>('calendar');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    records.forEach(r => years.add(new Date(r.timestamp).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [records]);

  const yearlyRecords = useMemo(() => 
    records.filter(r => new Date(r.timestamp).getFullYear() === selectedYear),
  [records, selectedYear]);

  const yearlyCount = yearlyRecords.length;
  const yearlySpending = yearlyRecords.reduce((sum, r) => sum + (r.price || 0), 0);
  const avgPrice = yearlyCount > 0 ? Math.round(yearlySpending / yearlyCount) : 0;

  const yearlyBrandCounts = yearlyRecords.reduce((acc, r) => {
    acc[r.brand] = (acc[r.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const yearlyFavoriteBrand = Object.entries(yearlyBrandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "尚未紀錄";

  const yearlyItemCounts = yearlyRecords.reduce((acc, r) => {
    acc[r.itemName] = (acc[r.itemName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const yearlyFavoriteItem = Object.entries(yearlyItemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "尚未紀錄";

  const currentMonthRecords = records.filter(r => {
    const d = new Date(r.timestamp);
    return d.getFullYear() === viewDate.getFullYear() && d.getMonth() === viewDate.getMonth();
  });
  
  const monthlySpending = currentMonthRecords.reduce((sum, r) => sum + (r.price || 0), 0);
  const monthlyTotalCups = currentMonthRecords.length;
  const monthlyAvgMood = monthlyTotalCups > 0 
    ? (currentMonthRecords.reduce((sum, r) => sum + r.moodScore, 0) / monthlyTotalCups).toFixed(1)
    : "0.0";

  const spendingData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((m, i) => {
      const monthlyTotal = records
        .filter(r => {
          const d = new Date(r.timestamp);
          return d.getFullYear() === selectedYear && d.getMonth() === i;
        })
        .reduce((sum, r) => sum + (r.price || 0), 0);
      return { name: m, amount: monthlyTotal };
    });
  }, [records, selectedYear]);

  const moodData = useMemo(() => {
    const moodCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    yearlyRecords.forEach(r => {
      if (moodCounts[r.moodScore] !== undefined) moodCounts[r.moodScore]++;
    });
    
    const moodLabels: Record<number, string> = {
      5: "極度療癒",
      4: "很滿意",
      3: "還不錯",
      2: "普通",
      1: "不符期待"
    };

    return Object.entries(moodCounts)
      .map(([score, count]) => ({
        name: moodLabels[parseInt(score)],
        value: count,
        score: parseInt(score)
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.score - a.score);
  }, [yearlyRecords]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfMonth + 1;
    return (day > 0 && day <= daysInMonth) ? day : null;
  });

  const changeMonth = (offset: number) => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(next);
  };

  const moodColors: Record<number, string> = {
    5: '#E07A5F',
    4: '#C8A27A',
    3: '#D7CCC8',
    2: '#E6D5C3',
    1: '#BCAAA4'
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#F3EADF] dark:bg-[#3D342E] rounded-[2.5rem] p-8 shadow-inner border border-[#E6D5C3] dark:border-[#4A3F35] relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-[#C8A27A] opacity-10 rounded-full blur-3xl"></div>
        <div className="flex justify-between items-start mb-6">
          <div className="z-10 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-[#8D6E63] dark:text-[#A1887F] uppercase tracking-[0.3em]">YEARLY REVIEW</span>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-white/40 dark:bg-black/20 border-none rounded-lg text-[10px] font-black text-[#4A3F35] dark:text-[#E6D5C3] outline-none px-2 py-0.5 cursor-pointer"
              >
                {availableYears.map(y => <option key={y} value={y}>{y} 年</option>)}
              </select>
            </div>
            <h2 className="text-2xl font-black text-[#4A3F35] dark:text-[#E6D5C3] tracking-tighter">{selectedYear} 年度回顧</h2>
          </div>
          <div className="text-right z-10">
            <p className="text-[9px] font-black text-[#8D6E63] dark:text-[#A1887F] uppercase">年度成就獎章</p>
            <div className="mt-1 text-2xl">☕️🥤🧋</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6 z-10 relative">
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-3xl border border-white/50 dark:border-black/10">
            <p className="text-[9px] font-black text-[#8D6E63] uppercase tracking-tighter mb-1">年度最愛店家</p>
            <p className="text-sm font-black text-[#4A3F35] dark:text-[#E6D5C3] truncate">{yearlyFavoriteBrand}</p>
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-3xl border border-white/50 dark:border-black/10">
            <p className="text-[9px] font-black text-[#8D6E63] uppercase tracking-tighter mb-1">年度最愛品項</p>
            <p className="text-sm font-black text-[#4A3F35] dark:text-[#E6D5C3] truncate">{yearlyFavoriteItem}</p>
          </div>
        </div>
        <div className="flex justify-around items-center pt-2 border-t border-[#E6D5C3] dark:border-[#4A3F35] z-10 relative">
          <div className="text-center">
            <p className="text-[20px] font-black text-[#4A3F35] dark:text-[#E6D5C3]">{yearlyCount}</p>
            <p className="text-[8px] font-black text-[#8D6E63] uppercase">杯數</p>
          </div>
          <div className="w-[1px] h-8 bg-[#E6D5C3] dark:bg-[#4A3F35]"></div>
          <div className="text-center">
            <p className="text-[20px] font-black text-[#4A3F35] dark:text-[#E6D5C3]">${yearlySpending}</p>
            <p className="text-[8px] font-black text-[#8D6E63] uppercase">支出</p>
          </div>
          <div className="w-[1px] h-8 bg-[#E6D5C3] dark:bg-[#4A3F35]"></div>
          <div className="text-center">
            <p className="text-[20px] font-black text-[#4A3F35] dark:text-[#E6D5C3]">${avgPrice}</p>
            <p className="text-[8px] font-black text-[#8D6E63] uppercase">均價</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#3D342E] rounded-[2.5rem] p-6 shadow-sm border border-[#E6D5C3] dark:border-[#4A3F35] overflow-hidden transition-all">
        <div className="flex bg-[#FFF6EC] dark:bg-[#2D241E] p-1 rounded-2xl mb-6">
          <button onClick={() => setActiveTab('calendar')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-[#C8A27A] text-white shadow-sm' : 'text-[#A1887F]'}`}>Calendar</button>
          <button onClick={() => setActiveTab('analysis')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'analysis' ? 'bg-[#C8A27A] text-white shadow-sm' : 'text-[#A1887F]'}`}>Insights</button>
        </div>
        
        {activeTab === 'calendar' ? (
          <div className="relative animate-in fade-in duration-500">
            <button onClick={() => { const t = new Date(); setViewDate(t); onSelectDate(t); }} className="absolute top-0 right-0 text-[9px] font-black bg-[#E07A5F] text-white px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg active:scale-95 transition-all">今日</button>
            <div className="flex justify-between items-center mb-1 pr-12">
              <button onClick={() => changeMonth(-1)} className="text-[#A1887F] p-2 hover:text-[#4A3F35] transition-colors">◀</button>
              <div className="text-center"><h3 className="text-xl font-black text-[#4A3F35] dark:text-[#E6D5C3] tracking-tighter uppercase">{viewDate.getFullYear()} / {viewDate.getMonth() + 1}</h3></div>
              <button onClick={() => changeMonth(1)} className="text-[#A1887F] p-2 hover:text-[#4A3F35] transition-colors">▶</button>
            </div>
            <p className="text-[10px] font-black text-[#A1887F] text-center mb-6 uppercase tracking-[0.2em]">MONTHLY STAMPS: {monthlyTotalCups} 🧋 / ${monthlySpending}</p>
            
            <div className="grid grid-cols-7 gap-y-2 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-[9px] font-black text-[#D7CCC8]">{d}</span>)}
              {calendarDays.map((day, idx) => {
                 const dateObj = day ? new Date(viewDate.getFullYear(), viewDate.getMonth(), day) : null;
                 const hasRecord = day && currentMonthRecords.some(r => new Date(r.timestamp).getDate() === day);
                 const selected = day && selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === viewDate.getMonth() && selectedDate.getFullYear() === viewDate.getFullYear();
                 
                 return (
                   <button 
                     key={idx} 
                     disabled={!day} 
                     onClick={() => day && onSelectDate(dateObj!)} 
                     className={`relative h-12 w-full flex flex-col items-center justify-center rounded-xl transition-all ${
                       selected ? 'bg-[#C8A27A]/20 border border-[#C8A27A] scale-110 z-10 shadow-sm' : 
                       day ? 'hover:bg-[#FFF6EC] dark:hover:bg-[#4A3F35]' : ''
                     }`}
                   >
                     {day && (
                       <span className={`text-xs font-black ${selected ? 'text-[#4A3F35] dark:text-[#E6D5C3]' : hasRecord ? 'opacity-0' : 'text-[#D7CCC8]'}`}>
                         {day}
                       </span>
                     )}
                     {hasRecord && (
                       <span className="absolute inset-0 flex items-center justify-center text-lg animate-in zoom-in duration-300">
                         🧋
                       </span>
                     )}
                   </button>
                 );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FFF6EC] dark:bg-black/20 p-5 rounded-[2rem] border border-[#E6D5C3] dark:border-[#4A3F35]">
                <p className="text-[9px] font-black text-[#A1887F] uppercase tracking-widest mb-1">{viewDate.getMonth() + 1}月總杯數</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#4A3F35] dark:text-[#E6D5C3]">{monthlyTotalCups}</span>
                  <span className="text-[10px] font-bold text-[#A1887F]">杯</span>
                </div>
              </div>
              <div className="bg-[#FFF6EC] dark:bg-black/20 p-5 rounded-[2rem] border border-[#E6D5C3] dark:border-[#4A3F35]">
                <p className="text-[9px] font-black text-[#A1887F] uppercase tracking-widest mb-1">{viewDate.getMonth() + 1}月平均心情</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#E07A5F]">{monthlyAvgMood}</span>
                  <span className="text-[10px] font-bold text-[#A1887F]">/ 5</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest px-2">每月支出趨勢 ({selectedYear})</h4>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendingData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#A1887F'}} />
                    <Tooltip cursor={{fill: isDarkMode ? '#4A3F35' : '#FFF6EC'}} contentStyle={{backgroundColor: isDarkMode ? '#2D241E' : '#ffffff', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 900}} />
                    <Bar dataKey="amount" radius={[4, 4, 4, 4]}>{spendingData.map((e, i) => <Cell key={`cell-${i}`} fill={e.amount > 0 ? '#C8A27A' : '#D7CCC8'} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest px-2">年度心情分布 ({selectedYear})</h4>
              <div className="h-[180px] w-full flex items-center">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart><Pie data={moodData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={5} dataKey="value">{moodData.map((e, i) => <Cell key={`cell-${i}`} fill={moodColors[e.score]} stroke="none" />)}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
                <div className="w-[40%] space-y-2">{moodData.map(e => <div key={e.name} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: moodColors[e.score] }}></div><span className="text-[9px] font-black text-[#8D6E63] uppercase">{e.name}</span><span className="text-[9px] font-black text-[#4A3F35] dark:text-[#E6D5C3]">{e.value}</span></div>)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
