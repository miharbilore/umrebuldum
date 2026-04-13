import {
  initializeApp,
  getApps,
  cert,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return getAuth(getApps()[0]);
  }

  // Parse service account from env (JSON string)
  const serviceAccount: ServiceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "{}"
  );

  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  return getAuth(app);
}

export const adminAuth = getFirebaseAdmin();
