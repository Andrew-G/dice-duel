import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

// Define the expected structure of messages
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    // Parse JSON body
    const body = await req.json();
    const { messages }: { messages: Message[] } = body;

    // Validate request body
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL!,
      messages,
    });

    console.log("OpenAI Response:", completion);

    // Check if choices exist in the response
    if (!completion.choices || completion.choices.length === 0) {
      return NextResponse.json({ error: "No choices returned from OpenAI" }, { status: 500 });
    }
    console.log("completion messages:", completion.choices[0]?.message);

    return NextResponse.json({ result: completion.choices[0].message });
  } catch (error: unknown) {
    console.error("Error in OpenAI API call:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
