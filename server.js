/*******************************
 *  server.js  – Square Catalog
 *******************************/

import express from "express";
import cors    from "cors";

const app  = express();
const PORT = process.env.PORT || 3000;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;   // ← Production token

/* -------------------------------------------------
 *  Middleware
 * ------------------------------------------------*/
app.use(cors());                 // Allow all origins
app.use(express.json());         // For future POST endpoints

/* -------------------------------------------------
 *  Health‑check / root
 * ------------------------------------------------*/
app.get("/", (_, res) =>
  res.send("Square catalog API is running 🚀")
);

/* -------------------------------------------------
 *  GET /products  →  live Square items + image_url
 * ------------------------------------------------*/
app.get("/products", async (_, res) => {
  try {
    const sqRes = await fetch(
      "https://connect.squareup.com/v2/catalog/list",
      {
        method:  "GET",
        headers: {
          "Square-Version": "2024-04-17",
          Authorization:    `Bearer ${ACCESS_TOKEN}`,
          "Content-Type":   "application/json"
        }
      }
    );

    if (!sqRes.ok) {
      const text = await sqRes.text();        // Forward Square error body
      return res.status(sqRes.status).send(text);
    }

    const data    = await sqRes.json();
    const objects = data.objects ?? [];

    /* ---------- Build { imageId → imageUrl } map ---------- */
    const imageMap = new Map();
    objects
      .filter(o => o.type === "IMAGE")
      .forEach(img => imageMap.set(img.id, img.image_data?.url));

    /* ---------- Select ITEM objects & attach image_url ----- */
    const items = objects
      .filter(o => o.type === "ITEM")
      .map(item => {
        // direct URL if Square placed one on the item
        let url = item.item_data?.image_url;

        // else resolve first referenced image_id
        if (!url && item.item_data?.image_ids?.length) {
          url = imageMap.get(item.item_data.image_ids[0]);
        }

        return { ...item, image_url: url };
      });

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
