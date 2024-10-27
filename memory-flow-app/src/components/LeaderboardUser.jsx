import '../Navbar.css'
import loginLogo from "../assets/sidebar-icons/user.png";

function LeaderboardUser(props) {

    return (
        <>
            <div className= {props.highlight === true ?"leaderboard-user highlighted" : "leaderboard-user" }>
                <span>{props.place}</span>
                <img src={loginLogo} alt="Level logo"/><
                span>{props.username}</span>
                <span> {props.xp} XP</span>
            </div>
        </>
    );
}

export default LeaderboardUser;

