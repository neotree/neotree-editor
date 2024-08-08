'use server';

import { DataAction, PagePermission } from "@/types";
import { isAuthenticated } from "./is-authenticated";
import logger from "@/lib/logger";

type PermissionParam = PagePermission | PagePermission[] | DataAction | DataAction[];

export async function canAccessPage(perm?: PermissionParam) {
    let response: Awaited<ReturnType<typeof isAllowed>> = { yes: false, user: null, };
    try {
        response = await isAllowed(perm);
    } catch(e: any) {
        logger.error('canAccessPage ERROR', e.message);
    } finally {
        return response;
    }
}

export async function isAllowed(action?: PermissionParam) {
    const authenticated = await isAuthenticated();

    if (!authenticated.yes) throw new Error('Unauthenticated');

    let isAllowed = true;

    if (action) {
        const actions = typeof action === 'string' ? [action] : action;
        
        for (const action of actions) {
            switch(action) {
                //pages
                //mailer
                case 'users_page':
                case 'general_settings_page':
                case 'emails_settings_page':
                case 'logs_settings_page':
                case 'system_settings_page':
                case 'app_settings_page':
                    isAllowed = authenticated.user?.role !== 'user';
                    break;

                //mailer
                case 'get_mailer_settings':
                    break;
                case 'save_mailer_settings':
                    break;
                case 'delete_mailer_settings':
                    break;
    
                // permissions actions
                case 'view_logs':
                    break;
    
                // permissions actions
                case 'create_permissions':
                    break;
                case 'update_permissions':
                    break;
                case 'delete_permissions':
                    break;
                case 'get_permissions':
                    break;
                case 'get_permission':
                    break;
                case 'search_permissions':
                    break;
        
                // users actions
                case 'create_users':
                    break; 
                case 'update_users':
                    break; 
                case 'delete_users':
                    break; 
                case 'get_users':
                    break;
                case 'get_user':
                    break;
                case 'search_users':
                    break;
        
                // hospitals actions
                case 'create_hospitals':
                    break; 
                case 'update_hospitals':
                    break; 
                case 'delete_hospitals':
                    break; 
                case 'get_hospitals':
                    break;
                case 'get_hospital':
                    break;
                case 'search_hospitals':
                    break;
        
                // configuration actions
                case 'create_config_keys':
                    break; 
                case 'update_config_keys':
                    break; 
                case 'delete_config_keys':
                    break; 
                case 'get_config_keys':
                    break;
                case 'get_config_key':
                    break;
                case 'search_config_keys':
                    break;
        
                // scripts actions
                case 'import_scripts':
                    break;
                case 'create_scripts':
                    break; 
                case 'update_scripts':
                    break; 
                case 'delete_scripts':
                    break; 
                case 'get_scripts':
                    break;
                case 'get_script':
                    break;
                case 'search_scripts':
                    break;
        
                // screens actions
                case 'create_screens':
                    break; 
                case 'update_screens':
                    break; 
                case 'delete_screens':
                    break; 
                case 'get_screens':
                    break;
                case 'get_screen':
                    break;
                case 'search_screens':
                    break;
        
                // diagnoses actions
                case 'create_diagnoses':
                    break; 
                case 'update_diagnoses':
                    break; 
                case 'delete_diagnoses':
                    break; 
                case 'get_diagnoses':
                    break;
                case 'get_diagnosis':
                    break;
                case 'search_diagnoses':
                    break;
        
                default:
                    break;
            }
        }
    }

    return { ...authenticated, yes: isAllowed, };
}
