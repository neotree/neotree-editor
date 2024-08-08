import { cn } from "@/lib/utils";

export function Title({ children, className, }: {
    children: string;
    className?: string;
}) {
    return (
        <div className={cn('pb-1 border-b border-b-primary', className)}>
            <span className="uppercase text-primary text-sm">{children}</span>
        </div>
    );
}
