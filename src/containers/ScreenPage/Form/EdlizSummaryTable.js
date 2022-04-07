import React from 'react';
import PropTypes from 'prop-types';
import edlizSummaryTable from '@/constants/edlizSummaryTable';
import MetadataItems from './Metadata/Items';

export default function EdlizSummaryTable(props) {
    const { form: _form, setForm: _setForm, screen } = props;
    const [form, setForm] = React.useState(screen ? _form : {
        ...props.form,
        metadata: {
            ...props.form.metadata,
            items: edlizSummaryTable,
            key: 'EDLIZSummaryTableScore',
            label: 'EDLIZ summary table score',
        }
    });

    const _props = {
        ...props,
        form,
        setForm: f => {
            // _setForm(f);
            setForm(prev => ({ ...prev, ...(typeof f === 'function' ? f(prev) : f), }));
        },
    };

    React.useEffect(() => { _setForm(form); }, [form]);

    return (
        <React.Fragment>
            <MetadataItems
                {..._props} 
                editable={false}
                title="Major Criteria"
                filterItems={item => item.type === 'major_criteria'}
            />

            <br /> 
            
            <MetadataItems 
                {..._props} 
                editable={false}
                title="Minor Criteria"
                filterItems={item => item.type === 'minor_criteria'}
            />
        </React.Fragment>
    );
}

EdlizSummaryTable.propTypes = {
    screen: PropTypes.object,
    script: PropTypes.object,
    form: PropTypes.object,
    setForm: PropTypes.func,
    setMetadata: PropTypes.func,
};