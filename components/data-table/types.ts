export type TableColumn = {
    name: string;
    colSpan?: number;
    thClassName?: string;
    tdClassName?: string;
    cellClassName?: string; // className from both th & td
    filterType?: 'text' | 'number' | 'date';
    canHide?: boolean;
    align?: 'left' | 'center' | 'right' | 'char' | 'justify';
    cellRenderer?: (cell: TableStateDataCell) => React.ReactNode;
};

export type TableData = (number | string)[][];

export type TableStateDataCell = {
    id: number | string;
    value: number | string;
    columnIndex: number;
    rowIndex: number;
};

export type TableStateDataRow = {
    id: number | string;
    rowIndex: number;
    cells: TableStateDataCell[];
};

export type FilterValue = null | 'asc' | 'desc';

export type TableStateDataColumn = TableColumn & {
    id: number | string;
    filter: FilterValue;
    columnIndex: number;
    hidden: boolean;
};

export type TableState = {
    columns: TableStateDataColumn[],
    rows: TableStateDataRow[];
    skeletonRows: TableStateDataRow[];
    selected: { [key: string]: boolean; };
};

export type DataTableSearchOptions = {
    inputPlaceholder?: string;
    value?: string;
    setValue?: (value: string) => void;
};

export type DataTableHeaderProps = {
    title?: React.ReactNode;
    headerActions?: React.ReactNode;
    search?: DataTableSearchOptions;
};

export type DataTableProps = DataTableHeaderProps & {
    loading?: boolean;
    columns: TableColumn[];
    data: TableData;
    trClassName?: string;
    theadClassName?: string;
    thClassName?: string;
    tdClassName?: string;
    cellClassName?: string; // className from both th & td
    selectable?: boolean;
    sortable?: boolean;
    selectedIndexes?: number[];
    maxRows?: number;
    tableClassname?: string;
    tableRowClassname?: string;
    tableBodyClassname?: string;
    noDataMessage?: React.ReactNode;
    onSort?: (oldIndex: number, newIndex: number, sorted: { oldIndex: number, newIndex: number; }[]) => void;
    onSelect?: (selectedIndexes: number[]) => void;
    getRowOptions?: (params: { rowIndex: number; }) => Partial<React.HTMLAttributes<HTMLTableRowElement>>;
    getCellOptions?: (params: { rowIndex: number; columnIndex: number; }) => Partial<React.HTMLAttributes<HTMLTableCellElement>>;
};
