import User from "../models/userModel.js";

const generateUserId = async (firstName, lastName) => {
    const year = new Date().getFullYear();
    const prefix =
        firstName.slice(0, 2).toUpperCase() +
        lastName.slice(0, 2).toUpperCase();

    const count = await User.countDocuments();
    const serial = String(count + 1).padStart(3, "0");

    return `${prefix}${year}${serial}`;
};

export default generateUserId;
