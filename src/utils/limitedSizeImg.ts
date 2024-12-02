import { message } from 'antd';
import { RcFile } from 'antd/es/upload';

export const beforeUpload = (file: RcFile) => {
  // const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  // if (!isJpgOrPng) {
  //     message.error('Bạn chỉ có thể tải lên ảnh đuôi JPEG/PNG');
  // }
  const isLt = file.size / 1024 / 1024 < 5;
  if (!isLt) {
    message.error('Bạn phải tải lên ảnh dung lượng dưới 5MB!');
  }
  // return isJpgOrPng && isLt;
  return isLt;
};
