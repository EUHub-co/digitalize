import type { DecisionTable as DecisionTableData } from '../../lib/content-types';

export function DecisionTable({ table }: { table: DecisionTableData }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-[var(--card-border)]">
      <table className="min-w-full border-collapse text-left text-sm">
        <caption className="caption-top px-4 py-3 text-left font-semibold text-[var(--foreground)]">
          {table.caption}
        </caption>
        <thead className="bg-[var(--card-bg)] text-[var(--foreground)]">
          <tr>
            {table.columns.map((column) => <th key={column} scope="col" className="px-4 py-3 font-semibold">{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${row[0]}-${rowIndex}`} className="border-t border-[var(--card-border)]">
              {row.map((value, columnIndex) => (
                <td key={`${value}-${columnIndex}`} className="px-4 py-3 align-top text-[var(--muted-foreground)]">{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
