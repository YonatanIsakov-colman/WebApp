import { NextFunction, Request, Response } from "express";
import userModel, { IUser } from "../models/user_model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AnyExpression } from "mongoose";
import { Document } from "mongoose";


const register = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        res.status(400).send("Email and password required");
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({
            email: email,
            password: hashedPassword
        });
        res.status(200).send(user);
        return;
    } catch (err) {
        console.error(err);
        res.status(400).send();
        return;
    }
};

const generateTokens = (user: IUser): { accessToken: string, refreshToken: string } | null => {
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    const random = Math.random().toString(36).substring(2); // Random string for uniqueness
    const accessToken = jwt.sign(
        { _id: user._id, random }, // Add random string to payload
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
        { _id: user._id, random }, // Add random string to payload
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
};
const login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        res.status(400).send("Email and password required");
        return;
    }
    try {
        const user = await userModel.findOne({ email: email });
        if (!user) {
            res.status(400).send("incorrect email or password");
            return;
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            res.status(400).send("incorrect email or password");
            return;
        }
        const tokens = generateTokens(user);
        if (!tokens) {
            res.status(400).send("Server error: TOKENS ARE NULL");
            return;
        }
        if (!user.refreshTokens) {
            user.refreshTokens = [tokens.refreshToken];
            await user.save();
        }
        else {
            user.refreshTokens.push(tokens.refreshToken);
            await user.save();
        }

        res.status(200).send({
            _id: user._id,
            email: user.email,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
        return;
    } catch (err) {
        console.error(err);
        res.status(400).send(err);
        return;
    }
};

const validateRefreshToken = async (refreshToken: string | undefined) => {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    return new Promise<Document<unknown, {}, IUser> & IUser>((resolve, reject) => {
        if (refreshToken == null) {
            reject("error");
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            reject("error");
            return;
        }
        jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: AnyExpression, payload: AnyExpression) => {
            if (err) {
                reject("error");
                return;
            }
            try {
                const user = await userModel.findById(payload._id);
                if (!user) {
                    reject("error");
                    return;
                }
                if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
                    user.refreshTokens = [];
                    await user.save();
                    reject("error");
                    return;
                }
                resolve(user);
            } catch (err) {
                reject(err);
                return;
            }
        });
    });
}

const logout = async (req: Request, res: Response) => {

    try {
        const user = await validateRefreshToken(req.body.refreshToken);
        if (!user) {
          res.status(400).send("error");
          return;
        }
        //remove the token from the user
        user.refreshTokens = user.refreshTokens!.filter((token) => token !== req.body.refreshToken);
        await user.save();
        res.status(200).send("logged out");
      } catch (err) {
        res.status(400).send(err);
        return;
      }
    
};

const refresh = async (req: Request, res: Response) => {
        try {
            const user = await validateRefreshToken(req.body.refreshToken);
            if (!user) {
                res.status(400).send("Invalid refresh token");
                return;
            }
            //generate new access token
            const newTokens = generateTokens(user);
            if (!newTokens) {
                user.refreshTokens = [];
                await user.save();
                res.status(500).send("Server error: TOKENS ARE NULL");
                return;
            }
            //delete old refresh token
            user.refreshTokens = user.refreshTokens!.filter((token: string) => token !== req.body.refreshToken);
            //save new refresh token in the user's refresh token list
            user.refreshTokens.push(newTokens.refreshToken);
            await user.save();
            //return new access token and refresh token
            res.status(200).send({
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken
            });

        } catch (err) {
            res.status(400).send(err);
            return;
        }
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        res.sendStatus(400).send();
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.status(400).send("Server error: TOKEN_SECRET not set");
        return;
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err: AnyExpression, payload: AnyExpression) => {
        if (err) {
            res.status(400).send();
            return;
        }
        req.query.userId = payload._id;
        next();
    });
};
export default { register, login, logout, refresh };