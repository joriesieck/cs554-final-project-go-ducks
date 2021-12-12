const { ObjectId } = require('mongodb');
const { check } = require('prettier');
const mongoCollections = require('../config/mongoCollections');
const { checkObjId, checkString } = require('../inputChecks');
const userData = require('./users');
const users = mongoCollections.users;

// may need to change at least addFriend to take username of user doing adding instead of id

// get friend
async function getFriendByName(username, friendName){
    // check Ids, assuming input as string versions of ids
    //checkObjId(userId, "User ID");
    checkString(username, "Username", false);
    checkString(friendName, "Friend Name", false);
    //checkObjId(friendId, "Friend ID");

    // ids as actual objId, unsure if need uid
    //let uid = ObjectId(userId);
    //let fid = ObjectId(friendId);

    const user = await userData.getUserByName(username);
    
    // check if friend in friend array
    const inFriends = user.friends.some(e => e.equals(friendName));
    if (!inFriends){
        throw  `User ${username} has no friend ${friendName}`;
    }

    // get friend obj by doing getuserbyid
    const friend = await userData.getUserByName(friendName);

    return friend;
}

// get all friends
async function getAllFriends(username){
    // check Ids, assuming input as string versions of id
    //checkObjId(userId, "User ID");
    checkString(username, "Username", false);

    // ids as actual objId, dont think needed
    //let uid = ObjectId(userId);

    const user = await userData.getUserByName(username);

    // grab all friends
    const userCollection = await users();
    let friends = await userCollection.find({username: {$in : user.friends}});
    friends = await friends.toArray();

    // will simply be empty array if none
    return friends;
}

// pretty much same as getfriendbyName, see those comments, addition of pending field: sent vs received
async function getPendingFriendByName(username, friendName){
    //checkObjId(userId, "User ID");
    checkString(username, "Username", false);
    checkString(friendName, "Friend Name", false);
    // checkObjId(friendId, "Friend ID");
    // let fid = ObjectId(friendId);
    let status;
    const user = await userData.getUserByName(username);
    const inPending = user.pending_friends.findIndex( e => e.pendingName.equals(friendName))
    status = user.pending_friends[inPending].status;
    if (inPending === -1){
        throw  `User ${username} has no pending friend ${friendName}`;
    }
    const friend = await userData.getUserByName(friendName);
    friend.pending_status = status;
    return friend;    
}

// see getallfriends for details, will return 2d arr of [[friend info, pending status]]
async function getAllPending(username) {
    //checkObjId(userId, "User ID");
    checkString(username, "Username", false);
    const user = await userData.getUserByName(username);
    const userCollection = await users();
    const fnames = user.pending_friends.map(e => e.pendingName)
    let friends = await userCollection.find({username: {$in : fnames}});
    friends = await friends.toArray();
    // put friends together w/ pending status, this seems like there's probably a better way to do it
    for (const i in friends){
        let element = user.pending_friends.find((e) => e.pendingName.equals(friends[i].username));
        friends[i].pending_status = element.status;
    }
    return friends;
}

// add friend by name -> add to pending array, requesting user is passed as uname
// pending array will fn as obj array in form [ {pendingName: uname, status: 'sent'}, {pendingName: uname, status: 'received'}] differentiates
// whether request needs approval from given user 
// could also refactor this as instead of single pending array, one sent array and one received array
async function addFriend(requesterName, requesteeName){
    // check ids
    // checkObjId(requesterId, 'Requester Id');
    // checkObjId(requesteeId, "Requestee Id");
    checkString(requesterName, "Requester Name", false);
    checkString(requesteeName, "Requesteee Name", false)

    // let parsedRequester = ObjectId(requesterId);
    // let parsedRequestee = ObjectId(requesteeId);

    // check if both exist
    let requester = await userData.getUserByName(requesterName);
    await userData.getUserByName(requesterName);

    // check if already in friends, throwing for now
    const inFriends = requester.friends.some((e) => e.equals(requesteeName));
    if (inFriends){
        throw `User ${requesterName} and ${requesteeName} are already friends`;
    }

    // check if friend already in pending
    const inPending = requester.pending_friends.findIndex((e) => e.pendingName.equals(requesteeName));
    // if yes, check if request sent or received, if received then accept friend
    // else throw saying already requested? for now
    if (inPending !== -1){
        if (requester.pending_friends[inPending].status === 'received'){
            acceptFriend(requesterName, requesteeName);
            return;
        }else {
            throw `User ${requesterName} has already requested to friend User ${requesteeName}`;
        }
    }

    const userCollection = await users();

    // update pending arrays with relevant info
    const requesterUpdate = await userCollection.updateOne(
        { username: requesterName },
        { $addToSet: { pending_friends: { pendingName: requesteeName, status: 'sent'}}}
    )
    if (!requesterUpdate.matchedCount && !requesterUpdate.modifiedCount){
        throw `Unable to add User ${requesteeName} to pending friends of User ${requesterName}`;
    }

    const requesteeUpdate = await userCollection.updateOne(
        { username: requesteeName },
        { $addToSet: { pending_friends: { pendingName: requesterName, status: 'received'}}}
    )
    if (!requesteeUpdate.matchedCount && !requesteeUpdate.modifiedCount){
        throw `Unable to add User ${requesterName} to pending friends of User ${requesteeName}`;
    }

    // return updated requester
    const res = await userData.getUserByName(requesterName);
    return res;
}

