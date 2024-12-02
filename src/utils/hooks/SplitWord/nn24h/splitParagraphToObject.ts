import { log } from 'console';
import { saveAs } from 'file-saver';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { getConvertNewDataExcel } from '../nn24h/extractParagraphFromWord';

function detectRowInExcel(paragraph: string) {
  return /^\#/.test(paragraph.trim());
}

function detectCorrectAnswer(paragraph: string) {
  return /^\*\./.test(paragraph.trim());
}

function detectExplain(paragraph: string) {
  return /^\$b\./.test(paragraph.trim());
}

export function SplitParagraphsToObject(paragraphs: string[]) {
  const length = paragraphs.length;
  const questions: string[][] = [];
  let question: string[] = [];
  for (let i = 0; i < length; i++) {
    const paragraph = paragraphs[i];
    if (detectRowInExcel(paragraph)) {
      if (question.length) {
        questions.push(question);
      }
      question = [paragraph];
    } else {
      question.push(paragraph);
    }
  }

  return questions;
}

function arrayToObjectQuestion(questions: string[][]) {
  return questions.map((question) => {
    let obj = {};
    const title = [];
    const correctAnswer = [];
    const other = [];
    const explain: string[] = [];

    question.forEach((item) => {
      if (detectRowInExcel(item)) {
        title.push(item);
      } else if (detectCorrectAnswer(item)) {
        correctAnswer.push(item);
      } else if (detectExplain(item)) {
        explain.push(item);
      } else {
        other.push(item);
      }
      const formattedAnswer: string[] = [];
      if (correctAnswer.length) {
        correctAnswer.forEach((correctA, index) => {
          formattedAnswer.push(correctA);
          formattedAnswer.push(explain?.[index]);
        });
      } else {
        explain.forEach((e) => formattedAnswer.push(e));
      }
      return [...title, ...formattedAnswer.filter((p) => p !== undefined), ...other].forEach((i, idx) => {
        obj[idx] = i;
      });
    });
    // console.log('title', title);
    // console.log('correctAnswer', correctAnswer);
    // console.log('other', other);
    // console.log('explain', explain);
    return obj;
  });
}

export const exportQuestionsToExcel = (questions: string[][], fileName: string) => {
  const data = arrayToObjectQuestion(questions);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  const date = moment().valueOf();
  saveAs(blob, `${fileName}_${date}.xlsx`);
};

export const exportFileWordtoExcel = (data) => {
  const formattedData = [];
  let currentRow = [];
  data.forEach((item) => {
    if (item.text.trim()) {
      currentRow.push(item.text); // Thêm nội dung vào hàng hiện tại
    } else if (currentRow.length > 0) {
      formattedData.push(currentRow); // Đẩy hàng đã hoàn thiện vào mảng
      currentRow = []; // Bắt đầu hàng mới
    }
  });
  // Lưu hàng cuối nếu có
  if (currentRow.length > 0) {
    formattedData.push(currentRow);
  }
  // Thêm khoảng cách giữa các hàng
  const spacedData = [];
  formattedData.forEach((row) => {
    spacedData.push(row);
    spacedData.push([]);
  });
  const converted = formattedData.map(item => {
    const result = item[4]?.replace(/(<br>)/g, '$1"');
    const firstLine = item[0]
      .replace(/^\d+\.\s*/, '#.') // Thay số và dấu chấm, xóa khoảng trắng sau đó
      .toLowerCase()
      .trim(); // Xóa khoảng trắng ở đầu/cuối chuỗi.
    const twoLine = `$.${item[1]}`;
    const threeLine = `*.${item[2]}`;
    const fourendfile = `$b.<br>"${item[3]}"<br>"${result}"`;
    // const five = `$bvi."${result}"`
    const firtItem = [firstLine, twoLine, threeLine, fourendfile, ...item.slice(5)]; // Giữ các phần tử còn lại không thay đổi
    return firtItem
  });

  // Tạo workbook và worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(converted);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'question');
  // Xuất file Excel
  XLSX.writeFile(workbook, 'question.xlsx');
}

/* đang xử lý giở */
export const exportTopicEnglishTHPT = (questions, formatQuestions) => {
  // formatQuestions.forEach((item) => {
  //   const { answers, child, correctAnswer, question, solution  } = item;
  //   console.log('answers', answers);
  //   console.log('child', child);
  //   console.log('correctAnswer', correctAnswer);
  //   console.log('question', question);
  //   console.log('solution', solution);
  // })
  // arrayToObjectQuestion(questions);
  // console.log(questions);
}

function transformData(inputData) {
  const result = [];
  // Lặp qua từng đối tượng trong mảng inputData
  inputData.forEach(item => {
    // Push the title and the main question
    result.push([
      item.title,
      item.question
    ]);
    // Lặp qua các câu hỏi con (child)
    item.child.forEach(child => {
      const options = child.childHasOptions.map(option => option);
      result.push([
        "#.<br></br>",
        "#p.<b></b></br>",
        child.childQuestion,
        ...options,
        item.explain // Explanation được thêm sau các options
      ]);
    });
    // Push the translated passage
    result.push([
      item.passage
    ]);
  });

  return result;
}

export const exportMultipleChoiceEnglish = (rowData) => {
  const newData = getConvertNewDataExcel(rowData);
  let question = [];
  let explain = '';
  let passage = '';
  newData.map(item => {
    const firstLine = `#.<br>${item.header}</br>`;
    const twoLine = `#p.<b>${item.description}</b><br>${item.aware}`;
    // console.log(item.questions);
    let child = [];
    for (const v of item.questions) {
      if (v.explanation) {
        explain += `#p.${v.explanation}`;
      }
      const hasOptions = ['A.', 'B.', 'C.', 'D.'].every(option => v.options[0].includes(option));
      if (hasOptions) {
        const separatedAnswers = v.options[0].split('<br>').map(item => item.trim());
        child.push({ childHasOptions: separatedAnswers, childQuestion: `#p.${v.number}<br>` })
      } else {
        const separatedAnswers = v.options;
        child.push({ childHasOptions: separatedAnswers, childQuestion: `#p.${v.number}<br>` })
      }
    }
    if (item.passage) {
      passage += `#p.${item.passage}`;
    } else {
      passage += `#p.${item.passage}`
    }
    question.push({ title: firstLine, question: twoLine, child, explain, passage: passage })
  })
  const data = transformData(question)
  // Tạo workbook và worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'question');
  // Xuất file Excel
  XLSX.writeFile(workbook, 'test1.xlsx');

}
