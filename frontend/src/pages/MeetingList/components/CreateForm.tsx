import {
  DrawerForm,
  ProFormDateTimePicker,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';

import { type MeetingType } from '@/services/ant-design-pro/meeting';

type CreateFormProps = {
  createModalVisible: boolean;
  children?: React.ReactNode;
  onSubmit: (values: MeetingType) => Promise<void>;
  onCancel: () => void;
};

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const { createModalVisible, onSubmit, onCancel } = props;

  const intl = useIntl();

  return (
    <DrawerForm
      title={intl.formatMessage({
        id: 'pages.form.metafields.new',
        defaultMessage: 'Thêm hội nghị',
      })}
      width={600}
      open={createModalVisible}
      onFinish={onSubmit}
      drawerProps={{
        onClose: onCancel,
        destroyOnClose: true,
      }}
      grid={true}
      initialValues={{
        description: '',
        key: '',
        namespace: '',
        value: '',
      }}
    >
      <ProFormText colProps={{ span: 24 }} name="name" label="Tên hội nghị" />
      <ProFormDateTimePicker
        colProps={{ span: 24 }}
        name="time"
        label="Thời điểm"
      />
      <ProFormText colProps={{ span: 24 }} name="duration" label="Thời hạn (giờ)" />
      <ProFormText colProps={{ span: 24 }} name="daysCount" label="Số ngày" />      
      <ProFormTextArea
        colProps={{ span: 24 }}
        fieldProps={{ rows: 10 }}
        name="description"
        label="Nội dung"
      />
    </DrawerForm>
  );
};

export default CreateForm;
