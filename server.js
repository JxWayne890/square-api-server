/*******************************
 *  server.js  – Square Catalog
 *******************************/

import express from "express";
import cors from "cors";

const app  = express();
const PORT = process.env.PORT || 3000;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;   // ←  Production token

/* -------------------------------------------------
 *  Middleware
 * ------------------------------------------------*/
app.use(cors());                 //  Allow all origins (CORS)
app.use(express.json());         //  For future POST endpoints, if needed

/* -------------------------------------------------
 *  Health‑check / root
 * ------------------------------------------------*/
app.get("/", (_, res) =>
  res.send("Square catalog API is running 🚀")
);

/* -------------------------------------------------
 *  GET /products  →  live Square items
 * ------------------------------------------------*/
app.get("/products", async (_, res) => {
  try {
    const sqRes = await fetch(
      "https://connect.squareup.com/v2/catalog/list",
      {
        method: "GET",
        headers: {
          "Square-Version": "2024-04-17",
          Authorization:    `Bearer ${ACCESS_TOKEN}`,
          "Content-Type":   "application/json"
        }
      }
    );

    if (!sqRes.ok) {
      // Forward Square error message
      const text = await sqRes.text();
      return res.status(sqRes.status).send(text);
    }

    const data = await sqRes.json();
    // console.log("🔍 Square raw:", JSON.stringify(data, null, 2));

    const items = (data.objects ?? []).filter(
      (obj) => obj.type === "ITEM"
    );

    res.json(items);
  } catch (err) {
    console.error("❌ Square API error:", err);
    res.status(500).json({ error: "Square API error" });
  }
});

/* -------------------------------------------------
 *  Start server
 * ------------------------------------------------*/
app.listen(PORT, () =>
  console.log(`✅ Catalog server listening on port ${PORT}`)
);
