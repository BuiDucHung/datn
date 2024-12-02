import { ANSWER_KEY, BOLD_ITALIC_TEXT, answerTypes } from '.';

const ANSWER_PATTERN = /^[ABCD]\.\s/;


export function detectParentQuestion(paragraph) {
  if (paragraph.component?.length === 1 && paragraph.component[0]?.type === BOLD_ITALIC_TEXT) {
    return true;
  }
  return false;
}

export function detectQuestion(paragraph) {
  const firstWord = paragraph.text?.split(' ')[0];
  if (firstWord === 'Question' || firstWord === 'Câu' || firstWord === 'câu') {
    return true;
  }
  return false;

}

export function detectQuestionUpdate(paragraph) {
  const splitText = paragraph.text?.split(' ').filter(item => item !== "")[0];
  if (splitText === 'Question' || splitText === 'Câu' || splitText === 'câu') {
    return true;
  }
  return false;
}

export function handleTestAnswerPattern(text) {
  const l = ['A', 'B', 'C', 'D', 'A.', 'B.', 'C.', 'D.']
  if (l.includes(text?.trim())) return true
  if (ANSWER_PATTERN.test(text)) return true;
  return false;
}

export function detectAnswers(paragraph, startQuestion) {
  const firstWord = paragraph.text?.split(' ')[0];
  // if (ANSWER_KEY.includes(firstWord) && answerTypes.includes(paragraph.component[0]?.type) && startQuestion) {
  //   return true;
  // }
  if (handleTestAnswerPattern(firstWord) && startQuestion) {
    return true;
  }
  return false;
}

// export function handleDetectAnswersInQuestion(paragraph) {
//   const { text, component } = paragraph;
//   const lengthComponents = component?.length;
//   const answers = [];
//   let startAnswers = false;
//   let answer = [];
//   for (let i = 0; i < lengthComponents; i++) {
//     const { content, type } = component[i];
//     // if (ANSWER_KEY.some((key) => content.includes(key)) && answerTypes.includes(type)) {
//     if (ANSWER_KEY.some((key) => content.includes(key))) {
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


export function handleDetectAnswersInQuestion(paragraph) {
  const { text, component } = paragraph;
  const lengthComponents = component?.length;
  const title = []
  const answers = [];
  let startAnswers = false;
  let answer = [];
  const arrayComponents = []
  for (let i = 0; i < lengthComponents; i++) {
    const { content, type } = component[i];
    content.split(/([ABCD]\.)/g).filter(item => !!item).forEach(i => arrayComponents.push({
      content: i,
      type: type
    }))
  }
  for (let i = 0; i < arrayComponents.length; i++) {
    const { content, type } = arrayComponents[i];
    // if (ANSWER_KEY.some((key) => content.includes(key)) && answerTypes.includes(type)) {
    if (handleTestAnswerPattern(content)) {
      startAnswers = true;
      if (answer.length) answers.push(answer);
      answer = [arrayComponents[i]];
      continue;
    }
    if (startAnswers) {
      answer.push(arrayComponents[i]);
    } else {
      title.push(arrayComponents[i])
    }
  }
  if (answer.length) answers.push(answer);
  return {
    answers,
    title
  }
}

// export function handleDetectAnswerInAnswers(paragraph) {
//   const { text, component } = paragraph;
//   const lengthComponents = component?.length;
//   if (lengthComponents <= 2) return [component];
//   let answer = [];
//   let answers = [];
//   for (let i = 0; i < lengthComponents; i++) {
//     const { content, type } = component[i];
//     // if (ANSWER_KEY.some((key) => content.includes(key)) && answerTypes.includes(type)) {
//     if (ANSWER_KEY.some((key) => content.includes(key))) {
//       if (answer.length) answers.push(answer);
//       answer = [component[i]];
//       continue;
//     }
//     answer.push(component[i]);
//   }
//   if (answer.length) answers.push(answer);
//   return answers;
// }

export function handleDetectAnswerInAnswers(paragraph) {
  const { text, component } = paragraph;
  const lengthComponents = component?.length;
  const arrayComponents = []
  let answer = [];
  let answers = [];
  for (let i = 0; i < lengthComponents; i++) {
    const { content, type } = component[i];
    content.split(/([ABCD]\.)/g).filter(item => !!item).forEach(i => arrayComponents.push({
      content: i,
      type: type
    }))
  }
  // loop
  const lengthArr = arrayComponents.length;
  if (lengthArr <= 2) return [arrayComponents];
  for (let i = 0; i < lengthArr; i++) {
    const item = arrayComponents[i];
    const { content, type } = item
    if (handleTestAnswerPattern(content)) {
      if (answer.length) {
        answers.push(answer);
      }
      answer = [item]
    } else {
      answer.push(item)
    }
  }
  if (answer.length) answers.push(answer);
  return answers;
}

