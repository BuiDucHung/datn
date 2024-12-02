import { IQuestion } from '..';

const THREE_LEVEL_QUESTION_PATTERN = /^(I|II|III|IV|V|VI|VII|VIII|IX|X)\./;
const TWO_LEVEL_QUESTION_PATTERN = /(^Question\s[1-9]\d*|^Câu\s[1-9]\d*|^Bài\s[1-9]\d*|^Cau\s[1-9]\d*)/;
const ONE_LEVEL_QUESTION_PATTERN = /^[1-9]\d*\.\s/;

const ANSWER_PATTERN = /^[ABCD]\./;
const ANSWER_IN_QUESTION = /([ABCD]\.)/g;
const SOLUTION_PATTERN = /^(HƯỚNG\sDẪN\sGIẢI|GIẢI\sTHÍCH)/i;
const CORRECT_PATTERN = /^Đáp án/;

function detectThreeLevelQuestion(paragraph: string) {
  // return false;
  return THREE_LEVEL_QUESTION_PATTERN.test(paragraph);
}

function detectTwoLevelQuestion(paragraph: string) {
  return TWO_LEVEL_QUESTION_PATTERN.test(paragraph);
}

function detectOneLevelQuestion(paragraph: string) {
  return ONE_LEVEL_QUESTION_PATTERN.test(paragraph);
}

function detectAnswers(paragraph: string) {
  return ANSWER_PATTERN.test(paragraph);
}

function detectSolution(paragraph: string) {
  return SOLUTION_PATTERN.test(paragraph);
}

function detectCorrectAnswer(paragraph: string) {
  return CORRECT_PATTERN.test(paragraph);
}

