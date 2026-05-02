// Returns available 30-min slots for a doctor on a given date
async function getAvailableSlots(doctorProfile, bookedAppointments, dateStr) {
  const date = new Date(dateStr);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[date.getDay()];

  const daySlot = doctorProfile.availableSlots.find(
    (s) => s.day.toLowerCase() === dayName.toLowerCase()
  );
  if (!daySlot) return [];

  const bookedTimes = bookedAppointments.map((a) => a.timeSlot);

  const slots = [];
  const [startH, startM] = daySlot.startTime.split(':').map(Number);
  const [endH, endM] = daySlot.endTime.split(':').map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + 30 <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    const slotStr = `${h}:${m}`;
    if (!bookedTimes.includes(slotStr)) {
      slots.push(slotStr);
    }
    current += 30;
  }

  return slots;
}

module.exports = getAvailableSlots;
