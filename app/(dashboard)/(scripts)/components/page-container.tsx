import Link from "next/link";
import { ArrowLeft,Lock, Unlock } from "lucide-react";

import { Content } from "@/components/content";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
    title?: string;
    backLink?: string;
    children?: React.ReactNode;

};

export function PageContainer({ title, backLink, children }: Props) {
    return (
        <div className="pb-20">
            <Content className="flex flex-col gap-y-4">
                <Card>
                    <CardContent className="p-0">
                        {!!title && (
                            <div className="text-xl flex items-center gap-x-4 mb-4 p-4">
                                {!!backLink && (
                                    <Link href={backLink}>
                                        <ArrowLeft className="h-5 w-5" />
                                    </Link>
                                )}
                                <span>{title}</span>
                            </div>
                        )}
                       

                        {children}
                        
                    </CardContent>
                </Card>
            </Content>
        </div>
    );
}
