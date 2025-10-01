import React, { useEffect, useState } from "react";
import { API } from "../api";

export default function Wallet({ username }){
  const [wallet, setWallet] = useState(null);
  useEffect(()=>{
    if (!username) return;
    API.get(`/me/${username}`).then(r => {
      setWallet(r.data.wallet);
    }).catch(()=>setWallet(null));
  },[username]);

  return (
    <div>
      <h2>Wallet</h2>
      {wallet ? (
        <div>
          <p>Wallet ID: {wallet.id}</p>
          <ul>
            {Object.entries(wallet.balance || {}).map(([k,v])=>(
              <li key={k}>{k}: {Number(v).toFixed(6)}</li>
            ))}
          </ul>
        </div>
      ) : <p>Loading wallet...</p>}
    </div>
  );
}
