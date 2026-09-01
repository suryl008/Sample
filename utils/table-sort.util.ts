import { Sort } from "@angular/material/sort";

export function getNestedValue(row: unknown, path: string): unknown {
  if (row == null || !path) {
    return "";
  }

  const record = row as Record<string, unknown>;
  if (!path.includes(".")) {
    return record[path];
  }

  return path.split(".").reduce((current: unknown, key: string) => {
    if (current == null || typeof current !== "object") {
      return null;
    }
    return (current as Record<string, unknown>)[key];
  }, row);
}

export function normalizeSortValue(value: unknown): string | number {
  if (value == null) {
    return "";
  }

  if (typeof value === "number") {
    return Number.isNaN(value) ? 0 : value;
  }

  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }

    if (trimmed.startsWith("$")) {
      const amount = Number.parseFloat(trimmed.replace(/[$,]/g, ""));
      if (!Number.isNaN(amount)) {
        return amount;
      }
    }

    if (isDateLike(trimmed)) {
      const time = Date.parse(trimmed);
      if (!Number.isNaN(time)) {
        return time;
      }
    }

    if (!Number.isNaN(Number(trimmed))) {
      return Number(trimmed);
    }

    return trimmed;
  }

  return String(value);
}

export function compareSortValues(a: unknown, b: unknown): number {
  const left = normalizeSortValue(a);
  const right = normalizeSortValue(b);

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function applySort<T>(
  data: T[] | null | undefined,
  sort: Sort | null | undefined,
  options?: {
    sortableColumns?: Set<string>;
    getValue?: (row: T, column: string) => unknown;
  },
): T[] {
  const rows = data ?? [];
  if (!rows.length || !sort?.active || !sort.direction) {
    return rows;
  }

  if (options?.sortableColumns && !options.sortableColumns.has(sort.active)) {
    return rows;
  }

  const getValue =
    options?.getValue ??
    ((row: T, column: string) => getNestedValue(row, column));
  const isAsc = sort.direction === "asc";

  return [...rows].sort((left, right) => {
    const comparison = compareSortValues(
      getValue(left, sort.active),
      getValue(right, sort.active),
    );
    return isAsc ? comparison : -comparison;
  });
}

function isDateLike(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(value);
}
