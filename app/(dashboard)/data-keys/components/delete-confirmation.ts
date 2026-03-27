'use client';

import axios from "axios";

type DeleteImpactItem = {
    dataKeyId: string;
    uniqueKey: string;
    name: string;
    label: string;
    scripts: Array<{
        scriptId: string;
        scriptTitle: string;
    }>;
};

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getDataKeyDisplayName(item: DeleteImpactItem) {
    return item.name || item.label || item.uniqueKey || 'Data key';
}

export async function fetchDataKeyDeleteImpact(dataKeysIds: string[]) {
    const params = new URLSearchParams();
    params.set('dataKeysIds', JSON.stringify(dataKeysIds));

    const response = await axios.get<{
        success: boolean;
        data: DeleteImpactItem[];
        errors?: string[];
    }>(`/api/data-keys/delete-impact?${params.toString()}`);

    if (response.data.errors?.length) {
        throw new Error(response.data.errors[0]);
    }

    return response.data.data || [];
}

export function buildDeleteConfirmationMessage(items: DeleteImpactItem[]) {
    const usedItems = items.filter((item) => item.scripts.length);
    if (!usedItems.length) {
        return items.length > 1
            ? 'Are you sure you want to delete these data keys?'
            : 'Are you sure you want to delete this data key?';
    }

    const groupedHtml = usedItems.map((item) => {
        const scriptsHtml = item.scripts
            .map((script) => `<li>${escapeHtml(script.scriptTitle)}</li>`)
            .join('');

        return [
            `<div style="margin-top:12px;">`,
            `<div><strong>${escapeHtml(getDataKeyDisplayName(item))}</strong></div>`,
            `<ul style="margin:6px 0 0 18px; padding:0;">${scriptsHtml}</ul>`,
            `</div>`,
        ].join('');
    }).join('');

    const intro = usedItems.length === 1
        ? `The data key you are deleting is currently used in the following script${usedItems[0].scripts.length === 1 ? '' : 's'}:`
        : 'Some of the data keys you are deleting are currently used in the following scripts:';

    return [
        `<div>${escapeHtml(intro)}</div>`,
        groupedHtml,
        `<div style="margin-top:12px;">If you continue, the data key will still be deleted.</div>`,
        `<div style="margin-top:8px;">Are you sure you want to continue?</div>`,
    ].join('');
}
