export const INJECT_AUTH_LOGIN_ANDROID = `
  function getToken() {
    var token = window.localStorage.getItem('at');
    if (token) { 
      window.postMessage(token)
      window.ReactNativeWebView.postMessage(token)
    }
  } 
  getToken() 
`;

export const INJECT_AUTH_LOGIN_IOS = `
  function getToken() {
    var token = window.localStorage.getItem('at');
    if (token) { 
      window.ReactNativeWebView.postMessage(token)
    }
  } 
  getToken() 
`;

export const INJECT_AUTH_LOGOUT_IOS = `
  window.localStorage.clear()
  window.sessionStorage.clear()
  localStorage.clear()
  sessionStorage.clear()
  var data = {
    ls: JSON.stringify(window.localStorage),
    ss: JSON.stringify(window.sessionStorage)
  }
  window.ReactNativeWebView.clearCache(true)
  window.postMessage()
  window.ReactNativeWebView.postMessage() 
  
`;

export const INJECT_AUTH_LOGOUT_ANDROID = `
function clearCache() {
  window.localStorage.clear()
  window.sessionStorage.clear()
  localStorage.clear()
  sessionStorage.clear()
  var data = {
    ls: JSON.stringify(window.localStorage),
    ss: JSON.stringify(window.sessionStorage)
  }
  window.clearCache(true)
  window.ReactNativeWebView.postMessage() 
  window.postMessage() 
}

clearCache()
`;