export function splitQuestionsEnglishTHPT(paragraphs) {
  const questions = [];
  let startQuestion = false;
  let startAnswer = false;
  let startSolution = false;
  let startParentQuestion = false;
  let parentQuestion = [];
  let child = [];
  let parentSolution = [];
  let question = [];
  let answer = [];
  let solution = [];
  const lengthParagraph = paragraphs.length;
  for (let i = 0; i < lengthParagraph; i++) {
    if (detectParentQuestion(paragraphs[i])) {
      /// reset tai day sau
      startParentQuestion = true;
      startQuestion = false;
      startAnswer = false;
      startSolution = false;

      if (parentQuestion.length) {
        child.push({
          question: question,
          answers: answer.length ? answer : null,
          solution: solution.length ? solution : null
        });
        questions.push({
          question: parentQuestion,
          child: child,
          solution: parentSolution
        });
      }

      // reset
      parentQuestion = [paragraphs[i].component];
      child = [];
      parentSolution = [];
      question = [];
      continue;
    }
    // kiem tra phan tu dau tien
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

      // answer = [];
      solution = [];

      // detect answer trong question;
      const resultDetect = handleDetectAnswersInQuestion(paragraphs[i]);
      question = [resultDetect.title];
      answer = resultDetect.answers;
      if (answer.length) {
        startAnswer = true;
      }
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
    if (detectAnswers(paragraphs[i], startQuestion)) {
      startAnswer = true;
      const subAnswer = handleDetectAnswerInAnswers(paragraphs[i]);
      for (let j = 0; j < subAnswer.length; j++) {
        answer.push(subAnswer[j]);
      }
      continue;
    }

    // handle table;
    // hien tai trong de thi thptqd ta thì những table sẽ có đáp án và dịch bài.
    // Hiện tại check 2 cột sẽ là dịch bài. còn 1 cot là hướng dẫn;
    if (paragraphs[i].table) {
      const table = paragraphs[i].table;
      if ((startQuestion || startParentQuestion) && !startAnswer) {
        if (startParentQuestion && !startQuestion) {
          parentQuestion.push([{ table: table }])
        } else if (startQuestion) {
          question.push([{ table: table }])
        }
      } else if (startAnswer) {
        const columns = table[0].length;
        if (columns === 1) {
          // day la huong dan
          startSolution = true;
          solution.push([{ table: table }]);
          continue;
        }
        if (columns === 2) {
          parentSolution.push([{ table: table }]);
          continue;
        }
      }
      continue;
    }

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
      solution.push(paragraphs[i].component);
    } else if (startAnswer) {
      if (paragraphs[i]?.component) {
        for (let j = 0; j < paragraphs[i].component.length; j++) {
          answer[answer.length - 1].push(paragraphs[i].component[j]);
        }
      }
    } else if (startQuestion) {
      question.push(paragraphs[i].component);
    } else if (startParentQuestion) {
      parentQuestion.push(paragraphs[i].component);
    }
  }
  return questions;
}

export const splitQuestionsToppicEnglishTHPT = (paragraphs) => {

  const questions = [];
  let startQuestion = false;
  let startAnswer = false;
  let startSolution = false;
  let startParentQuestion = false;
  let parentQuestion = [];
  let child = [];
  let parentSolution = [];
  let question = [];
  let answer = [];
  let solution = [];
  const lengthParagraph = paragraphs.length;
  for (let i = 0; i < lengthParagraph; i++) {
    if (detectParentQuestion(paragraphs[i])) {
      /// reset tai day sau
      startParentQuestion = true;
      startQuestion = false;
      startAnswer = false;
      startSolution = false;

      if (parentQuestion.length) {
        child.push({
          question: question,
          answers: answer.length ? answer : null,
          solution: solution.length ? solution : null
        });
        questions.push({
          question: parentQuestion,
          child: child,
          solution: parentSolution
        });
      }
      // reset
      parentQuestion = [paragraphs[i].component];
      child = [];
      parentSolution = [];
      question = [];
      continue;
    }
    // kiem tra phan tu dau tien
    if (detectQuestionUpdate(paragraphs[i])) { 
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

      // answer = [];
      solution = [];

      // detect answer trong question;
      const resultDetect = handleDetectAnswersInQuestion(paragraphs[i]);
    
      question = [resultDetect.title];
      answer = resultDetect.answers;
      if (answer.length) {
        startAnswer = true;
      }
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
    if (detectAnswers(paragraphs[i], startQuestion)) {
      startAnswer = true;
      const subAnswer = handleDetectAnswerInAnswers(paragraphs[i]);
      for (let j = 0; j < subAnswer.length; j++) {
        answer.push(subAnswer[j]);
      }
      continue;
    }

    // handle table;
    // hien tai trong de thi thptqd ta thì những table sẽ có đáp án và dịch bài.
    // Hiện tại check 2 cột sẽ là dịch bài. còn 1 cot là hướng dẫn;
    if (paragraphs[i].table) {
      const table = paragraphs[i].table;
      if ((startQuestion || startParentQuestion) && !startAnswer) {
        if (startParentQuestion && !startQuestion) {
          parentQuestion.push([{ table: table }])
        } else if (startQuestion) {
          question.push([{ table: table }])
        }
      } else if (startAnswer) {
        const columns = table[0].length;
        if (columns === 1) {
          // day la huong dan
          startSolution = true;
          solution.push([{ table: table }]);
          continue;
        }
        if (columns === 2) {
          parentSolution.push([{ table: table }]);
          continue;
        }
      }
      continue;
    }
    // check cac dong con lai.
    if (startSolution) {
      solution.push(paragraphs[i].component);
    } else if (startAnswer) {
      if (paragraphs[i]?.component) {
        for (let j = 0; j < paragraphs[i].component.length; j++) {
          answer[answer.length - 1].push(paragraphs[i].component[j]);
        }
      }
    } else if (startQuestion) {
      question.push(paragraphs[i].component);
    } else if (startParentQuestion) {
      // Kiểm tra nếu mảng chứa từ "Question" và loại bỏ toàn bộ mảng đó
      const containsQuestion = paragraphs[i].component.some((item) =>
        item.content.includes("Question")
      );
      // Chỉ push vào parentQuestion nếu KHÔNG chứa "Question"
      if (!containsQuestion) {
        parentQuestion.push(paragraphs[i].component);
      }
    }
  }
  return questions;
}
