const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const { checkObjId } = require('../inputChecks');
const userData = require('./users');
const users = mongoCollections.users;

// get friend
async function getFriendById(userId, friendId){
    // check Ids, assuming input as string versions of ids
    checkObjId(userId, "User ID");
    checkObjId(friendId, "Friend ID");

    // ids as actual objId, unsure if need uid
    let uid = ObjectId(userId);
    let fid = ObjectId(friendId);

    const user = await userData.getUserById(userId);
    
    // check if friend in friend array
    const inFriends = user.friends.some(e => e.equals(fid));
    if (!inFriends){
        throw  `User with ID ${userId} has no friend with ID ${friendId}`;
    }

    // get friend obj by doing getuserbyid
    const friend = await userData.getUserById(friendId);

    return friend;
}

// get all friends
async function getAllFriends(userId){
    // check Ids, assuming input as string versions of id
    checkObjId(userId, "User ID");

    // ids as actual objId, dont think needed
    let uid = ObjectId(userId);

    const user = await userData.getUserById(userId);

    // grab all friends
    const userCollection = await users();
    let friends = await userCollection.find({_id: {$in : user.friends}});
    friends = await friends.toArray();

    // will simply be empty array if none
    return friends;
}

// pretty much same as getfriendbyid, see those comments, addition of pending field: sent vs received
async function getPendingFriendById(userId, friendId){
    checkObjId(userId, "User ID");
    checkObjId(friendId, "Friend ID");
    let fid = ObjectId(friendId);
    let status;
    const user = await userData.getUserById(userId);
    const inPending = user.pending_friends.findIndex( e => e.pendingId.equals(fid))
    status = user.pending_friends[inPending].status;
    if (inPending === -1){
        throw  `User with ID ${userId} has no pending friend with ID ${friendId}`;
    }
    const friend = await userData.getUserById(friendId);
    friend.pending_status = status;
    return friend;    
}

// see getallfriends for details, will return 2d arr of [[friend info, pending status]]
async function getAllPending(userId) {
    checkObjId(userId, "User ID");
    const user = await userData.getUserById(userId);
    const userCollection = await users();
    const fids = user.pending_friends.map(e => e.pendingId)
    let friends = await userCollection.find({_id: {$in : fids}});
    friends = await friends.toArray();
    // put friends together w/ pending status, this seems like there's probably a better way to do it
    for (const i in friends){
        let element = user.pending_friends.find((e) => e.pendingId.equals(friends[i]._id));
        friends[i].pending_status = element.status;
    }
    return friends;
}

// add friend by id -> add to pending array
// pending array will fn as obj array in form [ {pendingId: _id, status: 'sent'}, {pendingId: _id, status: 'received'}] differentiates
// whether request needs approval from given user 
// could also refactor this as instead of single pending array, one sent array and one received array
async function addFriend(requesterId, requesteeId){
    // check ids
    checkObjId(requesterId, 'Requester Id');
    checkObjId(requesteeId, "Requestee Id");

    let parsedRequester = ObjectId(requesterId);
    let parsedRequestee = ObjectId(requesteeId);

    // check if both exist
    let requester = await userData.getUserById(requesterId);
    await userData.getUserById(requesteeId);

    // check if already in friends, throwing for now
    const inFriends = requester.friends.some((e) => e.equals(parsedRequestee));
    if (inFriends){
        throw `User ${requesterId} and ${requesteeId} are already friends`;
    }

    // check if friend already in pending
    const inPending = requester.pending_friends.findIndex((e) => e.pendingId.equals(parsedRequestee));
    // if yes, check if request sent or received, if received then accept friend
    // else throw saying already requested? for now
    if (inPending !== -1){
        if (requester.pending_friends[inPending].status === 'received'){
            acceptFriend(requesterId, requesteeId);
            return;
        }else {
            throw `User ${requesterId} has already requested to friend User ${requesteeId}`;
        }
    }

    const userCollection = await users();

    // update pending arrays with relevant info
    const requesterUpdate = await userCollection.updateOne(
        {_id: parsedRequester},
        { $addToSet: { pending_friends: { pendingId: parsedRequestee, status: 'sent'}}}
    )
    if (!requesterUpdate.matchedCount && !requesterUpdate.modifiedCount){
        throw `Unable to add User ${requesteeId} to pending friends of User ${requesterId}`;
    }

    const requesteeUpdate = await userCollection.updateOne(
        {_id: parsedRequestee},
        { $addToSet: { pending_friends: {pendingId: parsedRequester, status: 'received'}}}
    )
    if (!requesteeUpdate.matchedCount && !requesteeUpdate.modifiedCount){
        throw `Unable to add User ${requesterId} to pending friends of User ${requesteeId}`;
    }

    // return updated requester
    const res = await userData.getUserById(requesterId);
    return res;
}

