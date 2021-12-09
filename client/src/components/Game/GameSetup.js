import React, {useState, useEffect} from 'react';
import GameGrid from './GameGrid';
import {FormControl, 
    FormLabel, ToggleButtonGroup, ToggleButton} from '@mui/material';

export default function GameSetup()
{
    const [gameType, setGameType] = useState("");
    const [categoryChoice, setCategoryChoice] = useState("");
    const [categories, setCategories] = useState([]);
    //should we set up game stuff/get things from cache/api here or in the grid component itself?
    
    //query all categories from the API
    const handleGameTypeChange = (e) =>
    {
        //set the game type
        //make the category choice appear
    }

    const handleCategoryChoiceChange = (e) =>
    {
        //the callback for the toggles
        //set the category choice
        //make the next step appear
    }

    const handleFormSubmit = (e) =>
    {
        
    }

    return(
        <div>
            <FormControl component="fieldset">
                <FormLabel>What kind of game are you looking to play?</FormLabel>
                <ToggleButtonGroup exclusive value={gameType}>
                    <ToggleButton value="solo">Solo</ToggleButton>
                    <ToggleButton value="friends">With Friends</ToggleButton>
                </ToggleButtonGroup>
                <ToggleButtonGroup exclusive value={categoryChoice}>
                    <ToggleButton value="random">Random</ToggleButton>
                    <ToggleButton value="selected">Custom</ToggleButton>
                </ToggleButtonGroup>
                {//if selected categories is checked, then display a series of dropdown lists for all the categories

                //if random is checked, show game play button
                //go to game grid set up with given info
                }
            </FormControl>
            <GameGrid></GameGrid>
        </div>    
    );
}