'use client';

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Edit2, MoreHorizontal, Save } from "lucide-react";
import CodeEditor, { TextareaCodeEditorProps } from '@uiw/react-textarea-code-editor';

import { getSession } from "@/app/actions/sessions";
import { getScript, getScreens, getDiagnoses } from "@/app/actions/scripts";
import { Button } from "@/components/ui/button";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Container } from "./container";
import { SessionFormSidebar } from "./session-form-sidebar";

type Props = {
    session: Awaited<ReturnType<typeof getSession>>;
    script: Awaited<ReturnType<typeof getScript>>;
    screens: Awaited<ReturnType<typeof getScreens>>;
    diagnoses: Awaited<ReturnType<typeof getDiagnoses>>;
    getSession: typeof getSession;
};

export function SessionForm(props: Props) {
    const { session, script, diagnoses, screens, } = props;

    const { theme } = useTheme();
    const { confirm } = useConfirmModal();

    const [form, setForm] = useState(JSON.stringify(session.data, null, 4));
    const [disabled, setDiabled] = useState(true);
    const [deskopSidebarHidden, setDesktopSidebarHidden] = useState(false);
    const [tab, setTab] = useState('screens');

    const isFormDirty = useMemo(() => form !== JSON.stringify(session.data, null, 4), [session.data, form]);

    return (
        <>
            <Container
                header={(
                    <>
                        <div>
                            UID: {session.data!.uid}
                        </div>

                        <div className="flex-1" />

                        {disabled ? (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => setDiabled(false)}
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="link"
                                    className="text-danger hover:text-danger"
                                    onClick={() => {
                                        const cancel = () => {
                                            setDiabled(true);
                                            setForm(JSON.stringify(session.data, null, 4));
                                        }
                                        if (!isFormDirty) {
                                            cancel()
                                        } else {
                                            confirm(cancel, {
                                                danger: true,
                                                title: 'Cancel',
                                                message: 'Are you sure you want to cancel? Your changes will be lost!',
                                                positiveLabel: 'Yes, cancel',
                                            })
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>

                                <Button>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                </Button>
                            </>
                        )}

                        {deskopSidebarHidden && (
                            <div className="hidden md:block">
                                <Button
                                    variant="ghost"
                                    className="text-primary"
                                    onClick={() => setDesktopSidebarHidden(false)}
                                >
                                    <MoreHorizontal className="h-6 w-6" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            >
                {!deskopSidebarHidden && (
                    <SessionFormSidebar 
                        {...props}
                        onX={() => setDesktopSidebarHidden(true)}
                    />
                )}

                <div className="md:pr-[350px]">
                    <CodeEditor
                        value={form}
                        language="json"
                        placeholder="Enter JSON"
                        onChange={(evn) => setForm(evn.target.value)}
                        padding={15}
                        disabled={disabled}
                        data-color-mode={(theme || 'light') as TextareaCodeEditorProps['data-color-mode']}
                        style={{
                            fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                        }}
                    />
                </div>
            </Container>
        </>
    );
}
