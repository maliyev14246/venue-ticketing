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
