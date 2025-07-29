
'use server'
/**
 * @fileOverview Um agente para processar e ofuscar documentos PDF.
 *
 * - processDocument - Uma função que lida com o upload, ofuscamento e armazenamento de PDFs.
 * - ProcessDocumentInput - O tipo de entrada para a função processDocument.
 * - ProcessDocumentOutput - O tipo de retorno para a função processDocument.
 */

import { ai } from '@/ai/genkit'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PDFDocument } from 'pdf-lib'

// Define o schema de entrada para o processamento do documento
const ProcessDocumentInputSchema = z.object({
  fileDataUri: z.string().describe("O arquivo PDF como um data URI, formato: 'data:application/pdf;base64,<encoded_data>'."),
  fileName: z.string().describe('O nome original do arquivo.'),
  userId: z.string().describe('O ID do usuário que está fazendo o upload.'),
  cardId: z.string().describe('O ID do card ao qual este documento pertence.'),
  obscurationPercentage: z.number().min(0).max(100).describe('A porcentagem de páginas a serem mostradas na pré-visualização.'),
})
export type ProcessDocumentInput = z.infer<typeof ProcessDocumentInputSchema>

// Define o schema de saída com os caminhos dos arquivos
const ProcessDocumentOutputSchema = z.object({
  originalFilePath: z.string().describe('O caminho para o arquivo original no Supabase Storage.'),
  processedFilePath: z.string().describe('O caminho para o arquivo ofuscado/processado no Supabase Storage.'),
})
export type ProcessDocumentOutput = z.infer<typeof ProcessDocumentOutputSchema>

/**
 * Função pública para iniciar o processo de ofuscamento de um PDF.
 * @param input - Os dados do arquivo e as configurações de ofuscamento.
 * @returns Os caminhos para os arquivos original e processado no Storage.
 */
export async function processDocument(input: ProcessDocumentInput): Promise<ProcessDocumentOutput> {
  return processDocumentFlow(input)
}

// Define o fluxo do Genkit
const processDocumentFlow = ai.defineFlow(
  {
    name: 'processDocumentFlow',
    inputSchema: ProcessDocumentInputSchema,
    outputSchema: ProcessDocumentOutputSchema,
  },
  async (input) => {
    const supabase = await createSupabaseServerClient()
    const base64Data = input.fileDataUri.split(';base64,').pop()
    if (!base64Data) {
      throw new Error('Formato de Data URI inválido.')
    }

    const fileBuffer = Buffer.from(base64Data, 'base64')

    // 1. Ofuscar o PDF para criar a versão de pré-visualização
    const pdfDoc = await PDFDocument.load(fileBuffer)
    const totalPages = pdfDoc.getPageCount()
    const pagesToKeep = Math.ceil(totalPages * (input.obscurationPercentage / 100))
    
    const previewPdfDoc = await PDFDocument.create()
    const copiedPages = await previewPdfDoc.copyPages(pdfDoc, Array.from({ length: pagesToKeep }, (_, i) => i))
    copiedPages.forEach((page) => previewPdfDoc.addPage(page))

    const previewPdfBytes = await previewPdfDoc.save()
    const previewFileBuffer = Buffer.from(previewPdfBytes)

    // 2. Fazer upload dos dois arquivos para o Supabase Storage
    const fileExt = input.fileName.split('.').pop()
    const timestamp = Date.now()
    const originalPath = `${input.userId}/${input.cardId}-original-${timestamp}.${fileExt}`
    const processedPath = `${input.userId}/${input.cardId}-processed-${timestamp}.${fileExt}`

    const { error: originalUploadError } = await supabase.storage
      .from('documents')
      .upload(originalPath, fileBuffer, { contentType: 'application/pdf' })

    if (originalUploadError) {
      console.error('Original Upload Error:', originalUploadError)
      throw new Error(`Falha ao fazer upload do arquivo original: ${originalUploadError.message}`)
    }

    const { error: processedUploadError } = await supabase.storage
      .from('documents')
      .upload(processedPath, previewFileBuffer, { contentType: 'application/pdf' })

    if (processedUploadError) {
      console.error('Processed Upload Error:', processedUploadError)
      // Tentar remover o original se o processado falhar
      await supabase.storage.from('documents').remove([originalPath])
      throw new Error(`Falha ao fazer upload do arquivo processado: ${processedUploadError.message}`)
    }

    // 3. Retornar os caminhos dos arquivos
    return {
      originalFilePath: originalPath,
      processedFilePath: processedPath,
    }
  }
)
