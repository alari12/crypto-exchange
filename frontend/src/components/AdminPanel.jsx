import React, { useState } from "react";
import { API } from "../api";

export default function AdminPanel(){
  const [username, setUsername] = useState("alice");
  const [passcode, setPasscode] = useState("2486");
  const [balances, setBalances] = useState('{"BTC":0.1,"ETH":1,"USDT":1000}');
  const [message, setMessage] = useState("");

  async function setBalance(e){
    e.preventDefault();
    try {
      const parsed = JSON.parse(balances);
      const res = await API.post("/admin/set-balance", { passcode, username, newBalance: parsed });
      setMessage("Updated: " + JSON.stringify(res.data.wallet));
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
    }
  }

  return (
    <div>
      <h3>Admin Panel (Demo)</h3>
      <form onSubmit={setBalance}>
        <div>
          <label>User</label>
          <select value={username} onChange={e=>setUsername(e.target.value)}>
            <option value="alice">alice</option>
            <option value="bob">bob</option>
          </select>
        </div>
        <div>
          <label>Passcode</label>
          <input value={passcode} onChange={e=>setPasscode(e.target.value)} />
        </div>
        <div>
          <label>Balances (JSON)</label>
          <textarea value={balances} onChange={e=>setBalances(e.target.value)} rows={4} />
        </div>
        <button type="submit">Set Balance</button>
      </form>
      <div>{message}</div>
      <p style={{color:"#a00"}}>Note: passcode default "2486". This is demo-only.</p>
    </div>
  );
}
