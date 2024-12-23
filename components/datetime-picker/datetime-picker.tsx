"use client";

import { useEffect, useState } from "react";
import moment from "moment";

import { Input } from "@/components/ui/input";

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
    const [{ dateString }, setFormState] = useState({
        date: null as Date | null,
        dateString: '',
        time: null as string | null,
    });

    useEffect(() => {
        let date: Date | null = null;

        if (type === 'time') {
            const _date = moment().format('YYYY-MM-DD');
            date = !value ? null : new Date(`${_date} ${value}`);
            date = moment(date).isValid() ? date : null;
        } else {
            date = !value ? null : new Date(value);
            date = moment(date).isValid() ? date : null;
            
            if (date && min) {
                const _date = moment(date).format('YYYY-MM-DD');
                const _min = moment(min).format('YYYY-MM-DD');
                date = new Date(_date).getTime() >= new Date(_min).getTime() ? date : null;
            }

            if (date && max) {
                const _date = moment(date).format('YYYY-MM-DD');
                const _max = moment(max).format('YYYY-MM-DD');
                date = new Date(_date).getTime() <= new Date(_max).getTime() ? date : null;
            }
        }

        const time = date ? moment(date).format('HH:mm:ss') : null;

        setFormState({
            date,
            time,
            dateString: date ? moment(date).format('YYYY-MM-DD') : '',
        });

        onChange({ date, time, });
    }, [value, min, max, type]);

    return (
        <Input 
            value={dateString}
            type={type === 'time' ? 'time' : (type === 'datetime' ? 'datetime-local' : 'date')}
            min={min ? moment(min).format('YYYY-MM-DD') : undefined}
            max={max ? moment(max).format('YYYY-MM-DD') : undefined}
            disabled={disabled}
            onChange={e => {
                let date = e.target.value ? new Date(e.target.value) : null;
                if (type === 'time') date = e.target.value ? new Date() : null;
                const time = date ? moment(date).format('HH:mm:ss') : null;
                setFormState({ date, dateString: e.target.value, time });
            }}
        />
    );
}
