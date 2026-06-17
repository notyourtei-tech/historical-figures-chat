"use server";

import { Celebrity, Language, Message } from "@/types";
import { runChat, runGreeting } from "@/lib/ancient-chat";

export async function chatWithCelebrityAction(
  celebrity: Celebrity,
  messages: Message[],
  language: Language = "zh"
) {
  return runChat(celebrity, messages, language);
}

export async function getInitialGreetingAction(
  celebrity: Celebrity,
  language: Language = "zh"
) {
  const result = await runGreeting(celebrity, language);
  return result.success ? result.content ?? null : null;
}
