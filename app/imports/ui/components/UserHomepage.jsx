import React from 'react';
import { Meteor } from 'meteor/meteor';
import dateFns from 'date-fns';
import { Grid, Container, Divider, Icon, Card, Image, Header, Loader, } from 'semantic-ui-react';
import { Sessions } from '/imports/api/session/session';
import { Profiles } from '/imports/api/profile/profile';
import SessionCard from '/imports/ui/components/SessionCard';
import UpcomingSessionList from '/imports/ui/components/UpcomingSessionList';
import { withTracker } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

const _ = require('underscore');

const currentTime = dateFns.addDays(new Date(), 0);

/** Renders a table containing all of the Session documents. Use <SessionCard> to render each row. */
class UserHomepage extends React.Component {

  constructor(props) {
    super(props);
    this.currentDate = new Date();
    this.handleLeave = this.handleLeave.bind(this);
    this.handleJoin = this.handleJoin.bind(this);
    this.isJoined = this.isJoined.bind(this);
  }

  handleLeave(sessionId) {
    const profileId = Profiles.findOne({ owner: this.props.currentUsername })._id;
    Profiles.update(
        profileId,
        { $pull: { joinedSessions: sessionId } },
        error => (error ? Bert.alert({ type: 'danger', message: `Leave failed: ${error.message}` }) :
            Bert.alert({ type: 'success', message: 'Leave succeeded' })),
    );
    Sessions.update(
        sessionId,
        { $pull: { attendees: this.props.currentUsername } },
        error => (error ? Bert.alert({ type: 'danger', message: `Leave failed: ${error.message}` }) :
            Bert.alert({ type: 'success', message: 'Leave succeeded' })),
    );
    Sessions.update(
        sessionId,
        {
          $unset: {
            [`hasResponded.${this.props.currentUserId}`]: false,
            [`honeyDistribution.${this.props.currentUserId}`]: 0,
          },
        },
        error => (error ? Bert.alert({ type: 'danger', message: `Leave failed: ${error.message}` }) :
            Bert.alert({ type: 'success', message: 'Leave succeeded' })),
    );
  }

  handleJoin(sessionId) {
    const profileId = Profiles.findOne({ owner: this.props.currentUsername })._id;
    Profiles.update(
        profileId,
        { $addToSet: { joinedSessions: sessionId } },
        error => (error ? Bert.alert({ type: 'danger', message: `Join failed: ${error.message}` }) :
            Bert.alert({ type: 'success', message: 'Join succeeded' })),
    );
    Sessions.update(
        sessionId,
        { $addToSet: { attendees: this.props.currentUsername } },
        error => (error ? Bert.alert({ type: 'danger', message: `Join failed: ${error.message}` }) :
            Bert.alert({ type: 'success', message: 'Join succeeded' })),
    );
    Sessions.update(
        sessionId,
        {
          $set: {
            [`hasResponded.${this.props.currentUserId}`]: false,
            [`honeyDistribution.${this.props.currentUserId}`]: 0,
          },
        },
        error => (error ? Bert.alert({ type: 'danger', message: `Join failed: ${error.message}` }) :
            Bert.alert({ type: 'success', message: 'Join succeeded' })),
    );
  }

  isJoined(sessionId) {
    const joinedSessions = Profiles.findOne({ owner: this.props.currentUsername }).joinedSessions;
    return _.some(joinedSessions, session => session === sessionId);
  }

  render() {
    return (this.props.ready) ? this.renderPage() :
        <Container className="page-container">
          <Loader active>Getting data</Loader>
        </Container>;
  }

