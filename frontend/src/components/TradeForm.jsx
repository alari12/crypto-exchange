import React, { useState } from "react";
import { API } from "../api";

export default function TradeForm({ username, assets }){
  const [symbol, setSymbol] = useState(assets[0]?.symbol || "BTC");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState(0.01);
  const [message, setMessage] = useState("");

  // update symbol when assets change
  React.useEffect(()=> {
    if (assets.length) setSymbol(assets[0].symbol);
  }, [assets]);

  async function submit(e){
    e.preventDefault();
    try {
      const res = await API.post("/trade", { username, symbol, side, amount });
      setMessage("Trade executed: " + JSON.stringify(res.data.trade));
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
    }
  }

  return (
    <div style={{marginTop: "1rem"}}>
      <h3>Place Trade</h3>
      <form onSubmit={submit}>
        <div>
          <label>Asset</label>
          <select value={symbol} onChange={e=>setSymbol(e.target.value)}>
            {assets.map(a=> <option key={a.symbol} value={a.symbol}>{a.symbol} - {a.name} (${a.price})</option>)}
          </select>
        </div>
        <div>
          <label>Side</label>
          <select value={side} onChange={e=>setSide(e.target.value)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div>
          <label>Amount</label>
          <input type="number" step="any" value={amount} onChange={e=>setAmount(e.target.value)} />
        </div>
        <button type="submit">Execute</button>
      </form>
      <div>{message}</div>
    </div>
  );
}
