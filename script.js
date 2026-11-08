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

// ============================================================
// Seat inspection - clicking a seat only SHOWS its details.
// (Adding to the cart is a separate button, added next.)
// ============================================================

let inspectedSeatId = null;

// The cart only stores seat IDs, e.g. ["C-5", "J-11"].
// Everything else (zone, price...) is looked up in seatsById.
let cart = [];

// Shows prices as US dollars, e.g. 120 -> "$120.00"
const priceFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: showcase.currency });

function formatPrice(amount) {
  return priceFormat.format(amount);
}

// Finds the button for a seat ID, e.g. "G-9"
function getSeatButton(seatId) {
  return document.querySelector(`[data-seat-id="${seatId}"]`);
}

// Moves the "selected" highlight to a new seat (or removes it with null)
function setInspectedSeat(seatId) {
  if (inspectedSeatId) {
    getSeatButton(inspectedSeatId).classList.remove("is-inspected");
  }
  inspectedSeatId = seatId;
  if (seatId) {
    getSeatButton(seatId).classList.add("is-inspected");
  }
}

// Small helper: one "label: value" pair for the pass
function addDetail(list, label, value) {
  const term = document.createElement("dt");
  term.textContent = label;
  const detail = document.createElement("dd");
  detail.textContent = value;
  list.append(term, detail);
}

// Shows a seat's details in the "Selected seat" panel, styled like a festival pass
function showSeatDetails(seat) {
  const body = document.querySelector("#details-body");
  body.replaceChildren();

  // Unavailable seats: explain why instead of showing a pass
  if (seat.status !== "available") {
    setInspectedSeat(null);
    const message = document.createElement("p");
    message.className = "notice";
    message.textContent = seat.status === "blocked"
      ? `Seat ${seat.id} is unavailable: the camera platform covers it. Choose another seat.`
      : `Seat ${seat.id} is already sold. Choose another seat.`;
    body.append(message);
    return;
  }

  setInspectedSeat(seat.id);

  const pass = document.createElement("article");
  pass.className = "pass";
  pass.style.setProperty("--zone-colour", `var(--zone-${seat.sectionId})`);

  const zone = document.createElement("h3");
  zone.textContent = seat.sectionName;

  const details = document.createElement("dl");
  addDetail(details, "Row", seat.row);
  addDetail(details, "Seat", seat.number);
  addDetail(details, "Price", formatPrice(seat.price));

  pass.append(zone, details);

  if (seat.restricted) {
    const note = document.createElement("p");
    note.className = "pass-note";
    note.textContent = "Restricted view: the camera platform is in front of this seat.";
    pass.append(note);
  }
  if (seat.accessible) {
    const note = document.createElement("p");
    note.className = "pass-note";
    note.textContent = "Wheelchair space with easy access from the entrance.";
    pass.append(note);
  }

  // ADD TO CART is the only way a seat goes into the cart
  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "add-button";
  if (cart.includes(seat.id)) {
    addButton.textContent = "In your passes ✓";
    addButton.disabled = true;
  } else {
    addButton.textContent = "ADD TO CART";
    addButton.addEventListener("click", () => addToCart(seat.id));
  }
  pass.append(addButton);

  body.append(pass);

  if (cart.includes(seat.id)) {
    showMessage("This seat is already in your passes. Each seat can only be added once.");
  }
}

// Shows a short message under the pass (e.g. "already added")
function showMessage(text) {
  const body = document.querySelector("#details-body");
  let message = body.querySelector(".pass-message");
  if (!message) {
    message = document.createElement("p");
    message.className = "pass-message";
    body.append(message);
  }
  message.textContent = text;
}

// ============================================================
// Cart
// ============================================================

// Adds a seat to the cart after checking it is allowed
function addToCart(seatId) {
  const seat = seatsById[seatId];

  if (!seat || seat.status !== "available") {
    showMessage("This seat is unavailable and cannot be added.");
    return;
  }
  if (cart.includes(seatId)) {
    showMessage("This seat is already in your passes. Each seat can only be added once.");
    return;
  }

  cart.push(seatId);
  getSeatButton(seatId).classList.add("is-in-cart");
  cartChanged();
  showSeatDetails(seat);   // redraw the pass so its button shows "In your passes"
  showMessage("Added to your passes.");
}

// Called after every change to the cart
function cartChanged() {
  renderCart();
}

