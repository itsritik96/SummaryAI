import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function fetchAndExtractPdfText(fileUrl: string) {
  const response = await fetch(fileUrl);               // 1. Fetch the PDF file from the given URL
  const blob = await response.blob();                  // 2. Get the response as a blob
  const arrayBuffer = await blob.arrayBuffer();        // 3. Convert blob to an ArrayBuffer

  const loader = new PDFLoader(new Blob([arrayBuffer]));  // 4. Initialize LangChain PDFLoader
  const docs = await loader.load();                    // 5. Load all PDF pages as documents

  return docs.map((doc) => doc.pageContent).join('\n'); // 6. Combine and return all pages as one string
}
