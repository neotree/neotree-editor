import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
    children?: React.ReactNode;
    errors?: string[];
    color?: 'warning';
};

export function ErrorCard({ color, children, errors = [], }: Props) {
    return (
        <>
            <Card
                className={cn(
                    'bg-destructive/20 border-destructive text-destructive',
                    color === 'warning' && 'bg-yellow-200/20 border-yellow-400 text-yellow-600',
                )}
            >
                <CardContent className="flex flex-col gap-y-4 px-4 py-2">
                    {children}
                    {!!errors.length && (
                        <div>
                            {errors.map((e, i) => {
                                const key = `${i}`;
                                return (
                                    <p key={key}>{e}</p>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
