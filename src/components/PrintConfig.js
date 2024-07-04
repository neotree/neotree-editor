import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';

export function PrintConfig({ data: form, onChange }) {
    return (
        <>
            <Grid alignItems="center">
                <div>
                    <FormControlLabel
                        checked={form.printable}
                        label="Print"
                        control={<Checkbox />}
                        onChange={(e) => onChange({ 
                            ...form,
                            printable: !form.printable 
                        })}
                    />
                </div>
                <Typography variant="caption" color="textSecondary">
                    If not checked, data will not be display on the session summary and the printout.
                </Typography>
            </Grid>
        </>
    )
}

PrintConfig.propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func,
};
