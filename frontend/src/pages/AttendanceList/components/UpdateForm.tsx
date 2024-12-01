import {
  DrawerForm,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useQuery } from '@umijs/max';
import React, { useMemo } from 'react';

import CopyableQRCode from '@/components/QRCode';
import { AttedanceStatusOptions, type AttendanceType } from '@/services/ant-design-pro/attendance';
import { getCheckInURL, MeetingType } from '@/services/ant-design-pro/meeting';
import { buildCheckInURL, getPhotoURL } from '@/services/utils/common-utils';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Flex, Form, Input, Space } from 'antd';

export type ViewFormProps = {
  meeting: MeetingType | undefined;
  onSubmit: (values: AttendanceType) => Promise<void>;
  onCancel: () => void;
  viewModalVisible: boolean;
  values: Partial<AttendanceType>;
};

const UpdateForm: React.FC<ViewFormProps> = ({
  meeting,
  onSubmit,
  onCancel,
  viewModalVisible,
  values,
  ...props
}) => {
  const { data: checkInURL } = useQuery(['check-in-url'], () => getCheckInURL());

  const checkInLink = useMemo(
    () => meeting && values?.guestId && buildCheckInURL(checkInURL!, values!._id!),
    [meeting, values, checkInURL],
  );

  return (
    <DrawerForm
      width={768}
      open={viewModalVisible}
      onFinish={onSubmit}
      drawerProps={{
        onClose: onCancel,
        destroyOnClose: true,
      }}
      initialValues={values}
    >
      <Form.Item label="Hội nghị" style={{ width: '100%' }}>
        <Input readOnly value={meeting?.name} />
      </Form.Item>
      <ProFormText colProps={{ span: 24 }} name="seat" label="Số ghế" />
      <Form.Item label="Tên khách mời" style={{ width: '100%' }}>
        <Input readOnly value={(values?.guestId as any)?.fullName} />
      </Form.Item>
      <Space direction="horizontal" size="middle">
        <Form.Item label="Số CCCD" style={{ width: '100%' }}>
          <Input readOnly value={(values?.guestId as any)?.idNumber} />
        </Form.Item>
        <Form.Item label="Số điện thoại" style={{ width: '100%' }}>
          <Input readOnly value={(values?.guestId as any)?.phoneNumber} />
        </Form.Item>
      </Space>
      <Form.Item label="Email" style={{ width: '100%' }}>
        <Input readOnly value={(values?.guestId as any)?.email} />
      </Form.Item>

      <Form.Item label="Link điểm danh" style={{ width: '100%' }}>
        <Input readOnly value={checkInLink} />
      </Form.Item>

      <Flex justify="center" gap={32}>
        <Avatar
          size={256}
          src={getPhotoURL((values?.guestId as any)?.idNumber + '.jpg')}
          icon={<UserOutlined />}
        />
        {!!checkInLink && (
          <CopyableQRCode
            size={256}
            style={{ height: 'auto', maxWidth: '50%', width: '50%' }}
            value={checkInLink}
            viewBox={`0 0 256 256`}
          />
        )}
      </Flex>

      <ProFormSelect name="status" label="Tình trạng" options={AttedanceStatusOptions} />
      <ProFormDateTimePicker colProps={{ span: 24 }} name="checkInTime" label="Thời điểm tham dự" />
    </DrawerForm>
  );
};

export default UpdateForm;
