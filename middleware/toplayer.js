module.exports = function moo(req, res, next) {
  console.log("Welcome caller");
  next();
};
