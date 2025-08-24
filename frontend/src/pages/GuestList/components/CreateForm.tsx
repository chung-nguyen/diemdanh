import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';

import { type GuestType } from '@/services/ant-design-pro/guest';
import { Form, Input } from 'antd';
import { MeetingType } from '@/services/ant-design-pro/meeting';

type CreateFormProps = {
  meeting: MeetingType | undefined;
  createModalVisible: boolean;
  children?: React.ReactNode;
  onSubmit: (values: GuestType) => Promise<void>;
  onCancel: () => void;
};

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const { meeting, createModalVisible, onSubmit, onCancel } = props;

  const intl = useIntl();

  return (
    <DrawerForm
      title={intl.formatMessage({ id: 'pages.form.metafields.new', defaultMessage: 'Thêm khách mời' })}
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
      <Form.Item label="Hội nghị" style={{ width: '100%' }}>
        <Input readOnly value={meeting?.name} />
      </Form.Item>
      <ProFormText colProps={{ span: 24 }} name="seat" label="Số ghế" />
      <ProFormText colProps={{ span: 24 }} name="idNumber" label="Số CCCD" />
      <ProFormText colProps={{ span: 24 }} name="phoneNumber" label="Điện thoại" />
      <ProFormText colProps={{ span: 24 }} name="email" label="Email" />
      <ProFormText colProps={{ span: 24 }} name="fullName" label="Tên" />
      <ProFormText colProps={{ span: 24 }} name="office" label="Chức vụ" />
      <ProFormText colProps={{ span: 24 }} name="workplace" label="Đơn vị" />
    </DrawerForm>
  );
};

export default CreateForm;
