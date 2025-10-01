import React, { useEffect, useState } from "react";
import { API } from "./api";
import io from "socket.io-client";
import Wallet from "./components/Wallet";
import TradeForm from "./components/TradeForm";
import LiveTrades from "./components/LiveTrades";
import Testimonials from "./components/Testimonials";
import AdminPanel from "./components/AdminPanel";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000");

export default function App(){
  const [assets, setAssets] = useState([]);
  const [trades, setTrades] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [username, setUsername] = useState("alice"); // demo user toggle

  useEffect(()=>{
    API.get("/assets").then(r => setAssets(r.data));
    API.get("/trades").then(r => setTrades(r.data));
    API.get("/testimonials").then(r => setTestimonials(r.data));
  },[]);

  useEffect(()=>{
    socket.on("new_trade", (t) => {
      setTrades(prev => [t, ...prev].slice(0, 100));
    });
    socket.on("new_testimonial", (tm) => {
      setTestimonials(prev => [tm, ...prev].slice(0,100));
    });
    return ()=> { socket.off("new_trade"); socket.off("new_testimonial"); }
  },[]);

  return (
    <div className="container">
      <div className="header">
        <h1>Play Crypto Exchange (Demo)</h1>
        <div>
          <label>Username: </label>
          <select value={username} onChange={e=>setUsername(e.target.value)}>
            <option value="alice">alice</option>
            <option value="bob">bob</option>
          </select>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem"}}>
        <div className="card">
          <Wallet username={username} />
          <TradeForm username={username} assets={assets}/>
        </div>

        <div className="card">
          <LiveTrades trades={trades} />
          <Testimonials testimonials={testimonials} />
        </div>
      </div>

      <div style={{marginTop: "1rem"}} className="card">
        <AdminPanel />
      </div>
    </div>
  );
}
