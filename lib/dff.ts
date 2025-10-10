import { _getDrugsLibraryItems } from "@/databases/queries/drugs-library";

export type DffItem = Awaited<ReturnType<typeof _getDrugsLibraryItems>>['data'][0];

export function getFillableDffItemFields(item: DffItem) {
    return {
        ...item
    };
}

export function compareDffItems(item1: DffItem, item2: DffItem) {

}
