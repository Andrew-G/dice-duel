import { AIResponse } from "@/constants/types";

const BotResponse = ({ response }: { response: AIResponse | null }) => {
  console.log("BotResponse", response);
  if (!response) {
    return null;
  }
  return (
    <div className="bg-gray-100 p-3 rounded-md shadow-sm text-sm space-y-2">
      <div className="flex justify-between">
        <span className="font-medium">Action:</span>
        <span className="text-gray-700">{response?.action}</span>
      </div>

      <div className="flex justify-between">
        <span className="font-medium">Keep Mask:</span>
        <span className="text-gray-700">{response?.keep_mask?.join(", ")}</span>
      </div>

      <div className="flex justify-between">
        <span className="font-medium">Category Aim:</span>
        <span className="text-gray-700">{response?.category_aim}</span>
      </div>

      <div className="bg-white p-2 rounded-md shadow text-gray-900">
        {response?.message}
      </div>
    </div>
  );
};

export default BotResponse;
