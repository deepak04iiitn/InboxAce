import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { recipientName, position, company, emailType, tone, jobDescription } = body;

    if (!recipientName || !position || !company) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `Generate a professional ${emailType || "job application"} email with the following details:
- Recipient: ${recipientName}
- Position: ${position}
- Company: ${company}
- Tone: ${tone || "professional"}
${jobDescription ? `- Job Description: ${jobDescription}` : ""}

Generate both a subject line and email body. The email should be personalized, concise, and compelling.
Make sure to include placeholders like {{yourName}}, {{yourTitle}}, {{yourSkills}} where appropriate.

Format:
SUBJECT: [subject line]
BODY: [email body]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at writing personalized, professional cold emails for job applications.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content || "";
    
    // Parse response
    const subjectMatch = response.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
    const bodyMatch = response.match(/BODY:\s*(.+)/is);

    const subject = subjectMatch ? subjectMatch[1].trim() : "";
    const emailBody = bodyMatch ? bodyMatch[1].trim() : "";

    return NextResponse.json({
      success: true,
      subject,
      body: emailBody,
    });
  } catch (error: any) {
    console.error("Error with AI personalization:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate personalized email" },
      { status: 500 }
    );
  }
}
