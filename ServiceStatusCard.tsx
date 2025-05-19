import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ServiceStatus {
  id: string;
  name: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  status: "online" | "offline" | "warning";
  statusText: string;
  actionText: string;
}

interface ServiceStatusCardProps {
  title: string;
  services: ServiceStatus[];
  onServiceAction: (serviceId: string) => void;
}

export function ServiceStatusCard({ title, services, onServiceAction }: ServiceStatusCardProps) {
  return (
    <Card className="bg-[#1E1E1E] border-[#333333] rounded-lg shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="text-[#797775] hover:text-white">
              <i className="ri-refresh-line"></i>
              <span className="sr-only">Refresh</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-[#797775] hover:text-white">
              <i className="ri-more-2-fill"></i>
              <span className="sr-only">More</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.id} className="flex items-center p-3 border border-[#333333] rounded-md bg-[#252525]">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${service.iconBgColor}`}>
                <i className={`${service.icon} ${service.iconColor} text-xl`}></i>
              </div>
              <div className="ml-3">
                <h3 className="font-medium">{service.name}</h3>
                <div className="flex items-center text-sm">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    service.status === "online" ? "bg-[#107C10]" : 
                    service.status === "warning" ? "bg-[#F8CD46]" : 
                    "bg-[#D83B01]"
                  }`}></span>
                  <span className="text-[#EDEBE9]">{service.statusText}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onServiceAction(service.id)}
                className="ml-auto px-3 py-1 text-xs rounded-md bg-[#1E1E1E] border border-[#333333] text-[#EDEBE9] hover:text-white hover:bg-[#333333] transition"
              >
                {service.actionText}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
