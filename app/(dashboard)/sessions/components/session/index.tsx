'use client';

import { useMemo, useState } from "react";
import CodeEditor, { TextareaCodeEditorProps } from '@uiw/react-textarea-code-editor';

import { getSession } from "@/app/actions/sessions";
import { useTheme } from "next-themes";
import { Container } from "../container";
import { Button } from "@/components/ui/button";
import { Edit2, Save } from "lucide-react";
import { useConfirmModal } from "@/hooks/use-confirm-modal";

type Props = {
    session: Awaited<ReturnType<typeof getSession>>;
    getSession: typeof getSession;
};

export function Session({ session }: Props) {
    const { theme } = useTheme();
    const { confirm } = useConfirmModal();

    const [form, setForm] = useState(JSON.stringify(session.data, null, 4));
    const [disabled, setDiabled] = useState(true);

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
                            <Button
                                variant="ghost"
                                onClick={() => setDiabled(false)}
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
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
                    </>
                )}
            >
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
            </Container>
        </>
    );
}
