import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function GameFinished(props) {
  let score = props.score;
  let gameType = props.gameType;
  let scoreToBeat;
  let friend;
  if (gameType === 'saved')
  {
    scoreToBeat = props.scoreToBeat;
  }

  if (gameType === 'saved' || gameType === 'friends')
  {
    friend = props.friend;
  }

  return (
    <div>
      <p>Your final score is {score}</p>
      {gameType === 'friends' ? <>This game was played with {friend} - your score {score} will be sent along with the game</> : <></>}
      {friend ? <p>Playing against {friend}</p> : <></>}
      {gameType === 'saved' ? 
      (score > scoreToBeat ? <p>You Win!</p> : ((score === scoreToBeat) ? <p>You have tied!</p> : <p>You lost!</p>)) 
      : <></>
      }
      <br></br>
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
