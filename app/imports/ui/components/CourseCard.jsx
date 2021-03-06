import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-s-alert';
import { Meteor } from 'meteor/meteor';
import { Card, Button, Modal, Form, Container, Item } from 'semantic-ui-react';
import { Courses } from '/imports/api/courses/courses';
import { Profiles } from '/imports/api/profile/profile';
import { withTracker } from 'meteor/react-meteor-data';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';

const _ = require('underscore');

class CourseCard extends React.Component {
  constructor(props) {
    super(props);
    this.refreshPage = this.refreshPage.bind(this);
    this.renderCard = this.renderCard.bind(this);
    this.editCourse = this.editCourse.bind(this);
    this.deleteCourse = this.deleteCourse.bind(this);
    this.updateState = this.updateState.bind(this);
    this.initializeState = this.initializeState.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.removeCard = this.removeCard.bind(this);
    this.handleWorker = this.handleWorker.bind(this);
    this.handleRoyal = this.handleRoyal.bind(this);
    this.state = {
      data: {},
      course: '',
      description: '',
      submittedDescription: '',
      workerBee: undefined,
      royalBee: undefined,
      initialStatus: undefined,
      modalOpen: false,
      ready: false,
    };
  }

  refreshPage() {
    if (this.state.royalBee === false && this.state.workerBee === false) {
      if (this.state.initialStatus === undefined) {
        // do nothing
      } else {
        const user = this.props.user;
        Profiles.update(user._id, { $unset: { [`courses.${this.props.course}`]: '' } },
            (error) => (error ?
                Alert.error(`Update failed: ${error.message}`, {
                  effect: 'slide',
                }) :
                Alert.success('Update succeeded', {
                  effect: 'slide',
                })));
        document.location.reload(true);
      }
    } else
      if (this.state.initialStatus !== this.state.royalBee) {
        const user = this.props.user;
        Profiles.update(user._id, { $set: { [`courses.${this.props.course}`]: this.state.royalBee } },
            (error) => (error ?
                Alert.error(`Update failed: ${error.message}`, {
                  effect: 'slide',
                }) :
                Alert.success('Update succeeded', {
                  effect: 'slide',
                })));
        document.location.reload(true);
      }
  }

  initializeState() {
    const data = Courses.find({ course: this.props.course }).fetch()[0];
    const courses = this.props.user.courses;
    const course = _.pick(courses, this.props.course);
    const value = _.values(course)[0];
    this.setState({
      data: data,
      course: data.course,
      description: data.description,
      submittedDescription: data.description,
    });
    if (value === undefined) {
      this.setState({
        workerBee: false,
        royalBee: false,
        initialStatus: undefined,
      });
    } else
      if (value) {
        this.setState({
          royalBee: true,
          workerBee: false,
          initialStatus: true,
        });
      } else {
        this.setState({
          workerBee: true,
          royalBee: false,
          initialStatus: false,
        });
      }
  }

  editCourse() {
    const data = Courses.find({ course: this.props.course }).fetch()[0];
    const { description } = this.state;
    this.setState({
      submittedDescription: description,
    });
    Courses.update(data._id, { $set: { description } },
        (error) => (error ?
            Alert.error(`Update failed: ${error.message}`, {
              effect: 'slide',
            }) :
            Alert.success('Update succeeded', {
              effect: 'slide',
            })));
    this.setState({
      modalOpen: false,
    });
  }

  deleteCourse() {
    const data = Courses.find({ course: this.props.course }).fetch()[0];
    Courses.remove(data._id,
        (error) => (error ?
            Alert.error(`Remove failed: ${error.message}`, {
              effect: 'slide',
            }) :
            Alert.success('Remove succeeded', {
              effect: 'slide',
            })));
    this.setState({
      modalOpen: false,
    });
    document.location.reload(true);
  }

