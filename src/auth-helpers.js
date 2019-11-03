export function randomString(length) {
  const validChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  array = array.map(x => validChars.charCodeAt(x % validChars.length));
  return String.fromCharCode(...array);
}

export function urlEncodeB64(input) {
  const b64Chars = { "+": "-", "/": "_", "=": "" };
  return input.replace(/[+/=]/g, m => b64Chars[m]);
}

export function bufferToBase64UrlEncoded(input) {
  var bytes = new Uint8Array(input);
  return urlEncodeB64(window.btoa(String.fromCharCode(...bytes)));
}

export function sha256(message) {
  let encoder = new TextEncoder();
  let data = encoder.encode(message);
  return window.crypto.subtle.digest("SHA-256", data);
}

export async function getAuthUrl(redirect = null) {
  const state = randomString(32);
  const codeVerifier = randomString(32);
  const codeChallenge = await sha256(codeVerifier).then(
    bufferToBase64UrlEncoded
  );
  // window.location.href = "";
  sessionStorage.setItem(`login-code-verifier-${state}`, codeVerifier);

  const authorizationEndpointUrl = new URL(
    `${process.env.REACT_APP_AUTH_URL}/oauth/authorize`
  );

  // here we encode the authorization request
  const searchParams = new URLSearchParams({
    redirect_uri:
      redirect || `${window.location.protocol}//${window.location.host}/`,
    client_id: process.env.REACT_APP_CLIENT_ID,
    response_type: "code",
    scope: "offline_access",
    code_challenge: codeChallenge,
    code_challenge_method: "s256",
    state: state
  });

  authorizationEndpointUrl.search = searchParams.toString();
  return authorizationEndpointUrl.toString();
}
