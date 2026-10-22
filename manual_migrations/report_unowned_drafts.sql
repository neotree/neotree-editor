-- READ-ONLY report: unpublished changes that have no owner.
--
-- Run it on each editor (e.g. Zim DEV and Zim LIVE). It changes nothing.
--
-- A draft or queued deletion without an owner (created_by_user_id is null) is never included in anyone's
-- "publish my changes" and, before the fix that shades every draft, its script looked clean in the
-- scripts list. They came from server-to-server calls that did not say who made them (older imports
-- and exports, the drug library export), from CLI scripts run without a user, and from drafts whose
-- owner's account was deleted.
--
-- Review each row with the people who work on that area, then publish or discard it.

-- 1. How many, per area
select area, count(*) as unowned, min(created_at) as oldest, max(updated_at) as latest
from (
    select 'script' as area, created_at, updated_at from nt_scripts_drafts where created_by_user_id is null
    union all select 'screen', created_at, updated_at from nt_screens_drafts where created_by_user_id is null
    union all select 'diagnosis', created_at, updated_at from nt_diagnoses_drafts where created_by_user_id is null
    union all select 'problem', created_at, updated_at from nt_problems_drafts where created_by_user_id is null
    union all select 'data key', created_at, updated_at from nt_data_keys_drafts where created_by_user_id is null
    union all select 'drugs library item', created_at, updated_at from nt_drugs_library_drafts where created_by_user_id is null
    union all select 'config key', created_at, updated_at from nt_config_keys_drafts where created_by_user_id is null
    union all select 'hospital', created_at, updated_at from nt_hospitals_drafts where created_by_user_id is null
    union all select 'queued deletion', created_at, created_at from nt_pending_deletion where created_by_user_id is null
) unowned
group by area
order by unowned desc;

-- 2. Script content: which script, which item, and where the change came from
select
    coalesce(s.title, sd.data->>'title', '(new script)') as script,
    d.kind,
    d.item,
    d.draft_origin,
    d.created_at,
    d.updated_at
from (
    select 'script' as kind, data->>'title' as item, script_id, script_draft_id, draft_origin, created_at, updated_at
        from nt_scripts_drafts where created_by_user_id is null
    union all
    select 'screen', coalesce(data->>'title', data->>'label'), script_id, script_draft_id, draft_origin, created_at, updated_at
        from nt_screens_drafts where created_by_user_id is null
    union all
    select 'diagnosis', data->>'name', script_id, script_draft_id, draft_origin, created_at, updated_at
        from nt_diagnoses_drafts where created_by_user_id is null
    union all
    select 'problem', data->>'name', script_id, script_draft_id, draft_origin, created_at, updated_at
        from nt_problems_drafts where created_by_user_id is null
) d
left join nt_scripts s on s.script_id = d.script_id
left join nt_scripts_drafts sd on sd.script_draft_id = d.script_draft_id
order by script, d.kind, d.item;

-- 3. Libraries: data keys, drugs library, config keys, hospitals
select 'data key' as kind, coalesce(data->>'label', data->>'name', name) as item, unique_key as key, draft_origin, created_at, updated_at
    from nt_data_keys_drafts where created_by_user_id is null
union all
select 'drugs library item', coalesce(data->>'drug', data->>'key', key), key, null, created_at, updated_at
    from nt_drugs_library_drafts where created_by_user_id is null
union all
select 'config key', coalesce(data->>'label', data->>'key'), data->>'key', null, created_at, updated_at
    from nt_config_keys_drafts where created_by_user_id is null
union all
select 'hospital', data->>'name', null, null, created_at, updated_at
    from nt_hospitals_drafts where created_by_user_id is null
order by kind, item;

-- 4. Queued deletions without an owner
select
    case
        when pd.screen_id is not null or pd.screen_draft_id is not null then 'screen'
        when pd.diagnosis_id is not null or pd.diagnosis_draft_id is not null then 'diagnosis'
        when pd.problem_id is not null or pd.problem_draft_id is not null then 'problem'
        when pd.script_id is not null or pd.script_draft_id is not null then 'script'
        when pd.data_key_id is not null or pd.data_key_draft_id is not null then 'data key'
        when pd.drugs_library_item_id is not null or pd.drugs_library_item_draft_id is not null then 'drugs library item'
        when pd.config_key_id is not null or pd.config_key_draft_id is not null then 'config key'
        when pd.hospital_id is not null or pd.hospital_draft_id is not null then 'hospital'
        when pd.alias_id is not null then 'alias'
        else 'other'
    end as kind,
    coalesce(sc.title, dg.name, pb.name, s.title, dk.label, dk.name) as item,
    coalesce(s2.title, s.title) as script,
    pd.draft_origin,
    pd.created_at
from nt_pending_deletion pd
left join nt_screens sc on sc.screen_id = pd.screen_id
left join nt_diagnoses dg on dg.diagnosis_id = pd.diagnosis_id
left join nt_problems pb on pb.problem_id = pd.problem_id
left join nt_scripts s on s.script_id = pd.script_id
left join nt_scripts s2 on s2.script_id = coalesce(pd.screen_script_id, pd.diagnosis_script_id, pd.problem_script_id)
left join nt_data_keys dk on dk.uuid = pd.data_key_id
where pd.created_by_user_id is null
order by kind, script, item;
