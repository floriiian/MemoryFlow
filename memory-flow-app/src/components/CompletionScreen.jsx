import React, {useState} from "react";
import editIcon from '../assets/edit_icon.png'
import deleteIcon from '../assets/delete.png'
import {useParams} from "react-router-dom";

const CompletionScreen = (props) => {

    const {category} = useParams();

    return (
        <div id="completionScreen">
            <div className="modal" id="innerCScreen">
                <p className="message">Your current knowledge</p>
                <div className="content">
                    <div className="container">
                        <div className="bg"/>
                        <div className="arc"/>
                        <div className="value">75%</div>
                    </div>
                </div>
                <div className="options">
                    <button className="btn" onClick="restartQuiz()">
                        <span>Try again</span>
                    </button>
                    <a href="http://localhost:63342/JLearn/src/main/resources/public/startpage.html">
                        <button className="btn">
                            <span>Exit</span>
                        </button>
                    </a>
                </div>
            </div>
        </div>
    );
};
export default CompletionScreen;