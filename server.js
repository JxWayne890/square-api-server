/*******************************
 *  server.js  – Square Catalog
 *******************************/

import express from "express";
import cors    from "cors";

const app  = express();
const PORT = process.env.PORT || 3000;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

/* middleware */
app.use(cors());
app.use(express.json());

/* health‑check */
app.get("/", (_, res) => res.send("Square catalog API is running 🚀"));

/* live products + image_url */
app.get("/products", async (_, res) => {
  try {
    const sqRes = await fetch(
      "https://connect.squareup.com/v2/catalog/list" +
        "?types=ITEM,IMAGE&include_related_objects=true",
      {
        headers: {
          "Square-Version": "2024-04-17",
          Authorization:    `Bearer ${ACCESS_TOKEN}`,
          "Content-Type":   "application/json"
        }
      }
    );

    if (!sqRes.ok) {
      const txt = await sqRes.text();
      return res.status(sqRes.status).send(txt);
    }

    const data    = await sqRes.json();
    const objects = data.objects ?? [];

    /* build { imageId → url } map */
    const imageMap = new Map();
    objects
      .filter(o => o.type === "IMAGE")
      .forEach(img => imageMap.set(img.id, img.image_data?.url));

    /* attach resolved image_url to each ITEM */
    const items = objects
      .filter(o => o.type === "ITEM")
      .map(item => {
        let url = item.item_data?.image_url;
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

/* start server */
app.listen(PORT, () =>
  console.log(`✅ Catalog server listening on port ${PORT}`)
);
