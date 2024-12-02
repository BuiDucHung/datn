import { HtmlAnswer, HtmlQuestion, NORMAL_TEXT } from '../index';

const PARENT_PATTERN = /(A,\sB,\sC,\sor\sD|,\sB,\sC,\sor\sD|on\syour\sanswer\ssheet)/;
const QUESTION_PATTERN = /^Question\s[1-9]\d*/;
const ANSWER_PATTERN = /^[ABCD]\./;
const ANSWER_IN_QUESTION = /([ABCD]\.\s)/g;
const SOLUTION_PATTERN = /^(HƯỚNG\sDẪN\sGIẢI|GIẢI\sTHÍCH)/i;

export function detectParentQuestion(paragraph: string) {
  return PARENT_PATTERN.test(paragraph);
}

export function detectQuestion(paragraph: string) {
  return QUESTION_PATTERN.test(paragraph);
}

export function detectAnswers(paragraph) {
  return ANSWER_PATTERN.test(paragraph);
}

export function detectSolution(paragraph: string) {
  return SOLUTION_PATTERN.test(paragraph);
}

export function handleDetectAnswersInQuestion(paragraph: string): string[][] {
  const paragraphSplit = paragraph.split(ANSWER_IN_QUESTION);
  const filterParagraphSplit = paragraphSplit.filter((split) => split !== '');
  const length = filterParagraphSplit.length;
  const answers: string[] = [];
  let startAnswers = false;
  let answer: string[] = [];
  for (let i = 0; i < length; i++) {
    const word = filterParagraphSplit[i];
    //ANSWER_KEY.some((key) => word.includes(key))
    if (ANSWER_PATTERN.test(word)) {
      startAnswers = true;
      if (answer.length) answers.push(answer.join(' '));
      answer = [word];
      continue;
    }
    if (startAnswers) {
      answer.push(word);
    }
  }
  if (answer.length) answers.push(answer.join(''));
  return answers.map((answer) => [answer]);
}

export function handleDetectAnswerInAnswers(paragraph: string): string[][] {
  const paragraphSplit = paragraph.split(ANSWER_IN_QUESTION);
  const filterParagraphSplit = paragraphSplit.filter((split) => split !== '');
  const length = filterParagraphSplit.length;
  if (length <= 2) return [[paragraph]];
  let answer: string[] = [];
  let answers: string[] = [];
  for (let i = 0; i < length; i++) {
    const word = filterParagraphSplit[i];
    //ANSWER_KEY.some((key) => word.includes(key))
    if (ANSWER_PATTERN.test(word)) {
      if (answer.length) answers.push(answer.join(''));
      answer = [word];
      continue;
    }
    answer.push(word);
  }
  if (answer.length) answers.push(answer.join(' '));
  return answers.map((answer) => [answer]);
}

export type IQuestion = {
  question?: string[];
  answers?: string[][] | null;
  solution?: string[] | null;
  child?: IQuestion[];
};

