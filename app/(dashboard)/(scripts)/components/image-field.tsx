import { Plus, Trash } from "lucide-react";
import { useMeasure } from "react-use";
import queryString from "query-string";

import { Button } from "@/components/ui/button";
import { ScriptImage } from "@/types";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { Image } from "@/components/image";
import { useFiles } from "@/hooks/use-files";

export type ImageFieldProps = {
    image: null | ScriptImage;
    disabled?: boolean;
    onChange: (image: null | ScriptImage) => void;
};

export function ImageField({ image, disabled, onChange }: ImageFieldProps) {
    const filesState = useFiles();

    const [containerRef, { width: containerWidth, }] = useMeasure<HTMLDivElement>();
    const { confirm } = useConfirmModal();

    const q = `${image?.data || ''}`.split('?').filter((_, i) => i).join('');
    const { width, height } = queryString.parse(q);

    return (
        <>
            <div ref={containerRef} className="flex flex-col gap-y-2 min-w-60 max-w-60">
                <div className="w-full flex flex-col items-center justify-center min-h-28">
                    <Image 
                        alt=""
                        width={Number(width || '0')}
                        height={Number(height || '0')}
                        containerWidth={containerWidth}
                        src={image?.data || '/images/placeholder.png'}
                    />
                </div>

                <div className="flex items-center justify-center gap-x-4">
                    <Button
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        disabled={disabled}
                        onClick={() => filesState.openModal({
                            onSelectFiles([file]) {
                                onChange({
                                    data: file.url,
                                    fileId: file.fileId,
                                    filename: file.filename!,
                                    size: file.size!,
                                    contentType: file.contentType!,
                                });
                            },
                        })}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>

                    {!!image && (
                        <Button
                            variant="destructive"
                            size="icon"
                            className="w-8 h-8 rounded-full"
                            disabled={disabled}
                            onClick={() => confirm(() => onChange(null), {
                                title: 'Delete image',
                                message: 'Are you sure you want to delete this image?',
                                danger: true,
                            })}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
