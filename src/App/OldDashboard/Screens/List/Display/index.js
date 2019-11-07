/* global window */
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
    Radio,
    RadioGroup,
} from 'react-mdl';
import { MdCreate, MdAdd, MdDelete } from 'react-icons/md';
import Toolbar from 'Toolbar';
import { DEFAULT_SCREEN_TYPE, ScreenType } from 'App/constants';
// import Spinner from 'ui/Spinner';
import Api from 'AppUtils/Api';
import Copy from 'Dashboard/Scripts/CopyItems';
import { Table, TableHeader } from '../../datatable';

class Display extends Component {
  state = {
    openSelectScreenTypeDialog: false,
    screens: [],
    selected: [],
    addScreenType: DEFAULT_SCREEN_TYPE
  };

  handleAddScreenClick = () => {
    const { updateState, scriptId, history } = this.props;
    const { addScreenType } = this.state;

    this.setState({ addingScreen: true });
    Api.post('/create-screen', { script_id: scriptId, type: addScreenType })
      .catch(addScreenError => this.setState({ addScreenError, addingScreen: false }))
      .then(({ payload }) => {
        this.setState({ addingScreen: false });
        updateState(({ screen: payload.screen }));
        history.push(`/dashboard/scripts/${scriptId}/screens/${payload.screen.id}`);
        this.closeSelectScreenTypeDialog();
      });
  };

  handleDeleteScreenClick = id => () => {
    const { updateState, scriptId } = this.props;
    this.setState({ deletingScreen: false });
    Api.post('/delete-screen', { id, scriptId })
      .catch(deleteScreenError => this.setState({ deleteScreenError, deletingScreen: false }))
      .then(() => {
        this.setState({ deletingScreen: false });
        updateState(state => ({
          screens: state.screens.filter(scr => scr.id !== id)
            .map((screen, i) => ({ ...screen, position: i + 1 }))
        }));
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
      const { updateState, screens } = this.props;
      let updatedScreens = Object.assign([], screens);
      const screen = updatedScreens[oldIndex];
      updatedScreens.splice(oldIndex, 1);
      updatedScreens.splice(newIndex, 0, screen);
      updatedScreens = updatedScreens.map((scr, i) => ({ ...scr, position: i + 1 }));

      updateState({ screens: updatedScreens });

      this.setState({ sortingScreens: false });
      Api.post('/update-screens', {
        returnUpdated: false,
        screens: updatedScreens.map(({ id, position }) => ({ id, position }))
      }).catch(deleteScriptError => this.setState({ deleteScriptError, sortingScreens: false }))
        .then(() => this.setState({ sortingScreens: false }));
  };

  handleDuplicateScreen = id => {
    const { updateState } = this.props;
    this.setState({ duplicatingScreen: true });
    Api.post('/duplicate-screen', { id })
      .catch(duplicateScreenError => this.setState({
        duplicateScreenError,
        duplicatingScreen: false
      }))
      .then(({ payload }) => {
        this.setState({ duplicatingScreen: false });
        updateState(state => {
          const screens = [...state.screens];
          const ogIndex = screens.map((s, i) =>
            s.id === id ? i : null).filter(i => i !== null)[0] || 0;
          screens.splice(ogIndex + 1, 0, payload.screen);
          return {
            screens: screens.map((screen, i) => ({ ...screen, position: i + 1 }))
          };
        });
      });
  };

  // TODO: Fix margin top to be more generic for all content
  render() {
    const { screens } = this.props;
    const { addScreenType, selected } = this.state;
    const styles = {
      screens: { overflow: 'unset', width: '100%', minWidth: '700px' },
      table: { width: '100%' },
      emptyMessageContainer: {
        display: 'flex',
        boxSizing: 'border-box',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#757575',
        fontSize: '16px'
      }
    };

    const renderItemActions = id => {
      return (
        <div
          className="ui__flex ui__alignItems_center"
          style={{ color: '#999999' }}
        >
          <div
            className="ui__cursor_pointer"
            onClick={this.handleEditScreenClick(id)}
          >
            <MdCreate style={{ fontSize: '24px' }} />
          </div>&nbsp;
          <div className="ui__cursor_pointer" onClick={this.handleDeleteScreenClick(id)}>
            <MdDelete style={{ fontSize: '24px' }} />
          </div>
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
      if (!text) return '';
      return (text.length <= 30) ? text : `${text.substring(0, 29)}...`;
    };

    return (
      <div>
        <Card shadow={0} style={styles.screens}>
          <Toolbar title="Screens">
            {selected.length > 0 && (
              <Copy itemsType="screens" data={{ ids: selected }} />
            )}
            <div
              onClick={this.openSelectScreenTypeDialog}
              className="ui__cursor_pointer"
            >
              <MdAdd style={{ fontSize: '24px' }} />
            </div>
          </Toolbar>

          {(screens && screens.length > 0) ?
            <Table
              style={styles.table}
              rows={screens.map(scr => ({ ...scr.data, id: scr.id, position: scr.position }))}
              rowKeyColumn="position"
              onSort={this.swapScreenItems}
              selected={selected}
              onSelect={selected => this.setState({ selected })}
            >
                {/*<TableHeader name="$aVoid" cellFormatter={(aVoid, rowData, index) => `${index + 1}`} />*/}
                <TableHeader name="position">Pos</TableHeader>
                <TableHeader name="epicId">Epic</TableHeader>
                <TableHeader name="storyId">Story</TableHeader>
                <TableHeader name="refId">Ref.</TableHeader>
                <TableHeader name="title" style={{ width: '100%' }} cellFormatter={ellipsizeTitle}>Title</TableHeader>
                <TableHeader name="id" style={{ width: '48px' }} cellFormatter={renderItemActions} />
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
  updateState: PropTypes.func.isRequired,
  scriptId: PropTypes.string.isRequired,
  onEditScreenClick: PropTypes.func.isRequired
};

export default Display;
