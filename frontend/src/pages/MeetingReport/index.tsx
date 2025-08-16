import type { ActionType, ColumnsState, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history, useIntl, useQuery } from '@umijs/max';
import { Button, Descriptions, message, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo, useRef, useState } from 'react';
import writeXlsxFile from 'write-excel-file';

import { getMeetingReport, type MeetingType } from '@/services/ant-design-pro/meeting';
import { tableColumnState } from '@/services/utils/antd-utils';

import { SaveOutlined } from '@ant-design/icons';
import {
  AttedanceStatusOptions,
  AttendanceStatus,
  AttendanceType,
} from '@/services/ant-design-pro/attendance';
import { DescriptionsProps } from 'antd/lib';

const MeetingReport: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [selectedRowsState, setSelectedRows] = useState<MeetingType[]>([]);
  const [columnsStateMap, setColumnsStateMap] = useState<Record<string, ColumnsState>>({
    width: { show: false },
    height: { show: false },
    alt: { show: false },
  });
  const intl = useIntl();

  const urlParams = new URLSearchParams(history.location.search);
  const meetingId = String(urlParams.get('id'));

  const { data, isLoading } = useQuery(
    ['meeting-report', meetingId],
    () => getMeetingReport(meetingId),
    {
      enabled: !!meetingId,
    },
  );

  const { meeting, attendances } = data || {};
  const guestsCount = useMemo(() => attendances?.length || 0, [data]);
  const checkedInCount = useMemo(
    () => (attendances || []).filter((it) => it.status === AttendanceStatus.CHECKED_IN).length,
    [data],
  );

  const columns: ProColumns<AttendanceType>[] = [
    {
      title: 'Số Ghế',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => <span>{(entity.guestId as any)?.idNumber}</span>,
    },
    {
      title: 'Tên khách mời',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => <span>{(entity.guestId as any)?.fullName}</span>,
    },
    {
      title: 'Số ĐT',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => (entity.guestId as any)?.phoneNumber,
    },
    {
      title: 'Chức vụ',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => (entity.guestId as any)?.office,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => (entity.guestId as any)?.workplace,
    },
    {
      title: 'Tình trạng',
      dataIndex: 'status',
      sorter: true,
      render: (dom, entity) => {
        return (
          <span>{AttedanceStatusOptions.find((it) => it.value === entity.status)?.label}</span>
        );
      },
    },
    {
      title: 'Thời điểm',
      dataIndex: 'time',
      render: (dom, entity) => (
        <Space>{entity.checkInTime && dayjs(entity.checkInTime).format('DD/MM/YYYY HH:mm')}</Space>
      ),
      sorter: true,
    },
  ];

  const items: DescriptionsProps['items'] = [
    {
      label: 'Hội nghị',
      children: meeting?.name,
    },
    {
      label: 'Ngày tổ chức',
      children: dayjs(meeting?.time).format('DD/MM/YYYY HH:mm'),
    },
    {
      label: 'Tổng tham dự',
      children: checkedInCount,
    },
    {
      label: 'Tổng vắng mặt',
      children: guestsCount - checkedInCount,
    },
    {
      label: 'Tổng khách mời',
      children: guestsCount,
    },
  ];

  const saveExcel = async () => {
    if (!meeting || !attendances) {
      message.error('Chưa có dữ liệu!');
      return;
    }

    const schema = [
      {
        column: 'Ghế',
        type: String,
        value: (entity: AttendanceType) => (entity.guestId as any)?.idNumber,
      },
      {
        column: 'Tên',
        type: String,
        value: (entity: AttendanceType) => (entity.guestId as any)?.fullName,
      },
      {
        column: 'Số ĐT',
        type: String,
        value: (entity: AttendanceType) => (entity.guestId as any)?.phoneNumber,
      },
      {
        column: 'Chức vụ',
        type: String,
        value: (entity: AttendanceType) => (entity.guestId as any)?.office,
      },
      {
        column: 'Đơn vị',
        type: String,
        value: (entity: AttendanceType) => (entity.guestId as any)?.workplace,
      },
      {
        column: 'Tình trạng',
        type: String,
        value: (entity: AttendanceType) =>
          AttedanceStatusOptions.find((it) => it.value === entity.status)?.label,
      },
      {
        column: 'Giờ tham dự',
        type: Date,
        format: 'HH:mm',
        value: (entity: AttendanceType) =>
          !!entity.checkInTime ? new Date(entity.checkInTime) : null,
      },
      {
        column: 'Ngày tham dự',
        type: Date,
        format: 'dd/mm/yyyy',
        value: (entity: AttendanceType) =>
          !!entity.checkInTime ? new Date(entity.checkInTime) : null,
      },
    ];

    await writeXlsxFile(attendances, {
      schema,
      fileName: `Báo cáo Hội nghị - ${meeting.name}.xlsx`,
    });

    message.success('Đã lưu báo cáo thành công!');
  };

  return (
    <PageContainer>
      <Space size="large" direction="vertical" style={{ width: '100%' }}>
        <Descriptions
          title="Tổng kết"
          bordered
          column={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2, xxl: 2 }}
          items={items}
        />

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
            <Button type="primary" key="primary" onClick={() => saveExcel()}>
              <SaveOutlined /> Lưu Excel
            </Button>,
          ]}
          columns={columns}
          rowSelection={false}
        />
      </Space>
    </PageContainer>
  );
};

export default MeetingReport;