// accept friend -> must be in pending array (as received), remove from pending of both
async function acceptFriend(userId, pendingId){
    checkObjId(userId, "User ID");
    checkObjId(pendingId, "Pending Friend ID");

    const uid = ObjectId(userId);
    const pid = ObjectId(pendingId);

    // check exist
    const user = await userData.getUserById(userId);
    await userData.getUserById(pendingId);

    // check if already in friends, throwing for now
    const inFriends = user.friends.some((e) => e.equals(pid));
    if (inFriends){
        throw `User ${userId} and ${pendingId} are already friends`;
    }

    const inPending = user.pending_friends.some((e) => e.pendingId.equals(pid) && e.status === 'received');
    
    if (!inPending){
        throw `Unable to accept User ${pendingId} as friend, User ${userId} has not received a request from them`;
    }

    const userCollection = await users();
    
    // update friends and pending of both, this seems a little janky
    const userUpdate = await userCollection.updateOne(
        {_id: uid},
        { $pull: {pending_friends: {pendingId : pid }},
         $addToSet: { friends: pid}}
    );
    if (!userUpdate.matchedCount && !userUpdate.modifiedCount){
        throw `Unable to add User ${pendingId} to friends of User ${userId}`;
    }

    const pendingUpdate = await userCollection.updateOne(
        {_id: pid},
        { $pull: {pending_friends: {pendingId: uid}},
          $addToSet: { friends: uid}}
    );
    if (!pendingUpdate.matchedCount && !pendingUpdate.modifiedCount){
        throw `Unable to add User ${userId} to friends of User ${pendingId}`;
    }

    let res = await userData.getUserById(userId);
    return res;
}

// remove pending friend (either sent or received)
async function removePending(userId, pendingId){
    checkObjId(userId, "User ID");
    checkObjId(pendingId, "Pending ID");

    const user = await userData.getUserById(userId);
    const pending = await userData.getUserById(pendingId);

    const userCollection = await users();

    const userUpdate = await userCollection.updateOne(
        {_id: user._id},
        { $pull: {pending_friends: {pendingId: pending._id}}}
    );

    if (!userUpdate.matchedCount && !userUpdate.modifiedCount){
        throw `Unable to remove User ${pendingId} from pending of User ${userId}`;
    }

    const pendingUpdate = await userCollection.updateOne(
        {_id: pending._id},
        { $pull: {pending_friends: {pendingId: user._id}}}
    );
    if (!pendingUpdate.matchedCount && !pendingUpdate.modifiedCount){
        throw `Unable to remove User ${userId} from pending of User ${pendingId}`;
    }

    return true;
}

// remove friend
async function removeFriend(userId, friendId){
    checkObjId(userId, "User ID");
    checkObjId(friendId, "Friend ID");

    const user = await userData.getUserById(userId);
    const friend = await userData.getUserById(friendId);
    const userCollection = await users();

    const userUpdate = await userCollection.updateOne(
        {_id: user._id},
        { $pull: {friends: friend._id}}
    );
    if (!userUpdate.matchedCount && !userUpdate.modifiedCount){
        throw `Unable to remove User ${friendId} from friends of User ${userId}`;
    }

    const friendUpdate = await userCollection.updateOne(
        {_id: friend._id},
        { $pull: {friends: user._id}}
    );
    if (!friendUpdate.matchedCount && !friendUpdate.modifiedCount){
        throw `Unable to remove User ${userId} from friends of User ${friendId}`;
    }
    // doesn't throw so long as it finds doc, maybe shouldchange
    return true;
}

// invite friend to game?
async function inviteFriend(userId, friendId){

}

module.exports = {
    getFriendById,
    getAllFriends,
    getPendingFriendById,
    getAllPending,
    addFriend,
    acceptFriend,
    removeFriend,
    removePending
}