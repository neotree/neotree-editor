import { expect, test, type Page } from '@playwright/test';

import { signIn } from './auth';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
    await signIn(page);
});

async function reviewLinks(page: Page) {
    await page.goto('/data-keys/merge');
    await expect(page.getByText('Harmonise data keys').first()).toBeVisible();
    const links = page.getByRole('link', { name: /Review & merge/ });
    await expect(links.first()).toBeVisible();
    return links.evaluateAll((elements) => elements.map((element) => element.getAttribute('href') || ''));
}

/** Waits until the merge page's dry run has finished (or failed). */
async function waitForPreview(page: Page) {
    await expect(page.getByText('4. Preview the changes')).toBeVisible();
    // Next's route announcer is also an alert; only the page's own callouts count.
    const callout = page.locator('[role="alert"]:not(#__next-route-announcer__)');
    await expect(page.getByText(/\d+ scripts? change$/).or(callout).first()).toBeVisible();
}

test('overview lists duplicate groups, with tabs in the URL', async ({ page }) => {
    await page.goto('/data-keys/merge');

    await expect(page.getByRole('tab', { name: /Duplicates \(\d+\)/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Review & merge/ }).first()).toBeVisible();
    await expect(page.getByText('used in', { exact: false }).first()).toBeVisible();

    await page.getByRole('tab', { name: /Possible/ }).click();
    await expect(page).toHaveURL(/tab=possible/);
    await page.getByRole('tab', { name: /History/ }).click();
    await expect(page).toHaveURL(/tab=history/);
});

test('the merge page previews the changes and keeps the plan in the URL', async ({ page }) => {
    const [href] = await reviewLinks(page);
    await page.goto(href);

    await expect(page.getByText('1. Choose the data key to keep')).toBeVisible();
    await expect(page).toHaveURL(/keep=/);
    await waitForPreview(page);

    // A decision survives a reload because it lives in the URL.
    await page.getByLabel('Selected scripts only').check();
    await expect(page).toHaveURL(/scope=scripts/);
    await page.reload();
    await expect(page.getByLabel('Selected scripts only')).toBeChecked();
    await expect(page.getByText('Select at least one script to merge in.')).toBeVisible();
});

test('choose where an option shows, and reset it', async ({ page }) => {
    const [href] = await reviewLinks(page);
    await page.goto(href);
    await waitForPreview(page);

    // Each option of the kept key has a "Shows in" button: "All 8 scripts", "3 of 8 scripts"…
    const showsIn = page.getByRole('button', { name: /^(All \d+ scripts?|\d+ of \d+ scripts?|Not shown)/ }).first();
    await expect(showsIn).toBeVisible();
    await showsIn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/^Where “.+” shows$/)).toBeVisible();
    await dialog.getByRole('radio', { name: /^All scripts/ }).check();
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/place=/);
    await expect(page.getByRole('button', { name: /changed/ }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Reset where options show' }).click();
    await expect(page).not.toHaveURL(/place=/);
});

test('merge a group, read its report, then revert it', async ({ page }) => {
    const hrefs = await reviewLinks(page);

    // Use the first group nobody else has unpublished changes on.
    const merge = page.getByRole('button', { name: 'Merge data keys' });
    let found = false;
    for (const href of hrefs.slice(0, 8)) {
        await page.goto(href);
        await waitForPreview(page);
        if (await merge.isEnabled()) {
            found = true;
            break;
        }
    }
    test.skip(!found, 'Every group checked has conflicting drafts by other users.');

    await merge.click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByText('Merge these data keys?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Merge' }).click();

    await expect(page).toHaveURL(/\/data-keys\/merge\/history\/[0-9a-f-]+\?merged=1/);
    await expect(page.getByText(/Merge of “/)).toBeVisible();
    await expect(page.getByText('The merge is saved as drafts.', { exact: false })).toBeVisible();
    await expect(page.getByText('Changes', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Revert merge' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Revert' }).click();
    await expect(page.getByText('Merge reverted')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.reload();
    await expect(page.getByText('Reverted', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Revert merge' })).toHaveCount(0);
});

test('dismiss a group as not a duplicate, then restore it', async ({ page }) => {
    await page.goto('/data-keys/merge');
    const dismissedTab = page.getByRole('tab', { name: /Dismissed \(\d+\)/ });
    const before = Number((await dismissedTab.textContent())?.match(/\((\d+)\)/)?.[1] || 0);

    await page.getByRole('button', { name: 'Not a duplicate' }).first().click();
    const reason = `E2E check ${Date.now()}`;
    await page.getByLabel('Reason (optional)').fill(reason);
    await page.getByRole('alertdialog').getByRole('button', { name: 'Dismiss' }).click();

    await expect(page.getByRole('tab', { name: `Dismissed (${before + 1})` })).toBeVisible();
    await page.getByRole('tab', { name: /Dismissed/ }).click();
    const row = page.getByRole('row', { name: new RegExp(reason) });
    await expect(row).toBeVisible();

    await row.getByRole('button', { name: 'Restore' }).click();
    await expect(page.getByRole('tab', { name: `Dismissed (${before})` })).toBeVisible();
});

test('the batch page checks clean groups before merging', async ({ page }) => {
    await page.goto('/data-keys/merge/batch');
    await expect(page.getByText('Merge clean groups').first()).toBeVisible();

    const statuses = page.getByText(/^(Ready|Has unlinked options|Someone else is editing|Error)$/);
    const empty = page.getByText('No clean groups', { exact: false });
    // Statuses appear once every clean group has been dry-run, which takes a while.
    await expect(statuses.first().or(empty)).toBeVisible({ timeout: 170_000 });
});
