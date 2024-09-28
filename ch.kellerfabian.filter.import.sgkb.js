// @id = ch.kellerfabian.filter.import.sgkb
// @api = 1.0
// @pubdate = 2020-06-30
// @publisher = Fabian Keller
// @description = St. Galler Kantonalbank (*.csv) (by Fabian Keller)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)

/* CSV file example:
Datum;Valuta;Typ;Buchungstext;Belastung;Gutschrift;Saldo;
"2019-01-01";"Buchung","Income transaction text";"100.00";""
"2019-02-02";"Buchung","Expense transaction text";"";"200.00"
*/

Banana.console.log("starting");
/**
 * Parse the data and return the data to be imported as a tab-separated file.
 */
function exec(string) {
  string = cleanupText(string);
  var fieldSeparator = findSeparator(string);
  var transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');
  findColumnIndex(transactions);

  // Filter transactions and map them
  transactions = transactions.filter(filterTransactions).map(mapTransactions);

  var header = [
    ["Date", "DateValue", "Description", "Notes", "Income", "Expenses"],
  ];
  return Banana.Converter.arrayToTsv(header.concat(transactions));
}

// Column indices specific to this file type
var colDate = 0;
var colDescr = 3; // Buchungstext
var colDebit = 4; // Belastung
var colCredit = 5; // Gutschrift
var colDateValue = 1; // Valuta
var colBalance = 6; // Saldo

/**
 * The function cleanupText is used to remove useless text from input file,
 * in order to permit the conversion of data to table format.
 */
function cleanupText(string) {
  // Remove tabs
  string = string.replace(/\t/g, " ");
  return string;
}

/**
 * The function findColumnIndex ensures that the column indices match
 * the expected structure: Datum, Valuta, Typ, Buchungstext, Belastung, Gutschrift, Saldo
 */
function findColumnIndex(transactions) {
  // Assuming the header structure is always the same
  if (transactions.length >= 1 && transactions[0].length >= 7) {
    colDate = 0; // Datum
    colDateValue = 1; // Valuta
    colDescr = 3; // Buchungstext
    colDebit = 4; // Belastung
    colCredit = 5; // Gutschrift
    colBalance = 6; // Saldo
  }
}

/**
 * The function findSeparator is used to detect the field separator.
 */
function findSeparator(string) {
  var commaCount = 0,
    semicolonCount = 0,
    tabCount = 0;

  for (var i = 0; i < 1000 && i < string.length; i++) {
    var c = string[i];
    if (c === ",") commaCount++;
    else if (c === ";") semicolonCount++;
    else if (c === "\t") tabCount++;
  }

  if (tabCount > commaCount && tabCount > semicolonCount) return "\t";
  else if (semicolonCount > commaCount) return ";";
  return ",";
}

/**
 * The function filterTransactions is used to filter valid transactions.
 */
function filterTransactions(element) {
  // Keep rows that have a date and a description
  return element[colDate].length > 0 && element[colDescr].length > 0;
}

/**
 * The function mapTransactions maps the filtered data to the required format.
 * It also filters out dynamic references like "Ref.-Nr. 1450631539".
 */
function mapTransactions(element) {
  var mappedLine = [];

  if (!element[colDate] || !element[colDescr]) {
    mappedLine.push(""); // Empty fields for errors
    mappedLine.push("");
    mappedLine.push("Error importing data");
    mappedLine.push("");
    mappedLine.push("");
    mappedLine.push("");
    return mappedLine;
  }

  // Replace dynamic "Ref.-Nr. <number>" with "Zahlung"
  var description = element[colDescr].replace(/Ref\.-Nr\.\s*\d+/g, "Zahlung");

  mappedLine.push(Banana.Converter.toInternalDateFormat(element[colDate])); // Date
  mappedLine.push(Banana.Converter.toInternalDateFormat(element[colDateValue])); // DateValue
  mappedLine.push(description); // Description
  mappedLine.push(""); // Notes (empty)

  if (element[colCredit].length > 0)
    mappedLine.push(
      Banana.Converter.toInternalNumberFormat(element[colCredit], ".")
    );
  // Income
  else mappedLine.push("");

  if (element[colDebit].length > 0)
    mappedLine.push(
      Banana.Converter.toInternalNumberFormat(element[colDebit], ".")
    );
  // Expenses
  else mappedLine.push("");

  return mappedLine;
}

Banana.console.log("done");
