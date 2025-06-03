/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // เปลี่ยนจาก domains: ['artopia-web.s3.ap-southeast-2.amazonaws.com'] 
    // เป็น remotePatterns แทน
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'artopia-web.s3.ap-southeast-2.amazonaws.com',
        port: '',         // ปล่อยว่างก็ได้ (ไม่มีพอร์ตเจาะจง)
        pathname: '/**',  // ให้โหลดภาพทุก path ในโฟลเดอร์นั้นได้
      },
    ],
  },
};

export default nextConfig;
