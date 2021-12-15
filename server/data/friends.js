const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const { checkObjId, checkString } = require('../inputChecks');
const userData = require('./users');
const users = mongoCollections.users;
const bluebird = require('bluebird');
const redis = require('redis');
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

// get friend - should we also have by Id?
async function getFriendByName(username, friendName) {
  // check unames
  checkString(username, 'Username', false);
  checkString(friendName, 'Friend Name', false);

  const user = await userData.getUserByName(username);
  const friend = await userData.getUserByName(friendName);

  // check if friend in friend array
  const inFriends = user.friends.some((e) => e.equals(friend._id));
  if (!inFriends) {
    throw `User ${username} has no friend ${friendName}`;
  }

  return friend;
}

// get all friends
async function getAllFriends(username) {
  // check username
  checkString(username, 'Username', false);

  const user = await userData.getUserByName(username);

  // grab all friends
  const userCollection = await users();
  let friends = await userCollection.find({ _id: { $in: user.friends } });
  friends = await friends.toArray();

  // will simply be empty array if none
  return friends;
}

// pretty much same as getfriendbyName, see those comments, addition of pending field: sent vs received
async function getPendingFriendByName(username, friendName) {
  checkString(username, 'Username', false);
  checkString(friendName, 'Friend Name', false);
  let status;
  const user = await userData.getUserByName(username);
  const pending = await userData.getUserByName(friendName);
  const inPending = user.pending_friends.findIndex((e) =>
    e.pendingId.equals(pending._id)
  );
  if (inPending === -1) {
    throw `User ${username} has no pending friend ${friendName}`;
  }
  status = user.pending_friends[inPending].status;
  pending.pending_status = status;
  return friend;
}

// see getallfriends for details, will return 2d arr of [[friend info, pending status]]
async function getAllPending(username) {
  checkString(username, 'Username', false);
  const user = await userData.getUserByName(username);
  const userCollection = await users();
  const fids = user.pending_friends.map((e) => e.pendingId);
  let friends = await userCollection.find({ _id: { $in: fids } });
  friends = await friends.toArray();
  // put friends together w/ pending status, this seems like there's probably a better way to do it
  for (const i in friends) {
    let element = user.pending_friends.find((e) =>
      e.pendingId.equals(friends[i]._id)
    );
    friends[i].pending_status = element.status;
  }
  return friends;
}

// add friend by name -> add to pending array, requesting user is passed as uname
// pending array will fn as obj array in form [ {pendingId: uname, status: 'sent'}, {pendingId: uname, status: 'received'}] differentiates
// whether request needs approval from given user
// could also refactor this as instead of single pending array, one sent array and one received array
async function addFriend(requesterName, requesteeName) {
  // check uname
  checkString(requesterName, 'Requester Name', false);
  checkString(requesteeName, 'Requesteee Name', false);

  // check if both exist
  let requester = await userData.getUserByName(requesterName);
  let requestee = await userData.getUserByName(requesteeName);

  // check if already in friends, throwing for now
  const inFriends = requester.friends.some((e) => e.equals(requestee._id));
  if (inFriends) {
    throw `User ${requesterName} and ${requesteeName} are already friends`;
  }

  // check if friend already in pending
  const inPending = requester.pending_friends.findIndex((e) =>
    e.pendingId.equals(requestee._id)
  );
  // if yes, check if request sent or received, if received then accept friend
  // else throw saying already requested? for now
  if (inPending !== -1) {
    if (requester.pending_friends[inPending].status === 'received') {
      let res = acceptFriend(requesterName, requesteeName);
      return res;
    } else {
      throw `User ${requesterName} has already requested to friend User ${requesteeName}`;
    }
  }

  const userCollection = await users();

  // update pending arrays with relevant info, storing id of friend rather than name
  const requesterUpdate = await userCollection.updateOne(
    { _id: requester._id },
    {
      $addToSet: {
        pending_friends: { pendingId: requestee._id, status: 'sent' },
      },
    }
  );
  if (!requesterUpdate.matchedCount && !requesterUpdate.modifiedCount) {
    throw `Unable to add User ${requesteeName} to pending friends of User ${requesterName}`;
  }
  // update redis cache of requester
  requester.pending_friends.push({ pendingId: requestee._id, status: 'sent' });
  await client.hsetAsync(
    'idCache',
    requester._id.toString(),
    JSON.stringify(requester)
  );

  const requesteeUpdate = await userCollection.updateOne(
    { _id: requestee._id },
    {
      $addToSet: {
        pending_friends: { pendingId: requester._id, status: 'received' },
      },
    }
  );
  if (!requesteeUpdate.matchedCount && !requesteeUpdate.modifiedCount) {
    throw `Unable to add User ${requesterName} to pending friends of User ${requesteeName}`;
  }
  // update redis cache of requestee
  requestee.pending_friends.push({
    pendingId: requester._id,
    status: 'received',
  });
  await client.hsetAsync(
    'idCache',
    requestee._id.toString(),
    JSON.stringify(requestee)
  );

  // return updated requester
  const res = await userData.getUserById(requester._id.toString());
  return res;
}

