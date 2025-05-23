/**
 * Base64 utilities for React Native
 */

/**
 * Decodes a base64 string to a utf-8 string
 * @param input Base64 encoded string
 * @returns Decoded string
 */
export function atob(input: string): string {
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  
  const output = [];
  let chr1, chr2, chr3;
  let enc1, enc2, enc3, enc4;
  let i = 0;
  
  // Remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));
    
    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    
    output.push(String.fromCharCode(chr1));
    
    if (enc3 !== 64) {
      output.push(String.fromCharCode(chr2));
    }
    if (enc4 !== 64) {
      output.push(String.fromCharCode(chr3));
    }
  } while (i < input.length);
  
  return output.join('');
}

/**
 * Encodes a utf-8 string to a base64 string
 * @param input String to encode
 * @returns Base64 encoded string
 */
export function btoa(input: string): string {
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  
  let output = '';
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  let i = 0;
  
  do {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);
    
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    
    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    
    output = output +
      keyStr.charAt(enc1) +
      keyStr.charAt(enc2) +
      keyStr.charAt(enc3) +
      keyStr.charAt(enc4);
  } while (i < input.length);
  
  return output;
}
