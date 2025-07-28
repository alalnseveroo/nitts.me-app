
'use server';

/**
 * @fileOverview Um agente para fazer web scraping de perfis do Substack usando Cheerio.
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

    // 2. Usar o Cheerio para carregar e extrair as informações diretamente
    const $ = cheerio.load(html);

    const profileName = $('meta[property="og:site_name"]').attr('content') || $('title').text();
    // Prioriza a imagem com itemprop="image", que geralmente é o avatar.
    // Se não encontrar, busca por '.avatar' e por último usa a og:image como fallback.
    const profileImage = $('img[itemprop="image"]').attr('src') || $('img.avatar').attr('src') || $('meta[property="og:image"]').attr('content') || '';

    if (!profileName || !profileImage) {
        throw new Error('Não foi possível extrair nome e imagem do perfil do HTML.');
    }

    // A extração de posts recentes é mais complexa e pode ser omitida por enquanto
    const recentPosts: { title: string; url: string }[] = [];
    
    // 3. Retornar os dados extraídos no formato esperado
    const output: SubstackScrapeOutput = {
      profileName,
      profileImage,
      recentPosts, // Retornando um array vazio por simplicidade
    };

    return output;
  }
);
