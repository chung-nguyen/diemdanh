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

export type UpdateFormProps = {
  onCancel: () => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalVisible: boolean;
  values: Partial<GuestType>;
};

const UpdateForm: React.FC<UpdateFormProps> = ({
  onSubmit,
  onCancel,
  updateModalVisible,
  values,
  ...props
}) => {
  const intl = useIntl();

  return (
    <DrawerForm
      title={values.email}
      width={600}
      open={updateModalVisible}
      onFinish={onSubmit}
      drawerProps={{
        onClose: onCancel,
        destroyOnClose: true,
      }}
      initialValues={values}
    >
      <ProFormText colProps={{ span: 24 }} name="namespace" label="Namespace" />
      <ProFormText colProps={{ span: 24 }} name="key" label="Key" />      
      <ProFormTextArea colProps={{ span: 24 }} name="value" label="Value" />
      <ProFormTextArea colProps={{ span: 24 }} name="description" label="Description" />
    </DrawerForm>
  );
};

export default UpdateForm;
