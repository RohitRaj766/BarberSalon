// Debug date calculation - ADJUSTED VERSION
const today = new Date();
today.setDate(today.getDate() + 1); // Add 1 day
today.setHours(0, 0, 0, 0);

const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1); // Add 1 more day
tomorrow.setHours(0, 0, 0, 0);

console.log("Today (adjusted):", today.toISOString().split('T')[0]);
console.log("Tomorrow (adjusted):", tomorrow.toISOString().split('T')[0]);

// Test formatDateOnly function
function formatDateOnly(date) {
  return date.toISOString().split("T")[0];
}

console.log("Today formatted:", formatDateOnly(today));
console.log("Tomorrow formatted:", formatDateOnly(tomorrow));