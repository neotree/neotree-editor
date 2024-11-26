'use client';

import { Loader } from "@/components/loader";
import { Props } from "./types";
import { useFilters } from "./use-filters";
import { Filters } from "./filters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Content(props: Props) {
    const filtersState = useFilters(props);

    const {
        loading,
        dataInitialised,
        canLoadData,
        loadData,
    } = filtersState;
    
    return (
        <>
            {loading && <Loader overlay />}

            {!dataInitialised && (
                <div className="fixed top-0 left-0 w-full h-full flex flex-col p-5 overflow-y-auto">
                    <div className="m-auto w-full max-w-lg">
                        <Card>
                            <CardContent>
                                <CardHeader>
                                    <CardTitle>Filters</CardTitle>
                                    <CardDescription>Filter {props.dataType}</CardDescription>
                                </CardHeader>

                                <Filters 
                                    {...props}
                                    {...filtersState}
                                />

                                <Button
                                    className="w-full mt-6"
                                    disabled={!canLoadData}
                                    onClick={() => loadData()}
                                >
                                    Load {props.dataType}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </>
    );
}