function handleDetectAnswersInQuestion(paragraph: string): string[][] {
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

function handleDetectAnswerInAnswers(paragraph: string): string[][] {
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

export function splitQuestionsOtherExamPdf(paragraphs: string[]) {
  const questions: IQuestion[] = []; // danh sách các câu hỏi trong file.

  let startThreeLevelQuestion = false;

  let startTwoLevelQuestion = false;

  let startOneLevelQuestion = false;

  let startAnswer: boolean = false; // bắt dầu đáp án  (mặc đinh đáp án chỉ nằm trên 1 dòng.)
  let startSolution: boolean = false; // bắt đầu giải thích

  let threeLevelQuestion: string[] = []; // đề bài câu hỏi level 3
  let twoLevelQuestion: string[] = []; // đề bài câu hỏi level 2
  let oneLevelQuestion: string[] = []; // đề bài câu hỏi level 1

  let threeLevelSolution: string[] = [];
  let twoLevelSolution: string[] = [];
  let oneLevelSolution: string[] = [];

  let twoLevelQuestions: IQuestion[] = []; // list câu hỏi 2 cấp trong câu hỏi 3 cấp.
  let oneLevelQuestions: IQuestion[] = []; // list câu hỏi 1 cấp trong câu hỏi 2 cấp.

  let answer: string[][] = []; // đáp án lựa chọn của câu hỏi 1 cấp

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
          solution: oneLevelSolution
        });
      }

      if (twoLevelQuestion.length) {
        if (oneLevelQuestions.length) {
          twoLevelQuestions.push({
            question: twoLevelQuestion,
            solution: twoLevelSolution,
            child: oneLevelQuestions
          });
          oneLevelQuestions = [];
        } else {
          twoLevelQuestions.push({
            question: twoLevelQuestion,
            solution: twoLevelSolution,
            answers: answer
          });
        }
      }

      if (threeLevelQuestion.length) {
        if (twoLevelQuestions.length) {
          questions.push({
            question: threeLevelQuestion,
            solution: threeLevelSolution,
            child: twoLevelQuestions
          });
        } else if (oneLevelQuestions.length) {
          questions.push({
            question: threeLevelQuestion,
            solution: threeLevelSolution,
            child: oneLevelQuestions
          });
        } else {
          questions.push({
            question: threeLevelQuestion,
            solution: threeLevelSolution,
            answers: answer
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
      threeLevelQuestion = [paragraphs[i]];
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
          solution: oneLevelSolution
        });
      }

      if (twoLevelQuestion.length) {
        if (oneLevelQuestions.length) {
          twoLevelQuestions.push({
            question: twoLevelQuestion,
            solution: twoLevelSolution,
            child: oneLevelQuestions
          });
          oneLevelQuestions = [];
        } else {
          twoLevelQuestions.push({
            question: twoLevelQuestion,
            solution: twoLevelSolution,
            answers: answer
          });
        }
      }

      // detect answer trong question;
      answer = handleDetectAnswersInQuestion(paragraphs[i]);

      // reset
      twoLevelQuestion = [paragraphs[i]];
      oneLevelQuestion = [];
      twoLevelSolution = [];
      oneLevelSolution = [];
      oneLevelQuestions = [];

      // next đen vong lap tiep
      if (i !== lengthParagraph - 1) continue;
    }

    if (detectOneLevelQuestion(paragraphs[i])) {
      if (oneLevelQuestion.length) {
        oneLevelQuestions.push({
          question: oneLevelQuestion,
          answers: answer,
          solution: oneLevelSolution
        });
      }

      // detect answer trong question;
      answer = handleDetectAnswersInQuestion(paragraphs[i]);

      // reset
      oneLevelQuestion = [paragraphs[i]];
      oneLevelSolution = [];

      if (i !== lengthParagraph - 1) continue;
    }

    if (detectAnswers(paragraphs[i])) {
      startAnswer = true;
      const subAnswer = handleDetectAnswerInAnswers(paragraphs[i]);
      for (let j = 0; j < subAnswer.length; j++) {
        answer.push(subAnswer[j] as string[]);
      }
      if (i !== lengthParagraph - 1) continue;
    }

    if (detectSolution(paragraphs[i])) {
      startSolution = true;
      if (startThreeLevelQuestion) {
        threeLevelSolution.push(paragraphs[i]);
      } else if (startTwoLevelQuestion) {
        twoLevelSolution.push(paragraphs[i]);
      } else if (startOneLevelQuestion) {
        oneLevelSolution.push(paragraphs[i]);
      }
      if (i !== lengthParagraph - 1) continue;
    }

    // push phần tử
    if (
      i !== lengthParagraph - 1 ||
      (i === lengthParagraph - 1 &&
        !detectSolution(paragraphs[i]) &&
        !detectAnswers(paragraphs[i]) &&
        !detectOneLevelQuestion(paragraphs[i]) &&
        !detectTwoLevelQuestion(paragraphs[i]) &&
        !detectThreeLevelQuestion(paragraphs[i]))
    ) {
      if (startSolution) {
        if (startThreeLevelQuestion) {
          threeLevelSolution.push(paragraphs[i]);
        } else if (startTwoLevelQuestion) {
          twoLevelSolution.push(paragraphs[i]);
        } else if (startOneLevelQuestion) {
          oneLevelSolution.push(paragraphs[i]);
        }
      } else if (startThreeLevelQuestion) {
        threeLevelQuestion.push(paragraphs[i]);
      } else if (startTwoLevelQuestion) {
        twoLevelQuestion.push(paragraphs[i]);
      } else if (startOneLevelQuestion) {
        oneLevelQuestion.push(paragraphs[i]);
      } else if (startAnswer) {
        answer[answer.length - 1].push(paragraphs[i]);
      }
    }

    // push phần tử cuối cùng.
    if (i === lengthParagraph - 1) {
      if (oneLevelQuestion.length) {
        oneLevelQuestions.push({
          question: oneLevelQuestion,
          answers: answer,
          solution: oneLevelSolution
        });
      }

      if (twoLevelQuestion.length) {
        if (oneLevelQuestions.length) {
          twoLevelQuestions.push({
            question: twoLevelQuestion,
            solution: twoLevelSolution,
            child: oneLevelQuestions
          });
          oneLevelQuestions = [];
        } else {
          twoLevelQuestions.push({
            question: twoLevelQuestion,
            solution: twoLevelSolution,
            answers: answer
          });
        }
      }

      if (threeLevelQuestion.length) {
        if (twoLevelQuestions.length) {
          questions.push({
            question: threeLevelQuestion,
            solution: threeLevelSolution,
            child: twoLevelQuestions
          });
        } else if (oneLevelQuestions.length) {
          questions.push({
            question: threeLevelQuestion,
            solution: threeLevelSolution,
            child: oneLevelQuestions
          });
        } else {
          questions.push({
            question: threeLevelQuestion,
            solution: threeLevelSolution,
            answers: answer
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
