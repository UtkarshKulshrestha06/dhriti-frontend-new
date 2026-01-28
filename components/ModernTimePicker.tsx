
import React from 'react';
import { Clock } from 'lucide-react';

interface ModernTimePickerProps {
  label?: string;
  value: string; // Expected format "HH:MM AM/PM" or empty
  onChange: (time: string) => void;
}

const ModernTimePicker: React.FC<ModernTimePickerProps> = ({ label, value, onChange }) => {
  // Parse current value
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: '12', minute: '00', period: 'AM' };
    const [time, period] = timeStr.split(' ');
    const [hour, minute] = time.split(':');
    return { hour, minute, period };
  };

  const { hour, minute, period } = parseTime(value);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // 5 min steps

  const updateTime = (newHour: string, newMinute: string, newPeriod: string) => {
    onChange(`${newHour}:${newMinute} ${newPeriod}`);
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>}
      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl p-2 relative group focus-within:border-ocean-500 focus-within:ring-2 focus-within:ring-ocean-100 transition-all">
        <Clock className="w-5 h-5 text-gray-400 absolute left-3 pointer-events-none group-focus-within:text-ocean-500" />
        
        <div className="flex-1 flex items-center justify-center pl-8 gap-1">
          {/* Hour Select */}
          <select 
            value={hour}
            onChange={(e) => updateTime(e.target.value, minute, period)}
            className="bg-transparent font-bold text-slate-900 text-center outline-none appearance-none cursor-pointer hover:bg-gray-50 rounded p-1 w-12"
          >
            {hours.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          
          <span className="text-gray-400 font-bold">:</span>
          
          {/* Minute Select */}
          <select 
            value={minute}
            onChange={(e) => updateTime(hour, e.target.value, period)}
            className="bg-transparent font-bold text-slate-900 text-center outline-none appearance-none cursor-pointer hover:bg-gray-50 rounded p-1 w-12"
          >
            {minutes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* AM/PM Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 shrink-0">
          <button
            type="button"
            onClick={() => updateTime(hour, minute, 'AM')}
            className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${period === 'AM' ? 'bg-white text-ocean-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => updateTime(hour, minute, 'PM')}
            className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${period === 'PM' ? 'bg-white text-ocean-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernTimePicker;
