const mongoCollections = require('../config/mongoCollections');
const { checkObjId } = require('../inputChecks');
const users = mongoCollections.users;


// get friend
async function getFriendById(userId, friendId){
    // check Ids, assuming input as string versions of ids
    checkObjId(userId);
    checkObjId(friendId);

    // ids as actual objId
    let uid = ObjectId(userId);
    let fid = ObjectId(friendId);

    const userCollection = await users();
    // get user
    const user = await userCollection.findOne({_id: uid});
    if (!user){
        throw `User with ID ${userId} not found`;
    }

    // get friend
    const [ friend ] = user.friends.filter(e => e[0] === fid);
    if (!friend){
        throw  `User with ID ${userId} has no friend with ID ${friendId}`;
    }

    return friend;
}

// get all friends
async function getAllFriends(userId){

}

// should there be get pending friend and get all pending as well? I'll implement

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
