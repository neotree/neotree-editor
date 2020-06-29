import React, { Component } from 'react';
import FormButtonBar from 'FormButtonBar'; 
import FormSection from 'FormSection'; 
import Toolbar from 'Toolbar'; 
import {
    Button,
    Card,
    CardText,
    Textfield
} from 'react-mdl';

export default class Form extends Component {
  constructor(props) {
    super(props);
    this.state = { password: '' };
  }

  handleBackClick = () => this.props.history.goBack();

  handleInputChange = (name, event) => {
    this.setState({ ...this.state, [name]: event.target.value });
  };

  handleSubmitClick = () => {
    const { actions, history } = this.props;
    const { password } = this.state;
    actions.post('update-admin-password', {
      password,
      onResponse: () => this.setState({ updating: false }),
      onFailure: updateError => this.setState({ updateError }),
      onSuccess: () => history.goBack()
    });
  };

  render() {
    const { password } = this.state;
    const title = 'Administrator password';
    const actionLabel = 'Update';
    const styles = {
      container: {
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        height: '100%'
      },
      form: { width: '520px' }
    };

    return (
      <div style={styles.container}>
        <div>
          <Card shadow={1} style={styles.form}>
            <Toolbar
              leftNavIcon="arrow_back"
              title={title}
              onLeftNavItemClicked={this.handleBackClick}
            />

            <CardText>
              <Textfield
                style={{ width: '100%' }}
                floatingLabel
                label="Password"
                value={password}
                onChange={this.handleInputChange.bind(this, 'password')}
              />

              <FormButtonBar>
                <Button onClick={this.handleSubmitClick}raised accent ripple>
                  {actionLabel}
                </Button>
              </FormButtonBar>
            </CardText>
          </Card>
        </div>
      </div>
    );
  }
}
