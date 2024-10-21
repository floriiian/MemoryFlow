export const showFormHint = (setHintToggle) => {
    setHintToggle(true); // Show the hint
};

export const hideFormHint = (setHintToggle) => {
    setHintToggle(false); // Hide the hint
};

export function setFormHint(setHintText, text) {
    setHintText(text);
}