'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { XIcon } from 'lucide-react';

import { DialogClose, DialogTrigger, } from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectLabel,
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
    console.log(scriptsSearchResults)
    const items: ReplaceItem[] = [];

    scriptsSearchResults.forEach(script => {
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

    return items.filter(item => !!item.matches.length);
}

function sanitizeSearchValue(searchValue = '') {
    return searchValue.replace(/\"(.*?)\"/, '$1');
}

const filterOptions = [
    {
        label: 'All',
        value: 'all',
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

    const [filter, setFilter] = useState(filterOptions[0].value);
    const [searchValue, setSearchValue] = useState(sanitizeSearchValue(searchValueProp));
    const [replaceItems, setReplaceItems] = useState<ReplaceItem[]>([]);

    const [replaceWith, setReplaceWith] = useState('');
    const replaceWithDebounced = useDebounce(replaceWith);
    const replaceWithRef = useRef(replaceWithDebounced);

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
                                <Input 
                                    name="replaceWith"
                                    value={replaceWith}
                                    onChange={e => setReplaceWith(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
                trigger={(
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                        >
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
                        >
                            Replace
                        </Button>
                    </div>
                )}
                contentProps={{
                    className: 'flex flex-col max-h-[100%] gap-y-4 p-0 m-0 max-w-full sm:max-w-screen-2xl',
                }}
            >
                <div className="flex flex-col gap-y-6">
                    {!replaceItems.length && (
                        <div className="text-sm opacity-60 text-center">
                            Nothing to replace
                        </div>
                    )}

                    {replaceItems.map(item => {
                        return (
                            <div
                                className="flex flex-col gap-y-2"
                                key={item.id}
                            >
                                <div className="text-sm">
                                    {!item.parent ? null : <div><b>{ucFirst(item.parent.type)}:&nbsp;</b>{item.parent.title}</div>}
                                    <div><b>{ucFirst(item.type)}:&nbsp;</b>{item.title}</div>
                                </div>
                                {item.matches.map((match, i) => {
                                    const key = item.id + `_match${i}`;

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
                                                                    onClick={() => setReplaceItems(prev => prev.filter((_, j) => j !== i))}
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
