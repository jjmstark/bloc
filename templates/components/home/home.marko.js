function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne;

  return function render(data, out) {
    out.w('<!DOCTYPE html> <html lang="en"><head><meta charset="UTF-8"><title>Bloc Homepage</title></head><body><h1>Inspect your Contracts!</h1><contractNameList></contractNameList></body></html>');
  };
}
(module.exports = require("marko").c(__filename)).c(create);