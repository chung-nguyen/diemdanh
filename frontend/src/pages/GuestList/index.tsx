import type { ActionType, ColumnsState, ProColumns } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, message, Popconfirm, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

import { useServiceProviders } from '@/services/ant-design-pro/api';
import {
  addGuest,
  guests,
  removeGuests,
  updateGuest,
  type GuestType,
} from '@/services/ant-design-pro/guest';
import { tableColumnState } from '@/services/utils/antd-utils';

import { PlusOutlined } from '@ant-design/icons';
import CreateForm from './components/CreateForm';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';

/**
 * Add node
 *
 * @param fields
 */
const handleAdd = async (fields: GuestType) => {
  const hide = message.loading('Adding');

  try {
    await addGuest({ ...fields });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error) {
    hide();
    message.error('Failed to add, please try again!');
    return false;
  }
};

/**
 * Update node
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType, currentRow?: GuestType) => {
  const hide = message.loading('Configuring');

  try {
    await updateGuest({
      ...currentRow,
      ...fields,
    });
    hide();
    message.success('Update successful');
    return true;
  } catch (error) {
    hide();
    message.error('Update failed, please try again!');
    return false;
  }
};

/**
 * Delete node
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: GuestType[]) => {
  const hide = message.loading('Deleting');
  if (!selectedRows) return true;

  try {
    await removeGuests({
      ids: selectedRows.map((row: any) => row.id),
    });
    hide();
    message.success('Deleted successfully, will be refreshed soon');
    return true;
  } catch (error) {
    hide();
    message.error('Deletion failed, please try again');
    return false;
  }
};

const GuestList: React.FC = () => {
  const [createModalVisible, handleCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<GuestType>();
  const [selectedRowsState, setSelectedRows] = useState<GuestType[]>([]);
  const [columnsStateMap, setColumnsStateMap] = useState<Record<string, ColumnsState>>({
    width: { show: false },
    height: { show: false },
    alt: { show: false },
  });
  const intl = useIntl();
  const { getMediaUrl } = useServiceProviders();

  const columns: ProColumns<GuestType>[] = [
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: true,
    },
    {
      title: 'Tên',
      dataIndex: 'fullName',
      sorter: true,
    },
    {
      title: 'Chức vụ',
      dataIndex: 'office',
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
        <a
          key="edit"
          onClick={() => {
            handleUpdateModalVisible(true);
            setCurrentRow(record);
          }}
        >
          Edit
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
          <a>Delete</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<GuestType, TableListPagination>
        columnsState={tableColumnState('guest', columnsStateMap, setColumnsStateMap)}
        headerTitle="Danh sách"
        actionRef={actionRef}
        rowKey="id"
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
            <PlusOutlined /> New
          </Button>,
        ]}
        request={guests}
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
        onSubmit={async (value: GuestType) => {
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
    </PageContainer>
  );
};

export default GuestList;
