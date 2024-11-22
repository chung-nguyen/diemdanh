import { ProForm, ProFormItemProps } from '@ant-design/pro-components';
import { AutoComplete, Input } from 'antd';
import { debounce } from 'lodash';
import { FC, useState } from 'react';
import { useQuery } from 'umi';

export type ProFormAutocompleteProps = {
  queryKey: string;
  fetchSuggestions: (query: string) => any;
} & ProFormItemProps;

const useDebouncedQuery = (queryKey: string, queryFn: Function, delay = 300) => {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debouncedSetQuery = debounce(setDebouncedQuery, delay);

  const query = useQuery([queryKey, debouncedQuery], () => queryFn(debouncedQuery), {
    enabled: !!debouncedQuery, // Only fetch when there's a query
  });

  return { query, setQuery: debouncedSetQuery };
};

const ProFormAutocomplete: FC<ProFormAutocompleteProps> = (props: ProFormAutocompleteProps) => {
  const { query, setQuery } = useDebouncedQuery(
    props.queryKey,
    props.fetchSuggestions,
    300, // Debounce delay in milliseconds
  );

  const { data: options, isLoading } = query;

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  return (
    <ProForm.Item {...props} style={{ width: '100%' }}>
      <AutoComplete
        {...props.fieldProps}
        options={options}
        onSearch={handleSearch}
        style={{ width: '100%' }}
      >
        <Input.Search
          {...props.fieldProps}
          size="large"
          placeholder={String(props.placeholder || '')}
          enterButton
          loading={isLoading}
          style={{ width: '100%' }}
        />
      </AutoComplete>
    </ProForm.Item>
  );
};

export default ProFormAutocomplete;
