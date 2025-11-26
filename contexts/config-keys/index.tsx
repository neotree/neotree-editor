'use client';

import { createContext, useCallback, useContext, useState, useMemo, useEffect, } from "react";
import { useRouter } from "next/navigation";
import { arrayMoveImmutable } from "array-move";

import { useAlertModal } from "@/hooks/use-alert-modal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import * as serverActions from '@/app/actions/config-keys';
import { useAppContext } from "../app";
import { recordPendingDeletionChange } from "@/lib/change-tracker";
import { pendingChangesAPI } from "@/lib/indexed-db";

export interface IConfigKeysContext extends  
ConfigKeysContextProviderProps,
ReturnType<typeof useConfigKeysContentHook>
{}

export const ConfigKeysContext = createContext<IConfigKeysContext>(null!);

export const useConfigKeysContext = () => useContext(ConfigKeysContext);

type ConfigKeysContextProviderProps = typeof serverActions & {
    configKeys: Awaited<ReturnType<typeof serverActions['getConfigKeys']>>;
};

export function ConfigKeysContextProvider({ 
    children, 
    ...props
}: ConfigKeysContextProviderProps & {
    children: React.ReactNode;
}) {
    const hook = useConfigKeysContentHook(props);

    return (
        <ConfigKeysContext.Provider
            value={{
                ...props,
                ...hook,
            }}
        >
            {children}
        </ConfigKeysContext.Provider>
    );
}

export type FormDataType = Parameters<IConfigKeysContext['saveConfigKeys']>[0]['data'][0] & {
    isDraft?: boolean;
    draftCreatedByUserId?: string | null;
};

const getConfigKeyTitle = (item?: FormDataType | null) => item?.label || item?.key || 'Config key';

function useConfigKeysContentHook({
    configKeys: configKeysProp,
    saveConfigKeys,
    deleteConfigKeys,
}: ConfigKeysContextProviderProps) {
    const router = useRouter();

    const { viewOnly, authenticatedUser } = useAppContext();
    
    const [configKeys, setConfigKeys] = useState(configKeysProp);
    const [activeItemId, setActiveItemId] = useState<string>();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);

    const { alert } = useAlertModal();
    const { confirm } = useConfirmModal();

    useEffect(() => { setConfigKeys(configKeysProp); }, [configKeysProp]);

    const onFormOpenChange = useCallback((open: boolean) => {
        if (open && activeItemId) {
            // do nothing
        } else {
            setIsFormOpen(open);
        }
        if (!open) setActiveItemId(undefined);
    }, [activeItemId]);

    const onSave = useCallback(async (data: FormDataType[]) => {
        setSaving(true);

        const res = await saveConfigKeys({ data, broadcastAction: true, });

        if (res.errors?.length) {
            alert({
                title: 'Error',
                message: res.errors.join(', '),
                variant: 'error',
            });
            setSaving(false);
            return false;
        }

        onFormOpenChange(false);
        router.refresh();
        alert({
            title: 'Success',
            message: 'Config keys saved successfully!',
            variant: 'success',
        });

        setSaving(false);
        return true;
    }, [saveConfigKeys, alert, onFormOpenChange, router]);

    const onDelete = useCallback(async (configKeysIds: string[]) => {
        confirm(async () => {
            const _configKeys = { ...configKeys };
            const keysToDelete = configKeys.data.filter(s => s.configKeyId && configKeysIds.includes(s.configKeyId));

            setConfigKeys(prev => ({ ...prev, data: prev.data.filter(s => !configKeysIds.includes(s.configKeyId)) }));
            setSelected([]);

            setLoading(true);

            const res = await deleteConfigKeys({ configKeysIds, broadcastAction: true, });

            if (res.errors?.length) {
                alert({
                    title: 'Error',
                    message: res.errors.join(', '),
                    variant: 'error',
                    onClose: () => setConfigKeys(_configKeys),
                });
            } else {
                await Promise.all(keysToDelete.map(async key => {
                    if (!key?.configKeyId) return;
                    await recordPendingDeletionChange({
                        entityId: key.configKeyId,
                        entityType: "configKey",
                        entityTitle: getConfigKeyTitle(key),
                        snapshot: key,
                        userId: authenticatedUser?.userId,
                        userName: authenticatedUser?.displayName,
                        description: `Marked "${getConfigKeyTitle(key)}" for deletion`,
                    });
                }));
                onFormOpenChange(false);
                setSelected([]);
                router.refresh();
                alert({
                    title: 'Success',
                    message: 'Config keys deleted successfully!',
                    variant: 'success',
                });
            }

            setLoading(false);
        }, {
            danger: true,
            title: 'Delete config keys',
            message: 'Are you sure you want to delete config keys?',
            positiveLabel: 'Yes, delete',
        });
    }, [deleteConfigKeys, confirm, alert, router, configKeys, authenticatedUser?.userId, authenticatedUser?.displayName, onFormOpenChange]);

    const onSort = useCallback(async (oldIndex: number, newIndex: number) => {
        const sorted = arrayMoveImmutable([...configKeys.data], oldIndex, newIndex);

        const payload: { configKeyId: string; position: number; oldPosition: number; snapshot: typeof configKeys.data[number]; }[] = [];

        sorted.forEach((s, i) => {
            const old = configKeys.data[i];
            if (old.position !== s.position) {
                const position = i + 1;
                payload.push({ 
                    configKeyId: s.configKeyId!, 
                    position, 
                    oldPosition: s.position, 
                    snapshot: s,
                });
                sorted[i].position = position;
            }
        });

        if (!payload.length) return;

        setConfigKeys(prev => ({ ...prev, data: sorted, }));

        await Promise.all(payload.map(async ({ configKeyId, position, oldPosition, snapshot }) => {
            if (!configKeyId) return;

            const existingChanges = await pendingChangesAPI.getEntityChanges(configKeyId, "configKey");
            const existingPositionChange = existingChanges.find(change => change.fieldPath === "position");
            const entityTitle = getConfigKeyTitle(snapshot);

            if (existingPositionChange?.id) {
                await pendingChangesAPI.updateChange(existingPositionChange.id, {
                    newValue: position,
                    description: `Position changed from ${existingPositionChange.oldValue ?? oldPosition} to ${position}`,
                    fullSnapshot: { ...snapshot, position },
                });
            } else {
                await pendingChangesAPI.addChange({
                    entityId: configKeyId,
                    entityType: "configKey",
                    entityTitle,
                    action: "update",
                    fieldPath: "position",
                    fieldName: "Position",
                    oldValue: oldPosition,
                    newValue: position,
                    userId: authenticatedUser?.userId,
                    userName: authenticatedUser?.displayName,
                    description: `Position changed from ${oldPosition} to ${position}`,
                    fullSnapshot: { ...snapshot, position },
                });
            }
        }));

        await saveConfigKeys({ 
            data: payload.map(({ configKeyId, position }) => ({ configKeyId, position, })), 
            broadcastAction: true, 
        });
    }, [saveConfigKeys, configKeys, authenticatedUser?.userId, authenticatedUser?.displayName]);

    const activeItem = useMemo(() => !activeItemId ? null : configKeys.data.filter(t => t.configKeyId === activeItemId)[0], [activeItemId, configKeys]);
    const disabled = useMemo(() => viewOnly, [viewOnly]);

    return {
        saving,
        isFormOpen,
        activeItemId,
        loading, 
        selected,
        configKeys,
        activeItem,
        disabled,
        onSort,
        setConfigKeys,
        setSelected,
        setLoading,
        setActiveItemId,
        setSaving,
        onFormOpenChange,
        onSave,
        onDelete,
    };
}
