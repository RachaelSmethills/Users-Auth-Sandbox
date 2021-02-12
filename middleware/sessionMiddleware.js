module.exports = function SessionCheck(req, res, next) {
  console.log("Checking Session");
  if (req.path !== "/login" && !req.session) {
    return res.status(401).send("");
  }
  next();
};
