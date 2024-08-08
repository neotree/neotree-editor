'use client';

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";

import { useAlertModal } from "@/hooks/use-alert-modal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import * as serverActions from '@/app/actions/mailer';

export interface IMailerContext extends  
MailerContextProviderProps,
ReturnType<typeof useMailerContentHook>
{}

export const MailerContext = createContext<IMailerContext>(null!);

export const useMailerContext = () => useContext(MailerContext);

type MailerContextProviderProps = typeof serverActions & {
    mailerSettings: Awaited<ReturnType<typeof serverActions['getMailerSettings']>>;
};

export function MailerContextProvider({ 
    children, 
    ...props
}: MailerContextProviderProps & {
    children: React.ReactNode;
}) {
    const hook = useMailerContentHook(props);

    return (
        <MailerContext.Provider
            value={{
                ...props,
                ...hook,
            }}
        >
            {children}
        </MailerContext.Provider>
    );
}

function useMailerContentHook({
    saveMailerSettings,
    sendMail,
    deleteMailerSettings,
}: MailerContextProviderProps) {
    const router = useRouter();

    const [testEmailForm, setTestEmailForm] = useState<{
        mailerId: number;
        toEmails: string[];
    }>();
    
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

    const onSave: typeof saveMailerSettings = useCallback(async (...args) => {
        setSaving(true);

        const res = await saveMailerSettings(...args);

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
                message: 'Mailer settings saved successfully!',
                variant: 'success',
            });
        }

        setSaving(false);

        return res;
    }, [saveMailerSettings, alert, onFormOpenChange, router]);

    const onDelete = useCallback(async (ids: number[]) => {
        confirm(async () => {
            setLoading(true);

            const res = await deleteMailerSettings({ ids });

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
                    message: 'Mailer settings deleted successfully!',
                    variant: 'success',
                });
            }

            setLoading(false);
        }, {
            danger: true,
            title: 'Delete mailer settings',
            message: 'Are you sure you want to delete mailer settings?',
            positiveLabel: 'Yes, delete',
        });
    }, [deleteMailerSettings, confirm, alert, router]);

    const onSendTestMail = useCallback(async () => {
        if (!testEmailForm) return;

        setLoading(true);

        const res = await sendMail({
            to: testEmailForm.toEmails.filter(s => s),
            subject: 'Neotree test email',
            text: 'This is a test email!',
            html: '<h1>This is a test email!</h1>',
        }, { mailerSettingsId: testEmailForm.mailerId, });

        if (res.errors?.length) {
            alert({
                title: 'Error',
                message: res.errors.join(', '),
                variant: 'error',
            });
        } else {
            alert({
                title: 'Success',
                message: 'Test mail sent successfully!',
                variant: 'success',
                onClose: () => {
                    setTestEmailForm(undefined);
                },
            });
        }

        setLoading(false);
    }, [alert, sendMail, testEmailForm]);

    return {
        saving,
        isFormOpen,
        activeItemId,
        testEmailForm,
        loading, 
        selected,
        setSelected,
        onSendTestMail,
        setLoading,
        setTestEmailForm,
        setActiveItemId,
        setSaving,
        onFormOpenChange,
        onSave,
        onDelete,
    };
}
