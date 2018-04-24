import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { Views } from './views';

export const Projects = new Mongo.Collection('projects');

export const createNewProject = new ValidatedMethod({
  name: 'project.create',
  validate: null,
  run() {
    if (Meteor.isServer) {
      const projectId = Projects.insert({ _id: Random.id() });
      Views.insert({
        _id: Random.id(),
        projectId
      });
    }
  },
});

export const resetProjects = new ValidatedMethod({
  name: 'project.reset',
  validate: null,
  run() {
    Views.remove({});
    Projects.remove({});

    // insert 5 projects with their associated views
    for(var i = 0; i < 5; i++) {
      const projectId = Projects.insert({
        _id: Random.id(),
      })
      Views.insert({
        _id: Random.id(),
        projectId
      });
    }
  },
});