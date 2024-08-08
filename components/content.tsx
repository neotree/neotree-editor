import { cn } from "@/lib/utils";

type Props = React.HTMLProps<HTMLDivElement>;

export function Content({ className, ...props }: Props) {
    return (
        <div 
            {...props}
            className={cn(
                'w-full max-w-screen-xl mx-auto p-5',
                className,
            )}
        />
    );
}
