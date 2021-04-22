const isProd = process.env.NODE_ENV === "production";

module.exports = {
  assetPrefix: isProd ? "./" : undefined,
  // basePath: isProd ? "/first-words" : undefined,
};
