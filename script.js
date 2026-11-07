// ============================================================
// Solstice Game Showcase - venue data model
// Live showcase auditorium setup.
// Seats generated from JS object (not hardcoded in HTML).
// ============================================================

const showcase = {
  name: "Solstice Game Showcase",
  event: "Live from Los Angeles",
  date: "June 12, 2:00 PM PT",
  venueType: "auditorium",
  currency: "USD",
  maxTicketsPerOrder: 6,

  // Section price zones with dynamic row widths and aisle placements.
  // aisleAfter: [5, 13] inserts aisles after seats 5 and 13.
  sections: [
    {
      id: "pit",
      name: "Premiere Pit",
      price: 180,
      rows: [
        { label: "A", seats: 10, aisleAfter: [] },
        { label: "B", seats: 12, aisleAfter: [] }
      ]
    },
    {
      id: "floor",
      name: "Main Floor",
      price: 120,
      rows: [
        { label: "C", seats: 16, aisleAfter: [4, 12] },
        { label: "D", seats: 16, aisleAfter: [4, 12] },
        { label: "E", seats: 18, aisleAfter: [5, 13] },
        { label: "F", seats: 18, aisleAfter: [5, 13] },
        { label: "G", seats: 20, aisleAfter: [5, 15] },
        { label: "H", seats: 20, aisleAfter: [5, 15] }
      ]
    },
    {
      id: "lower",
      name: "Sunset Terrace",
      price: 85,
      rows: [
        { label: "J", seats: 22, aisleAfter: [6, 16] },
        { label: "K", seats: 22, aisleAfter: [6, 16] },
        { label: "L", seats: 24, aisleAfter: [6, 18] },
        { label: "M", seats: 24, aisleAfter: [6, 18] }
      ]
    },
    {
      id: "balcony",
      name: "Skyline Balcony",
      price: 45,
      rows: [
        { label: "N", seats: 24, aisleAfter: [6, 18] },
        { label: "O", seats: 26, aisleAfter: [7, 19] },
        { label: "P", seats: 26, aisleAfter: [7, 19] }
      ]
    }
  ],

  // Camera platform placement (seats blocked/unavailable)
  cameraPlatform: { rows: ["G", "H"], fromSeat: 9, toSeat: 12 },

  // Restricted view pricing for seats directly behind camera equipment
  restrictedView: { rows: ["J"], fromSeat: 10, toSeat: 13, price: 55 },

  // Wheelchair accessible seat designations
  accessibleSeats: ["C-1", "C-16"],

  // Pre-sold seats for testing setup
  soldSeats: ["A-4", "A-5", "D-9", "E-3", "K-11", "K-12", "N-20", "O-1"]
};

// Console check to verify total seat count logic
const totalSeats = showcase.sections.reduce(
  (sum, section) => sum + section.rows.reduce((rowSum, row) => rowSum + row.seats, 0),
  0
);
console.log(`${showcase.name}: ${totalSeats} seats in ${showcase.sections.length} zones`);

// ============================================================
// Seat generation - builds every seat button from the data above
// ============================================================

// All generated seats, stored by ID (e.g. "G-9") so we can look them up later
const seatsById = {};

// True if a seat falls inside a range like the camera platform
function isInRange(rowLabel, seatNumber, range) {
  return range.rows.includes(rowLabel) &&
    seatNumber >= range.fromSeat &&
    seatNumber <= range.toSeat;
}

// Builds one seat object: its ID, zone, price and starting status
function createSeat(section, row, number) {
  const id = `${row.label}-${number}`;
  const restricted = isInRange(row.label, number, showcase.restrictedView);

  let status = "available";
  if (isInRange(row.label, number, showcase.cameraPlatform)) {
    status = "blocked";
  } else if (showcase.soldSeats.includes(id)) {
    status = "sold";
  }

  return {
    id,
    sectionId: section.id,
    sectionName: section.name,
    row: row.label,
    number,
    price: restricted ? showcase.restrictedView.price : section.price,
    restricted,
    accessible: showcase.accessibleSeats.includes(id),
    status
  };
}

// Turns a seat object into a <button> on the map
function createSeatButton(seat) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `seat zone-${seat.sectionId}`;
  button.textContent = seat.number;
  button.dataset.seatId = seat.id;
  button.setAttribute("aria-label", `${seat.sectionName}, row ${seat.row}, seat ${seat.number}`);

  // Sold and blocked seats stay clickable (so we can explain why later),
  // but screen readers are told they are unavailable
  if (seat.status !== "available") {
    button.classList.add(`is-${seat.status}`);
    button.setAttribute("aria-disabled", "true");
  }
  if (seat.restricted) button.classList.add("is-restricted");
  if (seat.accessible) button.classList.add("is-accessible");

  return button;
}

// Draws the stage, then every section, row and seat (with aisle gaps)
function renderVenue() {
  const canvas = document.querySelector("#map-canvas");
  canvas.replaceChildren();

  const stage = document.createElement("div");
  stage.className = "stage";
  stage.textContent = "Main stage";
  canvas.append(stage);

  showcase.sections.forEach(section => {
    const block = document.createElement("div");
    block.className = "section-block";

    const label = document.createElement("p");
    label.className = "section-label";
    label.textContent = `${section.name} – $${section.price}`;
    block.append(label);

    section.rows.forEach(row => {
      const rowElement = document.createElement("div");
      rowElement.className = "seat-row";

      const rowLabel = document.createElement("span");
      rowLabel.className = "row-label";
      rowLabel.textContent = row.label;
      rowElement.append(rowLabel);

      for (let number = 1; number <= row.seats; number++) {
        const seat = createSeat(section, row, number);
        seatsById[seat.id] = seat;
        rowElement.append(createSeatButton(seat));

        // Leave a walkway gap after the seat numbers listed in aisleAfter
        if (row.aisleAfter.includes(number)) {
          const aisle = document.createElement("span");
          aisle.className = "aisle";
          rowElement.append(aisle);
        }
      }

      block.append(rowElement);
    });

    canvas.append(block);
  });
}

// ============================================================
// Legend - zone colours come from the data, states are fixed
// ============================================================

// Seat states shown in the legend, using the same CSS classes as real seats
const seatStates = [
  { label: "Available", className: "zone-floor" },
  { label: "Selected", className: "zone-floor is-inspected" },
  { label: "In your passes", className: "zone-floor is-in-cart" },
  { label: "Restricted view ($55)", className: "zone-lower is-restricted" },
  { label: "Wheelchair space", className: "zone-floor is-accessible" },
  { label: "Unavailable", className: "is-sold" }
];

// Adds one legend line: a small seat-shaped swatch plus its text
function addLegendItem(list, className, text) {
  const item = document.createElement("li");
  const swatch = document.createElement("span");
  swatch.className = `seat swatch ${className}`;
  swatch.setAttribute("aria-hidden", "true");
  item.append(swatch, text);
  list.append(item);
}

function renderLegend() {
  const legend = document.querySelector("#legend");
  legend.replaceChildren();

  showcase.sections.forEach(section => {
    addLegendItem(legend, `zone-${section.id}`, `${section.name} – $${section.price}`);
  });
  seatStates.forEach(state => {
    addLegendItem(legend, state.className, state.label);
  });
}

renderVenue();
renderLegend();
console.log(`${Object.keys(seatsById).length} seat buttons generated`);