  renderPage() {
    const firstName = this.props.profile.firstName;
    const lastName = this.props.profile.lastName;
    const image = this.props.profile.image;
    const level = this.props.profile.level;
    const exp = this.props.profile.exp;
    const completedSessionCards = _.map(this.props.completedSessions, session => {
      return <SessionCard key={session._id} session={session} isCompleted={true} isFluid={false}/>;
    });

    const containerPadding = {
      paddingTop: '160px',
      paddingBottom: '70px',
    };
    const noCompletedSessionsStyle = {};
    if (completedSessionCards.length !== 0) {
      noCompletedSessionsStyle.display = 'none';
    }

    return (
        <Container className="user-homepage" style={containerPadding}>

          <Container textAlign='center' style={{ marginBottom: 50, padding: 20, backgroundColor: 'lightyellow' }}>
            <Header as='h2'>
              <Image circular src={image}/> Welcome Back, {firstName} {lastName}!
            </Header>
          </Container>

          {/** 2 column grid */}
          <Grid>
            {/** *** COMPLETED SESSIONS **** */}
            <Grid.Row>
              <Grid columns='equal' verticalAlign='middle'>
                <Grid.Column>
                  <Header as='h2'>
                    <Icon name='check circle outline'/>
                    <Header.Content>
                      Completed Sessions
                      <Header.Subheader>
                        Collect and distribute honey <br/>
                        from sessions you participated in.
                      </Header.Subheader>
                    </Header.Content>
                  </Header>
                </Grid.Column>
              </Grid>
            </Grid.Row>
            <Grid.Row>
              {/** Session Cards */}
              <Header as="h3" style={noCompletedSessionsStyle}>You have no completed sessions</Header>
              <Card.Group style={{ marginLeft: '3em' }}>
                {completedSessionCards}
              </Card.Group>
            </Grid.Row>
            <Divider/>
            {/** *** UPCOMING SESSIONS **** */}
            <Grid.Row>
              <Grid columns='equal' verticalAlign='middle'>
                <Grid.Column>
                  <Header as='h2'>
                    <Icon name='clock outline'/>
                    <Header.Content>
                      Upcoming Sessions
                      <Header.Subheader>
                        Here are sessions you plan on attending.
                      </Header.Subheader>
                    </Header.Content>
                  </Header>
                </Grid.Column>
              </Grid>
            </Grid.Row>
            <Grid.Row>
              {/** Session Cards */}
              <UpcomingSessionList
                  sessions={this.props.joinedSessions}
                  selectedDate={this.currentDate}
                  handleLeave={this.handleLeave}
                  handleJoin={this.handleJoin}
                  isJoined={this.isJoined}
              />
            </Grid.Row>
          </Grid>
        </Container>
    );
  }
}

UserHomepage.propTypes = {
  currentUser: PropTypes.string,
  currentUsername: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  sessions: PropTypes.array.isRequired,
  profile: PropTypes.object.isRequired,
  completedSessions: PropTypes.array,
  joinedSessions: PropTypes.array,
  ready: PropTypes.bool.isRequired,
};

const UserHomepageContainer = withTracker(() => {
  const subscription = Meteor.subscribe('Profiles');
  const subscription2 = Meteor.subscribe('Sessions');
  const subscription3 = Meteor.subscribe('AccountIds');
  let currentUser = '';
  let completedSessions = [];
  let joinedSessions = [];
  let profile = {};
  if (subscription.ready() && subscription2.ready() && subscription3.ready() && Meteor.user()) {
    currentUser = Meteor.user().username;
    profile = Profiles.findOne({ owner: currentUser });

    const joinedSessionIds = profile.joinedSessions;

    completedSessions = Sessions.find({
      _id: { $in: joinedSessionIds },
      endTime: { $lte: currentTime },
    }).fetch();

    joinedSessions = Sessions.find({
      _id: { $in: joinedSessionIds },
    }).fetch();
  }

  return {
    currentUser: currentUser,
    currentUserId: Meteor.user() ? Meteor.user()._id : '',
    currentUsername: Meteor.user() ? Meteor.user().username : '',
    sessions: Sessions.find({}).fetch(),
    profile: profile,
    completedSessions: completedSessions,
    joinedSessions: joinedSessions,
    ready: (subscription.ready() && subscription2.ready() && subscription3.ready()),
  };
})(UserHomepage);

export default withRouter(UserHomepageContainer);
