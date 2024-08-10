'use client';

import { useState } from "react";

import { getScript, getScreens, getDiagnoses } from "@/app/actions/scripts";
import { Tabs } from "@/components/tabs";
import { DataTable } from "@/components/data-table";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    script: Awaited<ReturnType<typeof getScript>>;
    screens: Awaited<ReturnType<typeof getScreens>>;
    diagnoses: Awaited<ReturnType<typeof getDiagnoses>>;
    onX?: () => void;
};

export function SessionFormSidebar(props: Props) {
    return (
        <>
            <div 
                className={cn(
                    'hidden overflow-y-auto md:flex md:flex-col md:gap-y-4 fixed top-14 right-0 bottom-0 bg-background w-[350px]',
                    'border-l border-l-border',
                )}
            >
                <div className="px-4 py-2 flex justify-end border-b border-b-border">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full"
                        onClick={props.onX}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <SessionFormSidebarComponent 
                    {...props}
                />
            </div>
        </>
    );
}

function SessionFormSidebarComponent({ script, diagnoses, screens, }: Props) {
    const [tab, setTab] = useState('screens');

    if (!script.data) {
        return (
            <div className="p-4">
                <Card>
                    <CardContent
                        className={cn(
                            'p-4 text-xl text-center text-danger bg-danger/10',
                            'flex flex-col justify-center items-center'
                        )}
                    >
                        <AlertCircle className="w-12 h-12" />
                        <span>Script not found!</span>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div 
                className="flex flex-col gap-y-4"
            >
                <div className="flex flex-col gap-y-1 mt-4 px-4 text-sm">
                    <div>Script ID: <b>{script.data?.oldScriptId || script.data?.scriptId}</b></div>
                    <div>Script Title: <b>{script.data?.title}</b></div>
                    <div>Script Version: <b>{script.data?.version}</b></div>
                    <div>Hospital: <b>{script.data?.hospitalName}</b></div>
                </div>

                <Tabs 
                    options={[
                        {
                            value: 'screens',
                            label: 'Screens',
                        },
                        {
                            value: 'diagnoses',
                            label: 'diagnoses',
                        },
                    ]}
                    onChange={setTab}
                />

                <div>
                    {tab === 'screens' && (
                        <DataTable 
                            columns={[
                                {
                                    name: 'Title',
                                },
                                {
                                    name: 'Type',
                                },
                                {
                                    name: '',
                                },
                            ]}
                            data={screens.data.map(s => [
                                s.title,
                                s.type,
                            ])}
                        />
                    )}

                    {tab === 'diagnoses' && (
                        <DataTable 
                            columns={[
                                {
                                    name: 'Name',
                                },
                                {
                                    name: '',
                                },
                            ]}
                            data={diagnoses.data.map(s => [
                                s.name,
                                ''
                            ])}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
