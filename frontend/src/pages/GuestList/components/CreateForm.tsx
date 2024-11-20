import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';

import { type GuestType } from '@/services/ant-design-pro/guest';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<GuestType>;

type CreateFormProps = {
  createModalVisible: boolean;
  children?: React.ReactNode;
  onSubmit: (values: FormValueType) => Promise<void>;
  onCancel: () => void;
};

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const { createModalVisible, onSubmit, onCancel } = props;

  const intl = useIntl();

  return (
    <DrawerForm
      title={intl.formatMessage({ id: 'pages.form.metafields.new', defaultMessage: 'New object' })}
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
      <ProFormText colProps={{ span: 24 }} name="namespace" label="Namespace" />
      <ProFormText colProps={{ span: 24 }} name="key" label="Key" />
      <ProFormTextArea colProps={{ span: 24 }} name="value" label="Value" />
      <ProFormTextArea colProps={{ span: 24 }} name="description" label="Description" />
    </DrawerForm>
  );
};

export default CreateForm;
