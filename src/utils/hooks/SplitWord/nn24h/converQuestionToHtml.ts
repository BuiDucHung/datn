import {
  BOLD_HIGHLIGHT_TEXT,
  BOLD_ITALIC_TEXT,
  BOLD_ITALIC_UNDERLINE_TEXT,
  BOLD_TEXT,
  BOLD_UNDERLINE_TEXT,
  IMAGE,
  ITALIC_TEXT,
  UNDERLINE_TEXT
} from '..';

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
        htmlData += `<br>${htmlParagraph}`;
      });
      htmlRow += `<td style="border:1px solid black; padding: 16px">${htmlData}</td>`;
    });
    htmlTable += `<tr style="border:1px solid black;">${htmlRow}</tr>`;
  });
  return `<table style="border:1px solid black; border-collapse:collapse;">${htmlTable}</table>`;
}


// export function convertTableToHTMLUpdate(table) {
//   let htmlTable = '';

//   table?.forEach((row) => {
//     let englishContent = '';
//     let vietnameseContent = '';

//     row.forEach((data) => {
//       let htmlData = '';
//       data.forEach((paragraph) => {
//         let htmlParagraph = '';
//         paragraph?.component?.forEach((subPara) => {
//           htmlParagraph += convertContentToHtml(subPara);
//         });
//         htmlData += `<br>${htmlParagraph}`;
//       });

//       // Tách nội dung theo thẻ <br>
//       const rows = htmlData.split('<br>');
//       rows.forEach((rowContent, index) => {
//         if (rowContent.trim()) {
//           // Kiểm tra nếu chứa <ins>, thay thế thành thẻ <a>
//           if (rowContent.includes('<ins>')) {
//             rowContent = rowContent.replace(/<ins>(.*?)<\/ins>/g, (match, p1) => {
//               const link = p1.trim();
//               return `<a href="https://${link}" style="color: #1155cc; padding-left: 4px" target="_blank">${link}</a>`;
//             });
//           }

//           // Kiểm tra nếu nội dung chứa "DỊCH BÀI"
//           if (rowContent.includes('DỊCH BÀI')) {
//             htmlTable += `<tr style="border:1px solid black;">
//               <td style="border:1px solid black; padding: 16px; color:#0563c1; text-align: center" colspan="2">${rowContent}</td>
//             </tr>`;
//           } else {
//             // Chia thành hai cột, 1 cột tiếng Anh và 1 cột tiếng Việt
//             if (index % 2 === 0) {
//               englishContent = rowContent; // Lưu tiếng Anh
//             } else {
//               vietnameseContent = rowContent; // Lưu tiếng Việt

//               // Nếu cả hai tiếng Anh và tiếng Việt đều có nội dung
//               if (englishContent && vietnameseContent) {
//                 htmlTable += `<tr style="border:1px solid black;">
//                   <td style="border:1px solid black; padding: 16px; width: 321px;">${englishContent}</td>
//                   <td style="border:1px solid black; padding: 16px; width: 321px;">${vietnameseContent}</td>
//                 </tr>`;
//                 englishContent = '';  // Reset tiếng Anh sau khi thêm vào bảng
//                 vietnameseContent = '';  // Reset tiếng Việt sau khi thêm vào bảng
//               }
//             }
//           }
//         }
//       });
//     });
//   });

//   console.log('htmlTable', htmlTable);
//   return `<table style="border:1px solid black; border-collapse:collapse;">${htmlTable}</table>`;
// }

