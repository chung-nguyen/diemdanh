import {
  DrawerForm,
  ProFormDateTimePicker,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';

import { type AttendanceType } from '@/services/ant-design-pro/attendance';

export type UpdateFormProps = {
  onCancel: () => void;
  onSubmit: (values: AttendanceType) => Promise<void>;
  updateModalVisible: boolean;
  values: Partial<AttendanceType>;
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
      width={600}
      open={updateModalVisible}
      onFinish={onSubmit}
      drawerProps={{
        onClose: onCancel,
        destroyOnClose: true,
      }}
      initialValues={values}
    >
      <ProFormText colProps={{ span: 24 }} name="name" label="Tên hội nghị" />
      <ProFormDateTimePicker colProps={{ span: 24 }} name="time" label="Thời điểm" />
      <ProFormText colProps={{ span: 24 }} name="duration" label="Thời hạn (giờ)" />
      <ProFormTextArea
        colProps={{ span: 24 }}
        fieldProps={{ rows: 10 }}
        name="description"
        label="Nội dung"
      />
    </DrawerForm>
  );
};

export default UpdateForm;
