import { useAppContext } from "@/contexts/app";

export function useIsLocked({ isDraft, userId }: {
    isDraft: boolean;
    userId?: string | null;
}) {
    const { authenticatedUser } = useAppContext();
    const isLocked = isDraft && userId && (userId !== authenticatedUser?.userId);
    return !!isLocked;
}
