'use client';

import { useCallback, useState } from "react";
import { CopyBlock, dracula } from "react-code-blocks";
import axios from "axios";

import { getLogs } from "@/app/actions/logs";
import { Button } from "@/components/ui/button";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { DateTimePicker } from "@/components/datetime-picker";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/loader";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import queryString from "query-string";

type Props = {
    _getLogs: typeof getLogs;
};

const options = [
    { label: 'Errors', value: 'errors' }, 
    {label: 'Logs', value: 'logs', },
    {label: 'App Errors', value: 'app_errors', },
];

export function Content({
    _getLogs,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<Awaited<ReturnType<typeof _getLogs>>['data']>([]);
    const [form, setForm] = useState<Parameters<typeof _getLogs>[0]>({
        date: null!,
        endDate: null!,
        type: 'errors',
    });

    const { alert } = useAlertModal();

    const getLogs = useCallback(async () => {
        try {
            setLoading(true);

            const res = await axios.get('/api/logs?'+queryString.stringify(form));
            const { errors, data, } = res.data as Awaited<ReturnType<typeof _getLogs>>;

            if (errors?.length) throw new Error(errors.join(', '));

            setLogs(data);
        } catch(e: any) {
            alert({
                title: 'Error',
                message: 'Failed to load logs: ' + e.message,
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [alert, form]);

    return (
        <>
            {loading && <Loader overlay />}

            <div className="flex gap-x-6 p-4">
                <div>
                    <Label>Type</Label>
                    <Select
                        value={form.type}
                        onValueChange={value => {
                            const type = value as typeof form.type;
                            setForm(prev => ({ ...prev, type, }));
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectGroup>
                            {options.map(o => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>Start date *</Label>
                    <DateTimePicker
                        type="date"
                        value={form.date}
                        max={new Date()}
                        onChange={value => setForm(prev => ({ 
                            ...prev, 
                            date: value.date!, 
                            endDate: null,
                        }))}
                    />
                </div>

                <div>
                    <Label>End date</Label>
                    <DateTimePicker
                        type="date"
                        disabled={!form.date}
                        min={form.date}
                        max={new Date()}
                        value={form.endDate!}
                        onChange={value => setForm(prev => ({ ...prev, endDate: value.date!, }))}
                    />
                </div>

                <div className="flex-1" />

                <Button
                    onClick={getLogs}
                    disabled={!form.date || loading}
                >
                    View logs
                </Button>
            </div>

            <Separator className="my-5" />

            {!!logs.length ? (
                <>
                    <div className="p-4">
                        <CopyBlock
                            language="text"
                            text={logs.join('\n')}
                            showLineNumbers
                            theme={dracula}
                            codeBlock
                        />
                    </div>
                </>
            ) : (
                <div className="p-4 text-center text-muted-foreground">
                    No logs to to display
                </div>
            )}
        </>
    );
}
