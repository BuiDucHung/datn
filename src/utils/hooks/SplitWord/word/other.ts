import { IQuestion } from "..";

export enum TextType {
  NORMAL_TEXT = 0,
  BOLD_TEXT = 1,
  ITALIC_TEXT = 2,
  UNDERLINE_TEXT = 3,
  HIGHLIGHT_TEXT = 4,
  BOLD_ITALIC_TEXT = 5,
  BOLD_UNDERLINE_TEXT = 6,
  BOLD_HIGHLIGHT_TEXT = 7,
  BOLD_ITALIC_UNDERLINE_TEXT = 8,
  IMAGE = 9,
}

const THREE_LEVEL_QUESTION_PATTERN = /^(I|II|III|IV|V|VI|VII|VIII|IX|X)\./;
const TWO_LEVEL_QUESTION_PATTERN =
  /(^Question\s[1-9]\d*|^Câu\s[1-9]\d*|^Bài\s[1-9]\d*)/;
const ONE_LEVEL_QUESTION_PATTERN = /^[1-9]\d*\./;

const ANSWER_PATTERN = /^[ABCD]\./;
const ANSWER_IN_QUESTION = /([ABCD]\.)/g;
const SOLUTION_PATTERN = /^(HƯỚNG\sDẪN\sGIẢI|GIẢI\sTHÍCH)/i;
const CORRECT_PATTERN = /^Đáp án/;

export type ParagraphComponent = {
  content: string;
  type: TextType;
  src?: string;
};

type Data = { text: string; component: ParagraphComponent[] }[];
type Row = Data[];
type Table = Row[];

export type IParagraph = {
  text: string;
  component: ParagraphComponent[];
  table?: Table;
};

export type IReturnParagraph = ParagraphComponent[] | [{ table: Table }];

export type IQuestionWord = {
  question: IReturnParagraph[];
  solution?: IReturnParagraph[];
  answers?: ParagraphComponent[][];
  child?: IQuestionWord[];
};

function detectThreeLevelQuestion(paragraph: IParagraph) {
  const { text, component } = paragraph;
  return THREE_LEVEL_QUESTION_PATTERN.test(text?.trim());
}

function detectTwoLevelQuestion(paragraph: IParagraph) {
  const { text, component } = paragraph;
  return TWO_LEVEL_QUESTION_PATTERN.test(text?.trim());
}

function detectOneLevelQuestion(paragraph: IParagraph) {
  const { text, component } = paragraph;
  return ONE_LEVEL_QUESTION_PATTERN.test(text?.trim());
}

function detectAnswer(paragraph: IParagraph) {
  const { text, component } = paragraph;
  return ANSWER_PATTERN.test(text?.trim());
}

function detectSolution(paragraph: IParagraph) {
  const { text, component, table } = paragraph;
  if (!!table) {
    let result = false;
    let i = 0;
    do {
      const row = table[i];
      for (let j = 0; j < row.length; j++) {
        const data = row[j];
        if (result) {
          break;
        }
        for (let k = 0; k < data.length; k++) {
          const { text } = data[k];
          if (SOLUTION_PATTERN.test(text)) {
            result = true;
            break;
          }
        }
      }
      ++i;
    } while (!result && i < table.length);
    return result;
  }
  return SOLUTION_PATTERN.test(text?.trim());
}

// function handleDetectAnswersInQuestion(paragraph: IParagraph): ParagraphComponent[][] {
//   const { text, component } = paragraph;
//   const lengthComponents = component?.length;
//   const answers: ParagraphComponent[][] = [];
//   let startAnswers: boolean = false;
//   let answer: ParagraphComponent[] = [];
//   for (let i = 0; i < lengthComponents; i++) {
//     const { content, type } = component[i];
//     if (ANSWER_PATTERN.test(content?.trim())) {
//       startAnswers = true;
//       if (answer.length) answers.push(answer);
//       answer = [component[i]];
//       continue;
//     }
//     if (startAnswers) {
//       answer.push(component[i]);
//     }
//   }
//   if (answer.length) answers.push(answer);

//   return answers;
// }

