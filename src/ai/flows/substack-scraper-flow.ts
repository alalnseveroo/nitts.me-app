
'use server';

/**
 * @fileOverview Um agente para fazer web scraping de metadados de qualquer URL.
 *
 * - scrapeUrlMetadata - Uma função que lida com o processo de scraping.
 * - ScrapeInput - O tipo de entrada para a função scrapeUrlMetadata.
 * - ScrapeOutput - O tipo de retorno para a função scrapeUrlMetadata.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Define o schema de entrada para a URL
const ScrapeInputSchema = z.object({
  url: z.string().url().describe('A URL completa da página a ser analisada.'),
});
export type ScrapeInput = z.infer<typeof ScrapeInputSchema>;

// Define o schema de saída para os dados extraídos
const ScrapeOutputSchema = z.object({
  title: z.string().describe('O título da página (de og:title ou <title>).'),
  imageUrl: z.string().optional().describe('A URL da imagem principal (de og:image).'),
});
export type ScrapeOutput = z.infer<typeof ScrapeOutputSchema>;

/**
 * Função pública para iniciar o processo de scraping de metadados de uma URL.
 * @param input - A URL a ser analisada.
 * @returns Os metadados extraídos da página.
 */
export async function scrapeUrlMetadata(input: ScrapeInput): Promise<ScrapeOutput> {
  return metadataScraperFlow(input);
}

// Define o fluxo do Genkit que orquestra o processo de scraping
const metadataScraperFlow = ai.defineFlow(
  {
    name: 'metadataScraperFlow',
    inputSchema: ScrapeInputSchema,
    outputSchema: ScrapeOutputSchema,
  },
  async (input) => {
    const response = await axios.get(input.url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    const html = response.data;

    const $ = cheerio.load(html);

    // Tenta pegar og:title, senão o <title> normal
    const title = $('meta[property="og:title"]').attr('content') || $('title').text();
    
    // Pega a imagem principal de og:image
    const imageUrl = $('meta[property="og:image"]').attr('content');

    if (!title) {
        throw new Error('Não foi possível extrair o título do HTML.');
    }

    const output: ScrapeOutput = {
      title,
      imageUrl,
    };

    return output;
  }
);
