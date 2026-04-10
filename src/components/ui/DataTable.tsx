import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  title: string;
  render: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
}

export function DataTable<T>({ columns, rows }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <table className="min-w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-[var(--bg-muted)] border-b border-[var(--border)]">
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={`px-6 py-4 font-semibold text-[var(--text)] tracking-wider uppercase text-xs ${
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                }`}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {rows.map((row, idx) => (
            <tr key={idx} className="transition-all hover:bg-[var(--bg-muted)]/50 group">
              {columns.map((col) => (
                <td 
                  key={col.key} 
                  className={`px-6 py-4 text-[var(--text)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
