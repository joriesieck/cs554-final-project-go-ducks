import {
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  DialogContentText,
} from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import GameFinished from './GameFinished';
import styles from './Game.module.css';
import axios from 'axios';
import { useSelector } from "react-redux";
import { getUserByEmail } from '../../utils/backendCalls';


const baseUrl = 'http://jservice.io/api';
const siteUrl = 'http://localhost:3001';

export default function GameGrid(props) {
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(30);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [username, setUsername] = useState('');
  const [questionInfo, setQuestionInfo] = useState({
    category: '',
    question: '',
    answer: '',
    value: 20,
  });
  const [disabledButtons, setDisabledButtons] = useState(
    {
      '200': [false, false, false, false, false],
      '400': [false, false, false, false, false],
      '600': [false, false, false, false, false],
      '800': [false, false, false, false, false],
      '1000': [false, false, false, false, false]
    }
  )
  const user = useSelector((state) => state.user);
  const authToken = useSelector((state) => state.auth.authToken)
  if (!user) return <Redirect to="/" />;

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
  //GameSetup sends along the categories
  let categories = props.categories;

  const handleQuitGame = async (e) => {
    setRemaining(0);
    try
    {
      console.log(categories);
      categories.forEach(({id, title}, i) => {
        categories[i] = {
          categoryId: id,
          categoryName: title
        }
      });
      console.log(categories);
      const {data} = await axios.post(`${siteUrl}/users/save-game-info`,
      {
        username: username,
        categories:categories,
        highScore: score

      });
      if (!data) console.log('oh no')
      console.log(data)
    }
    catch(e)
    {
      console.log(e.toString())
    }
    setQuitOpen(false);
  };

  const QuitModal = () => {
    return (
      <>
        <DialogContent>
          <DialogTitle>Are you sure you'd like to quit?</DialogTitle>
          <DialogContentText>
            Current score: {score} <br />
            Questions remaining: {remaining}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQuitGame}>Yes, quit now</Button>
          <Button onClick={() => setQuitOpen(false)}>No, keep playing</Button>
        </DialogActions>
      </>
    );
  };

  const handleQuestionModalClose = (e, reason) => {
    if (reason === 'backdropClick') {
      return false;
    } //IGNORE BACKDROP CLICK
    //set the remaining number of questions to current - 1
    setRemaining(remaining - 1);
    setDialogOpen(false);
    setAnswered(false);
    setCorrect(false);
  };

  const QuestionModal = (props) => {
    const [responseVal, setResponseVal] = useState('');

    const handleValChange = (e) => {
      setResponseVal(e.target.value);
    };

    const handleQuestionModalSubmit = (e) => {
      console.log(questionInfo);
      setAnswered(true);
      let cleanAnswer = questionInfo.answer.replace( /(<([^>]+)>)/ig, '').replace(/\\/g, '')
      if (cleanAnswer.toLowerCase() === responseVal.toLowerCase()) {
        setScore(score + parseInt(questionInfo.value));
        setCorrect(true);
      } else {
        setScore(score - parseInt(questionInfo.value));
        setCorrect(false);
      }
    };

    return !answered ? (
      <>
        {console.log(questionInfo)}
        <DialogContent>
          <DialogTitle>
            {questionInfo.category} for {questionInfo.value}
          </DialogTitle>
          <DialogContentText>{questionInfo.question}</DialogContentText>
          <TextField
            id="responseField"
            label="Response"
            type="text"
            variant="standard"
            onChange={handleValChange}
          ></TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQuestionModalSubmit}>Submit</Button>
        </DialogActions>
      </>
    ) : !correct ? (
      <>
        <DialogContent>
          <DialogContentText>
            Sorry, your answer was not correct.
            Correct answer: {questionInfo.answer}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => handleQuestionModalClose(e, null)}>
            Close
          </Button>
        </DialogActions>
      </>
    ) : (
      <>
        <DialogContent>
          <DialogContentText>Correct! New Score: {score}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => handleQuestionModalClose(e, null)}>
            Close
          </Button>
        </DialogActions>
      </>
    );
  };

  const QuestionButtonGroup = (props) => {
    let groupIndex = props.groupindex;
    let category = props.category;
    let categoryId = props.catId;
    return (
      <Grid
        container
        xs={2}
        direction="column"
        id={category.replace(/ /g, '_')}
        className={styles.gridColumn}
      >
        <QuestionButton
          value={200}
          categoryId={categoryId}
          category={category}
          groupindex={groupIndex}
        ></QuestionButton>
        <QuestionButton
          value={400}
          categoryId={categoryId}
          category={category}
          groupindex={groupIndex}
        ></QuestionButton>
        <QuestionButton
          value={600}
          categoryId={categoryId}
          category={category}
          groupindex={groupIndex}
        ></QuestionButton>
        <QuestionButton
          value={800}
          categoryId={categoryId}
          category={category}
          groupindex={groupIndex}

        ></QuestionButton>
        <QuestionButton
          value={1000}
          categoryId={categoryId}
          category={category}
          groupindex={groupIndex}
        ></QuestionButton>
      </Grid>
    );
  };

  const QuestionButton = (props) => {
    //let disabledStatus = props.disabledStatus;
    let categoryId = props.categoryId;

    const handleQuestionClick = async (e, category) => {
      console.log(e);
      console.log(categoryId);
      const { data } = await axios.get(
        `${baseUrl}/clues/?category=${e.target.className}&value=${props.value}`
      );
      console.log(data);
      let valuesButtons = disabledButtons[e.target.value];
      valuesButtons[props.groupindex] = true;
      setDisabledButtons({...disabledButtons, [e.target.value]: valuesButtons})
      let question = '';
      let answer = '';
      if (data.length === 1) {
        question = data[0].question;
        answer = data[0].answer;
      } else if (data.length > 1) {
        let index = Math.floor(Math.random() * data.length);
        console.log(index);
        console.log(data[index]);
        question = data[index].question;
        answer = data[index].answer;
      }
      // strip html tags and \s from answers
      answer = answer.replace( /(<([^>]+)>)/ig, '').replace(/\\/g, '');
      setQuestionInfo({
        category: category,
        question: question,
        answer: answer,
        value: e.target.value,
      });
      setDialogOpen(true);
      setAnswered(false);
      setCorrect(false);
    };

    return (
      <Grid item xs={2}>
        <button
          value={props.value}
          className={categoryId}
          // category={props.category}
          onClick={(e) => {handleQuestionClick(e,props.category)}}
          disabled={disabledButtons[props.value][props.groupindex]}
        >
          {props.value}
        </button>
      </Grid>
    );
  };

  const gridElements = [];
  const gridHeaderElements = [];
  categories.map((category,index) => {
    gridHeaderElements.push(
      <Grid item key={category.title} xs={2}>
        <button className={styles.gridHeader} disabled>
          {category.title}
        </button>
      </Grid>
    );
    console.log(category.id);
    gridElements.push(
      <QuestionButtonGroup catId={category.id} groupindex={index} category={category.title} />
    );
    console.log(category);
  });

  return remaining > 0 ? (
    <div>
      <Dialog
        open={dialogOpen || quitOpen}
        disableEscapeKeyDown="false"
        onClose={handleQuestionModalClose}
      >
        {quitOpen ? <QuitModal></QuitModal> : <QuestionModal />}
      </Dialog>
      Remaining = {remaining}
      <Grid container id="statusBar">
        <Grid item xs={6}>
          Score: {score}
        </Grid>
        <Grid item xs={6}>
          <Button variant="outlined" onClick={() => setQuitOpen(true)}>
            Quit Game
          </Button>
        </Grid>
      </Grid>
      <Grid container xs={12} id="gameGrid">
        <Grid item container xs={12} className={styles.gridRow}>
          {gridHeaderElements}
        </Grid>
        {gridElements}
      </Grid>
    </div>
  ) : (
    <GameFinished score={score} />
  );
}
