import { Loader } from '@/components/loader';

export default function Loading() {
    return (
        <div  className="flex flex-col fixed h-full w-full top-0 left-0 z-[999999] bg-background">
            <Loader overlay />
        </div>
    );
}
