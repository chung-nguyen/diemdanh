import { DrawerForm, ProFormItem, ProFormText } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';

import ProFormAutocomplete from '@/components/ProFormAutocomplete';
import { type AttendanceType } from '@/services/ant-design-pro/attendance';
import { search } from '@/services/ant-design-pro/guest';
import { MeetingType } from '@/services/ant-design-pro/meeting';
import { Form, Input } from 'antd';

type CreateFormProps = {
  meeting: MeetingType | undefined;
  createModalVisible: boolean;
  children?: React.ReactNode;
  onSubmit: (values: AttendanceType) => Promise<void>;
  onCancel: () => void;
};

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const { meeting, createModalVisible, onSubmit, onCancel } = props;

  const intl = useIntl();

  return (
    <DrawerForm
      title="Thêm khách"
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
      <ProFormAutocomplete
        colProps={{ span: 24 }}
        name="guestIdNumber"
        label="Khách mời"
        queryKey="autocomplete-guests"
        fetchSuggestions={async (query: string) => {
          const data = await search(query, 10);
          return data?.map((it) => ({ value: it.idNumber, label: it.idNumber }));
        }}
      />
    </DrawerForm>
  );
};

export default CreateForm;
