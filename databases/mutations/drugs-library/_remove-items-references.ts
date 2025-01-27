import { _getScreens } from "@/databases/queries/scripts";
import { _saveScreens } from "@/databases/mutations/scripts";

export type RemoveDrugLibraryItemsReferencesParams = {
    keys: string[];
};

export type RemoveDrugLibraryItemsReferencesResponse = {
    errors?: string[];
    data: { success: boolean };
};

export async function _removeDrugLibraryItemsReferences({
    keys,
}: RemoveDrugLibraryItemsReferencesParams): Promise<RemoveDrugLibraryItemsReferencesResponse> {
    try {
        const screens = await _getScreens({
            types: ['drugs', 'fluids', 'feeds'],
            returnDraftsIfExist: true,
        });

        const updated: typeof screens.data = [];
        screens.data.forEach(screen => {
            const drugs = screen.drugs.filter(d => !keys.includes(d.key));
            const fluids = screen.fluids.filter(d => !keys.includes(d.key));
            const feeds = screen.feeds.filter(d => !keys.includes(d.key));

            if (drugs.length !== screen.drugs.length) updated.push({ ...screen, drugs });
            if (fluids.length !== screen.fluids.length) updated.push({ ...screen, fluids });
            if (feeds.length !== screen.feeds.length) updated.push({ ...screen, feeds });
        });

        if (updated.length) await _saveScreens({ data: updated, });

        return { data: { success: true, } };
    } catch(e: any) {
        return { errors: [e.message], data: { success: false, }, };
    }
}
