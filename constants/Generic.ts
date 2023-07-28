export const INJECT_AUTH_LOGIN = `
  function getToken() {
    var token = window.localStorage.getItem('at');
    if (token) { 
      window.ReactNativeWebView.postMessage(token)
    }
  } 
  getToken() 
`;

export const INJECT_AUTH_LOGOUT = `
  window.localStorage.clear()
  window.sessionStorage.clear()
  var data = {
    ls: JSON.stringify(window.localStorage),
    ss: JSON.stringify(window.sessionStorage)
  }
  window.ReactNativeWebView.postMessage()
`;
