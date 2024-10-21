import validator from "validator";

export const checkCredentials = (username, email, password) => {
    if (username.length === 0 || email.length === 0 || password.length === 0) {
        return "Invalid Credentials, did you forget a field?"
    }

    const USERNAME_REGEX = "^[A-Za-z]\\w{1,20}$";
    const usernameMatcher = username.match(USERNAME_REGEX);

    if (username.length > 20 || username.length < 2) {
        return "Your username has to between 2 and 20 characters long."
    }
    if (!usernameMatcher) {
        return "Your username must start with a letter and cannot contain any special characters."
    }
    let passwordResult = isPasswordValid(password);
    if (passwordResult !== ("valid")) {
        return passwordResult;
    }
    if (!validator.default.isEmail(email)) {
        return "Please enter a valid email address."
    }
    return "valid"
}

function isPasswordValid(password) {

    const isUpperCase = char => /[A-Z]/.test(char);
    const isLowerCase = char => /[a-z]/.test(char);
    const isDigit = char => /\d/.test(char);
    const isSymbol = char => /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(char);

    let passwordLength = password.length;
    if (passwordLength < 10 || passwordLength > 100) {
        return "Your password has to be between 10 and 100 characters long.";
    }

    let hasSymbol = false,
        hasNumber = false,
        hasUppercase = false,
        hasLowercase = false;

    for (const char of password) {
        if (isUpperCase(char)) {
            hasUppercase = true;
        }
        if (isLowerCase(char)) {
            hasLowercase = true;
        }
        if (isDigit(char)) {
            hasNumber = true;
        }
        if (isSymbol(char)) {
            hasSymbol = true;
        }
        if (hasSymbol && hasNumber && hasUppercase && hasLowercase) {
            return "valid";
        }
    }

    let invalidPasswordString = "Your password needs: ";
    if (!hasSymbol) {
        invalidPasswordString += "a symbol, ";
    }
    if (!hasUppercase) {
        invalidPasswordString += "an uppercase letter, ";
    }
    if (!hasLowercase) {
        invalidPasswordString += "a lowercase letter, ";
    }
    if (!hasNumber) {
        invalidPasswordString += "a number, ";
    }
    invalidPasswordString = invalidPasswordString.slice(0, -2) + ".";
    return invalidPasswordString;
}
