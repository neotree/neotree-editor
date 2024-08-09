namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: string;
        NEOTREE_ENV: string;
        HOSTNAME: string;
        LOGGER:string;
        PORT: string;
        POSTGRES_DB_URL: string;
        SESSION_POSTGRES_DB_URL: string;
        MONGODB_URL: string;
        NODEMAILER_PW: string;
        NODEMAILER_EMAIL: string;
        NEXT_PUBLIC_APP_NAME: string;
        NEXT_PUBLIC_APP_URL: string;
        NEXTAUTH_SECRET: string;
    }
}
