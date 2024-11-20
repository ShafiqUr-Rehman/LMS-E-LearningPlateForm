class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);       // super() is used to call the constructor of the parent class. it passes the message argument to the error calsss constructor, which set the error message for the instance
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const handleMongoError = (err) => {
    if (err.name === 'MongoError' && err.code === 11000) {
        return new ErrorHandler('Duplicate field value entered', 400);
    }
    if (err.name === 'ValidationError') {
        return new ErrorHandler('Validation Error', 400);
    }
    return err;
};

export const handleJWTError = () => new ErrorHandler('Invalid token. Please log in again!', 401);
export const handleJWTExpiredError = () => new ErrorHandler('Your token has expired! Please log in again.', 401);

export default ErrorHandler;
