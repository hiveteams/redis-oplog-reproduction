import { Meteor } from 'meteor/meteor';
import { Users } from '../users';
import { Workspaces } from '../workspaces';
import { Random } from 'meteor/random'

Meteor.startup(() => {
  const workspace = Workspaces.findOne();
  // make sure a workspace exists
  if (!workspace) {
    Workspaces.insert({ _id: Random.id(), members: [] });
  }
});

// Publish all workspace users
Meteor.publish('allUsers', function allUsersPub(enableRedisOplog) {
  this.autorun(() => {
    // listen to changes in the workspace document
    const workspace = Workspaces.find().fetch()[0];

    // optionally disable redis oplog
    const options = {};
    if (!enableRedisOplog) {
      options.disableOplog = true;
    }

    // options.skip = 1;
    // options.limit = 1;
    // options.sort = { createdAt: 1 };

    // return users cursor
    return Users.find({
      _id: { $in: workspace.members }
    }, options);
  });
});