export function splitQuestionsEnglishTHPTPdf(paragraphs: string[]) {
  const questions: IQuestion[] = [];
  let startQuestion: boolean = false;
  let startAnswer: boolean = false;
  let startSolution: boolean = false;
  let startParentQuestion: boolean = false;
  let parentQuestion: string[] = [];
  let child: IQuestion[] = [];
  let parentSolution: string[] = [];
  let question: string[] = [];
  let answer: string[][] = [];
  let solution: string[] = [];
  const lengthParagraph = paragraphs.length;
  for (let i = 0; i < lengthParagraph; i++) {
    if (detectParentQuestion(paragraphs[i])) {
      /// reset tai day sau
      startParentQuestion = true;
      startQuestion = false;
      startAnswer = false;
      startSolution = false;

      if (parentQuestion.length) {
        //  if(question.length) {
        child.push({
          question: question,
          answers: answer.length ? answer : null,
          solution: solution.length ? solution : null
        });
        //  }
        questions.push({
          question: parentQuestion,
          child: child,
          solution: parentSolution
        });
      } else if (question.length) {
        child.push({
          question: question,
          answers: answer.length ? answer : null,
          solution: solution.length ? solution : null
        });
        child.forEach((child) => questions.push(child));
      } else if (child.length) {
        child.forEach((child) => questions.push(child));
      }

      // reset
      parentQuestion = [paragraphs[i]];
      child = [];
      parentSolution = [];
      question = [];
      answer = [];
      solution = [];

      continue;
    }

    if (detectQuestion(paragraphs[i])) {
      startQuestion = true;
      startAnswer = false;
      startSolution = false;
      //push dữ liệu vào trong child
      if (question.length) {
        child.push({
          question: question,
          answers: answer.length ? answer : null,
          solution: solution.length ? solution : null
        });
      }

      // reset lai tat ca du lieu temp
      question = [paragraphs[i]];
      // answer = [];
      solution = [];

      // detect answer trong question;
      answer = handleDetectAnswersInQuestion(paragraphs[i]);

      // next đen vong lap tiep
      continue;
    }

    // push phần tử cuối cùng.
    if (i === lengthParagraph - 1) {
      if (question.length) {
        child.push({
          question: question,
          answers: answer.length ? answer : null,
          solution: solution.length ? solution : null
        });
      }
      questions.push({
        question: parentQuestion,
        child: child,
        solution: parentSolution
      });
    }

    // xử lí logic push answer nếu nó nằm ở đầu câu.
    if (detectAnswers(paragraphs[i])) {
      startAnswer = true;
      const subAnswer = handleDetectAnswerInAnswers(paragraphs[i]);
      for (let j = 0; j < subAnswer.length; j++) {
        answer.push(subAnswer[j] as string[]);
      }
      continue;
    }

    // handle table;
    // hien tai trong de thi thptqd ta thì những table sẽ có đáp án và dịch bài.
    // Hiện tại check 2 cột sẽ là dịch bài. còn 1 cot là hướng dẫn;
    // if (paragraphs[i].table) {
    //   const table = paragraphs[i].table;
    //   const columns = table[0].length;
    //   if (columns === 1) {
    //     // day la huong dan
    //     startQuestion = false;
    //     startAnswer = false;
    //     startSolution = true;

    //     solution.push([{ table: table }]);
    //     continue;
    //   }
    //   if (columns === 2) {
    //     parentSolution.push([{ table: table }]);
    //     continue;
    //   }
    //   continue;
    // }

    // chech la huong dan.
    // if (paragraphs[i].text?.trim() === "Hướng dẫn giải" && paragraphs[i].component[0].type === BOLD_TEXT) {
    //     startQuestion = false;
    //     startAnswer = false;
    //     startSolution = true;

    //     solution.push(paragraphs[i].component);
    //     continue;
    // }

    // check cac dong con lai.
    if (startSolution) {
      solution.push(paragraphs[i]);
    } else if (startAnswer) {
      if (paragraphs[i]) {
        answer[answer.length - 1].push(paragraphs[i]);
      }
    } else if (startQuestion) {
      question.push(paragraphs[i]);
    } else if (startParentQuestion) {
      parentQuestion.push(paragraphs[i]);
    }
  }
  return questions;
}

export const convertImageQuestionToBaseQuestion = (questions: IQuestion[]) => {
  return questions.map((question) => {
    return {
      question: question?.question?.length
        ? question.question.map((paragraph) => ({
            text: paragraph,
            component: {
              type: NORMAL_TEXT,
              content: paragraph
            }
          }))
        : null,
      child: question?.child?.length ? convertImageQuestionToBaseQuestion(question.child as IQuestion[]) : null,
      answers: question?.answers?.length
        ? question.answers.map((answer) => ({
            text: answer.join(' '),
            component: {
              type: NORMAL_TEXT,
              content: answer.join(' ')
            }
          }))
        : null,
      solution: question?.solution?.length
        ? question.question?.map((paragraph) => ({
            text: paragraph,
            component: {
              type: NORMAL_TEXT,
              content: paragraph
            }
          }))
        : null
    };
  });
};

export function convertImageQuestionToHtml(questions: IQuestion[]): HtmlQuestion[] {
  return questions.map((_question) => {
    const { question, answers, child, solution } = _question;
    let htmlQuestion = '';
    let htmlAnswers: HtmlAnswer[] = [];
    let htmlSolution = '';
    let htmlChild: HtmlQuestion[] = [];
    if (question && question.length) {
      question.forEach((paragraph) => {
        htmlQuestion += `${paragraph}<br>`;
      });
    }
    if (solution) {
      solution.forEach((paragraph) => {
        htmlSolution += `${paragraph}<br>`;
      });
    }

    if (answers && answers?.length) {
      htmlAnswers = answers.map((answer, index) => {
        // let htmlAnswer: string = '';
        // answer.forEach(paragraph => htmlAnswer += `<p>${paragraph}</p>`);
        return {
          key: index,
          value: `${answer.join('')}<br>`
        };
      });
    }

    if (child && child.length) {
      htmlChild = convertImageQuestionToHtml(child);
    }

    return {
      question: htmlQuestion,
      answers: htmlAnswers,
      solution: htmlSolution,
      child: htmlChild.length ? htmlChild : [],
      correctAnswer: ''
    };
  });
}
