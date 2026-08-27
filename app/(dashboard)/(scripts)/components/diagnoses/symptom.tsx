import { useCallback, useMemo, useState } from "react";
import { v4 } from "uuid";
import { useForm, Controller } from "react-hook-form";

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
import { SymptomTypes, CONDITIONAL_EXP_EXAMPLE } from '@/constants';
import { SelectDataKey } from "@/components/select-data-key";
import { Title } from "../title";
import { useDiagnosisForm } from "../..//hooks/use-diagnosis-form";
import { ConditionalExpressionModal } from "@/components/conditional-expression-modal";
import { ConditionEditor, useConditionKeys } from "@/components/conditional-expression";
import { collectOutcomeKeyCollisions } from "@/lib/conditional-expression";

type Props = {
    children?: React.ReactNode | ((params: { extraProps: any }) => React.ReactNode);
    disabled?: boolean;
    symptom?: {
        index: number;
        data: DiagnosisSymptom,
    };
    form: ReturnType<typeof useDiagnosisForm>;
    open?: boolean;
    onClose?: () => void;
    unavailableOutcomeKeys?: Record<string, string>;
};

export function Symptom<P = {}>({
    children,
    symptom: symptomProp,
    form,
    disabled: disabledProp,
    open: controlledOpen,
    onClose: controlledOnClose,
    unavailableOutcomeKeys,
    ...extraProps
}: Props & P) {
    const { data: symptom, index: symptomIndex, } = { ...symptomProp, };

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const [expressionHasErrors, setExpressionHasErrors] = useState(false);
    const { conditionKeys, keysLoading } = useConditionKeys({ enabled: open });
    const setOpen = controlledOnClose
        ? (nextOpen: boolean) => {
            if (!nextOpen) controlledOnClose();
        }
        : setUncontrolledOpen;

    const getDefaultValues = useCallback(() => {
        return {
            ...symptom,
            symptomId: symptom?.symptomId || v4(),
            expression: symptom?.expression || '',
            name: symptom?.name || '',
            key: symptom?.key || '',
            keyId: symptom?.keyId || '',
            weight: symptom?.weight || null,
            type: symptom?.type || SymptomTypes[0].value,
            position: symptom?.position || 1,
            printable: !!symptom?.printable,
        } satisfies DiagnosisSymptom;
    }, [symptom]);

    const {
        control,
        reset: resetForm,
        watch,
        register,
        handleSubmit,
        setValue,
    } = useForm({
        defaultValues: getDefaultValues(),
    });

    const type = watch('type');
    const key = watch('key');
    const name = watch('name');
    const printable = watch('printable');

    const disabled = useMemo(() => !!disabledProp, [disabledProp]);
    const reservedKeyCollisions = useMemo(
        () => collectOutcomeKeyCollisions({ diagnoses: [{ name: form.getValues('name'), symptoms: [{ key, name }] }] }),
        [form, key, name],
    );

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

    const isKeyDisabled = disabled || !!symptom;

    return (
        <>
            <Modal
                open={open}
                title={symptom ? 'Edit symptom' : 'Add symptom'}
                trigger={children ? (typeof children === 'function' ? children({ extraProps }) : children) : undefined}
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
                            disabled={disabled || expressionHasErrors || !!reservedKeyCollisions.length}
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
                        <Controller 
                            control={control}
                            name="key"
                            render={({ field: { value, onChange, }, }) => {
                                return (
                                    <>
                                        <Label htmlFor="key" error={!disabled && !value}>Key *</Label>
                                        <SelectDataKey
                                            value={`${value || ''}`}
                                            disabled={isKeyDisabled}
                                            onChange={([item]) => {
                                                onChange(item.name);
                                                setValue('name', item?.label, { shouldDirty: true, });
                                                setValue('keyId', item?.uniqueKey, { shouldDirty: true, });
                                            }}
                                        />
                                        {!!reservedKeyCollisions.length && (
                                            <p className="mt-1 text-xs text-destructive">{reservedKeyCollisions[0].message}</p>
                                        )}
                                    </>
                                );
                            }}
                        />
                    </div>

                    <div>
                        <Label error={!disabled && !name} htmlFor="name">Name *</Label>
                        <Input
                            {...register('name', { disabled: isKeyDisabled, required: true, })}
                            name="name"
                            error={!disabled && !name}
                        />
                    </div>

                    <div>
                        <Label htmlFor="weight">Weight </Label>
                        <Input
                            {...register('weight', { disabled, })}
                            name="weight"
                            type="number"
                        />
                        <span className="text-xs text-muted-foreground">Must be in the range: 0.0 - 1.0 (<b>default 1.0</b>)</span>
                    </div>

                    <div>
                        <Label htmlFor="expression">Sign/Risk expression <ConditionalExpressionModal /></Label>
                        <Controller
                            control={control}
                            name="expression"
                            render={({ field: { value, onChange } }) => (
                                <ConditionEditor
                                    value={`${value || ''}`}
                                    onChange={onChange}
                                    keys={conditionKeys}
                                    keysLoading={keysLoading}
                                    unavailableKeys={unavailableOutcomeKeys}
                                    disabled={disabled}
                                    rows={3}
                                    initialValue={`${symptom?.expression || ''}`}
                                    onValidityChange={setExpressionHasErrors}
                                />
                            )}
                        />
                        <span className="text-xs text-muted-foreground">Example: <b>{CONDITIONAL_EXP_EXAMPLE}</b></span>
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
