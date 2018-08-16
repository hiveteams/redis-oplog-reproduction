import { Mongo } from 'meteor/mongo';

export const Users = new Mongo.Collection('users');

console.log('test code change');
