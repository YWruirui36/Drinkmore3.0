
import React, { useState, useEffect, useRef } from 'react';
import { SUGAR_OPTIONS, ICE_OPTIONS, COMMON_TOPPINGS, POPULAR_BRANDS, SIZE_OPTIONS } from './constants';
import { SugarLevel, IceLevel, DrinkRecord, DrinkSize } from './types';
import { getDrinkSuggestions } from './geminiService';

interface DrinkFormProps {
  onAdd: (record: DrinkRecord) => void;
  onUpdate?: (record: DrinkRecord) => void;
  editingRecord?: DrinkRecord | null;
  onCancelEdit?: () => void;
  isDarkMode?: boolean;
}

const DrinkForm: React.FC<DrinkFormProps> = ({ onAdd, onUpdate, editingRecord, onCancelEdit, isDarkMode }) => {
  const [brand, setBrand] = useState('');
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [size, setSize] = useState(DrinkSize.LARGE);
  const [sugar, setSugar] = useState<string>(SugarLevel.HALF);
  const [customSugarPercent, setCustomSugarPercent] = useState<number>(50);
  const [ice, setIce] = useState(IceLevel.MICRO);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [moodScore, setMoodScore] = useState(5);
  const [notes, setNotes] = useState('');
  
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [itemSuggestions, setItemSuggestions] = useState<string[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [isItemSelected, setIsItemSelected] = useState(false);
  const [isBrandSelected, setIsBrandSelected] = useState(false);
  
  const itemSearchTimerRef = useRef<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingRecord) {
      setBrand(editingRecord.brand);
      setItemName(editingRecord.itemName);
      setPrice(editingRecord.price.toString());
      setDate(new Date(editingRecord.timestamp).toISOString().split('T')[0]);
      setSize(editingRecord.size);
      
      const isCustomSugar = editingRecord.sugar.includes('%');
      if (isCustomSugar) {
        setSugar(SugarLevel.CUSTOM);
        setCustomSugarPercent(editingRecord.customSugarPercent || 50);
      } else {
        setSugar(editingRecord.sugar);
      }
      
      setIce(editingRecord.ice);
      setSelectedToppings(editingRecord.toppings);
      setMoodScore(editingRecord.moodScore);
      setNotes(editingRecord.notes || '');
      setIsBrandSelected(true);
      setIsItemSelected(true);

      if (formRef.current) {
        const yOffset = -20; 
        const y = formRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
      }
    }
  }, [editingRecord]);

  useEffect(() => {
    if (brand.trim().length > 0 && !isBrandSelected) {
      const filtered = POPULAR_BRANDS.filter(b => b.toLowerCase().includes(brand.toLowerCase())).slice(0, 6);
      setBrandSuggestions(filtered);
      setShowBrandDropdown(filtered.length > 0);
    } else {
      setBrandSuggestions([]);
      setShowBrandDropdown(false);
    }
  }, [brand, isBrandSelected]);

  useEffect(() => {
    if (isItemSelected || !brand || itemName.trim().length < 1) {
      setItemSuggestions([]);
      return;
    }
    if (itemSearchTimerRef.current) clearTimeout(itemSearchTimerRef.current);
    itemSearchTimerRef.current = window.setTimeout(async () => {
      const suggestions = await getDrinkSuggestions(brand, itemName);
      const filtered = suggestions.filter(s => s !== itemName);
      setItemSuggestions(filtered);
      if (filtered.length > 0) setShowItemDropdown(true);
    }, 400);
    return () => { if (itemSearchTimerRef.current) clearTimeout(itemSearchTimerRef.current); };
  }, [brand, itemName, isItemSelected]);

  const handleBrandSelect = (selectedBrand: string) => {
    setBrand(selectedBrand);
    setIsBrandSelected(true);
    setShowBrandDropdown(false);
  };

  const handleItemSelect = (s: string) => {
    setIsItemSelected(true);
    setItemName(s);
    setShowItemDropdown(false);
  };

  const toggleTopping = (topping: string) => {
    setSelectedToppings(prev => 
      prev.includes(topping) ? prev.filter(t => t !== topping) : [...prev, topping]
    );
  };

  const resetForm = () => {
    setBrand('');
    setIsBrandSelected(false);
    setItemName('');
    setPrice('');
    setSelectedToppings([]);
    setIsItemSelected(false);
    setShowItemDropdown(false);
    setMoodScore(5);
    setNotes('');
    if (onCancelEdit) onCancelEdit();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !itemName) return;

    const selectedDate = new Date(date);
    const now = new Date();
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    const finalSugar = sugar === SugarLevel.CUSTOM ? `${customSugarPercent}%` : sugar;
    
    const recordData: DrinkRecord = {
      id: editingRecord ? editingRecord.id : Date.now().toString(),
      timestamp: selectedDate.getTime(),
      brand, itemName, size, sugar: finalSugar, 
      customSugarPercent: sugar === SugarLevel.CUSTOM ? customSugarPercent : undefined,
      ice, toppings: selectedToppings, moodScore, price: Number(price) || 0, 
      notes
    };

    if (editingRecord && onUpdate) onUpdate(recordData);
    else onAdd(recordData);
    resetForm();
  };

  const HeartIcon = ({ filled, onClick }: { filled: boolean; onClick: () => void }) => (
    <button type="button" onClick={onClick} className={`transition-all duration-300 transform active:scale-90 ${filled ? 'scale-110' : 'scale-100'}`}>
      <svg width="44" height="44" viewBox="0 0 24 24" fill={filled ? "#ff4d6d" : "transparent"} stroke={filled ? "#ff4d6d" : "#E6D5C3"} strokeWidth="1.5">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>
  );

  return (
    <div ref={formRef} className={`bg-white dark:bg-[#3D342E] rounded-[3rem] p-8 shadow-2xl border transition-all relative overflow-visible ${editingRecord ? 'border-[#C8A27A] ring-4 ring-[#FFF6EC] dark:ring-black/20' : 'border-[#E6D5C3] dark:border-[#4A3F35]'}`}>
      <div className="flex flex-col items-center mb-8 pb-8 border-b border-[#F4E9DC] dark:border-[#4A3F35]">
        <span className="text-[10px] font-black text-[#A1887F] uppercase tracking-[0.3em] mb-4">今天的心情補給評分</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <HeartIcon key={s} filled={moodScore >= s} onClick={() => setMoodScore(s)} />
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className={`text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-colors ${editingRecord ? 'bg-[#E07A5F]' : 'bg-[#C8A27A]'}`}>
          {editingRecord ? 'EDITING MODE' : 'NEW RECORD'}
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-[#FFF6EC] dark:bg-[#2D241E] px-3 py-2 rounded-xl text-[10px] font-black text-[#4A3F35] dark:text-[#E6D5C3] outline-none border border-[#E6D5C3] dark:border-[#4A3F35] uppercase" />
          <div className="flex items-center gap-1 bg-[#FFF6EC] dark:bg-[#2D241E] px-4 py-2 rounded-2xl border border-[#E6D5C3] dark:border-[#4A3F35]">
            <span className="text-[#A1887F] font-black text-sm">$</span>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" className="w-12 bg-transparent text-[#4A3F35] dark:text-[#E6D5C3] font-black text-sm outline-none" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 relative">
            <label className="text-[9px] font-black text-[#A1887F] uppercase tracking-widest px-2">BRAND / 店家</label>
            <input type="text" required value={brand} onChange={e => {setBrand(e.target.value); setIsBrandSelected(false);}} onFocus={() => brandSuggestions.length > 0 && setShowBrandDropdown(true)} placeholder="搜尋店家..." className="w-full bg-[#FFF6EC] dark:bg-[#2D241E] px-6 py-4 rounded-3xl text-sm font-bold text-[#4A3F35] dark:text-[#E6D5C3] outline-none border border-transparent focus:border-[#C8A27A] transition-all" />
            {showBrandDropdown && brandSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-[75] mt-2 bg-white dark:bg-[#3D342E] rounded-2xl shadow-2xl border border-[#E6D5C3] dark:border-[#4A3F35] overflow-hidden animate-in fade-in zoom-in-95">
                {brandSuggestions.map(s => (
                  <button key={s} type="button" onClick={() => handleBrandSelect(s)} className="w-full text-left px-5 py-3 text-xs font-bold hover:bg-[#C8A27A] hover:text-white transition-colors border-b border-[#F4E9DC] dark:border-[#4A3F35] last:border-0">{s}</button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2 relative">
            <label className="text-[9px] font-black text-[#A1887F] uppercase tracking-widest px-2">MENU / 品項</label>
            <input type="text" required value={itemName} onChange={e => {setItemName(e.target.value); setIsItemSelected(false);}} onFocus={() => itemSuggestions.length > 0 && !isItemSelected && setShowItemDropdown(true)} placeholder="輸入關鍵字..." className="w-full bg-[#FFF6EC] dark:bg-[#2D241E] px-6 py-4 rounded-3xl text-sm font-bold text-[#4A3F35] dark:text-[#E6D5C3] outline-none border border-transparent focus:border-[#C8A27A] transition-all" />
            {showItemDropdown && itemSuggestions.length > 0 && !isItemSelected && (
              <div className="absolute top-full left-0 right-0 z-[70] mt-2 bg-white dark:bg-[#3D342E] rounded-2xl shadow-2xl border border-[#E6D5C3] dark:border-[#4A3F35] overflow-hidden animate-in fade-in zoom-in-95">
                {itemSuggestions.map(s => (
                  <button key={s} type="button" onClick={() => handleItemSelect(s)} className="w-full text-left px-5 py-3 text-xs font-bold hover:bg-[#C8A27A] hover:text-white transition-colors border-b border-[#F4E9DC] dark:border-[#4A3F35] last:border-0">{s}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#A1887F] uppercase tracking-widest px-2">SIZE / 容量</label>
            <select value={size} onChange={e => setSize(e.target.value as DrinkSize)} className="w-full bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 rounded-2xl text-[10px] font-black text-yellow-700 dark:text-yellow-300 outline-none border border-yellow-100 dark:border-yellow-900/30">
              {SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#A1887F] uppercase tracking-widest px-2">ICE / 冰塊</label>
            <select value={ice} onChange={e => setIce(e.target.value as IceLevel)} className="w-full bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-2xl text-[10px] font-black text-blue-700 dark:text-blue-300 outline-none border border-blue-100 dark:border-blue-900/30">
              {ICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-[#A1887F] uppercase tracking-widest px-2">SUGAR / 甜度</label>
          <select value={sugar} onChange={e => setSugar(e.target.value)} className="w-full bg-pink-50 dark:bg-pink-900/20 px-4 py-3 rounded-2xl text-[10px] font-black text-pink-700 dark:text-pink-300 outline-none border border-pink-100 dark:border-pink-900/30">
            {SUGAR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            <option value={SugarLevel.CUSTOM}>自定義 %</option>
          </select>
          {sugar === SugarLevel.CUSTOM && (
            <div className="mt-4 bg-pink-50/50 dark:bg-pink-900/10 p-4 rounded-3xl space-y-3">
              <input type="range" min="0" max="100" step="1" value={customSugarPercent} onChange={e => setCustomSugarPercent(parseInt(e.target.value))} className="w-full h-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg appearance-none cursor-pointer accent-pink-500" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <label className="text-[9px] font-black text-[#A1887F] uppercase tracking-widest px-2">TOPPINGS / 加料</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_TOPPINGS.map(topping => (
              <button key={topping} type="button" onClick={() => toggleTopping(topping)} className={`px-4 py-2 rounded-2xl text-[10px] font-black transition-all ${selectedToppings.includes(topping) ? 'bg-[#4A3F35] text-white' : 'bg-[#FFF6EC] dark:bg-[#2D241E] text-[#A1887F] border border-[#E6D5C3] dark:border-[#4A3F35]'}`}>
                {topping}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
           <label className="text-[9px] font-black text-[#A1887F] uppercase tracking-widest px-2">NOTES / 心得</label>
           <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-[#FFF6EC] dark:bg-[#2D241E] px-6 py-4 rounded-3xl text-sm font-bold text-[#4A3F35] dark:text-[#E6D5C3] outline-none h-24 resize-none border border-[#E6D5C3] dark:border-[#4A3F35]" />
        </div>

        <button type="submit" className={`w-full py-5 mt-4 rounded-3xl font-black text-xs tracking-[0.4em] uppercase shadow-2xl transition-all ${editingRecord ? 'bg-[#E07A5F] text-white' : 'bg-[#C8A27A] text-white'}`}>
          {editingRecord ? '更新快樂' : '儲存快樂'}
        </button>
      </form>
    </div>
  );
};

export default DrinkForm;
