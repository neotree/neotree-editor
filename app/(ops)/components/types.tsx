'use client';

import { ScreenType, ScriptType } from "@/databases/queries/scripts";

export type Props = {
    dataType: 'scripts' | 'screens' | 'diagnoses';
};

export type FiltersType = {
    screensIds: string[],
    diagnosesIds: string[];
    hospitalsIds: string[];
    scriptsIds: string[];
    screensTypes: ScreenType['type'][];
    scriptsTypes: ScriptType['type'][];
    withImagesOnly: boolean;
    draftsOnly: boolean;
};
