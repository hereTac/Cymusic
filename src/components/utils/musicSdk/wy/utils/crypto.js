// https://github.com/Binaryify/NeteaseCloudMusicApi/blob/master/util/crypto.js
import { btoa } from 'react-native-quick-base64'
import { rsaEncryptSync, AES_MODE, RSA_PADDING } from '../../../nativeModules/crypto'
import { toMD5 } from '../../utils'
 import crypto from 'react-native-quick-crypto'
import { createCipheriv, createDecipheriv, publicEncrypt, randomBytes, createHash } from 'react-native-quick-crypto'
const iv = btoa('0102030405060708')
const presetKey = btoa('0CoJUm6Qyw8W8jud')
const linuxapiKey = btoa('rFgB&h#%2?^eDg:Q')
const publicKey = '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB\n-----END PUBLIC KEY-----'
const eapiKey = btoa('e82ckenh8dichen8')
import { Buffer } from 'buffer';
export async function aesEncrypt(data, key, iv, mode) {
    try {
        const keyBuffer = Buffer.from(key, 'base64');
        const ivBuffer = Buffer.from(iv, 'base64');
        const dataBuffer = Buffer.from(data, 'base64');

        const cipher = createCipheriv(mode, keyBuffer, ivBuffer);
        let encrypted = cipher.update(dataBuffer, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw error;
    }
}


export async function aesDecrypt(data, key, iv, mode) {
    try {
        const keyBuffer = Buffer.from(key, 'base64');
        const ivBuffer = Buffer.from(iv, 'base64');
        const dataBuffer = Buffer.from(data, 'base64');

        const decipher = createDecipheriv(mode, keyBuffer, ivBuffer);
        let decrypted = decipher.update(dataBuffer, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw error;
    }
}

const rsaEncrypt = (buffer, key) => {
  buffer = Buffer.concat([Buffer.alloc(128 - buffer.length), buffer])
  return publicEncrypt({ key, padding: 3 }, buffer)
}
export const weapi = object => {
  const text = JSON.stringify(object)
  const secretKey = String(Math.random()).substring(2, 18)
  return {
    params: aesEncrypt(btoa(aesEncrypt(Buffer.from(text).toString('base64'), AES_MODE.CBC_128_PKCS7Padding, presetKey, iv)), AES_MODE.CBC_128_PKCS7Padding, btoa(secretKey), iv),
    encSecKey: rsaEncrypt(Buffer.from(secretKey).reverse(), publicKey).toString('hex'),
  }
}

export const linuxapi = object => {
  const text = JSON.stringify(object)
  return {
    eparams: Buffer.from(aesEncrypt(Buffer.from(text).toString('base64'), AES_MODE.ECB_128_NoPadding, linuxapiKey, ''), 'base64').toString('hex').toUpperCase(),
  }
}


export const eapi = (url, object) => {
  const text = typeof object === 'object' ? JSON.stringify(object) : object
  const message = `nobody${url}use${text}md5forencrypt`
  const digest = toMD5(message)
  const data = `${url}-36cd479b6b5-${text}-36cd479b6b5-${digest}`
  return {
    params: Buffer.from(aesEncrypt(Buffer.from(data).toString('base64'), AES_MODE.ECB_128_NoPadding, eapiKey, ''), 'base64').toString('hex').toUpperCase(),
  }
}

export const eapiDecrypt = cipherBuffer => {
  return aesDecrypt(cipherBuffer, AES_MODE.ECB_128_NoPadding, eapiKey, '').toString()
}
