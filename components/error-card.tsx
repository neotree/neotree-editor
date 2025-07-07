import { Card, CardContent } from "@/components/ui/card";

type Props = {
    children?: React.ReactNode;
    errors?: string[];
};

export function ErrorCard({ children, errors = [], }: Props) {
    return (
        <>
            <Card
                className="bg-destructive/20 border-destructive text-destructive"
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
