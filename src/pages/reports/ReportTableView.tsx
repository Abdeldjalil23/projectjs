// One table of a report, the same on screen and on paper.
import type { ReportTable } from '@/lib/reports';

export const ReportTableView = ({
  table,
  formatNumber,
  print = false,
}: {
  table: ReportTable;
  formatNumber: (n: number) => string;
  print?: boolean;
}) => {
  const cell = print ? 'border border-gray-500 px-2 py-1' : 'border px-3 py-2';
  return (
    <section className={print ? 'report-block mt-4' : 'space-y-2'} data-table={table.id}>
      <h3 className={print ? 'mb-1 text-[12px] font-bold uppercase' : 'flex items-center gap-2 text-sm font-bold uppercase tracking-wide'}>
        {!print && <span className="h-4 w-1 rounded-full bg-primary" aria-hidden />}
        {table.title}
      </h3>
      <div className={print ? '' : 'overflow-x-auto'}>
        <table className={`w-full border-collapse ${print ? 'text-[10.5px]' : 'text-sm'}`}>
          <thead>
            <tr className={print ? 'bg-gray-100' : 'bg-muted/70'}>
              {table.columns.map((column, i) => (
                <th key={i} className={`${cell} font-semibold ${i === 0 ? 'text-start' : 'text-center'} ${print ? '' : 'text-xs'}`}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.length === 0 ? (
              <tr>
                <td colSpan={table.columns.length} className={`${cell} text-center text-muted-foreground`}>
                  —
                </td>
              </tr>
            ) : (
              table.rows.map((row, i) => (
                <tr key={i} className={row.total ? (print ? 'bg-gray-50 font-bold' : 'bg-muted/40 font-semibold') : ''}>
                  <td className={`${cell} text-start`}>{row.label}</td>
                  {row.values.map((value, j) => (
                    <td key={j} className={`${cell} text-center tabular-nums ${value === 0 && !row.total ? 'text-muted-foreground' : ''}`}>
                      {typeof value === 'number' ? formatNumber(value) : value}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {table.note && <p className={print ? 'mt-0.5 text-[9.5px] italic text-gray-600' : 'text-xs text-muted-foreground'}>{table.note}</p>}
    </section>
  );
};

export default ReportTableView;
