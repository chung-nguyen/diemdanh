import type { ActionType, ColumnsState, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history, useIntl, useQuery } from '@umijs/max';
import { Button, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

import { getMeetingReport, type MeetingType } from '@/services/ant-design-pro/meeting';
import { tableColumnState } from '@/services/utils/antd-utils';

import { SaveOutlined } from '@ant-design/icons';
import { AttendanceType } from '@/services/ant-design-pro/attendance';

const MeetingReport: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [selectedRowsState, setSelectedRows] = useState<MeetingType[]>([]);
  const [columnsStateMap, setColumnsStateMap] = useState<Record<string, ColumnsState>>({
    width: { show: false },
    height: { show: false },
    alt: { show: false },
  });
  const intl = useIntl();

  const urlParams = new URL(window.location.href).searchParams;
  const meetingId = String(urlParams.get('id'));

  const { data, isLoading } = useQuery(
    ['meeting-report', meetingId],
    () => getMeetingReport(meetingId),
    {
      enabled: !!meetingId,
    },
  );

  const { meeting, attendances } = data || {};

  const columns: ProColumns<AttendanceType>[] = [
    {
      title: 'Tên hội nghị',
      dataIndex: 'name',
      sorter: true,
      render: (dom, entity) => (
        <a
          onClick={() => {
            history.push(`/meeting/attendance?id=${entity._id}`);
          }}
        >
          {dom}
        </a>
      ),
    },
    {
      title: 'Thời điểm',
      dataIndex: 'time',
      render: (dom, entity) => <Space>{dayjs(entity.checkInTime).format('DD MMM YYYY HH:mm')}</Space>,
      sorter: true,
    },
  ];

  return (
    <PageContainer>
      <ProTable<AttendanceType, TableListPagination>
        loading={isLoading}
        dataSource={attendances || []}
        columnsState={tableColumnState('meeting', columnsStateMap, setColumnsStateMap)}
        headerTitle="Danh sách"
        actionRef={actionRef}
        rowKey="_id"
        search={false}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          defaultPageSize: 20,
          pageSizeOptions: [20, 50, 100, 200],
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => {}}>
            <SaveOutlined /> Lưu Excel
          </Button>,
        ]}
        columns={columns}
        rowSelection={false}
      />
    </PageContainer>
  );
};

export default MeetingReport;
