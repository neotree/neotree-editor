'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { ChevronDown, EditIcon, TrashIcon } from 'lucide-react';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from '@/components/ui/collapsible';
import { 
    Dialog, 
    DialogClose, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    type ScreenEntry,
    type ScreenEntryValue,
    entryTypes,
    // screenTypes,
    evaluateCondition,
    parseCondition,
    parseConditionString,
} from './_eval';

const defaultTestResults = {
    parsedCondition: '',
    isValid: false,
};

export default function ConditionalExp() {
    const [condition, setCondition] = useState('');
    const [entries, setEntries] = useState<ScreenEntry[]>([]);
    const [testResults, setTestResults] = useState(defaultTestResults);

    const canTest = entries.length;

    useEffect(() => {
        setTestResults(defaultTestResults);
    }, [condition, entries]);

    return (
        <>
            <div className="h-full w-full fixed flex flex-col overflow-y-auto">
                <div className="my-auto mx-auto w-[90%] max-w-[800px] py-10 flex flex-col gap-y-4">
                    {!entries.length ? null : (
                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost">Show entries <ChevronDown className="w-4 h-4" /></Button>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <div className="flex flex-col gap-y-2 mt-4">
                                    {entries.map((e, i) => {
                                        return (
                                            <Card key={i}>
                                                <CardContent>
                                                    <CardHeader>
                                                        <div className="flex justify-end">
                                                            <JsonModal 
                                                                entry={e}
                                                                entryIndex={i}
                                                                onSave={e => setEntries(prev => prev.map((entr, j) => ({
                                                                    ...(i !== j ? entr : {
                                                                        // ...entr,
                                                                        ...e,
                                                                    }),
                                                                })))}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    const confirmed = confirm('Are you sure?');
                                                                    if (confirmed) {
                                                                        setEntries(prev => prev.filter((_, j) => i !== j));
                                                                    }
                                                                }}
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </CardHeader>

                                                    <pre>
                                                        {JSON.stringify(e, null, 4)}
                                                    </pre>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    )}

                    <div>
                        <Textarea 
                            value={condition}
                            placeholder="Condition"
                            rows={4}
                            onChange={e => setCondition(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-row gap-x-4 justify-end">
                        <Modal
                            entryIndex={entries.length}
                            onSave={(entry) => setEntries(prev => [...prev, entry])}
                        />

                        <Button
                            disabled={!canTest}
                            onClick={() => {
                                const res = evaluateCondition(parseCondition(condition, entries));
                                setTestResults({
                                    parsedCondition: parseCondition(condition, entries),
                                    isValid: res,
                                });
                            }}
                        >Test</Button>
                    </div>

                    {!!condition && !!testResults.parsedCondition && (
                        <pre 
                            className="
                                block
                                px-4
                                py-2
                                rounded-md
                                border-border
                                border-[1px]
                                bg-black 
                                text-white 
                                dark:text-black 
                                dark:bg-white
                            "
                        >
                            <p>{`> ${testResults.parsedCondition}`}</p>
                            <p>{`> ${testResults.isValid}`}</p>
                        </pre>
                    )}
                </div>
            </div>
        </>
    );
}

const defaultScreenEntry: ScreenEntry = {
    values: [],
    screen: {
        type: '',
    },
};

const defaultEntryValue: ScreenEntryValue = {
    type: '',
    key: '',
    value: [
        { value: '', },
    ],
};

const isSelectedEntryFn = (type: string) => [
    'dropdown',
    'multi_select',
    'single_select',
    'diagnosis',
    'problem',
    'drug',
    'fluid',
    'checklist',
    'yesno',
].includes(type);

const hasMultipleEntriesFn = (type: string) => [
    'multi_select',
    'diagnosis',
    'problem',
    'drug',
    'fluid',
    'checklist',
].includes(type);

const isNumberFn = (type: string) => [
    'timer',
    'number',
].includes(type);

function Modal({
    entry,
    entryIndex,
    trigger,
    onSave,
}: {
    entry?: ScreenEntry;
    entryIndex: number;
    trigger?: React.ReactNode;
    onSave: (entry: ScreenEntry, entryIndex: number) => void;
}) {
    const [entryValue, setEntryValue] = useState<ScreenEntryValue>(defaultEntryValue);
    const [entryValueIndex, setEntryValueIndex] = useState(0);
    const [form, setForm] = useState<ScreenEntry>(entry || defaultScreenEntry);

    const save = useCallback(() => {
        onSave(form, entryIndex);
    }, [form, entryIndex, onSave]);

    const canSave = !!(
        form.value?.length ||
        form.values?.length
    ); // && !!form.screen.type;

    useEffect(() => {
        if (
            entryValue.key &&
            entryValue.value &&
            entryValue.type
            // && form.screen.type
        ) {
            setForm(prev => ({
                ...prev,
                values: !form.values.length ? [entryValue] : prev.values.map((v, i) => {
                    if (i === entryValueIndex) {
                        return {
                            ...v,
                            ...entryValue,
                        };
                    }
                    return v;
                }),
            }));
        } else {
            setForm(prev => ({
                ...prev,
                values: prev.values.filter((_, i) => i !== entryValueIndex),
            }));
        }
    }, [entryValue, entryValueIndex, form.screen.type]);

    return (
        <>
            <Dialog
                onOpenChange={() => {
                    setForm(defaultScreenEntry);
                    setEntryValue(defaultEntryValue);
                }}
            >
                {trigger || (
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                        >Add value</Button>
                    </DialogTrigger>
                )}
                
                <DialogContent className="flex min-h-0 max-h-[90dvh] flex-col overflow-hidden gap-y-4 p-0 m-0 sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{''}</DialogTitle>
                        <DialogDescription>{''}</DialogDescription>
                    </DialogHeader>

                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-2 gap-y-4">
                        {/* <div>
                            <Label>Screen type</Label>
                            <Select
                                value={form.screen.type}
                                onValueChange={type => setForm(prev => ({
                                    ...prev,
                                    screen: {
                                        ...prev.screen,
                                        type,
                                    },
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    {screenTypes.map((t, i) => {
                                        const key = `${i}`;
                                        return (
                                            <SelectItem
                                                key={key}
                                                value={t.type}
                                            >
                                                {t.type}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div> */}

                        <div>
                            <Label>Entry type</Label>
                            <Select
                                value={entryValue.type}
                                onValueChange={type => setEntryValue({
                                    ...defaultEntryValue,
                                    type,
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    {entryTypes.map((t, i) => {
                                        const key = `${i}`;
                                        return (
                                            <SelectItem
                                                key={key}
                                                value={t.type}
                                            >
                                                {t.type}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Key</Label>
                            <Input 
                                value={entryValue.key}
                                onChange={e => {
                                    const key = e.target.value;
                                    setEntryValue(prev => ({
                                        ...prev,
                                        key,
                                        value: (prev.value || []).map((v: any, i: number) => ({
                                            ...v,
                                            parentKey: key,
                                        })),
                                    }));
                                }}
                            />
                        </div>

                        <div className="flex flex-col gap-y-2">
                            {entryValue.value?.map?.((
                                v: any, 
                                i: number
                            ) => {
                                const isSelectedEntry = isSelectedEntryFn(entryValue.type!);
                                const hasMultipleEntries = hasMultipleEntriesFn(entryValue.type!);

                                const component = (
                                    <div className="flex gap-x-2">
                                        {isSelectedEntry ? (
                                            <div className="flex-1">
                                                <Label>Entry key</Label>
                                                <Input 
                                                    value={v.key}
                                                    onChange={e => setEntryValue(prev => {
                                                        const key = e.target.value;
                                                        return {
                                                            ...prev,
                                                            value: prev.value?.map?.((v: any, j: number) => {
                                                                return i !== j ? v : {
                                                                    ...v,
                                                                    key,
                                                                    parentKey: v.key,
                                                                };
                                                            }),
                                                        };
                                                    })}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex-1">
                                                <Label>Value</Label>
                                                <Input 
                                                    value={v.value}
                                                    onChange={e => setEntryValue(prev => {
                                                        const value = e.target.value;
                                                        const key = v.key || prev.key;
                                                        let calculateValue: any = undefined;

                                                        if (isNumberFn(entryValue.type!)) {
                                                            calculateValue = isNaN(Number(`${value || ''}`)) ? undefined : Number(value); 
                                                        }
                                                        
                                                        return {
                                                            ...prev,
                                                            value: prev.value?.map?.((v: any, j: number) => {
                                                                return i !== j ? v : {
                                                                    ...v,
                                                                    value,
                                                                    key,
                                                                    parentKey: prev.key,
                                                                };
                                                            }),
                                                        };
                                                    })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );

                                return (
                                    <Fragment key={i}>
                                        {!hasMultipleEntries ? component : (
                                            <Card>
                                                <CardContent className='pt-4'>
                                                    {component}
                                                    {entryValue.value?.length > 1 && (
                                                        <div className="flex justify-end">
                                                            <Button
                                                                variant="link"
                                                                onClick={() => setEntryValue(prev => ({
                                                                    ...prev,
                                                                    value: prev.value.filter((_: any, j: number) => j !== i),
                                                                }))}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </Fragment>
                                );
                            })}

                            {hasMultipleEntriesFn(entryValue.type!) && (
                                <div className="flex justify-end">
                                    <Button
                                        variant="link"
                                        onClick={() => setEntryValue(prev => ({
                                            ...prev,
                                            value: [...prev.value, {
                                                value: '',
                                                key: '',
                                            }]
                                        }))}
                                    >
                                        Add another entry
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <DialogFooter className="shrink-0 border-t border-t-border px-4 py-2 items-center w-full">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >Cancel</Button>
                        </DialogClose>

                        <DialogClose asChild>
                            <Button
                                disabled={!canSave}
                                onClick={() => save()}
                            >Save</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function JsonModal({
    entry,
    entryIndex,
    trigger,
    onSave,
}: {
    entry?: ScreenEntry;
    entryIndex: number;
    trigger?: React.ReactNode;
    onSave: (entry: ScreenEntry, entryIndex: number) => void;
}) {
    const [form, setForm] = useState(JSON.stringify({
        values: [],
        screen: {
            type: '',
        },
        ...entry
    }, null, 4));

    const save = useCallback(() => {
        onSave(JSON.parse(form), entryIndex);
    }, [form, entryIndex, onSave]);

    const isJsonValid = useMemo(() => {
        return (() => {
            try {
                JSON.parse(form);
                return true;
            } catch(e: any) {
                return false;
            }
        })();
    }, [form]);

    const canSave = isJsonValid;

    return (
        <>
            <Dialog>
                {trigger || (
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                        ><EditIcon className="w-4 h-4" /></Button>
                    </DialogTrigger>
                )}
                
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{''}</DialogTitle>
                        <DialogDescription>{''}</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-y-4">
                        <div>
                            <CodeEditor
                                value={form}
                                language="json"
                                placeholder="Enter JSON"
                                onChange={(evn) => setForm(evn.target.value)}
                                padding={15}
                                disabled={false}
                                data-color-mode='light'
                                style={{
                                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                                }}
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >Cancel</Button>
                        </DialogClose>

                        <DialogClose asChild>
                            <Button
                                disabled={!canSave}
                                onClick={() => save()}
                            >Save</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
