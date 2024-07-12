// 在浏览器中使用 Web Crypto API 实现与 Node.js 代码类似的功能

// 生成指定长度的随机字节
async function generatorRandomBytes(count: number) {
  const randomValues = new Uint8Array(count);
  window.crypto.getRandomValues(randomValues);
  return randomValues;
}

// 将随机字节转换为十六进制字符串
function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// 生成32字节的密钥
async function generatorKey() {
  const key = await generatorRandomBytes(32);
  return bytesToHex(key);
}

// 生成16字节的初始化向量（IV）
async function generatorIv() {
  const iv = await generatorRandomBytes(16);
  return bytesToHex(iv);
}

// 生成AES签名（包含密钥和IV）
export async function generatorAesSign() {
  const key = await generatorKey();
  const iv = await generatorIv();
  return { key, iv };
}