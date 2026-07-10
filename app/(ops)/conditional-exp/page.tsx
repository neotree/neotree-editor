'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import CodeEditor, { TextareaCodeEditorProps } from '@uiw/react-textarea-code-editor';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    screenTypes,
    evaluateCondition,
    parseCondition,
} from './_eval';
import { ChevronDown, EditIcon, TrashIcon } from 'lucide-react';

export default function ConditionalExp() {
    const [condition, setCondition] = useState('');
    const [entries, setEntries] = useState<ScreenEntry[]>([]);

    const setEntry = useCallback((
        entry: ScreenEntry, 
        entryIndex: number,
    ) => {
        alert(entryIndex)
        setEntries(prev => {
            if (!prev.length) return [entry];
            return prev.map((e, i) => ({
                ...(i === entryIndex ? { ...e, ...entry, } : e),
            }));            
        });
    }, []);

    const canTest = entries.length;

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
                            disabled={!canTest}
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
                                alert(res);
                            }}
                        >Test</Button>
                    </div>
                </div>
            </div>
        </>
    );
}

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
    const [entryValue, setEntryValue] = useState<ScreenEntryValue>({
        type: '',
        key: '',
        value: '',
    });
    const [entryValueIndex, setEntryValueIndex] = useState(0);
    const [form, setForm] = useState<ScreenEntry>(entry || {
        values: [],
        screen: {
            type: '',
        },
    });

    const save = useCallback(() => {
        onSave(form, entryIndex);
    }, [form, entryIndex, onSave]);

    const canSave = !!form.screen.type && !!(
        form.value?.length ||
        form.values?.length
    );

    useEffect(() => {
        if (
            entryValue.key &&
            entryValue.value &&
            entryValue.type &&
            form.screen.type
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
            <Dialog>
                {trigger || (
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                        >Add value</Button>
                    </DialogTrigger>
                )}
                
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{''}</DialogTitle>
                        <DialogDescription>{''}</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-y-4">
                        <div>
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
                        </div>

                        <div>
                            <Label>Entry type</Label>
                            <Select
                                value={entryValue.type}
                                onValueChange={type => setEntryValue(prev => ({
                                    ...prev,
                                    type,
                                }))}
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
                                onChange={e => setEntryValue(prev => ({
                                    ...prev,
                                    key: e.target.value,
                                }))}
                            />
                        </div>

                        <div>
                            <Label>Value</Label>
                            <Input 
                                value={entryValue.value}
                                onChange={e => setEntryValue(prev => ({
                                    ...prev,
                                    value: e.target.value,
                                }))}
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
