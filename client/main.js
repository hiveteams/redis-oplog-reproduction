import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Views } from '../views';
import { Projects, createNewProject, resetProjects } from '../projects';
import './main.html';

Template.main.onCreated(function mainOnCreated() {
  // boolean for whether or not our sub is using redis oplog
  this.useRedisOplog = new ReactiveVar(true);

  this.autorun(() => {
    // subscribe to all views
    this.subscribe('views', this.useRedisOplog.get());
  });
});

Template.main.helpers({
  projects() {
    return Projects.find();
  },
  projectsCount() {
    return Projects.find().count();
  },
  views() {
    return Views.find();
  },
  viewsCount() {
    return Views.find().count();
  },
  useRedisOplog() {
    return Template.instance().useRedisOplog.get();
  }
});

Template.main.events({
  'click .js-redis-oplog-toggle'(event, instance) {
    const useRedisOplog = instance.useRedisOplog.get()
    instance.useRedisOplog.set(!useRedisOplog);
  },
  'click .js-new-project'() {
    createNewProject.call();
  },
  'click .js-reset'() {
    resetProjects.call();
  },
});

