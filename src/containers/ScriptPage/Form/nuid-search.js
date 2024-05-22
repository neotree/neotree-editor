import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import DataTable from '@/components/DataTable';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';

const defaultField = {
    calculation: null,
    condition: '',
    confidential: false,
    dataType: null,
    defaultValue: null,
    format: null,
    type: null,
    key: null,
    refKey: null,
    label: null,
    minValue: null,
    maxValue: null,
    optional: false,
    minDate: null,
    maxDate: null,
    minTime: null,
    maxTime: null,
    minDateKey: '',
    maxDateKey: '',
    minTimeKey: '',
    maxTimeKey: '',
    values: '',
};

const defaultAmissionFields = [
    {
        ...defaultField,
        type: 'dropdown',
        key: 'BabyTransfered',
        label: 'Has the baby been transfered from another facility',
    },
    {
        ...defaultField,
        type: 'text',
        key: 'patientNUID',
        label: "Search patient's NUID",
        condition: "$BabyTransfered = 'Y'",
    },
    {
        ...defaultField,
        type: 'dropdown',
        key: 'BabyTwin',
        values: 'Y,Yes\nN,No',
        label: 'Does the baby have a twin?',
    },
    {
        ...defaultField,
        type: 'text',
        key: 'BabyTwinNUID',
        label: "Search twin's NUID",
        condition: "$BabyTwin = 'Y'",
    },
];

const defaultOtherTypesFields = [
    {
        ...defaultField,
        type: 'text',
        key: 'patientNUID',
        values: 'Y,Yes\nN,No',
        label: "Search patient's NUID",
    },
];

