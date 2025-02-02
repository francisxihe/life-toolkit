import { Injectable } from "@nestjs/common";
import { OpenAI } from "openai";

@Injectable()
export class DeepSeekService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: "sk-62adbf61db8c4438814f1d8e2bdb43f3",
    });
  }

  async generateText(prompt: string): Promise<string | null> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: "system", content: "You are a helpful assistant." }],
        model: "deepseek-chat",
      });

      console.log(completion.choices[0].message.content);

      return completion.choices[0].message.content; // 返回生成的文本
    } catch (error) {
      console.error("Error calling DeepSeek API:", error);
      throw error;
    }
  }
}
