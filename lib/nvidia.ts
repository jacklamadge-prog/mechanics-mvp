import OpenAI from "openai";

/** Set NVIDIA_BASE_URL and NVIDIA_MODEL in .env.local / Netlify env */
const DEFAULT_BASE_URL = "";
const DEFAULT_MODEL = "";

export function getNvidiaClient() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    baseURL: process.env.NVIDIA_BASE_URL ?? DEFAULT_BASE_URL,
  });
}

export function getNvidiaModel() {
  return process.env.NVIDIA_MODEL ?? DEFAULT_MODEL;
}

export function getNvidiaChatOptions() {
  const enableThinking = process.env.NVIDIA_ENABLE_THINKING === "true";
  const model = getNvidiaModel();
  const isDeepSeek = model.includes("deepseek");

  const base = {
    temperature: Number(process.env.NVIDIA_TEMPERATURE ?? 0.5),
    top_p: Number(process.env.NVIDIA_TOP_P ?? 0.9),
    max_tokens: Number(process.env.NVIDIA_MAX_TOKENS ?? 220),
  };

  if (!enableThinking) {
    return { ...base, extra_body: undefined };
  }

  if (isDeepSeek) {
    return {
      ...base,
      extra_body: {
        chat_template_kwargs: {
          thinking: true,
          reasoning_effort:
            process.env.NVIDIA_REASONING_EFFORT ?? "high",
        },
      },
    };
  }

  return {
    ...base,
    extra_body: {
      chat_template_kwargs: { enable_thinking: true },
      reasoning_budget: Number(process.env.NVIDIA_REASONING_BUDGET ?? 2048),
    },
  };
}
