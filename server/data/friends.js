const mongoCollections = require('../config/mongoCollections');
const { checkObjId } = require('../inputChecks');
const userData = require('./users');
const users = mongoCollections.users;

// get friend
async function getFriendById(userId, friendId){
    // check Ids, assuming input as string versions of ids
    checkObjId(userId);
    checkObjId(friendId);

    // ids as actual objId, unsure if need uid
    let uid = ObjectId(userId);
    let fid = ObjectId(friendId);

    const user = await userData.getUserById(userId);
    
    // check if friend in friend array
    const inFriends = user.friends.some(e => e[0] === fid);
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
    checkObjId(userId);

    // ids as actual objId, dont think needed
    let uid = ObjectId(userId);

    const user = await userData.getUserById(userId);

    // grab all friends
    const userCollection = await users();
    const friends = await userCollection.find({_id: {$in : user.friends}});

    // will simply be empty array if none
    return friends;
}

// pretty much same as getfriendbyid, see those comments, addition of pending field: sent vs received
async function getPendingFriendById(userId, friendId){
    checkObjId(userId);
    checkObjId(friendId);
    let fid = ObjectId(friendId);
    let status;
    const user = await userData.getUserById(userId);
    const inPending = user.pending_friends.some(function(e) {
        if (e[0] === userId){
            status = e[1];
            return true;
        }
    });
    if (!inPending){
        throw  `User with ID ${userId} has no pending friend with ID ${friendId}`;
    }
    const friend = await userData.getUserById(friendId);
    friend.pending_status = status;
    return friend;    
}

// see getallfriends for details, will return 2d arr of [[friend info, pending status]]
async function getAllPending(userId) {
    checkObjId(userId);
    const user = await userData.getUserById(userId);
    const userCollection = await users();
    const fids = user.friends.map(e => e[0])
    const friends = await userCollection.find({_id: {$in : fids}});
    // put friends together w/ pending status
    for (const friend in friends){
        
    }

    // will simply be empty array if none
    return friends;
}

// add friend by id -> add to pending array
// pending array will fn as 2d array in form [ [id: 'sent'], [id: 'received']] differentiates
// whether request needs approval from given user 
// could also refactor this as instead of single pending array, one sent array and one received array
async function addFriend(requesterId, requesteeId){
    // check ids
    checkObjId(requesterId, 'Requester Id');
    checkObjId(requesteeId, "Requestee Id");

    // check if friend already in pending
    

    // if yes, check if request sent or received, if received then accept friend

    // update pending arrays with relevant info

}

// accept friend
async function acceptFriend(userId, pendingId){

}

// remove friend
async function removeFriend(userId, friendId){

}

// invite friend to game?
async function inviteFriend(userId, friendId){

}

module.exports = {
    getFriendById,
    getAllFriends,
    getPendingFriendById,
    getAllPending
}