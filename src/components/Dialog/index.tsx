import { Modal, ModalProps } from 'antd';
import './style.scss';
import { PropsWithChildren } from 'react';
import KSButton from '../KsButton';
import { CloseOutlined } from '@ant-design/icons';
export type KSDialogProps = ModalProps;

function KSDialog(props: PropsWithChildren<KSDialogProps>) {
  const { onCancel, okText = 'Xác nhận', cancelText, confirmLoading, onOk, children, className, ...remain } = props;

  return (
    <Modal
      onOk={onOk}
      onCancel={onCancel}
      mask={false}
      className={className + ' ks-dialog-style-center'}
      footer={[
        <KSButton key="submit" type="primary" loading={confirmLoading} onClick={onOk}>
          {okText}
        </KSButton>
      ]}
      closeIcon={<CloseOutlined style={{ fontSize: '16px' }} />}
      {...remain}
    >
      {children}
    </Modal>
  );
}

export default KSDialog;
