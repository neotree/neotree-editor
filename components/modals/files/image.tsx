import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import axios from 'axios';

import { Skeleton } from "@/components/ui/skeleton"
import { Image as ImageComponent, ImageProps } from "@/components/image";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useFiles, FilesStore } from '@/hooks/use-files';
import { Trash2Icon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import type { GetFileReferencesResponse } from '@/databases/queries/files';
import { useAlertModal } from '@/hooks/use-alert-modal';
import { Loader } from '@/components/loader';
import { DeleteAndReplaceFiles, DeleteAndReplaceFilesResponse } from '@/databases/mutations/files';

type tFile = FilesStore['files'][0];

export function Image({ file, ...props }: ImageProps & {
    file: tFile
}) {
    const [loaded, setLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { 
        selectMultiple, 
        deleteState, 
        setDeleteState, 
        onSelectFiles, 
        closeModal, 
    } = useFiles();

    const onSelect = useCallback(() => {
        if (deleteState) {
            setDeleteState(deleteState.fileId, file.fileId);
        } else {
            if (!onSelectFiles) return;
            onSelectFiles([file]);
            if (!selectMultiple) closeModal();
        }
    }, [onSelectFiles, setDeleteState, deleteState, file]);

    const img = (
        <ImageComponent 
            {...props}
            onLoad={() => setLoaded(true)}
            className={clsx(!loaded && 'hidden opacity-0', props.className)}
        />
    );

    return (
        <>
            {!loaded && <Skeleton className="h-24" />}
            <Dialog
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            >
                <div
                    className={cn(
                        'relative', 
                        '[&_div:last-child]:transition-opacity',
                        !deleteState && '[&_div:last-child]:opacity-0', 
                        '[&:hover_div:last-child]:opacity-100',
                    )}
                >
                    {img}
                    <div 
                        className="
                            absolute 
                            top-0 
                            left-0 
                            w-full 
                            h-full 
                            bg-white/80
                            dark:bg-black/80
                            flex
                            items-center
                            justify-center
                        "
                    >
                        <div className="flex flex-wrap gap-2">
                            {!!onSelectFiles && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => onSelect()}
                                >
                                    Select {!!deleteState && 'replacement'}
                                </Button>
                            )}

                            <DialogTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                >
                                    View
                                </Button>
                            </DialogTrigger>

                            <DeleteBtn file={file} />
                        </div>
                    </div>
                </div>

                <DialogContent 
                    hideCloseButton
                    className="px-0 py-0 flex flex-col w-full max-w-xl max-h-[80%]"
                >
                    <DialogHeader className="p-0 m-0 h-0 overflow-hidden">
                        <DialogTitle>{''}</DialogTitle>
                        <DialogDescription>{''}</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-4 py-2">
                        {img}
                    </div>

                    <DialogFooter className="px-4 py-2">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >
                                Close
                            </Button>
                        </DialogClose>

                        {!!onSelectFiles && (
                            <DialogClose asChild>
                                <Button
                                    onClick={() => onSelect()}
                                >
                                    Select {!!deleteState && 'replacement'}
                                </Button>
                            </DialogClose>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function DeleteBtn({ file, }: {
    file: tFile;
}) {
    const [loading, setLoading] = useState(false);
    const { deleteState, setDeleteState, getFiles, } = useFiles();
    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();

    const deleteFile = useCallback((params?: typeof deleteState) => {
        const state = params || deleteState;

        if (!state) return;

        confirm(
            () => (async () => {
                setLoading(true);
                try {
                    const payload: DeleteAndReplaceFiles = {
                        broadcastAction: true,
                        items: [
                            {
                                deleteId: state.fileId,
                                replaceWithId: state.replaceWithFileId,
                            },
                        ],
                    };

                    const res = await axios.post<DeleteAndReplaceFilesResponse>(`/api/files/delete-and-replace`, payload);
                    const { errors } = res.data;

                    if (errors?.length) {
                        alert({
                            variant: 'error',
                            title: 'Error',
                            message: errors.join(' \n'),
                        });
                        return;
                    }

                    useFiles.setState(prev => ({
                        ...prev,
                        files: prev.files.filter(f => f.fileId !== state.fileId),
                    }));

                    setDeleteState(undefined);

                    alert({
                        variant: 'success',
                        title: 'Success',
                        message: 'File was delete successfully!',
                    });
                } catch(e: any) {
                    alert({
                        variant: 'error',
                        title: 'Error',
                        message: e.message,
                    });
                } finally {
                    setLoading(false);
                }
            })(),
            {
                danger: true,
                title: 'Delete file',
                positiveLabel: 'Yes, delete',
                onDeny: () => setDeleteState(undefined),
                message: `
                    <p class="text-xl">Are you sure?</p>
                    <div class="flex gap-4 [&>div]:flex-1 [&>div]:w-1/2">
                        ${!state?.fileId ? '' : `
                            <div>
                                <p class="text-center text-lg">Delete</p>
                                <img 
                                    class="w-full h-auto"
                                    alt=""
                                    src="${window.location.origin}/files/${state.fileId}"
                                />
                            </div>
                        `}

                        ${!state?.replaceWithFileId ? '' : `
                            <div>
                                <p class="text-center text-lg">Replace with</p>
                                <img 
                                    class="w-full h-auto"
                                    alt=""
                                    src="${window.location.origin}/files/${state.replaceWithFileId}"
                                />
                            </div>
                        `}
                    </div>
                `,
            }
        );
    }, [file, deleteState, setDeleteState, confirm, alert]);

    const onDeleteClick = useCallback(async () => {
        try {
            setLoading(true);
            
            const res = await axios.get<GetFileReferencesResponse>(`/api/files/${file.fileId}/references`);
            const { data, errors } = res.data;

            if (errors?.length) {
                alert({
                    variant: 'error',
                    title: 'Error',
                    message: errors.join(' \n'),
                });
                return;
            }

            if (data.length) {
                confirm(() => {}, {
                    danger: true,
                    title: 'Delete file',
                    message: 'File is referenced in other places, please select a replacement file.',
                    onDeny: () => setDeleteState(undefined),
                });
                setDeleteState(file.fileId);
            } else {
                deleteFile({ fileId: file.fileId, });
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
    }, [file, setDeleteState, confirm, alert, deleteFile]);

    useEffect(() => {
        if (deleteState?.replaceWithFileId) {
            deleteFile();
        }
    }, [deleteState?.replaceWithFileId, deleteFile]);

    return (
        <>
            {!deleteState?.fileId ? (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onDeleteClick}
                >
                    <Trash2Icon className="w-4 h-4" />
                </Button>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteState(undefined)}
                >
                    <XIcon className="w-4 h-4" />
                </Button>
            )}

            {loading && <Loader overlay />}
        </>
    );
}
