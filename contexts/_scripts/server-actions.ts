import { 
    getScriptsTableData, 
    deleteScripts, 
    getScriptWithDraft, 
    updateScripts, 
    createScripts,
    searchScripts,
    listScripts,
    importScripts,
    countScriptsItems,
    updateScriptsWithoutPublishing,
} from "@/app/actions/_scripts";
import {
    getScriptDraft,
    updateScriptsDrafts, 
    createScriptsDrafts,
    deleteScriptsDrafts,
} from "@/app/actions/_scripts-drafts";
import { 
    getScreensTableData, 
    deleteScreens, 
    getScreenWithDraft, 
    updateScreens, 
    createScreens,
    searchScreens,
    updateScreensWithoutPublishing,
    copyScreens,
} from "@/app/actions/_screens";
import {
    getScreenDraft,
    updateScreensDrafts, 
    createScreensDrafts,
    deleteScreensDrafts,
} from "@/app/actions/_screens-drafts";
import { 
    getDiagnosesTableData, 
    deleteDiagnoses, 
    getDiagnosisWithDraft, 
    updateDiagnoses, 
    createDiagnoses,
    searchDiagnoses,
    updateDiagnosesWithoutPublishing,
    copyDiagnoses,
} from "@/app/actions/_diagnoses";
import {
    getDiagnosisDraft,
    updateDiagnosesDrafts, 
    createDiagnosesDrafts,
    deleteDiagnosesDrafts,
} from "@/app/actions/_diagnoses-drafts";
import { getHospitals } from "@/app/actions/_hospitals";
import { importRemoteScripts } from "@/app/actions/sites";
import { uploadFile } from "@/app/actions/files";

export const scriptsServerActions = {
    _countScriptsItems: countScriptsItems,
    _getScripts: getScriptsTableData,
    _deleteScripts: deleteScripts,
    _getScript: getScriptWithDraft,
    _updateScripts: updateScripts,
    _createScripts: createScripts,
    _searchScripts: searchScripts,
    _updateDrafts: updateScriptsDrafts,
    _createDrafts: createScriptsDrafts,
    _deleteDrafts: deleteScriptsDrafts,
    _getScriptDraft: getScriptDraft,
    _listScripts: listScripts,
    _importRemoteScripts: importRemoteScripts,
    _importScripts: importScripts,
    _updateScriptsWithoutPublishing: updateScriptsWithoutPublishing,

    _getScreens: getScreensTableData,
    _deleteScreens: deleteScreens,
    _getScreen: getScreenWithDraft,
    _updateScreens: updateScreens,
    _createScreens: createScreens,
    _searchScreens: searchScreens,
    _getScreenDraft: getScreenDraft,
    _updateScreensDrafts: updateScreensDrafts,
    _createScreensDrafts: createScreensDrafts,
    _deleteScreensDrafts: deleteScreensDrafts,
    _updateScreensWithoutPublishing: updateScreensWithoutPublishing,
    _copyScreens: copyScreens,

    _getDiagnoses: getDiagnosesTableData,
    _deleteDiagnoses: deleteDiagnoses,
    _getDiagnosis: getDiagnosisWithDraft,
    _updateDiagnoses: updateDiagnoses,
    _createDiagnoses: createDiagnoses,
    _searchDiagnoses: searchDiagnoses,
    _getDiagnosisDraft: getDiagnosisDraft,
    _updateDiagnosesDrafts: updateDiagnosesDrafts,
    _createDiagnosesDrafts: createDiagnosesDrafts,
    _deleteDiagnosesDrafts: deleteDiagnosesDrafts,
    _updateDiagnosesWithoutPublishing: updateDiagnosesWithoutPublishing,
    _copyDiagnoses: copyDiagnoses,
    
    _getHospitals: getHospitals,
    _uploadFile: uploadFile,
} as const;
