import { DrawerForm } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React, { useMemo } from 'react';

import CopyableQRCode from '@/components/QRCode';
import { type AttendanceType } from '@/services/ant-design-pro/attendance';
import { MeetingType } from '@/services/ant-design-pro/meeting';
import { getCheckInLink } from '@/services/utils/common-utils';
import { Flex, Form, Input } from 'antd';

export type ViewFormProps = {
  meeting: MeetingType | undefined;
  onCancel: () => void;
  viewModalVisible: boolean;
  values: Partial<AttendanceType>;
};

const ViewForm: React.FC<ViewFormProps> = ({
  meeting,
  onCancel,
  viewModalVisible,
  values,
  ...props
}) => {
  const intl = useIntl();

  const checkInLink = useMemo(
    () => meeting && values?.guestId && getCheckInLink(values!._id!),
    [meeting, values],
  );

  return (
    <DrawerForm
      width={600}
      open={viewModalVisible}
      drawerProps={{
        onClose: onCancel,
        destroyOnClose: true,
      }}
      initialValues={values}
    >
      <Form.Item label="Hội nghị" style={{ width: '100%' }}>
        <Input readOnly value={meeting?.name} />
      </Form.Item>
      <Form.Item label="Khách mời" style={{ width: '100%' }}>
        <Input readOnly value={(values?.guestId as any)?.fullName} />
      </Form.Item>

      <Form.Item label="Link điểm danh" style={{ width: '100%' }}>
        <Input readOnly value={checkInLink} />
      </Form.Item>

      <Flex justify="center">
        {!!checkInLink && (
          <CopyableQRCode
            size={256}
            style={{ height: 'auto', maxWidth: '50%', width: '50%' }}
            value={checkInLink}
            viewBox={`0 0 256 256`}
          />
        )}
      </Flex>
    </DrawerForm>
  );
};

export default ViewForm;
