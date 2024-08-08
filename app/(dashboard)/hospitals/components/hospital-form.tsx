'use client';

import { MenuIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { v4 } from "uuid";
import { useForm } from "react-hook-form";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { getHospital, updateHospitals, createHospitals } from "@/app/actions/hospitals";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "@/hooks/use-search-params";
import { getRoles } from "@/app/actions/roles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Loader } from "@/components/loader";
import { useEffectOnce } from '@/hooks/use-effect-once';

type Role = Awaited<ReturnType<typeof getRoles>>[0]['name'];

type Props = {
    open?: boolean;
    hospitalId?: string;
    getHospital: typeof getHospital;
    updateHospitals: typeof updateHospitals;
    createHospitals: typeof createHospitals;
    onClose?: () => void;
    onSaveSuccess?: () => Promise<any>;
};

export function HospitalForm({ 
    open, 
    hospitalId, 
    getHospital, 
    onClose, 
    updateHospitals,
    createHospitals,
    onSaveSuccess,
}: Props) {
    const { alert } = useAlertModal();
    const { parsed, replace: searchParamsReplace } = useSearchParams();

    const updateHospitalId = hospitalId || parsed.hospitalId;

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [, setHospital] = useState<Awaited<ReturnType<typeof getHospital>>>();

    const {
        setValue,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            hospitalId: updateHospitalId || v4(),
            name: '',
        },
    });

    const load = useCallback(() => {
        if (updateHospitalId) {
            setLoading(true);
            getHospital(updateHospitalId)
                .then(u => {
                    setHospital(u);
                    if (u) {
                        setValue('hospitalId', u.hospitalId);
                        setValue('name', u.name);
                    }
                })
                .catch(e => alert({
                    title: '',
                    message: 'Failed to load hospital: ' + e.message,
                    variant: 'error',
                    onClose: () => searchParamsReplace({ hospitalId: undefined, }),
                }))
                .finally(() => setLoading(false));
        }
    }, [updateHospitalId, searchParamsReplace, alert, setValue, getHospital]);

    useEffectOnce(load);

    const onSave = handleSubmit(data => {
        (async () => {
            try {
                setSubmitting(true);
    
                if (updateHospitalId) {
                    await updateHospitals([{ hospitalId: updateHospitalId, data }]);
                    if (onSaveSuccess) await onSaveSuccess();
                } else {
                    await createHospitals([data]);
                    if (onSaveSuccess) await onSaveSuccess();
                }
    
                alert({
                    variant: 'success',
                    message: 'Hospital was saved successfully!',
                    onClose: () => {
                        onClose?.();
                        searchParamsReplace({ hospitalId: undefined, });
                    },
                });
            } catch(e: any) {
                alert({
                    title: '',
                    message: 'Failed to save hospital: ' + e.message,
                    variant: 'error',
                });
            } finally {
                setSubmitting(false);
            }
        })();
    });

    if (loading) return <Loader overlay />;

    return (
        <>
            <Sheet
                open={open || !!parsed.hospitalId}
                onOpenChange={() => {
                    onClose?.();
                    searchParamsReplace({ hospitalId: undefined, });
                }}
            >
                <SheetTrigger asChild>
                    <Button
                        className="md:hidden"
                        variant="ghost"
                    >
                        <MenuIcon className="h-6 w-6" />
                    </Button>
                </SheetTrigger>

                <SheetContent 
                    side="right"
                    className="p-0 m-0 flex flex-col"
                >
                    <SheetHeader className="py-2 px-4 border-b border-b-border">
                        <SheetTitle>{updateHospitalId ? 'Edit' : 'New'} Hospital</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col py-2 px-4 gap-y-4 overflow-y-auto">
                        <div>
                            <Label htmlFor="name">Hospital Name</Label>
                            <Input 
                                {...register('name', { required: true, disabled: submitting, })}
                                placeholder="Hospital Name"
                                className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                            />
                        </div>
                    </div>

                    <div className="border-t border-t-border px-4 py-2 flex justify-end gap-x-2">
                        <SheetClose asChild>
                            <Button
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </SheetClose>

                        <Button
                            onClick={onSave}
                        >
                            Save
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
