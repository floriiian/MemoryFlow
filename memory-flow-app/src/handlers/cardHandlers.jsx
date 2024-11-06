import {getRequest, postRequest} from "../api/Requests.jsx";
import {showFormHint} from "./accountHandlers.jsx";

export const checkFlashcard = (question, solution, category) => {

    const isWhitespaceString = str => !str.replace(/\s/g, '').length

    if (category === undefined || category.length === 0  || isWhitespaceString(category)) {
        return "Invalid category, try selecting a different one."
    } else if (solution.length === 0) {
        return "You haven't defined an solution."
    } else if (question.length === 0) {
        return "You haven't defined a question."
    } else if (solution.length > 200) {
        return "Come on, storage isn't free, keep your solution under 200 letters."
    } else if (question.length > 200) {
        return "Come on, storage isn't free, keep your question under 200 letters."
    } else {
        return "valid";
    }
}

export function getData(path) {
    return getRequest(path)
        .then(response => {
            return response;
        })
        .catch(error => {
            console.error("Error Status Code:", error.status);
            console.error("Error Message:", error.message);
            throw new Error(error.message);
        });
}


export function requestCards(path, data) {
    return postRequest(path, data)
        .then(response => {
            return response;
        })
        .catch(error => {
            console.error("Error Status Code:", error.status);
            console.error("Error Message:", error.message);
            throw new Error(error.message);
        });
}