// accept friend -> must be in pending array (as received), remove from pending of both
async function acceptFriend(username, pendingName) {
  checkString(username, 'Username', false);
  checkString(pendingName, 'Pending Friend Name', false);

  // check exist
  const user = await userData.getUserByName(username);
  const pending = await userData.getUserByName(pendingName);

  // check if already in friends, throwing for now
  const inFriends = user.friends.some((e) => e.equals(pending._id));
  if (inFriends) {
    throw `User ${username} and ${pendingName} are already friends`;
  }

  const inPending = user.pending_friends.some(
    (e) => e.pendingId.equals(pending._id) && e.status === 'received'
  );

  if (!inPending) {
    throw `Unable to accept User ${pendingName} as friend, User ${username} has not received a request from them`;
  }

  const userCollection = await users();

  // update friends and pending of both, this seems a little janky
  const userUpdate = await userCollection.updateOne(
    { _id: user._id },
    {
      $pull: { pending_friends: { pendingId: pending._id } },
      $addToSet: { friends: pending._id },
    }
  );
  if (!userUpdate.matchedCount && !userUpdate.modifiedCount) {
    throw `Unable to add User ${pendingName} to friends of User ${username}`;
  }
  // update redis cache of user
  user.friends.push(pending._id);
  user.pending_friends = user.pending_friends.filter(
    (e) => !e.pendingId.equals(pending._id)
  );
  await client.hsetAsync('idCache', user._id.toString(), JSON.stringify(user));

  const pendingUpdate = await userCollection.updateOne(
    { _id: pending._id },
    {
      $pull: { pending_friends: { pendingId: user._id } },
      $addToSet: { friends: user._id },
    }
  );
  if (!pendingUpdate.matchedCount && !pendingUpdate.modifiedCount) {
    throw `Unable to add User ${username} to friends of User ${pendingName}`;
  }
  // update redis cache of pending
  pending.friends.push(user._id);
  pending.pending_friends = pending.pending_friends.filter(
    (e) => !e.pendingId.equals(user._id)
  );
  await client.hsetAsync(
    'idCache',
    pending._id.toString(),
    JSON.stringify(pending)
  );

  let res = await userData.getUserById(user._id.toString());
  return res;
}

// remove pending friend (either sent or received)
async function removePending(username, pendingName) {
  checkString(username, 'Username', false);
  checkString(pendingName, 'Pending Friend Name', false);

  let user = await userData.getUserByName(username);
  let pending = await userData.getUserByName(pendingName);
  const inPending = user.pending_friends.some((e) =>
    e.pendingId.equals(pending._id)
  );

  if (!inPending) {
    throw `Unable to remove User ${pendingName} from pending as User ${username} does not have them in their pending list`;
  }

  const userCollection = await users();

  const userUpdate = await userCollection.updateOne(
    { _id: user._id },
    { $pull: { pending_friends: { pendingId: pending._id } } }
  );

  if (!userUpdate.matchedCount && !userUpdate.modifiedCount) {
    throw `Unable to remove User ${pendingName} from pending of User ${username}`;
  }
  // update user redis cache
  user.pending_friends = user.pending_friends.filter(
    (e) => !e.pendingId.equals(pending._id)
  );
  await client.hsetAsync('idCache', user._id.toString(), JSON.stringify(user));

  const pendingUpdate = await userCollection.updateOne(
    { _id: pending._id },
    { $pull: { pending_friends: { pendingId: user._id } } }
  );
  if (!pendingUpdate.matchedCount && !pendingUpdate.modifiedCount) {
    throw `Unable to remove User ${username} from pending of User ${pendingName}`;
  }
  // update pending cache
  pending.pending_friends = pending.pending_friends.filter(
    (e) => !e.pendingId.equals(user._id)
  );
  await client.hsetAsync(
    'idCache',
    pending._id.toString(),
    JSON.stringify(pending)
  );

  let res = await userData.getUserById(user._id.toString());

  return res;
}

// remove friend
async function removeFriend(username, friendName) {
  checkString(username, 'Username', false);
  checkString(friendName, 'Friend Name', false);

  let user = await userData.getUserByName(username);
  let friend = await userData.getUserByName(friendName);

  let inFriends = user.friends.some((e) => e.equals(friend._id));
  if (!inFriends) {
    throw `Cannot remove User ${friendName} from User ${username}'s friends as they are not friends`;
  }

  const userCollection = await users();

  const userUpdate = await userCollection.updateOne(
    { _id: user._id },
    { $pull: { friends: friend._id } }
  );
  if (!userUpdate.matchedCount && !userUpdate.modifiedCount) {
    throw `Unable to remove User ${friendName} from friends of User ${username}`;
  }
  // update user cache
  user.friends = user.friends.filter((e) => !e.equals(friend._id));
  await client.hsetAsync('idCache', user._id.toString(), JSON.stringify(user));

  const friendUpdate = await userCollection.updateOne(
    { _id: friend._id },
    { $pull: { friends: user._id } }
  );
  if (!friendUpdate.matchedCount && !friendUpdate.modifiedCount) {
    throw `Unable to remove User ${username} from friends of User ${friendName}`;
  }
  // update friend cache
  friend.friends = friend.friends.filter((e) => !e.equals(user._id));
  await client.hsetAsync(
    'idCache',
    friend._id.toString(),
    JSON.stringify(friend)
  );

  let res = await userData.getUserById(user._id.toString());
  // return requester
  return res;
}

// invite friend to game?
async function inviteFriend(userId, friendId) {}

module.exports = {
  getFriendByName,
  getAllFriends,
  getPendingFriendByName,
  getAllPending,
  addFriend,
  acceptFriend,
  removeFriend,
  removePending,
};
