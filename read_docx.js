const mammoth = require("mammoth");
const fs = require("fs");

const filePath = "/Users/gabykim/Downloads/영상 진단 알고리즘 계산식.docx";

mammoth.extractRawText({ path: filePath })
    .then(function (result) {
        console.log(result.value); // The raw text
        console.log("messages:", result.messages);
    })
    .catch(function (err) {
        console.error(err);
    });
