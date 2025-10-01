import React, { useState } from "react";
import { API } from "../api";

export default function Testimonials({ testimonials = [] }){
  const [text, setText] = useState("");
  const [username, setUsername] = useState("alice");
  async function submit(e){
    e.preventDefault();
    await API.post("/testimonial", { username, text });
    setText("");
  }
  return (
    <div style={{marginTop: "1rem"}}>
      <h3>Testimonials</h3>
      <form onSubmit={submit}>
        <div>
          <label>User</label>
          <select value={username} onChange={e=>setUsername(e.target.value)}>
            <option value="alice">alice</option>
            <option value="bob">bob</option>
          </select>
        </div>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Write a short testimonial" />
        <button type="submit">Post</button>
      </form>

      <div style={{marginTop: "1rem"}}>
        {testimonials.map(t => (
          <div key={t.id} style={{padding: "6px 0", borderBottom: "1px solid #eee"}}>
            <strong>{t.display_name}</strong>: {t.text}
            <div style={{fontSize:"0.8rem", color:"#666"}}>{new Date(t.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
