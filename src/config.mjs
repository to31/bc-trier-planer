import dotenv from "dotenv";
dotenv.config();

export default {
    publicUrl: process.env.PUBLIC_URL,
    port: parseInt(process.env.PORT),
    password: process.env.PASSWORD,
    session: {
        secret: process.env.SESSION_SECRET
    },
    gitSecret: process.env.GIT_SECRET
};
