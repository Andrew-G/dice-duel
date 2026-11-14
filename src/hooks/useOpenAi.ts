import ApiRoutes from "@/constants/ApiRoutes";
import { getRandomPhrase, phrases } from "@/constants/lang";
import { AIResponse, AIRequest } from "@/constants/types";
import { useMutation } from "@tanstack/react-query";
import { OpenAIError } from "openai";

const AIResponseError: AIResponse = {
  action: "error",
  message: getRandomPhrase(phrases.failure),
  mood: "dying",
};

function cleanAndParseJSON(input: string): AIResponse {
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");
  if (start === -1 || end === -1 || start > end) {
    throw new Error("Invalid JSON");
  }
  const cleanedString = input.slice(start, end + 1);
  try {
    return JSON.parse(cleanedString);
  } catch (error) {
    console.error("cleanAndParseJSON - Invalid JSON:", error);
    return AIResponseError;
  }
}

async function openAi(request: AIRequest): Promise<AIResponse> {
  const response = await fetch(ApiRoutes.OPEN_AI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch OpenAI response");
  }

  const data = await response.json();
  if (!data?.result?.content) {
    console.warn("No content received from OpenAI.");
    return AIResponseError;
  }
  const parsedData = cleanAndParseJSON(data.result.content);
  console.log("OpenAI Response:", parsedData); // Log response for debugging
  return parsedData;
}

const useOpenAi = (handleSuccess?: (data: AIResponse) => void, handleError?: (error: OpenAIError) => void) => {
  return useMutation<AIResponse, OpenAIError, AIRequest>({
    mutationKey: ["OpenAi"],
    mutationFn: (params) => openAi(params),
    onSuccess: (data) => {
        if (handleSuccess) handleSuccess(data)
    },
    onError: (error) => {
        if (handleError) handleError(error)
    },
  });
};

export default useOpenAi;
