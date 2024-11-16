// CompletionScreen.js
import React, { useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const CompletionScreen = (props) => {
    const { category } = useParams();
    const navigate = useNavigate();
    const arcReference = useRef(null);

    useEffect(() => {
        if (props.hasCompleted) {
            props.drawScore(0, props.knowledgePercentage, arcReference);
        }
    }, [props.hasCompleted, props.knowledgePercentage]);

    return (
        <div id="completionScreen">
            <div className="completion-modal" id="innerCScreen">
                <p className="knowledge-message">Your current knowledge</p>
                <div className="content">
                    <div className="container">
                        <div className="bg"/>
                        <div className="arc" ref={arcReference} />
                        <div  className="value">{props.knowledgePercentage}%</div>
                    </div>
                </div>
                <div className="options">
                    <button className="selectbutton completion" onClick={() => { location.reload(); }}>
                        <span>Try again</span>
                    </button>
                    <a onClick={() => { navigate("/my_cards") }}>
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