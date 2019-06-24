import React, { Component } from 'react';
import { push } from 'react-router-redux'
import {
    Button,
    Card,
    CardText,
    DataTable,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Radio,
    RadioGroup,
    TableHeader
} from 'react-mdl';

// import {
//     Table,
//     TableHeader
// } from '../datatable';

import Toolbar from 'components/Toolbar';

import { createDiagnosis, deleteDiagnosis, subscribeDiagnosisChanges, unsubscribeDiagnosisChanges } from '../../actions/datastore';

export default class DiagnosisList extends Component {

    static contextTypes = {
        store: React.PropTypes.object.isRequired,
    };

    static propTypes = {
        scriptId: React.PropTypes.string.isRequired,
        onEditDiagnosisClick: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            openSelectScreenTypeDialog: false,
            diagnosis: []
        };
    }

    componentWillMount() {
        const { scriptId } = this.props;
        subscribeDiagnosisChanges(scriptId, (diagnosis) => {
            this.setState({
                ...this.state,
                diagnosis: diagnosis
            })
        });
    }

    componentWillUnmount() {
        const { scriptId } = this.props;
        unsubscribeDiagnosisChanges(scriptId)
    }

    handleAddDiagnosesClick = () => {
        const { dispatch } = this.context.store;
        const { scriptId } = this.props;
        dispatch(push('/scripts/' + scriptId + '/diagnosis/new'));
    };

    handleDeleteDiagnosesClick = (diagnosisId) => {
        return () => {
            console.log("delete diagnosis click");
            const { scriptId } = this.props;
            deleteDiagnosis(scriptId, diagnosisId)
                .then(() => {
                    console.log('delete diagnosis success');
                })
                .catch(error => {
                    console.error(error)
                });
        };
    };

    handleEditDiagnosesClick = (index) => {
        return () => {
            this.props.onEditDiagnosisClick(index);
        }
    };

    handleInputChange = (name, event) => {
        this.setState({...this.state, [name]: event.target.value});
    };

    render() {
        const { diagnosis } = this.state;

        const styles = {
            diagnosis: {
                marginTop: '24px',
                width: '780px'
            },
            table: {
                width: '100%'
            },
            emptyMessageContainer : {
                display: 'flex',
                boxSizing: 'border-box',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#757575',
                fontSize: '16px'
            }
        };

        const renderItemActions = (screenId, rowData, index) => {
            return (
                <div style={{display: 'flex', flexDirection:'row', alignContent: 'end', color: "#999999"}}>
                    <IconButton name="edit" onClick={this.handleEditDiagnosesClick(rowData.$id)}/>
                    <IconButton name="delete" onClick={this.handleDeleteDiagnosesClick(rowData.$id)}/>
                </div>
            )
        };

        return (
            <div>
                <Card shadow={0} style={styles.diagnosis}>
                    <Toolbar title="Diagnosis">
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <IconButton name="add" onClick={this.handleAddDiagnosesClick} />
                        </div>
                    </Toolbar>
                    {(diagnosis && diagnosis.length > 0) ?
                        <DataTable style={{width: '780px'}} shadow={0} rows={diagnosis || []}>
                            <TableHeader name="name">Name</TableHeader>
                            <TableHeader name="description">Description</TableHeader>
                            <TableHeader name="diagnosisId" style={{width: '48px'}} cellFormatter={renderItemActions} />
                        </DataTable>
                        :
                        <CardText>
                            <div style={styles.emptyMessageContainer}>
                                <div>The list of screens is empty</div>
                            </div>
                        </CardText>
                    }
                </Card>
            </div>
        );
    }

}
