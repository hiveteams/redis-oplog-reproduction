import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Users } from '../users';
import { Workspaces, addMember, resetWorkspace } from '../workspaces';
import './main.html';

Template.main.onCreated(function mainOnCreated() {
  // boolean for whether or not our sub is using redis oplog
  this.useRedisOplog = new ReactiveVar(true);

  this.autorun(() => {
    // subscribe to all users
    this.subscribe('allUsers', this.useRedisOplog.get());
  });
});

Template.main.helpers({
  users() {
    return Users.find();
  },
  userCount() {
    return Users.find().count();
  },
  useRedisOplog() {
    return Template.instance().useRedisOplog.get();
  }
});

Template.main.events({
  'click .js-add-member'(event) {
    event.preventDefault();
    for (var i = 0; i < 100; i++) {
      addMember.call();
    }
  },
  'click .js-reset-workspace'(event) {
    event.preventDefault();
    resetWorkspace.call();
  },
  'click .js-redis-oplog-toggle'(event, instance) {
    const useRedisOplog = instance.useRedisOplog.get()
    instance.useRedisOplog.set(!useRedisOplog);
  }
});

