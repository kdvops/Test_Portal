const base64ToBytes = (base64: string) => {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0) || 0);
}

const bytesToBase64 = (bytes: any) => {
  const binString = Array.from(bytes, (byte: any) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}

const isBase64 = (str: string): boolean => {
  return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(str);
};

export const encrypt = (data: string): string => {
  const encoded = bytesToBase64(new TextEncoder().encode(data));
  return encoded;
};

export const decrypt = (data: string): string => {
  if (!isBase64(data)) {
    return data;
  }

  const decoded: string = new TextDecoder().decode(base64ToBytes(data))
  return decoded;
};
