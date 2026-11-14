// Every line of copy lives here. Edit text freely, no code changes needed.
// Shape: id, pool, text, optional object (background lines), optional when (condition names).
// A line with no `when` is a default line.
// STATUS: 30-line voice sample, pending approval (SPEC.md, build plan step 1).
window.PANTRY_COPY = [
  // Coffee corner notices
  { id: "coffee-01", pool: "coffee", text: "Stirrers are out of stock. A fork has been assigned." },
  { id: "coffee-02", pool: "coffee", text: "The water bottle is empty. Replacing it is the duty of whoever notices. Nobody has noticed." },
  { id: "coffee-03", pool: "coffee", text: "This mug belongs to someone in Accounting. It is used on a first-come basis." },
  { id: "coffee-04", pool: "coffee", text: "Sachets are restocked on Mondays. By Thursday, only the tea remains." },
  { id: "coffee-05", pool: "coffee", text: "Hot water is available. Allow three minutes for the red light to mean it." },
  { id: "coffee-06", pool: "coffee", text: "Please wash your own mug. The sink is not a storage area." },

  // Merienda items with notes
  { id: "merienda-01", pool: "merienda", item: "Turon", text: "Two pieces per person. This is on the honor system." },
  { id: "merienda-02", pool: "merienda", item: "Banana cue", text: "Dispose of the stick properly. The pen holder is not proper." },
  { id: "merienda-03", pool: "merienda", item: "Pancit", text: "From someone's birthday. The celebrant has not been identified." },
  { id: "merienda-04", pool: "merienda", item: "Crackers", text: "Petsa de peligro measures are in effect.", when: ["petsa_de_peligro"] },
  { id: "merienda-05", pool: "merienda", item: "Pizza", text: "Courtesy of a team that hit its target. One slice per person, in theory.", when: ["payday"] },

  // Parcel labels
  { id: "parcel-01", pool: "parcel", text: "For: someone on the 14th floor. This is the 12th." },
  { id: "parcel-02", pool: "parcel", text: "Fragile. Has been under three other parcels since Tuesday." },
  { id: "parcel-03", pool: "parcel", text: "For pickup. The recipient is on leave until the 20th." },
  { id: "parcel-04", pool: "parcel", text: "Contents: one phone case. Box size: microwave." },

  // Background objects
  { id: "bg-01", pool: "background", object: "microwave", text: "Please cover your food. The inside of this microwave is a record of who did not." },
  { id: "bg-02", pool: "background", object: "ref", text: "Items left in the ref on Friday will be disposed of. This notice is two years old." },
  { id: "bg-03", pool: "background", object: "aircon", text: "The aircon remote is missing. The temperature is now permanent." },
  { id: "bg-04", pool: "background", object: "bulletin", text: "Fire drill: date to be announced. Posted in March." },
  { id: "bg-05", pool: "background", object: "clock", text: "The wall clock is correct. It is the only thing in this pantry on schedule." },

  // Time-condition lines
  { id: "cond-01", pool: "condition", when: ["monday_morning"], text: "Monday, before noon. The coffee is working at the same pace as everyone else." },
  { id: "cond-02", pool: "condition", when: ["lunch_rush"], text: "Microwave queue: 9 persons. Those with cold baon are advised to accept it." },
  { id: "cond-03", pool: "condition", when: ["friday_close"], text: "Friday, 4:45 PM. Someone has asked if you have five minutes." },
  { id: "cond-04", pool: "condition", when: ["overtime"], text: "Half the lights are off. The aircon left at 6:00 and was not consulted." },
  { id: "cond-05", pool: "condition", when: ["ber_months"], text: "Christmas party update: the theme is still under discussion. So is the exchange gift." },

  // Landing line (open door). Not in the approved 30, review before launch.
  { id: "landing-01", pool: "landing", text: "Pantry open. Break limit: 5 minutes. Tap the door." },

  // Closed-door lines
  { id: "door-01", pool: "door", text: "Pantry closed. You were just here." },
  { id: "door-02", pool: "door", text: "Closed for 30 minutes. Your desk is where you left it." },
  { id: "door-03", pool: "door", text: "Closed. The work did not move while you were away." },

  // Receipt closing lines
  { id: "receipt-01", pool: "receipt", text: "Thank you. Your emails have been waiting quietly." },
  { id: "receipt-02", pool: "receipt", text: "Break recorded. No approval was required." },

  // Receipt line the visitor did not earn. Not in the approved 30, review before launch.
  { id: "unearned-01", pool: "unearned", label: "Meetings avoided", value: "1" },
  { id: "unearned-02", pool: "unearned", label: "Emails answered", value: "0" },
  { id: "unearned-03", pool: "unearned", label: "Reply-alls ignored", value: "1" },

  // Optional post caption for the copy button. Not in the approved 30, review before launch.
  { id: "caption-01", pool: "caption", text: "Five minutes in the pantry. It is on record." }
];
