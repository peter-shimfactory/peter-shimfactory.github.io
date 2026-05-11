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

// ------------------------------------------------------------------
// 내부 헬퍼: Cafe24 Access Token 자동 갱신
// ------------------------------------------------------------------
async function refreshCafe24AccessToken(mallId: string): Promise<string> {
  const tokenDoc = await db.collection("cafe24Tokens").doc(mallId).get();
  if (!tokenDoc.exists) throw new functions.https.HttpsError("not-found", "연동 정보가 없습니다.");

  const { refreshToken } = tokenDoc.data() as { refreshToken: string };
  const clientId = process.env.CAFE24_CLIENT_ID;
  const clientSecret = process.env.CAFE24_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new functions.https.HttpsError("internal", "서버 환경변수 미설정");

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`https://${mallId}.cafe24api.com/api/v2/oauth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }).toString(),
  });

  if (!res.ok) throw new functions.https.HttpsError("internal", `토큰 갱신 실패: ${res.status}`);

  const t = (await res.json()) as { access_token: string; refresh_token: string; expires_at: string };
  await db.collection("cafe24Tokens").doc(mallId).update({
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    expiresAt: t.expires_at,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return t.access_token;
}

// ------------------------------------------------------------------
// 카페24 주문 목록 조회
// Callable: cafe24GetOrders
//  body: { mallId: string, days?: number }
//  반환: { orders: MappedOrder[] }
// ------------------------------------------------------------------
interface Cafe24OrderItem {
  product_name: string;
  quantity: number;
  product_no?: number;
}

interface Cafe24Order {
  order_id: string;
  order_date: string;
  member_id: string | null;
  buyer_name: string;
  buyer_phone: string;
  buyer_cellphone: string;
  total_amount: string;
  payment_amount: string;
  order_status: string;
  items: Cafe24OrderItem[];
  // 수신자 정보 (주문 상세에 포함될 수 있음)
  receiver_name?: string;
  receiver_address1?: string;
  receiver_address2?: string;
  receiver_phone?: string;
  receiver_cellphone?: string;
}

const CAFE24_STATUS_MAP: Record<string, string> = {
  paid: "paid",
  preparing: "preparing",
  prepared: "preparing",
  indelivery: "shipped",
  delivering: "shipped",
  delivered: "delivered",
  cancel_request: "cancel_request",
  cancelled: "cancelled",
  refund_request: "cancel_request",
  refunded: "refunded",
  exchange_request: "cancel_request",
  exchanged: "delivered",
};

function maskPhone(phone: string): string {
  if (!phone) return "";
  return phone.replace(/(\d{3,4})-?(\d{2,4})-?(\d{4})$/, (_, a, _b, c) => `${a}-****-${c}`);
}

export const cafe24GetOrders = functions
  .region("asia-northeast3")
  .https.onCall(async (data: { mallId: string; days?: number }) => {
    const { mallId, days = 30 } = data;

    if (!mallId) {
      throw new functions.https.HttpsError("invalid-argument", "mallId가 필요합니다.");
    }

    const tokenDoc = await db.collection("cafe24Tokens").doc(mallId).get();
    if (!tokenDoc.exists) {
      throw new functions.https.HttpsError("not-found", "연동 정보가 없습니다. 설정에서 카페24를 다시 연동해 주세요.");
    }

    const tokenData = tokenDoc.data() as { accessToken: string; expiresAt: string };
    let accessToken = tokenData.accessToken;

    // 만료 5분 전이면 자동 갱신
    if (new Date(tokenData.expiresAt).getTime() - Date.now() < 5 * 60 * 1000) {
      accessToken = await refreshCafe24AccessToken(mallId);
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().split("T")[0];

    const params = new URLSearchParams({
      limit: "100",
      offset: "0",
      start_date: fmt(startDate),
      end_date: fmt(endDate),
    });

    const response = await fetch(
      `https://${mallId}.cafe24api.com/api/v2/orders?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Cafe24-Api-Version": "2024-06-01",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 401) {
      // 강제 갱신 후 재시도
      const newToken = await refreshCafe24AccessToken(mallId);
      const retry = await fetch(
        `https://${mallId}.cafe24api.com/api/v2/orders?${params}`,
        {
          headers: {
            Authorization: `Bearer ${newToken}`,
            "X-Cafe24-Api-Version": "2024-06-01",
            "Content-Type": "application/json",
          },
        }
      );
      if (!retry.ok) {
        throw new functions.https.HttpsError("unauthenticated", "인증 오류. 카페24를 다시 연동해 주세요.");
      }
      const json2 = (await retry.json()) as { orders: Cafe24Order[] };
      return mapOrders(json2.orders ?? []);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[cafe24GetOrders] API Error:", response.status, errorText);
      throw new functions.https.HttpsError("internal", `카페24 API 오류: ${response.status}`);
    }

    const json = (await response.json()) as { orders: Cafe24Order[] };
    return mapOrders(json.orders ?? []);
  });

function mapOrders(orders: Cafe24Order[]) {
  return {
    orders: orders.map((o) => ({
      id: o.order_id,
      createdAt: o.order_date,
      customerName: o.buyer_name,
      isVip: false, // VIP 판별은 별도 member API 필요 — 추후 구현
      items: (o.items ?? []).map((item) => ({
        name: item.product_name,
        qty: Number(item.quantity),
      })),
      total: parseFloat(o.payment_amount || o.total_amount || "0"),
      status: CAFE24_STATUS_MAP[o.order_status] ?? "paid",
      address: [o.receiver_address1, o.receiver_address2].filter(Boolean).join(" "),
      phone: maskPhone(o.buyer_cellphone || o.buyer_phone || ""),
    })),
  };
}
