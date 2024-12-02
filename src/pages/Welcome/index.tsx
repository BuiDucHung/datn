import { Typography } from 'antd';
import DefaultLayout from 'src/components/Layout/DefaultLayout';
import './style.scss';
import UploadFileModal from 'src/components/pagecomponents/TopicPage/CardView/CardEditView/UploadFileModal';

function Welcome() {
  return (
    <DefaultLayout>
      <div className="welcome-wrapper">
        <Typography.Title level={5} className="welcome-title">
          CHÀO MỪNG BẠN ĐẾN VỚI
        </Typography.Title>
        <Typography.Text className="welcome-sub-title">Hệ thống quản lý lớp học trực tuyến</Typography.Text>
      </div>
      <UploadFileModal
        setHtmlQuestions={() => {}}
        fileList={[]}
        setFileList={() => {}}
        onOk={() => {}}
        onCancel={() => {}}
        open={true}
      />
    </DefaultLayout>
  );
}

export default Welcome;