export function convertTableToHTMLUpdate(table) {
  let htmlTable = '';
  // const items = splitTextAndKeepStructure(table)
  // console.log('table', table);
  
  table?.forEach((row) => {
    let htmlRow = '';
    row.forEach((data) => {
      let htmlData = '';
      data.forEach((paragraph) => {
        let htmlParagraph = '';
        paragraph?.component?.forEach((subPara) => {
          htmlParagraph += convertContentToHtml(subPara);
        });
        htmlData += `<br>${htmlParagraph}`;
      });
      // Kiểm tra nếu htmlData có chứa "DỊCH BÀI"
      // Kiểm tra nếu htmlData có chứa thẻ <ins>
      if (htmlData.includes('<ins>')) {
        // Sử dụng regex để thay thế <ins> bằng <a> có liên kết
        htmlData = htmlData.replace(/<ins>(.*?)<\/ins>/g, (match, p1) => {
          const link = p1.trim(); // Lấy nội dung bên trong thẻ <ins>
          return `<a href="https://${link}" style="color: #1155cc; padding-left: 4px" target="_blank">${link}</a>`;
        });
      }
      if (htmlData.includes('DỊCH BÀI')) {
        htmlRow += `<td style="border:1px solid black; padding: 16px; color:#0563c1; text-align: center" colspan="2">${htmlData}</td>`;
      } else {
        const rowItem = htmlData.split('<br>');
        const filterRow = rowItem.filter(f => f !== '');
        htmlRow += `<td style="border:1px solid black; padding: 16px; width: 321px">${htmlData}</td>`;
      }
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
      htmlQuestion += `${htmlPara}<br>`;
    });
  }
  if (solution) {
    solution?.forEach((paragraph) => {
      let htmlPara = '';
      paragraph?.forEach((subParagraph) => {
        if (subParagraph.table) {
          htmlPara += convertTableToHTML(subParagraph.table);
        } else {
          htmlPara += convertContentToHtml(subParagraph);
        }
      });
      htmlSolution += `${htmlPara}<br>`;
    });
    // if (solution[0]) htmlSolution = convertTableToHTML(solution[0].table)
  }

  if (answers) {
    htmlAnswers = answers?.map((item) => {
      let htmlPara = '';
      item.value?.forEach((subPara) => {
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

export function convertQuestionToHTMLUPDATE(_question) {
  const { question, answers, solution, child, correctAnswer, explain } = _question;

  let htmlQuestion = '';
  let htmlAnswers = [];
  let htmlSolution = '';
  let htmlChild = [];
  let htmlExplain = '';

  // tách ra phần dịch riêng 
  if (explain) {
    explain.forEach((paragraph) => {
      let htmlPara = '';
      htmlPara += convertTableToHTMLUpdate(paragraph);
      htmlExplain += `${htmlPara}<br>`;
    });
  }

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
      htmlQuestion += `${htmlPara}<br>`;
    });
  }
  if (solution) {
    solution?.forEach((paragraph) => {
      let htmlPara = '';
      paragraph?.forEach((subParagraph) => {
        if (subParagraph.table) {
          htmlPara += convertTableToHTML(subParagraph.table);
        } else {
          htmlPara += convertContentToHtml(subParagraph);
        }
      });
      htmlSolution += `${htmlPara}<br>`;
    });
    // if (solution[0]) htmlSolution = convertTableToHTML(solution[0].table)
  }

  if (answers) {
    htmlAnswers = answers?.map((item) => {
      let htmlPara = '';
      item.value?.forEach((subPara) => {
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
    correctAnswer,
    explain: htmlExplain
  };
}

export interface questionHtml {
  question: string;
  answers: { key: number; value: string }[];
  solution: string;
  child: questionHtml[];
  correctAnswer: string;
}

export function convertQuestionHtmlToFormatQuestion(questionHtml: questionHtml) {
  const { answers, child, question, solution, correctAnswer } = questionHtml;
  const coverQuestion = child?.length ? `#p.${question}` : `#.${question}`;
  const correctAnswerArr = correctAnswer?.split(',')?.map((item) => Number(item)) ?? [];
  const correctAnswerHtml =
    correctAnswerArr?.length && answers?.length
      ? answers.filter((item, index) => correctAnswerArr.includes(index))
      : [];
  const coverCorrectAnswers = correctAnswerHtml.map((i) => {
    let format = '';
    if (/^(<b>\s?A<\/b>|<b>\s?A\.<\/b>)/.test(i.value)) {
      console.log('chay');
      format = i.value.replace(/(<b>\s?A<\/b>\.|<b>\s?A\.<\/b>)/, 'A.');
    } else if (/^(<b>\s?B<\/b>|<b>\s?B\.<\/b>)/.test(i.value)) {
      format = i.value.replace(/(<b>\s?B<\/b>\.|<b>\s?B\.<\/b>)/, 'B.');
    } else if (/^(<b>\s?C<\/b>|<b>\s?C\.<\/b>)/.test(i.value)) {
      format = i.value.replace(/(<b>\s?C<\/b>\.|<b>\s?C\.<\/b>)/, 'C.');
    } else if (/^(<b>\s?D<\/b>|<b>\s?D\.<\/b>)/.test(i.value)) {
      format = i.value.replace(/(<b>\s?D<\/b>\.|<b>\s?D\.<\/b>)/, 'D.');
    } else {
      format = i.value;
    }
    return `*.${format}`;
  });
  const coverSolution = solution ? `$b.${solution}` : '';
  const coverChild = child?.map((item) => convertQuestionHtmlToFormatQuestion(item));
  const remainAnswer = answers.filter((i, index) => !correctAnswerArr.includes(index));

  return {
    question: coverQuestion,
    answers:
      remainAnswer?.map((i) => {
        if (/^(<b>\s?A<\/b>|<b>\s?A\.<\/b>)/.test(i.value))
          return i.value.replace(/(<b>\s?A<\/b>\.|<b>\s?A\.<\/b>)/, 'A.');
        if (/^(<b>\s?B<\/b>|<b>\s?B\.<\/b>)/.test(i.value))
          return i.value.replace(/(<b>\s?B<\/b>\.|<b>\s?B\.<\/b>)/, 'B.');
        if (/^(<b>\s?C<\/b>|<b>\s?C\.<\/b>)/.test(i.value))
          return i.value.replace(/(<b>\s?C<\/b>\.|<b>\s?C\.<\/b>)/, 'C.');
        if (/^(<b>\s?D<\/b>|<b>\s?D\.<\/b>)/.test(i.value))
          return i.value.replace(/(<b>\s?D<\/b>\.|<b>\s?D\.<\/b>)/, 'D.');
        return i.value;
      }) ?? [],
    solution: coverSolution,
    child: coverChild ?? [],
    correctAnswer: coverCorrectAnswers ?? [],
  };
}

export function convertQuestionHtmlToFormatQuestionUpdate(questionHtml: any) {
  const { answers, child, question, solution, correctAnswer, explain } = questionHtml;
  const coverQuestion = child?.length ? `#p.${question}` : `#.${question}`;
  const correctAnswerArr = correctAnswer?.split(',')?.map((item) => Number(item)) ?? [];
  const correctAnswerHtml =
    correctAnswerArr?.length && answers?.length
      ? answers.filter((item, index) => correctAnswerArr.includes(index))
      : [];
  const coverCorrectAnswers = correctAnswerHtml.map((i) => {
    let format = '';
    if (/^(<b>\s?A<\/b>|<b>\s?A\.<\/b>)/.test(i.value)) {
      console.log('chay');
      format = i.value.replace(/(<b>\s?A<\/b>\.|<b>\s?A\.<\/b>)/, 'A.');
    } else if (/^(<b>\s?B<\/b>|<b>\s?B\.<\/b>)/.test(i.value)) {
      format = i.value.replace(/(<b>\s?B<\/b>\.|<b>\s?B\.<\/b>)/, 'B.');
    } else if (/^(<b>\s?C<\/b>|<b>\s?C\.<\/b>)/.test(i.value)) {
      format = i.value.replace(/(<b>\s?C<\/b>\.|<b>\s?C\.<\/b>)/, 'C.');
    } else if (/^(<b>\s?D<\/b>|<b>\s?D\.<\/b>)/.test(i.value)) {
      format = i.value.replace(/(<b>\s?D<\/b>\.|<b>\s?D\.<\/b>)/, 'D.');
    } else {
      format = i.value;
    }
    return `*.${format}`;
  });
  const coverSolution = solution ? `$b.${solution}` : '';
  const coverChild = child?.map((item) => convertQuestionHtmlToFormatQuestion(item));
  const remainAnswer = answers.filter((i, index) => !correctAnswerArr.includes(index));
  const converExplain = `#p.${explain}`

  return {
    question: coverQuestion,
    answers:
      remainAnswer?.map((i) => {
        if (/^(<b>\s?A<\/b>|<b>\s?A\.<\/b>)/.test(i.value))
          return i.value.replace(/(<b>\s?A<\/b>\.|<b>\s?A\.<\/b>)/, 'A.');
        if (/^(<b>\s?B<\/b>|<b>\s?B\.<\/b>)/.test(i.value))
          return i.value.replace(/(<b>\s?B<\/b>\.|<b>\s?B\.<\/b>)/, 'B.');
        if (/^(<b>\s?C<\/b>|<b>\s?C\.<\/b>)/.test(i.value))
          return i.value.replace(/(<b>\s?C<\/b>\.|<b>\s?C\.<\/b>)/, 'C.');
        if (/^(<b>\s?D<\/b>|<b>\s?D\.<\/b>)/.test(i.value))
          return i.value.replace(/(<b>\s?D<\/b>\.|<b>\s?D\.<\/b>)/, 'D.');
        return i.value;
      }) ?? [],
    solution: coverSolution,
    child: coverChild ?? [],
    correctAnswer: coverCorrectAnswers ?? [],
    explain: converExplain
  };
}


export interface CoverQuestion {
  question: string;
  answers: string[];
  solution: string;
  child: CoverQuestion[];
  correctAnswer: string[];
}

export function coverRowExcelObjectFromCoverQuestion(_question: CoverQuestion, objects: any[]) {
  const { question, answers, solution, child, correctAnswer } = _question;
  const row = [];
  row.push(question);
  correctAnswer.forEach((item) => row.push(item));
  answers.forEach((item) => row.push(item));
  row.push(solution);
  objects.push(row.filter((item) => !!item));
  child?.forEach((item) => coverRowExcelObjectFromCoverQuestion(item, objects));
}

export function coverRowExcelObjectFromCoverQuestionUpdate(_question: any, objects: any[]) {
  const { question, answers, solution, child, correctAnswer, explain } = _question;
  const row = [];
  row.push(question);
  row.push(explain);
  correctAnswer.forEach((item) => row.push(item));
  answers.forEach((item) => row.push(item));
  row.push(solution);
  objects.push(row.filter((item) => !!item));
  child?.forEach((item) => coverRowExcelObjectFromCoverQuestion(item, objects));
}

type Component = {
  content: string;
  type: number;
};

type Paragraph = Component[];

type Row = {
  text: string;
  component: Component[];
}[][];

type Table = Row[];

export interface Question {
  question: Paragraph[];
  answers: [{ key: number; value: Paragraph }] | [];
  solution: [[{ table: Table }]] | Paragraph[];
  child: Question[];
}

// Hàm này của thành
export function convertQuestionToFormatQuestionNN24h(_question: Question | any) {
  const newQuestion: any = {};
  const { question, answers, solution, child } = _question;
  newQuestion.answers = answers ?? [];

  newQuestion.child = child?.map((c) => convertQuestionToFormatQuestionNN24h(c)) ?? [];

  if (question.length) {
    const [first, ...rest] = question;
    const [firstComponent, ...component] = first;
    const newFirst = {
      type: firstComponent.type,
      content: firstComponent.content.replace(/(Question|Câu) \d+[.:]?/, '')
    };
    if (component.length) {
      component[0] = {
        type: component[0].type,
        content: component[0].content.replace(/^[.:]/, '')
      };
    }
    newQuestion.question = [[newFirst, ...component], ...rest];
  }

  if (solution && solution.length) {
    const table = (solution as unknown as [{ table: Table }])[0][0].table;
    if (table[0].length === 1) {
      const row = table[0];
      const data = row[0];
      const [first, ...rest] = data;
      const firstPara = first.component;

      const [firstComponent, ...component] = firstPara;
      const newFirst = {
        type: firstComponent.type,
        content: firstComponent.content.replace(/Hướng dẫn giải/, '')
      };
      newQuestion.solution = [[newFirst, ...component], ...rest?.map((para) => para.component)];
    } else {
      newQuestion.solution = solution;
    }
  }

  return newQuestion;
}

// hàm này của Me 
export const convertQuestionToFormatQuestionNN24hUpdate = (_question: Question | any) => {
  const newQuestion: any = {};
  const { question, answers, solution, child } = _question;
  newQuestion.answers = answers ?? [];

  newQuestion.child = child?.map((c) => convertQuestionToFormatQuestionNN24hUpdate(c)) ?? [];

  if (question.length) {
    const [first, ...rest] = question;
    const [firstComponent, ...component] = first;

    // Xử lý question chính
    const newFirst = {
      type: firstComponent.type,
      content: firstComponent.content.replace(/(Question|Câu) \d+[.:]?/, '')
    };

    // Kiểm tra và xử lý explain nếu có
    let explain = '';
    if (component.length) {
      const explainComponentIndex = component.findIndex(comp =>
        /Dịch bài|Translation/.test(comp.content)
      );
      if (explainComponentIndex !== -1) {
        // Lấy nội dung dịch bài
        explain = component[explainComponentIndex].content.replace(/(Dịch bài|Translation)[.:]?/, '').trim();
        // Loại bỏ phần dịch bài khỏi question
        component.splice(explainComponentIndex, 1);
      }
      component[0] = {
        type: component[0].type,
        content: component[0].content.replace(/^[.:]/, '')
      };
    }

    newQuestion.question = [[newFirst, ...component], ...rest];

    // Thêm explain nếu có
    if (explain) {
      newQuestion.explain = explain;
    }
  }

  if (solution && solution.length) {
    const table = (solution as unknown as [{ table: Table }])[0][0].table;
    if (table[0].length === 1) {
      const row = table[0];
      const data = row[0];
      const [first, ...rest] = data;
      const firstPara = first.component;

      const [firstComponent, ...component] = firstPara;
      const newFirst = {
        type: firstComponent.type,
        content: firstComponent.content.replace(/Hướng dẫn giải/, '')
      };
      newQuestion.solution = [[newFirst, ...component], ...rest?.map((para) => para.component)];
    } else {
      newQuestion.solution = solution;
    }
  }
  return newQuestion;
}