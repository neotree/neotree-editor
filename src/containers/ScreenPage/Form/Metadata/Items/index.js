import React from 'react';
import PropTypes from 'prop-types';
import DataTable from '@/components/DataTable';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import wrapMetadataFormItem from '../_wrapMetadataFormItem';
import ItemForm from './ItemForm';
import ItemRowActions from './ItemRowActions';

function Items({ form, setMetadata, title, filterItems, editable, }) {
  editable = editable !== false;
  return (
    <>
      <DataTable
        filter={filterItems}
        selectable={false}
        noDataMsg="No items"
        title={title || 'Items'}
        data={form.metadata.items}
        renderHeaderActions={!editable ? undefined : () => (
          <ItemForm
            form={form}
            onSave={item => setMetadata({ items: [...form.metadata.items, item] })}
          >
            <IconButton>
              <AddIcon />
            </IconButton>
          </ItemForm>
        )}
        renderRowAction={!editable ? undefined : (row, i) => (
          <ItemRowActions
            row={row}
            form={form}
            rowIndex={i}
            setMetadata={setMetadata}
          />
        )}
        displayFields={(() => {
          switch (form.type) {
            case 'zw_edliz_summary_table':
              return [
                { key: 'id', label: 'ID', },
                { key: 'subType', label: 'Sub type', },
                { key: 'label', label: 'Label', },
             ];
            case 'mwi_edliz_summary_table':
              return [
                { key: 'id', label: 'ID', },
                { key: 'subType', label: 'Sub type', },
                { key: 'label', label: 'Label', },
             ];
            case 'checklist':
              return [
                { key: 'key', label: 'Key', },
                { key: 'label', label: 'Label', },
                {
                  key: 'exclusive',
                  label: 'Exclusive',
                  cellProps: { align: 'right' },
                  render: ({ row, column }) => row[column] ? <CheckIcon fontSize="small" color="primary" /> : null
                },
             ];
            case 'single_select':
              return [
                { key: 'id', label: 'ID', },
                { key: 'label', label: 'Label', },
             ];
            case 'multi_select':
              return [
                { key: 'id', label: 'ID', },
                { key: 'label', label: 'Label', },
                {
                  key: 'checked',
                  label: 'Checked',
                  cellProps: { align: 'right' },
                  render: ({ row, column }) => row[column] ? <CheckIcon fontSize="small" color="primary" /> : null
                },
             ];
            case 'diagnosis':
              return [
                { key: 'id', label: 'ID', },
                { key: 'label', label: 'Label', },
                {
                  key: 'checked',
                  label: 'Checked',
                  cellProps: { align: 'right' },
                  render: ({ row, column }) => row[column] ? <CheckIcon fontSize="small" color="primary" /> : null
                },
             ];
            case 'list':
              return [
                { key: 'label', label: 'Label', },
                { key: 'summary', label: 'Summary', },
             ];
            case 'progress':
              return [
                { key: 'label', label: 'Label', },
                {
                  key: 'checked',
                  label: 'Checked',
                  cellProps: { align: 'right' },
                  render: ({ row, column }) => row[column] ? <CheckIcon fontSize="small" color="primary" /> : null
                },
             ];
            default:
              return [];
          }
        })()}
        onSortData={!editable ? undefined : items => {
          setMetadata({ items });
        }}
      />
    </>
  );
}

Items.propTypes = {
  setMetadata: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  title: PropTypes.string,
  filterItems: PropTypes.func,
  editable: PropTypes.bool,
};

export default wrapMetadataFormItem(Items);
