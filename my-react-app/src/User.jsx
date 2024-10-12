import PropTypes from "prop-types";

// Components can be used as variables that are
// always available to change through JS directly

function User (args){
    return(
        <div>
            <p>Username: {args.username} Level: {args.userlevel} </p>
        </div>
    )
}
// Props can be used to define default values or check for types

User.propTypes = {
    username: PropTypes.string,
    userlevel: PropTypes.number,
}

User.defaultProps = {
    username: null,
    userlevel: 0,
}

export default User;