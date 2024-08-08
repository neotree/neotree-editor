import { useCallback, useMemo, useState } from "react";
import { v4 } from "uuid";
import { useForm } from "react-hook-form";

import { useDiagnosisForm } from "@/hooks/scripts/use-diagnosis-form";
import { DialogClose, } from "@/components/ui/dialog";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { isEmpty } from "@/lib/isEmpty";
import { cn } from "@/lib/utils";
import { DiagnosisSymptom } from "@/types";
import { SymptomTypes } from '@/constants';
import { Title } from "../title";

type Props = {
    children: React.ReactNode | ((params: { extraProps: any }) => React.ReactNode);
    disabled?: boolean;
    symptom?: {
        index: number;
        data: DiagnosisSymptom,
    };
    form: ReturnType<typeof useDiagnosisForm>;
};

export function Symptom<P = {}>({
    children,
    symptom: symptomProp,
    form,
    disabled: disabledProp,
    ...extraProps
}: Props & P) {
    const { data: symptom, index: symptomIndex, } = { ...symptomProp, };

    const [open, setOpen] = useState(false);

    const getDefaultValues = useCallback(() => {
        return {
            symptomId: symptom?.symptomId || v4(),
            expression: symptom?.expression || '',
            name: symptom?.name || '',
            weight: symptom?.weight || null,
            type: symptom?.type || SymptomTypes[0].value,
            position: symptom?.position || 1,
            printable: symptom?.printable || true,
            ...symptom
        } satisfies DiagnosisSymptom;
    }, [symptom]);

    const {
        reset: resetForm,
        watch,
        register,
        handleSubmit,
        setValue,
    } = useForm({
        defaultValues: getDefaultValues(),
    });

    const type = watch('type');
    const name = watch('name');
    const printable = watch('printable');

    const disabled = useMemo(() => !!disabledProp, [disabledProp]);

    const onSave = handleSubmit(data => {
        if (!isEmpty(symptomIndex) && symptom) {
            form.setValue('symptoms', form.getValues('symptoms').map((f, i) => ({
                ...f,
                ...(i === symptomIndex ? data : null),
            })));
        } else {
            form.setValue('symptoms', [...form.getValues('symptoms'), data], { shouldDirty: true, })
        }
        setOpen(false);
    });

    return (
        <>
            <Modal
                open={open}
                title={symptom ? 'Add symptom' : 'Edit symptom'}
                trigger={typeof children === 'function' ? children({ extraProps }) : children}
                onOpenChange={open => {
                    setOpen(open);
                    resetForm(getDefaultValues());
                }}
                actions={(
                    <>
                        <span className={cn('text-danger text-xs', disabled && 'hidden')}>* Required</span>

                        <div className="flex-1" />

                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            disabled={disabled}
                            onClick={() => onSave()}
                        >
                            Save
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-5">
                    <Title>Type</Title>

                    <div>
                        <RadioGroup
                            disabled={disabled}
                            defaultValue={type}
                            onValueChange={value => setValue('type', value as typeof type, { shouldDirty: true, })}
                            className="flex flex-col gap-y-4"
                        >
                            {SymptomTypes.map(t => (
                                <div key={t.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={t.value} id={t.value} />
                                    <Label secondary htmlFor={t.value}>{t.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <Title>Properties</Title>

                    <div>
                        <Label error={!disabled && !name} htmlFor="name">Name *</Label>
                        <Input
                            {...register('name', { disabled, required: true, })}
                            name="name"
                            error={!disabled && !name}
                        />
                    </div>

                    <div>
                        <Label htmlFor="weight">Weight </Label>
                        <Input
                            {...register('weight', { disabled, })}
                            name="label"
                            type="number"
                        />
                        <span className="text-xs text-muted-foreground">Must be in the range: 0.0 - 1.0 (<b>default 1.0</b>)</span>
                    </div>

                    <div>
                        <Label htmlFor="expression">Sign/Risk expression </Label>
                        <Input
                            {...register('expression', { disabled, })}
                            name="label"
                        />
                        <span className="text-xs text-muted-foreground">Example: <b>($key = true and $key2 = false) or $key3 = &apos;HD&apos;</b></span>
                    </div>

                    <Title>Print</Title>
                    
                    <div>
                        <div className="flex-1 flex items-center space-x-2">
                            <Checkbox 
                                id="printable" 
                                disabled={disabled}
                                checked={printable}
                                onCheckedChange={() => setValue('printable', !printable, { shouldDirty: true, })}
                            />
                            <Label htmlFor="printable">Print</Label>
                        </div>

                        <span className="text-muted-foreground text-xs">If not checked, data will not be display on the session summary and the printout.</span>
                    </div>
                </div>
            </Modal>
        </>
    );
}
