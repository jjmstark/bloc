function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      forEach = __helpers.f,
      escapeXml = __helpers.x;

  return function render(data, out) {
    out.w('<p> will this appear in contractStatus </p>');

    forEach(data.contractMeta, function(cs) {
      out.w('<div style="border: 1px solid black; padding: 10px; margin-bottom: 1em;"><h2>' +
        escapeXml(cs.name) +
        ' compiled </h2></div>');
    });
  };
}
(module.exports = require("marko").c(__filename)).c(create);