import {Button} from '@mui/material';
import {Link} from 'react-router-dom';

export default function GameFinished(props)
{
    let score = props.score;

    return(
        <div>
            <p>Your final score is {score}</p>
            <Button component={Link} to="/game" variant="contained" className="landingButton">Start another Game</Button>
            <Button component={Link} to="/home" variant="contained" className="landingButton">Back to Home</Button>
        </div>
    );
}