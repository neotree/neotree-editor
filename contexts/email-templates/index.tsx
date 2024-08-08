'use client';

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";

import { useAlertModal } from "@/hooks/use-alert-modal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import * as serverActions from '@/app/actions/email-templates';

export interface IEmailTemplatesContext extends  
EmailTemplatesContextProviderProps,
ReturnType<typeof useEmailTemplatesContentHook>
{}

export const EmailTemplatesContext = createContext<IEmailTemplatesContext>(null!);

export const useEmailTemplatesContext = () => useContext(EmailTemplatesContext);

type EmailTemplatesContextProviderProps = typeof serverActions & {
    emailTemplates: Awaited<ReturnType<typeof serverActions['getEmailTemplates']>>;
};

export function EmailTemplatesContextProvider({ 
    children, 
    ...props
}: EmailTemplatesContextProviderProps & {
    children: React.ReactNode;
}) {
    const hook = useEmailTemplatesContentHook(props);

    return (
        <EmailTemplatesContext.Provider
            value={{
                ...props,
                ...hook,
            }}
        >
            {children}
        </EmailTemplatesContext.Provider>
    );
}

function useEmailTemplatesContentHook({
    saveEmailTemplates,
    deleteEmailTemplates,
}: EmailTemplatesContextProviderProps) {
    const router = useRouter();
    
    const [activeItemId, setActiveItemId] = useState<number>();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);

    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();

    const onFormOpenChange = useCallback((open: boolean) => {
        if (open && activeItemId) {
            // do nothing
        } else {
            setIsFormOpen(open);
        }
        if (!open) setActiveItemId(undefined);
    }, [activeItemId]);

    const onSave: typeof saveEmailTemplates = useCallback(async (...args) => {
        setSaving(true);

        const res = await saveEmailTemplates(...args);

        if (res.errors?.length) {
            alert({
                title: 'Error',
                message: res.errors.join(', '),
                variant: 'error',
            });
        } else {
            onFormOpenChange(false);
            router.refresh();
            alert({
                title: 'Success',
                message: 'Email templates saved successfully!',
                variant: 'success',
            });
        }

        setSaving(false);

        return res;
    }, [saveEmailTemplates, alert, onFormOpenChange, router]);

    const onDelete = useCallback(async (ids: number[]) => {
        confirm(async () => {
            setLoading(true);

            const res = await deleteEmailTemplates({ ids });

            if (res.errors?.length) {
                alert({
                    title: 'Error',
                    message: res.errors.join(', '),
                    variant: 'error',
                });
            } else {
                onFormOpenChange(false);
                setSelected([]);
                router.refresh();
                alert({
                    title: 'Success',
                    message: 'Email templates deleted successfully!',
                    variant: 'success',
                });
            }

            setLoading(false);
        }, {
            danger: true,
            title: 'Delete email templates',
            message: 'Are you sure you want to delete email templates?',
            positiveLabel: 'Yes, delete',
        });
    }, [deleteEmailTemplates, confirm, alert, router]);

    return {
        saving,
        isFormOpen,
        activeItemId,
        loading, 
        selected,
        setSelected,
        setLoading,
        setActiveItemId,
        setSaving,
        onFormOpenChange,
        onSave,
        onDelete,
    };
}
