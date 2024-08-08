'use client';

import { createContext, useContext } from "react";

import { scriptsServerActions } from "@/contexts/scripts/server-actions";

export interface IScriptsContext extends 
    ScriptsContextProviderProps {}

export const ScriptsContext = createContext<IScriptsContext>(null!);

export const useScriptsContext = () => useContext(ScriptsContext);

export type ScriptsContextProviderProps = typeof scriptsServerActions & {
    hospitals: Awaited<ReturnType<typeof scriptsServerActions._getHospitals>>['data'];
};

export function ScriptsContextProvider({ 
    children, 
    ...props 
}: ScriptsContextProviderProps & {
    children: React.ReactNode;
}) {
    return (
        <ScriptsContext.Provider
            value={{
                ...props
            }}
        >
            {children}
        </ScriptsContext.Provider>
    );
}

export const statuses = [
    { value: 'published', label: 'Published', },
    { value: 'unpublished', label: 'Drafts', },
];
