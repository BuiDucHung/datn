export type Paragraph = {
  content: string;
  type: number;
  src?: any;
};
export async function extractParagraphFromWord(xml) {
  const paragraphs: string[] = []
  const childBody = xml.getElementsByTagName('w:p')
  for (let i = 0, childLength = childBody.length; i < childLength; i++) {
    paragraphs.push(getComponentInParagraph(childBody[i]))
  }
  return paragraphs;
}

export function getComponentInParagraph(paragraphsElement) {
  let fullText = '';
  const runComponent = paragraphsElement.getElementsByTagName('w:r');
  for (let i = 0; i < runComponent.length; i++) {
    const runNode = runComponent[i];
    const textComponent = runNode.getElementsByTagName('w:t');
    if (textComponent.length) {
      const textValue = textComponent[0].textContent;
      fullText +=textValue
    }
  }
  return fullText
}

function containsVietnamese(text) {
  const vietnameseRegex = /[\u00C0-\u1EF9\u0200-\u02AF\u1EA0-\u1EF9]/;
  return vietnameseRegex.test(text);
}

export function getConvertNewDataExcel(data) {
  const lessons = [];
  let currentLesson = null;
  data.forEach(item => {
    const { text, component } = item;
    const match = text.match(/\(Đáp án đúng\)/);
    if (text.match(/^BÀI\s\d+/i)) {
      // Khi gặp tiêu đề bài học mới, lưu bài cũ (nếu có) và tạo bài mới
      if (currentLesson) lessons.push(currentLesson);
      currentLesson = {
        header: item.text,
        description: null,
        aware: null,
        passage: null,
        questions: [],
        translation: null
      };
    } else if (text.toLowerCase().includes("choose")) {
      // Phần mô tả bài học
      currentLesson.description = item.text;
    } else if(/\s*_{3,}\s*/g.test(item.text)) {
      currentLesson.aware = item.text;
    }
    else if (!text.match(/^\d+\./) && !text.match(/^[A-D]\./) && !text.includes("Giải thích") && containsVietnamese(text)) {
      // Kiểm tra nếu đoạn văn không trống
      if (text.trim()) {
        // Nếu passage đã có dữ liệu, nối với <br>, nếu chưa có thì gán giá trị đầu tiên
        if (currentLesson.passage) {
          currentLesson.passage += "<br>" + text;
        } else {
          currentLesson.passage = text;
        }
      }
    }else if (text.match(/^\d+\./)) {
      // Câu hỏi
      currentLesson.questions.push({
        number: text,
        options: [],
        explanation: ""
      });
    }else if (text.match(/^[A-D]\./)) {
      // Nhận diện đáp án
      const lastQuestion = currentLesson.questions[currentLesson.questions.length - 1];
      if (lastQuestion) {
        lastQuestion.options.push(text);
      }
    } else if (text.includes("Giải thích")) {
      // Giải thích đáp án
      const lastQuestion = currentLesson.questions[currentLesson.questions.length - 1];
      if (lastQuestion) {
        lastQuestion.explanation = text;
      }
    } else if (text.toUpperCase().includes("Dịch nghĩa đoạn văn")) {
      // Dịch nghĩa đoạn văn
      currentLesson.translation = item.text;
    }
    else if(/[A-Za-z]/.test(text)) {
      currentLesson.aware += "<br>" + item.text;
    }
  });
  // Thêm bài cuối cùng vào danh sách
  if (currentLesson) lessons.push(currentLesson);
  return lessons;
}