export function NuidSearch({ 
    enabled, 
    onChange,
    savedFields,
    fields: fieldsProp,
    scriptType,
}) {
    const [open, setOpen] = useState(false);
    const [checked, setChecked] = useState(!!enabled);
    const [fields, setFields] = useState([]);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenuClose = () => setAnchorEl(null);

    const onAddField = field => {
        setFields(prev => [...prev, field]);
        setAnchorEl(null);
    };

    const onDeleteField = i => {
        const shouldRemove = confirm('Are you sure you want to remove this field?');
        if (shouldRemove) {
            setFields(prev => prev.filter((_, j) => i !== j));
        }
    };

    const title = 'Enable NUID Search';

    const onOpen = () => {
        setOpen(true);
        const defaults = scriptType === 'admission' ? defaultAmissionFields : defaultOtherTypesFields;
        setFields(savedFields || (fieldsProp.length ? fieldsProp : defaults));
    };

    return (
        <>
            {enabled ? (
                <div style={{ display: 'flex', alignItems: 'baseline', }}>
                    <FormControlLabel 
                        control={<Checkbox />}
                        value="nuid_search_enabled"
                        label={title}
                        checked={checked}
                        onChange={() => {
                            setChecked(!checked);
                            onChange({ enabled: !checked, fields, });
                        }}
                    />

                    <IconButton onClick={() => onOpen()}>
                        <SettingsIcon />
                    </IconButton>
                </div>
            ) : (
                <Button
                    color="primary"
                    onClick={() => onOpen()}
                >
                    {title}
                </Button>
            )}

            <Dialog
                open={open}
                maxWidth="sm"
                fullWidth
                onClose={() => setOpen(false)}
                scroll="paper"
            >
                <DialogTitle>Configure NUID Search Page</DialogTitle>

                <DialogContent>
                    <DataTable
                        selectable={false}
                        noDataMsg="No fields added"
                        title="Fields"
                        data={fields}
                        renderHeaderActions={() => (
                            <>
                                <Button
                                    color="primary"
                                    startIcon={<AddIcon />}
                                    onClick={e => setAnchorEl(e.currentTarget)}
                                >Add field</Button>

                                <Menu
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem>
                                        <FieldForm
                                            field={{
                                                ...defaultField,
                                                type: 'dropdown',
                                                key: '',
                                                values: '',
                                                label: '',
                                                condition: '',
                                            }}
                                            onChange={onAddField}
                                        >
                                            Yes/No
                                        </FieldForm>
                                    </MenuItem>
                                    
                                    <MenuItem>
                                        <FieldForm
                                            field={{
                                                ...defaultField,
                                                type: 'text',
                                                key: '',
                                                values: '',
                                                label: '',
                                                condition: '',
                                            }}
                                            onChange={onAddField}
                                        >
                                            NUID Search
                                        </FieldForm>
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                        renderRowAction={(row, i) => (
                            <div style={{ display: 'flex', alignItems: 'center', }}>
                                <Typography color="error">
                                    <IconButton color="inherit" onClick={() => onDeleteField(i)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Typography>

                                <FieldForm 
                                    field={row}
                                    onChange={val => setFields(prev => prev.map((field, j) => {
                                        if (j !== i) return field;
                                        return {
                                            ...field,
                                            ...val,
                                        };
                                    }))}
                                    onDelete={() => onDeleteField(i)}
                                >
                                    <IconButton>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </FieldForm>
                            </div>
                        )}
                        displayFields={[
                            { 
                                key: 'type', 
                                label: 'Type', 
                                render: ({ row }) => {
                                    return ({
                                        dropdown: 'Yes/No',
                                        text: 'NUID Search',
                                    })[row.type];
                                },
                            },
                            { key: 'key', label: 'Key', },
                            { key: 'label', label: 'Label', },
                            { key: 'condition', label: 'Condition', },
                        ]}
                        onSortData={fields => setFields(fields)}
                    />
                </DialogContent>

                <DialogActions>

                    <Button
                        variant="outlined"
                        onClick={() => setOpen(false)}
                    >Cancel</Button>&nbsp;

                    <Button
                        variant="contained"
                        disableElevation
                        disabled={!fields.length}
                        color="primary"
                        onClick={() => {
                            onChange({ enabled: true, fields, });
                            setOpen(false);
                            setChecked(true);
                        }}
                    >Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

function FieldForm({ onChange: _onChange, field: f, children, onDelete }) {
    const [open, setOpen] = useState(false);
    const [field, setField] = useState(f);

    const onChange = val => setField(prev => ({
        ...prev,
        ...val,
    }));

    return (
        <React.Fragment>
            <div 
                role="button"
                onClick={() => {
                    setOpen(true);
                    setField(f);
                }}
            >
                {children}
            </div>

            <Dialog
                open={open}
                maxWidth="sm"
                fullWidth
                onClose={() => setOpen(false)}
            >
                <DialogContent>
                    <div>
                        <TextField 
                            fullWidth
                            required
                            value={field.label}
                            name="label"
                            label="Label"
                            error={!field.label}
                            onChange={e => onChange({ label: e.target.value, })}
                        />
                    </div>

                    <br />

                    <div>
                        <TextField 
                            fullWidth
                            required
                            value={field.key}
                            name="key"
                            label="Key"
                            error={!field.key}
                            onChange={e => onChange({ key: e.target.value, })}
                        />
                    </div>

                    <br />

                    <div>
                        <TextField 
                            fullWidth
                            value={field.condition}
                            name="condition"
                            label="Condition"
                            onChange={e => onChange({ condition: e.target.value, })}
                        />
                    </div>

                    <br />

                    {field.type === 'dropdown' && (
                        <div>
                            <TextField 
                                fullWidth
                                multiline
                                minRows={5}
                                value={field.values}
                                name="values"
                                label="Options"
                                error={!field.values}
                                onChange={e => onChange({ values: e.target.value, })}
                            />
                        </div>
                    )}

                    <br />
                </DialogContent>

                <DialogActions>
                    {!!onDelete && (
                        <Typography color="error">
                            <IconButton color="inherit" onClick={() => onDelete()}>
                                <DeleteIcon />
                            </IconButton>
                        </Typography>
                    )}

                    <div style={{ marginLeft: 'auto', }} />

                    <Button
                        variant="outlined"
                        onClick={() => setOpen(false)}
                    >Cancel</Button>&nbsp;

                    <Button
                        variant="contained"
                        disableElevation
                        disabled={!(field.label && field.key && ((field.type === 'dropdown') ? field.values : true))}
                        color="primary"
                        onClick={() => {
                            _onChange(field);
                            setOpen(false);
                        }}
                    >Save</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

NuidSearch.propTypes = {
    enabled: PropTypes.bool,
    onChange: PropTypes.func,
    fields: PropTypes.arrayOf(PropTypes.any),
    scriptType: PropTypes.string,
};
