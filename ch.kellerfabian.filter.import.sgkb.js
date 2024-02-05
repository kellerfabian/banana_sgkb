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
"Date";"Description";"Income","Expenses"
"2019-01-01";"Income transaction text";"100.00";""
"2019-02-02";"Expense transaction text";"";"200.00"
*/


Banana.console.log("starting");

// Parse the data and return the data to be imported as a tab separated file.
function exec(inText) {

   // Convert a csv file to an array of array.
   // Parameters are: text to convert, values separator, delimiter for text values
   var csvFile = Banana.Converter.csvToArray(inText, ';', '"');
   
   // Converts a table (array of array) to a tsv file (tabulator separated values)
   var tsvFile = Banana.Converter.arrayToTsv(csvFile);
   
   // Return the converted tsv file
   return tsvFile;

}

Banana.console.log("finished");