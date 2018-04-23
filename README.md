# Redis Oplog + Server side autorun issue

## Starting server and causing the issue
1. Run `meteor npm i`
2. Start the server with `npm start`
3. Load localhost:3000
4. Click to toggle the document's deleted state

You'll receive the error every time the item is removed from matching the publication.


## Context
If you subscribe to 2 different publications that return the same document, where 1 publication uses a server side autorun from [peerlibrary:server-autorun](https://github.com/peerlibrary/meteor-server-autorun) or [peerlibrary:reactive-publish](https://github.com/peerlibrary/meteor-reactive-publish) which does multiple `find`s of the same document, you'll receive an error when the item is removed from the publication:

```
I20180421-15:12:21.802(-4)? Exception in callback of async function: Error: Removed nonexistent document dEKXyFJdbn9DYA7Sf
I20180421-15:12:21.803(-4)?     at SessionCollectionView.removed (packages/ddp-server/livedata_server.js:202:17)
I20180421-15:12:21.803(-4)?     at Session.removed (packages/ddp-server/livedata_server.js:394:10)
I20180421-15:12:21.803(-4)?     at Subscription.removed (packages/ddp-server/livedata_server.js:1292:19)
I20180421-15:12:21.803(-4)?     at Object.removed (packages/mongo/collection.js:368:13)
I20180421-15:12:21.803(-4)?     at Object.removed (packages/cultofcoders:redis-oplog/lib/mongo/extendObserveChanges.js:100:26)
I20180421-15:12:21.803(-4)?     at currentObservers.forEach.observer (packages/cultofcoders:redis-oplog/lib/cache/PublicationEntry.js:141:38)
I20180421-15:12:21.804(-4)?     at Array.forEach (<anonymous>)
I20180421-15:12:21.804(-4)?     at PublicationEntry.send (packages/cultofcoders:redis-oplog/lib/cache/PublicationEntry.js:140:34)
I20180421-15:12:21.804(-4)?     at ObservableCollection.send (packages/cultofcoders:redis-oplog/lib/cache/ObservableCollection.js:163:23)
I20180421-15:12:21.804(-4)?     at ObservableCollection.remove (packages/cultofcoders:redis-oplog/lib/cache/ObservableCollection.js:253:18)
I20180421-15:12:21.804(-4)?     at handleUpdate (packages/cultofcoders:redis-oplog/lib/processors/direct.js:51:34)
I20180421-15:12:21.804(-4)?     at packages/cultofcoders:redis-oplog/lib/processors/direct.js:12:13
I20180421-15:12:21.805(-4)?     at RedisSubscriber.process (packages/cultofcoders:redis-oplog/lib/redis/RedisSubscriber.js:51:24)
I20180421-15:12:21.805(-4)?     at subscribers.forEach.redisSubscriber (packages/cultofcoders:redis-oplog/lib/redis/RedisSubscriptionManager.js:143:33)
I20180421-15:12:21.805(-4)?     at Array.forEach (<anonymous>)
I20180421-15:12:21.805(-4)?     at RedisSubscriptionManager.process (packages/cultofcoders:redis-oplog/lib/redis/RedisSubscriptionManager.js:142:25)
I20180421-15:12:21.805(-4)?     at events.forEach.event (packages/cultofcoders:redis-oplog/lib/mongo/lib/dispatchers.js:28:42)
I20180421-15:12:21.805(-4)?     at Array.forEach (<anonymous>)
I20180421-15:12:21.806(-4)?     at RedisSubscriptionManager.queue.queueTask.Meteor.bindEnvironment (packages/cultofcoders:redis-oplog/lib/mongo/lib/dispatchers.js:22:22)
I20180421-15:12:21.806(-4)?     at runWithEnvironment (packages/meteor.js:1238:24)
I20180421-15:12:21.806(-4)?     at Object.task (packages/meteor.js:1251:14)
I20180421-15:12:21.806(-4)?     at Meteor._SynchronousQueue.SQp._run (packages/meteor.js:869:16)
```

The code to cause this is pretty straightforward:

```
Meteor.publish('allItems', function allItemsPublish() {
  return Items.find({ deleted: false });
});

Meteor.publish('singleItem', function singleItemPublish() {
  const pub = this;

  pub.autorun(() => {
    // The `findOne` below causes the error to throw.
    const item = Items.findOne(defaultItem._id);
    // Would usually run some logic on `item` here using collection helpers
    // and use that to decide what else or what fields we'd want to publish.
    return Items.find({ _id: defaultItem._id, deleted: false });
  });
});
```

## Why this matters
This example is contrived, but our codebase has tons of logic that uses server side autoruns like this to do things like:

- Use collection helpers to decide what fields will/will not show for a given user (permissions type stuff)
- Use document data to decide if we want to publish additional cursors from other collections (list views vs detail views)# redis-oplog-reproduction
