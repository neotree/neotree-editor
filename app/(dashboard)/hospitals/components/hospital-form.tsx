'use client';

import { MenuIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import axios from 'axios';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { getHospital, saveHospitals } from "@/app/actions/hospitals";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "@/hooks/use-search-params";
import { getRoles } from "@/app/actions/roles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Loader } from "@/components/loader";
import { useEffectOnce } from '@/hooks/use-effect-once';
import { useEffectIfMounted } from "@/hooks/use-effect-if-mounted";
import { useMount } from "react-use";

type Role = Awaited<ReturnType<typeof getRoles>>[0]['name'];

type Props = {
    open?: boolean;
    hospitalId?: string;
    getHospital: typeof getHospital;
    saveHospitals: typeof saveHospitals;
    onClose?: () => void;
    onSaveSuccess?: () => Promise<any>;
};

export function HospitalForm({ 
    open, 
    hospitalId, 
    getHospital, 
    onClose, 
    saveHospitals,
    onSaveSuccess,
}: Props) {
    const mounted = useRef(false);

    const { alert } = useAlertModal();
    const { parsed, replace: searchParamsReplace } = useSearchParams();

    const updateHospitalId = hospitalId || parsed.hospitalId;

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [, setHospital] = useState<Awaited<ReturnType<typeof getHospital>>['data']>();

    const {
        setValue,
        register,
        handleSubmit,
    } = useForm({
        defaultValues: {
            id: null as number | null,
            hospitalId: updateHospitalId || uuidv4(),
            name: '',
        },
    });

    const load = useCallback(async () => {
        if (updateHospitalId) {
            setLoading(true);
            try {
                // const { data: hospital, errors } = await getHospital({ hospitalId: updateHospitalId, });

                // TODO: Replace with server actions
                const res = await axios.get<Awaited<ReturnType<typeof getHospital>>>('/api/hospitals/' + updateHospitalId);
                const { data: hospital, errors } = res.data;

                const error = errors?.join?.(', ');

                if (error) throw error;

                setHospital(hospital);
                if (hospital) {
                    setValue('id', hospital.id);
                    setValue('hospitalId', hospital.hospitalId);
                    setValue('name', hospital.name);
                }
            } catch(e: any) {
                alert({
                    title: '',
                    message: 'Failed to load hospital: ' + e.message,
                    variant: 'error',
                    onClose: () => searchParamsReplace({ hospitalId: undefined, }),
                });
            } finally {
                setLoading(false);
            }
        }
    }, [updateHospitalId, searchParamsReplace, alert, setValue, getHospital]);

    // useEffectIfMounted(() => { load(); });

    useEffect(() => {
        if (!mounted.current) load();
        mounted.current = true;
    }, [load])

    const onSave = handleSubmit(data => {
        (async () => {
            try {
                setSubmitting(true);

                const payload: Parameters<typeof saveHospitals>[0] = [{
                    ...data,
                    id: data.id || undefined,
                }];

                // TODO: Replace with server actions
                const res = await axios.post<Awaited<ReturnType<typeof saveHospitals>>>('/api/hospitals/save', { data: payload, });
                const { errors } = res.data;

                if (errors?.length) throw new Error(errors.join(', '));
                
                if (onSaveSuccess) await onSaveSuccess();
    
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
            {submitting && <Loader overlay />}
            
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
