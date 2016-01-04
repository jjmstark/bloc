function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      forEach = __helpers.f,
      forEachProp = __helpers.fp,
      escapeXml = __helpers.x;

  return function render(data, out) {
    out.w('<p> will this appear in contractFunctions </p>');

    forEach(data.contractMeta, function(contract) {
      out.w('<div>');

      forEachProp(contract.symTab, function(symbol,symbolObj) {
        out.w('<div>');

        if (symbolObj.jsType == 'Function') {
          out.w('<div><b>' +
            escapeXml(symbol) +
            '</b>');

          forEachProp(symbolObj, function(key,val) {
            out.w('<div><b>' +
              escapeXml(key) +
              '</b>: ' +
              escapeXml(val) +
              '</div>');
          });

          out.w(' </div>');
        }

        out.w('</div>');
      });

      out.w('</div>');
    });
  };
}
(module.exports = require("marko").c(__filename)).c(create);