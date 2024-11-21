import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';

import { type GuestType } from '@/services/ant-design-pro/guest';

export type UpdateFormProps = {
  onCancel: () => void;
  onSubmit: (values: GuestType) => Promise<void>;
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
      <ProFormText colProps={{ span: 24 }} name="email" label="Email" />
      <ProFormText colProps={{ span: 24 }} name="fullName" label="Tên" />      
      <ProFormText colProps={{ span: 24 }} name="office" label="Chức vụ" />
    </DrawerForm>
  );
};

export default UpdateForm;
