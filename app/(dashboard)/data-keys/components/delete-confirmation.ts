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
        usages?: Array<{
            label: string;
            href: string;
        }>;
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

export function buildDeleteConfirmationFooterMessage(items: DeleteImpactItem[]) {
    const usedItems = items.filter((item) => item.scripts.length);
    if (!usedItems.length) return '';

    const deletedSubject = usedItems.length === 1 ? 'the data key' : 'these data keys';

    return [
        `<div>If you continue, ${deletedSubject} will still be deleted.</div>`,
        `<div style="margin-top:4px; font-weight:600;">Are you sure you want to continue?</div>`,
    ].join('');
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
            .map((script) => {
                const usage = script.usages?.[0];
                const remainingUsages = Math.max(0, (script.usages?.length || 0) - 1);
                const usageHtml = !usage
                    ? ''
                    : [
                        `<div style="margin-top:2px; font-size:12px; color:#64748b;">`,
                        `<a href="${escapeHtml(usage.href)}" target="_blank" rel="noopener noreferrer" style="color:#0f766e; text-decoration:underline;">${escapeHtml(usage.label || 'Open usage')}</a>`,
                        remainingUsages > 0 ? ` <span>+${remainingUsages} more</span>` : '',
                        `</div>`,
                    ].join('');

                return [
                    `<li style="padding:8px 0; border-top:1px solid #e5e7eb;">`,
                    `<div style="font-weight:500;">${escapeHtml(script.scriptTitle)}</div>`,
                    usageHtml,
                    `</li>`,
                ].join('');
            })
            .join('');

        return [
            `<div style="margin-top:12px; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">`,
            `<div style="font-weight:700;">${escapeHtml(getDataKeyDisplayName(item))}</div>`,
            `<div style="margin-top:2px; font-size:12px; color:#64748b;">${item.scripts.length} affected script${item.scripts.length === 1 ? '' : 's'}</div>`,
            `<ul style="margin:8px 0 0 0; padding:0; list-style:none;">${scriptsHtml}</ul>`,
            `</div>`,
        ].join('');
    }).join('');

    const intro = usedItems.length === 1
        ? `The data key you are deleting is currently used in the following script${usedItems[0].scripts.length === 1 ? '' : 's'}:`
        : 'Some of the data keys you are deleting are currently used in the following scripts:';

    return [
        `<div>${escapeHtml(intro)}</div>`,
        groupedHtml,
    ].join('');
}
