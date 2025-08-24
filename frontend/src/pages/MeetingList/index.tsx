import type { ActionType, ColumnsState, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl, history, Link } from '@umijs/max';
import { Button, message, Popconfirm, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

import { useServiceProviders } from '@/services/ant-design-pro/api';
import {
  addMeeting,
  meetings,
  removeMeetings,
  updateMeeting,
  type MeetingType,
} from '@/services/ant-design-pro/meeting';
import { tableColumnState } from '@/services/utils/antd-utils';

import { ImportOutlined, PlusOutlined } from '@ant-design/icons';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import ImportForm from './components/ImportForm';

/**
 * Add node
 *
 * @param fields
 */
const handleAdd = async (fields: MeetingType) => {
  const hide = message.loading('Đang xử lý');

  try {
    await addMeeting({ ...fields });
    hide();
    message.success('Đã thêm thành công');
    return true;
  } catch (error) {
    hide();
    message.error('Vui lòng thử lại!');
    return false;
  }
};

/**
 * Update node
 *
 * @param fields
 */
const handleUpdate = async (fields: MeetingType, currentRow?: MeetingType) => {
  const hide = message.loading('Đang xử lý');

  try {
    await updateMeeting({
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
const handleRemove = async (selectedRows: MeetingType[]) => {
  const hide = message.loading('Đang xử lý');
  if (!selectedRows) return true;

  try {
    await removeMeetings({
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

const MeetingList: React.FC = () => {
  const [createModalVisible, handleCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [importModalVisible, handleImportModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<MeetingType>();
  const [selectedRowsState, setSelectedRows] = useState<MeetingType[]>([]);
  const [columnsStateMap, setColumnsStateMap] = useState<Record<string, ColumnsState>>({
    width: { show: false },
    height: { show: false },
    alt: { show: false },
  });
  const intl = useIntl();
  const { getMediaUrl } = useServiceProviders();

  const columns: ProColumns<MeetingType>[] = [
    {
      title: 'Tên hội nghị',
      dataIndex: 'name',
      sorter: true,
      render: (dom, entity) => (
        <a
          onClick={() => {
            history.push(`/meeting/guest?id=${entity._id}`);
          }}
        >
          {dom}
        </a>
      ),
    },
    {
      title: 'Thời điểm',
      dataIndex: 'time',
      render: (dom, entity) => <Space>{dayjs(entity.time).format('DD MMM YYYY HH:mm')}</Space>,
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
      title: 'Điểm danh',
      dataIndex: 'updatedAt',
      render: (dom, entity) => (
        <Space>
          {new Array(entity.daysCount || 0).fill(true).map((_, index) => (
            <Link
              key={index}
              to={`/meeting/attendance?id=${entity._id}&d=${index + 1}`}
            >
              Ngày {index + 1}
            </Link>
          ))}
        </Space>
      ),
      hideInSearch: true,
    },
    {
      title: 'Thao tác',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            handleUpdateModalVisible(true);
            setCurrentRow(record);
          }}
        >
          Sửa
        </a>,
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
    <PageContainer>
      <ProTable<MeetingType, TableListPagination>
        columnsState={tableColumnState('meeting', columnsStateMap, setColumnsStateMap)}
        headerTitle="Danh sách"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
        }}
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
          <Button
            type="default"
            key="default"
            onClick={() => {
              handleImportModalVisible(true);
            }}
          >
            <ImportOutlined /> Nhập Excel
          </Button>,
        ]}
        request={meetings}
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
        createModalVisible={createModalVisible}
        onSubmit={async (value: MeetingType) => {
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
        onCancel={() => {
          handleImportModalVisible(false);
        }}
        onDone={() => actionRef.current?.reloadAndRest?.()}
        visible={importModalVisible}
      />
    </PageContainer>
  );
};

export default MeetingList;
