"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "./date-range-picker";
import { DateRange } from "react-day-picker";

interface PeriodSelectorProps {
  period: string;
  dateRange: DateRange | undefined;
  onPeriodChange: (value: string) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function PeriodSelector({
  period,
  dateRange,
  onPeriodChange,
  onDateRangeChange,
}: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <Tabs defaultValue={period} onValueChange={onPeriodChange}>
        <TabsList>
          <TabsTrigger value="day">日</TabsTrigger>
          <TabsTrigger value="week">週</TabsTrigger>
          <TabsTrigger value="month">月</TabsTrigger>
        </TabsList>
      </Tabs>
      <CalendarDateRangePicker value={dateRange} onChange={onDateRangeChange} />
    </div>
  );
} 