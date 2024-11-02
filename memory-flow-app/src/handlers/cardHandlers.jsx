export const checkFlashcard = (question, solution, category) => {
    if (category === null) {
        return "Invalid category, try selecting a different one."
    } else if (solution.length === 0) {
        return "You haven't defined an answer."
    } else if (question.length === 0) {
        return "You haven't defined a question."
    } else if (solution.length > 200) {
        return "Come on, storage isn't free, keep your answer under 200 letters."
    } else if (question.length > 200) {
        return "Come on, storage isn't free, keep your question under 200 letters."
    } else {
        return "valid";
    }
}
