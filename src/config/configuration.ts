export default () => ({
    ACCESS_TOKEN_PUBLIC_KEY: Buffer.from(process.env.ACCESS_TOKEN_PUBLIC_KEY_BASE64, 'base64').toString('ascii'),
    ACCESS_TOKEN_PRIVATE_KEY: Buffer.from(process.env.ACCESS_TOKEN_PRIVATE_KEY_BASE64, 'base64').toString('ascii'),
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
})