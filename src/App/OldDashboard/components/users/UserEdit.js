import React, { Component } from 'react';

import {
    Button,
    Card,
    CardText,
    Textfield
} from 'react-mdl';

import FormButtonBar from 'components/FormButtonBar';
import FormSection from 'components/FormSection';
import Toolbar from 'components/Toolbar';

import { createUser, fetchUser, updateUser } from 'actions/datastore';

export default class EditUser extends Component {

    static contextTypes = {
        router: React.PropTypes.object.isRequired,
        store: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        const userId = this.props.routeParams.userId;
        const isEditMode = (userId !== 'new');

        this.state = {
            isEditMode: isEditMode,
            userId: userId,
            firstName: null,
            middleName: null,
            lastName: null,
            location: null,
            email: null,
            password: null
        };
    }

    componentWillMount() {
        const { isEditMode, userId } = this.state;
        if (isEditMode) {
            fetchUser(userId)
                .then((user) => {
                    this.setState({
                        ...this.state,
                        email: user.email,
                        firstName: user.firstName,
                        middleName: user.middleName,
                        lastName: user.lastName,
                        location: user.location
                    });
                })
                .catch(error => {
                    console.error(error)
                });
        }
    }

    handleInputChange = (name, event) => {
        this.setState({...this.state, [name]: event.target.value});
    };

    handleBackClick = () => {
        const { router } = this.context;
        router.goBack();
    };

    handleSubmitClick = () => {
        const { isEditMode, userId, firstName, middleName, lastName, location, email, password } = this.state;
        const { router } = this.context;

        if (isEditMode) {
            console.log('update user');
            updateUser(userId, firstName, middleName, lastName, location)
                .then(() => {
                    console.log('update user success');
                    router.goBack();
                })
                .catch(error => {
                    console.error(error)
                });
        } else {
            console.log('create user');
            createUser(email, password, firstName, middleName, lastName, location)
                .then(() => {
                    console.log('create user success');
                    router.goBack();
                })
                .catch(error => {
                    console.error(error)
                });
        }
    };

    render() {
        const { isEditMode, firstName, middleName, lastName, location, email } = this.state;
        const title = (isEditMode) ? "Edit User" : "Add User";
        const actionLabel = (isEditMode) ? "Update" : "Create";
        const styles = {
            container : {
                display: 'flex',
                boxSizing: 'border-box',
                justifyContent: 'center',
                height: '100%'
            },
            form: {
                width: '780px'
            }
        };

        return (
            <div style={styles.container}>
                <div>
                    <Card shadow={1} style={styles.form}>

                        <Toolbar leftNavIcon="arrow_back" title={title} onLeftNavItemClicked={this.handleBackClick} />

                        <CardText>
                            <FormSection label="ACCOUNT" />

                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Email"
                                onChange={this.handleInputChange.bind(this, 'email')}
                                value={email || ""}

                            />
                            {/*disabled={isEditMode}*/}
                            {(!isEditMode) ?
                                <Textfield
                                    style={{width : "100%"}}
                                    floatingLabel
                                    label="Password"
                                    onChange={this.handleInputChange.bind(this, 'password')}
                                />
                                : null
                            }

                            <FormSection label="PERSONAL DETAIL" topSpace/>

                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width : "100%"}}>
                                <Textfield
                                    style={{flex: 1, marginRight: '8px'}}
                                    floatingLabel
                                    label="First name"
                                    value={firstName || ""}
                                    onChange={this.handleInputChange.bind(this, 'firstName')}
                                />

                                <Textfield
                                    style={{flex: 1, marginLeft: '8px'}}
                                    floatingLabel
                                    label="Middle name"
                                    value={middleName || ""}
                                    onChange={this.handleInputChange.bind(this, 'middleName')}
                                />
                            </div>

                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Last name"
                                value={lastName || ""}
                                onChange={this.handleInputChange.bind(this, 'lastName')}
                            />

                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Location"
                                value={location || ""}
                                onChange={this.handleInputChange.bind(this, 'location')}
                            />

                            <FormButtonBar>
                                <Button onClick={this.handleSubmitClick}raised accent ripple>{actionLabel}</Button>
                            </FormButtonBar>

                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }

}
