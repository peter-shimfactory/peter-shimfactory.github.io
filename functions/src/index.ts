import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

// ------------------------------------------------------------------
// 카페24 OAuth 토큰 교환
// POST /cafe24ExchangeToken
//  body: { code: string, mallId: string }
//
// 환경변수 (firebase functions:config:set 또는 .env.local):
//   CAFE24_CLIENT_ID
//   CAFE24_CLIENT_SECRET
//   CAFE24_REDIRECT_URI  (예: https://peter-shimfactory.github.io/auth/callback)
// ------------------------------------------------------------------
export const cafe24ExchangeToken = functions
  .region("asia-northeast3") // 서울
  .https.onCall(async (data: { code: string; mallId: string }, context) => {
    const { code, mallId } = data;

    if (!code || !mallId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "code와 mallId가 필요합니다."
      );
    }

    const clientId = process.env.CAFE24_CLIENT_ID;
    const clientSecret = process.env.CAFE24_CLIENT_SECRET;
    const redirectUri =
      process.env.CAFE24_REDIRECT_URI ||
      "https://peter-shimfactory.github.io/auth/callback";

    if (!clientId || !clientSecret) {
      throw new functions.https.HttpsError(
        "internal",
        "서버 환경변수가 설정되지 않았습니다."
      );
    }

    // 카페24 토큰 교환 요청
    const tokenUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/token`;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[cafe24ExchangeToken] 토큰 교환 실패:", response.status, errorText);
      throw new functions.https.HttpsError(
        "internal",
        `카페24 토큰 교환 실패: ${response.status}`
      );
    }

    const tokenData = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_at: string;
      client_id: string;
      mall_id: string;
      shop_no: number;
      user_id: string;
      scopes: string[];
    };

    // Firestore에 토큰 저장 (mallId를 문서 ID로 사용)
    await db.collection("cafe24Tokens").doc(mallId).set({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_at,
      mallId: tokenData.mall_id,
      userId: tokenData.user_id,
      scopes: tokenData.scopes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.info("[cafe24ExchangeToken] 토큰 저장 완료:", mallId);

    return {
      success: true,
      mallId: tokenData.mall_id,
      userId: tokenData.user_id,
      expiresAt: tokenData.expires_at,
    };
  });

// ------------------------------------------------------------------
// 카페24 Access Token 갱신 (Refresh Token 사용)
// POST /cafe24RefreshToken
//  body: { mallId: string }
// ------------------------------------------------------------------
export const cafe24RefreshToken = functions
  .region("asia-northeast3")
  .https.onCall(async (data: { mallId: string }, _context) => {
    const { mallId } = data;

    if (!mallId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "mallId가 필요합니다."
      );
    }

    const tokenDoc = await db.collection("cafe24Tokens").doc(mallId).get();
    if (!tokenDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "저장된 토큰이 없습니다. 다시 연동해 주세요."
      );
    }

    const { refreshToken } = tokenDoc.data() as { refreshToken: string };

    const clientId = process.env.CAFE24_CLIENT_ID;
    const clientSecret = process.env.CAFE24_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new functions.https.HttpsError("internal", "서버 환경변수가 설정되지 않았습니다.");
    }

    const tokenUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/token`;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new functions.https.HttpsError(
        "internal",
        `토큰 갱신 실패: ${response.status}`
      );
    }

    const tokenData = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_at: string;
    };

    await db.collection("cafe24Tokens").doc(mallId).update({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_at,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, expiresAt: tokenData.expires_at };
  });
