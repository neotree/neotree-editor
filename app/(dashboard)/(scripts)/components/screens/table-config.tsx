'use client';

import { useCallback, useEffect, useState } from "react";
import { arrayMoveImmutable } from "array-move";
import { v4 } from "uuid";
import { Edit, Eye, MoreVertical, Plus, Trash } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Modal } from "@/components/modal";
import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { defaultScreenTableConfig, screenTableRowModes } from "@/constants";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { cn } from "@/lib/utils";
import { getTableColumnHeading, tableCollectionName } from "@/lib/screen-table-config";
import type { ScreenTableConfig, ScriptField } from "@/types";
import { Title } from "../title";
import type { useScreenForm } from "../../hooks/use-screen-form";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScreenForm>;
};

type SettingsProps = Props & {
    /** Problems that stop the table from being saved (see validateScreenTableConfig). */
    errors: string[];
    /** The collection name the screen was loaded with. Once set it is kept when the table is renamed. */
    persistedCollectionName?: string;
};

type TableRowHeading = ScreenTableConfig['rows'][number];

const PREVIEW_DYNAMIC_ROWS = 2;

/**
 * Settings of a table screen: its name and how its rows work. The columns are the screen's
 * fields, edited in the Columns list (input type, dropdown options, column heading).
 * Rendered as direct children of the screen form's padded column.
 */
