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
import { Checkbox } from '@/components/ui/checkbox';
import { Modal } from '@/components/modal';
import type { ScriptsSearchResultsItem, } from "@/lib/scripts-search"
import { buildSavePayload, getReplaceItems, type ReplaceItem, } from "@/lib/search-replace-payload"
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

function regExpEsc(s: string) {
    // @ts-ignore
    return RegExp.escape(s);
}

function sanitizeSearchValue(searchValue = '') {
    let sanitised = searchValue.trim();

    if (
        (
            (sanitised[0] === `"`) ||
            (sanitised[0] === `'`) || 
            (sanitised[0] === '`')
        ) &&
        (
            (sanitised[sanitised.length - 1] === `"`) ||
            (sanitised[sanitised.length - 1] === `'`) || 
            (sanitised[sanitised.length - 1] === '`')
        ) 
    ) {
        sanitised = sanitised.substring(1, sanitised.length - 1);
    }

    return sanitised;
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
    {
        label: 'Problems only',
        value: 'problems',
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
    const [caseSensitive, setCaseSensitive] = useState(false);

    const [replaceWith, setReplaceWith] = useState('');
    const replaceWithDebounced = useDebounce(replaceWith);
    const replaceWithRef = useRef(replaceWithDebounced);
    const caseSensitiveRef = useRef(caseSensitive);

    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();
    const { isAdmin, isSuperUser, viewOnly, } = useAppContext();

    useEffect(() => {
        if (
            (replaceWithRef.current !== replaceWithDebounced) ||
            (caseSensitiveRef.current !== caseSensitive)
        ) {
            replaceWithRef.current = replaceWithDebounced;
            caseSensitiveRef.current = caseSensitive;
            setReplaceItems(prev => prev.map(item => {
                return {
                    ...item,
                    matches: item.matches.map(match => {
                        return {
                            ...match,
                            newValue: !replaceWithDebounced ? '' : match.fieldValue.replace(new RegExp(regExpEsc(searchValue), caseSensitive ? 'g' : 'gi'), replaceWithDebounced),
                            exclude: !`${match.fieldValue}`.match(new RegExp(regExpEsc(searchValue), caseSensitive ? 'g' : 'gi'))
                        };
                    }),
                }
            }));
        }
    }, [searchValue, replaceWithDebounced, replaceItems, caseSensitive]);

    const onModalOpenChange = useCallback(() => {
        setFilter(filterOptions[0].value);
        setSearchValue(searchValue)
        setReplaceItems(getReplaceItems(props.scriptsSearchResults));
        setReplaceWith('');
        replaceWithRef.current = '';
        setCaseSensitive(false);
    }, [props]);

    const disabled = !replaceItems.length || !replaceWith;

    const onFilterChange = useCallback((val: string) => {
        replaceWithRef.current = '';
        setFilter(val);
        setReplaceItems(getReplaceItems(props.scriptsSearchResults).filter(item => {
            switch(val) {
                case 'scripts':
                    return item.type === 'script';
                case 'screens':
                    return item.type === 'screen';
                case 'diagnoses':
                    return item.type === 'diagnosis';
                case 'problems':
                    return item.type === 'problem';
                default:
                    return true;
            }
        }));
    }, [filter, props, caseSensitive]);

    const onSave = useCallback(async () => {
        try {
            setLoading(true);

            const items = replaceItems.map(item => ({
                ...item,
                matches: item.matches.filter(m => !m.exclude),
            }))
            .filter(item => item.matches.length);

            const response = await axios.post("/api/save", {
                broadcastAction: true,
                ...buildSavePayload(items),
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

                            <div className="flex gap-x-2 items-center">
                                <Checkbox 
                                    id="caseSensitive"
                                    name="caseSensitive"
                                    checked={caseSensitive}
                                    onCheckedChange={() => {
                                        const value = !caseSensitive;
                                        setCaseSensitive(value);
                                    }}
                                />
                                <Label htmlFor="caseSensitive">
                                    Case sensitive
                                </Label>
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
                        const matchesLength = replaceItem.matches.filter(m => !m.exclude).length;

                        if (!matchesLength) return null;

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

                                    if (match.exclude) return null;

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
                                                            __html: match.fieldValue.replace(new RegExp(`(${regExpEsc(searchValue)})`, caseSensitive ? 'g' : 'gi'), `<mark>$1</mark>`),
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