function handleDetectAnswersInQuestion(paragraph: IParagraph) {
  const { text, component } = paragraph;
  const lengthComponents = component?.length;
  const title = [];
  const answers: ParagraphComponent[][] = [];
  let startAnswers: boolean = false;
  let answer: ParagraphComponent[] = [];
  const arrayComponents: any[] = [];
  for (let i = 0; i < lengthComponents; i++) {
    const { content, type } = component[i];
    content
      .split(/([ABCD]\.)/g)
      .filter((item) => !!item)
      .forEach((i) =>
        arrayComponents.push({
          content: i,
          type: type,
        })
      );
  }
  for (let i = 0; i < arrayComponents.length; i++) {
    const { content, type } = arrayComponents[i];
    if (ANSWER_PATTERN.test(content?.trim())) {
      startAnswers = true;
      if (answer.length) answers.push(answer);
      answer = [arrayComponents[i]];
      continue;
    }
    if (startAnswers) {
      answer.push(arrayComponents[i]);
    } else {
      title.push(arrayComponents[i]);
    }
  }
  if (answer.length) answers.push(answer);

  return {
    answers,
    title,
  };
}

// function handleDetectAnswerInAnswers(paragraph: IParagraph): ParagraphComponent[][] {
//   const { text, component } = paragraph;
//   const lengthComponents = component?.length;
//   if (lengthComponents <= 2) return [component];
//   let answer: ParagraphComponent[] = [];
//   let answers: ParagraphComponent[][] = [];
//   for (let i = 0; i < lengthComponents; i++) {
//     const { content, type } = component[i];
//     if (ANSWER_PATTERN.test(content?.trim())) {
//       if (answer.length) answers.push(answer);
//       answer = [component[i]];
//       continue;
//     }
//     answer.push(component[i]);
//   }
//   if (answer.length) answers.push(answer);
//   return answers;
// }

function handleDetectAnswerInAnswers(
  paragraph: IParagraph
): ParagraphComponent[][] {
  const { text, component } = paragraph;
  const lengthComponents = component?.length;
  const arrayComponents: any[] = [];
  let startAnswer = false;
  let answer: ParagraphComponent[] = [];
  let answers: ParagraphComponent[][] = [];

  for (let i = 0; i < lengthComponents; i++) {
    const { content, type } = component[i];
    content
      .split(/([ABCD]\.)/g)
      .filter((item) => !!item)
      .forEach((i) =>
        arrayComponents.push({
          content: i,
          type: type,
        })
      );
  }
  const lengthArr = arrayComponents.length;
  if (lengthArr <= 2) return [arrayComponents];

  for (let i = 0; i < lengthArr; i++) {
    const { content, type } = arrayComponents[i];
    if (ANSWER_PATTERN.test(content?.trim())) {
      startAnswer = true;
      if (answer.length) answers.push(answer);
      answer = [arrayComponents[i]];
      continue;
    }
    if (startAnswer) {
      answer.push(arrayComponents[i]);
    }
  }
  if (answer.length) answers.push(answer);
  return answers;
}

