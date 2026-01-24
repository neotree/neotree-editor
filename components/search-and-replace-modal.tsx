'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { XIcon } from 'lucide-react';
import axios from 'axios';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/modal';
import type { ScriptsSearchResultsItem, } from "@/lib/scripts-search"
import ucFirst from '@/lib/ucFirst';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/components/ui/tooltip';
import { DialogClose, DialogTrigger, } from '@/components/ui/dialog';
import { useAlertModal } from '@/hooks/use-alert-modal';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { Loader } from '@/components/loader';
import { useAppContext } from '@/contexts/app';
import { ErrorCard } from './error-card';

type Props = {
    searchValue: string;
    scriptsSearchResults?: ScriptsSearchResultsItem[];
};

type ReplaceItem = {
    type: 'script' | 'screen' | 'diagnosis';
    id: string;
    title: string;
    parent?: {
        id: string;
        title: string;
        type: 'script';
    };
    matches: (ScriptsSearchResultsItem['matches'][0] & {
        newValue: string;
    })[];
};

function getReplaceItems({
    scriptsSearchResults = [],
}: Props) {
    const items: ReplaceItem[] = [];

    scriptsSearchResults
        .sort((a, b) => a.position - b.position)
        .forEach(script => {
            items.push({
                type: 'script',
                title: script.title,
                id: script.scriptId,
                matches: script.matches.map(m => ({
                    ...m,
                    newValue: '',
                })),
            });

            script.diagnoses.forEach(diagnosis => {
                items.push({
                    type: 'diagnosis',
                    title: diagnosis.title,
                    parent: {
                        id: script.scriptId,
                        title: script.title,
                        type: 'script',
                    },
                    id: diagnosis.diagnosisId,
                    matches: diagnosis.matches.map(m => ({
                        ...m,
                        newValue: '',
                    })),
                });
            });

            script.screens.forEach(screen => {
                items.push({
                    type: 'screen',
                    title: screen.title,
                    parent: {
                        id: script.scriptId,
                        title: script.title,
                        type: 'script',
                    },
                    id: screen.screenId,
                    matches: screen.matches.map(m => ({
                        ...m,
                        newValue: '',
                    })),
                });
            });
        });

    return items
        .map(item => ({
            ...item,
            matches: item.matches.filter(match => !['key', 'field_key', 'field_id', 'field_item_key', 'field_item_id'].includes(match.field)),
        }))
        .filter(item => !!item.matches.length);
}

