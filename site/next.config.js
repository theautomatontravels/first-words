const isProd = process.env.NODE_ENV === "production";

module.exports = {
  assetPrefix: isProd ? "/first-words/" : undefined,
  basePath: isProd ? "/first-words" : undefined,
};
