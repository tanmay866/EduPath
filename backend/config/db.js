import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {console.log("Database Connected")})
    .catch((err) => {console.log("Error While Connecting", err)});
}

export default connectDB;