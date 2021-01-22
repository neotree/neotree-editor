import React from 'react';
import PropTypes from 'prop-types';
import DataTable from '@/components/DataTable';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import wrapMetadataFormField from '../_wrapMetadataFormItem';
import FieldForm from './FieldForm';
import FieldRowActions from './FieldRowActions';

function Fields({ form, setMetadata }) {
  return (
    <>
      <DataTable
        selectable={false}
        noDataMsg="No fields"
        title="Fields"
        data={form.metadata.fields}
        renderHeaderActions={() => (
          <FieldForm
            form={form}
            onSave={field => setMetadata({ fields: [...form.metadata.fields, field] })}
          >
            <IconButton>
              <AddIcon />
            </IconButton>
          </FieldForm>
        )}
        renderRowAction={(row, i) => (
          <FieldRowActions
            row={row}
            form={form}
            rowIndex={i}
            setMetadata={setMetadata}
          />
        )}
        displayFields={[
          { key: 'type', label: 'Type', },
          { key: 'key', label: 'Key', },
          { key: 'label', label: 'Label', },
       ]}
        onSortData={fields => {
          setMetadata({ fields });
        }}
      />
    </>
  );
}

Fields.propTypes = {
  setMetadata: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
};

export default wrapMetadataFormField(Fields);
