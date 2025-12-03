// src/auth.js
import { UserManager } from "oidc-client-ts";

const config = {
  authority: "http://localhost:8080/realms/security-lab",
  client_id: "spa-unsafe",
  redirect_uri: "http://localhost:5173/callback",
  post_logout_redirect_uri: "http://localhost:5173/",
  response_type: "code", // Authorization Code Flow
  scope: "openid profile email", // reicht für dieses Lab
};

export const userManager = new UserManager(config);

export function login() {
  return userManager.signinRedirect();
}

export function logout() {
  return userManager.signoutRedirect();
}

export function handleCallback() {
  return userManager.signinRedirectCallback();
}
