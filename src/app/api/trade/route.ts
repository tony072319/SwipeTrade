import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    asset,
    assetType,
    timeframe,
    direction,
    leverage,
    entryPrice,
    exitPrice,
    betAmount,
    pnl,
    isDailyChallenge,
    dailyChallengeDate,
  } = body;

  // Insert trade
  const { error: tradeError } = await supabase.from("trades").insert({
    user_id: user.id,
    asset,
    asset_type: assetType,
    timeframe,
    direction,
    leverage,
    entry_price: entryPrice,
    exit_price: exitPrice,
    bet_amount: betAmount,
    pnl,
    is_daily_challenge: isDailyChallenge ?? false,
    daily_challenge_date: dailyChallengeDate ?? null,
  });

  if (tradeError) {
    return NextResponse.json({ error: tradeError.message }, { status: 500 });
  }

  // Update profile stats
  const isWin = pnl > 0;
  const { data: profile } = await supabase
    .from("profiles")
    .select("balance, total_trades, winning_trades, total_pnl")
    .eq("id", user.id)
    .single();

  if (profile) {
    await supabase
      .from("profiles")
      .update({
        balance: Math.round((profile.balance + pnl) * 100) / 100,
        total_trades: profile.total_trades + 1,
        winning_trades: profile.winning_trades + (isWin ? 1 : 0),
        total_pnl: Math.round((profile.total_pnl + pnl) * 100) / 100,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  return NextResponse.json({ success: true });
}
