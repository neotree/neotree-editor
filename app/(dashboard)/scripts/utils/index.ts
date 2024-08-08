import { IScriptsContext } from "@/contexts/scripts";
import { ImageTextField } from "@/types";
import queryString from "query-string";

type DraftType = Awaited<ReturnType<IScriptsContext['_getScreen']>>['draft']['data'];

export function getScreenDataType(type: DraftType['dataType']) {
    switch (type) {
        case 'yesno':
            return 'boolean';
        case 'timer':
            return 'number';
        case 'management':
            return '';
        case 'multi_select':
            return 'set<id>';
        case 'single_select':
            return 'id';
        case 'edliz_summary_table':
            return '';
        case 'mwi_edliz_summary_table':
            return '';
        case 'zw_edliz_summary_table':
            return '';
        default:
            return '';
    }
}

export function getScreenDefaultImageTextFields(count = 3) {
    const fields: ImageTextField[] = [];
    for (let i = 0; i < count; i++) {
        fields.push({
            image: '',
            text: '',
            title: '',
        });
    }
    return fields;
}

export function getScriptPageHref({ scriptDraftId, scriptId }: {
    scriptId?: null | string;
    scriptDraftId?: null | string;
}) {
    if (!scriptDraftId && !scriptId) return '';
    const scriptPageHref = ['/script', scriptDraftId ? '/draft/'+scriptDraftId : (scriptId ? '/'+scriptId : ''), ].filter(s => s).join('');
    return scriptPageHref;
}

export function getScreenPageHref({ screenDraftId, screenId, scriptId, scriptDraftId }: {
    screenId?: null | string;
    screenDraftId?: null | string;
    scriptId?: null | string; 
    scriptDraftId?: null | string;
}) {
    const screenPageHref = ['/screen', screenDraftId ? '/draft/'+screenDraftId : (screenId ? '/'+screenId : ''), ].filter(s => s).join('');
    return `${screenPageHref}?${queryString.stringify({ scriptId, scriptDraftId })}`;
}

export function getDiagnosisPageHref({ diagnosisDraftId, diagnosisId }: {
    diagnosisId?: null | string;
    diagnosisDraftId?: null | string;
}) {
    const diagnosisPageHref = ['/diagnosis', diagnosisDraftId ? '/draft/'+diagnosisDraftId : (diagnosisId ? '/'+diagnosisId : ''), ].filter(s => s).join('');
    return diagnosisPageHref;
}

