const { expressjwt: jwt } = require("express-jwt");

require("dotenv/config");
const api = process.env.API_URL;

const auth = function () {
  return jwt({
    secret: process.env.SECRET,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      `${api}/user/login`,
      `${api}/user/register`,
      { url: `${api}/products`, methods: ["GET"] },
      `${api}/products/name/img`,
      `${api}/products/get/featured`,
      {
        url: new RegExp(`^${api}/products/get/featured(?:\/\\d+)?$`),
        methods: ["GET"],
      },
      // {
      //   url : `/public/uploads/:filename`,method : ["GET"]
      // },
      {url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS'] },
      { url: `${api}/category`, methods: ["GET"] },
    ],
  });
};

async function isRevoked(req, jwt) {
  const payload = jwt.payload;
  if (!payload.isAdmin) {
    return true;
  }
  return false;
}

module.exports = auth;
