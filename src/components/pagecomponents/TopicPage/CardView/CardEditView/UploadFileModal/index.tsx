import { CaretDownOutlined, CloseOutlined, LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Modal, Select, Spin, Typography, Upload, UploadFile, message, notification } from 'antd';
import PizZip from 'pizzip';
import { useEffect, useRef, useState } from 'react';
import { HtmlQuestion, detectCorrectAnswerInChoiceQuestion, detectCorrectAnswerInChoiceQuestionUpdate, splitParagraphs, str2xml } from 'src/utils/hooks/SplitWord';
import { splitQuestionsEnglishTHPT } from 'src/utils/hooks/SplitWord/englishTHPT';
import { splitQuestionsToppicEnglishTHPT } from 'src/utils/hooks/SplitWord/englishTHPT';
import { splitQuestionIELTS } from 'src/utils/hooks/SplitWord/ieltsExam';
import { splitQuestionTOEIC } from 'src/utils/hooks/SplitWord/toeicExam';
import './style.scss';
import { getParagraphsInPdfFile } from 'src/utils/hooks/SplitWord/pdf';
import { convertImageQuestionToHtml, splitQuestionsEnglishTHPTPdf } from 'src/utils/hooks/SplitWord/pdf/englishThptPdf';
import UploadIcon from 'src/assets/images/uploadIconSize32.svg';
import Trash from 'src/assets/images/delete.svg';
import { extractTextFromImage } from 'src/utils/hooks/SplitWord/image';
import { splitQuestionsEnglishTHPTFromImage } from 'src/utils/hooks/SplitWord/image/englishThptImage';
import { splitQuestionsOtherExamPdf } from 'src/utils/hooks/SplitWord/pdf/other';
import { splitQuestionsOtherExamImage } from 'src/utils/hooks/SplitWord/image/other';
import { splitQuestionsOtherExamWord } from 'src/utils/hooks/SplitWord/word/other';
import { extractParagraphFromWord } from 'src/utils/hooks/SplitWord/nn24h/extractParagraphFromWord';
import {
  exportQuestionsToExcel,
  SplitParagraphsToObject,
  exportFileWordtoExcel,
  exportTopicEnglishTHPT,
  exportMultipleChoiceEnglish
} from 'src/utils/hooks/SplitWord/nn24h/splitParagraphToObject';
import {
  convertQuestionHtmlToFormatQuestion,
  convertQuestionHtmlToFormatQuestionUpdate,
  convertQuestionToFormatQuestionNN24h,
  convertQuestionToFormatQuestionNN24hUpdate,
  convertQuestionToHTML,
  convertQuestionToHTMLUPDATE,
  coverRowExcelObjectFromCoverQuestion,
  coverRowExcelObjectFromCoverQuestionUpdate
} from 'src/utils/hooks/SplitWord/nn24h/converQuestionToHtml';
import { coverFlashCard } from 'src/utils/hooks/SplitWord/nn24h/flashCard';
import { exportDataToExcel } from 'src/utils/functions/exportdataToFile';

