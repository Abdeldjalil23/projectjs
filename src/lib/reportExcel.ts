// Excel version of a report: one sheet with the centre's header, the title and period, then every
// table of the report one under the other, ready to be completed or sent. Loaded only when a file
// is asked for, so the reports page stays light.
import type { ReportTable } from '@/lib/reports';

const BORDER = { borderStyle: 'thin' as const, borderColor: '#999999' };
const HEADER_FILL = '#F2F2F2';
const BRAND = '#FF8500';

export const downloadReportExcel = async ({
  fileName,
  sheet,
  header,
  title,
  period,
  tables,
  rightToLeft,
}: {
  fileName: string;
  sheet: string;
  header: string[];
  title: string;
  period: string;
  tables: ReportTable[];
  rightToLeft: boolean;
}) => {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  type Cell = Record<string, unknown> | null;
  const width = Math.max(2, ...tables.map((table) => table.columns.length));
  const rows: Cell[][] = [];
  const line = (cell: Cell) => [cell, ...Array.from({ length: width - 1 }, () => null)];

  for (const text of header) rows.push(line({ value: text, columnSpan: width, fontWeight: 'bold' }));
  rows.push(line(null));
  rows.push(line({ value: title, columnSpan: width, fontWeight: 'bold', fontSize: 14, align: 'center' }));
  rows.push(line({ value: period, columnSpan: width, align: 'center' }));

  for (const table of tables) {
    rows.push(line(null));
    rows.push(line({ value: table.title, columnSpan: width, fontWeight: 'bold', textColor: BRAND }));
    rows.push(
      table.columns.map((column, i) => ({ value: column, fontWeight: 'bold', backgroundColor: HEADER_FILL, wrap: true, align: i === 0 ? undefined : 'center', ...BORDER })).concat(
        Array.from({ length: width - table.columns.length }, () => null) as never[],
      ),
    );
    for (const row of table.rows) {
      const cells: Cell[] = [
        { value: row.label, fontWeight: row.total ? 'bold' : undefined, wrap: true, ...BORDER },
        ...row.values.map((value) => ({
          value,
          type: typeof value === 'number' ? Number : String,
          fontWeight: row.total ? 'bold' : undefined,
          align: 'center',
          ...BORDER,
        })),
      ];
      rows.push(cells.concat(Array.from({ length: width - cells.length }, () => null)));
    }
    if (table.note) rows.push(line({ value: table.note, columnSpan: width, fontStyle: 'italic', wrap: true }));
  }

  await writeExcelFile(rows as never, {
    sheet: sheet.slice(0, 31),
    rightToLeft,
    columns: [{ width: 42 }, ...Array.from({ length: width - 1 }, () => ({ width: 14 }))],
  }).toFile(fileName);
};
