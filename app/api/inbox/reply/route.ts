import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api";

const schema = z.object({ text: z.string().min(1) });

function generateReplies(text: string) {
  let classification = "Question";
  if (/unsubscribe|stop/i.test(text)) {
    classification = "Spam";
  } else if (/price|cost|how much/i.test(text)) {
    classification = "Price Inquiry";
  } else if (/interested|ready to purchase/i.test(text)) {
    classification = "Lead";
  }

  const replies: string[] = [];
  if (classification === "Lead") {
    replies.push(
      "Great to hear you’re interested! Here’s the link to your scan preview and the purchase page: https://your-domain.com/feed/scan. Let me know if you have any questions."
    );
    replies.push(
      "Thanks for reaching out! I’ve attached your scan preview and our Fix Pack details. We can get your disapprovals resolved within 48h."
    );
    replies.push(
      "I appreciate your interest. Our tool can quickly fix your feed issues. Follow this link to start: https://your-domain.com/feed/scan"
    );
  } else if (classification === "Price Inquiry") {
    replies.push(
      "Our Feed Fix Pack is a one‑time fee of $299 for up to 25 SKUs. This includes a patch CSV, title suggestions, image briefs and a GMC checklist."
    );
    replies.push(
      "Thanks for asking! The service is $299 for 25 SKUs. Additional SKUs can be accommodated—feel free to reply with your product count."
    );
    replies.push(
      "We charge a flat $299 per feed (25 SKUs). You can scan for free first to see sample issues."
    );
  } else if (classification === "Spam") {
    replies.push("We have removed you from our outreach list. Apologies for the inconvenience.");
    replies.push("Your opt‑out has been processed. You won’t hear from us again.");
    replies.push("Thank you for letting us know. We have suppressed your email from future messages.");
  } else {
    replies.push(
      "Thanks for reaching out! We’ll get back to you with answers shortly. In the meantime, feel free to run a free scan on our site."
    );
    replies.push(
      "We appreciate your message. Someone from our team will respond soon. Did you know you can generate a free scan?"
    );
    replies.push("Thanks for contacting us! We’re reviewing your question and will reply shortly.");
  }

  return { classification, replies };
}

export async function GET() {
  try {
    const items = await prisma.inboxMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      items: items.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        inputText: item.inputText,
        classification: item.classification,
        replies: Array.isArray(item.replies) ? item.replies : [],
      })),
    });
  } catch (error: any) {
    return apiError(error?.message ?? "Failed to fetch inbox history", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid request", 400, { issues: parsed.error.flatten() });
    }

    const { text } = parsed.data;
    const { classification, replies } = generateReplies(text);

    await prisma.inboxMessage.create({
      data: {
        inputText: text,
        classification,
        replies,
      },
    });

    return NextResponse.json({ success: true, classification, replies });
  } catch (error: any) {
    return apiError(error?.message ?? "Failed to generate reply suggestions", 500);
  }
}
