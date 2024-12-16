import { getUserBySessionToken, getUserbyId } from "../db/users";
import express from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { merge } from "lodash";

export const validateAccessToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    console.log('Passed from middleware')
    const accessToken = req.cookies["ACCESS_TOKEN"];
    const refreshToken = req.cookies["REFRESH_TOKEN"];

    if (!accessToken) {
      return res.status(401).json({message:"Please login first"})
    }

    const { exp } = jwt.decode(accessToken, { json: true });

    if (!(Date.now() >= exp * 1000)) {
      //token not expired
      const payload = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      ) as any;

      const plainUserObject = {
        _id: payload._id,
        username: payload.username,
        email: payload.email,
      };

      if (payload) {
        req.body.user = plainUserObject
        return next();
      } else {
        return res.sendStatus(403); //unauthorized
      }
    } else {
      try {
        //Token has expired
        console.log("Token expired.")
        if(!refreshToken){
            return res.status(401).json({message:"Login first"})
        }

        const payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        ) as any;

        if (!payload) {
          return res.sendStatus(403); // Unauthorized
        }

        const user = await getUserBySessionToken(refreshToken);

        if (!user) {
          return res.sendStatus(403);
        }

        const plainUserObject = {
          _id: user._id,
          username: user.username,
          email: user.email,
        };

        const newAccessToken = jwt.sign(
          plainUserObject,
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "3600s" }
        );

        res.cookie("ACCESS_TOKEN", newAccessToken, {
          httpOnly: true,
          path: "/",
        });

        req.body.user = plainUserObject;
        return next();
      } catch (e) {
        console.log("error on verify token: ", e);
        return res.sendStatus(403);
      }
    }
  } catch (e) {
    console.log("error from middlewares / validAccessToken", e);
    return res.sendStatus(403); //Unauthorized
  }
};
