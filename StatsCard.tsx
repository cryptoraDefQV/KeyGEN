import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  percentChange?: number;
  percentChangeText?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  percentChange,
  percentChangeText
}: StatsCardProps) {
  // Determine the color for percentage change text
  const getChangeColor = () => {
    if (!percentChange) return "text-[#797775]";
    return percentChange > 0 ? "text-[#107C10]" : 
           percentChange < 0 ? "text-[#D83B01]" : 
           "text-[#797775]";
  };

  // Get the icon to show for the change
  const getChangeIcon = () => {
    if (!percentChange) return "ri-subtract-line";
    return percentChange > 0 ? "ri-arrow-up-line" : 
           percentChange < 0 ? "ri-arrow-down-line" : 
           "ri-subtract-line";
  };

  return (
    <Card className="bg-[#1E1E1E] border-[#333333] rounded-lg shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#797775] font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className={cn("w-10 h-10 rounded-md flex items-center justify-center", iconBgColor)}>
            <i className={cn(icon, "text-xl", iconColor)}></i>
          </div>
        </div>
        
        {(percentChange !== undefined || percentChangeText) && (
          <div className={cn("mt-4 flex items-center text-xs", getChangeColor())}>
            <i className={cn(getChangeIcon(), "mr-1")}></i>
            <span>{percentChangeText || `${Math.abs(percentChange || 0)}% from last month`}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
