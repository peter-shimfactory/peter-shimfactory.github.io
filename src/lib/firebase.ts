import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3sord-WBI824u7xH6l9TUHqPQZ0lTn6g",
  authDomain: "uptendo-b8141.firebaseapp.com",
  projectId: "uptendo-b8141",
  storageBucket: "uptendo-b8141.firebasestorage.app",
  messagingSenderId: "448425389575",
  appId: "1:448425389575:web:e0e8634a7e87a7b84d84a2",
};

export const app = initializeApp(firebaseConfig);

/** Firestore — 주문·공급사·재고·리포트 데이터 저장소 */
export const db = getFirestore(app);

/** Auth — 사장님 계정 인증 (카페24 OAuth 연동 예정) */
export const auth = getAuth(app);
