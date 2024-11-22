import {
  DrawerForm,
  ProFormDateTimePicker,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';

import { type AttendanceType } from '@/services/ant-design-pro/attendance';
import { search } from '@/services/ant-design-pro/guest';
import ProFormAutocomplete from '@/components/ProFormAutocomplete';

type CreateFormProps = {
  createModalVisible: boolean;
  children?: React.ReactNode;
  onSubmit: (values: AttendanceType) => Promise<void>;
  onCancel: () => void;
};

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const { createModalVisible, onSubmit, onCancel } = props;

  const intl = useIntl();

  const urlParams = new URL(window.location.href).searchParams;
  const meetingId = String(urlParams.get('id'));

  return (
    <DrawerForm
      title={intl.formatMessage({
        id: 'pages.form.metafields.new',
        defaultMessage: 'Thêm khách',
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
      <ProFormAutocomplete
        colProps={{ span: 24 }}
        name="guestId"
        label="Khách mời"
        queryKey="autocomplete-guests"
        fetchSuggestions={async (query: string) => {
          const data = await search(query, 10);
          return data?.map((it) => ({ value: it.email, label: it.email }))
        }}
      />
    </DrawerForm>
  );
};

export default CreateForm;
