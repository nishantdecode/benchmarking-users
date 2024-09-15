module.exports =
  (...arg) =>
  async (req, res, next) => {
    try {
      function check(arg) {
        for (let element of arg) {
          if (req.user.role.type === element) return true;
        }
        return false;
      }
      if (check(arg)) {
        next();
      } else
        throw new Error(
          `Sorry, but only ${arg.map((ele) => `${ele}, `)} can access`
        );
    } catch (err) {
      res.status(401).send(err.message);
    }
  };
