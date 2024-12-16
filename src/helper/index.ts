import crypto from 'crypto'

export const random = () => crypto.randomBytes(128).toString('base64')

export const encryptPassword = ( salt : string, password : string) => {
    return crypto.createHmac('sha256',[salt,password].join('/')).update(process.env.PASSWORD_ENCRYPTION_SECRET).digest('hex');
} 