import '../Navbar.css'
import loginLogo from "../assets/sidebar-icons/user.png";

function LeaderBoardUser(props) {

    return (
        <>
            <div className="leaderboard-user">
                <span>{props.place}</span>
                <img src={loginLogo} alt="Level logo"/><
                span>{props.username}</span>
                <span> {props.xp} XP</span>
            </div>
        </>
    );
}

export default LeaderBoardUser;

