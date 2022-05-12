export default () => ({
    PORT : process.env.PORT ?? 3000,
    ACCESS_TOKEN_PUBLIC_KEY: Buffer.from(process.env.ACCESS_TOKEN_PUBLIC_KEY_BASE64, 'base64').toString('ascii'),
    ACCESS_TOKEN_PRIVATE_KEY: Buffer.from(process.env.ACCESS_TOKEN_PRIVATE_KEY_BASE64, 'base64').toString('ascii'),
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_PUBLIC_KEY: Buffer.from(process.env.REFRESH_TOKEN_PUBLIC_KEY_BASE64, 'base64').toString('ascii'),
    REFRESH_TOKEN_PRIVATE_KEY: Buffer.from(process.env.REFRESH_TOKEN_PRIVATE_KEY_BASE64, 'base64').toString('ascii'),
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDER_IDENTITY: process.env.SENDER_IDENTITY,
})