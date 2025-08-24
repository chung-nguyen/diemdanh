import { useIntl } from '@umijs/max';
import React, { useState } from 'react';

import { InboxOutlined } from '@ant-design/icons';
import { message, Modal, Space } from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import { UploadProps } from 'antd/lib';
import { getAPIURL } from '@/services/utils/common-utils';
import { getAccessToken } from '@/services/ant-design-pro/login';
import { Form, Input } from 'antd';

export type SeatFormProps = {
  onCancel: () => void;
  visible: boolean;
  meetingId: string;
  day: string;
};

const SeatForm: React.FC<SeatFormProps> = ({ meetingId, day, onCancel, visible }) => {
  const intl = useIntl();
  const accessToken = getAccessToken();

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    action: getAPIURL(`meeting/import-seatmap/${meetingId}`),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      day,
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
      <Space size="large" direction="vertical" style={{width: '100%'}}>
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click hoặc kéo file vào đây để nhập</p>
          <p className="ant-upload-hint">Cập nhật sơ đồ phòng họp bằng cách nhập file Excel.</p>
        </Dragger>        
      </Space>
    </Modal>
  );
};

export default SeatForm;
