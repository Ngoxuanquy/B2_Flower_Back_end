const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const shopModel = require("../models/shop.model");
const emailModel = require("../models/email.model");

const KeyTokenService = require("./keyToken.service");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const randomstring = require("randomstring");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITTOR: "EDITTOR",
  ADMIN: "ADMIN",
};
let globalVerificationCode = "";
class AccessService {
  static handleRefreshTokenV2 = async ({ user, keyStore, refreshToken }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happend !! Pls relogin");
    }

    if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError("Shop not register 1");

    const foundShop = await findByEmail({ email });

    if (!foundShop) throw new AuthFailureError("Shop not register 2");

    const tokens = await createTokenPair({ userId: foundShop._id, email }, keyStore.publicKey, keyStore.privateKey);

    await keyStore.update({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user,
      tokens,
    };
  };

  // static handleRefreshToken = async (refreshToken) => {
  //     const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
  //     if (foundToken) {
  //         const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
  //         console.log('[1] -- ', { userId, email })
  //         await KeyTokenService.deleteKeyById(userId)
  //         throw new ForbiddenError('Something wrong happend !! Pls relogin')
  //     }

  //     const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
  //     if (!holderToken) throw new AuthFailureError('Shop not register 1')

  //     const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)

  //     console.log('[2] -- ', { userId, email })

  //     const foundShop = await findByEmail({ email })
  //     if (!foundShop) throw new AuthFailureError('Shop not register 2')

  //     const tokens = await createTokenPair(
  //         { userId: foundShop._id, email },
  //         holderToken.publicKey,
  //         holderToken.privateKey
  //     )

  //     await holderToken.update({
  //         $set: {
  //             refreshToken: tokens.refreshToken,
  //         },
  //         $addToSet: {
  //             refreshTokensUsed: refreshToken,
  //         },
  //     })

  //     return {
  //         user: { userId, email },
  //         tokens,
  //     }
  // }

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log({ delKey });
    return delKey;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    try {
      const foundShop = await findByEmail({ email });

      if (!foundShop) throw new BadRequestError("Shop not registered");

      if (foundShop.status == "active") {
        const match = await bcrypt.compare(password, foundShop.password);

        if (!match) throw new AuthFailureError("Authentication error");

        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const tokens = await createTokenPair({ userId: foundShop._id, email }, publicKey, privateKey);

        await KeyTokenService.createKeyToken({
          userId: foundShop._id,
          refreshToken: tokens.refreshToken,
          publicKey,
          privateKey,
        });

        return {
          shop: getInfoData(["_id", "name", "email", "roles", "verify"], foundShop),
          tokens,
          status: "Đăng Nhập Thành Công1",
        };
      } else {
        return {
          status: "Tài Khoản Bạn Đã Bị Khóa!!",
        };
      }
    } catch (error) {
      return {
        code: "xxx",
        msg: error.message,
        status: "error",
      };
    }
  };

  static loginFB_GG = async ({ name, email, password }) => {
    try {
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        const match = await bcrypt.compare(password, holderShop.password);

        if (!match) throw new AuthFailureError("Authentication error");

        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const tokens = await createTokenPair({ userId: holderShop._id, email }, publicKey, privateKey);
        await KeyTokenService.createKeyToken({
          userId: holderShop._id,
          refreshToken: tokens.refreshToken,
          publicKey,
          privateKey,
        });

        return {
          shop: getInfoData(["_id", "name", "email", "roles", "verify"], holderShop),
          tokens,
          status: "Đăng Nhập Thành Công1",
        };
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const tokens = await createTokenPair({ userId: newShop.id }, publicKey, privateKey);

        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
          refreshToken: tokens.refreshToken,
        });

        if (!publicKeyString) {
          return {
            code: "xxxx",
            message: "publicKeyString error",
          };
        }

        return {
          shop: getInfoData(["_id", "name", "email", "verify"], newShop),
          tokens,
          status: "success",
        };
      }

      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      return {
        code: "xxx",
        msg: error.message,
        status: "error",
      };
    }
  };

  static async updateVerify({ id }) {
    const query = { _id: id };
    const updateSet = {
      $set: {
        verify: true,
      },
    };
    const updateCart = await shopModel.updateOne(query, updateSet);

    return updateCart;
  }

  static async updateRoles(params) {
    const query = { _id: params.id };
    const updateSet = {
      $set: {
        name: params.name,
        email: params.email,
        roles: params.roles,
      },
    };
    const updateCart = await shopModel.updateOne(query, updateSet);

    return updateCart;
  }

  static async getRoles({ userId }) {
    console.log({ userId });
    const user = await shopModel.findOne({ _id: userId }).lean();
    console.log({ user });
    return user.roles;
  }

  static signUp = async ({ name, email, password }) => {
    try {
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        throw new BadRequestError("Error: Shop already registered");
      }
      const verificationCode = randomstring.generate(6);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ngoxuanquy1812@gmail.com",
          pass: "bgoz fvvx raus cqjo", // Consider using environment variables for sensitive information
        },
      });

      const mailOptions = {
        from: "ngoxuanquy1812@gmail.com",
        to: email,
        subject: "Verification Code",
        text: `Your verification code is: ${verificationCode}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          emailModel.create({
            email: email,
            code: verificationCode,
          });
        }
      });

      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      return {
        code: "xxx",
        msg: error.message,
        status: "error",
      };
    }
  };

  static verifile = async ({ email, password, code }) => {
    const codeShop = await emailModel.findOne({ email }).lean();
    if (!codeShop) {
      return "Tài khoản chưa đăng ký";
    }
    if (code == codeShop.code) {
      const passwordHash = await bcrypt.hash(password, 10);
      console.log(passwordHash);
      const newShop = await shopModel.create({
        name: email,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });
      if (newShop) {
        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");
        const tokens = await createTokenPair({ userId: newShop.id }, publicKey, privateKey);
        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
          refreshToken: tokens.refreshToken,
        });
        if (!publicKeyString) {
          return {
            code: "xxxx",
            message: "publicKeyString error",
          };
        }
        return {
          shop: getInfoData(["_id", "name", "email", "verify"], newShop),
          tokens,
          status: "success",
        };
      }
    } else {
      return "Sai mã code";
    }
  };
}

module.exports = AccessService;
