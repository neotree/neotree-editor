"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import moment from "moment";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "./timepicker";

type Props = {
    type?: 'date' | 'datetime' | 'time';
    disabled?: boolean;
    value: Date | string | null;
    min?: Date;
    max?: Date;
    onChange: (value: { date: Date | null, time: string | null }) => void;
};

export function DateTimePicker({ 
    type = 'date', 
    value, 
    disabled,
    min,
    max,
    onChange, 
}: Props) {
    const { date } = useMemo(() => {
        let date = undefined;

        if (type === 'time') {
            const _date = moment().format('YYYY-MM-DD');
            date = !value ? undefined : new Date(`${_date} ${value}`);
            date = moment(date).isValid() ? date : undefined;
        } else {
            date = !value ? undefined : new Date(value);
            date = moment(date).isValid() ? date : undefined;
            
            if (date && min) {
                const _date = moment(date).format('YYYY-MM-DD');
                const _min = moment(min).format('YYYY-MM-DD');
                date = new Date(_date).getTime() >= new Date(_min).getTime() ? date : undefined;
            }

            if (date && max) {
                const _date = moment(date).format('YYYY-MM-DD');
                const _max = moment(max).format('YYYY-MM-DD');
                date = new Date(_date).getTime() <= new Date(_max).getTime() ? date : undefined;
            }
        }

        return {
            date,
            isDirty: date && value ? date.toDateString() !== new Date(value).toDateString() : false,
        };
    }, [value, min, max, type]);

    const dateFormat = useMemo(() => {
        switch(type) {
            case 'date':
                return 'PPP';
            case 'time':
                return 'HH:mm:ss';
            default:
                return 'PPP HH:mm:ss';
        }
    }, [type]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    disabled={disabled}
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >

                    {type === 'time' ? (
                        <Clock className="mr-2 h-4 w-4" />
                    ) : (
                        <CalendarIcon className="mr-2 h-4 w-4" />
                    )}

                    {date ? (
                        format(date, dateFormat)
                    ) : (
                        <span>Pick {type === 'time' ? 'time' : 'a date'}</span>
                    )}
                </Button>
            </PopoverTrigger>
            
            <PopoverContent className="w-auto p-0">
                {type !== 'time' && (
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={date => onChange({ date: date || null, time: date ? moment(date).format('HH:mm:ss') : null})}
                        initialFocus
                        fromDate={min}
                        toDate={max}
                    />
                )}

                {((type === 'datetime') || (type === 'time')) && (
                    <div className="p-3 border-t border-border">
                        <TimePicker
                            setDate={date => {
                                onChange({ date: date || null, time: date ? moment(date).format('HH:mm:ss') : null});
                            }}
                            date={date}
                        />
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
