// ─────────────────────────────────────────────────────────────────────────
// QuoteFlow ERP - Dual AI Intelligence Engine (OpenAI GPT-4o + Google Gemini 1.5)
// Smart Failover: Uses OpenAI as primary, automatically falls back to Gemini
// ─────────────────────────────────────────────────────────────────────────
import { OpenAiService } from './OpenAiService';
import { askGeminiAi, scanVisitingCardWithGemini, ScannedCardData } from './GeminiService';

export const DualAiEngine = {
  /**
   * Smart Dual-AI completion: Tries OpenAI GPT-4o-mini first, falls back to Google Gemini
   */
  async askDualAi(prompt: string, contextData?: string): Promise<{ text: string; provider: 'OpenAI GPT-4o' | 'Google Gemini 1.5' }> {
    try {
      const openAiResult = await OpenAiService.generateCompletion(
        prompt,
        `You are QuoteFlow Dual-AI, an enterprise sales intelligence assistant for Zipcon Services Private Limited. ${contextData ? `ERP Context:\n${contextData}` : ''}`
      );
      return { text: openAiResult, provider: 'OpenAI GPT-4o' };
    } catch (openAiError: any) {
      console.warn('OpenAI notice (quota/network): Failing over to Google Gemini 1.5 Flash:', openAiError?.message || openAiError);
      const geminiResult = await askGeminiAi(prompt, contextData);
      return { text: geminiResult, provider: 'Google Gemini 1.5' };
    }
  },

  /**
   * Smart Dual-AI Card OCR Scanner: Tries OpenAI Vision first, falls back to Gemini Multimodal Vision
   */
  async scanCard(base64Image: string, mimeType: string = 'image/jpeg'): Promise<ScannedCardData & { provider: 'OpenAI GPT-4o Vision' | 'Google Gemini Vision' }> {
    try {
      const openAiData = await OpenAiService.scanVisitingCardWithOpenAI(base64Image);
      return {
        companyName: openAiData.companyName || '',
        name: openAiData.contactPerson || openAiData.name || '',
        contactPerson: openAiData.contactPerson || openAiData.name || '',
        designation: openAiData.designation || '',
        mobile: openAiData.mobile || '',
        email: openAiData.email || '',
        gstNumber: openAiData.gstin || openAiData.gstNumber || '',
        address: openAiData.address || '',
        website: openAiData.website || '',
        notes: openAiData.notes || '',
        provider: 'OpenAI GPT-4o Vision',
      };
    } catch (e) {
      console.warn('OpenAI Vision notice: Failing over to Google Gemini Vision:', e);
      const geminiData = await scanVisitingCardWithGemini(base64Image, mimeType);
      return { ...geminiData, provider: 'Google Gemini Vision' };
    }
  },
};