// Draws the list of passes and the total price
function renderCart() {
  const list = document.querySelector("#cart-list");
  list.replaceChildren();

  cart.forEach(seatId => {
    const seat = seatsById[seatId];

    const item = document.createElement("li");
    item.className = "cart-item";
    item.style.setProperty("--zone-colour", `var(--zone-${seat.sectionId})`);

    const info = document.createElement("div");
    const zone = document.createElement("strong");
    zone.textContent = seat.sectionName;
    const place = document.createElement("span");
    place.textContent = `Row ${seat.row}, Seat ${seat.number}`;
    info.append(zone, place);

    const price = document.createElement("span");
    price.className = "cart-price";
    price.textContent = formatPrice(seat.price);

    item.append(info, price);
    list.append(item);
  });

  const total = cart.reduce((sum, seatId) => sum + seatsById[seatId].price, 0);
  document.querySelector("#cart-total").textContent = formatPrice(total);
  document.querySelector("#cart-count").textContent = cart.length ? `(${cart.length})` : "";
  document.querySelector("#cart-empty").hidden = cart.length > 0;
  document.querySelector("#cart-summary").hidden = cart.length === 0;
}

// One click listener on the whole map handles every seat (event delegation)
function handleMapClick(event) {
  const button = event.target.closest(".seat");
  if (!button) return;   // clicked an empty spot, not a seat
  showSeatDetails(seatsById[button.dataset.seatId]);
}

document.querySelector("#map-canvas").addEventListener("click", handleMapClick);

// ============================================================
// Map navigation - zoom, move and reset.
// The canvas (the whole hall) is moved and scaled inside the viewport
// with a CSS transform, so the seats themselves never change.
// ============================================================

const mapViewport = document.querySelector(".map-viewport");
const mapCanvas = document.querySelector("#map-canvas");

const view = { scale: 1, x: 0, y: 0 };
const ZOOM_STEP = 1.2;     // each zoom click is 20% bigger or smaller
const MIN_SCALE = 0.4;
const MAX_SCALE = 2.5;
const MOVE_STEP = 80;      // pixels per move click

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Applies the current view to the canvas, with limits so the hall never disappears
function applyView() {
  const maxX = (mapCanvas.offsetWidth * view.scale) / 2;
  const maxY = (mapCanvas.offsetHeight * view.scale) / 2;
  view.x = clamp(view.x, -maxX, maxX);
  view.y = clamp(view.y, -maxY, maxY);

  // translate(-50%, -50%) keeps the hall centred; then our move and zoom are added
  mapCanvas.style.transform = `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) scale(${view.scale})`;

  // Grey out zoom buttons at the limits
  document.querySelector('[data-action="zoom-in"]').disabled = view.scale >= MAX_SCALE;
  document.querySelector('[data-action="zoom-out"]').disabled = view.scale <= MIN_SCALE;
}

function zoomBy(factor) {
  view.scale = clamp(view.scale * factor, MIN_SCALE, MAX_SCALE);
  applyView();
}

// "Move up" shows more of the top of the hall, so the hall itself slides down
function moveBy(dx, dy) {
  view.x += dx;
  view.y += dy;
  applyView();
}

// Centres the hall and zooms so the whole venue fits in the viewport
function resetView() {
  const fit = Math.min(
    mapViewport.clientWidth / mapCanvas.offsetWidth,
    mapViewport.clientHeight / mapCanvas.offsetHeight,
    1
  );
  view.scale = clamp(fit, MIN_SCALE, MAX_SCALE);
  view.x = 0;
  view.y = 0;
  applyView();
}

// One listener for all navigation buttons
function handleControlClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  switch (button.dataset.action) {
    case "zoom-in": zoomBy(ZOOM_STEP); break;
    case "zoom-out": zoomBy(1 / ZOOM_STEP); break;
    case "up": moveBy(0, MOVE_STEP); break;
    case "down": moveBy(0, -MOVE_STEP); break;
    case "left": moveBy(MOVE_STEP, 0); break;
    case "right": moveBy(-MOVE_STEP, 0); break;
    case "reset": resetView(); break;
  }
}

document.querySelector(".map-controls").addEventListener("click", handleControlClick);

renderVenue();
renderLegend();
resetView();

// Fit the hall again once fonts have loaded and when the window size changes
window.addEventListener("load", resetView);
window.addEventListener("resize", resetView);
console.log(`${Object.keys(seatsById).length} seat buttons generated`);
