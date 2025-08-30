import { Title } from "@/components/title";
import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";
import * as actions from '@/app/actions/data-keys';
import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { DataKeysTable } from './components/table';
import {useEffect } from 'react';
import axios from 'axios';
import { getLockStatus,createLock } from "@/app/actions/locks";

export const dynamic = 'force-dynamic';

export default async function DataKeysPage() { 
    const [res, { isSuperUser },locked] = await Promise.all([
        actions.getDataKeys(),
        getAuthenticatedUserWithRoles(),
        getLockStatus({script:'',lockType:'data_key'})
    ]);
     

    return (
        <>
            <Title>Data keys</Title>

            <Content>
                <Card className="mb-20">                    
                    <CardContent className="p-0">
                        <DataKeysTable 
                            {...actions}
                            disabled={!isSuperUser || !!locked}
                            dataKeys={res.data}
                        />
                    </CardContent>
                </Card>
            </Content>
        </>
    );
}
