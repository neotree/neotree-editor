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
            items: edlizSummaryTable[_form.type],
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
            {Object.keys(form.metadata.items.reduce((acc, item) => ({
                ...acc,
                [item.type]: [...(acc[item.type] || []), item],
            }), {})).map(type => {
                return (
                    <React.Fragment key={type}>
                        <MetadataItems
                            {..._props} 
                            editable={false}
                            title={type}
                            filterItems={item => item.type === type}
                        />

                        <br /> 
                    </React.Fragment>
                );
            })}
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
