'use client';

import { useState, useCallback, useMemo } from "react";
import axios from "axios";

import { DiagnosisType, ScreenType, ScriptType } from "@/databases/queries/scripts";
import { getScripts, getScreens, getDiagnoses } from "@/app/actions/scripts";
import { Props, FiltersType } from "./types";

export function useFilters(props: Props) {
    const [dataInitialised, setDataInitialised] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scripts, setScripts] = useState<{ data: ScriptType[], }>({ data: [], });
    const [screens, setScreens] = useState<{ data: ScreenType[], }>({ data: [], });
    const [diagnoses, setDiagnoses] = useState<{ data: DiagnosisType[], }>({ data: [], });

    const [filters, _setFilters] = useState<FiltersType>({
        screensIds: [],
        diagnosesIds: [],
        hospitalsIds: [],
        scriptsIds: [],
        screensTypes: [],
        scriptsTypes: [],
        withImagesOnly: false,
        draftsOnly: false,
        
    });
    const [currentFilters, setCurrentFilters] = useState(filters);

    const setFilters = useCallback((partial: Partial<FiltersType> | ((filters: FiltersType) => Partial<FiltersType>)) => _setFilters(
        prev => ({ ...prev, ...(typeof partial === 'function' ? partial(prev) : partial) }),
    ), []);

    const canLoadData = useMemo(() => (
        !dataInitialised ||
        (JSON.stringify(filters) !== JSON.stringify(currentFilters))
    ), [filters, currentFilters, dataInitialised]);

    const loadScripts = useCallback(async () => {
        try {
            setLoading(true);

            const data: Parameters<typeof getScripts>[0] = {
                hospitalIds: filters.hospitalsIds,
                returnDraftsIfExist: true,
                scriptsIds: filters.scriptsIds,
                withDeleted: false,
            };

            const res = await axios.get<Awaited<ReturnType<typeof getScripts>>>(`/api/scripts?data=${JSON.stringify(data)}`);

            const { errors, data: scripts } = res.data;

            if (errors?.length) throw new Error(errors.join(', '));

            setScripts({ data: scripts });
            setCurrentFilters(filters);
            setDataInitialised(true);
        } catch(e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const loadScreens = useCallback(async () => {
        try {
            setLoading(true);

            const data: Parameters<typeof getScreens>[0] = {
                scriptsIds: filters.scriptsIds,
                screensIds: filters.screensIds,
                returnDraftsIfExist: true,
                withDeleted: false,
                withImagesOnly: filters.withImagesOnly,
            };

            const res = await axios.get<Awaited<ReturnType<typeof getScreens>>>(`/api/screens?data=${JSON.stringify(data)}`);

            const { errors, data: screens } = res.data;

            if (errors?.length) throw new Error(errors.join(', '));

            setScreens({ data: screens });
            setCurrentFilters(filters);
            setDataInitialised(true);
        } catch(e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const loadDiagnoses = useCallback(async () => {
        try {
            setLoading(true);
    
            const data: Parameters<typeof getDiagnoses>[0] = {
                scriptsIds: filters.scriptsIds,
                diagnosesIds: filters.diagnosesIds,
                returnDraftsIfExist: true,
                withDeleted: false,
                withImagesOnly: filters.withImagesOnly,
            };
    
            const res = await axios.get<Awaited<ReturnType<typeof getDiagnoses>>>(`/api/diagnoses?data=${JSON.stringify(data)}`);
    
            const { errors, data: diagnoses } = res.data;
    
            if (errors?.length) throw new Error(errors.join(', '));
    
            setDiagnoses({ data: diagnoses });
            setCurrentFilters(filters);
            setDataInitialised(true);
        } catch(e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const loadData = useCallback(() => {
        if (props.dataType === 'diagnoses') {
            loadDiagnoses();
        } else if (props.dataType === 'screens') {
            loadScreens();
        } else {
            loadScripts();
        }
    }, [props.dataType, loadDiagnoses, loadScreens, loadScripts]);
    
    return {
        loading,
        scripts,
        screens,
        diagnoses,
        filters,
        canLoadData,
        dataInitialised,
        loadData,
        setLoading,
        setScripts,
        setScreens,
        setDiagnoses,
        _setFilters,
        setFilters,
        loadScripts,
        loadScreens,
        loadDiagnoses,
    };
}
