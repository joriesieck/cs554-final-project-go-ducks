import { Grid, Button } from '@mui/material';
import React, {useState, useEffect} from 'react';
import './Game.css'

export default function GameGrid(props)
{
    const [score, setScore] = useState(0);
    const [remaining, setRemaining] = useState(30);

    let {
        categories
    } = props;
    //get categories and question data from API based on whether the user wants
    //random categories or ones of their choice

    //when we click on a question, what should happen?
    //IDEA: modal in which the user does everything, they get their "grade" then, and then
    // when they exit the modal, the question then becomes disabled
    //create a separate component for that piece?

    //TODO create game status bar so that we have score

    //TODO create helper function to build header boxes

    return(
        <div>
            <Grid container xs={12} className="gameGrid">
                <Grid container>
                    <Grid item>Score: {score}</Grid>
                    <Grid item><Button variant="outlined">Quit Game</Button></Grid>
                </Grid>
                <Grid container className="gridRow">
                    <Grid item xs={2}><button disabled>1</button></Grid>
                    <Grid item xs={2}><button disabled>2</button></Grid>
                    <Grid item xs={2}><button disabled>3</button></Grid>
                    <Grid item xs={2}><button disabled>4</button></Grid>
                    <Grid item xs={2}><button disabled>5</button></Grid>
                    <Grid item xs={2}><button disabled>6</button></Grid>
                </Grid>
                <Grid container className="gridRow">
                    <Grid item xs={2}><button>200</button></Grid>
                    <Grid item xs={2}><button>200</button></Grid>
                    <Grid item xs={2}><button>200</button></Grid>
                    <Grid item xs={2}><button>200</button></Grid>
                    <Grid item xs={2}><button>200</button></Grid>
                    <Grid item xs={2}><button>200</button></Grid>
                </Grid>
                <Grid container className="gridRow">
                    <Grid item xs={2}><button>400</button></Grid>
                    <Grid item xs={2}><button>400</button></Grid>
                    <Grid item xs={2}><button>400</button></Grid>
                    <Grid item xs={2}><button>400</button></Grid>
                    <Grid item xs={2}><button>400</button></Grid>
                    <Grid item xs={2}><button>400</button></Grid>
                </Grid>
                <Grid container className="gridRow">
                    <Grid item xs={2}><button>600</button></Grid>
                    <Grid item xs={2}><button>600</button></Grid>
                    <Grid item xs={2}><button>600</button></Grid>
                    <Grid item xs={2}><button>600</button></Grid>
                    <Grid item xs={2}><button>600</button></Grid>
                    <Grid item xs={2}><button>600</button></Grid>                   
                </Grid>
                <Grid container className="gridRow">                    
                    <Grid item xs={2}><button>800</button></Grid>                    
                    <Grid item xs={2}><button>800</button></Grid>                    
                    <Grid item xs={2}><button>800</button></Grid>                    
                    <Grid item xs={2}><button>800</button></Grid>                    
                    <Grid item xs={2}><button>800</button></Grid>                    
                    <Grid item xs={2}><button>800</button></Grid>                    
                </Grid>
                <Grid container className="gridRow">                   
                    <Grid item xs={2}><button>1000</button></Grid>
                    <Grid item xs={2}><button>1000</button></Grid>
                    <Grid item xs={2}><button>1000</button></Grid>
                    <Grid item xs={2}><button>1000</button></Grid>
                    <Grid item xs={2}><button>1000</button></Grid>
                    <Grid item xs={2}><button>1000</button></Grid>
                </Grid>
            </Grid>
        </div>
    );
}
