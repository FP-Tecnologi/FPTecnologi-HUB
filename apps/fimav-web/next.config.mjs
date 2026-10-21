/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: '/legal/reclamaciones', destination: '/libro-de-reclamaciones', permanent: true }];
  },
};
export default nextConfig;
