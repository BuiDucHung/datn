import { message } from 'antd';
import { RcFile } from 'antd/es/upload';

export const beforeUpload = (file: RcFile) => {
  const isJpgOrPng =
    file.type === 'application/pdf' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (!isJpgOrPng) {
    message.error('Bạn chỉ có thể tải lên file đuôi .PDF, .DOCX');
  }

  return isJpgOrPng;
};
