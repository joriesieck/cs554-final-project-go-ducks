import React, {useState, useEffect} from 'react';
import { FormControl, FormLabel, TextField, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';

const EndPracticeScreen = (props) =>
{
    return(
        <div>
            Your final score was {props.score || 0}
            <Button>Practice another category</Button>
            <Button>Back to home</Button>
        </div>
    )
    //has score, what they got wrong, stuff from the game
    //does it ask them if they want to save the information to their history?
    //buttons to practice the same category again, practice what they got wrong,
    //practice something else, or go back to the homepage and do smth else
}

export default function Practice()
{
    const [questionsCompleted, setQuestionsCompleted] = useState(0);
    const [mode, setMode] = useState('setup');
    const [practiceType, setPracticeType] = useState('');
    //const [categoryChoice, setCategoryChoice] = useState('');
    const [numClues, setNumClues] = useState(0);
    const [cluesToPractice, setCluesToPractice] = useState('');
    const [category, setCategory] = useState('');
    const [score, setScore] = useState(0);

    const handleQuestionSubmit = (e) =>
    {
        if ((questionsCompleted + 1) >= numClues) setMode('end');
        setQuestionsCompleted(questionsCompleted + 1);
        setScore(score + 1);
    }

    const PracticeQuestion = (props) =>
    {

        //id, answer, category
        return(
            <FormControl>
                <p>Question Information, and you answer the question below</p>
                <TextField></TextField>
                <Button onClick={handleQuestionSubmit}>Submit</Button>
            </FormControl>
        );
    }

    const handleEndPractice = (e) =>
    {
        setQuestionsCompleted(numClues);
        setMode('end');
    }

    const handlePracticeTypeChange = (e, type) =>
    {
        setPracticeType(type);
    }

    const handleCluesChange = (e, val) =>
    {
        setCluesToPractice(val);
        //if (val === 'custom') 
        setNumClues(10);
    }

    const handleStartPractice = (e) =>
    {
        setMode('inPractice');
    }
    //select categories we want to do practice on
    //select a number of questions to have for practice or "free play"
    //toggle buttons, selection
    //then button to start the practice game
    //query the number of questions needed from the API
    //when it starts, then remove everything else from the page

    return (
        mode === 'setup' ? 
        <FormControl>
            <FormLabel>What are you looking to practice today?</FormLabel>
            <ToggleButtonGroup exclusive value={practiceType} onChange={handlePracticeTypeChange}>
                <ToggleButton>Random Category</ToggleButton>
                <ToggleButton>Previous Category</ToggleButton>
            </ToggleButtonGroup>
            {practiceType !== '' ? 
            <>
            <FormLabel>How many clues would you like to practice with?</FormLabel>
            <ToggleButtonGroup exclusive value={cluesToPractice} onChange={handleCluesChange}>
                <ToggleButton value='custom'># of my choice (10)</ToggleButton>
                <ToggleButton value='available'>All Available</ToggleButton>
                {practiceType === 'previous' ? <ToggleButton value='missed'>Only Missed Clues</ToggleButton> : <></>}
            </ToggleButtonGroup>
            </> : <></>}
            {practiceType !== '' && cluesToPractice !== '' ? <Button onClick={handleStartPractice}>Start Practice</Button> : <></>}
        </FormControl> :
        (mode === 'inPractice' ? 
        <div>
            {questionsCompleted}
            {numClues}
            Score = {score}
            <Button>End Practice</Button>
            <hr/>
            <PracticeQuestion />
        </div>
        : <EndPracticeScreen score={score}/>)
    );
}