import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardText,
  Dialog,
  DialogActions,
  DialogContent,
  Radio,
  RadioGroup,
  Textfield,
  Switch
} from 'react-mdl';
import FormSection from 'FormSection';
import Toolbar from 'Toolbar';
import { arrayMove } from 'App/utils';
import { DataType, DefaultValueType, FieldType } from 'App/constants';
import { MdAdd, MdCreate, MdDelete, MdSwapVert, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { Table, TableHeader } from '../../datatable';

const RESET_STATE = {
    enableFieldSwapAction: false,
    enableFieldMoveUpAction: false,
    enableFieldMoveDownAction: false,
    openNewFieldDialog: false,
    openEditFieldDialog: false,
    openConfirmDeleteFieldDialog: false,
    actionFieldIndex: null,
    fieldCalculation: null,
    fieldCondition: null,
    fieldConfidential: false,
    fieldDataType: null,
    fieldDefaultValue: DefaultValueType.EMPTY,
    fieldFormat: null,
    fieldType: null,
    fieldKey: null,
    fieldLabel: null,
    fieldMinValue: null,
    fieldMaxValue: null,
    fieldValues: null,
    fieldOptional: false
};

export default class FieldList extends Component {
  constructor(props) {
    super(props);
    this.state = { ...RESET_STATE };
  }

  componentWillMount() {
    const { fields } = (this.props.metadata || {});
    const state = { fields: (fields || []) };
    this.setState(state);
    this.props.onUpdateMetadata(state);
  }

  getDataTypeForFieldType(fieldType) {
    switch (fieldType) {
      case FieldType.DATE:
        return DataType.DATE;
      case FieldType.DATETIME:
        return DataType.DATETIME;
      case FieldType.DROPDOWN:
        return DataType.ID;
      case FieldType.NUMBER:
        return DataType.NUMBER;
      case FieldType.PERIOD:
        return DataType.PERIOD;
      case FieldType.TEXT:
        return DataType.STRING;
      case FieldType.TIME:
        return DataType.TIME;
      default:
        return null;
    }
  }

  handleInputChange = (name, event) => {
    const value = event.target.value;
    let state = { [name]: value };
    if (name === 'fieldType') {
      state = {
        ...state,
        fieldDataType: this.getDataTypeForFieldType(value)
      };
    }
    // console.log(JSON.stringify(state, null, 2));
    this.setState(state);
  };

  handleSwitchChange = (name) => {
    return () => {
      const currentValue = (this.state[name]) ? this.state[name] : false;
      this.setState({ ...this.state, [name]: !currentValue });
    };
  };

  handleFieldSelection = (keys) => {
    if (keys.length === 1) {
      const { fields } = (this.props.metadata || {});
      const index = keys[0];
      this.setState({
        enableFieldSwapAction: false,
        enableFieldMoveUpAction: (fields.length > 0 && index > 1),
        enableFieldMoveDownAction: (fields.length > 0 && index < fields.length),
        selectedIndex: index,
        swapIndex0: keys[0],
        swapIndex1: keys[1]
      });
    } else if (keys.length === 2) {
        this.setState({
          enableFieldSwapAction: true,
          enableFieldMoveUpAction: false,
          enableFieldMoveDownAction: false,
          selectedIndex: null,
          swapIndex0: keys[0],
          swapIndex1: keys[1]
        });
    } else {
        this.setState({
          enableFieldSwapAction: false,
          enableFieldMoveUpAction: false,
          enableFieldMoveDownAction: false,
          selectedIndex: null,
          swapIndex0: null,
          swapIndex1: null
        });
    }
  };

  handleFieldActionClick = (action) => {
    const { actionFieldIndex, fields, selectedIndex, swapIndex0, swapIndex1 } = this.state;
    const field = this.collectFieldData();

    let updatedFields = (fields || []); // eslint-disable-line
    let closeFn = () => {};
    let fieldIndex;
    let tmp;

    switch (action) {
      case 'add':
        updatedFields.push(field);
        closeFn = this.closeNewFieldDialog;
        break;
      case 'delete':
        updatedFields.splice(actionFieldIndex, 1);
        closeFn = this.closeConfirmDeleteFieldDialog;
        break;
      case 'update':
        updatedFields[actionFieldIndex] = field;
        closeFn = this.closeEditFieldDialog;
        break;
      case 'swap':
        tmp = updatedFields[swapIndex0 - 1];
        updatedFields[swapIndex0 - 1] = updatedFields[swapIndex1 - 1];
        updatedFields[swapIndex1 - 1] = tmp;
        break;
      case 'move_up':
        fieldIndex = selectedIndex - 1; // Normalize to array index
        tmp = updatedFields[fieldIndex - 1];
        updatedFields[fieldIndex - 1] = updatedFields[fieldIndex];
        updatedFields[fieldIndex] = tmp;
        break;
      case 'move_down':
        fieldIndex = selectedIndex - 1; // Normalize to array index
        tmp = updatedFields[fieldIndex + 1];
        updatedFields[fieldIndex + 1] = updatedFields[fieldIndex];
        updatedFields[fieldIndex] = tmp;
        break;
      default:
        closeFn = () => {};
    }

    this.fixFieldsPositions(updatedFields);

    this.setState({
        ...this.state,
        actionFieldIndex: null,
        fields: updatedFields
    });
    this.props.onUpdateMetadata({ fields: updatedFields });
    this.props.onFieldsChanged();

    closeFn();
  };

  swapFields = (oldIndex, newIndex) => {
    const { fields } = this.state;
    let updatedFields = (fields || []);
    // let tmp = updatedFields[oldIndex];
    updatedFields = arrayMove(updatedFields, oldIndex, newIndex);
    // updatedFields[oldIndex] = updatedFields[newIndex];
    // updatedFields[newIndex] = tmp;
    this.fixFieldsPositions(updatedFields);
    this.setState({ fields: updatedFields });
  };

  openNewFieldDialog = () => {
    this.setState({
      openNewFieldDialog: true,
      fieldDataType: null,
      fieldType: null
    });
  };

  closeNewFieldDialog = () => this.setState({ ...RESET_STATE });

  openEditFieldDialog = (index) => {
    return () => {
      const { fields } = this.state;
      const field = fields[index];
      this.setState({
        openEditFieldDialog: true,
        actionFieldIndex: index,
        fieldCalculation: field.calculation,
        fieldCondition: field.condition,
        fieldConfidential: field.confidential,
        fieldDataType: field.dataType,
        fieldDefaultValue: field.defaultValue,
        fieldFormat: field.format,
        fieldType: field.type,
        fieldKey: field.key,
        fieldLabel: field.label,
        fieldMinValue: field.minValue,
        fieldMaxValue: field.maxValue,
        fieldValues: field.values,
        fieldOptional: field.optional
      });
    };
  };

  closeEditFieldDialog = () => this.setState({ ...RESET_STATE });

  openConfirmDeleteFieldDialog = (index) => {
    return () => {
      this.setState({
        ...this.state,
        openConfirmDeleteFieldDialog: true,
        actionFieldIndex: index
      });
    };
  };

  closeConfirmDeleteFieldDialog = () => {
    this.setState({
      ...this.state,
      openConfirmDeleteFieldDialog: false,
      actionFieldIndex: null
    });
  };

  collectFieldData = () => {
    const {
      fieldCalculation,
      fieldCondition,
      fieldConfidential,
      fieldDataType,
      fieldDefaultValue,
      fieldFormat,
      fieldType,
      fieldKey,
      fieldLabel,
      fieldMinValue,
      fieldMaxValue,
      fieldValues,
      fieldOptional
    } = this.state;

    return {
      calculation: (fieldCalculation) ? fieldCalculation : null,
      condition: (fieldCondition) ? fieldCondition : null,
      confidential: (fieldConfidential) ? fieldConfidential : false,
      dataType: (fieldDataType) ? fieldDataType : null,
      defaultValue: (fieldDefaultValue) ? fieldDefaultValue : null,
      format: (fieldFormat) ? fieldFormat : null,
      type: (fieldType) ? fieldType : null,
      key: (fieldKey) ? fieldKey : null,
      label: (fieldLabel) ? fieldLabel : null,
      minValue: (fieldMinValue) ? fieldMinValue : null,
      maxValue: (fieldMaxValue) ? fieldMaxValue : null,
      values: (fieldValues) ? fieldValues : null,
      optional: (fieldOptional) ? fieldOptional : false
    };
  };

  fixFieldsPositions = (fields) => {
    // Add/Set field position as key to each item
    if (fields) {
      fields.map((value, index) => (value.position = index + 1));
    }
  };

    render() {
        const styles = {
            dialogEdit: {
                width: '520px'
            },
            dialogType: {
                width: '240px'
            },
            container: {
                marginTop: '24px',
                width: '780px'
            },
            table: {
                width: '100%'
            },
            emptyMessageContainer: {
                display: 'flex',
                boxSizing: 'border-box',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#757575',
                fontSize: '16px'
            },
            flexRow: {
                display: 'flex',
                flexDirection: 'row'
            }
        };

        const {
            enableFieldSwapAction,
            enableFieldMoveUpAction,
            enableFieldMoveDownAction,
            openNewFieldDialog,
            openEditFieldDialog,
            openConfirmDeleteFieldDialog,
            fieldCalculation,
            fieldCondition,
            fieldConfidential,
            fieldDataType,
            fieldDefaultValue,
            fieldFormat,
            fieldType,
            fieldKey,
            fieldLabel,
            fieldMinValue,
            fieldMaxValue,
            fieldValues,
            fieldOptional,
            fields
        } = this.state;

        const editDialogContent = (
            <DialogContent>
                <FormSection label="FLOW CONTROL" />

                {/*fieldCondition,*/}
                <Textfield
                    style={{ width: '100%' }}
                    floatingLabel
                    label="Conditional expression"
                    value={fieldCondition || ''}
                    onChange={this.handleInputChange.bind(this, 'fieldCondition')}
                />
                <div style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '12px' }}>
                  Example: <span style={{ fontWeight: 'bold' }}>($key = true and $key2 = false) or $key3 = 'HD'</span>
                </div>

                <FormSection label="PROPERTIES" topSpace />

                {/*fieldKey,*/}
                <Textfield
                  style={{ width: '100%' }}
                  floatingLabel
                  label="Key"
                  required
                  pattern="[a-zA-Z0-9]+"
                  onChange={this.handleInputChange.bind(this, 'fieldKey')}
                  value={fieldKey || ''}
                />


                {/*fieldLabel,*/}
                <Textfield
                  style={{ width: '100%' }}
                  floatingLabel
                  label="Label"
                  required
                  onChange={this.handleInputChange.bind(this, 'fieldLabel')}
                  value={fieldLabel || ''}
                />

                <div style={styles.flexRow}>
                    {/*fieldConfidential*/}

                    <div style={{ flex: 1, marginRight: '12px' }}>
                        <Switch
                          id="fieldConfidential"
                          checked={fieldConfidential || false}
                          onChange={this.handleSwitchChange('fieldConfidential')}
                        >Confidential</Switch>
                    </div>

                    {/*fieldOptional*/}
                    <div style={{ flex: 1, marginLeft: '12px' }}>
                        <Switch
                          id="fieldOptional"
                          checked={fieldOptional || false}
                          onChange={this.handleSwitchChange('fieldOptional')}
                        >Optional</Switch>
                    </div>
                </div>

                {/*fieldCalculation,*/}
                {/*fieldFormat,*/}
                {/*fieldMaxValue,*/}
                {/*fieldMinValue,*/}
                { (fieldType !== FieldType.NUMBER) ? null :
                    <div>
                        {/*<Textfield*/}
                            {/*style={{width: "100%"}}*/}
                            {/*floatingLabel*/}
                            {/*label="Calculated value"*/}
                            {/*onChange={this.handleInputChange.bind(this, 'fieldCalculation')}*/}
                            {/*value={fieldCalculation || ""} />*/}

                        <div style={styles.flexRow}>
                            <Textfield
                              style={{ flex: 1, marginRight: '12px' }}
                              floatingLabel
                              label="Format"
                              pattern="#*"
                              onChange={this.handleInputChange.bind(this, 'fieldFormat')}
                              value={fieldFormat || ''}
                            />
                            <Textfield
                              style={{ flex: 1, marginLeft: '12px', marginRight: '12px' }}
                              floatingLabel
                              label="Min Value"
                              pattern="-?[0-9]*(\.[0-9]+)?"
                              onChange={this.handleInputChange.bind(this, 'fieldMinValue')}
                              value={fieldMinValue || ''}
                            />
                            <Textfield
                              style={{ flex: 1, marginLeft: '12px' }}
                              floatingLabel
                              label="Max Value"
                              pattern="-?[0-9]*(\.[0-9]+)?"
                              onChange={this.handleInputChange.bind(this, 'fieldMaxValue')}
                              value={fieldMaxValue || ''}
                            />
                        </div>
                        <div style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '12px' }}>
                            Format: Add as many <span style={{ fontWeight: 'bold' }}>#</span> as the number of decimal digits or leave empty
                        </div>

                        {/*<FormSection label="DEFAULT" topSpace/>*/}
                        {/*<RadioGroup*/}
                            {/*style={{marginBottom: "24px"}}*/}
                            {/*container="div"*/}
                            {/*childContainer="div"*/}
                            {/*name="fieldDefaultValue"*/}
                            {/*value={fieldDefaultValue || ""}*/}
                            {/*onChange={this.handleInputChange.bind(this, 'fieldDefaultValue')}*/}
                        {/*>*/}
                            {/*<Radio value={DefaultValueType.EMPTY} ripple>Empty</Radio>*/}
                            {/*<Radio value={DefaultValueType.COMPUTE} ripple>Compute</Radio>*/}
                        {/*</RadioGroup>*/}

                    </div>
                }

                {/*fieldDefaultValue,*/}
                { (fieldType !== FieldType.TEXT) ? null :
                    <div>
                        <FormSection label="DEFAULT" topSpace />
                        <RadioGroup
                            style={{ marginBottom: '24px' }}
                            container="div"
                            childContainer="div"
                            name="fieldDefaultValue"
                            value={fieldDefaultValue || ''}
                            onChange={this.handleInputChange.bind(this, 'fieldDefaultValue')}
                        >
                            <Radio value={DefaultValueType.EMPTY} ripple>Empty</Radio>
                            <Radio value={DefaultValueType.UID} ripple>Generated ID</Radio>
                        </RadioGroup>
                    </div>
                }

                {/*fieldDefaultValue,*/}
                { (fieldType !== FieldType.DATE && fieldType !== FieldType.DATETIME) ? null :
                    <div>
                        <FormSection label="DEFAULT" topSpace />
                        <RadioGroup
                        style={{ marginBottom: '24px' }}
                        container="div"
                        childContainer="div"
                        name="fieldDefaultValue"
                        value={fieldDefaultValue || ''}
                        onChange={this.handleInputChange.bind(this, 'fieldDefaultValue')}
                        >
                            <Radio value={DefaultValueType.EMPTY} ripple>Empty</Radio>
                            <Radio value={DefaultValueType.DATE_NOW} ripple>Current time</Radio>
                            <Radio value={DefaultValueType.DATE_NOON} ripple>Today at noon</Radio>
                            <Radio value={DefaultValueType.DATE_MIDNIGHT} ripple>Today at midnight</Radio>
                        </RadioGroup>
                    </div>
                }

                {/*fieldValues,*/}
                { (fieldType !== FieldType.DROPDOWN) ? null :
                    <Textfield
                      style={{ width: '100%' }}
                      floatingLabel
                      label="Dropdown Values"
                      rows={5}
                      required
                      onChange={this.handleInputChange.bind(this, 'fieldValues')}
                      value={fieldValues || ''}
                    />
                }

                {/*fieldCalculation, for period reference*/}
                { (fieldType !== FieldType.PERIOD) ? null :
                    <div style={{ marginBottom: '24px' }}>
                        <Textfield
                          style={{ width: '100%' }}
                          floatingLabel
                          label="Reference Expression"
                          pattern="(\$[a-zA-Z0-9]+)+(\s*-\s*(\$[a-zA-Z0-9]+))?"
                          required
                          onChange={this.handleInputChange.bind(this, 'fieldCalculation')}
                          value={fieldCalculation || ''}
                        />
                        <div style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '12px' }}>
                          Example: <span style={{ fontWeight: 'bold' }}>$key</span>
                        </div>
                    </div>
                }

            </DialogContent>
        );

        const selectFieldTypeDialogContent = (
            <DialogContent>
                <p>Select field type:</p>
                <RadioGroup
                    container="div"
                    childContainer="div"
                    name="fieldType"
                    value={fieldDataType || ''}
                    onChange={this.handleInputChange.bind(this, 'fieldType')}
                >
                    <Radio value={FieldType.DATE} ripple>Date</Radio>
                    <Radio value={FieldType.DATETIME} ripple>Date + Time</Radio>
                    <Radio value={FieldType.DROPDOWN} ripple>Dropdown</Radio>
                    <Radio value={FieldType.NUMBER} ripple>Number</Radio>
                    <Radio value={FieldType.TEXT} ripple>Text</Radio>
                    <Radio value={FieldType.TIME} ripple>Time</Radio>
                    <Radio value={FieldType.PERIOD} ripple>Time Period</Radio>
                </RadioGroup>
            </DialogContent>
        );

        const openFieldDialog = (openNewFieldDialog || openEditFieldDialog);
        const editFieldDialog = (
            <Dialog open={openFieldDialog} style={(!fieldDataType) ? styles.dialogType : styles.dialogEdit}>
                {(fieldDataType && fieldDataType !== '') ? editDialogContent : selectFieldTypeDialogContent}
                <DialogActions>
                    { (!openNewFieldDialog) ? null :
                        <div>
                            <Button type='button' onClick={this.closeNewFieldDialog}>Cancel</Button>
                            <Button type='button' onClick={this.handleFieldActionClick.bind(this, 'add')} accent>Create</Button>
                        </div>
                    }
                    { (!openEditFieldDialog) ? null :
                        <div>
                            <Button type='button' onClick={this.closeEditFieldDialog}>Cancel</Button>
                            <Button type='button' onClick={this.handleFieldActionClick.bind(this, 'update')} accent>Update</Button>
                        </div>
                    }
                </DialogActions>
            </Dialog>
        );

        const confirmDeleteFieldDialog = (
            <Dialog open={openConfirmDeleteFieldDialog}>
                <DialogContent>
                    <p>Are you sure you want to delete this item?</p>
                </DialogContent>
                <DialogActions>
                    <Button type='button' onClick={this.handleFieldActionClick.bind(this, 'delete')} accent>Delete</Button>
                    <Button type='button' onClick={this.closeConfirmDeleteFieldDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>
        );

        const renderFieldActions = (screenId, rowData, index) => {
            return (
                <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'end', color: '#999999' }}>
                    <div
                      style={{ fontSize: '24px', cursor: 'pointer' }}
                      onClick={this.openEditFieldDialog(index)}
                    ><MdCreate />&nbsp;</div>
                    <div
                      style={{ fontSize: '24px', cursor: 'pointer' }}
                      onClick={this.openConfirmDeleteFieldDialog(index)}
                    ><MdDelete /></div>
                </div>
            );
        };

        const fieldsTable = (
            <Table
              style={styles.table}
              rows={fields}
              rowKeyColumn="position"
              onSort={this.swapFields}
            >

                <TableHeader name="type">Key</TableHeader>
                <TableHeader name="key">Key</TableHeader>
                <TableHeader name="label" style={{ width: '100%' }}>Label</TableHeader>
                <TableHeader name="$index" style={{ width: '48px' }} cellFormatter={renderFieldActions} />
            </Table>
        );

        return (
            <div>
                <Card shadow={0} style={styles.container}>
                    <Toolbar title="Fields">
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <div
                              style={{ fontSize: '24px', cursor: 'pointer' }}
                              onClick={this.openNewFieldDialog}
                            ><MdAdd />&nbsp;</div>
                            {(enableFieldSwapAction) ? (
                              <div
                                style={{ fontSize: '24px', cursor: 'pointer' }}
                                onClick={this.handleFieldActionClick.bind(this, 'swap')}
                              ><MdSwapVert />&nbsp;</div>
                            ) : null}
                            {(enableFieldMoveUpAction) ? (
                              <div
                                style={{ fontSize: '24px', cursor: 'pointer' }}
                                onClick={this.handleFieldActionClick.bind(this, 'move_up')}
                              ><MdArrowUpward />&nbsp;</div>
                            ) : null}
                            {(enableFieldMoveDownAction) ? (
                              <div
                                style={{ fontSize: '24px', cursor: 'pointer' }}
                                onClick={this.handleFieldActionClick.bind(this, 'move_down')}
                              ><MdArrowDownward />&nbsp;</div>
                            ) : null}
                        </div>
                    </Toolbar>

                    {(fields && fields.length > 0) ? fieldsTable
                        :
                        <CardText>
                            <div style={styles.emptyMessageContainer}>
                                <div>The list of fields is empty</div>
                            </div>
                        </CardText>
                    }
                </Card>
                {editFieldDialog}
                {confirmDeleteFieldDialog}
            </div>
        );
    }
}

FieldList.propTypes = {
  metadata: PropTypes.object,
  onFieldsChanged: PropTypes.func.isRequired,
  onUpdateMetadata: PropTypes.func.isRequired
};
