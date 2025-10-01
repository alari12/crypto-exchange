import { initDb, createUser, createWalletForUser, upsertAsset, createTrade, addTestimonial } from "./models.js";
import db from "./db.js";

initDb();

const alice = createUser("alice", "Alice Demo");
createWalletForUser(alice.id, { BTC: 0.05, ETH: 0.5, USDT: 1000 });

const bob = createUser("bob", "Bob Trader");
createWalletForUser(bob.id, { BTC: 0.1, ETH: 1.2, USDT: 500 });

upsertAsset("BTC", "Bitcoin", 48000);
upsertAsset("ETH", "Ethereum", 3200);
upsertAsset("USDT", "Tether", 1);

createTrade(alice.id, "BTC", "buy", 0.01, 47000);
createTrade(bob.id, "ETH", "sell", 0.2, 3300);

addTestimonial(alice.id, "This sandbox is great to learn trading basics!");
addTestimonial(bob.id, "Love the live trade feed — so responsive.");

console.log("Seeding complete.");
