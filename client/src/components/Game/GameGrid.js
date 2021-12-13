import { Grid, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import React, {useState, useEffect} from 'react';
import GameFinished from './GameFinished';
import styles from './Game.module.css';

export default function GameGrid(props)
{
    const [score, setScore] = useState(0);
    const [remaining, setRemaining] = useState(30);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogChildren, setDialogChildren] = useState(<></>)

  //GameSetup sends along the categories
  let categories = props.categories;

  const categoryHeaderElements = [];
  categories.map((category) =>
    categoryHeaderElements.push(
      <Grid item key={category} xs={2}>
        <button className={styles.gridHeader} disabled>
          {category}
        </button>
      </Grid>
    )
  );

  //TODO - when we get question data, build question buttons here and then
  //add the list of elements to the returned HTML
  let questions = {
    level200: [],
    level400: [],
    level600: [],
    level800: [],
    level1000: [],
  };

  //when we click on a question, what should happen?
  //IDEA: modal in which the user does everything, they get their "grade" then, and then
  // when they exit the modal, the question then becomes disabled
  //create a separate component for that piece?

  const handleQuitGame = (e) => {
    setRemaining(0);
  };
    const handleQuestionClick = (e) =>
    {
        e.target.disabled = true;
        setDialogChildren(<DialogTitle>Question</DialogTitle>)
        setDialogOpen(true);
        
    }
    //when we click on a question, what should happen?
    //IDEA: modal in which the user does everything, they get their "grade" then, and then
    // when they exit the modal, the question then becomes disabled
    //create a separate component for that piece?

  //on click of quit button, what should happen?
  //IDEA- pop up modal asking if the user actually wants to quit
  //if so, go to game finished page and send info

    const handleQuestionModalClose = (e) =>
    {

    }

    //on click of quit button, what should happen?
    //IDEA- pop up modal asking if the user actually wants to quit
    //if so, go to game finished page and send info

    // const QuestionModal = (props) =>
    // {
    //     return (
            
    //     );
    // }

    const QuestionButton = (props) =>
    {
        return <Grid item xs={2}><button value={props.value} onClick={handleQuestionClick}>{props.value}</button></Grid>
    }

    return(
            remaining > 0 ?
            <div>
                <Dialog open={dialogOpen}>

                </Dialog>
                <Grid container id="statusBar">
                    <Grid item xs={6}>Score: {score}</Grid>
                    <Grid item xs={6}><Button variant="outlined" onClick={handleQuitGame}>Quit Game</Button></Grid>
                </Grid>
                <Grid container xs={12} id="gameGrid">
                    <Grid container className="gridRow">
                        {categoryHeaderElements}
                    </Grid>
                    <Grid container xs={2} direction="column" id="category1" className="gridColumn">
                        <QuestionButton value={200}></QuestionButton>
                        <QuestionButton value={400}></QuestionButton>
                        <QuestionButton value={600}></QuestionButton>
                        <QuestionButton value={800}></QuestionButton>
                        <QuestionButton value={1000}></QuestionButton>
                    </Grid>
                    <Grid container xs={2} direction="column" id="category2" className="gridColumn">
                        <QuestionButton value={200}></QuestionButton>
                        <QuestionButton value={400}></QuestionButton>
                        <QuestionButton value={600}></QuestionButton>
                        <QuestionButton value={800}></QuestionButton>
                        <QuestionButton value={1000}></QuestionButton>
                    </Grid>
                    <Grid container xs={2} direction="column" id="category3" className="gridColumn">
                        <QuestionButton value={200}></QuestionButton>
                        <QuestionButton value={400}></QuestionButton>
                        <QuestionButton value={600}></QuestionButton>
                        <QuestionButton value={800}></QuestionButton>
                        <QuestionButton value={1000}></QuestionButton>           
                    </Grid>
                    <Grid container xs={2} direction="column" id="category4" className="gridColumn">                    
                        <QuestionButton value={200}></QuestionButton>
                        <QuestionButton value={400}></QuestionButton>
                        <QuestionButton value={600}></QuestionButton>
                        <QuestionButton value={800}></QuestionButton>
                        <QuestionButton value={1000}></QuestionButton>                                  
                    </Grid>
                    <Grid container xs={2} direction="column" id="category5" className="gridColumn">                   
                        <QuestionButton value={200}></QuestionButton>
                        <QuestionButton value={400}></QuestionButton>
                        <QuestionButton value={600}></QuestionButton>
                        <QuestionButton value={800}></QuestionButton>
                        <QuestionButton value={1000}></QuestionButton>
                    </Grid>
                    <Grid container xs={2} direction="column" id="category6" className="gridColumn">                   
                        <QuestionButton value={200}></QuestionButton>
                        <QuestionButton value={400}></QuestionButton>
                        <QuestionButton value={600}></QuestionButton>
                        <QuestionButton value={800}></QuestionButton>
                        <QuestionButton value={1000}></QuestionButton>
                    </Grid>
                </Grid>
            </div> : <GameFinished score={score}/>
        );
}
