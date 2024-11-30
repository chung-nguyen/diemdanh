import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';

import { type GuestType } from '@/services/ant-design-pro/guest';
import Avatar from 'antd/es/avatar/avatar';
import { UserOutlined } from '@ant-design/icons';
import { getPhotoURL } from '@/services/utils/common-utils';
import { Flex } from 'antd';

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
      title={[values.fullName, values.idNumber].join(' ')}
      width={600}
      open={updateModalVisible}
      onFinish={onSubmit}
      drawerProps={{
        onClose: onCancel,
        destroyOnClose: true,
      }}
      initialValues={values}
    >
      <Flex justify="center">
        <Avatar size={256} src={getPhotoURL(values.idNumber + '.jpg')} icon={<UserOutlined />} />
      </Flex>
      <ProFormText colProps={{ span: 24 }} name="idNumber" label="Số CCCD" />
      <ProFormText colProps={{ span: 24 }} name="phoneNumber" label="Điện thoại" />
      <ProFormText colProps={{ span: 24 }} name="email" label="Email" />
      <ProFormText colProps={{ span: 24 }} name="fullName" label="Tên" />
      <ProFormText colProps={{ span: 24 }} name="office" label="Chức vụ" />
      <ProFormText colProps={{ span: 24 }} name="workplace" label="Đơn vị" />
    </DrawerForm>
  );
};

export default UpdateForm;
