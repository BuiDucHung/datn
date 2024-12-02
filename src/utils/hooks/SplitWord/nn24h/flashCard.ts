import { IParagraph, ParagraphComponent } from '../word/other';
import { convertContentToHtml } from './converQuestionToHtml';

const VOCAL_PATTERN = /^BẢNG\sTỪ\sVỰNG/;
const STRUCT_PATTERN = /^BẢNG\sCẤU\sTRÚC/;
const VOCAL_PATTERN_HEADER = /^Từ\svựng/;
const TYPE_PATTERN_HEADER = /^Từ\sloại/;
const TRANSCRIPTION_PATTERN_HEADER = /^Phiên\sâm/;
const MEAN_PATTERN_HEADER = /^Nghĩa/;
const EXAMPLE_PATTERN_HEADER = /^Ví\sdụ/;
const STRUCT_PATTERN_HEADER = /^Cấu\strúc/;

const convertRowComponentToHtml = (component: ParagraphComponent[]) => {
  let html = '';
  component.forEach((subPara) => {
    html += convertContentToHtml(subPara);
  });
  return html;
};

export function coverFlashCard(paragraphs: IParagraph[]) {
  const lengthParagraphs = paragraphs.length;
  const questions = [];
  let startVocal = false, startStruct = false;
  let vocalIndex = 0,
    typeIndex = 0,
    meanIndex = 0,
    exampleIndex = 0,
    transcriptionIndex = 0;

  let structIndex = 0,
    meanStructIndex = 0,
    exampleStructIndex = 0;

  for (let i = 0; i < lengthParagraphs; i++) {
    const { table } = paragraphs[i];
    if (!table) {
      continue;
    }
    const firstRow = table[0];
    const firstData = firstRow?.[0];
    if (!firstData) {
      continue;
    }
    const { text } = firstData?.[0];
    if (VOCAL_PATTERN.test(text.trim())) {
      if (table.length > 1) {
        startVocal = true;
        startStruct = false;
        const tableHeader = table[1];
        if (tableHeader && tableHeader.length) {
          for (let j = 0; j < tableHeader.length; j++) {
            const data = tableHeader[j];
            if (VOCAL_PATTERN_HEADER.test(data[0].text.trim())) {
              vocalIndex = j;
            } else if (TYPE_PATTERN_HEADER.test(data[0].text.trim())) {
              typeIndex = j;
            } else if (TRANSCRIPTION_PATTERN_HEADER.test(data[0].text.trim())) {
              transcriptionIndex = j;
            } else if (MEAN_PATTERN_HEADER.test(data[0].text.trim())) {
              meanIndex = j;
            } else if (EXAMPLE_PATTERN_HEADER.test(data[0].text.trim())) {
              exampleIndex = j;
            }
          }

          for (let j = 2; j < table.length; j++) {
            const row = table[j];
            const item = [];
            item.push(
              row?.[vocalIndex]?.[0]?.text
                ? `#.${convertRowComponentToHtml(row?.[vocalIndex]?.[0]?.component)}`
                : undefined
            );
            item.push(
              row?.[typeIndex]?.[0]?.text || row?.[transcriptionIndex]?.[0]?.text
                ? `$.${convertRowComponentToHtml(row?.[typeIndex]?.[0]?.component)}<br>${convertRowComponentToHtml(row?.[transcriptionIndex]?.[0]?.component)}`
                : undefined
            );
            item.push(
              row?.[meanIndex]?.[0]?.text
                ? `*.${convertRowComponentToHtml(row?.[meanIndex]?.[0]?.component)}`
                : undefined
            );
            item.push(
              row?.[exampleIndex]?.[0]?.text
                ? `$b.${convertRowComponentToHtml(row?.[exampleIndex]?.[0]?.component)}`
                : undefined
            );
            questions.push(item.filter((i) => !!i));
          }
        }
      }
    } else if (STRUCT_PATTERN.test(text.trim())) {
      if (table.length > 1) {
        startStruct = true;
        startVocal = true;
        const tableHeader = table[1];
        if (tableHeader && tableHeader.length) {
          for (let j = 0; j < tableHeader.length; j++) {
            const data = tableHeader[j];
            if (STRUCT_PATTERN_HEADER.test(data[0].text.trim())) {
              structIndex = j;
            } else if (MEAN_PATTERN_HEADER.test(data[0].text.trim())) {
              meanStructIndex = j;
            } else if (EXAMPLE_PATTERN_HEADER.test(data[0].text.trim())) {
              exampleStructIndex = j;
            }
          }
          for (let j = 2; j < table.length; j++) {
            const row = table[j];
            const item = [];
            item.push(
              row?.[structIndex]?.[0]?.text
                ? `#.${convertRowComponentToHtml(row?.[structIndex]?.[0]?.component)}`
                : undefined
            );
            item.push(
              row?.[meanStructIndex]?.[0]?.text
                ? `*.${convertRowComponentToHtml(row?.[meanStructIndex]?.[0]?.component)}`
                : undefined
            );
            item.push(
              row?.[exampleStructIndex]?.[0]?.text
                ? `$b.${convertRowComponentToHtml(row?.[exampleStructIndex]?.[0]?.component)}`
                : undefined
            );
            questions.push(item.filter((i) => !!i));
          }
        }
      }
    } else if (startVocal === true) {
      if(table.length > 0 && table[0]?.length === 6) {
        for (let j = 0; j < table.length; j++) {
          const row = table[j];
          const item = [];
          item.push(
            row?.[vocalIndex]?.[0]?.text
              ? `#.${convertRowComponentToHtml(row?.[vocalIndex]?.[0]?.component)}`
              : undefined
          );
          item.push(
            row?.[typeIndex]?.[0]?.text || row?.[transcriptionIndex]?.[0]?.text
              ? `$.${convertRowComponentToHtml(row?.[typeIndex]?.[0]?.component)}<br>${convertRowComponentToHtml(row?.[transcriptionIndex]?.[0]?.component)}`
              : undefined
          );
          item.push(
            row?.[meanIndex]?.[0]?.text
              ? `*.${convertRowComponentToHtml(row?.[meanIndex]?.[0]?.component)}`
              : undefined
          );
          item.push(
            row?.[exampleIndex]?.[0]?.text
              ? `$b.${convertRowComponentToHtml(row?.[exampleIndex]?.[0]?.component)}`
              : undefined
          );
          questions.push(item.filter((i) => !!i));
        }
      } 
    } else if (startStruct === true) {
      if(table.length > 0 && table[0]?.length === 4) {
        for (let j = 0; j < table.length; j++) {
          const row = table[j];
          const item = [];
          item.push(
            row?.[structIndex]?.[0]?.text
              ? `#.${convertRowComponentToHtml(row?.[structIndex]?.[0]?.component)}`
              : undefined
          );
          item.push(
            row?.[meanStructIndex]?.[0]?.text
              ? `*.${convertRowComponentToHtml(row?.[meanStructIndex]?.[0]?.component)}`
              : undefined
          );
          item.push(
            row?.[exampleStructIndex]?.[0]?.text
              ? `$b.${convertRowComponentToHtml(row?.[exampleStructIndex]?.[0]?.component)}`
              : undefined
          );
          questions.push(item.filter((i) => !!i));
        }
      }
    }
    continue;
  }
  return questions;
}
