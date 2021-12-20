import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import { useSelector } from "react-redux";
import { FormControl, FormLabel, TextField, Button, ToggleButton, ToggleButtonGroup, Dialog, DialogActions, DialogContent, DialogContentTitle, DialogContentText, Alert, Select, MenuItem, InputLabel } from '@mui/material';
import axios from 'axios';
import { getUserByEmail } from '../../utils/backendCalls';

const baseUrl = "http://jservice.io/api";
const siteUrl = 'http://localhost:3001';

const EndPracticeScreen = (props) =>
{
    return(
        <div>
            Your final score was {props.score || 0} / {props.num}
            <Button onClick={() => window.location.reload()}>Practice another category</Button>
            <Button component={Link} to="/home">Back to home</Button>
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
    const [pastCategories, setPastCategories] = useState([]);
    const [selectedPastCategory, setSelectedPastCategory] = useState('');
    const [category, setCategory] = useState('');
    const [score, setScore] = useState(0);
    const [error, setError] = useState('');
    const [answered, setAnswered] = useState(false);
    const [index, setIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [username, setUsername] = useState('');
    const [correct, setCorrect] = useState(false);
    const [userCats, setUserCats] = useState([]);

    //this is a protected route
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
        async function filterQs(){
        if (cluesToPractice && category)
        {
            const {data} = await axios.get(`${baseUrl}/clues/?category=${category.id}`);
            if (!data) return <Alert color="warning">Something has gone terribly wrong</Alert>
            
            console.log(data)
            let filterQuestions = [];
            let returnedQuestions = [];

            //get rid of duplicates
            data.forEach(q =>
                {
                    if (!filterQuestions.includes(q.question))
                    {
                        filterQuestions.push(q.question);
                        returnedQuestions.push(q);
                    }
                });
            console.log(category)
            setQuestions(returnedQuestions);
            category.cluesCount = returnedQuestions.length
            if (cluesToPractice === 'available') setNumClues(returnedQuestions.length);
        }
    }
    filterQs()
    }, [cluesToPractice, category])

    useEffect(() =>
    {
        if (pastCategories && pastCategories.length > 0) 
        {
            console.log(pastCategories);
            console.log(pastCategories[0]);
            // get the actual format of the dropdowns
            const initialSelected = {
                id: pastCategories[0].categoryId,
                title: pastCategories[0].categoryName
            }
            setSelectedPastCategory(JSON.stringify(initialSelected));
        }
    }, [pastCategories])

    useEffect(() =>
    {
        console.log(selectedPastCategory)
        if (selectedPastCategory && selectedPastCategory !== '') setCategory(JSON.parse(selectedPastCategory))
    }, [selectedPastCategory])

    const PracticeQuestion = (props) =>
    {
        let qs = props.arr;
        console.log(qs);
        const [response, setResponse] = useState('');

        const handleQuestionSubmit = (e) =>
        {
            console.log(qs[index].answer)
            let sanitizedAnswer = qs[index].answer.replace( /(<([^>]+)>)/ig, '').replace(/\\/g, '');
            console.log(sanitizedAnswer);
            if (response.toLowerCase() === sanitizedAnswer.toLowerCase())
            {
                setCorrect(true);
                setScore(score + 1);    
            }
            else {
                setCorrect(false);
            }
            setAnswered(true);
        }

        const handleDialogClose = async (e, reason) =>
        {
            if (reason === 'backdropClick') return false;
            let temp = questionsCompleted;
            setAnswered(false)
            setQuestionsCompleted(temp + 1);
            if (temp + 1 >= numClues) 
            {
                await handleEndPractice()
                setMode('end');
            }
            else
            {
                setIndex(index + 1);
            }

        }

        const handleAnswerChange = (e) =>
        {
            setResponse(e.target.value);
        }
        console.log(index)
        //id, answer, category
        return(
            <>
            {!answered ? 
            <FormControl>
                <p>{qs[index].question}</p>
                <TextField onChange={handleAnswerChange} label='Answer'></TextField>
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
                        Sorry, that's not right. The correct answer is: {qs[index].answer}
                    </DialogContentText>
                    }
                    <DialogContentText>
                        Score: {score}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Continue</Button>
                </DialogActions>
            </Dialog>
            </>
        );
    }

    const handleEndPractice = async (e) =>
    {
        //setQuestionsCompleted(numClues);
        console.log(username.toString());
        console.log(category)
        const {data} = await axios.post(`${siteUrl}/users/save-game-info`,
        {
            username: username,
            categories: [{categoryId: category.id, categoryName: category.title}],
            highScore: 0
        });
        console.log(data);
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
            console.log(category.title)
        }
        else if (type === 'previous')
        {
            setCategory('');
            console.log("HIT")
            try
            {
                // const {data} = await axios.get(`${siteUrl}/users/categories`)
                setPastCategories(userCats);
            }
            catch(e)
            {
                setError("No previous categories to practice with")
            }
            
        }
    }

    const handleCluesChange = async (e, val) =>
    {
        setError('');
        console.log(val);
        setCluesToPractice(val);
    }

    const handleNumCluesChange = (e) =>
    {
        setError('')
        let val = e.target.value;
        //filtering questions based on cluesToPractice
        
        if (val < 1 || questions.length < val) setError('Provide a different value for # of clues to practice with.');
        else setNumClues(val);       
    }

    const handleStartPractice = async (e) =>
    {
        //based on clues to practice query questions from api
        
        if (numClues < questions.length) //only option is numClues < returnedQuestions.length, as it can only be set in these 2 cases
        {
            setQuestions(questions.slice(0, numClues));
        }
        console.log(questions);
        setQuestionsCompleted(0);
        setMode('inPractice');
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
                <>
                <FormLabel>Select a previous category</FormLabel>
                <Select value={selectedPastCategory} onChange={(e)=>
                {
                    console.log(e.target.value)
                    setSelectedPastCategory(e.target.value)
                    setCategory(JSON.parse(e.target.value))
                }}>
                    {pastCategories.map((category) =>
                    <MenuItem key={category.categoryId} value={JSON.stringify({id: category.categoryId, title: category.categoryName})}>{category.categoryName}</MenuItem>)}
                </Select>
                </> )
            }
            {category ? 
            <>
                {console.log(category)}
                <FormLabel>How many clues would you like to practice with?</FormLabel>
                <ToggleButtonGroup exclusive value={cluesToPractice} onChange={handleCluesChange}>
                    <ToggleButton value='custom'># of my choice</ToggleButton>
                    <ToggleButton value='available'>All Available</ToggleButton>
                </ToggleButtonGroup>
            </> : <></>} 
            {cluesToPractice === 'available' ? <p>Your number of clues will be {questions !== [] ? questions.length : 0}</p> : <></>}
            {cluesToPractice === 'custom' && (error === 'Provide a different value for # of clues to practice with.' || error === '')? 
            <>
                <TextField id="numberOfClues" label="Number of clues" variant="standard" type="number" onChange={handleNumCluesChange}></TextField>
                {error !== '' ? <Alert color='warning'>{error}</Alert> : <></>}
            </> : <></>}
            {console.log(practiceType, cluesToPractice, numClues, category.cluesCount, error)}
            {practiceType && cluesToPractice && numClues >= 1 && numClues <= category.cluesCount && error === '' ? <Button onClick={handleStartPractice}>Start Practice</Button> : <></>}
            
            </> : <></>}
        </FormControl> :
        (mode === 'inPractice' ? 
        <div>
            Completed {questionsCompleted}/{numClues} <br/>
            Score = {score} <br/>
            <Button onClick={handleEndPractice}>End Practice</Button>
            <hr/>
            <PracticeQuestion arr={questions} />
        </div>
        : <EndPracticeScreen score={score} num={questionsCompleted}/>)
    );
}