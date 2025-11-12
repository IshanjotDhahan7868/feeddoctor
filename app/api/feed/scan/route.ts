import { NextRequest, NextResponse } from "next/server";
import cheerio from "cheerio";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import probe from "probe-image-size";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;
    const products: any[] = [];

    // --- 1️⃣ Handle CSV upload ---
    if (file) {
      const text = await file.text();
      const records = parse(text, { columns: true, skip_empty_lines: true });
      for (const record of records) {
        const fixed = await validateAndFix(record);
        products.push(fixed);
      }
    }

    // --- 2️⃣ Handle website URL scrape ---
    else if (url) {
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);

      $("body").each((_, el) => {
        const title =
          $("meta[property='og:title']").attr("content") ||
          $("title").text().trim();
        const price =
          $("meta[property='product:price:amount']").attr("content") || "";
        const image =
          $("meta[property='og:image']").attr("content") ||
          $("img").first().attr("src") ||
          "";
        const brand =
          $("meta[itemprop='brand']").attr("content") ||
          $("meta[name='brand']").attr("content") ||
          "";
        const gtin =
          $("meta[itemprop='gtin']").attr("content") ||
          $("meta[name='gtin']").attr("content") ||
          "";
        products.push({ title, price, image, brand, gtin });
      });

      // Fix scraped products
      for (let i = 0; i < products.length; i++) {
        products[i] = await validateAndFix(products[i]);
      }
    } else {
      return NextResponse.json({ error: "No file or URL provided." }, { status: 400 });
    }

    // --- 3️⃣ Build downloadable CSV ---
    const csv = stringify(products, { header: true });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=fixed_feed.csv",
      },
    });
  } catch (err) {
    console.error("Feed scan error:", err);
    return NextResponse.json({ error: "Feed scan failed" }, { status: 500 });
  }
}

// --- 🧠 Feed validation / correction logic ---
async function validateAndFix(p: any) {
  let title = p.title ? p.title.slice(0, 140) : "Untitled Product";
  let gtin = p.gtin || "0000000000000";
  let image_link = p.image || "";

  // Check image resolution
  try {
    const info = await probe(image_link);
    if (info.width < 1000 || info.height < 1000) {
      image_link = "https://via.placeholder.com/1000";
    }
  } catch {
    image_link = "https://via.placeholder.com/1000";
  }

  return {
    title,
    price: p.price || "",
    brand: p.brand || "",
    gtin,
    image_link,
  };
}
