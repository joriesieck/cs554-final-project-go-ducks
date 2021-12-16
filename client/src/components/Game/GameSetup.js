import React, { useState, useEffect } from 'react';
import GameGrid from './GameGrid';
import {
  FormControl,
  FormLabel,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  TextField,
} from '@mui/material';

export default function GameSetup() {
  const [gameType, setGameType] = useState('');
  const [categoryChoice, setCategoryChoice] = useState('');
  const [inSetup, setInSetup] = useState(true);
  const [inGame, setInGame] = useState(false);
  const [categories, setCategories] = useState([]);
  //should we set up game stuff/get things from cache/api here or in the grid component itself?

  useEffect(() => {
    if (categoryChoice === 'random') {
      let cats = setRandomCategories();
      setCategories(cats);
    }
  }, [categoryChoice]);

  //query all categories from the API
  const handleGameTypeChange = (e, newGameType) => {
    setGameType(newGameType);
    //set the game type
    //make the category choice appear
  };

  const handleCategoryChoiceChange = (e, catChoice) => {
    setCategoryChoice(catChoice);
    if (catChoice === 'custom') setCategories([]);
    console.log(catChoice);
    //the callback for the toggles
    //set the category choice
    //make the next step appear
  };

  const handleFormSubmit = (e) => {
    setInSetup(false);
    setInGame(true);
  };

  const setRandomCategories = () => {
    return ['r', 'a', 'n', 'd', 'o', 'm'];
  };

    return(
        <div id="gamePlay">
            {inSetup ?
            <FormControl id="gameSetupForm" component="fieldset">
                <FormLabel>What kind of game are you looking to play?</FormLabel>
                <ToggleButtonGroup exclusive value={gameType} onChange={handleGameTypeChange}>
                    <ToggleButton value="solo">Solo</ToggleButton>
                    <ToggleButton value="friends">With Friends</ToggleButton>
                </ToggleButtonGroup>
                <br/>
                {
                    gameType !== "" ? 
                    <>
                        <FormLabel>What kind of categories would you like to play with?</FormLabel>
                        <ToggleButtonGroup exclusive value={categoryChoice} onChange={handleCategoryChoiceChange}>
                            <ToggleButton value="random">Random</ToggleButton>
                            <ToggleButton value="custom">Custom</ToggleButton>
                        </ToggleButtonGroup>
                    </> : <></>
                }
                {
                    categoryChoice !== "" && gameType !== "" ? 
                    (categoryChoice === 'custom' ? <CategoryForm /> : 
                    <><span>Categories</span><ul>
                        {categories.map((category) => <li key={category}>{category}</li>)}
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