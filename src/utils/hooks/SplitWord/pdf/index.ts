import * as pdfjs from 'pdfjs-dist';
import pdfWorker from '../../../../..//node_modules/pdfjs-dist/build/pdf.worker.entry';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { extractTextFromImage } from '../image';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const getTextInPage = async (pdfDoc: pdfjs.PDFDocumentProxy, i: number): Promise<string[]> => {
  const paragraph: string[] = [];
  let itemInParagraph: string[] = [];
  const page = await pdfDoc.getPage(i);
  const content = await page.getTextContent();
  if (content.items.length > 0) {
    const lengthContentItems = content.items.length;
    content.items.forEach((item, index) => {
      const textItem = item as TextItem;
      itemInParagraph.push(textItem.str);
      if (textItem.hasEOL) {
        if (itemInParagraph.length > 0) {
          paragraph.push(itemInParagraph.join(''));
        }
        itemInParagraph = [];
      }

      // push phan tu cuoi cung
      if (index === lengthContentItems - 1) {
        if (itemInParagraph.length > 0) {
          paragraph.push(itemInParagraph.join(''));
        }
      }
    });
  } else {
    // xử lí page là scan của 1 image
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;
    const lines = await extractTextFromImage(canvas);
    lines.forEach((line) => paragraph.push(line));
  }
  return paragraph;
};

export async function getParagraphsInPdfFile(src: Uint8Array) {
  const paragraph: string[] = [];
  const loadingTask = pdfjs.getDocument(src);
  const pdfDoc = await loadingTask.promise;
  const numberPages = pdfDoc.numPages;

  const array = Array(numberPages).fill(0);
  const paragraphOfPage: string[][] = await Promise.all(array.map((item, i) => getTextInPage(pdfDoc, i + 1)));

  paragraphOfPage.forEach((pageLines) => pageLines.forEach((line) => paragraph.push(line)));

  // for (let i = 1; i <= numberPages; i++) {
  //   let itemInParagraph: string[] = [];
  //   const page = await pdfDoc.getPage(i);

  //   const content = await page.getTextContent();
  //   if (content.items.length > 0) {
  //     const lengthContentItems = content.items.length;
  //     content.items.forEach((item, index) => {
  //       const textItem = item as TextItem;
  //       itemInParagraph.push(textItem.str);
  //       if (textItem.hasEOL) {
  //         if (itemInParagraph.length > 0) {
  //           paragraph.push(itemInParagraph.join(''));
  //         }
  //         itemInParagraph = [];
  //       }

  //       // push phan tu cuoi cung
  //       if (index === lengthContentItems - 1) {
  //         if (itemInParagraph.length > 0) {
  //           paragraph.push(itemInParagraph.join(''));
  //         }
  //       }
  //     });
  //   } else {
  //     // xử lí page là scan của 1 image
  //     const viewport = page.getViewport({ scale: 2 });
  //     const canvas = document.createElement('canvas');
  //     const context = canvas.getContext('2d');
  //     canvas.height = viewport.height;
  //     canvas.width = viewport.width;

  //     await page.render({ canvasContext: context, viewport: viewport }).promise;
  //     const lines = await extractTextFromImage(canvas);
  //     lines.forEach((line) => paragraph.push(line));
  //   }
  // }

  await loadingTask.destroy();
  return paragraph;
}
