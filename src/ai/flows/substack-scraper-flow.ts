
'use server';

/**
 * @fileOverview Um agente de IA para fazer web scraping de perfis do Substack.
 *
 * - scrapeSubstack - Uma função que lida com o processo de scraping.
 * - SubstackScrapeInput - O tipo de entrada para a função scrapeSubstack.
 * - SubstackScrapeOutput - O tipo de retorno para a função scrapeSubstack.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Define o schema de entrada para a URL do Substack
const SubstackScrapeInputSchema = z.object({
  url: z.string().url().describe('A URL completa do perfil ou publicação do Substack.'),
});
export type SubstackScrapeInput = z.infer<typeof SubstackScrapeInputSchema>;

// Define o schema de saída para os dados extraídos
const SubstackScrapeOutputSchema = z.object({
  profileName: z.string().describe('O nome do autor ou da publicação.'),
  profileImage: z.string().url().describe('A URL da imagem de perfil do autor.'),
  recentPosts: z.array(z.object({
    title: z.string().describe('O título do post.'),
    url: z.string().url().describe('A URL completa do post.'),
  })).describe('Uma lista de até 5 posts recentes.'),
});
export type SubstackScrapeOutput = z.infer<typeof SubstackScrapeOutputSchema>;

/**
 * Função pública para iniciar o processo de scraping do Substack.
 * @param input - A URL do Substack a ser analisada.
 * @returns Os dados extraídos do perfil do Substack.
 */
export async function scrapeSubstack(input: SubstackScrapeInput): Promise<SubstackScrapeOutput> {
  return substackScraperFlow(input);
}

// Define o prompt do Genkit para extrair informações do HTML
const scraperPrompt = ai.definePrompt({
  name: 'substackScraperPrompt',
  input: { schema: z.object({ htmlContent: z.string() }) },
  output: { schema: SubstackScrapeOutputSchema },
  prompt: `
    Você é um especialista em extrair informações estruturadas de conteúdo HTML.
    Analise o seguinte HTML de uma página do Substack e extraia as seguintes informações:
    1.  **profileName**: O nome do autor ou da publicação.
    2.  **profileImage**: A URL da imagem de perfil. Deve ser uma URL completa.
    3.  **recentPosts**: Uma lista dos posts mais recentes encontrados no HTML, contendo o título e a URL completa de cada post. Limite a no máximo 5 posts.

    HTML Fornecido:
    {{{htmlContent}}}
  `,
});

// Define o fluxo do Genkit que orquestra o processo de scraping
const substackScraperFlow = ai.defineFlow(
  {
    name: 'substackScraperFlow',
    inputSchema: SubstackScrapeInputSchema,
    outputSchema: SubstackScrapeOutputSchema,
  },
  async (input) => {
    // 1. Baixar o conteúdo HTML da URL fornecida
    const response = await axios.get(input.url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    const html = response.data;

    // 2. Usar o Cheerio para carregar e extrair o corpo do HTML (para reduzir o tamanho do prompt)
    const $ = cheerio.load(html);
    const bodyHtml = $('body').html();

    if (!bodyHtml) {
        throw new Error('Não foi possível extrair o corpo do HTML da página.');
    }

    // 3. Chamar o prompt de IA com o conteúdo do corpo do HTML
    const { output } = await scraperPrompt({ htmlContent: bodyHtml });
    
    if (!output) {
      throw new Error('A IA não conseguiu extrair as informações do HTML.');
    }

    return output;
  }
);
