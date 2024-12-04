import { DOMParser } from '@xmldom/xmldom';
import { upLoadImage } from './uploadImage';

export type IQuestion = {
  question?: string[];
  answers?: string[][] | null;
  solution?: string[] | null;
  child?: IQuestion[];
};

export const ANSWER_KEY = ['A.', 'B.', 'C.', 'D.', '(A)', '(B)', '(C)', '(D)'];
export const QUESTION_KEY = ['Question', 'Câu'];
export const SOLUTION_KEY = ['Hướng dẫn giải'];

export const NORMAL_TEXT = 0;
export const BOLD_TEXT = 1;
export const ITALIC_TEXT = 2;
export const UNDERLINE_TEXT = 3;
export const HIGHLIGHT_TEXT = 4;
export const BOLD_ITALIC_TEXT = 5;
export const BOLD_UNDERLINE_TEXT = 6;
export const BOLD_HIGHLIGHT_TEXT = 7;
export const BOLD_ITALIC_UNDERLINE_TEXT = 8;
export const IMAGE = 9;

export const answerTypes = [
  BOLD_TEXT,
  BOLD_ITALIC_TEXT,
  BOLD_UNDERLINE_TEXT,
  BOLD_HIGHLIGHT_TEXT,
  BOLD_ITALIC_UNDERLINE_TEXT
];
export const mediaTypes = [IMAGE];
// export const correctAnswerTypes = [BOLD_HIGHLIGHT_TEXT, BOLD_UNDERLINE_TEXT, HIGHLIGHT_TEXT, UNDERLINE_TEXT];
export const correctAnswerTypes = [BOLD_HIGHLIGHT_TEXT, BOLD_UNDERLINE_TEXT, HIGHLIGHT_TEXT];

export type HtmlAnswer = {
  key: number;
  value: string;
};
export type HtmlQuestion = {
  question: string;
  answers: HtmlAnswer[];
  correctAnswer: string;
  solution: string;
  child: HtmlQuestion[];
};
export type Paragraph = {
  content: string;
  type: number;
  src?: any;
};
// tạo dom xml
export function str2xml(str) {
  if (str?.charCodeAt(0) === 65279) {
    // BOM sequence
    str = str.substr(1);
  }
  return new DOMParser().parseFromString(str, 'text/xml');
}

// phan loai text
export function getTypeText(style) {
  const { isBold, isHighLight, isUnderline, isItalic } = style;
  if (isBold && isHighLight) return 7;
  if (isBold && isItalic && isUnderline) return 8;
  if (isBold && isItalic) return 5;
  if (isBold && isUnderline) return 6;
  if (isBold) return 1;
  if (isItalic) return 2;
  if (isUnderline) return 3;
  if (isHighLight) return 4;
  return NORMAL_TEXT;
}

