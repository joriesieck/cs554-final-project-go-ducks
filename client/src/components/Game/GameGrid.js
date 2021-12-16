import { Grid, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  DialogContentText } from '@mui/material';
import React, {useState, useEffect} from 'react';
import GameFinished from './GameFinished';
import styles from './Game.module.css';

export default function GameGrid(props)
{
    const [score, setScore] = useState(0);
    const [remaining, setRemaining] = useState(30);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [correct, setCorrect] = useState(false);
    const [questionInfo, setQuestionInfo] = useState({
      category: '',
      clue: '',
      answer: '',
      value: 20
    });

  //GameSetup sends along the categories
  let categories = props.categories;

  const handleQuitGame = (e) => {
    setRemaining(0);
  };

  //on click of quit button, what should happen?
  //IDEA- pop up modal asking if the user actually wants to quit
  //if so, go to game finished page and send info

    const handleQuestionModalClose = (e, reason) =>
    {
        if (reason === 'backdropClick')
        {
          return false;
        } //IGNORE BACKDROP CLICK
        //set the remaining number of questions to current - 1
        setRemaining(remaining - 1);
        setDialogOpen(false);
        setAnswered(false);
        setCorrect(false);
    }

    const QuestionModal = (props) =>
    {
      const [responseVal, setResponseVal] = useState('');
      
      const handleValChange = (e) =>
      {
        setResponseVal(e.target.value);
      }

      const handleQuestionModalSubmit = (e, response) =>
      {
        console.log(questionInfo)
        setAnswered(true);
        setScore(score + parseInt(questionInfo.value));
        setCorrect(true);    
      }

      return (
        !answered ?
        <>
          <DialogContent>
            <DialogTitle>Category {questionInfo.category} for {questionInfo.value}</DialogTitle>
            <DialogContentText>This is where the question would go if I had it.</DialogContentText> 
            <TextField id="responseField" label="Response" type="text" variant="standard" onChange={handleValChange}></TextField> 
          </DialogContent>
          <DialogActions>
            <Button onClick={(e) => handleQuestionModalSubmit(e, responseVal)}>Submit</Button>
          </DialogActions>
        </> :
        (correct ? <>
            <DialogContent>
              <DialogContentText>Sorry, your answer was not correct.</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={(e) => handleQuestionModalClose(e, null)}>Close</Button>
            </DialogActions>
          </> :
          <>
            <DialogContent>
              <DialogContentText>Correct! New Score: {score}</DialogContentText>  
            </DialogContent>
            <DialogActions>
              <Button onClick={(e) => handleQuestionModalClose(e, null)}>Close</Button>
            </DialogActions>
          </>
          )
      );
    }

    const QuestionButtonGroup = (props) =>
    {
      let category = props.category;
      return (
        <Grid container xs={2} direction="column" id={category} className={styles.gridColumn}>
          <QuestionButton value={200} category={category} disabledStatus={false}></QuestionButton>
          <QuestionButton value={400} category={category} disabledStatus={false}></QuestionButton>
          <QuestionButton value={600} category={category} disabledStatus={false}></QuestionButton>
          <QuestionButton value={800} category={category} disabledStatus={false}></QuestionButton>
          <QuestionButton value={1000} category={category} disabledStatus={false}></QuestionButton>
        </Grid>
      )
    }

    const QuestionButton = (props) =>
    {
      let disabledStatus = props.disabledStatus;
      //const [disabledStatus, setDisabledStatus] = useState(false);

      const handleQuestionClick = (e) =>
      {
          setQuestionInfo({
            category: e.target.attributes.category.value,
            clue: '',
            answer: '',
            value: e.target.value
          });
          disabledStatus = true;
          setDialogOpen(true);
          setAnswered(false);
          setCorrect(false);
      }

      return <Grid item xs={2}><button value={props.value} category={props.category} onClick={handleQuestionClick} disabled={disabledStatus}>{props.value}</button></Grid>
    }

    const gridElements = [];
    const gridHeaderElements = [];
    categories.map((category) =>
      {
        gridHeaderElements.push(
          <Grid item key={category} xs={2}>
              <button className={styles.gridHeader} disabled>
                {category}
              </button>
          </Grid>
        );
        gridElements.push(
          <QuestionButtonGroup key={category} category={category}/>
        )
      }
    );

    return(
            remaining > 0 ?
            <div>
                <Dialog open={dialogOpen} disableEscapeKeyDown='false' onClose={handleQuestionModalClose}>
                    <QuestionModal />
                </Dialog>
                Remaining = {remaining}
                <Grid container id="statusBar">
                    <Grid item xs={6}>Score: {score}</Grid>
                    <Grid item xs={6}><Button variant="outlined" onClick={handleQuitGame}>Quit Game</Button></Grid>
                </Grid>
                <Grid container xs={12} id="gameGrid">
                  <Grid item container xs={12} className={styles.gridRow}>
                    {gridHeaderElements}
                  </Grid>                    
                  {gridElements}
                </Grid>
            </div> : <GameFinished score={score}/>
        );
}
