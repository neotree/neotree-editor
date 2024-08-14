import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="px-4 py-4 flex flex-col gap-y-5 text-center justify-center items-center">
                <Logo />

                <div className="text-6xl sm:text-9xl font-extrabold text-secondary dark:text-secondary-foreground">
                    Four, Oh! Four
                </div>

                <div>
                    Sorry, can&apos;t find the page you&apos;re looking for.
                </div>

                <Button
                    variant="outline"
                    size="lg"
                    asChild
                >
                    <Link href="/" replace>
                        <>
                            <ChevronLeft className="w-6 h-6 mr-2" />
                            <span className="text-xl">Home</span>
                        </>
                    </Link>
                </Button>
            </div>
        </div>
    );
}
