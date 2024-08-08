export type PagePermission = 
    // pages
    'users_page' | 
    'general_settings_page' |
    'emails_settings_page' |
    'logs_settings_page' |
    'system_settings_page' |
    'app_settings_page';

export type DataAction = 
    // mailer
    'get_mailer_settings' |
    'save_mailer_settings' |
    'delete_mailer_settings' |
    
    // logs
    'view_logs' |
    
    // files
    'upload_files' |
    'get_files' |
    'delete_files' |

    // permissions actions
    'create_permissions' | 
    'update_permissions' | 
    'delete_permissions' | 
    'get_permissions' |
    'get_permission' |
    'search_permissions' |
    
    // users actions
    'create_users' | 
    'update_users' | 
    'delete_users' | 
    'get_users' |
    'get_user' |
    'search_users' |

    // hospitals actions
    'create_hospitals' | 
    'update_hospitals' | 
    'delete_hospitals' | 
    'get_hospitals' |
    'get_hospital' |
    'search_hospitals' |

    // configuration actions
    'create_config_keys' | 
    'update_config_keys' | 
    'delete_config_keys' | 
    'get_config_keys' |
    'get_config_key' |
    'search_config_keys' |

    // scripts actions
    'import_scripts' |
    'create_scripts' | 
    'update_scripts' | 
    'delete_scripts' | 
    'get_scripts' |
    'get_script' |
    'search_scripts' |

    // screens actions
    'create_screens' | 
    'update_screens' | 
    'delete_screens' | 
    'get_screens' |
    'get_screen' |
    'search_screens' |

    // diagnoses actions
    'create_diagnoses' | 
    'update_diagnoses' | 
    'delete_diagnoses' | 
    'get_diagnoses' |
    'get_diagnosis' |
    'search_diagnoses';
