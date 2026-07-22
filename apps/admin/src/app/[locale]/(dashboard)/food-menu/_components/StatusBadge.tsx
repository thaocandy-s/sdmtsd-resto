import React from "react";
import { useTranslations } from "next-intl";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const tc = useTranslations("common");

  const getStatusColor = (statusStr: string) => {
    switch (statusStr) {
      case "PUBLISHED":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "DRAFT":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "ARCHIVED":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const getStatusLabel = (statusStr: string) => {
    switch (statusStr) {
      case "PUBLISHED":
        return tc("published");
      case "DRAFT":
        return tc("draft");
      case "ARCHIVED":
        return tc("archived");
      default:
        return statusStr;
    }
  };

  return (
    <span
      className={`text-xs px-2.5 py-0.5 font-medium rounded-md inline-block whitespace-nowrap ${getStatusColor(
        status
      )} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
