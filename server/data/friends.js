const mongoCollections = require('../config/mongoCollections');

const users = mongoCollections.users;

// add friend by id -> add to pending array
// pending array will fn as obj array in from [ {id: 'sent'}, {id: 'received'}] differentiates 
// whether request needs approval from given user 
async function addFriend(requesterId, requesteeId){
    // check ids

    // check 
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

// get friend
async function getFriendById(userId, friendId){

}

// get all friends
async function getAllFriends(userId){
    
}