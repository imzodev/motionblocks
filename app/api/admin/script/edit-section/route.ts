import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken } from "@/lib/server/admin/auth";
import { createLLMProvider } from "@/lib/server/llm";
import type { VideoScript } from "@/lib/admin/script-types";

export async function POST(request: NextRequest) {

  try {
    const { script, sectionType, sectionIndex, editInstruction, language } = await request.json();

    if (!script || !editInstruction) {
      return NextResponse.json(
        { error: "Script and edit instruction are required" },
        { status: 400 }
      );
    }

    const provider = createLLMProvider();

    const systemPrompt = `You are an expert video script editor. Your task is to modify a specific part of a video script based on the user's instructions.

IMPORTANT RULES:
1. Only modify the specific section requested
2. Keep the same tone and style as the rest of the script
3. Maintain consistency with the overall script context
4. Write in ${language || "the same language as the original script"}
5. Return ONLY the modified text, no explanations or JSON

FULL SCRIPT CONTEXT:
Title: ${script.title}
Hook: ${script.hook}
${script.sections.map((s: { sectionTitle: string; narration: string }, i: number) => `Section ${i + 1} - ${s.sectionTitle}: ${s.narration}`).join("\n")}
${script.cta ? `CTA: ${script.cta}` : ""}`;

    let targetContent = "";
    if (sectionType === "hook") {
      targetContent = script.hook;
    } else if (sectionType === "section" && sectionIndex !== undefined) {
      targetContent = script.sections[sectionIndex]?.narration || "";
    } else if (sectionType === "cta") {
      targetContent = script.cta || "";
    }

    const userPrompt = `SECTION TO EDIT (${sectionType}${sectionIndex !== undefined ? ` #${sectionIndex + 1}` : ""}):
"${targetContent}"

USER'S EDIT REQUEST:
${editInstruction}

Provide the modified text only:`;

    const response = await provider.generateText(userPrompt, {
      systemPrompt,
      maxTokens: 1024,
    });

    return NextResponse.json({
      editedContent: response.text.trim(),
      sectionType,
      sectionIndex,
    });
  } catch (error) {
    console.error("Section edit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to edit section" },
      { status: 500 }
    );
  }
}