// xu li bai toan tai 1 doan van:
export async function getComponentInParagraph(paragraphsElement, zip, relationShipElements) {
  const paragraph: Paragraph[] = [];
  const runComponent = paragraphsElement.getElementsByTagName('w:r');
  for (let i = 0; i < runComponent.length; i++) {
    const runNode = runComponent[i];
    // run la tag text
    const textComponent = runNode.getElementsByTagName('w:t');
    const brComponent = runNode.getElementsByTagName('w:br');
    const tabComponent = runNode.getElementsByTagName('w:tab');
    if (!!brComponent && brComponent.length > 0) {
      for (let j = 0; j < brComponent.length; j++) {
        paragraph.push({
          content: "<br>",
          type: NORMAL_TEXT
        })
      }
    }
    if (textComponent.length) {
      const textValue = textComponent[0].textContent;
      if (textValue) {
        const styleXml = (runNode.getElementsByTagName('w:rPr') ?? [])[0];
        const isBold = (styleXml?.getElementsByTagName('w:b') ?? []).length;
        const isHighLight = (styleXml?.getElementsByTagName('w:highlight') ?? []).length;
        const isUnderline = (styleXml?.getElementsByTagName('w:u') ?? []).length;
        const isItalic = (styleXml?.getElementsByTagName('w:i') ?? []).length;
        const textType = getTypeText({ isBold, isHighLight, isUnderline, isItalic });
        paragraph.push({
          content: textValue,
          type: textType
        });
      }

      continue;
    } else if (tabComponent.length) {
      paragraph.push({
        content: ' ',
        type: NORMAL_TEXT
      });
      continue;
    }

    // run la object. ở đây sẽ được xử lí bằng nhiều loại.

    // xử lí up load png trc. công thức toán học xủ lí sau.
    const objectComponent = runNode.getElementsByTagName('a:blip');
    if (objectComponent?.length) {
      const id = objectComponent[0].getAttribute('r:embed');
      const relationshipElement = relationShipElements?.filter((item) => item.getAttribute('Id') === id)[0];
      const target = relationshipElement.getAttribute('Target');
      const imageData = zip.files[`word/${target}`].asArrayBuffer();
      const blod = new Blob([imageData]);
      await upLoadImage(blod)
        .then((data) =>
          paragraph.push({
            content: '',
            type: IMAGE,
            src: data
          })
        )
        .catch((e) => console.log(e));
      continue;
    }
  }

  // format lại dư liệu.
  // b1: loai bo ki tu trong.
  const removeSpaceParagraphs: Paragraph[] = [];
  let fullText = '';

  for (let i = 0; i < paragraph.length; i++) {
    // them cac type media tai day
    if (!mediaTypes.includes(paragraph[i].type) && !paragraph[i].content?.trim()) {
      if (i === paragraph.length - 1) break;
      paragraph[i + 1].content = ' ' + paragraph[i + 1]?.content;
      continue;
    }
    removeSpaceParagraphs.push(paragraph[i]);
    fullText += paragraph[i].content;
  }

  // // b2: gop nhung doan van co cung loai lai voi nhau.
  const formatParagraphs: Paragraph[] = [];
  for (let i = 0; i < removeSpaceParagraphs.length; i++) {
    if (
      !mediaTypes.includes(paragraph[i].type) &&
      removeSpaceParagraphs[i].type === removeSpaceParagraphs[i + 1]?.type
    ) {
      removeSpaceParagraphs[i + 1].content = removeSpaceParagraphs[i].content + removeSpaceParagraphs[i + 1].content;
      continue;
    }
    formatParagraphs.push(removeSpaceParagraphs[i]);
  }

  return {
    text: fullText,
    component: formatParagraphs
  };
}

export async function splitParagraphs(xml, zip, relationShipElements) {
  const childBody = xml.getElementsByTagName('w:body')[0].childNodes;
  const paragraphs: {
    text?: string;
    component?: Paragraph[];
    table?: any;
  }[] = [];
  // tao ham de quy tim wp;
  async function recursiveGetPara(paraElement) {
    const subWPComponents = paraElement.getElementsByTagName('w:p');
    if (!subWPComponents.length) {
      const component = await getComponentInParagraph(paraElement, zip, relationShipElements);
      paragraphs.push(component);
      return;
    } else {
      // check xem có phien ban du phong hay khong
      const alternateContentElement = paraElement.getElementsByTagName('mc:AlternateContent');
      if (alternateContentElement.length) {
        const choiceContentElement = alternateContentElement[0].getElementsByTagName('mc:Choice');
        const paraInChoiceElement = choiceContentElement[0].getElementsByTagName('w:p');
        for (let j = 0; j < paraInChoiceElement.length; j++) {
          await recursiveGetPara(paraInChoiceElement[j]);
        }
      } else {
        for (let j = 0; j < subWPComponents.length; j++) {
          await recursiveGetPara(subWPComponents[j]);
        }
      }
    }
    return;
  }
  for (let i = 0, childLength = childBody.length; i < childLength; i++) {
    const nodeName = childBody[i].nodeName;
    const node = childBody[i];
    // xử lí là đoạn văn.
    if (nodeName === 'w:p') {
      await recursiveGetPara(node);
    }
    if (nodeName === 'w:tbl') {
      // lay cac row trong table
      const rows = node.getElementsByTagName('w:tr') ?? [];
      const table: any = [];
      for (let j = 0, len = rows.length; j < len; j++) {
        // lay ô trong row
        const rowsValue: {
          text: string;
          component: Paragraph[];
        }[][] = [];
        const squares = rows[j].getElementsByTagName('w:tc') ?? [];
        for (let k = 0; k < squares.length; k++) {
          const paragraphNodes = squares[k].getElementsByTagName('w:p');
          const paragraphs: {
            text: string;
            component: Paragraph[];
          }[] = [];
          for (let h = 0; h < paragraphNodes.length; h++) {
            const paragraph = await getComponentInParagraph(paragraphNodes[h], zip, relationShipElements);
            // push ca doan vao 1 o
            paragraphs.push(paragraph);
          }
          // push cac o vao 1 row
          rowsValue.push(paragraphs);
        }
        // push cac cac row vao trong bang
        table.push(rowsValue);
      }

      paragraphs.push({ table: table });
    }
  }
  return paragraphs;
}

