import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
  value: string; // YYYY-MM format
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MonthPicker({
  value,
  onChange,
  disabled = false,
  placeholder = '选择月份'
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(() => {
    if (value) {
      return parseInt(value.split('-')[0]);
    }
    return new Date().getFullYear();
  });
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('left');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 计算下拉框位置
  const calculateDropdownPosition = () => {
    if (!triggerRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = 320; // min-w-[320px]
    const viewportWidth = window.innerWidth;
    const rightSpace = viewportWidth - triggerRect.right;
    
    // 如果右侧空间不足以显示完整的下拉框，则右对齐
    if (rightSpace < dropdownWidth && triggerRect.left > dropdownWidth) {
      setDropdownPosition('right');
    } else {
      setDropdownPosition('left');
    }
  };

  // 打开下拉框时计算位置
  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) {
        calculateDropdownPosition();
      }
      setIsOpen(!isOpen);
    }
  };

  // 获取显示文本
  const getDisplayText = () => {
    if (!value) return placeholder;
    const [year, month] = value.split('-');
    return `${year}年${month}月`;
  };

  // 生成月份网格
  const generateMonthGrid = () => {
    const months = [
      '01', '02', '03', '04',
      '05', '06', '07', '08',
      '09', '10', '11', '12'
    ];
    
    const monthNames = [
      '1月', '2月', '3月', '4月',
      '5月', '6月', '7月', '8月',
      '9月', '10月', '11月', '12月'
    ];

    return months.map((month, index) => {
      const monthValue = `${currentYear}-${month}`;
      const isSelected = value === monthValue;
      const isCurrent = new Date().getFullYear() === currentYear && 
        new Date().getMonth() === index;

      return (
        <button
          key={month}
          onClick={() => {
            onChange(monthValue);
            setIsOpen(false);
          }}
          className={`
            p-3 text-sm font-medium rounded-lg transition-all duration-200
            ${isSelected 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300'
            }
            ${isCurrent && !isSelected ? 'ring-2 ring-blue-200' : ''}
          `}
        >
          {monthNames[index]}
        </button>
      );
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex items-center justify-between px-4 py-2 min-w-[140px]
          border border-gray-300 rounded-lg bg-white
          hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          focus:outline-none transition-colors duration-200
          ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'text-gray-700'}
        `}
      >
        <span className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>{getDisplayText()}</span>
        </span>
        <ChevronRight 
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`} 
        />
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <div className={`absolute top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[320px] ${
          dropdownPosition === 'right' ? 'right-0' : 'left-0'
        }`}>
          {/* 年份选择器 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button
              onClick={() => setCurrentYear(currentYear - 1)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-lg font-semibold text-gray-900">
              {currentYear}年
            </span>
            <button
              onClick={() => setCurrentYear(currentYear + 1)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* 月份网格 */}
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {generateMonthGrid()}
            </div>
          </div>


        </div>
      )}
    </div>
  );
}