const UploadFileModal = (props: {
  setHtmlQuestions: (htmlQuestions: HtmlQuestion[]) => void;
  fileList: UploadFile[];
  setFileList: (files: UploadFile[]) => void;
  onOk?: () => any;
  onCancel?: () => any;
  open?: boolean;
}) => {
  const { setHtmlQuestions, fileList, setFileList, onCancel, onOk, open } = props;
  const [type, setType] = useState();
  const [typeFile, setTypeFile] = useState(1);
  const uploadRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageHtmlQuestions, setImageHtmlQuestions] = useState<HtmlQuestion[]>([]);

  const handleChangeType = (value) => {
    setType(value);
  };

  const handleChangeTypeFile = (value) => {
    setTypeFile(value);
  };

  const handleSplitQuestionFileWords = (type) => {
    if (type === 1) return splitQuestionsEnglishTHPT;
    if (type === 2) return splitQuestionTOEIC;
    if (type === 3) return splitQuestionIELTS;
    if (type === 4) return splitQuestionsOtherExamWord;
  };

  const handleSplitToppicQuestionFileWord = (type) => {
    if (type === 9) return splitQuestionsToppicEnglishTHPT;
    return splitQuestionsToppicEnglishTHPT;
  }

  const handleSplitQuestionFilePdf = (type: number) => {
    if (type === 1) return splitQuestionsEnglishTHPTPdf;
    if (type == 4) return splitQuestionsOtherExamPdf;
  };

  const handleSplitQuestionFileImage = (type: number) => {
    if (type === 1) return splitQuestionsEnglishTHPTFromImage;
    if (type == 4) return splitQuestionsOtherExamImage;
  };

  const onFileUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result ?? '';
      if (typeFile === 1) {
        setIsLoading(true);
        const zip = new PizZip(content);
        const xml = str2xml(zip.files['word/document.xml'].asText());
        const relationshipsXml = str2xml(zip.files['word/_rels/document.xml.rels'].asText());
        const relationShipElements = relationshipsXml.getElementsByTagName('Relationship');
        let paragraphs;
        if (type === 7) {
          paragraphs = await extractParagraphFromWord(xml);
          const questions = SplitParagraphsToObject(paragraphs);
          exportQuestionsToExcel(questions, 'test');
        }
        if (type === 6) {
          paragraphs = await splitParagraphs(xml, zip, relationShipElements);
          const questions = coverFlashCard(paragraphs);
          const obj = [];
          questions.forEach((item: string[]) => {
            const objItem = {};
            item.forEach((s, i) => (objItem[i] = s));
            obj.push(objItem);
          });
          exportDataToExcel(obj, 'flashcard');
        } else if (type == 8) {
          paragraphs = await splitParagraphs(xml, zip, relationShipElements);
          exportFileWordtoExcel(paragraphs)
        } else if(type === 9) {
          paragraphs = await splitParagraphs(xml, zip, relationShipElements);
          const questions = handleSplitToppicQuestionFileWord(type)(paragraphs);
          const formatNewQuestions = questions.map((q) => convertQuestionToFormatQuestionNN24h(q));
          const newQuestions = detectCorrectAnswerInChoiceQuestionUpdate(formatNewQuestions);
          const questionHtml = newQuestions.map((question) => convertQuestionToHTMLUPDATE(question));
          const formatQuestions = questionHtml.map((question) => convertQuestionHtmlToFormatQuestionUpdate(question));
          const obj = [];
          formatQuestions.forEach((item) => coverRowExcelObjectFromCoverQuestionUpdate(item, obj));
          exportQuestionsToExcel(obj, 'test');
          setHtmlQuestions(questionHtml);
        } else if(type === 10) {
          paragraphs = await splitParagraphs(xml, zip, relationShipElements);
          exportMultipleChoiceEnglish(paragraphs)
        } else {
          paragraphs = await splitParagraphs(xml, zip, relationShipElements);
          const questions = handleSplitQuestionFileWords(type)(paragraphs);
          const formatNewQuestions = questions.map((q) => convertQuestionToFormatQuestionNN24h(q));
          const newQuestions = detectCorrectAnswerInChoiceQuestion(formatNewQuestions);
          const questionHtml = newQuestions.map((question) => convertQuestionToHTML(question));
          const formatQuestions = questionHtml.map((question) => convertQuestionHtmlToFormatQuestion(question));
          const obj = [];
          formatQuestions.forEach((item) => coverRowExcelObjectFromCoverQuestion(item, obj));
          exportQuestionsToExcel(obj, 'test');
          setHtmlQuestions(questionHtml);
        }
        setIsLoading(false);
      } else if (typeFile === 2) {
        setIsLoading(true);
        try {
          const paragraphs = await getParagraphsInPdfFile(new Uint8Array(content as ArrayBuffer));
          const questions = handleSplitQuestionFilePdf(type)(paragraphs);
          const questionHtml = convertImageQuestionToHtml(questions);
          setHtmlQuestions(questionHtml);
        } catch (e) {
          message.error('Vui lòng gửi đúng định dạng file');
        } finally {
          setIsLoading(false);
        }
      } else if (typeFile === 3) {
        setIsLoading(true);
        try {
          const lines = await extractTextFromImage(content);
          const questions = handleSplitQuestionFileImage(type)(lines);
          const questionHtml = convertImageQuestionToHtml(questions);
          const totalQuestions = [...imageHtmlQuestions, ...questionHtml];
          setImageHtmlQuestions(totalQuestions);
          setHtmlQuestions(totalQuestions);
        } catch (e) {
          message.error('Vui lòng gửi đúng định dạng file');
        } finally {
          setIsLoading(false);
        }
      }
    };

    reader.onerror = (err) => console.error(err);
    if (typeFile === 1) {
      reader.readAsBinaryString(file);
    } else if (typeFile === 2) {
      reader.readAsArrayBuffer(file);
    } else if (typeFile === 3) {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleCancelUpload = () => {
    setIsLoading(false);
    return onCancel();
  };

  return (
    <Modal
      title="Tạo câu hỏi từ file có sẵn"
      maskClosable={false}
      onCancel={handleCancelUpload}
      closeIcon={<CloseOutlined style={{ fontSize: '16px' }} />}
      onOk={onOk}
      footer={[
        <Button
          key="back"
          className="modal-footer-btn cancel-btn"
          onClick={handleCancelUpload}
          style={{ marginRight: '16px' }}
        >
          {'Hủy'}
        </Button>,
        <Button key="submit" className="modal-footer-btn add-btn" type="primary" onClick={onOk} disabled={isLoading}>
          {'Tạo ngay'}
        </Button>
      ]}
      open={true}
      className="modal-upload-wrapper"
      width={500}
    >
      <Typography.Text className="modal-sub-title">
        {'Hỗ trợ tách câu tự động từ các định dạng File Word - File PDF - File Hình ảnh. Tải mẫu file '}
        <Typography.Text className="download-example-file-text">{'tại đây!'}</Typography.Text>
      </Typography.Text>

      <div className="upload-file-type">
        <Select
          placeholder="Chọn loại đề"
          style={{ width: '100%' }}
          onChange={handleChangeType}
          suffixIcon={<CaretDownOutlined />}
          value={type}
          disabled={isLoading}
        >
          <Select.Option value={1}>Đề TA THPT</Select.Option>
          <Select.Option value={2}>Đề Toiec</Select.Option>
          <Select.Option value={3}>Đề IELTS</Select.Option>
          <Select.Option value={4}>Đề dạng khác</Select.Option>
          <Select.Option value={5}>NN24h to excel</Select.Option>
          <Select.Option value={6}>NN24h Flashcard</Select.Option>
          <Select.Option value={8}>NN24H File Word to Excel</Select.Option>
          <Select.Option value={9}>Đề TA trắc nhiệm THPT</Select.Option>
          <Select.Option value={10}>Đề TA đoạn văn trắc nhiệm THPT</Select.Option>
        </Select>
      </div>

      <div className="upload-file-type">
        <Select
          placeholder="Chọn loại file"
          style={{ width: '100%' }}
          onChange={handleChangeTypeFile}
          suffixIcon={<CaretDownOutlined />}
          value={typeFile}
          disabled={isLoading}
        >
          <Select.Option value={1}>Word</Select.Option>
          <Select.Option value={2}>Pdf</Select.Option>
          <Select.Option value={3}>Image</Select.Option>
        </Select>
      </div>

      {typeFile === 3 ? (
        <Upload.Dragger
          disabled={isLoading}
          className="upload-file-dragger"
          name="file"
          multiple={false}
          fileList={fileList}
          beforeUpload={(file) => {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && typeFile == 3) {
              notification.error({ message: 'Vui lòng gửi đúng định dạng file ảnh' });
              return false;
            }

            if ([2, 3].includes(type)) {
              notification.warning({ message: 'Hệ thống chưa hỗ trợ chức năng với định dạng đề này file pdf' });
              return false;
            }
            onFileUpload(file);
            setFileList([...fileList, file]);
            return false;
          }}
          showUploadList={{ removeIcon: <img src={Trash} alt="trash" /> }}
        >
          {isLoading ? (
            <>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              <p className="upload-text">{'Loading...'}</p>
            </>
          ) : (
            <>
              <img src={UploadIcon} alt="upload image" ref={uploadRef} />
              <p className="upload-text">{'Tải lên file'}</p>
            </>
          )}
        </Upload.Dragger>
      ) : (
        <Upload.Dragger
          className="upload-file-dragger"
          name="file"
          multiple={false}
          disabled={isLoading}
          onRemove={(file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
          }}
          beforeUpload={(file) => {
            if (
              ![
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword'
              ].includes(file.type) &&
              typeFile === 1
            ) {
              notification.error({ message: 'Vui lòng gửi đúng định dạng file word' });
              return false;
            }
            if (file.type === 'application/msword' && typeFile === 1) {
              notification.error({ message: 'Hệ thống không hỗ trợ định dạng doc. Vui lòng chuyển sang dạng docx' });
              return false;
            }
            if (file?.type !== 'application/pdf' && typeFile === 2) {
              notification.error({ message: 'Vui lòng gửi đúng định dạng file pdf' });
              return false;
            }

            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && typeFile == 3) {
              notification.error({ message: 'Vui lòng gửi đúng định dạng file ảnh' });
              return false;
            }
            if ([2, 3].includes(typeFile) && [2, 3].includes(type)) {
              notification.warning({ message: 'Hệ thống chưa hỗ trợ chức năng với định dạng đề này file pdf' });
              return false;
            }
            onFileUpload(file);
            setFileList([...fileList, file]);
            return false;
          }}
          fileList={fileList}
          showUploadList={{ removeIcon: <img src={Trash} alt="trash" /> }}
        >
          {isLoading ? (
            <>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              <p className="upload-text">{'Loading...'}</p>
            </>
          ) : (
            <>
              <img src={UploadIcon} alt="upload image" ref={uploadRef} />
              <p className="upload-text">{'Tải lên file'}</p>
            </>
          )}
        </Upload.Dragger>
      )}
    </Modal>
  );
};

export default UploadFileModal;
