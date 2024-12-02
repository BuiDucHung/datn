import CryptoJS from 'crypto-js';

const secret_key = 'TbEQb0TDG9D64Xt544xLFofSBmxtJ7l6';

function getMd5(account, password) {
  var hash = CryptoJS.MD5(account.toLowerCase() + '.' + password);
  return hash;
}

export const encodePassword = (userName: string, password: string): string => {
  let passEncrypted = CryptoJS.AES.encrypt(userName + '_' + password, secret_key).toString();
  // passEncrypted = '8287cb17da36320f7bb4e4712ecd27b84f4f1684120745555c7ac94c5a0feb95'
  return passEncrypted;
};

export function encrypt(account: string, password: string): string {
  const keyMD5 = getMd5(account, password).toString();
  const keyHex = CryptoJS.enc.Utf8.parse(keyMD5);
  const encrypted = CryptoJS.DES.encrypt(password, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}
