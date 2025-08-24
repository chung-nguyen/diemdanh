import {
  BookOutlined,
  CiCircleOutlined,
  DownOutlined,
  FileExcelOutlined,
  HomeOutlined,
  PlusOutlined,
  PrinterOutlined,
  QrcodeOutlined,
  SaveOutlined,
  UpCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ActionType, ColumnsState, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { history, useIntl, useQuery } from '@umijs/max';
import { Avatar, Button, Dropdown, message, Modal, Popconfirm, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

import {
  addGuest,
  guests,
  removeGuests,
  updateGuest,
  type GuestType,
} from '@/services/ant-design-pro/guest';
import {
  generateInviteSheet,
  getCheckInURL,
  getMeeting,
  printQRSheet,
  resetMeeting,
} from '@/services/ant-design-pro/meeting';
import { tableColumnState } from '@/services/utils/antd-utils';

import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { buildCheckInURL, getPhotoURL } from '@/services/utils/common-utils';
import CopyableQRCode from '@/components/QRCode';
import ImportForm from './components/ImportForm';
import { getAccessToken } from '@/services/ant-design-pro/login';

/**
 * Add node
 *
 * @param fields
 */
const handleAdd = async (fields: GuestType) => {
  const hide = message.loading('Đang xử lý');

  try {
    await addGuest({ ...fields });
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
const handleUpdate = async (fields: GuestType, currentRow?: GuestType) => {
  const hide = message.loading('Đang xử lý');

  try {
    await updateGuest({
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
const handleRemove = async (selectedRows: GuestType[]) => {
  const hide = message.loading('Đang xử lý');
  if (!selectedRows) return true;

  try {
    await removeGuests({
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

const handlePrintQRSheet = async (id: string, fileName: string, accessToken: string) => {
  const hide = message.loading('Đang xử lý');

  try {
    await printQRSheet(id, fileName, accessToken);
    hide();
    message.success('Đã xử lý thành công');
    return true;
  } catch (error: any) {
    hide();
    console.error(error);
    message.error('Vui lòng thử lại!');
    return false;
  }
};

const GuestList: React.FC = () => {
  const [createModalVisible, handleCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [importModalVisible, handleImportModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<GuestType>();
  const [selectedRowsState, setSelectedRows] = useState<GuestType[]>([]);
  const [columnsStateMap, setColumnsStateMap] = useState<Record<string, ColumnsState>>({
    width: { show: false },
    height: { show: false },
    alt: { show: false },
  });
  const { data: checkInURL } = useQuery(['check-in-url'], () => getCheckInURL());

  const urlParams = new URLSearchParams(history.location.search);
  const meetingId = String(urlParams.get('id'));
  const accessToken = getAccessToken();

  const { data: meeting, isLoading } = useQuery(
    ['attendance-list', meetingId],
    () => getMeeting(meetingId),
    {
      enabled: !!meetingId,
    },
  );

  const columns: ProColumns<GuestType>[] = [
    {
      title: 'Ghế',
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
            src={getPhotoURL((entity._id as any)?.idNumber + '.jpg')}
            icon={<UserOutlined />}
          />
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setCurrentRow(entity);
            }}
          >
            {entity?.fullName}
          </a>
        </Space>
      ),
    },
    {
      title: 'Chức vụ',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => entity?.office,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => entity?.workplace,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => entity?.phoneNumber,
    },
    {
      title: 'Email',
      dataIndex: 'guestId',
      sorter: true,
      render: (dom, entity) => entity?.email,
    },
    {
      title: 'QR Code',
      dataIndex: 'guestId',
      sorter: false,
      render: (dom, entity) => {
        const link = '';
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
    // {
    //   title: 'Thao tác',
    //   dataIndex: 'option',
    //   valueType: 'option',
    //   render: (_, record) => [
    //     <Popconfirm
    //       key="delete"
    //       title="Chắc chắn?"
    //       onConfirm={async () => {
    //         await handleRemove([record]);
    //         setSelectedRows([]);
    //         actionRef.current?.reloadAndRest?.();
    //       }}
    //     >
    //       <a>Xóa</a>
    //     </Popconfirm>,
    //   ],
    // },
  ];

  return (
    <PageContainer loading={isLoading}>
      <ProTable<GuestType, TableListPagination>
        columnsState={tableColumnState('attendance', columnsStateMap, setColumnsStateMap)}
        headerTitle={`Danh sách Khách mời của ${meeting?.data.name}`}
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

          <Button type="default" key="default" onClick={() => handleImportModalVisible(true)}>
            <FileExcelOutlined /> Bổ sung từ Excel
          </Button>,

          <Button type="default" key="default" onClick={() => handlePrintQRSheet(meetingId, 'QR - ' + String(meeting?.data.name) + '.pdf', accessToken)}>
            <QrcodeOutlined /> In QR
          </Button>
        ]}
        request={guests(meetingId)}
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
        onSubmit={async (value: GuestType) => {
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
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
      />

      <ImportForm
        meetingId={meetingId}
        onCancel={() => {
          handleImportModalVisible(false);
        }}
        onDone={() => actionRef.current?.reloadAndRest?.()}
        visible={importModalVisible}
      />
    </PageContainer>
  );
};

export default GuestList;
