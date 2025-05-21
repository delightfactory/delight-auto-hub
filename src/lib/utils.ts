
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (err) {
    console.error("Error formatting date:", err);
    return dateString;
  }
}

export function translateRole(role: string): string {
  switch (role) {
    case 'admin':
      return 'مسؤول';
    case 'customer':
      return 'عميل';
    default:
      return role;
  }
}
