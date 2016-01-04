function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      ___header_template = __helpers.l(require.resolve("../header/template")),
      ___contractJS_template = __helpers.l(require.resolve("../contractJS/template")),
      ___contractFunctionsCall_template = __helpers.l(require.resolve("../contractFunctionsCall/template")),
      ___login_template = __helpers.l(require.resolve("../login/template")),
      ___contractStatus_template = __helpers.l(require.resolve("../contractStatus/template"));

  return function render(data, out) {
    out.w('<!DOCTYPE html> <html lang="en">');

    ___header_template.render({}, out);

    ___contractJS_template.render({"apiURL": data.apiURL}, out);

    out.w('<body><div class="col-md-9" id="functionsDiv">');

    ___contractFunctionsCall_template.render({"contractMeta": data.contractMeta, "body": __helpers.c(out, function() {
      ___login_template.render({}, out);
    })}, out);

    out.w('</div><body onload="afterTX()">');

    ___login_template.render({}, out);

    ___contractStatus_template.render({"contractMeta": data.contractMeta}, out);

    out.w('</body></body></html>');
  };
}
(module.exports = require("marko").c(__filename)).c(create);