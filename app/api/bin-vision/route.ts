import { NextResponse } from "next/server";
import type { BinVisionResult } from "@/lib/types";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const fillEstimate = 40 + Math.floor(Math.random() * 50);
    const result: BinVisionResult = {
      fillEstimate,
      confidence: 0.88,
      itemsDetected: Math.floor(fillEstimate * 0.55),
      source: "mock",
    };
    return NextResponse.json(result);
  }

  try {
    const form = await request.formData();
    const image = form.get("image");
    if (!image || !(image instanceof Blob)) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mime = image.type || "image/jpeg";

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Estimate smart bin fill level 0-100, item count, confidence 0-1. Reply JSON only: {"fillEstimate":number,"confidence":number,"itemsDetected":number}',
              },
              {
                type: "image_url",
                image_url: { url: `data:${mime};base64,${base64}` },
              },
            ],
          },
        ],
        max_tokens: 100,
      }),
    });

    if (!res.ok) throw new Error("OpenAI request failed");

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    const result: BinVisionResult = {
      fillEstimate: Math.min(100, Math.max(0, Number(parsed.fillEstimate) || 50)),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.8)),
      itemsDetected: Number(parsed.itemsDetected) || 20,
      source: "api",
    };
    return NextResponse.json(result);
  } catch {
    const result: BinVisionResult = {
      fillEstimate: 55,
      confidence: 0.75,
      itemsDetected: 30,
      source: "mock",
    };
    return NextResponse.json(result);
  }
}
