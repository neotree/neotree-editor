import React, { Component } from 'react';
import { push } from 'react-router-redux'
import {
    Button,
    Card,
    CardText,
//    DataTable,
    IconButton,
    Radio,
    RadioGroup,
//    TableHeader,
//    Textfield
} from 'react-mdl';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import {
    Table,
    TableHeader
} from '../datatable';

import Toolbar from 'components/Toolbar';

import { createScreen, deleteScreen, updateScreenOrder, subscribeScreenChanges, unsubscribeScreenChanges } from '../../actions/datastore';
import { arrayMove } from 'AppUtils';
import { DEFAULT_SCREEN_TYPE, ScreenType } from '../../constants';

export default class ScreenList extends Component {

    static contextTypes = {
        store: React.PropTypes.object.isRequired,
    };

    static propTypes = {
        scriptId: React.PropTypes.string.isRequired,
        onEditScreenClick: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            openSelectScreenTypeDialog: false,
            screens: [],
            addScreenType: DEFAULT_SCREEN_TYPE
        };
    }

    componentWillMount() {
        const { scriptId } = this.props;
        subscribeScreenChanges(scriptId, (screens) => {
//            console.log('update screen list');
            this.setState({
                ...this.state,
                screens: screens
            })
        });
    }

    componentWillUnmount() {
        const { scriptId } = this.props;
        unsubscribeScreenChanges(scriptId)
    }

    handleAddScreenClick = () => {
        const { addScreenType, screens } = this.state;
        const { scriptId } = this.props;
        const { dispatch } = this.context.store;

        const screen = {
            type: addScreenType
        };

        createScreen(scriptId, addScreenType, screens.length + 1)
            .then((screenId) => {
                console.log('create screen success [id=' + screenId + ']');
                dispatch(push('scripts/' + scriptId + '/screens/' + screenId));
            })
            .catch(error => {
                console.error(error)
            });
        this.closeSelectScreenTypeDialog();
    };

    handleDeleteScreenClick = (screenId) => {
        return () => {
            console.log("delete screen click");
            const { scriptId } = this.props;
            deleteScreen(scriptId, screenId)
                .then(() => {
                    console.log('delete screen success');
                })
                .catch(error => {
                    console.error(error)
                });
        };
    };

    handleEditScreenClick = (index) => {
        return () => {
            this.props.onEditScreenClick(index);
        }
    };

    handleInputChange = (name, event) => {
        this.setState({...this.state, [name]: event.target.value});
    };

    openSelectScreenTypeDialog = () => {
        this.setState({
            ...this.state,
            openSelectScreenTypeDialog: true
        });
    };

    closeSelectScreenTypeDialog = () => {
        this.setState({
            ...this.state,
            openSelectScreenTypeDialog: false,
            addScreenTitle: null,
            addScreenType: DEFAULT_SCREEN_TYPE
        });
    };

    swapScreenItems = (oldIndex, newIndex) => {
        console.log("Swapping screens [oldIndex=" + oldIndex + ", newIndex=" + newIndex + "]");

        const { screens } = this.state;
        const { scriptId } = this.props;

        var updatedScreens = (screens || []);
        updatedScreens = arrayMove(updatedScreens, oldIndex, newIndex);

        updateScreenOrder(scriptId, updatedScreens);

        // this.setState({
        //     ...this.state,
        //     screens: updatedScreens
        // })
    };

    render() {
        const {
            addScreenType,
            enableScreenSwapAction,
            enableScreenMoveUpAction,
            enableScreenMoveDownAction,
            screens
        } = this.state;

        const styles = {
            screens: {
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
                    <IconButton name="edit" onClick={this.handleEditScreenClick(rowData.$id)}/>
                    <IconButton name="delete" onClick={this.handleDeleteScreenClick(rowData.$id)}/>
                </div>
            )
        };

        const selectScreenTypeDialog = (
            <Dialog
              open={this.state.openSelectScreenTypeDialog}
              onClose={() => {}}
              fullWidth
              maxWidth="sm"
            >
                <DialogContent>
                    <p>Select screen type:</p>

                    <RadioGroup
                        container="div"
                        childContainer="div"
                        name="addScreenType"
                        value={addScreenType || DEFAULT_SCREEN_TYPE}
                        onChange={this.handleInputChange.bind(this, 'addScreenType')}
                    >
                        <Radio value={ScreenType.CHECKLIST} ripple>Checklist</Radio>
                        <Radio value={ScreenType.FORM} ripple>Form</Radio>
                        <Radio value={ScreenType.MANAGEMENT} ripple>Management</Radio>
                        <Radio value={ScreenType.MULTI_SELECT} ripple>Multiple choice list</Radio>
                        <Radio value={ScreenType.LIST} ripple>Simple list</Radio>
                        <Radio value={ScreenType.SINGLE_SELECT} ripple>Single choice list</Radio>
                        <Radio value={ScreenType.PROGRESS} ripple>Progress</Radio>
                        <Radio value={ScreenType.TIMER} ripple>Timer</Radio>
                        <Radio value={ScreenType.YESNO} ripple>Yes/No</Radio>

                    </RadioGroup>

                </DialogContent>
                <DialogActions>
                    <Button type='button' onClick={this.handleAddScreenClick} accent>Create</Button>
                    <Button type='button' onClick={this.closeSelectScreenTypeDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>
        );

        const ellipsizeTitle = (screenId, rowData, index) => {
            var text = rowData.title;
            if (!text) {
                return "";
            }
            return (text.length <= 30) ? text : text.substring(0, 29) + "...";
        };

        // onSelectionChanged={this.handleScreenSelection}
        return (
            <div>
                <Card shadow={0} style={styles.screens}>
                    <Toolbar title="Screens">
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <IconButton name="add" onClick={this.openSelectScreenTypeDialog} />
                        </div>
                    </Toolbar>

                    {(screens && screens.length > 0) ?
                        <Table style={styles.table}
                               rows={(screens) ? screens : []}
                               rowKeyColumn="position"
                               onSort={this.swapScreenItems}>

                            {/*<TableHeader name="$aVoid" cellFormatter={(aVoid, rowData, index) => `${index + 1}`} />*/}
                            <TableHeader name="position">Pos</TableHeader>
                            <TableHeader name="epicId">Epic</TableHeader>
                            <TableHeader name="storyId">Story</TableHeader>
                            <TableHeader name="refId">Ref.</TableHeader>
                            <TableHeader name="title" style={{width: '100%'}} cellFormatter={ellipsizeTitle}>Title</TableHeader>
                            <TableHeader name="screenId" style={{width: '48px'}} cellFormatter={renderItemActions} />
                        </Table>
                        :
                        <CardText>
                            <div style={styles.emptyMessageContainer}>
                                <div>The list of screens is empty</div>
                            </div>
                        </CardText>
                    }
                </Card>
                {selectScreenTypeDialog}
            </div>
        );
    }

}
