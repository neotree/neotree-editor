'use client';

import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMailerContext } from "@/contexts/mailer";
import { XIcon } from "lucide-react";

export function TestEmailForm() {
    const { testEmailForm, onSendTestMail, setTestEmailForm, } = useMailerContext();

    if (!testEmailForm) return null;

    return (
        <>
            <Modal
                open
                onOpenChange={() => setTestEmailForm(undefined)}
                title="Send test email"
                actions={(
                    <>
                        <div className="flex-1" />

                        <Button
                            variant="ghost"
                            onClick={() => setTestEmailForm(undefined)}
                        >
                            Cancel
                        </Button>

                        <Button
                            disabled={!testEmailForm.toEmails?.filter(e => e)?.length}
                            onClick={() => onSendTestMail()}
                        >
                            Send email
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col gap-y-4">
                    <div>
                        <Label htmlFor="email">Email addresses</Label>
                        {testEmailForm.toEmails.map((e, i) => (
                            <div
                                key={i}
                                className="mb-1 flex items-center gap-x-2"
                            >
                                <Input
                                    className="flex-1"
                                    value={e}
                                    name={"email"+1}
                                    type="email"
                                    onChange={e => setTestEmailForm(prev => !prev ? undefined : {
                                        ...prev,
                                        toEmails: prev.toEmails.map((em, j) => i === j ? e.target.value : em),
                                    })}
                                />
                                {testEmailForm.toEmails.length > 1 && (
                                    <a
                                        href="#"
                                        onClick={e => {
                                            e.preventDefault();
                                            setTestEmailForm(prev => !prev ? undefined : ({ ...prev, toEmails: prev.toEmails.filter((_, j) => i !== j) }))
                                        }}
                                    >
                                        <XIcon className="h-4 w-4 text-muted-foreground hover:text-danger" />
                                    </a>
                                )}
                            </div>
                        ))}
                        <a 
                            href="#" 
                            className="text-xs text-muted-foreground hover:text-primary"
                            onClick={e => {
                                e.preventDefault();
                                setTestEmailForm(prev => !prev ? undefined : ({ ...prev, toEmails: [...prev.toEmails, ''] }))
                            }}
                        >Add another email address</a>
                    </div>
                </div>
            </Modal>
        </>
    );
}
