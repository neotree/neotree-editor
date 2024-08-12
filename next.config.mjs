/** @type {import('next').NextConfig} */

const nextConfig = {
    distDir: 'build',
    images: {
        domains: [
            'localhost',
            'webeditor.neotree.org',
            'webeditor-dev.neotree.org',
            'zim-webeditor.neotree.org:10243',
            'demo-webeditor.neotree.org',
            'zim-dev-webeditor.neotree.org:10243',
            'zim-dev-nodeapi.neotree.org',
            'nodeapi.neotree.org',
            'nodeapi-dev.neotree.org',
            'zim-nodeapi.neotree.org',
            'demo-nodeapi.neotree.org',
        ],
    },
    rewrites: () => [
        // map old API endpoints to new ones, will delete when all the devices are up to date!
        { source: '/file/:fileId', destination: '/api/files/:fileId' },
        { source: '/files/:fileId', destination: '/api/files/:fileId' },
        { source: '/check-email-registration', destination: '/api/check-email-registration', },
        { source: '/sign-in', destination: '/api/sign-in', },
        { source: '/get-device-registration', destination: '/api/get-device-registration', },
    ],
};

export default nextConfig;
