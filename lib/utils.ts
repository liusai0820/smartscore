
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeDepartmentName(name: string | null | undefined): string {
    if (!name) return ''
    return name
        .trim()
        .replace(/\s+/g, '') // Remove all whitespace
        .replace(/（/g, '(') // Normalize Chinese opening parenthesis
        .replace(/）/g, ')') // Normalize Chinese closing parenthesis
}

export function isSameDepartment(dept1: string | null | undefined, dept2: string | null | undefined): boolean {
    const n1 = normalizeDepartmentName(dept1)
    const n2 = normalizeDepartmentName(dept2)
    return n1 !== '' && n2 !== '' && n1 === n2
}