export function convertContentToHtml(subPara) {
  const { content, type, src } = subPara;
  switch (type) {
    case BOLD_TEXT:
    case BOLD_HIGHLIGHT_TEXT:
      return `<b>${content}</b>`;
    case ITALIC_TEXT:
      return `<i>${content}</i>`;
    case UNDERLINE_TEXT:
      return `<ins>${content}</ins>`;
    case BOLD_ITALIC_TEXT:
      return `<b><i>${content}</i></b>`;
    case BOLD_UNDERLINE_TEXT:
      return `<b><ins>${content}</ins></b>`;
    case BOLD_ITALIC_UNDERLINE_TEXT:
      return `<b><ins><i>${content}</i></ins></b>`;
    case IMAGE:
      return `<img style="max-width: 100%;" src="${src}" alt=''>`;
    default:
      return content;
  }
}

export function convertTableToHTML(table) {
  let htmlTable = '';
  table?.forEach((row) => {
    let htmlRow = '';
    row.forEach((data) => {
      let htmlData = '';
      data.forEach((paragraph) => {
        let htmlParagraph = '';
        paragraph?.component?.forEach((subPara) => {
          htmlParagraph += convertContentToHtml(subPara);
        });
        htmlData += `<p>${htmlParagraph}</p>`;
      });
      htmlRow += `<td style="border:1px solid black; padding: 16px">${htmlData}</td>`;
    });
    htmlTable += `<tr style="border:1px solid black;">${htmlRow}</tr>`;
  });
  return `<table style="border:1px solid black; border-collapse:collapse;">${htmlTable}</table>`;
}

export function convertQuestionToHTML(_question) {
  const { question, answers, solution, child, correctAnswer } = _question;
  let htmlQuestion = '';
  let htmlAnswers = [];
  let htmlSolution = '';
  let htmlChild = [];
  if (question && question.length) {
    question.forEach((paragraph) => {
      let htmlPara = '';
      paragraph?.forEach((subParagraph) => {
        if (subParagraph.table) {
          htmlPara += convertTableToHTML(subParagraph.table);
        } else {
          htmlPara += convertContentToHtml(subParagraph);
        }
      });
      htmlQuestion += `<p>${htmlPara}</p>`;
    });
  }
  if (solution) {
    solution.forEach((paragraph) => {
      let htmlPara = '';
      paragraph?.forEach((subParagraph) => {
        if (subParagraph.table) {
          htmlPara += convertTableToHTML(subParagraph.table);
        } else {
          htmlPara += convertContentToHtml(subParagraph);
        }
      });
      htmlSolution += `<p>${htmlPara}</p>`;
    });
    // if (solution[0]) htmlSolution = convertTableToHTML(solution[0].table)
  }

  if (answers) {
    htmlAnswers = answers.map((item) => {
      let htmlPara = '';
      item.value.forEach((subPara) => {
        htmlPara += convertContentToHtml(subPara);
      });
      return {
        key: item.key,
        value: htmlPara
      };
    });
  }

  if (child && child.length) {
    htmlChild = child.map((item) => convertQuestionToHTML(item));
  }

  return {
    question: htmlQuestion,
    answers: htmlAnswers,
    solution: htmlSolution,
    child: htmlChild.length ? htmlChild : null,
    correctAnswer
  };
}

// hàm của thành
export function detectCorrectAnswerInChoiceQuestion(questions) {
  return questions.map((question) => {
    if (question?.answers?.length || question?.child?.length) {
      const { answers, child, ...remain } = question;
      const newChild = child?.length ? detectCorrectAnswerInChoiceQuestion(child) : child;
      let correctAnswer = '';
      if (answers?.length) {
        const newAnswers = answers.map((answer, index) => {
          const newAnswer = {
            key: index,
            value: answer
          };
          if (correctAnswerTypes.includes(answer[0]?.type) && !!answer[0].content && answer[0].content !== ' ') {
            correctAnswer += !!correctAnswer ? `-${index}` : index;
          } else if (
            answers?.length > 1 &&
            correctAnswerTypes.includes(answer[1]?.type) &&
            !!answer[1].content &&
            answer[1].content !== ' '
          ) {
            correctAnswer += !!correctAnswer ? `-${index}` : index;
          } else if (
            answers?.length > 2 &&
            correctAnswerTypes.includes(answer[2]?.type) &&
            !!answer[2].content &&
            answer[2].content !== ' '
          ) {
            correctAnswer += !!correctAnswer ? `-${index}` : index;
          }
          return newAnswer;
        });
        return {
          ...remain,
          answers: newAnswers,
          correctAnswer: !!correctAnswer ? correctAnswer : null,
          child: newChild
        };
      }
      return {
        ...remain,
        answers: [],
        correctAnswer: !!correctAnswer ? correctAnswer : null,
        child: newChild
      };
    }
    return question;
  });
}

