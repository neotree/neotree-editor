'use client';

import { useTransition } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import queryString from "query-string";

import { getSessions } from "@/app/actions/sessions";
import { DataTable } from "@/components/data-table";
import { Pagination } from "@/components/pagination";
import { useSearchParams } from "@/hooks/use-search-params";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Container } from "./container";

type Props = {
    sessions: Awaited<ReturnType<typeof getSessions>>;
    getSessions: typeof getSessions;
}

export function SessionsTable({ sessions }: Props) {
    const router = useRouter();
    const { parsed: searchParams } = useSearchParams();

    const [loading, startTransition] = useTransition();

    const getPaginationNode = (opts?: { hideControls?: boolean; hideSummary?: boolean; }) => (
        <Pagination
            currentPage={sessions.info.page}
            totalPages={sessions.info.totalPages}
            disabled={loading}
            limit={sessions.info.limit}
            totalRows={sessions.info.totalRows}
            collectionName=""
            hideControls={opts?.hideControls}
            hideSummary={opts?.hideSummary}
            classes={{
                pageNumber: '',
            }}
            onPaginate={page => {
                
                startTransition(() => {
                    router.push('/sessions?' + queryString.stringify({ ...searchParams, page }));
                });
            }}
        />
    );

    return (
        <>
            <Container
                header={(
                    <>
                    
                    </>
                )}

                footer={(
                    <>
                        <div>
                            {getPaginationNode({ hideControls: true, })}
                        </div>

                        <div>
                            {getPaginationNode({ hideSummary: true, })}
                        </div>
                    </>
                )}
            >
                {loading && <Loader overlay />}

                <DataTable 
                    selectable
                    columns={[
                        {
                            name: 'UID',
                            // cellClassName: 'w-40',
                        },
                        {
                            name: 'Script ID',
                            // cellClassName: 'w-[250px]',
                        },
                        {
                            name: 'Ingestion Date',
                        }, 
                        {
                            name: '',
                            align: 'right',
                            cellRenderer({ rowIndex }) {
                                const s = sessions.data[rowIndex];
                                if (!s) return null;
                                return (
                                    <div>
                                        <Button
                                            asChild
                                            variant="link"
                                            className="h-auto p-0"
                                        >
                                            <Link href={`/sessions/${s.id}`} target="_blank">
                                                View
                                                <ExternalLink className="h-4 w-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                )
                            }
                        }
                    ]}
                    data={sessions.data.map(s => [
                        s.uid || '',
                        s.scriptid || '',
                        s.ingested_at ? moment(s.ingested_at).format('LLL') : '',
                        '',
                    ])}
                />

                <div className="py-4 border-t border-t-border">
                    {getPaginationNode({ hideControls: true, })}
                </div>
            </Container>
        </>
    )
}
