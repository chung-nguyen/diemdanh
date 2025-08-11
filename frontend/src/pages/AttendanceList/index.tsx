import { BookOutlined, PlusOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import type { ActionType, ColumnsState, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { history, useIntl, useQuery } from '@umijs/max';
import { Avatar, Button, message, Popconfirm, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

import {
  addAttendance,
  AttedanceStatusOptions,
  attendances,
  removeAttendances,
  updateAttendance,
  type AttendanceType,
} from '@/services/ant-design-pro/attendance';
import { generateInviteSheet, getCheckInURL, getMeeting } from '@/services/ant-design-pro/meeting';
import { tableColumnState } from '@/services/utils/antd-utils';

import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { buildCheckInURL, getPhotoURL } from '@/services/utils/common-utils';
import CopyableQRCode from '@/components/QRCode';

/**
 * Add node
 *
 * @param fields
 */
const handleAdd = async (fields: AttendanceType) => {
  const hide = message.loading('Đang xử lý');

  try {
    await addAttendance({ ...fields });
    hide();
    message.success('Đã thêm thành công');
    return true;
  } catch (error: any) {
    hide();

    if (error.response?.data?.message && error.response.data.message.startsWith('E11000')) {
      message.error('Khách mời đã có trong danh sách! Vui lòng chọn khách mời khác.');
    } else {
      message.error('Vui lòng thử lại!');
    }
    return false;
  }
};

/**
 * Update node
 *
 * @param fields
 */
const handleUpdate = async (fields: AttendanceType, currentRow?: AttendanceType) => {
  const hide = message.loading('Đang xử lý');

  try {
    await updateAttendance({
      ...currentRow,
      ...fields,
    });
    hide();
    message.success('Cập nhật thành công');
    return true;
  } catch (error) {
    hide();
    message.error('Vui lòng thử lại!');
    return false;
  }
};

/**
 * Delete node
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: AttendanceType[]) => {
  const hide = message.loading('Đang xử lý');
  if (!selectedRows) return true;

  try {
    await removeAttendances({
      ids: selectedRows.map((row: any) => row._id),
    });
    hide();
    message.success('Xóa thành công!');
    return true;
  } catch (error) {
    hide();
    message.error('Vui lòng thử lại!');
    return false;
  }
};

const handleGenerateInviteSHeet = async (id: string) => {
  const hide = message.loading('Đang xử lý');

  try {
    await generateInviteSheet(id);
    hide();
    message.success('Đã xử lý thành công');
    return true;
  } catch (error: any) {
    hide();
    message.error('Vui lòng thử lại!');
    return false;
  }
};

const AttendanceList: React.FC = () => {
  const [createModalVisible, handleCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<AttendanceType>();
  const [selectedRowsState, setSelectedRows] = useState<AttendanceType[]>([]);
  const [columnsStateMap, setColumnsStateMap] = useState<Record<string, ColumnsState>>({
    width: { show: false },
    height: { show: false },
    alt: { show: false },
  });
  const { data: checkInURL } = useQuery(['check-in-url'], () => getCheckInURL());

  const urlParams = new URLSearchParams(history.location.search);
  const meetingId = String(urlParams.get('id'));

  const { data: meeting, isLoading } = useQuery(
    ['attendance-list', meetingId],
    () => getMeeting(meetingId),
    {
      enabled: !!meetingId,
    },
  );

  const columns: ProColumns<AttendanceType>[] = [
    {
      title: 'Số ghế',
      dataIndex: 'seat',
      sorter: true,
    },
    {
      title: 'Tên khách mời',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => (
        <Space>
          <Avatar
            src={getPhotoURL((entity.guestId as any)?.idNumber + '.jpg')}
            icon={<UserOutlined />}
          />
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setCurrentRow(entity);
            }}
          >
            {(entity.guestId as any)?.fullName}
          </a>
        </Space>
      ),
    },
    {
      title: 'CCCD',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => (entity.guestId as any)?.idNumber,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => (entity.guestId as any)?.phoneNumber,
    },
    {
      title: 'Email',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => (entity.guestId as any)?.email,
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
      title: 'QR Code',
      dataIndex: 'guestId',
      sorter: false,
      render: (dom, entity) => {
        const link = meeting && entity?.guestId && buildCheckInURL(checkInURL!, entity);
        return (
          <CopyableQRCode
            size={256}
            height={64}
            style={{ height: 'auto', maxWidth: '50%', width: '50%' }}
            value={link}
            viewBox={`0 0 256 256`}
          >
            {' '}
          </CopyableQRCode>
        );
      },
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
      dataIndex: 'checkInTime',
      render: (dom, entity) => ( 
        <Space>{entity.checkInTime && dayjs(entity.checkInTime).format('DD MMM YYYY HH:mm')}</Space>
      ),
      sorter: true,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: (dom, entity) => <Space>{dayjs(entity.createdAt).format('DD MMM YYYY HH:mm')}</Space>,
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      render: (dom, entity) => <Space>{dayjs(entity.updatedAt).format('DD MMM YYYY HH:mm')}</Space>,
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: 'Thao tác',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <Popconfirm
          key="delete"
          title="Chắc chắn?"
          onConfirm={async () => {
            await handleRemove([record]);
            setSelectedRows([]);
            actionRef.current?.reloadAndRest?.();
          }}
        >
          <a>Xóa</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer loading={isLoading}>
      <ProTable<AttendanceType, TableListPagination>
        columnsState={tableColumnState('attendance', columnsStateMap, setColumnsStateMap)}
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
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> Tạo mới
          </Button>,

          <Button type="default" key="default" onClick={() => handleGenerateInviteSHeet(meetingId)}>
            <SaveOutlined /> Xuất file
          </Button>,

          <Button
            type="default"
            key="default"
            onClick={() => {
              history.push(`/meeting/report?id=${meetingId}`);
            }}
          >
            <BookOutlined /> Báo cáo
          </Button>,
        ]}
        request={attendances(meetingId)}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              Selected&nbsp;
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>
              &nbsp; items
            </div>
          }
        >
          <Popconfirm
            key="delete"
            title="Chắc chắn?"
            onConfirm={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <Button>Xóa nhiều dòng</Button>
          </Popconfirm>
        </FooterToolbar>
      )}

      <CreateForm
        meeting={meeting?.data}
        createModalVisible={createModalVisible}
        onSubmit={async (value: AttendanceType) => {
          if (!meeting?.data._id) {
            return;
          }
          value.meetingId = meeting?.data._id;
          const success = await handleAdd(value);
          if (success) {
            handleCreateModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleCreateModalVisible(false);
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
      />

      <UpdateForm
        meeting={meeting?.data}
        onSubmit={async (value) => {
          const success = await handleUpdate(value, currentRow);

          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);
            setShowDetail(false);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        viewModalVisible={updateModalVisible}
        values={currentRow || {}}
      />
    </PageContainer>
  );
};

export default AttendanceList;
