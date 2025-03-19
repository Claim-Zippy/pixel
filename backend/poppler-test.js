const { Poppler } = require("node-poppler");

const file = "upload/1740679602516-459949139-Scanned tariff.pdf";
const poppler = new Poppler();
const options = {
	firstPageToConvert: 1,
	lastPageToConvert: 2,
	pngFile: true,
};
const outputFile = `test_document.png`;

const res = await poppler.pdfToCairo(file, outputFile, options);
console.log(res);