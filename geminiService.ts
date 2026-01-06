
import { GoogleGenAI, Type } from "@google/genai";
import { Ticket, TicketCategory, TicketPriority } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AnalysisResult {
  suggestedPriority: TicketPriority;
  summary: string;
  suggestedAction: string;
}

export const analyzeTicket = async (title: string, description: string, category: TicketCategory): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise o seguinte chamado de TI:
        Título: ${title}
        Descrição: ${description}
        Categoria: ${category}
        
        Forneça uma prioridade sugerida (Baixa, Média, Alta ou Crítica), um resumo curto e uma ação sugerida para o técnico.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPriority: { 
              type: Type.STRING, 
              enum: ["Baixa", "Média", "Alta", "Crítica"] 
            },
            summary: { type: Type.STRING },
            suggestedAction: { type: Type.STRING },
          },
          required: ["suggestedPriority", "summary", "suggestedAction"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result as AnalysisResult;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      suggestedPriority: "Média",
      summary: "Análise não disponível no momento.",
      suggestedAction: "Avaliar chamado manualmente."
    };
  }
};

export const generateMonthlyReportSummary = async (tickets: Ticket[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Abaixo estão os dados dos chamados de TI deste mês:
      ${JSON.stringify(tickets.map(t => ({ category: t.category, status: t.status })))}
      
      Gere um resumo executivo em português (máximo 3 parágrafos) analisando tendências, o tipo de problema mais comum e uma recomendação de melhoria para a infraestrutura.`,
    });
    return response.text || "Resumo não disponível.";
  } catch (error) {
    return "Erro ao gerar resumo de IA.";
  }
}

// Novo serviço para chat de autoatendimento
export const createTroubleshootingChat = (category: TicketCategory) => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Você é um técnico de TI especializado em suporte nível 1. 
      Seu objetivo é ajudar o usuário a resolver problemas técnicos de forma amigável e passo a passo. 
      A categoria do problema atual é: ${category}.
      - Seja conciso.
      - Use bullet points para instruções.
      - Se o problema parecer complexo demais, sugira que o usuário finalize a conversa e abra o chamado formal.
      - Comece saudando o usuário e oferecendo a primeira solução simples para ${category}.`,
    },
  });
};
