import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';

export function PrintConfig({ data: form, onChange }) {
    return (
        <>
            <Grid alignItems="center">
                <FormControlLabel
                    checked={form.printable}
                    label="Print"
                    control={<Checkbox />}
                    onChange={(e) => onChange({ 
                        ...form,
                        printable: !form.printable 
                    })}
                />
            </Grid>
        </>
    )
}

PrintConfig.propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func,
};
