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
    Menu,
    MenuItem,
} from 'react-mdl';
import { MdCreate, MdMoreVert } from 'react-icons/md';
import Toolbar from 'Toolbar';
import { DEFAULT_SCREEN_TYPE, ScreenType } from 'App/constants';
// import Spinner from 'ui/Spinner';
import CopyToClipBoard from 'DashboardComponents/CopyToClipBoard';
import PasteBoard from 'DashboardComponents/PasteBoard';
import isMobileBrowser from 'AppUtils/isMobileBrowser';
import { Table, TableHeader } from '../../datatable';

class Display extends Component {
  state = {
    openSelectScreenTypeDialog: false,
    screens: [],
    addScreenType: DEFAULT_SCREEN_TYPE
  };

  togglePasteBoard = () => this.setState({ openPasteBoard: !this.state.openPasteBoard });

  handleAddScreenClick = () => {
    const { actions, scriptId, history } = this.props;
    const { addScreenType } = this.state;

    this.setState({ addingScreen: false });
    actions.post('create-screen', {
      script_id: scriptId,
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
        actions.updateApiData(state => ({
          screens: state.screens.filter(scr => scr.id !== id)
            .map((screen, i) => ({ ...screen, position: i + 1 }))
        }));
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
      const { actions, screens } = this.props;
      let updatedScreens = Object.assign([], screens);
      const screen = updatedScreens[oldIndex];
      updatedScreens.splice(oldIndex, 1);
      updatedScreens.splice(newIndex, 0, screen);
      updatedScreens = updatedScreens.map((scr, i) => ({ ...scr, position: i + 1 }));

      actions.updateApiData({ screens: updatedScreens });

      this.setState({ sortingScreens: false });
      actions.post('update-screens', {
        returnUpdated: false,
        screens: updatedScreens.map(({ id, position }) => ({ id, position })),
        onResponse: () => this.setState({ sortingScreens: false }),
        onFailure: deleteScriptError => this.setState({ deleteScriptError }),
        // onSuccess: ({ payload }) => actions.updateApiData({ screens: payload.screens })
      });
  };

  handleDuplicateScreen = id => {
    const { actions } = this.props;
    this.setState({ duplicatingScreen: true });
    actions.post('duplicate-screen', {
      id,
      onResponse: () => this.setState({ duplicatingScreen: false }),
      onFailure: duplicateScreenError => this.setState({ duplicateScreenError }),
      onSuccess: ({ payload }) => {
        actions.updateApiData(state => {
          const screens = [...state.screens];
          const ogIndex = screens.map((s, i) =>
            s.id === id ? i : null).filter(i => i !== null)[0] || 0;
          screens.splice(ogIndex + 1, 0, payload.screen);
          return {
            screens: screens.map((screen, i) => ({ ...screen, position: i + 1 }))
          };
        });
      }
    });
  };

  // TODO: Fix margin top to be more generic for all content
  render() {
    const { screens, scriptId } = this.props;
    const { addScreenType } = this.state;
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
          <div style={{ position: 'relative' }}>
            <div id={`menu_${id}`} className="ui__cursor_pointer">
              <MdMoreVert style={{ fontSize: '24px' }} />
            </div>
            <Menu target={`menu_${id}`} align="right">
                <MenuItem onClick={() => this.handleDuplicateScreen(id)}>
                  Duplicate
                </MenuItem>
                <MenuItem>
                  <CopyToClipBoard data={JSON.stringify({ dataId: id, dataType: 'screen' })}>
                    <span>Copy</span>
                  </CopyToClipBoard>
                </MenuItem>
                <MenuItem onClick={this.handleDeleteScreenClick(id)}>
                  Delete
                </MenuItem>
            </Menu>
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
      <PasteBoard
        modal={{
          onClose: this.togglePasteBoard,
          open: this.state.openPasteBoard,
        }}
        accept="screen"
        data={{ dataId: scriptId, dataType: 'script' }}
        redirectTo={payload => `/dashboard/scripts/${scriptId}/screens/${payload.screen.id}`}
      >
        <Card shadow={0} style={styles.screens}>
          <Toolbar title="Screens">
            <div>
              <div id="add_new" className="ui__cursor_pointer">
                <MdMoreVert style={{ fontSize: '24px' }} />
              </div>
              <Menu target="add_new" align="right">
                  <MenuItem onClick={this.openSelectScreenTypeDialog}>
                    Add new
                  </MenuItem>
                  {isMobileBrowser() ?
                    <MenuItem onClick={this.togglePasteBoard}>
                      Paste
                    </MenuItem> : null}
              </Menu>
            </div>
          </Toolbar>

          {(screens && screens.length > 0) ?
            <Table
              style={styles.table}
              rows={screens.map(scr => ({ ...scr.data, id: scr.id, position: scr.position }))}
              rowKeyColumn="position"
              onSort={this.swapScreenItems}
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
      </PasteBoard>
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
