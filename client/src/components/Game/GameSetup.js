import React, { useState, useEffect } from 'react';
import GameGrid from './GameGrid';
import {FormControl, 
    FormLabel, Alert, ToggleButtonGroup, Checkbox, ToggleButton, Button, TextField, Select, MenuItem} from '@mui/material';

import axios from "axios";
import { useSelector } from "react-redux";
import { Redirect } from 'react-router-dom';
import { getAllFriends,getUserByEmail } from '../../utils/backendCalls';

const baseUrl = "http://jservice.io/api";
const siteUrl = 'http://localhost:3001';

export default function GameSetup()
{
    const [gameType, setGameType] = useState("");
    const [categoryChoice, setCategoryChoice] = useState("");
    const [inSetup, setInSetup] = useState(true);
    const [inGame, setInGame] = useState(false);
    const [categories, setCategories] = useState([]);
    const [catSearch, setCatSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [friends, setFriends] = useState([]);
    const [friendToPlay, setFriendToPlay] = useState('');
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    //should we set up game stuff/get things from cache/api here or in the grid component itself?

    useEffect(() =>
    {
        async function x()
        {
            console.log(user);
            const userInfo = await getUserByEmail(user, authToken);
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

    const user = useSelector((state) => state.user.user);
    const authToken = useSelector((state) => state.auth.authToken);
    if (!user) return <Redirect to="/" />;

    
    
    const handleGameTypeChange = async (e) =>
    {
        setError('');
        setGameType(e.target.value);
        console.log(gameType, e.target.value);

        if (e.target.value ==='friends')
        {
            setFriendToPlay('');
            const data = await getAllFriends(username, authToken);
            if (data.length < 1) setError('You have no friends to play with!');
            console.log(data);
            setFriends(data)
        }
        //set the game type>
        //make the category choice appear
    }

    const handleCategoryChoiceChange = (e) =>
    {
        setCategoryChoice(e.target.value);
        if (e.target.value === 'custom') 
        {
            setCategories([]);
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
        setError('')
        const {data} = await axios.get(`${siteUrl}/users/categories`, {
            headers: {
                authToken
            }
        });
        if (!data) setError('could not get data')
        return (
            <div>
                <FormLabel>Select up to 6 prior categories</FormLabel>
                {data.categories.map((category) =>
                <Checkbox>{category.categoryName}</Checkbox>)}
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
                    ((gameType === 'friends' && friendToPlay !== '') || (gameType !== 'friends' && gameType !== '')) && error === '' ? 
                    <>
                        <FormLabel>What kind of categories would you like to play with?</FormLabel>
                        <ToggleButtonGroup exclusive value={categoryChoice}>
                            <ToggleButton value="random" onClick={handleCategoryChoiceChange}>Random</ToggleButton>
                            <ToggleButton value="custom" onClick={handleCategoryChoiceChange}>Custom</ToggleButton>
                        </ToggleButtonGroup>
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
                    </div> : 
                    <><span>Categories</span><ul>
                        {categories.map((category) => <li key={category.title}>{category.title}</li>)}
                    </ul></>) : <></>
                }

                {categoryChoice !== '' && gameType !== '' && categories.length === 6 || categoryChoice === 'custom' ? <Button type="submit" onClick={handleFormSubmit}>Start Game</Button> : <></>}
            </FormControl>
            : <div></div>
            }
            {inGame ?
            <GameGrid id="grid" categories={categories}></GameGrid> : <div></div>
            }
        </div>    
    );
  };