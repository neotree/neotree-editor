'use client';

import { DATA_KEY_SAVE_PROGRESS } from "@/lib/in-progress";
import { OperationProgress, type OperationProgressStep } from "@/components/operation-progress";

const STEPS: OperationProgressStep[] = [
    { key: DATA_KEY_SAVE_PROGRESS.checking, label: 'Checking the changes' },
    { key: DATA_KEY_SAVE_PROGRESS.unlinking, label: 'Removing unlinked options from the screens' },
    { key: DATA_KEY_SAVE_PROGRESS.finding, label: 'Finding the scripts that use it' },
    { key: DATA_KEY_SAVE_PROGRESS.loading, label: 'Loading those scripts', unit: 'scripts' },
    { key: DATA_KEY_SAVE_PROGRESS.updating, label: 'Updating screens, diagnoses and problems', unit: 'updated' },
    { key: DATA_KEY_SAVE_PROGRESS.conditions, label: 'Updating conditional expressions to the new name' },
    { key: DATA_KEY_SAVE_PROGRESS.recording, label: 'Recording the change so it can be reviewed and reverted' },
];

/** Progress of a data key save, or of its preview. */
export function DataKeySaveProgress({ requestKey, preview }: { requestKey: string; preview?: boolean; }) {
    return (
        <OperationProgress
            requestKey={requestKey}
            title={preview ? 'Preparing the preview' : 'Saving the data key'}
            description={preview
                ? 'The save is run and rolled back to show exactly what will change. Large keys used in many scripts take longer.'
                : 'Every script using this key is updated too. Large keys used in many scripts take longer.'}
            steps={STEPS}
        />
    );
}
