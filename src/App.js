import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { getAuthUrl } from "./auth-helpers";
function logout(e) {
  e.preventDefault();
  const logoutUrl = new URL(`${process.env.REACT_APP_AUTH_URL}/auth/logout`);
  const params = new URLSearchParams({
    redirect_to: `${process.env.REACT_APP_APP_URL}/`
  });
  logoutUrl.search = params.toString();
  window.location.href = "";
  sessionStorage.removeItem("token");
  window.location.assign(logoutUrl.toString());
}
function App() {
  const [url, setUrl] = useState(false);
  const [params, setParams] = useState(new URLSearchParams(""));
  const [user, setUser] = useState({});
  const token = sessionStorage.getItem("token");
  useEffect(() => {
    getUrl();
  }, []);
  async function getUrl() {
    if (!token) {
      const url = await getAuthUrl();
      setUrl(url);
    }
  }
  useEffect(() => {
    if (params.get("code")) {
      getBearer(params);
    }
  }, [params]);
  async function getBearer(_params) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_AUTH_URL}/auth/code`,
        {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          redirect: "follow", // manual, *follow, error
          referrer: "no-referrer", // no-referrer, *client
          body: _params.toString() // body data type must match "Content-Type" header
        }
      );
      const data = await response.json();
      const state = _params.get("state");
      window.location.href = "/";
      sessionStorage.removeItem(`login-code-verifier-${state}`);
      if (data) {
        sessionStorage.setItem("token", data.token);
        const response = await fetch(`${process.env.REACT_APP_AUTH_URL}/me`, {
          headers: {
            Authorization: `Bearer ${data.token}`
          }
        });
        const user = await response.json();
        setUser(user);
      }
    } catch (err) {
      /* noop */
    }
  }
  useEffect(() => {
    if (token) {
      getUser();
    }
  }, [token]);
  async function getUser() {
    try {
      const response = await fetch(`${process.env.REACT_APP_AUTH_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const user = await response.json();
      setUser(user);
    } catch (err) {}
  }
  useEffect(() => {
    if (window.location.search) {
      const _params = new URLSearchParams(window.location.search);
      const state = _params.get("state");
      const code_verifier = sessionStorage.getItem(
        `login-code-verifier-${state}`
      );
      if (code_verifier) {
        const requestParams = new URLSearchParams({
          code: _params.get("code"),
          code_method_challenge: "s256",
          grant_type: "authorization_code",
          redirect_uri: `${window.location.protocol}//${window.location.host}/`,
          scope: "offline_access",
          client_id: process.env.REACT_APP_CLIENT_ID,
          code_verifier
        });
        setParams(requestParams);
      }
    }
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {url && (
          <a className="App-link" href={url}>
            Login
          </a>
        )}
        {user.person && user.person.name && (
          <>
            <h1>{user.person.name}</h1>
            <a className="App-link" href="#" onClick={logout}>
              Logout
            </a>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
