import React, {useState} from "react";
import editIcon from '../assets/edit_icon.png'
import deleteIcon from '../assets/delete.png'
import {useNavigate, useParams} from "react-router-dom";

const CompletionScreen = (props) => {

    const {category} = useParams();
    const navigate = useNavigate();

    return (
        <div id="completionScreen">
            <div className="completion-modal" id="innerCScreen">
                <p className="knowledge-message">Your current knowledge</p>
                <div className="content">
                    <div className="container">
                        <div className="bg"/>
                        <div className="arc"/>
                        <div className="value">{props.knowledgePercentage}%</div>
                    </div>
                </div>
                <div className="options">
                    <button className="selectbutton completion" onClick={() => {location.reload();}}>
                        <span>Try again</span>
                    </button>
                    <a onClick={() => {navigate("/my_cards")}}>
                        <button className="selectbutton completion">
                            <span>BACK TO MY CARDS</span>
                        </button>
                    </a>
                </div>
            </div>
        </div>
    );
};
export default CompletionScreen;