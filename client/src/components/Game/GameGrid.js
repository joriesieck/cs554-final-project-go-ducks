import { Grid, Button } from '@mui/material';
import React, {useState, useEffect} from 'react';
import GameFinished from './GameFinished';
import './Game.module.css'

export default function GameGrid(props)
{
    const [score, setScore] = useState(0);
    const [remaining, setRemaining] = useState(30);

    //GameSetup sends along the categories
    let categories = props.categories;

    const categoryHeaderElements = [];
    categories.map((category) =>
        categoryHeaderElements.push(<Grid item key={category} xs={2}><button className="gridHeader" disabled>{category}</button></Grid>)
    )


    //TODO - when we get question data, build question buttons here and then
    //add the list of elements to the returned HTML
    let questions =
    {
        level200: [],
        level400: [],
        level600: [],
        level800: [],
        level1000: [],
    };

    const handleQuestionClick = (e) =>
    {
        
    }
    //when we click on a question, what should happen?
    //IDEA: modal in which the user does everything, they get their "grade" then, and then
    // when they exit the modal, the question then becomes disabled
    //create a separate component for that piece?

    const handleQuitGame = (e) =>
    {
        setRemaining(0);
    }

    //on click of quit button, what should happen?
    //IDEA- pop up modal asking if the user actually wants to quit
    //if so, go to game finished page and send info

    return(
            remaining > 0 ?
            <div>
                <Grid container id="statusBar">
                    <Grid item xs={6}>Score: {score}</Grid>
                    <Grid item xs={6}><Button variant="outlined" onClick={handleQuitGame}>Quit Game</Button></Grid>
                </Grid>
                <Grid container xs={12} id="gameGrid">
                    <Grid container className="gridRow">
                        {categoryHeaderElements}
                    </Grid>
                    <Grid container xs={2} direction="column" id="category1" className="gridColumn">
                        <Grid item xs={2}><button>200</button></Grid>
                        <Grid item xs={2}><button>400</button></Grid>
                        <Grid item xs={2}><button>600</button></Grid>
                        <Grid item xs={2}><button>800</button></Grid>
                        <Grid item xs={2}><button>1000</button></Grid>
                    </Grid>
                    <Grid container xs={2} direction="column" id="category2" className="gridColumn">
                        <Grid item xs={2}><button>200</button></Grid>
                        <Grid item xs={2}><button>400</button></Grid>
                        <Grid item xs={2}><button>600</button></Grid>
                        <Grid item xs={2}><button>800</button></Grid>
                        <Grid item xs={2}><button>1000</button></Grid>
                    </Grid>
                    <Grid container xs={2} direction="column" id="category3" className="gridColumn">
                        <Grid item xs={2}><button>200</button></Grid>
                        <Grid item xs={2}><button>400</button></Grid>
                        <Grid item xs={2}><button>600</button></Grid>
                        <Grid item xs={2}><button>800</button></Grid>
                        <Grid item xs={2}><button>1000</button></Grid>                
                    </Grid>
                    <Grid container xs={2} direction="column" id="category4" className="gridColumn">                    
                        <Grid item xs={2}><button>200</button></Grid>                    
                        <Grid item xs={2}><button>400</button></Grid>                    
                        <Grid item xs={2}><button>600</button></Grid>                    
                        <Grid item xs={2}><button>800</button></Grid>                    
                        <Grid item xs={2}><button>1000</button></Grid>                                       
                    </Grid>
                    <Grid container xs={2} direction="column" id="category5" className="gridColumn">                   
                        <Grid item xs={2}><button>200</button></Grid>
                        <Grid item xs={2}><button>400</button></Grid>
                        <Grid item xs={2}><button>600</button></Grid>
                        <Grid item xs={2}><button>800</button></Grid>
                        <Grid item xs={2}><button>1000</button></Grid>
                    </Grid>
                    <Grid container xs={2} direction="column" id="category6" className="gridColumn">                   
                        <Grid item xs={2}><button>200</button></Grid>
                        <Grid item xs={2}><button>400</button></Grid>
                        <Grid item xs={2}><button>600</button></Grid>
                        <Grid item xs={2}><button>800</button></Grid>
                        <Grid item xs={2}><button>1000</button></Grid>
                    </Grid>
                </Grid>
            </div> : <GameFinished score={score}/>
        );
}