export function ScreenTableSettings({ disabled, form, errors, persistedCollectionName }: SettingsProps) {
    const { confirm } = useConfirmModal();

    const tableConfig = form.watch('tableConfig') as ScreenTableConfig | null;
    const collectionName = form.watch('collectionName');

    const [editedRow, setEditedRow] = useState<{ index: number; } | null>(null);

    const config = tableConfig || defaultScreenTableConfig;
    const isFixed = config.rowMode === 'fixed';

    const update = useCallback((changes: Partial<ScreenTableConfig>) => {
        form.setValue(
            'tableConfig',
            { ...defaultScreenTableConfig, ...form.getValues('tableConfig'), ...changes },
            { shouldDirty: true, },
        );
    }, [form]);

    const onNameChange = useCallback((name: string) => {
        const previousName = `${form.getValues('tableConfig')?.title || ''}`;
        update({ title: name });

        // The screen title starts as the table name and follows it until it is given its own text.
        const screenTitle = `${form.getValues('title') || ''}`;
        if (!screenTitle.trim() || screenTitle === previousName) {
            form.setValue('title', name, { shouldDirty: true, });
        }

        // A new table stores its rows under its own name; a saved one keeps its collection.
        if (!persistedCollectionName) {
            form.setValue('collectionName', tableCollectionName(name), { shouldDirty: true, });
        }
    }, [form, update, persistedCollectionName]);

    const onDeleteRow = useCallback((index: number) => {
        const row = config.rows[index];
        confirm(() => update({ rows: config.rows.filter((_, i) => i !== index) }), {
            title: 'Delete',
            message: `<p>Are you sure you want to delete row: </p><div class="font-bold text-danger">${row?.label || ''}</div>`,
            danger: true,
            positiveLabel: 'Delete',
        });
    }, [config.rows, confirm, update]);

    return (
        <>
            <Title>Table</Title>

            <div>
                <Label secondary error={!disabled && !config.title?.trim()} htmlFor="tableTitle">Table name *</Label>
                <Input
                    id="tableTitle"
                    name="tableTitle"
                    noRing={false}
                    disabled={disabled}
                    error={!disabled && !config.title?.trim()}
                    value={config.title || ''}
                    onChange={e => onNameChange(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">
                    Shown above the table on the app and on the printout.
                    {!!collectionName && <> Captured rows are stored as &quot;{collectionName}&quot;.</>}
                </span>
            </div>

            <div>
                <Label secondary>Rows</Label>
                <RadioGroup
                    disabled={disabled}
                    value={config.rowMode}
                    onValueChange={value => update({ rowMode: value as ScreenTableConfig['rowMode'] })}
                    className="flex flex-col gap-y-4 mt-2"
                >
                    {screenTableRowModes.map(mode => (
                        <div key={mode.value} className="flex items-start space-x-2">
                            <RadioGroupItem value={mode.value} id={`tableRowMode_${mode.value}`} className="mt-0.5" />
                            <div className="flex flex-col">
                                <Label secondary htmlFor={`tableRowMode_${mode.value}`}>{mode.label}</Label>
                                <span className="text-xs text-muted-foreground">{mode.description}</span>
                            </div>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {!isFixed && (
                <div className="flex flex-col gap-y-2">
                    <div className="flex flex-col gap-y-5 sm:gap-y-0 sm:flex-row sm:gap-x-2 sm:items-center">
                        <div className="sm:flex-1">
                            <Label secondary htmlFor="tableMinRows">Min rows (optional)</Label>
                            <Input
                                id="tableMinRows"
                                name="tableMinRows"
                                type="number"
                                min={0}
                                step={1}
                                noRing={false}
                                disabled={disabled}
                                value={config.minRows ?? ''}
                                onChange={e => update({ minRows: inputToRowLimit(e.target.value) })}
                            />
                        </div>

                        <div className="sm:flex-1">
                            <Label secondary htmlFor="tableMaxRows">Max rows (optional)</Label>
                            <Input
                                id="tableMaxRows"
                                name="tableMaxRows"
                                type="number"
                                min={1}
                                step={1}
                                noRing={false}
                                disabled={disabled}
                                value={config.maxRows ?? ''}
                                onChange={e => update({ maxRows: inputToRowLimit(e.target.value) })}
                            />
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Leave empty for no limit.</span>
                </div>
            )}

            {isFixed && (
                <div>
                    <Label secondary htmlFor="tableRowsHeading">Row headings title (optional)</Label>
                    <Input
                        id="tableRowsHeading"
                        name="tableRowsHeading"
                        noRing={false}
                        disabled={disabled}
                        value={config.rowsHeading || ''}
                        onChange={e => update({ rowsHeading: e.target.value })}
                    />
                    <span className="text-xs text-muted-foreground">
                        Heading of the first column, above the row headings. Example: Pregnancy
                    </span>
                </div>
            )}

            {isFixed && (
                <div className="!px-0">
                    <TableRowHeadingModal
                        open={!!editedRow}
                        disabled={disabled}
                        row={editedRow ? config.rows[editedRow.index] : undefined}
                        rows={config.rows}
                        onClose={() => setEditedRow(null)}
                        onSave={label => {
                            if (!editedRow) return;
                            const existing = config.rows[editedRow.index];
                            update({
                                rows: existing
                                    ? config.rows.map((row, i) => (i === editedRow.index ? { ...row, label } : row))
                                    : [...config.rows, { rowId: v4(), label }],
                            });
                        }}
                    />

                    <DataTable
                        title="Rows"
                        sortable={!disabled}
                        onSort={(oldIndex: number, newIndex: number) => {
                            update({ rows: arrayMoveImmutable([...config.rows], oldIndex, newIndex) });
                        }}
                        headerActions={disabled ? undefined : (
                            <Button
                                className="text-primary border-primary"
                                variant="outline"
                                onClick={() => setEditedRow({ index: config.rows.length })}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                New row
                            </Button>
                        )}
                        columns={[
                            {
                                name: 'Row heading',
                            },
                            {
                                name: '',
                                align: 'right',
                                cellRenderer({ rowIndex }) {
                                    const row = config.rows[rowIndex];

                                    if (!row) return null;

                                    return (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={() => setTimeout(() => setEditedRow({ index: rowIndex }), 0)}
                                                >
                                                    {!disabled ?
                                                        <><Edit className="mr-2 h-4 w-4" /> Edit</>
                                                        :
                                                        <><Eye className="mr-2 h-4 w-4" /> View</>}
                                                </DropdownMenuItem>

                                                {!disabled && (
                                                    <DropdownMenuItem
                                                        onClick={() => setTimeout(() => onDeleteRow(rowIndex), 0)}
                                                        className="text-danger focus:bg-danger focus:text-danger-foreground"
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    );
                                },
                            },
                        ]}
                        data={config.rows.map(row => [
                            row.label,
                            '',
                        ])}
                    />
                </div>
            )}

            {!disabled && !!errors.length && (
                <div className="flex flex-col gap-y-1">
                    {errors.map(error => (
                        <p key={error} className="text-xs text-destructive">{error}</p>
                    ))}
                </div>
            )}
        </>
    );
}

/** The table as it will look: its columns (the screen's fields) and rows. */
export function ScreenTablePreview({ form }: Pick<Props, 'form'>) {
    const tableConfig = form.watch('tableConfig') as ScreenTableConfig | null;
    const fields = form.watch('fields');
    const screenTitle = form.watch('title');

    const config = tableConfig || defaultScreenTableConfig;
    const isFixed = config.rowMode === 'fixed';

    const previewRows = isFixed
        ? config.rows.map(row => row.label)
        : Array.from({ length: PREVIEW_DYNAMIC_ROWS }).map((_, i) => `${i + 1}`);

    return (
        <div className="flex flex-col gap-y-2 px-4">
            <Title>Preview</Title>

            {!fields.length ? (
                <span className="text-xs text-muted-foreground">
                    Add columns to see the table.
                </span>
            ) : (
                <div className="border border-border rounded-md">
                    <div className="px-4 py-2 border-b border-b-border text-sm">
                        {config.title || screenTitle || 'Untitled table'}
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className={cn(!isFixed && 'w-10')}>
                                    {isFixed ? config.rowsHeading : '#'}
                                </TableHead>
                                {fields.map(field => (
                                    <TableHead key={field.fieldId}>
                                        {getTableColumnHeading(field)}
                                        {!field.optional && <span className="text-danger"> *</span>}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {previewRows.map((rowLabel, rowIndex) => (
                                <TableRow key={`${rowLabel}-${rowIndex}`}>
                                    <TableCell>{rowLabel}</TableCell>
                                    {fields.map(field => (
                                        <TableCell
                                            key={field.fieldId}
                                            className="text-muted-foreground"
                                        >
                                            {getColumnPlaceholder(field)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}

                            {!previewRows.length && (
                                <TableRow>
                                    <TableCell
                                        colSpan={fields.length + 1}
                                        className="text-center text-muted-foreground"
                                    >
                                        No rows yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {!isFixed && !!fields.length && (
                <span className="text-xs text-muted-foreground">
                    Rows are added on the app during capture; two are shown here as an example.
                </span>
            )}
        </div>
    );
}

function inputToRowLimit(value: string) {
    const trimmed = `${value || ''}`.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
}

/** What a cell of this column holds, shown in the preview in place of a captured value. */
function getColumnPlaceholder(field: Pick<ScriptField, 'type' | 'numeratorLabel' | 'denominatorLabel'>) {
    switch (field.type) {
        case 'fraction':
            return `${field.numeratorLabel || 'Numerator'} / ${field.denominatorLabel || 'Denominator'}`;
        case 'dropdown':
            return 'Dropdown';
        case 'multi_select':
            return 'Multiple choice';
        case 'number':
            return 'Number';
        case 'date':
            return 'Date';
        case 'datetime':
            return 'Date + Time';
        case 'time':
            return 'Time';
        case 'period':
            return 'Time period';
        default:
            return 'Text';
    }
}

function TableRowHeadingModal({
    open,
    disabled,
    row,
    rows,
    onClose,
    onSave,
}: {
    open: boolean;
    disabled?: boolean;
    row?: TableRowHeading;
    rows: TableRowHeading[];
    onClose: () => void;
    onSave: (label: string) => void;
}) {
    const [label, setLabel] = useState(row?.label || '');

    useEffect(() => { if (open) setLabel(row?.label || ''); }, [open, row]);

    const trimmed = label.trim();
    const isDuplicate = !!trimmed && rows.some(r => r.rowId !== row?.rowId && r.label.trim().toLowerCase() === trimmed.toLowerCase());

    return (
        <Modal
            open={open}
            onOpenChange={open => { if (!open) onClose(); }}
            title={row ? 'Edit row' : 'New row'}
            actions={
                <>
                    <span className={cn('text-danger text-xs', disabled && 'hidden')}>* Required</span>

                    <div className="flex-1" />

                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>

                    <Button
                        disabled={disabled || !trimmed || isDuplicate}
                        onClick={() => {
                            onSave(trimmed);
                            onClose();
                        }}
                    >
                        Save
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-y-5">
                <div>
                    <Label error={!disabled && !trimmed} htmlFor="tableRowLabel">Row heading *</Label>
                    <Input
                        id="tableRowLabel"
                        name="tableRowLabel"
                        disabled={disabled}
                        value={label}
                        error={!disabled && (!trimmed || isDuplicate)}
                        onChange={e => setLabel(e.target.value)}
                    />
                    {isDuplicate && (
                        <p className="mt-1 text-xs text-destructive">Another row already has this heading.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
}
