import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import restaurants from "@/data/restaurants.json";
import { getAnthropic, SONNET_MODEL } from "@/lib/anthropic";
import { AGENT_TOOLS, buildToolContext, executeTool, type ToolStep } from "@/lib/agent-tools";
import { PLAN_DATE_SYSTEM, planDateUserPrompt } from "@/lib/agent-prompts";
import { cachedAgentRun, genericAgentRun } from "@/lib/fallbacks";
import type { AgentRunResponse, AgentTraceStep, DatePlan, Restaurant, User } from "@/lib/types";

export const runtime = "nodejs";

type Body = { userA: User; userB: User; restaurantId: string };

const MAX_TURNS = 6;
const ALL_RESTAURANTS = restaurants as Restaurant[];

function tryParsePlan(text: string): DatePlan | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]) as Partial<DatePlan>;
    if (
      typeof obj.headline === "string" &&
      typeof obj.timing === "string" &&
      typeof obj.order === "string" &&
      typeof obj.conversationStarter === "string"
    ) {
      return {
        headline: obj.headline,
        timing: obj.timing,
        order: obj.order,
        conversationStarter: obj.conversationStarter,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function pickFinalText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

function toClientStep(step: ToolStep): AgentTraceStep {
  return { name: step.name, label: step.label, summary: step.summary };
}

async function runAgent(
  userA: User,
  userB: User,
  restaurantId: string,
): Promise<{ trace: ToolStep[]; plan: DatePlan }> {
  const client = getAnthropic();
  const ctx = buildToolContext(userA, userB);
  const trace: ToolStep[] = [];

  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: "user",
      content: planDateUserPrompt(userA, userB, restaurantId),
    },
  ];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const resp = await client.messages.create({
      model: SONNET_MODEL,
      max_tokens: 1024,
      system: PLAN_DATE_SYSTEM,
      tools: AGENT_TOOLS,
      messages,
    });

    if (resp.stop_reason === "tool_use") {
      const toolUseBlocks = resp.content.filter(
        (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
      );
      if (toolUseBlocks.length === 0) {
        throw new Error("stop_reason was tool_use but no tool_use block in content");
      }

      // Append assistant message verbatim (must include tool_use blocks)
      messages.push({ role: "assistant", content: resp.content });

      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
      for (const tu of toolUseBlocks) {
        const exec = executeTool(tu.name, tu.input, ctx);
        if (exec.ok) {
          trace.push(exec.step);
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: JSON.stringify(exec.step.result),
          });
        } else {
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: `Error: ${exec.error}`,
            is_error: true,
          });
        }
      }
      messages.push({ role: "user", content: toolResults });
      continue;
    }

    // end_turn or other terminal stop reason — parse final text as JSON plan
    const finalText = pickFinalText(resp.content);
    const plan = tryParsePlan(finalText);
    if (!plan) {
      throw new Error(`Final assistant message did not contain a parseable plan JSON. Got: ${finalText.slice(0, 200)}`);
    }
    return { trace, plan };
  }

  throw new Error(`Agent loop exceeded ${MAX_TURNS} turns without producing a final plan`);
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { userA, userB, restaurantId } = body ?? {};
  if (!userA?.id || !userB?.id || !restaurantId) {
    return NextResponse.json(
      { error: "Body must include { userA, userB, restaurantId }" },
      { status: 400 },
    );
  }
  if (!ALL_RESTAURANTS.some((r) => r.id === restaurantId)) {
    return NextResponse.json(
      { error: `Unknown restaurantId: ${restaurantId}` },
      { status: 400 },
    );
  }

  try {
    const { trace, plan } = await runAgent(userA, userB, restaurantId);
    const payload: AgentRunResponse = {
      trace: trace.map(toClientStep),
      plan,
      source: "live",
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[/api/plan-date] live agent failed:", err);
    const cached = cachedAgentRun(userA.id, userB.id);
    if (cached) {
      const payload: AgentRunResponse = { ...cached, source: "cache" };
      return NextResponse.json(payload);
    }
    const restaurant = ALL_RESTAURANTS.find((r) => r.id === restaurantId);
    const generic = genericAgentRun(
      restaurant?.name ?? "your mala spot",
      restaurant?.neighborhood ?? "Singapore",
    );
    const payload: AgentRunResponse = { ...generic, source: "generic" };
    return NextResponse.json(payload);
  }
}
