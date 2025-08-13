import { useIntl } from '@umijs/max';
import React from 'react';

import { InboxOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import { UploadProps } from 'antd/lib';
import { getAPIURL } from '@/services/utils/common-utils';
import { getAccessToken } from '@/services/ant-design-pro/login';

export type ImportFormProps = {
  onCancel: () => void;
  visible: boolean;
  meetingId: string;
};

const ImportForm: React.FC<ImportFormProps> = ({ meetingId, onCancel, visible }) => {
  const intl = useIntl();
  const accessToken = getAccessToken();

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    action: getAPIURL(`meeting/import-addendum/${meetingId}`),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} nhập thành công.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} nhập thất bại.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Modal open={visible} onOk={onCancel} onCancel={onCancel}>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click hoặc kéo file vào đây để nhập</p>
        <p className="ant-upload-hint">Bổ sung khách mời bằng cách nhập file Excel.</p>
      </Dragger>
    </Modal>
  );
};

export default ImportForm;
