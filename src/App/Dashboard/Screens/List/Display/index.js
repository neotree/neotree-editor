import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Card,
    CardText,
//    DataTable,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Radio,
    RadioGroup,
//    TableHeader,
//    Textfield
} from 'react-mdl';
import { Table, TableHeader } from '../../datatable';
import Toolbar from 'Toolbar';  // eslint-disable-line
import { arrayMove } from 'App/utils'; // eslint-disable-line
import { DEFAULT_SCREEN_TYPE, ScreenType } from 'App/constants'; // eslint-disable-line

/*eslint-disable quotes*/
/*eslint-disable quote-props*/
/*eslint-disable key-spacing*/

class Display extends Component {
  state = {
    openSelectScreenTypeDialog: false,
    screens: [],
    addScreenType: DEFAULT_SCREEN_TYPE
  };

  componentWillMount() {
    setTimeout(() => this.props.actions.updateApiData({
      screen: {
        "actionText" : "Further Triage",
        "condition" : "$BabyCryTriage = false",
        "contentText" : "Briefly check ABCD:\n\nA: Airway - is the airway open?\n\nB: Breathing - is the baby breathing?\n\nC: Circulation - is heart rate over 100? \n\nD: Disability - how is the tone?",
        "createdAt" : 1470086025701,
        "epicId" : "1.3",
        "metadata" : {
          "confidential" : false,
          "dataType" : "id",
          "items" : [{
            "confidential" : false,
            "dataType" : "id",
            "id" : "NotBr",
            "label" : "NOT BREATHING! ",
            "position" : 1
          }, {
            "confidential" : false,
            "dataType" : "id",
            "id" : "Gasp",
            "label" : "GASPING or irregular breathing ",
            "position" : 2
          }, {
            "confidential" : false,
            "dataType" : "id",
            "id" : "HRLow",
            "label" : "Normal breathing but HR < 100 ",
            "position" : 3
          }, {
            "confidential" : false,
            "dataType" : "id",
            "id" : "Floppy",
            "label" : "VERY FLOPPY (normal breathing & HR)",
            "position" : 4
          }, {
            "confidential" : false,
            "dataType" : "id",
            "id" : "Stable",
            "label" : "Stable ",
            "position" : 5
          }],
          "key" : "FurtherTriage",
          "label" : "Further Triage"
        },
        "order" : 4,
        "position" : 2,
        "refId" : "ABCD",
        "screenId" : "-KO6x6XzXBCZvk3nyc8B",
        "sectionTitle" : "Emergency Triage",
        "source" : "editor",
        "step" : "2/3",
        "storyId" : "ET2",
        "title" : "EMERGENCY TRIAGE ",
        "type" : "single_select",
        "updatedAt" : 1487321223314
      }
    }), 1000);
  }

  componentWillUnmount() {
    this.props.actions.updateApiData({ screen: null });
  }

  handleAddScreenClick = () => {
    const { actions, scriptId, history } = this.props;
    const { addScreenType } = this.state;

    this.setState({ addingScreen: false });
    actions.post('create-screen', {
      scriptId,
      type: addScreenType,
      onResponse: () => this.setState({ addingScreen: false }),
      onFailure: addScreenError => this.setState({ addScreenError }),
      onSuccess: ({ payload }) => {
        actions.updateApiData(({ screen: payload.screen }));
        history.push(`/dashboard/scripts/${scriptId}/screens/${payload.screen.id}`);
        this.closeSelectScreenTypeDialog();
      }
    });
  };

  handleDeleteScreenClick = id => () => {
    const { actions, scriptId } = this.props;
    this.setState({ deletingScreen: false });
    actions.post('delete-screen', {
      id,
      scriptId,
      onResponse: () => this.setState({ deletingScreen: false }),
      onFailure: deleteScreenError => this.setState({ deleteScreenError }),
      onSuccess: () => {
        actions.updateApiData(state =>
          ({ screens: state.screens.filter(scr => scr.id !== id) }));
      }
    });
  };

  handleEditScreenClick = index => () => this.props.onEditScreenClick(index);

  handleInputChange = (name, e) => this.setState({ [name]: e.target.value });

  openSelectScreenTypeDialog = () => this.setState({ openSelectScreenTypeDialog: true });

  closeSelectScreenTypeDialog = () => this.setState({
      openSelectScreenTypeDialog: false,
      addScreenTitle: null,
      addScreenType: DEFAULT_SCREEN_TYPE
  });

  swapScreenItems = (oldIndex, newIndex) => {
      const { screens, scriptId } = this.props;
      const updatedScreens = arrayMove([...screens], oldIndex, newIndex);
      const { actions } = this.props;
      this.setState({ sortingScreens: false });
      actions.post('sort-screens', {
        scriptId,
        screens: updatedScreens.map((scr, i) => ({ id: scr.id, position: i })),
        onResponse: () => this.setState({ sortingScreens: false }),
        onFailure: deleteScriptError => this.setState({ deleteScriptError }),
        onSuccess: () => { /**/ }
      });
  };

  // TODO: Fix margin top to be more generic for all content
  render() {
    const { screens } = this.props;
    const { addScreenType } = this.state;
    const styles = {
      screens: { marginTop: '24px', width: '780px' },
      table: { width: '100%' },
      emptyMessageContainer : {
        display: 'flex',
        boxSizing: 'border-box',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#757575',
        fontSize: '16px'
      }
    };

    const renderItemActions = (screenId, rowData) => {
      return (
        <div style={{ display: 'flex', flexDirection:'row', alignContent: 'end', color: "#999999" }}>
          <IconButton name="edit" onClick={this.handleEditScreenClick(rowData.$id)} />
          <IconButton name="delete" onClick={this.handleDeleteScreenClick(rowData.$id)} />
        </div>
      );
    };

    const selectScreenTypeDialog = (
      <Dialog open={this.state.openSelectScreenTypeDialog} style={{ width: '260px' }}>
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

    const ellipsizeTitle = (screenId, rowData) => {
      const text = rowData.title;
      if (!text) return "";
      return (text.length <= 30) ? text : `${text.substring(0, 29)}...`;
    };

    return (
      <div>
        <Card shadow={0} style={styles.screens}>
          <Toolbar title="Screens">
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <IconButton name="add" onClick={this.openSelectScreenTypeDialog} />
            </div>
          </Toolbar>

          {(screens && screens.length > 0) ?
            <Table
              style={styles.table}
              rows={(screens) ? screens : []}
              rowKeyColumn="position"
              onSort={this.swapScreenItems}
            >
                {/*<TableHeader name="$aVoid" cellFormatter={(aVoid, rowData, index) => `${index + 1}`} />*/}
                <TableHeader name="position">Pos</TableHeader>
                <TableHeader name="epicId">Epic</TableHeader>
                <TableHeader name="storyId">Story</TableHeader>
                <TableHeader name="refId">Ref.</TableHeader>
                <TableHeader name="title" style={{ width: '100%' }} cellFormatter={ellipsizeTitle}>Title</TableHeader>
                <TableHeader name="screenId" style={{ width: '48px' }} cellFormatter={renderItemActions} />
            </Table>
            :
            <CardText>
                <div style={styles.emptyMessageContainer}>
                    <div>The list of screens is empty</div>
                </div>
            </CardText>}
        </Card>
        {selectScreenTypeDialog}
      </div>
    );
  }
}

Display.propTypes = {
  screens: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  scriptId: PropTypes.string.isRequired,
  onEditScreenClick: PropTypes.func.isRequired
};

export default Display;
