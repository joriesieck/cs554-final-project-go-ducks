import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import { FormControl, FormLabel, TextField, Button, ToggleButton, ToggleButtonGroup, Dialog, DialogActions, DialogContent, DialogContentTitle, DialogContentText, Alert } from '@mui/material';
import axios from 'axios';

const baseUrl = "http://jservice.io/api";
const siteUrl = 'http://localhost:3001';

const EndPracticeScreen = (props) =>
{
    return(
        <div>
            Your final score was {props.score || 0}
            <Button onClick={() => window.location.reload()}>Practice another category</Button>
            <Button component={Link} to="/practice">Back to home</Button>
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
    const [numClues, setNumClues] = useState(1);
    const [cluesToPractice, setCluesToPractice] = useState('');
    const [category, setCategory] = useState('');
    const [score, setScore] = useState(0);
    const [categorySearch, setCategorySearch] = useState('');
    const [error, setError] = useState('');
    const [smallFilteredClues, setSmallFilteredClues] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [answered, setAnswered] = useState(false);
    const [index, setIndex] = useState(0);


    const PracticeQuestion = (props) =>
    {
        let qs = props.arr;
        const [correct, setCorrect] = useState(false);
        const [response, setResponse] = useState('');

        const handleQuestionSubmit = (e) =>
        {
            if (response.toLowerCase() === qs[index].answer)
            {
                console.log('woo')
                setScore(score + 1);
                setCorrect(true);
            }
            else {
                console.log('boo')
                setCorrect(false);
            }
            setAnswered(true);
            // if ((questionsCompleted + 1) >= numClues) setMode('end');
            setQuestionsCompleted(questionsCompleted + 1);
        }

        const handleDialogClose = (e, reason) =>
        {
            if (reason === 'backdropClick') return false;
            setQuestionsCompleted(questionsCompleted + 1);
        }

        const handleAnswerChange = (e) =>
        {
            setResponse(e.target.value);
        }
        console.log(answered)

        //id, answer, category
        return(
            <>
            {!answered ? 
            <FormControl>
                <p>{qs[index].question}</p>
                <TextField onChange={handleAnswerChange}></TextField>
                <Button onClick={handleQuestionSubmit}>Submit</Button>
            </FormControl> : <></>}
            <Dialog open={answered}>
                <DialogContent>
                    {correct ? 
                    <DialogContentText>
                        Correct!
                    </DialogContentText>
                    :
                    <DialogContentText>
                        Sorry, that's not right. The correct answer is:
                    </DialogContentText>
                    }
                    <DialogContentText>
                        Score: {score}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}></Button>
                </DialogActions>
            </Dialog>
            </>
        );
    }

    const handleEndPractice = (e) =>
    {
        setQuestionsCompleted(numClues);
        setMode('end');
    }

    const handlePracticeTypeChange = async (e, type) =>
    {
        setError('')
        setPracticeType(type);
        setCluesToPractice('')
        if (type === 'random')
        {
            //saving clues count to make sure that user doesn't request more categories than are available
            const { data } = await axios.get(`${baseUrl}/random`);
            setCategory({id: data[0].category.id, title: data[0].category.title.toUpperCase(),
            cluesCount: data[0].category.clues_count});
        }
        else if (type === 'previous')
        {
            setCategory('');
            console.log("HIT")
            try
            {
                const info = await axios.get(`${siteUrl}/categories`)
                console.log(info)
            }
            catch(e)
            {
                setError("No previous categories to practice with")
            }
            
        }
    }

    const handleCluesChange = (e, val) =>
    {
        setCluesToPractice(val);
        if (val === 'available') setNumClues(category.cluesCount);
    }

    const handleNumCluesChange = (e) =>
    {
        setError('')
        let val = e.target.value;
        console.log(val)
        console.log(category.cluesCount)
        if (val < 1 || category.cluesCount < val) setError('Provide a different value for # of clues to practice with.');
        else setNumClues(val);       
    }

    const handleStartPractice = async (e) =>
    {
        //based on clues to practice query questions from api
        const {data} = await axios.get(`${baseUrl}/clues/?category=${category.id}`);
        if (!data) return <Alert color="warning">Something has gone terribly wrong</Alert>
        console.log(data)
        let filterQuestions = [];
        let returnedQuestions = [];
        //filter them so that no duplicates exist (big issue with the jservice API are the duplicated clues)
        data.forEach(q =>
            {
                if (!filterQuestions.includes(q.question))
                {
                    filterQuestions.push(q.question);
                    returnedQuestions.push(q);
                }
            });
        if (returnedQuestions.length >= numClues)
        {
            setQuestions(returnedQuestions.slice(0, numClues - 1));
            setQuestionsCompleted(0);
            setMode('inPractice');
        }
        else
        {
            console.log(returnedQuestions)
            setQuestions(returnedQuestions);
            setSmallFilteredClues(true);
            //set num clues to whatever number could actually be returned

        }
    }

    const handleCategorySearch = (e) =>
    {
        setCategorySearch(e.target.value)
    }

    return (
        mode === 'setup' ? 
        <FormControl>
            <FormLabel>What are you looking to practice today?</FormLabel>
            <ToggleButtonGroup exclusive value={practiceType} onChange={handlePracticeTypeChange}>
                <ToggleButton value='random'>Random Category</ToggleButton>
                <ToggleButton value='previous'>Previous Category</ToggleButton>
            </ToggleButtonGroup>
            {practiceType !== '' ? 
            <>
            {practiceType === 'random' ? 
                <p>Your random category will be {category.title}</p> : 
                (error !== '' ? 
                <Alert color="warning">{error}</Alert> : 
                <TextField label="Search for a previous category" onChange={handleCategorySearch}></TextField>)
            }
            {category !== '' ? 
            <>
                <FormLabel>How many clues would you like to practice with?</FormLabel>
                <ToggleButtonGroup exclusive value={cluesToPractice} onChange={handleCluesChange}>
                    <ToggleButton value='custom'># of my choice</ToggleButton>
                    <ToggleButton value='available'>All Available</ToggleButton>
                </ToggleButtonGroup>
            </> : <></>} 
            {cluesToPractice === 'available' ? <p>Your number of clues will be {category.cluesCount}</p> : <></>}
            {cluesToPractice === 'custom' && (error === 'Provide a different value for # of clues to practice with.' || error === '')? 
            <>
                <TextField id="numberOfClues" label="Number of clues" variant="standard" type="number" onChange={handleNumCluesChange}></TextField>
                {error !== '' ? <Alert color='warning'>{error}</Alert> : <></>}
            </> : <></>}
            {practiceType !== '' && cluesToPractice !== '' && numClues >= 1 && numClues <= category.cluesCount && error === '' ? <Button onClick={handleStartPractice}>Start Practice</Button> : <></>}
            </> : <></>}
            <Dialog open={smallFilteredClues || false}>
                <DialogContent>
                    <DialogContentTitle>Desired number of clues could not be returned due to duplicate clues</DialogContentTitle>
                    <DialogContentText>Requested questions: {numClues}</DialogContentText>
                    <DialogContentText>Available questions filtered: {questions.length}</DialogContentText>
                    <DialogContentText>Would you like to practice with {questions.length} questions instead?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() =>
                    {
                        setQuestionsCompleted(0)
                        setSmallFilteredClues(false);
                        setMode('inPractice');
                    }}>Yes, continue to practice!</Button>
                    <Button onClick={() =>
                    {
                        setSmallFilteredClues(false);
                    }}>No, go back</Button>
                </DialogActions>
            </Dialog>
        </FormControl> :
        (mode === 'inPractice' ? 
        <div>
            Completed {questionsCompleted}/{numClues} <br/>
            Score = {score} <br/>
            <Button onClick={handleEndPractice}>End Practice</Button>
            <hr/>
            <PracticeQuestion arr={questions} />
        </div>
        : <EndPracticeScreen score={score}/>)
    );
}