// hàm của me
export const detectCorrectAnswerInChoiceQuestionUpdate = (questions) => {

  return questions.map((question) => {
    if (question?.answers?.length || question?.child?.length) {
      const { answers, child, ...remain } = question;
      const newChild = child?.length ? detectCorrectAnswerInChoiceQuestion(child) : child;
      let correctAnswer = '';
      let explain = [];

      const newquestionContent = question?.question.map((qPart) => {
        return qPart.filter((component) => {
          return !component.table;
        });
      }).filter((qPart) => qPart.length > 0);

      if (question?.question?.length) {
        question?.question.map((qPart) => {
          qPart
            .filter((component) => component.table !== undefined) // Chỉ giữ phần tử có `table`
            .forEach((component) => {
              explain.push(component.table); 
              // component.table.forEach((section) => {
              //   if (section.length === 2) {
              //     explain.push(section); // Đẩy vào `explain` nếu `section` có độ dài là 2
              //   }
              // });
            });

          // qPart.filter((component) => {
          //   console.log(component.table);
          //   component.table?.forEach((section) => {
          //     if (section.length === 2) {
          //       explain.push(section)
          //     }
          //   })
          // })
        })
      }
      if (answers?.length) {
        const newAnswers = answers.map((answer, index) => {
          const newAnswer = {
            key: index,
            value: answer
          };
          if (correctAnswerTypes.includes(answer[0]?.type) && !!answer[0].content && answer[0].content !== ' ') {
            correctAnswer += !!correctAnswer ? `-${index}` : index;
          } else if (
            answers?.length > 1 &&
            correctAnswerTypes.includes(answer[1]?.type) &&
            !!answer[1].content &&
            answer[1].content !== ' '
          ) {
            correctAnswer += !!correctAnswer ? `-${index}` : index;
          } else if (
            answers?.length > 2 &&
            correctAnswerTypes.includes(answer[2]?.type) &&
            !!answer[2].content &&
            answer[2].content !== ' '
          ) {
            correctAnswer += !!correctAnswer ? `-${index}` : index;
          }
          return newAnswer;
        });
        return {
          ...remain,
          answers: newAnswers,
          explain: explain,
          correctAnswer: !!correctAnswer ? correctAnswer : null,
          child: newChild
        };
      }
      return {
        ...remain,
        question: newquestionContent,
        answers: [],
        explain,
        correctAnswer: !!correctAnswer ? correctAnswer : null,
        child: newChild
      };
    }
    return question
  });


  // return questions.map((question) => {
  //   const { question: questionContent, answers, child, ...rest } = question;
  //   let explain = [];
  //   if (questionContent?.length) {
  //     questionContent.map((qPart) => {
  //       return qPart.filter((component) => {
  //         component.table?.forEach((section) => {
  //           if(section.length === 2) {
  //             explain.push(section)
  //           }
  //           // section.forEach((row) => {
  //           //   row.forEach((cell) => {
  //           //     if (cell.text && cell.text.includes("DỊCH BÀI:")) {
  //           //       explain.push(cell); // Thêm toàn bộ object `cell` vào mảng
  //           //     }
  //           //     // Kiểm tra bên trong `component` nếu có
  //           //     if (cell.component && Array.isArray(cell.component)) {
  //           //       cell.component.forEach((comp) => {
  //           //         explain.push(cell); 
  //           //       });
  //           //     }
  //           //   });
  //           // });
  //         });
  //       });
  //     });
  //     const newquestionContent = questionContent.map((qPart) => {
  //       return qPart.filter((component) => {
  //         return !component.table; 
  //         // component.table?.forEach((section) => {
  //         //   console.log('section', section);

  //         // });
  //       });
  //     }) .filter((qPart) => qPart.length > 0);;

  //     return {
  //       ...rest,
  //       question: questionContent,
  //       answers,
  //       correctAnswer: null,
  //       child: child?.length ? detectCorrectAnswerInChoiceQuestionUpdate(child) : [],
  //       // explain: explain || null // Thêm trường `explain` nếu có nội dung
  //     };
  //   }

  //   return {
  //     ...question,
  //     explain: null
  //   };
  // });
}
