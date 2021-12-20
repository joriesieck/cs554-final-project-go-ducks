import React, {useState, useEffect} from 'react';
import GameGrid from './GameGrid';
import {FormControl, 
    FormLabel, Alert, ToggleButtonGroup, Checkbox, ToggleButton, Button, TextField, Select, MenuItem} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import axios from "axios";
import { useSelector } from "react-redux";
import { Redirect } from 'react-router-dom';
import { getAllFriends,getUserByEmail } from '../../utils/backendCalls';

const baseUrl = "http://jservice.io/api";
const siteUrl = 'http://localhost:3001';

import styles from './Game.module.css';

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
        }
        x()
    }, [user])

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
            const info = await axios.get(`${siteUrl}/users/${username}/pending-games`);
            setPendingGames(info);
        }
    }

    const handleCategoryChoiceChange = async (e) =>
    {
        setCategoryChoice(e.target.value);
        if (e.target.value === 'custom') 
        {
            setCategories([]);
            const {data} = await axios.get(`${siteUrl}/users/categories`);
            if (data.categories.length < 1) setError('No prior categories to play with! Play a game to change this!')
            else setPriorCategories(data.categories);
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


    const CategoryForm = async (props) =>
    {
        //should create an array to help with the state
        let stateList = Array.from('false'.repeat(priorCategories.length));
        let [categoryChecked, setCategoryChecked] = useState(stateList);
        let [categoryDisabled, setCategoryDisabled] = useState(stateList);
        let checkedList = [];
        const handleCategoryCheck = e =>
        {
            if (e.target.checked)
            {
                checkedList.push(e.target.value);
                let priorIndex = priorCategories.indexOf(e.target.value);
                if (priorIndex !== -1) 
                {
                    let temp = categoryChecked;
                    temp[index] = true;
                    setCategoryChecked(temp)
                }
            }
            else
            {
                let index = checkedList.indexOf(e.target.value);
                if (index >= 0) checkedList.splice(index, 1);
            }

            if (checkedList.length >= 6)
            {
                priorCategories.map((category, index) =>
                {
                    if (!category in checkedList) 
                    {
                        let temp = categoryDisabled;
                        temp[index] = true;
                        setCategoryDisabled(temp);
                    }
                })
            }
            else
            {
                setCategoryDisabled(stateList);
            }
            setCategories(checkedList);
        }

        return (
            <div>
                <FormLabel>Select 6 prior categories</FormLabel>
                <div>
                {priorCategories.map((category, index) =>
                <Checkbox key={category.categoryId} value={JSON.stringify({id: category.categoryId, title: category.categoryName})} onChange={handleCategoryCheck} checked={categoryChecked[index]} disabled={categoryDisabled[index]}>{category.categoryName}</Checkbox>)}
                </div>
            </div>
        );
    }


    console.log(friendToPlay)
    return(
        <div id="gamePlay">
            {inSetup ?
            <FormControl id="gameSetupForm" component="fieldset">
                <FormLabel>What kind of game are you looking to play?</FormLabel>
                <ToggleButtonGroup exclusive value={gameType}>
                    <ToggleButton onClick={handleGameTypeChange} value="solo">Solo</ToggleButton>
                    <ToggleButton onClick={handleGameTypeChange} value="friends">With Friends</ToggleButton>
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
                            <MenuItem key={friendInfo._id} className={friendInfo._id in pendingGames ? styles.pendingGame : styles.noPendingGame} value={{id: friendInfo._id, name: friendInfo.username}}>{friendInfo.username}</MenuItem>
                        )}
                    </Select>
                    {
                        friendToPlay ? <FormLabel>You will send this game to {friendToPlay.name}</FormLabel> : <></>
                    }
                    </>
                    : <></>
                }
                {
                    ((gameType === 'friends' && friendToPlay !== '') || (gameType !== 'friends' && gameType !== '')) && error === '' ? 
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
                    categoryChoice !== "" && gameType !== "" && error === '' ? 
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
            <GameGrid id="grid" categories={categories} gameType={gameType} friendToPlay={friendToPlay}></GameGrid> : <div></div>
            }
        </div>    
    );
}