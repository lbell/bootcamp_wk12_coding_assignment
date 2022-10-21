const Airtable = require("airtable");
const token = "keybsgJSLCrQQypOc";
const base = new Airtable({ apiKey: token }).base("appsfIzAmNObyh7GY");

// Start us fresh
reloadTable();

/**
 * Reloads the table by:
 * 1) clearing the current table
 * 2) Getting data from airtable
 * 3) Inserting rows for each record
 */
function reloadTable() {
  const table = document.getElementById("main-table");
  const tbody = table.getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";

  base("weather_raw")
    .select({
      view: "Grid view",
    })
    .firstPage(function (err, records) {
      if (err) {
        console.error(err);
        return;
      }
      records.forEach(function (record) {
        let newRow = tbody.insertRow(-1);
        newRow.insertCell(-1).innerHTML = record.get("date");
        newRow.insertCell(-1).innerHTML = record.get("current_temp");
        newRow.insertCell(-1).innerHTML = record.get("snow_inches");
        newRow.insertCell(-1).innerHTML = record.get("water_inches");
        newRow.insertCell(-1).innerHTML =
          `<button type='button' class='btn btn-outline-secondary btn-sm' onclick='getEditForm("${record.id}")'>Edit</button> ` +
          `<button type='button' class='btn btn-outline-secondary btn-sm' onclick='deleteRecord("${record.id}")'>Delete</button>`;
      });
      // Once the data is populated, set the min-height of the table to its
      // current height.
      setTableHeight();
      // Set the action button to addRecord()
      setActionButton("add");
    });
}

/**
 * Adds a record
 *
 * Pulls data from the current form field values.
 */
function addRecord() {
  base("weather_raw").create(
    [
      {
        fields: {
          date: document.getElementById("date").value,
          current_temp: Number(document.getElementById("current_temp").value),
          snow_inches: Number(document.getElementById("snow_inches").value),
          water_inches: Number(document.getElementById("water_inches").value),
        },
      },
    ],
    function (err, records) {
      if (err) {
        console.error(err);
        return;
      }
      cancelForm();
    }
  );
}

/**
 * Deletes a record from Airtable by ID
 *
 * @param {string} record Record ID
 */
function deleteRecord(record) {
  base("weather_raw").destroy(record, function (err, deletedRecord) {
    if (err) {
      console.error(err);
      return;
    }
    reloadTable();
  });
}

/**
 * Pulls data for a single record and populates the form for editing.
 *
 * @param {string} recordId ID of the record to edit
 */
function getEditForm(recordId) {
  setActionButton("edit");
  base("weather_raw").find(recordId, function (err, record) {
    if (err) {
      console.error(err);
      return;
    }
    document.getElementById("recordId").value = record.id;
    document.getElementById("date").value = record.fields.date;
    document.getElementById("current_temp").value = record.fields.current_temp;
    document.getElementById("snow_inches").value = record.fields.snow_inches;
    document.getElementById("water_inches").value = record.fields.water_inches;
  });
}

/**
 * Edits a record by pulling data from the form and applying to API.
 */
function editRecord() {
  base("weather_raw").update(
    document.getElementById("recordId").value,
    {
      date: document.getElementById("date").value,
      current_temp: Number(document.getElementById("current_temp").value),
      snow_inches: Number(document.getElementById("snow_inches").value),
      water_inches: Number(document.getElementById("water_inches").value),
    },
    function (err, record) {
      if (err) {
        console.error(err);
        return;
      }
      cancelForm();
    }
  );
}

/**
 * Function to toggle the onclick function of the action button.
 *
 * @param {string} type add or update
 */
function setActionButton(type) {
  let butt = document.getElementById("action-button");
  butt.innerHTML = `<button type='button' class='btn btn-outline-primary my-4' onclick='${type}Record()'>${type.toUpperCase()}</button>`;
}

function cancelForm() {
  document.getElementById("main-form").reset();
  reloadTable();
  setActionButton("add");
}

/**
 * Simple function to keep the table from boucing around too much... Sets the
 * 'min-height' to the current height of the populated table, so when it's cleared
 * the white space remains. Have to reset the min-height first though, so the table
 * will collapse to it's current height if we delete an element.
 */
function setTableHeight() {
  let table = document.getElementById("main-table");
  table.style.minHeight = "1px";

  let currHeight = table.clientHeight;
  table.style.minHeight = `${currHeight}px`;
}
