import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function GameFinished(props) {
  let score = props.score;

  return (
    <div>
      <p>Your final score is {score}</p>
      {props.gameType === 'friends' ? <>This game was played with a friend - your score will be sent</> : <></>}
      <Button
        variant="contained"
        className="landingButton"
        onClick={() => window.location.reload()}
      >
        Start another Game
      </Button>
      <Button
        component={Link}
        to="/home"
        variant="contained"
        className="landingButton"
      >
        Back to Home
      </Button>
    </div>
  );
}