export function splitQuestionsOtherExamWord(paragraphs: IParagraph[]) {
  const questions: IQuestionWord[] = []; // danh sách các câu hỏi trong file.

  let startThreeLevelQuestion = false;

  let startTwoLevelQuestion = false;

  let startOneLevelQuestion = false;

  let startAnswer: boolean = false; // bắt dầu đáp án  (mặc đinh đáp án chỉ nằm trên 1 dòng.)
  let startSolution: boolean = false; // bắt đầu giải thích

  let threeLevelQuestion: any[] = []; // đề bài câu hỏi level 3
  let twoLevelQuestion: any[] = []; // đề bài câu hỏi level 2
  let oneLevelQuestion: any[] = []; // đề bài câu hỏi level 1

  let threeLevelSolution: any[] = [];
  let twoLevelSolution: any[] = [];
  let oneLevelSolution: any[] = [];

  let twoLevelQuestions: IQuestionWord[] = []; // list câu hỏi 2 cấp trong câu hỏi 3 cấp.
  let oneLevelQuestions: IQuestionWord[] = []; // list câu hỏi 1 cấp trong câu hỏi 2 cấp.

  let answer: ParagraphComponent[][] = []; // đáp án lựa chọn của câu hỏi 1 cấp

  const lengthParagraph = paragraphs.length;
  for (let i = 0; i < lengthParagraph; i++) {
    if (detectThreeLevelQuestion(paragraphs[i])) {
      /// reset tai day sau
      startThreeLevelQuestion = true;
      startTwoLevelQuestion = false;
      startOneLevelQuestion = false;
      startAnswer = false;
      startSolution = false;
      // gộp thành các câu hỏi
      if (oneLevelQuestion.length) {
        oneLevelQuestions.push({
          question: oneLevelQuestion,
          answers: answer,
          solution: oneLevelSolution,
        });
      }

      if (twoLevelQuestion.length) {
        if (oneLevelQuestions.length) {
          twoLevelQuestions.push({
            question: twoLevelQuestion,
            solution: twoLevelSolution,
            child: oneLevelQuestions,
          });
          oneLevelQuestions = [];
        } else {
          twoLevelQuestions.push({
            question: twoLevelQuestion,
            solution: twoLevelSolution,
            answers: answer,
          });
        }
      }

      if (threeLevelQuestion.length) {
        if (twoLevelQuestions.length) {
          questions.push({
            question: threeLevelQuestion,
            solution: threeLevelSolution,
            child: twoLevelQuestions,
          });
        } else if (oneLevelQuestions.length) {
          questions.push({
            question: threeLevelQuestion,
            solution: threeLevelSolution,
            child: oneLevelQuestions,
          });
        } else {
          questions.push({
            question: threeLevelQuestion,
            solution: threeLevelSolution,
            answers: answer,
          });
        }
      } else {
        if (twoLevelQuestions.length) {
          twoLevelQuestions.forEach((question) => questions.push(question));
        } else if (oneLevelQuestions.length) {
          oneLevelQuestions.forEach((question) => questions.push(question));
        }
      }

      // reset
      threeLevelQuestion = [paragraphs[i].component];
      twoLevelQuestion = [];
      oneLevelQuestion = [];
      threeLevelSolution = [];
      twoLevelSolution = [];
      oneLevelSolution = [];
      twoLevelQuestions = [];
      oneLevelQuestions = [];
      answer = [];
      if (i !== lengthParagraph - 1) continue;
    }

    if (detectTwoLevelQuestion(paragraphs[i])) {
      startThreeLevelQuestion = false;
      startTwoLevelQuestion = true;
      startOneLevelQuestion = false;
      startAnswer = false;
      startSolution = false;

      if (oneLevelQuestion.length) {
        oneLevelQuestions.push({
          question: oneLevelQuestion,
          answers: answer,
          solution: oneLevelSolution,
        });
      }

      if (twoLevelQuestion.length) {
        if (oneLevelQuestions.length) {
          twoLevelQuestions.push({
            question: twoLevelQuestion,
            solution: twoLevelSolution,
            child: oneLevelQuestions,
          });
          oneLevelQuestions = [];
        } else {
          twoLevelQuestions.push({
            question: twoLevelQuestion,
            solution: twoLevelSolution,
            answers: answer,
          });
        }
      }

      // detect answer trong question;
      const resultDetect = handleDetectAnswersInQuestion(paragraphs[i]);
      twoLevelQuestion = [resultDetect.title];
      answer = resultDetect.answers;
      // reset
      oneLevelQuestion = [];
      twoLevelSolution = [];
      oneLevelSolution = [];
      oneLevelQuestions = [];

      // next đen vong lap tiep
      if (i !== lengthParagraph - 1) continue;
    }

    if (detectOneLevelQuestion(paragraphs[i])) {
      startOneLevelQuestion = true;
      if (oneLevelQuestion.length) {
        oneLevelQuestions.push({
          question: oneLevelQuestion,
          answers: answer,
          solution: oneLevelSolution,
        });
      }

      // detect answer trong question;
      const resultDetect = handleDetectAnswersInQuestion(paragraphs[i]);
      answer = resultDetect.answers;

      // reset
      oneLevelQuestion = [resultDetect.title];
      oneLevelSolution = [];

      if (i !== lengthParagraph - 1) continue;
    }

    if (detectAnswer(paragraphs[i])) {
      startAnswer = true;
      const subAnswer = handleDetectAnswerInAnswers(paragraphs[i]);
      for (let j = 0; j < subAnswer.length; j++) {
        answer.push(subAnswer[j]);
      }
      if (i !== lengthParagraph - 1) continue;
    }

    if (detectSolution(paragraphs[i])) {
      startSolution = true;
      if (startOneLevelQuestion) {
        oneLevelSolution.push(
          paragraphs[i]?.table
            ? [{ table: paragraphs[i].table }]
            : paragraphs[i].component
        );
      } else if (startTwoLevelQuestion) {
        twoLevelSolution.push(
          paragraphs[i]?.table
            ? [{ table: paragraphs[i].table }]
            : paragraphs[i].component
        );
      } else if (startThreeLevelQuestion) {
        threeLevelSolution.push(
          paragraphs[i]?.table
            ? [{ table: paragraphs[i].table }]
            : paragraphs[i].component
        );
      }
    }

    // push phần tử
    if (
      i !== lengthParagraph - 1 ||
      (i === lengthParagraph - 1 &&
        !detectSolution(paragraphs[i]) &&
        !detectAnswer(paragraphs[i]) &&
        !detectOneLevelQuestion(paragraphs[i]) &&
        !detectTwoLevelQuestion(paragraphs[i]) &&
        !detectThreeLevelQuestion(paragraphs[i]))
    ) {
      if (startSolution) {
        if (startThreeLevelQuestion) {
          threeLevelSolution.push(
            paragraphs[i]?.table
              ? [{ table: paragraphs[i].table }]
              : paragraphs[i].component
          );
        } else if (startTwoLevelQuestion) {
          twoLevelSolution.push(
            paragraphs[i]?.table
              ? [{ table: paragraphs[i].table }]
              : paragraphs[i].component
          );
        } else if (startOneLevelQuestion) {
          oneLevelSolution.push(
            paragraphs[i]?.table
              ? [{ table: paragraphs[i].table }]
              : paragraphs[i].component
          );
        }
      } else if (startThreeLevelQuestion) {
        threeLevelQuestion.push(
          paragraphs[i]?.table
            ? [{ table: paragraphs[i].table }]
            : paragraphs[i].component
        );
      } else if (startTwoLevelQuestion) {
        twoLevelQuestion.push(
          paragraphs[i]?.table
            ? [{ table: paragraphs[i].table }]
            : paragraphs[i].component
        );
      } else if (startOneLevelQuestion) {
        oneLevelQuestion.push(
          paragraphs[i]?.table
            ? [{ table: paragraphs[i].table }]
            : paragraphs[i].component
        );
      } else if (startAnswer) {
        answer[answer.length - 1].push(...paragraphs[i].component);
      }
    }

    // push phần tử cuối cùng.
    if (i === lengthParagraph - 1) {
      if (oneLevelQuestion.length) {
        oneLevelQuestions.push({
          question: oneLevelQuestion,
          answers: answer,
          solution: oneLevelSolution,
        });
      }

      if (twoLevelQuestion.length) {
        if (oneLevelQuestions.length) {
          twoLevelQuestions.push({
            question: twoLevelQuestion,
            solution: twoLevelSolution,
            child: oneLevelQuestions,
          });
          oneLevelQuestions = [];
        } else {
          twoLevelQuestions.push({
            question: twoLevelQuestion,
            solution: twoLevelSolution,
            answers: answer,
          });
        }
      }

      if (threeLevelQuestion.length) {
        if (twoLevelQuestions.length) {
          questions.push({
            question: threeLevelQuestion,
            solution: threeLevelSolution,
            child: twoLevelQuestions,
          });
        } else if (oneLevelQuestions.length) {
          questions.push({
            question: threeLevelQuestion,
            solution: threeLevelSolution,
            child: oneLevelQuestions,
          });
        } else {
          questions.push({
            question: threeLevelQuestion,
            solution: threeLevelSolution,
            answers: answer,
          });
        }
      } else {
        if (twoLevelQuestions.length) {
          twoLevelQuestions.forEach((question) => questions.push(question));
        } else if (oneLevelQuestions.length) {
          oneLevelQuestions.forEach((question) => questions.push(question));
        }
      }
    }
  }
  return questions;
}