function sanitizeSearchValue(searchValue = '') {
    return searchValue.replace(/\"(.*?)\"/, '$1');
}

const filterOptions = [
    {
        label: 'All matches',
        value: 'all',
    },
    {
        label: 'Scripts only',
        value: 'scripts',
    },
    {
        label: 'Screens only',
        value: 'screens',
    },
    {
        label: 'Diagnoses only',
        value: 'diagnoses',
    },
];

export function SearchAndReplaceModal(props: Props) {
    const {
        searchValue: searchValueProp = '',
        scriptsSearchResults = [],
    } = props;

    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState(filterOptions[0].value);
    const [searchValue, setSearchValue] = useState(sanitizeSearchValue(searchValueProp));
    const [replaceItems, setReplaceItems] = useState<ReplaceItem[]>([]);

    const [replaceWith, setReplaceWith] = useState('');
    const replaceWithDebounced = useDebounce(replaceWith);
    const replaceWithRef = useRef(replaceWithDebounced);

    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();
    const { isAdmin, isSuperUser, viewOnly, } = useAppContext();

    useEffect(() => {
        if (replaceWithRef.current !== replaceWithDebounced) {
            replaceWithRef.current = replaceWithDebounced;
            setReplaceItems(prev => prev.map(item => {
                return {
                    ...item,
                    matches: item.matches.map(match => {
                        return {
                            ...match,
                            newValue: !replaceWithDebounced ? '' : match.fieldValue.replaceAll(searchValue, replaceWithDebounced),
                        };
                    }),
                }
            }));
        }
    }, [searchValue, replaceWithDebounced, replaceItems]);

    const onModalOpenChange = useCallback(() => {
        setFilter(filterOptions[0].value);
        setSearchValue(searchValue)
        setReplaceItems(getReplaceItems(props));
        setReplaceWith('');
        replaceWithRef.current = '';
    }, [props]);

    const disabled = !replaceItems.length || !replaceWith;

    const onFilterChange = useCallback((val: string) => {
        replaceWithRef.current = '';
        setFilter(val);
        setReplaceItems(getReplaceItems(props).filter(item => {
            switch(val) {
                case 'scripts':
                    return item.type === 'script';
                case 'screens':
                    return item.type === 'screen';
                case 'diagnoses':
                    return item.type === 'diagnosis';
                default:
                    return true;
            }
        }));
    }, [filter, props]);

    const onSave = useCallback(async () => {
        try {
            setLoading(true);

            const response = await axios.post("/api/save", { 
                broadcastAction: true,

                scripts: replaceItems
                    .filter(s => s.type === 'script')
                    .map(s => ({
                        scriptId: s.id,
                        data: s.matches.reduce((acc, m) => ({
                            ...acc,
                            [m.field]: m.newValue,
                        }), {} as Record<string, any>)
                    })),

                screens: replaceItems
                    .filter(s => s.type === 'screen')
                    .map(s => ({
                        screenId: s.id,
                        data: {
                            ...s.matches
                            .reduce((acc, m) => {
                                const _fields: Record<string, any>[] = acc['_fields'] || [];
                                const _items: Record<string, any>[] = acc['_items'] || [];

                                if (m.fieldIndex === undefined) {
                                    acc[m.field] = m.newValue;
                                } else {
                                    if (m.field.includes('field_item_')) {
                                        let index = _fields.map(f => f.index).indexOf(m.fieldIndex);
                                        if (index === -1) index = _fields.length;
                                        _fields[index] = {
                                            index: m.fieldIndex,
                                            data: {
                                                ..._fields[index],
                                                [m.field.substring(11)]: m.newValue,
                                            },
                                        };
                                    } else if (m.field.includes('field_')) {
                                        let index = _fields.map(f => f.index).indexOf(m.fieldIndex);
                                        if (index === -1) index = _fields.length;
                                        _fields[index] = {
                                            index: m.fieldIndex,
                                            data: {
                                                ..._fields[index],
                                                [m.field.substring(6)]: m.newValue,
                                            },
                                        };
                                    } else {
                                        let index = _items.map(f => f.index).indexOf(m.fieldIndex);
                                        if (index === -1) index = _items.length;
                                        _items[index] = {
                                            index: m.fieldIndex,
                                            data: {
                                                ..._items[index],
                                                [m.field.substring(5)]: m.newValue,
                                            },
                                        };
                                    }
                                }

                                return {
                                    ...acc,
                                    _fields,
                                    _items,
                                };
                            }, {} as Record<string, any>),
                        }
                    })),

                diagnoses: replaceItems
                    .filter(s => s.type === 'diagnosis')
                    .map(s => ({
                        diagnosisId: s.id,
                        data: {
                            ...s.matches
                            .reduce((acc, m) => {
                                const _fields: Record<string, any>[] = acc['_fields'] || [];

                                if (m.fieldIndex === undefined) {
                                    acc[m.field] = m.newValue;
                                } else {
                                    let index = _fields.map(f => f.index).indexOf(m.fieldIndex);
                                    if (index === -1) index = _fields.length;
                                    _fields[index] = {
                                        index: m.fieldIndex,
                                        data: {
                                            ..._fields[index],
                                            [m.field]: m.newValue,
                                        },
                                    };
                                }

                                return {
                                    ...acc,
                                    _fields,
                                };
                            }, {} as Record<string, any>),
                        }
                    })),
            });

            const res = response.data as { success: boolean; errors?: string[]; };

            if (res.errors) {
                alert({
                    title: "Error",
                    message: res.errors.join(", "),
                    variant: "error",
                })
            } else {
                alert({
                    title: "Success",
                    message: "Changes saved successfully!",
                    variant: "success",
                    onClose: () => window.location.reload(),
                });
            }
        } catch(e: any) {
            alert({
                title: "Error",
                message: e.message,
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [replaceItems]);

    if (viewOnly || !(isSuperUser || isAdmin)) return null;

    return (
        <>
            <Modal
                onOpenChange={() => {
                    onModalOpenChange();
                }}
                title={(
                    <div className="flex flex-col gap-y-2">
                        <div
                            className="flex flex-col gap-y-2 sm:flex-row sm:[&>*]:flex-1 sm:gap-x-2"
                        >
                            <div>
                                <Label className="mb-2 block text-left" htmlFor="searchValue">Search value</Label>
                                <Input 
                                    disabled
                                    name="searchValue"
                                    value={searchValue}
                                    onChange={e => setSearchValue(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label className="mb-2 block text-left" htmlFor="replaceWith">Replace with</Label>
                                <Input 
                                    name="replaceWith"
                                    value={replaceWith}
                                    onChange={e => setReplaceWith(e.target.value)}
                                />
                            </div>
                        </div>

                        <div
                            className="flex flex-col gap-y-2 sm:flex-row sm:[&>*]:flex-1 sm:gap-x-2"
                        >
                            <div>
                                <Label className="mb-2 block text-left" htmlFor="filter">Filter</Label>
                                <div className="w-[120px]">
                                    <Select
                                        value={filter}
                                        onValueChange={onFilterChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All matches" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filterOptions.map(f => {
                                                return (
                                                    <SelectItem key={f.value} value={f.value}>
                                                        {f.label}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                trigger={(
                    <DialogTrigger asChild>
                        <Button>
                            Replace
                        </Button>
                    </DialogTrigger>
                )}
                actions={(
                    <div className="flex gap-x-4 ml-auto">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            disabled={disabled}
                            onClick={() => confirm(onSave, {
                                title: 'Save changes',
                                danger: true,
                            })}
                        >
                            Save
                        </Button>
                    </div>
                )}
                contentProps={{
                    className: 'flex flex-col max-h-[100%] gap-y-4 p-0 m-0 max-w-full sm:max-w-screen-2xl',
                }}
            >
                <div className="flex flex-col gap-y-6">
                    <ErrorCard color="warning">
                        NB: Data key matches are not replaceable and will not be displayed
                    </ErrorCard>

                    {!replaceItems.length && (
                        <div className="text-sm opacity-60 text-center">
                            No matches
                        </div>
                    )}

                    {replaceItems.map((replaceItem, replaceItemIndex) => {
                        return (
                            <div
                                className="flex flex-col gap-y-2"
                                key={replaceItem.id}
                            >
                                {loading && <Loader overlay transparent />}

                                <div className="text-sm">
                                    {!replaceItem.parent ? null : <div><b>{ucFirst(replaceItem.parent.type)}:&nbsp;</b>{replaceItem.parent.title}</div>}
                                    <div><b>{ucFirst(replaceItem.type)}:&nbsp;</b>{replaceItem.title}</div>
                                </div>

                                {replaceItem.matches.map((match, matchIndex) => {
                                    const key = replaceItem.id + `_match${matchIndex}`;

                                    return (
                                        <Card
                                            key={key}
                                        >
                                            <CardContent className="px-4 py-4 flex items-center gap-x-2">
                                                <div className="flex-1 flex flex-col gap-y-2">
                                                    <div>
                                                        <code className="inline-block text-xs bg-primary/10 p-1 rounded-sm">
                                                            {match.field}
                                                            {typeof match.fieldIndex === 'number' && <>&nbsp;(<b>position</b> = {match.fieldIndex + 1})</>}
                                                        </code>
                                                    </div>
                                                    
                                                    <code
                                                        className={cn(
                                                            'block',
                                                            match.newValue && 'bg-red-400/20 p-1 rounded-sm',
                                                        )}
                                                        dangerouslySetInnerHTML={{
                                                            __html: match.fieldValue.replaceAll(searchValue, `<mark>${searchValue}</mark>`),
                                                        }}
                                                    />

                                                    {match.newValue && (
                                                        <code
                                                            className={cn(
                                                                'block',
                                                                replaceWith && 'bg-green-400/20 p-1 rounded-sm',
                                                            )}
                                                            dangerouslySetInnerHTML={{
                                                                __html: match.newValue.replaceAll(replaceWithDebounced, `<mark>${replaceWithDebounced}</mark>`),
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <TooltipProvider delayDuration={0}>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Button
                                                                    variant="ghost"
                                                                    onClick={() => setReplaceItems(prev => {
                                                                        return prev.map((replaceItem, i) => {
                                                                            if (i !== replaceItemIndex) return replaceItem;
                                                                            return {
                                                                                ...replaceItem,
                                                                                matches: replaceItem.matches.filter((_, j) => matchIndex !== j),
                                                                            };
                                                                        }).filter(item => item.matches.length);
                                                                    })}
                                                                >
                                                                    <XIcon className="size-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Remove</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )
                    })}
                </div>
            </Modal>
        </>
    );
}
