'use client';

import { useMemo, useState } from "react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { loadData } from "./_data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/data-table";

export function FilesTable({ data }: {
    data: Awaited<ReturnType<typeof loadData>>;
}) {
    console.log('data', data);
    
    const sites = useMemo(() => data.map(item => item.site), [data]);

    const [selectedSiteId, setSelectedSiteId] = useState('all');

    const selectedSite = sites.find(s => s.siteId === selectedSiteId);

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Card className="w-[80%] max-w-[400px]">
                    <CardHeader />
                    <CardContent>
                        <div className="text-xl text-center opacity-50">No data found</div>
                    </CardContent>
                    <CardFooter />
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="h-[64px] border-b border-b-border flex items-center gap-x-2 px-4">
                <div className="mr-auto">File manager</div>
                <div className="w-[200px]">
                    <Select
                        value={selectedSiteId}
                        onValueChange={value => setSelectedSiteId(value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All sites" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All sites</SelectItem>
                            {sites.map(site => {
                                return (
                                    <SelectItem key={site.siteId} value={site.siteId}>
                                        {site.name}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {data.map(({ site, files, }) => {
                    if (selectedSite?.siteId && (selectedSite?.siteId !== site.siteId)) return null;

                    return (
                        <div key={site.siteId} className="border-b border-b-bottom">
                            <DataTable 
                                title={site.name}
                                columns={[
                                    {
                                        name: 'File name',
                                        cellClassName: 'w-[400px]',
                                        cellRenderer({ value }) {
                                            return (
                                                <div className="w-full text-ellipsis">
                                                    {value}
                                                </div>
                                            );
                                        },
                                    },
                                    {
                                        name: 'Type',
                                        cellClassName: 'w-[200px]',
                                        cellRenderer({ value }) {
                                            return (
                                                <div className="w-full text-ellipsis">
                                                    {value}
                                                </div>
                                            );
                                        },
                                    },
                                    {
                                        name: '',
                                        align: 'right',
                                        cellRenderer({ value }) {
                                            return (
                                                <div className="w-[250px]">
                                                    {/* <img 
                                                        alt={`${value || ''}`}
                                                        src={`${site.link}/api/files/${value}`}
                                                        className="w-full h-auto"
                                                    /> */}
                                                </div>
                                            );
                                        },
                                    }
                                ]}
                                data={files.map(f => {
                                    const [_, ...filenameArr] = f.filename.split('__');
                                    const [filename] = filenameArr.join('__').split('?');

                                    return [
                                        filename,
                                        f.contentType,
                                        f.fileId,
                                    ];
                                })}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
