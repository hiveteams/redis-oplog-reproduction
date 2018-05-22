# Redis Oplog + Server side autorun issue

## Steps to reproduce

To see the bug
1. Run `meteor npm i`
2. Start the server with `npm start`
3. Load localhost:3000
4. Make sure redis oplog is enabled
5. Notice log lines

```
I20180522-16:44:10.208(-4)? workspaces canUseOplog 1 false
I20180522-16:44:10.209(-4)? [ 'changed', 'removed', 'addedBefore', 'movedBefore' ]
I20180522-16:44:10.216(-4)? users canUseOplog 1 true
I20180522-16:44:10.220(-4)? users canUseOplog 1 false
```

Now without redis, comment out cultofcoders:redis-oplog and disable-oplog in packages:

Repeat above steps and notice that the returned users cursor does use oplog

```
I20180522-16:43:56.045(-4)? workspaces canUseOplog 1 false
I20180522-16:43:56.045(-4)? [ 'changed', 'removed', 'addedBefore', 'movedBefore' ]
I20180522-16:43:56.048(-4)? users canUseOplog 1 true
```

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