// accept friend -> must be in pending array (as received), remove from pending of both
async function acceptFriend(username, pendingName){
    // checkObjId(userId, "User ID");
    // checkObjId(pendingId, "Pending Friend ID");
    checkString(username, "Username", false);
    checkString(pendingName, "Pending Friend Name", false);

    // const uid = ObjectId(userId);
    // const pid = ObjectId(pendingId);

    // check exist
    const user = await userData.getUserByName(username);
    await userData.getUserByName(pendingName);

    // check if already in friends, throwing for now
    const inFriends = user.friends.some((e) => e.equals(pendingName));
    if (inFriends){
        throw `User ${username} and ${pendingName} are already friends`;
    }

    const inPending = user.pending_friends.some((e) => e.pendingName.equals(pendingName) && e.status === 'received');
    
    if (!inPending){
        throw `Unable to accept User ${pendingName} as friend, User ${username} has not received a request from them`;
    }

    const userCollection = await users();
    
    // update friends and pending of both, this seems a little janky
    const userUpdate = await userCollection.updateOne(
        {username: username},
        { $pull: {pending_friends: {pendingName : pendingName }},
         $addToSet: { friends: pendingName}}
    );
    if (!userUpdate.matchedCount && !userUpdate.modifiedCount){
        throw `Unable to add User ${pendingName} to friends of User ${username}`;
    }

    const pendingUpdate = await userCollection.updateOne(
        {username: pendingName},
        { $pull: {pending_friends: {pendingName: username}},
          $addToSet: { friends: username}}
    );
    if (!pendingUpdate.matchedCount && !pendingUpdate.modifiedCount){
        throw `Unable to add User ${username} to friends of User ${pendingName}`;
    }

    let res = await userData.getUserByName(username);
    return res;
}

// remove pending friend (either sent or received)
async function removePending(username, pendingName){
    // checkObjId(userId, "User ID");
    // checkObjId(pendingId, "Pending ID");
    checkString(username, "Username", false);
    checkString(pendingName, "Pending Friend Name", false);

    const user = await userData.getUserByName(username);
    const pending = await userData.getUserByName(pendingName);

    const userCollection = await users();

    const userUpdate = await userCollection.updateOne(
        { username: username },
        { $pull: {pending_friends: {pendingName: pendingName }}}
    );

    if (!userUpdate.matchedCount && !userUpdate.modifiedCount){
        throw `Unable to remove User ${pendingName} from pending of User ${username}`;
    }

    const pendingUpdate = await userCollection.updateOne(
        {username: pendingName},
        { $pull: {pending_friends: {pendingName: username }}}
    );
    if (!pendingUpdate.matchedCount && !pendingUpdate.modifiedCount){
        throw `Unable to remove User ${username} from pending of User ${pendingName}`;
    }

    return true;
}

// remove friend
async function removeFriend(username, friendName){
    // checkObjId(userId, "User ID");
    // checkObjId(friendId, "Friend ID");
    checkString(username, "Username", false);
    checkString(friendName, "Friend Name", false);

    const user = await userData.getUserByName(username);
    const friend = await userData.getUserByName(friendName);
    const userCollection = await users();

    const userUpdate = await userCollection.updateOne(
        {username: username},
        { $pull: { friends: friendName }}
    );
    if (!userUpdate.matchedCount && !userUpdate.modifiedCount){
        throw `Unable to remove User ${friendName} from friends of User ${username}`;
    }

    const friendUpdate = await userCollection.updateOne(
        {username: friendName},
        { $pull: {friends: username }}
    );
    if (!friendUpdate.matchedCount && !friendUpdate.modifiedCount){
        throw `Unable to remove User ${username} from friends of User ${friendName}`;
    }
    // doesn't throw so long as it finds doc, maybe shouldchange
    return true;
}

// invite friend to game?
async function inviteFriend(userId, friendId){

}

module.exports = {
    getFriendByName,
    getAllFriends,
    getPendingFriendById,
    getAllPending,
    addFriend,
    acceptFriend,
    removeFriend,
    removePending
}