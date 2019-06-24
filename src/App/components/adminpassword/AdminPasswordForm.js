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

import { updateAdminPassword } from 'actions/datastore';

export default class AdminPasswordForm extends Component {

    static contextTypes = {
        router: React.PropTypes.object.isRequired,
        store: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            password: null
        };
    }

    // componentWillMount() {
    //     fetchAdminPassword()
    //         .then((data) => {
    //             this.setState({
    //                 ...this.state,
    //                 password: data.password
    //             });
    //         })
    //         .catch(error => {
    //             console.error(error)
    //         });
    // }

    handleBackClick = () => {
        const { router } = this.context;
        router.goBack();
    };

    handleInputChange = (name, event) => {
        this.setState({...this.state, [name]: event.target.value});
    };

    handleSubmitClick = () => {
        const { password } = this.state;
        const { router } = this.context;

        console.log('update admin password');
        updateAdminPassword(password)
            .then(() => {
                console.log('update admin password success');
                router.goBack();
            })
            .catch(error => {
                console.error(error)
            });
    };

    render() {
        const { password } = this.state;

        const title = "Administrator password";
        const actionLabel = "Update";
        const styles = {
            container : {
                display: 'flex',
                boxSizing: 'border-box',
                justifyContent: 'center',
                height: '100%'
            },
            form: {
                width: '520px'
            }
        };

        return (
            <div style={styles.container}>
                <div>
                    <Card shadow={1} style={styles.form}>

                        <Toolbar leftNavIcon="arrow_back" title={title} onLeftNavItemClicked={this.handleBackClick} />

                        <CardText>
                            <Textfield
                                style={{width : "100%"}}
                                floatingLabel
                                label="Password"
                                onChange={this.handleInputChange.bind(this, 'password')}
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
