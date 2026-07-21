import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getStatusColor = (statusStr: string) => {
    switch (statusStr) {
      case "PUBLISHED":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "DRAFT":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  return (
    <span
      className={`text-xs px-2.5 py-0.5 font-medium rounded-md inline-block whitespace-nowrap ${getStatusColor(
        status
      )} ${className}`}
    >
      {status}
    </span>
  );
}
