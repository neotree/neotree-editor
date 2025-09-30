'use client';

import { useCallback, useState } from "react";
import axios from "axios";

import { useAppContext } from "@/contexts/app";
import { Button } from "@/components/ui/button";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Loader } from "@/components/loader";
import { Dialog, DialogDescription, DialogHeader, DialogContent, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import ucFirst from "@/lib/ucFirst";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Props = {
    variant: 'publish' | 'discard';
};

const scopeOptions = [
    { label: 'my changes only', value: '0', },
    { label: 'everything', value: '1', },
];

export function PublishDrafts({ variant, }: Props) {
    const { alert } = useAlertModal();
    const [loading, setLoading] = useState(false);
    const [scope, setScope] = useState<'0' | '1'>('0');

    const { publishData: _publishData, discardDrafts: _discardDrafts, } = useAppContext();

    const publishData = useCallback(async () => {
        try {
            setLoading(true);

            // const res = await _publishData();

            // TODO: Replace this with server action
            const response = await axios.post('/api/ops/publish-data', {
                scope: Number(scope),
            } satisfies Parameters<typeof _publishData>[0]);
            const res = response.data as Awaited<ReturnType<typeof _publishData>>;

            if (res.errors) {
                alert({
                    variant: 'error',
                    title: 'Failed to publish data',
                    message: res.errors.map(e => `<div class="mb-1 text-sm text-danger">${e}</div>`).join(''),
                });
            } else {
                alert({
                    variant: 'success',
                    title: 'Success',
                    message: 'Data published successfully!',
                    onClose: () => window.location.reload(),
                });
            }
        } catch(e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: e.message,
            });
        } finally {
            setLoading(false);
        }
    }, [scope, _publishData, alert]);

    const discardDrafts = useCallback(async () => {
        try {
            setLoading(true);

            // const res = await _discardDrafts();

            // TODO: Replace this with server action
            const response = await axios.post('/api/ops/discard-drafts', {
                scope: Number(scope),
            } satisfies Parameters<typeof _discardDrafts>[0]);
            const res = response.data as Awaited<ReturnType<typeof _discardDrafts>>;

            if (res.errors) {
                alert({
                    variant: 'error',
                    title: 'Failed to discard changes',
                    message: res.errors.map(e => `<div class="mb-1 text-sm text-danger">${e}</div>`).join(''),
                });
            } else {
                alert({
                    variant: 'success',
                    title: 'Success',
                    message: 'Data discarded successfully!',
                    onClose: () => window.location.reload(),
                });
            }
        } catch(e: any) {
            alert({
                variant: 'error',
                title: 'Error',
                message: e.message,
            });
        } finally {
            setLoading(false);
        }
    }, [scope, _discardDrafts, alert]);

    const trigger = variant === 'discard' ? (
        <Button
            variant="destructive"
            className="h-auto text-xs px-2 py-1"
        >
            Discard changes
        </Button>
    ) : (
        <Button className="h-auto text-xs px-4 py-1">
            Publish
        </Button>
    )

    return (
        <>
            {loading && <Loader overlay />}

            <Dialog>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ucFirst(variant)} data</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>

                    <div>
                        <RadioGroup
                            defaultValue={scopeOptions[0].value}
                            onValueChange={value => setScope(value as typeof scope)}
                            className="flex flex-col gap-y-4"
                        >
                            {scopeOptions.map(t => (
                                <div key={t.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={t.value} id={t.value} />
                                    <Label secondary htmlFor={t.value}>{ucFirst(variant)} {t.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DialogClose>

                        <Button
                            variant={variant === 'discard' ? 'destructive' : undefined}
                            onClick={variant === 'discard' ? discardDrafts : publishData}
                        >
                            {ucFirst(variant)} data
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
