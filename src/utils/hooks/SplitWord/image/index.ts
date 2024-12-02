import Tesseract from 'tesseract.js';

export const extractTextFromImage = async (file) => {
  try {
    const res = await Tesseract.recognize(file, 'eng+vie', {
      // logger: (m) => {
      //   console.log(m);
      //   if (m.status === 'recognizing text') {
      //     setProgress(parseInt(m.progress * 100));
      //   }
      // },
    });
    return res.data.lines.map((line) => line.text.replace(/[(\n)\|©|\|‘|~|"]/, '').trim());
  } catch (err) {
    console.log(err);
  }
};