  removeCard() {
    Profiles.update(this.props.user._id, { $unset: { [`courses.${this.props.course}`]: '' } },
        (error) => (error ?
            Alert.error(`Update failed: ${error.message}`, {
              effect: 'slide',
            }) :
            Alert.success('Update succeeded', {
              effect: 'slide',
            })));
    document.location.reload(true);
  }

  updateState(e, { name, value }) {
    this.setState({ [name]: value });
  }

  handleOpen = () => this.setState({ modalOpen: true });

  handleWorker() {
    if (this.state.initialStatus === undefined && this.state.workerBee) {
      this.setState({ workerBee: undefined });
    } else {
      this.setState({ workerBee: !this.state.workerBee, royalBee: false });
    }
  }

  handleRoyal() {
    if (this.state.initialStatus === undefined && this.state.royalBee) {
      this.setState({ royalBee: undefined });
    } else {
      this.setState({ royalBee: !this.state.royalBee, workerBee: false });
    }
  }

  renderCard() {
    const isUndefined = this.state.data === undefined;
    const { description } = this.state;
    const status = this.state.initialStatus;
    if (isUndefined) {
      console.log(`Course ${this.props.course} is undefined`);
      return '';
    }

    return (
        <div>
          <Modal trigger={
            <Item key={1} style={{
              float: 'left',
              width: '150px',
              position: 'relative',
              margin: '14px' }}>
              <Card centered>
                <Card.Content>
                  <Card.Header>{this.state.course}</Card.Header>
                  {this.state.initialStatus !== undefined ? (
                      <Container fluid>
                        {this.state.royalBee ? (
                            <Card.Meta>Royal Bee</Card.Meta>
                        ) : (
                            <Card.Meta>Worker Bee</Card.Meta>
                        )}
                      </Container>
                  ) : ''}
                </Card.Content>
              </Card>
            </Item>
          } onUnmount={this.refreshPage}>
            <Modal.Header>
              {this.state.course}
              <Button.Group id='royalToggles' floated={'right'} size={'small'}>
                <Button toggle basic active={this.state.workerBee} onClick={this.handleWorker}>
                  Worker
                </Button>
                <Button toggle basic active={this.state.royalBee} onClick={this.handleRoyal}>
                  Royal
                </Button>
              </Button.Group>
            </Modal.Header>
            <Modal.Content>{this.state.submittedDescription}</Modal.Content>
            {this.props.admin ? (
                <Modal.Content>
                  <Modal trigger={<Button basic onClick={this.handleOpen}>Edit</Button>} open={this.state.modalOpen}>
                    <Modal.Header>Editing {this.state.course}</Modal.Header>
                    <Modal.Content>
                      <Container>
                        <Form onSubmit={this.editCourse}>
                          <Form.TextArea label={'Description'} name={'description'}
                                         value={description} onChange={this.updateState}/>
                          <Form.Button content={'Submit'} basic color={'green'}/>
                        </Form>
                      </Container>
                    </Modal.Content>
                  </Modal>
                  <Button basic color={'red'} onClick={this.deleteCourse}>
                    Delete
                  </Button>
                </Modal.Content>
            ) : (
                <Modal.Content>
                  {status !== undefined ?
                      (<Button basic color={'red'} onClick={this.removeCard}>
                        Delete
                      </Button>) : ('')}
                </Modal.Content>
            )}
          </Modal>
        </div>
    );
  }

  render() {
    if (!this.state.ready) {
      this.initializeState();
      this.setState({
        ready: true,
      });
    }
    return (
        this.renderCard()
    );
  }
}

CourseCard.propTypes = {
  course: PropTypes.string.isRequired,
  admin: PropTypes.bool.isRequired,
  ready: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
};

export default withTracker(() => {
  // Get access to Stuff documents.
  const subscription = Meteor.subscribe('Profile');
  return {
    user: Profiles.findOne({ owner: Meteor.user().username }),
    ready: (subscription.ready()),
  };
})(CourseCard);
