'use client';

import { useState } from "react";
import queryString from "query-string";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from '@/components/ui/card';
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Loader } from "@/components/loader";
import { useFiles } from "@/hooks/use-files";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Errors } from "./errors";
import { UploadForm } from "./upload";
import { Image } from "./image";

const tabs = [
    {
        label: 'Files',
        value: 'files',
    },
    {
        label: 'Upload',
        value: 'upload',
    },
];

export function FilesModal() {
    const { isModalOpen, latestResults, loading, files, closeModal } = useFiles();
    const [activeTab, setActiveTab] = useState(tabs[0].value);

    if (!latestResults && loading) return <Loader overlay />;

    return (
        <>
            {loading && <Loader overlay />}

            <Dialog
                open={isModalOpen}
                onOpenChange={closeModal}
            >
                <DialogContent 
                    hideCloseButton
                    className="px-0 py-0 max-w-3xl max-h-[80%] flex flex-col"
                >
                    <Tabs
                        className="w-full [&>div]:w-full"
                        value={activeTab}
                        onValueChange={tab => setActiveTab(tab)}
                    >
                        <TabsList>
                            {tabs.map(t => {
                                return (
                                    <TabsTrigger
                                        key={t.value} 
                                        value={t.value} 
                                        className="flex-1"
                                    >
                                        {t.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </Tabs>

                    <>
                        {activeTab === tabs[0].value && (
                            <>
                                <div className="p-4 flex-1 overflow-y-auto columns-1 sm:columns-2 md:columns-3 gap-4">
                                    {files.map(file => {
                                        const meta = { ...file.metadata, };

                                        return (
                                            <Card key={file.fileId} className="mb-4">
                                                <CardContent className="p-2 transition-all hover:scale-105">
                                                    <div>
                                                        <Image 
                                                            width={meta.width || meta.w}
                                                            height={meta.height || meta.h}
                                                            alt={file.filename}
                                                            src={file.url}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>

                                <DialogFooter>

                                </DialogFooter>
                            </>
                        )}

                        {activeTab === tabs[1].value && (
                            <>
                                <UploadForm 
                                    onUpload={() => setActiveTab(tabs[0].value)}
                                    type="image/*"
                                />
                            </>
                        )}
                    </>
                </DialogContent>
            </Dialog>

            <Errors />
        </>
    )
}
