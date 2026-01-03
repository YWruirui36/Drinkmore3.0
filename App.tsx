
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import Dashboard from "./Dashboard";
import DrinkForm from "./DrinkForm";
import HistoryList from "./HistoryList";
import { DrinkRecord } from "./types";

/**
 * ✅ 你目前 Supabase 表名是 drink_recordss（多一個 s）
 * 如果你之後改回 drink_records，記得把這裡一起改掉
 */
const TABLE_NAME = "drink_recordss";

/**
 * 兼容 Vite / 非 Vite 的 env 讀法
 */
function getEnv(key: string) {
  // Vite
  // @ts-ignore
  const v = typeof import.meta !== "undefined" ? import.meta.env?.[key] : undefined;
  // CRA / Node
  // @ts-ignore
  const p = typeof process !== "undefined" ? process.env?.[key] : undefined;
  return (v ?? p) as string | undefined;
}

const supabaseUrl = getEnv("VITE_SUPABASE_URL");
const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  // 這個錯誤會出現在 Console，讓你第一時間知道 env 沒讀到
  // 但不會讓整個 app 直接 crash，避免你在部署時看不到畫面
  console.error(
    "[Supabase] Missing env. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env/.env.local and restart dev server."
  );
}

const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

type DbRow = {
  id: string;
  user_id: string;
  brand: string;
  itemName: string;
  moodScore: number;
  price: number;
  timestamp: string; // timestamptz
};

export default function App() {
  // Auth UI
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState<string>("");

  // Session
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Data
  const [records, setRecords] = useState<DrinkRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const totalSpent = useMemo(() => records.reduce((sum, r: any) => sum + (Number(r.price) || 0), 0), [records]);

  // 1) 讀取登入狀態 + 監聽登入/登出
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      const session = data.session;
      setUserEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);
    }

    initSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);

      // 登出就清掉畫面資料
      if (!session) setRecords([]);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // 2) 登入成功後，抓資料
  useEffect(() => {
    if (!userId) return;
    void refreshRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function refreshRecords() {
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as DbRow[];
      setRecords(rows as unknown as DrinkRecord[]);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "讀取資料失敗");
    } finally {
      setLoading(false);
    }
  }

  // --- Auth actions ---
  async function signIn() {
    setAuthMsg("");
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setAuthMsg("登入成功！");
    } catch (e: any) {
      setAuthMsg(e?.message ?? "登入失敗");
    }
  }

  async function signUp() {
    setAuthMsg("");
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setAuthMsg("註冊成功！若你有開啟 Email 驗證，請到信箱完成驗證後再登入。");
    } catch (e: any) {
      setAuthMsg(e?.message ?? "註冊失敗");
    }
  }

  async function signOut() {
    setAuthMsg("");
    setErrorMsg("");

    const { error } = await supabase.auth.signOut();
    if (error) setErrorMsg(error.message);
  }

  // --- Data actions ---
  /**
   * ✅ 這裡假設 DrinkForm onAdd 會傳回一個 DrinkRecord
   * 並且包含 brand / itemName / moodScore / price / timestamp
   */
  async function addRecordHandler(record: DrinkRecord) {
    setErrorMsg("");

    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) throw new Error("尚未登入");

      const payload: Omit<DbRow, "id"> = {
        user_id: uid,
        // @ts-ignore
        brand: (record as any).brand ?? "",
        // @ts-ignore
        itemName: (record as any).itemName ?? "",
        // @ts-ignore
        moodScore: Number((record as any).moodScore ?? 0),
        // @ts-ignore
        price: Number((record as any).price ?? 0),
        // @ts-ignore
        timestamp: (record as any).timestamp
          ? new Date((record as any).timestamp).toISOString()
          : new Date().toISOString(),
      };

      const { error } = await supabase.from(TABLE_NAME).insert(payload);
      if (error) throw error;

      await refreshRecords();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "新增失敗");
    }
  }

  async function deleteRecordHandler(id: string) {
    if (!window.confirm("確定要刪除這筆紀錄嗎？")) return;
    setErrorMsg("");

    try {
      const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
      if (error) throw error;

      setRecords((prev) => prev.filter((r: any) => (r as any).id !== id));
    } catch (e: any) {
      setErrorMsg(e?.message ?? "刪除失敗");
    }
  }

  // --- UI ---
  if (!userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6EC] p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#E6D8C8] p-5">
          <div className="text-lg font-black text-[#4A3F35]">登入 / 註冊</div>
          <div className="text-xs mt-1 text-[#7A6B5E]">
            連接 Supabase（表：<span className="font-bold">{TABLE_NAME}</span>）
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs font-bold text-[#7A6B5E] mb-1">Email</div>
              <input
                className="w-full h-10 rounded-xl border border-[#E6D8C8] px-3 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="text-xs font-bold text-[#7A6B5E] mb-1">Password</div>
              <input
                className="w-full h-10 rounded-xl border border-[#E6D8C8] px-3 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="至少 6 碼"
              />
            </div>

            <div className="flex gap-2">
              <button
                className="h-10 px-4 rounded-xl text-white font-extrabold bg-[#C8A27A] shadow"
                onClick={signIn}
              >
                登入
              </button>
              <button className="h-10 px-4 rounded-xl font-extrabold border border-[#E6D8C8]" onClick={signUp}>
                註冊
              </button>
            </div>

            {authMsg ? <div className="text-xs font-bold text-[#E07A5F]">{authMsg}</div> : null}
            {errorMsg ? <div className="text-xs font-bold text-red-600">{errorMsg}</div> : null}

            {!supabaseUrl || !supabaseAnonKey ? (
              <div className="text-[11px] text-red-600 font-bold">
                目前讀不到環境變數：請確認 .env.local 有設定 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY，並重開 npm run
                dev
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF6EC] text-[#4A3F35]">
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-black">Drink Tracker</div>
            <div className="text-xs text-[#7A6B5E] mt-1">
              已登入：<span className="font-bold">{userEmail}</span> · 總花費：{" "}
              <span className="font-bold">${totalSpent}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="h-9 px-3 rounded-xl border border-[#E6D8C8] font-extrabold" onClick={refreshRecords}>
              重新整理
            </button>
            <button className="h-9 px-3 rounded-xl bg-white rounded-xl border border-[#E6D8C8] font-extrabold" onClick={signOut}>
              登出
            </button>
          </div>
        </div>

        {errorMsg ? <div className="mt-3 text-sm font-bold text-red-600">{errorMsg}</div> : null}
        {loading ? <div className="mt-3 text-sm font-bold text-[#7A6B5E]">載入中…</div> : null}

        {/* 你的既有元件：Dashboard / DrinkForm / HistoryList */}
        <div className="mt-4">
          <Dashboard records={records} />
        </div>

        <div className="mt-4">
          <DrinkForm onAdd={addRecordHandler as any} />
        </div>

        <div className="mt-4">
          <HistoryList records={records} onDelete={deleteRecordHandler as any} />
        </div>
      </div>
    </div>
  );
}
