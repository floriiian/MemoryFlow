import React, {useState} from "react";
import editIcon from '../assets/edit_icon.png'
import deleteIcon from '../assets/delete.png'
import {useParams} from "react-router-dom";
import leaveForm from "../assets/leave.png";

const ExitScreen = (props) => {
    return (
        <div className="quit_form">
            <div id="options">
                <img src={leaveForm} alt={"Leave"}/>
                <p>If you leave now, all your progress will be lost.</p>
                <button onClick={() => {
                    props.toggleQuitScreen();
                }} className="btn selectbutton">
                    <span>Keep learning</span>
                </button>
                <a onClick={() => {
                    props.backToCards();
                    localStorage.setItem('selected-cards', null);
                }}>
                    <button className="btn exit_button">
                        <span>Exit</span>
                    </button>
                </a>
            </div>
        </div>
    );
};
export default ExitScreen;