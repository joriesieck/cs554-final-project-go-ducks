import React, {useState, useEffect} from 'react';
import GameGrid from './GameGrid';
import {FormControl, 
    FormLabel, Alert, ToggleButtonGroup, Checkbox, ToggleButton, Button, TextField, Select, MenuItem, FormControlLabel} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import axios from "axios";
import { useSelector } from "react-redux";
import { Redirect } from 'react-router-dom';
import { getAllFriends,getUserByEmail } from '../../utils/backendCalls';

const baseUrl = "http://jservice.io/api";
const siteUrl = 'http://localhost:3001';

import styles from './Game.module.css'
import { getUserById } from '../../utils/backendCalls';

export default function GameSetup()
{
    const [gameType, setGameType] = useState("");
    const [categoryChoice, setCategoryChoice] = useState("");
    const [inSetup, setInSetup] = useState(true);
    const [inGame, setInGame] = useState(false);
    const [categories, setCategories] = useState([]);
    const [priorCategories, setPriorCategories] = useState([]);
    const [friends, setFriends] = useState([]);
    const [friendToPlay, setFriendToPlay] = useState('');
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const [displayHint, setDisplayHint] = useState(false);
    const [pendingGames, setPendingGames] = useState([]);
    const [savedGameToPlay, setSavedGameToPlay] = useState({});
    const [userCats, setUserCats] = useState([]);
    //should we set up game stuff/get things from cache/api here or in the grid component itself?

    const user = useSelector((state) => state.user);
    if (!user) return <Redirect to="/" />;

    useEffect(() =>
    {
        async function x()
        {
            console.log(user);
            const userInfo = await getUserByEmail(user);
            console.log(userInfo)
            setUsername(userInfo.username)
            setUserCats(userInfo.recent_categories);
        }
        x()
    }, [user])

    useEffect(() =>
    {
        async function y(){
        if (gameType === 'saved')
        {
            const {data} = await axios.get(`${siteUrl}/users/${username}/pending-games`);
            if (data.length < 1) setError('No saved games to play');
            let pendingGamesInfo = [];
            data.friendGames.map(async ({gameSender, gameId}) =>
            {
                const user = await getUserById(gameSender);
                let info =
                {
                    sender: user.username,
                    
                }
            })
            setPendingGames(data.friendGames);
        }
    }
        y();
    }, [gameType])

    useEffect(() =>
    {
        async function fun()
        {
            if (categoryChoice === 'random' && inSetup) 
            {
                let cats = await setRandomCategories();
                setCategories(cats);
            }
        }
        fun();
    }, [categoryChoice])
    
    const handleGameTypeChange = async (e) =>
    {
        setError('');
        setGameType(e.target.value);

        if (e.target.value ==='friends')
        {
            setFriendToPlay('');
            const data = await getAllFriends(username);
            if (data.length < 1) setError('You have no friends to play with!');
            setFriends(data)
        }
    }

    const handleCategoryChoiceChange = async (e) =>
    {
        setCategoryChoice(e.target.value);
        if (e.target.value === 'custom') 
        {
            setCategories([]);
            // const {data} = await axios.get(`${siteUrl}/users/categories`);
            // console.log(data.categories);
            if (userCats.length < 1) setError('No prior categories to play with! Play a game to change this!')
            else setPriorCategories(userCats);
        }
    }

    const handleFormSubmit = async (e) =>
    {
        setInSetup(false);
        setInGame(true);
    }

    const setRandomCategories = async () =>
    {
        let returnVal = [];
        while (returnVal.length < 6)
        {
            const { data } = await axios.get(`${baseUrl}/random`);
            returnVal.push({id: data[0].category.id, title: data[0].category.title.toUpperCase()});
        }
        return returnVal;
    }


    const CategoryForm = (props) =>
    {

        return (
            <div>
                <FormLabel>Select 6 prior categories</FormLabel>
                <Select multiple value={categories} onChange={(e) => setCategories(JSON.parse(e.target.value))}>
                {priorCategories.map((category) =>
                <MenuItem key={category.categoryId} value={JSON.stringify({id: category.categoryId, title: category.categoryName})}>{category.categoryName}</MenuItem>)}
                </Select>
            </div>
        );
    }

    return(
        <div id="gamePlay">
            {inSetup ?
            <FormControl id="gameSetupForm" component="fieldset">
                <FormLabel>What kind of game are you looking to play?</FormLabel>
                <ToggleButtonGroup exclusive value={gameType}>
                    <ToggleButton onClick={handleGameTypeChange} value="solo">Solo</ToggleButton>
                    <ToggleButton onClick={handleGameTypeChange} value="friends">New Game With Friends</ToggleButton>
                    <ToggleButton onClick={handleGameTypeChange} value="saved">Available Shared Games With Friends</ToggleButton>
                </ToggleButtonGroup>
                <br/>
                {
                    gameType === 'friends' ?
                    <>
                    <FormLabel>Select a friend to play with</FormLabel>
                    <Select value={friendToPlay} onChange={(e) =>
                    {
                        console.log(e.target.value);
                        setFriendToPlay(e.target.value)
                    }}>
                        {friends.map((friendInfo) =>
                            <MenuItem key={friendInfo._id} value={{id: friendInfo._id, name: friendInfo.username}}>{friendInfo.username}</MenuItem>
                        )}
                    </Select>
                    {
                        friendToPlay ? <FormLabel>You will send this game to {friendToPlay.name}</FormLabel> : <></>
                    }
                    </>
                    : <></>
                }
                {
                    gameType === 'saved' ?
                    <>
                    {console.log(pendingGames)}
                    {(pendingGames && pendingGames.length>0 )&& <><FormLabel>Select a friend's game to play</FormLabel>
                    <Select value={savedGameToPlay} onChange={(e) =>
                    {
                        console.log(e.target.value);
                        setSavedGameToPlay(e.target.value)
                    }}>
                        {pendingGames.map((gameInfo) =>
                            <MenuItem key={gameInfo._id} value={{id: gameInfo._id}}>{gameInfo.username}</MenuItem>
                        )}
                    </Select></>}
                    {(!pendingGames || pendingGames.length<=0) && <p>Sorry, no pending games.</p>}
                    </> : <></>
                }
                {
                    ((gameType === 'friends' && friendToPlay !== '') || (gameType !== 'friends' && gameType !== 'saved' && gameType !== '')) && error === '' ? 
                    <>
                        <FormLabel>What kind of categories would you like to play with?</FormLabel>
                        <ToggleButtonGroup exclusive value={categoryChoice}>
                            <ToggleButton value="random" onClick={handleCategoryChoiceChange}>Random</ToggleButton>
                            <ToggleButton value="custom" onClick={handleCategoryChoiceChange}>Custom</ToggleButton>
                        </ToggleButtonGroup>
                        <HelpOutlineIcon onMouseOver={() => setDisplayHint(true)} onMouseOut={() => setDisplayHint(false)} />
                        {displayHint ? <ul>
                            <li>Random: we pick a random category for you</li>
                            <li>Custom: pick up to 6 from categories you've used in the last 2 games</li>
                        </ul> : <></>}
                    </> : <></>
                }
                {
                    error !== '' ? <Alert color='warning'>{error}</Alert> : <></>
                }
                {
                    gameType !== 'saved' && categoryChoice !== "" && gameType !== "" && error === '' ? 
                    (categoryChoice === 'custom' ? 
                    <div>
                        <CategoryForm />
                        {categories ? <>
                            <span>Categories</span><ul>
                            {categories.map((category) => <li key={category.title}>{category.title}</li>)}
                            </ul></> : <></>
                        }
                    </div> : 
                    <><span>Categories</span><ul>
                        {categories.map((category) => <li key={category.title}>{category.title}</li>)}
                    </ul></>) : <></>
                }

                {categoryChoice !== '' && gameType !== '' && categories.length === 6 || categoryChoice === 'custom' ? <Button type="submit" onClick={handleFormSubmit}>Start Game</Button> : <></>}
            </FormControl>
            : <></>
            }
            {inGame ?
            <GameGrid id="grid" categories={categories} gameType={gameType} friendToPlay={friendToPlay} gameInfo={savedGameToPlay}></GameGrid> : <div></div>
            }
        </div>    
    );
}