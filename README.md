# Redis Oplog + Server side autorun issue

## Steps to reproduce
1. Run `meteor npm i`
2. Start the server with `npm start`
3. Load localhost:3000
4. Make sure redis oplog is enabled
5. Click to add 100 users (might have to do this more than once)
6. Notice that the users are not cleanly added, several 'removed' events are sent through ddp.
7. Toggle to disable redis oplog
8. Click to add 100 users again
9. Notice that users are cleanly added, no removed events are sent through ddp.

## Workspace

```json
{
  "_id": "Mongo id",
  "members": "List of user ids"
}
```

## User
```json
{
  "_id": "Mongo id"
}
```

## The Code

Basically just a publish where we depend on the results of the workspaces query to return the final set of users:

```javascript
Meteor.publish('allUsers', function allUsersPub(enableRedisOplog) {
  this.autorun(() => {
    // listen to changes in the workspace document
    const workspace = Workspaces.find().fetch()[0];

    // optionally disable redis oplog
    const options = {};
    if (!enableRedisOplog) {
      options.disableOplog = true;
    }

    // return users cursor
    return Users.find({
      _id: { $in: workspace.members }
    }, options);
  });
});
```