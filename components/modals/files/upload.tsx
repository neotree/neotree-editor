'use client';

import { useCallback, useState, } from "react";
import { v4 } from "uuid";
import { File, Upload } from 'lucide-react';
import { useMeasure } from "react-use";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { getImageDimensions } from "@/lib/image";
import { Image } from "@/components/image";
import { DialogFooter } from "@/components/ui/dialog";
import { uploadFile } from "@/app/actions/files";
import { useFiles } from "@/hooks/use-files";

type Props = {
    type?: string;
    fileDetails?: { [key: string]: any; };
    inputProps?: React.HTMLProps<HTMLInputElement>;
    onUpload?: (data: Awaited<ReturnType<typeof uploadFile>>) => void;
};

type FileState = { 
    fileId: string;
    url: string; 
    imageURL?: string;
    videoURL?: string;
    file: File; 
    metadata: { [key: string]: any; };
};

export function UploadForm({
    type,
    inputProps,
    fileDetails,
    onUpload,
}: Props) {
    const { getFiles } = useFiles();
    const [containerRef, { width: containerWidth, }] = useMeasure<HTMLDivElement>();
    
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<FileState[]>([]);
    const [uploading, setUploading] = useState(false);

    const { alert } = useAlertModal();

    const onUploadClick = useCallback(async () => {
        const queue = inputProps?.multiple ? files : [files[0]];
        try {
            setUploading(true);
            for (const { file, metadata, fileId } of queue) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('fileId', fileId || v4());
                formData.append('filename', file.name);
                formData.append('contentType', file.type);
                formData.append('size', `${file.size}`);

                formData.append('metadata', JSON.stringify({ ...metadata }));
                
                if (fileDetails) {
                    Object.keys(fileDetails).forEach(key => {
                        const value = fileDetails[key] as any;
                        formData.append(key, JSON.stringify(value))
                    });
                }

                const response = await axios.post<Awaited<ReturnType<typeof uploadFile>>>('/api/files/upload', formData);
                const res = response.data;

                await getFiles();

                onUpload?.(res);
            }
            setOpen(false);
            setFiles([]);
            alert({
                title: 'Success',
                message: `File${queue.length > 1 ? 's' : ''} uploaded successfully!`,
                variant: 'success',
            });
        } catch(e: any) {
            alert({
                title: 'Error',
                message: `Failed to upload file${queue.length > 1 ? 's' : ''}: ${e.message}`,
                variant: 'error',
            });
        } finally {
            setUploading(false);
        }
    }, [onUpload, alert, getFiles, files, inputProps?.multiple, fileDetails]);

    const onInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const files: File[] = [];

            // extract files from the change event
            if (e.target.files?.length) {
                for (let i = 0; i < e.target.files.length; i++) {
                    files.push(e.target.files[i]);
                }
            }

            const filesState: FileState[] = [];

            for (const f of files) {
                const url = URL.createObjectURL(f);
                let imageURL, videoURL;
                let metadata = {};

                // generate image metadata
                if (`${f.type}`.includes('image')) {
                    try {
                        const dimensions = await getImageDimensions(url);
                        metadata = { ...metadata, ...dimensions, };
                        imageURL = url;
                    } catch(e) { /**/ }
                }

                filesState.push({
                    fileId: v4(),
                    file: f,
                    url,
                    imageURL,
                    videoURL,
                    metadata,
                });
            }

            setFiles(filesState);
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
            });
        }
    }, [alert]);

    return (
        <>
            {uploading && <Loader overlay />}

            <div className="p-4 flex-1 overflow-y-auto" ref={containerRef}>
                {(files.length === 1) && files.map(f => {
                    let component = <File className="w-20 h-20 text-muted-foreground" />;

                    if (f.imageURL) {
                        component = (
                            <Image 
                                alt=""
                                width={f.metadata.width || 0}
                                height={f.metadata.height || 0}
                                containerWidth={containerWidth}
                                src={f.imageURL || '/images/placeholder.png'}
                            />
                        );
                    }
                    
                    return (
                        <div
                            key={f.fileId}
                            className={cn(
                                `
                                    flex
                                    flex-col
                                    gap-y-2
                                    w-full
                                    items-center
                                    justify-center
                                    text-xs
                                `,
                                !(f.imageURL || f.videoURL) && '',
                            )}
                        >
                            {component}
                            <span>{f.file.name}</span>
                        </div>
                    )
                })}

                {!files.length && (
                    <div 
                        className={cn(
                            `
                                relative
                                w-full
                                h-36
                                bg-primary/20
                                flex
                                flex-col
                                items-center
                                justify-center
                                text-primary
                                uppercase
                                font-bold
                                rounded-md
                                transition-colors
                                hover:bg-primary/30
                            `,
                            !!files.length && 'hidden',
                        )}
                    >
                        <div>{inputProps?.placeholder || 'Choose file'}</div>
                        <input 
                            {...inputProps}
                            type="file"
                            accept={type}
                            value=""
                            className={cn(
                                `
                                    absolute
                                    left-0
                                    top-0
                                    w-full
                                    h-full
                                    opacity-0
                                `,
                            )}
                            onChange={onInputChange}
                        />
                    </div>
                )}
            </div>

            <DialogFooter className="px-4 py-4">
                {!files.length && <div className="flex-1" />}

                <Button
                    variant="ghost"
                    onClick={() => setOpen(false)}
                >
                    Cancel
                </Button>

                {!!files.length && (
                    <>
                        <div className="flex-1" />

                        <Button
                            variant="destructive"
                            onClick={() => setFiles([])}
                        >
                            Clear
                        </Button>

                        <Button
                            disabled={!files.length}
                            onClick={() => onUploadClick()}
                            className={cn(!files.length && 'hidden')}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            <span>Upload</span>
                        </Button>
                    </>
                )}
            </DialogFooter>
        </>
    );
}
