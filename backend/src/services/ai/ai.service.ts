import { GoogleGenerativeAI } from "@google/generative-ai";
import { complianceLogger } from '../../utils/logger';
import { generatePrompt } from './prompts/base.prompt';

export class AIService {
  private googleAI!: GoogleGenerativeAI;
  private model: any = null;
  private isEnabled: boolean = true;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY || '';
    
    if (!apiKey) {
      this.isEnabled = false;
      complianceLogger.info('AI service initialized without API key - running in limited mode');
      return;
    }

    try {
      this.googleAI = new GoogleGenerativeAI(apiKey);
      this.model = this.googleAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });
      complianceLogger.info('AI service initialized successfully');
    } catch (error) {
      this.isEnabled = false;
      complianceLogger.error('Failed to initialize AI service', error as Error);
    }
  }

  async getComplianceAssistance(query: string, context: any): Promise<any> {
    try {
      if (!this.isEnabled) {
        return {
          content: "AI assistance is currently unavailable. Please configure the Google API key to enable AI features.",
          metadata: {
            model: "unavailable",
            timestamp: new Date().toISOString()
          }
        };
      }

      const prompt = generatePrompt(query, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      complianceLogger.info('AI assistance generated successfully');
      return {
        content,
        metadata: {
          model: "gemini-2.0-flash",
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      complianceLogger.error('Error generating AI assistance', error as Error);
      return {
        content: "An error occurred while generating AI assistance. Please try again later.",
        metadata: {
          model: "error",
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  async getSuggestions(query: string, currentConfig: any): Promise<any> {
    return this.getComplianceAssistance(query, currentConfig);
  }
} 