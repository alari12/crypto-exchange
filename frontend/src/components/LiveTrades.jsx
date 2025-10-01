import React from "react";

export default function LiveTrades({ trades=[] }){
  return (
    <div>
      <h3>Live Trades</h3>
      <div style={{maxHeight: 300, overflowY: "auto"}}>
        {trades.map(t => (
          <div key={t.id} style={{borderBottom:"1px solid #eee", padding:"6px 0"}}>
            <strong>{t.display_name || t.user_id}</strong> {t.side} {t.amount} {t.symbol} @ ${Number(t.price).toFixed(2)} <small>({new Date(t.created_at).toLocaleString()})</small>
          </div>
        ))}
      </div>
    </div>
  );
}
