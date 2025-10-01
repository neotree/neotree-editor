import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import { getUser } from "@/app/actions/users";

type GetUserResponse = Awaited<ReturnType<typeof getUser>>;

export function useUser({ 
    userId, 
    loadOnMount = false, 
}: {
    userId?: string | null;
    loadOnMount?: boolean;
}) {
    const mounted = useRef(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<GetUserResponse>(null);
    const [error, setError] = useState('');

    const _getUser = useCallback(async (uid = userId) => {
        try {
            setError('');
            if (!loading && userId) {
                setLoading(true);

                const res = await axios.get<GetUserResponse>(`/api/users/${uid}`);
                const user = res.data;
                setUser(user);
            }
        } catch(e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [loading, userId]);

    useEffect(() => {
        if (loadOnMount && !mounted.current) {
            mounted.current = true;
            _getUser();
        }
    }, [loadOnMount, _getUser]);

    return {
        loading,
        user,
        error,
        getUser: _getUser,
    };
}
