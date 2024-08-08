import { DataTable } from '@/components/data-table';
import { Content } from '@/components/content';
import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
    return (
        <Content>
            <Card>
                <CardContent className="p-0">
                    <DataTable
                        loading
                        maxRows={25}
                        columns={[
                            {
                                name: 'Display Name',
                            },
                            {
                                name: 'Email',
                            },
                            {
                                name: 'Role',
                            },
                            {
                                name: 'Last login date',
                            },
                            {
                                name: 'Active',
                                align: 'right',
                                cellClassName: 'w-20',
                            },
                            {
                                name: 'Action',
                                align: 'right',
                                cellClassName: 'w-20',
                            },
                        ]}
                        data={[]}
                    />
                </CardContent>
            </Card>
        </Content>
    );
}
