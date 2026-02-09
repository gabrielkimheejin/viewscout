const mammoth = require("mammoth");
const path = "/Users/gabykim/Downloads/유튜브 수익 예측 알고리즘 구현.docx";

mammoth.extractRawText({ path: path })
    .then(function (result) {
        console.log("Revenue Logic Content:");
        console.log(result.value);
    })
    .catch(function (err) {
        console.error(err);
    });
