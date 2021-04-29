import fetch from "node-fetch";
import * as vscode from "vscode";
import {
  refreshTokenKey,
  accessTokenKey,
  apiBaseUrl,
  gifUploadLimit,
} from "./constants";
import { Util } from "./util";

export const mutationNoErr = async (path: string, body: any) => {
  try {
    const d = await mutation(path, body);
    return d;
  } catch { }
};

export const mutation = async (path: string, body: any) => {
  try {
    const r = await fetch(apiBaseUrl + path, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        "access-token": Util.getAccessToken(),
        "refresh-token": Util.getRefreshToken(),
      },
    });
    if (r.status !== 200) {
      throw new Error(await r.text());
    }
    const accessToken = r.headers.get("access-token");
    const refreshToken = r.headers.get("refresh-token");
    if (accessToken && refreshToken) {
      await Util.context.globalState.update(accessTokenKey, accessToken);
      await Util.context.globalState.update(refreshTokenKey, refreshToken);
    }
    const d = await r.json();
    return d;
  } catch (err) {
    console.log(err);
    vscode.window.showErrorMessage(err.message);
    throw err;
  }
};

// https://cloud.google.com/storage/docs/xml-api/reference-headers#xgoogcontentlengthrange
export const cloudUpload = async (signedUrl: string, file: any) => {
  try {
    if (Util.getAccessToken() === "") {
      throw new Error("not authenticated!");
    }
    const r = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "content-type": "image/gif",
        "x-goog-content-length-range": `1,${gifUploadLimit}`,
      },
    });
    if (r.status !== 200) {
      throw new Error(await r.text());
    }
    const accessToken = r.headers.get("access-token");
    const refreshToken = r.headers.get("refresh-token");
    if (accessToken && refreshToken) {
      await Util.context.globalState.update(accessTokenKey, accessToken);
      await Util.context.globalState.update(refreshTokenKey, refreshToken);
    }
  } catch (err) {
    console.log(err);
    vscode.window.showErrorMessage(err.message);
    throw err;
  }
};
