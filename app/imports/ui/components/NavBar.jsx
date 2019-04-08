import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter, NavLink } from 'react-router-dom';
import { Menu, Header, Popup, Icon, Button, Modal, Form } from 'semantic-ui-react';
import { Roles } from 'meteor/alanning:roles';

/** The NavBar appears at the top of every page. Rendered by the App Layout component. */
class NavBar extends React.Component {

  /** Initialize component state with properties for login and redirection. */
  constructor(props) {
    super(props);
    this.state = { email: '', password: '', error: '', redirectToReferer: false };
    // Ensure that 'this' is bound to this component in these two functions.
    // https://medium.freecodecamp.org/react-binding-patterns-5-approaches-for-handling-this-92c651b5af56
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  /** Update the form controls each time the user interacts with them. */
  handleChange(e, { name, value }) {
    this.setState({ [name]: value });
  }

  /** Handle Signin submission using Meteor's account mechanism. */
  handleSubmit() {
    const { email, password } = this.state;
    Meteor.loginWithPassword(email, password, (err) => {
      if (err) {
        this.setState({ error: err.reason });
      } else {
        this.setState({ error: '', redirectToReferer: true });
      }
    });
  }

  /** Handle Signup submission using Meteor's account mechanism. */

  render() {
    const menuStyle = { borderRadius: '0', height: '50px', backgroundColor: '#0C1B32',};

    const popupStyle = {
      borderRadius: '0',
      width: '200px',
      backgroundColor: '#0C1B32',
      border: 'none',
    };

    const titleStyle = {
      fontSize: '25px',
    };

    return (
        <div>
          {this.props.currentUser === '' ? (
              <Menu style={menuStyle} attached="top" borderless inverted>
                <Menu.Item>
                  <Header inverted>Icon Here</Header>
                </Menu.Item>
                <Menu.Item>
                  <Header style={titleStyle} inverted color={'yellow'} as={'a'} href={"/"}>Waggle</Header>
                </Menu.Item>
                <Menu.Menu position='right'>
                  <Modal trigger={<Menu.Item>Log In</Menu.Item>}>
                    <Modal.Header>Login to your account</Modal.Header>
                    <Modal.Content>
                      <Form onSubmit={this.handleSubmit}>
                        <Form.Input
                            label="Email"
                            icon="user"
                            iconPosition="left"
                            name="email"
                            type="email"
                            placeholder="E-mail address"
                            onChange={this.handleChange}
                        />
                        <Form.Input
                            label="Password"
                            icon="lock"
                            iconPosition="left"
                            name="password"
                            placeholder="Password"
                            type="password"
                            onChange={this.handleChange}
                        />
                        <Form.Button content="Submit"/>
                      </Form>
                    </Modal.Content>
                  </Modal>
                </Menu.Menu>
              </Menu>
          ) : (
              <Menu style={menuStyle} attached="top" borderless inverted>
                <Menu.Item>
                  <Header inverted>Icon Here</Header>
                </Menu.Item>
                <Menu.Item>
                  <Header inverted color={'yellow'} as='h1'>Waggle</Header>
                </Menu.Item>
                <Menu.Menu position='right'>
                  <Menu.Item>
                    <Popup basic
                           on={'click'}
                           horizontalOffset={15}
                           verticalOffset={-4}
                           style={popupStyle}
                           trigger={
                             <Button inverted icon size={'mini'} color={'yellow'}>
                               <Icon name={'bars'}/>
                             </Button>
                           }
                    >
                      <Menu vertical borderless secondary>
                        <Menu.Item as={'a'} href={''} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Create a
                          Session</Menu.Item>
                        <Menu.Item as={'a'} href={''} style={{ color: 'rgba(255, 255, 255, 0.9)' }}>View
                          Profile</Menu.Item>
                        <Menu.Item as={NavLink} exact to="/signout" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Log
                          Out</Menu.Item>
                      </Menu>
                    </Popup>
                  </Menu.Item>
                </Menu.Menu>
              </Menu>
          )}
        </div>
    );
  }
}

/** Declare the types of all properties. */
NavBar.propTypes = {
  currentUser: PropTypes.string,
  location: PropTypes.object,
};

/** withTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker */
const NavBarContainer = withTracker(() => ({
  currentUser: Meteor.user() ? Meteor.user().username : '',
}))(NavBar);

/** Enable ReactRouter for this component. https://reacttraining.com/react-router/web/api/withRouter */
export default withRouter(NavBarContainer);
