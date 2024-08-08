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
        { source: '/file/:fileId', destination: '/api/files/:fileId' },
        { source: '/files/:fileId', destination: '/api/files/:fileId' },
    ],
};

export default nextConfig;
