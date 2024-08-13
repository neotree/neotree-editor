'use client';

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useScriptsContext, ScriptFormDataType, IScriptsContext } from "@/contexts/scripts";
import { defaultNuidSearchFields } from "@/constants/fields";
import { scriptTypes } from "@/constants";
import { isEmpty } from "@/lib/isEmpty";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { useAppContext } from "@/contexts/app";

export type UseScriptFormParams = {
    formData?: ScriptFormDataType;
    hospitals: Awaited<ReturnType<IScriptsContext['getHospitals']>>['data'];
};

export function useScriptForm(params: UseScriptFormParams) {
    const { formData } = params;

    const { alert } = useAlertModal();
    const { viewOnly, } = useAppContext();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { saveScripts, } = useScriptsContext();

    const getDefaultFormValues = useCallback(() => ({
        position: formData?.position || undefined,
        scriptId: formData?.scriptId || undefined,
        type: formData?.type || scriptTypes[0].value,
        title: formData?.title || '',
        printTitle: formData?.printTitle || '',
        description: formData?.description || '',
        hospitalId: formData?.hospitalId || null,
        exportable: isEmpty(formData?.exportable) ? true : formData?.exportable,
        nuidSearchEnabled: isEmpty(formData?.nuidSearchEnabled) ? false : formData?.nuidSearchEnabled,
        nuidSearchFields: (formData?.nuidSearchFields || []),
    } satisfies ScriptFormDataType), [formData]);

    const form = useForm({
        defaultValues: getDefaultFormValues(),
    });

    const getDefaultNuidSearchFields = useCallback(() => {
        const fields = form.getValues('nuidSearchFields');
        const type = form.getValues('type');
        const enabled = form.getValues('nuidSearchEnabled');
        let _fields = formData?.nuidSearchFields?.length ? formData.nuidSearchFields : (type === 'admission' ? 
            defaultNuidSearchFields.admission : defaultNuidSearchFields.other) as unknown as typeof fields;
        if (!enabled) _fields = [];
        return _fields;
    }, [form, formData?.nuidSearchFields]);

    const { handleSubmit, formState: { dirtyFields, }, } = form;

    const formIsDirty = useMemo(() => !!Object.keys(dirtyFields).length, [dirtyFields]);

    const onSubmit = handleSubmit(async data => {
        setLoading(true);

        const res = await saveScripts({ data: [data], broadcastAction: true, });

        if (res.errors?.length) {
            alert({
                title: 'Error',
                message: res.errors.join(', '),
                variant: 'error',
            });
        } else {
            router.refresh();
            alert({
                title: 'Success',
                message: 'Scripts saved successfully!',
                variant: 'success',
                onClose: () => router.push('/'),
            });
        }

        setLoading(false);
    });

    const disabled = useMemo(() => viewOnly, [viewOnly]);

    return {
        ...params,
        ...form,
        formIsDirty,
        loading,
        disabled,
        setLoading,
        getDefaultFormValues,
        getDefaultNuidSearchFields,
        onSubmit,
    };
}
