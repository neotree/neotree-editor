import { TableStateDataColumn, TableStateDataRow } from "../types";

export function sortRows({
    column,
    rows,
}: {
    column: TableStateDataColumn,
    rows: TableStateDataRow[];
}) {
    return rows
        .sort((a, b) => {
            const val1 = a.cells.filter(c => c.columnIndex === column.columnIndex)[0].value || '';
            const val2 = b.cells.filter(c => c.columnIndex === column.columnIndex)[0].value || '';

            let returnValue = 0;

            if (column.filterType === 'number') {
                const n1 = Number(val1);
                const n2 = Number(val2);

                if (!(isNaN(n1) || isNaN(n2))) {
                    switch (column.filter) {
                        case 'asc':
                            returnValue = n1 - n2;
                            break;
                        case 'desc':
                            returnValue = n2 - n1;
                            break;
                        default:
                            break;
                    }
                }
            } else if (column.filterType === 'text') {
                switch (column.filter) {
                    case 'asc':
                        returnValue = (val1 as string).localeCompare(val2 as string);
                        break;
                    case 'desc':
                        returnValue = (val2 as string).localeCompare(val1 as string);
                        break;
                    default:
                        break;
                }
            }

            return returnValue;
        });
}
