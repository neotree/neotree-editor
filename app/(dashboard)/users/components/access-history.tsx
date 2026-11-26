'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { UserAccessHistoryEntry } from "@/databases/queries/users";

type Props = {
    user: { userId: string; name: string; } | null;
    onClose: () => void;
};

export function AccessHistory({ user, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [entries, setEntries] = useState<UserAccessHistoryEntry[]>([]);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError('');
                setEntries([]);
                const res = await axios.get('/api/users/access-history?userId=' + encodeURIComponent(user.userId));
                if (cancelled) return;
                if (res.data?.errors?.length) throw new Error(res.data.errors.join(', '));
                setEntries(res.data.data || []);
            } catch(e: any) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [user]);

    return (
        <Dialog open={!!user} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Access history</DialogTitle>
                    <DialogDescription>{user?.name}</DialogDescription>
                </DialogHeader>

                <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
                    {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

                    {!!error && <p className="text-sm text-danger">{error}</p>}

                    {!loading && !error && !entries.length && (
                        <p className="text-sm text-muted-foreground">This account has never been deactivated or reactivated.</p>
                    )}

                    {entries.map(e => (
                        <div key={e.id} className="flex items-start gap-3 rounded-md border px-3 py-2">
                            <div className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', e.action === 'deactivated' ? 'bg-red-500' : 'bg-green-500')} />
                            <div className="flex-1">
                                <div className="text-sm font-semibold">
                                    {e.action === 'deactivated' ? 'Deactivated' : 'Reactivated'} by {e.byName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {e.byEmail && <>{e.byEmail} &middot; </>}{moment(e.date).format('LLL')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
