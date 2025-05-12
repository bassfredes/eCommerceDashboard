
"use client";

import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarDays } from 'lucide-react';
import { periodOptions, comparisonOptions } from '@/data/mock-data';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';

interface PeriodSelectorProps {
  selectedPeriodKey: string;
  onPeriodKeyChange: (periodKey: string) => void;
  customPeriod: DateRange | undefined;
  onCustomPeriodChange: (dateRange: DateRange | undefined) => void;

  selectedComparisonKey: string;
  onComparisonKeyChange: (comparisonKey: string) => void;
  customComparisonPeriod: DateRange | undefined;
  onCustomComparisonPeriodChange: (dateRange: DateRange | undefined) => void;
  
  maxDate?: Date;
}

export function PeriodSelector({
  selectedPeriodKey,
  onPeriodKeyChange,
  customPeriod,
  onCustomPeriodChange,
  selectedComparisonKey,
  onComparisonKeyChange,
  customComparisonPeriod,
  onCustomComparisonPeriodChange,
  maxDate = new Date()
}: PeriodSelectorProps) {

  const disableFutureDates = (date: Date) => date > maxDate;

  const displayPeriodValue = () => {
    if (selectedPeriodKey === 'custom') {
      if (customPeriod?.from && customPeriod?.to) {
        return `${format(customPeriod.from, "LLL dd, y")} - ${format(customPeriod.to, "LLL dd, y")}`;
      }
      if (customPeriod?.from) {
        return `${format(customPeriod.from, "LLL dd, y")} - Select end date`;
      }
      return periodOptions.find(o => o.value === 'custom')?.label || "Custom Range...";
    }
    const option = periodOptions.find(o => o.value === selectedPeriodKey);
    return option ? option.label : "Select period";
  };

  const displayComparisonValue = () => {
    if (selectedComparisonKey === 'custom') {
      if (customComparisonPeriod?.from && customComparisonPeriod?.to) {
        return `${format(customComparisonPeriod.from, "LLL dd, y")} - ${format(customComparisonPeriod.to, "LLL dd, y")}`;
      }
      if (customComparisonPeriod?.from) {
        return `${format(customComparisonPeriod.from, "LLL dd, y")} - Select end date`;
      }
      return comparisonOptions.find(o => o.value === 'custom')?.label || "Custom Range...";
    }
    const option = comparisonOptions.find(o => o.value === selectedComparisonKey);
    return option ? option.label : "Select comparison";
  };


  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-2 bg-card border rounded-lg shadow-sm w-full">
      {/* Period Selection */}
      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
        <CalendarDays className="h-5 w-5 text-muted-foreground ml-2 flex-shrink-0" />
        <Label htmlFor="period-select" className="text-sm font-medium whitespace-nowrap sr-only sm:not-sr-only">Period:</Label>
        
        <Select value={selectedPeriodKey} onValueChange={onPeriodKeyChange}>
          <SelectTrigger 
            id="period-select" 
            className={`h-9 shadow-sm ${selectedPeriodKey === 'custom' ? 'sm:w-[260px]' : 'sm:w-[180px]'} w-full`}
          >
            <SelectValue placeholder="Select period">{displayPeriodValue()}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPeriodKey === 'custom' && (
          <DateRangePicker
            date={customPeriod}
            onDateChange={onCustomPeriodChange}
            disabled={disableFutureDates}
            className="w-full sm:w-[260px]"
            triggerClassName="w-full sm:w-[260px]" // Ensure this trigger is styled correctly
            align="start"
          />
        )}
      </div>

      {/* Comparison Period Selection */}
      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
        <Label htmlFor="comparison-select" className="text-sm font-medium whitespace-nowrap sr-only sm:not-sr-only">Compare with:</Label>
        
        <Select value={selectedComparisonKey} onValueChange={onComparisonKeyChange}>
          <SelectTrigger 
            id="comparison-select" 
            className={`h-9 shadow-sm ${selectedComparisonKey === 'custom' ? 'sm:w-[260px]' : 'sm:w-[180px]'} w-full mr-0 sm:mr-2`}
          >
            <SelectValue placeholder="Select comparison">{displayComparisonValue()}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {comparisonOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedComparisonKey === 'custom' && (
           <DateRangePicker
            date={customComparisonPeriod}
            onDateChange={onCustomComparisonPeriodChange}
            disabled={disableFutureDates}
            className="w-full sm:w-[260px]"
            triggerClassName="w-full sm:w-[260px]" // Ensure this trigger is styled
            align="start"
          />
        )}
      </div>
    </div>
  );
}
