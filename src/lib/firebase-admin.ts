import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

function getCredential() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    return cert(JSON.parse(json));
  }

  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path) {
    const contents = readFileSync(resolve(process.cwd(), path), "utf8");
    return cert(JSON.parse(contents));
  }

  throw new Error(
    "Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH."
  );
}

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  return initializeApp({
    credential: getCredential(),
  });
}

let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    if (!authInstance) {
      authInstance = getAuth(getAdminApp());
    }
    const value = Reflect.get(authInstance, prop, receiver);
    return typeof value === "function" ? value.bind(authInstance) : value;
  },
});

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    if (!dbInstance) {
      dbInstance = getFirestore(getAdminApp());
    }
    const value = Reflect.get(dbInstance, prop, receiver);
    return typeof value === "function" ? value.bind(dbInstance) : value;
  },
});
