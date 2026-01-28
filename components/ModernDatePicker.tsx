
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface ModernDatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
}

const ModernDatePicker: React.FC<ModernDatePickerProps> = ({ label, value, onChange }) => {
  // Initialize view based on value or current date
  const [viewDate, setViewDate] = useState(value || new Date());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value) {
        setViewDate(value);
    }
  }, [value]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(newDate);
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const days = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const calendarDays = [];
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Weekday headers
    const headers = weekDays.map(day => (
      <div key={day} className="text-center text-xs font-bold text-gray-400 py-1">
        {day}
      </div>
    ));

    // Empty slots for start of month
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days
    for (let i = 1; i <= days; i++) {
      const currentDate = new Date(year, month, i);
      const isSelected = value && 
        currentDate.getDate() === value.getDate() && 
        currentDate.getMonth() === value.getMonth() && 
        currentDate.getFullYear() === value.getFullYear();
      
      const isToday = new Date().toDateString() === currentDate.toDateString();

      calendarDays.push(
        <button
          key={i}
          onClick={(e) => { e.stopPropagation(); handleDateClick(i); }}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all mx-auto
            ${isSelected ? 'bg-ocean-600 text-white shadow-md' : 'text-gray-700 hover:bg-ocean-50'}
            ${isToday && !isSelected ? 'border border-ocean-300 text-ocean-600' : ''}
          `}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-gray-800">
            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {headers}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {label && <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer bg-white hover:border-ocean-400 transition-colors group"
      >
        <span className={`font-medium ${value ? 'text-slate-900' : 'text-gray-400'}`}>
          {value ? value.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
        </span>
        <CalendarIcon className="w-5 h-5 text-gray-400 group-hover:text-ocean-500" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full mt-2 left-0 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 w-72 animate-in fade-in zoom-in-95 duration-200">
            {renderCalendar()}
          </div>
        </>
      )}
    </div>
  );
};

export default ModernDatePicker;
