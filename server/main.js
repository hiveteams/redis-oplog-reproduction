import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random'
import { Views } from '../views';
import { Projects, resetProjects } from '../projects';

// create 5 view and projects on startup
Meteor.startup(() => {
  resetProjects.call();
});

// Publish all views in an autorun
Meteor.publish('views', function viewsPub(enableRedisOplog) {
  this.autorun(() => {
    // optionally disable redis oplog
    const options = {};
    if (!enableRedisOplog) {
      options.disableOplog = true;
    }

    console.log('server autorun');
    const viewCursor = Views.find({}, options);
    const projectIds = viewCursor.map(v => v.projectId);
    const projectsCursor = Projects.find({ _id: { $in: projectIds } }, options);

    return [
      viewCursor,
      projectsCursor,
    ];
  });
});