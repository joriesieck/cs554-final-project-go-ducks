import React, {useState, useEffect} from 'react';
import { FormControl, TextField, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';


const handleQuestionSubmit = (e) =>
{

}

const PracticeQuestion = (props) =>
{
    //id, answer, category
    return(
        <FormControl>
            <p>Question Information</p>
            <TextField></TextField>
        </FormControl>
    );
}

const EndPracticeScreen = (props) =>
{
    //has score, what they got wrong, stuff from the game
    //does it ask them if they want to save the information to their history?
    //buttons to practice the same category again, practice what they got wrong,
    //practice something else, or go back to the homepage and do smth else
}

export default function Practice()
{
    const [questionsCompleted, setQuestionsCompleted] = useState(0);
    const [mode, setMode] = useState('setup');
    //select categories we want to do practice on
    //select a number of questions to have for practice or "free play"
    //toggle buttons, selection
    //then button to start the practice game
    //query the number of questions needed from the API
    //when it starts, then remove everything else from the page

    return (

    );
}