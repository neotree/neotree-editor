import { Loader as LoadingComponent } from "lucide-react";

export function Loader({ 
    overlay, 
    transparent, 
    padding = '50px 0', 
}: {
    overlay?: boolean;
    transparent?: boolean;
    padding?: number | string;
}) {
    return ( 
        <>
            <div 
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    ...(overlay ? {
                        height: '100%',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        zIndex: 999,
                        backgroundColor: transparent ? 'transparent' : 'rgba(255,255,255,.6)',
                    } : {
                        padding,
                    }),
                }}
            >
                <LoadingComponent 
                    style={{
                        height: 24,
                        width: 24,
                    }}
                    className="animate-spin" 
                />
            </div>
        </>
    );
}
