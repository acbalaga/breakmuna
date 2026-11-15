// Every line of copy lives here. Edit text freely, no code changes needed.
//
// Shape: id, pool, text, optional object, optional when.
//   pool    coffee, merienda, parcel, background, condition, door, receipt
//           (plus extras outside the 181: landing, unearned, caption, ref_item,
//           microwave_result, secret, cabinet, cat, cat_known, window, plant,
//           wash, magnet, hint)
//   object  background lines: microwave, ref, aircon, bulletin, clock.
//           condition lines: the object that speaks the line (coffee, microwave,
//           ref, bulletin). A condition line with no object is said on entering the room.
//   when    condition names. All must be active for the line to be used.
//           monday_morning, lunch_rush, merienda_hour, friday_close, overtime,
//           payday, petsa_de_peligro, ber_months, weekend, rainy_season
// A line with no `when` is a default line.
//
// Lines 01 to 06 of coffee, 01 to 05 of merienda, parcel, background and condition,
// 01 to 03 of door and 01 to 02 of receipt are the approved voice sample.
window.PANTRY_COPY = [
  // ---------------------------------------------------------------- coffee (30)
  { id: "coffee-01", pool: "coffee", text: "Stirrers are out of stock. A fork has been assigned." },
  { id: "coffee-02", pool: "coffee", text: "The water bottle is empty. Replacing it is the duty of whoever notices. Nobody has noticed." },
  { id: "coffee-03", pool: "coffee", text: "This mug belongs to someone in Accounting. It is used on a first-come basis." },
  { id: "coffee-04", pool: "coffee", text: "Sachets are restocked on Mondays. By Thursday, only the tea remains." },
  { id: "coffee-05", pool: "coffee", text: "Hot water is available. Allow three minutes for the red light to mean it." },
  { id: "coffee-06", pool: "coffee", text: "Please wash your own mug. The sink is not a storage area." },
  { id: "coffee-07", pool: "coffee", text: "Coffee: 3-in-1. The sugar has already been decided for you." },
  { id: "coffee-08", pool: "coffee", text: "Water dispenser advisory. The hot side works. The cold side is a rumor." },
  { id: "coffee-09", pool: "coffee", text: "Creamer is available in the cabinet. It expired in a previous fiscal year." },
  { id: "coffee-10", pool: "coffee", text: "The teaspoon is shared. Please do not think about it." },
  { id: "coffee-11", pool: "coffee", text: "Coffee consumption is not monitored. The sachet box says otherwise." },
  { id: "coffee-12", pool: "coffee", text: "The paper cups are for visitors. There have been no visitors." },
  { id: "coffee-13", pool: "coffee", text: "Sugar is in the container labeled salt. This has been raised before." },
  { id: "coffee-14", pool: "coffee", text: "The dispenser makes a sound every few minutes. Facilities has been informed twice." },
  { id: "coffee-15", pool: "coffee", text: "Brewed coffee is reserved for board meetings. This is not a board meeting." },
  { id: "coffee-16", pool: "coffee", text: "Someone has left a tea bag in the sink. An investigation is not planned." },
  { id: "coffee-17", pool: "coffee", text: "The sachet says strong. This has not been verified." },
  { id: "coffee-18", pool: "coffee", text: "Sachets are for pantry use only. One desk drawer was found to contain eleven." },
  { id: "coffee-19", pool: "coffee", text: "The mug rack has six hooks and nineteen mugs." },
  { id: "coffee-20", pool: "coffee", text: "Hot water is for beverages. Cup noodles are a gray area." },
  { id: "coffee-21", pool: "coffee", text: "Stir, then return the teaspoon. It is the only one." },
  { id: "coffee-22", pool: "coffee", text: "A new water bottle was delivered this morning. It is still by the door." },
  { id: "coffee-23", pool: "coffee", text: "The coffee is ready. It tastes the way it did yesterday." },
  { id: "coffee-24", pool: "coffee", text: "Kindly refill the sachet box when it is empty. The supply cabinet is locked." },
  { id: "coffee-25", pool: "coffee", text: "The dispenser light is blinking. Nobody knows what the blinking means." },
  { id: "coffee-26", pool: "coffee", text: "This mug has a company logo from two rebrands ago." },
  { id: "coffee-27", pool: "coffee", text: "The cup is hot. The handle is also hot. This was a design decision." },
  { id: "coffee-28", pool: "coffee", text: "The tissue beside the dispenser is the last roll. Use accordingly." },
  { id: "coffee-29", pool: "coffee", text: "Someone has labeled their sachets with a name. The label has been respected so far." },
  { id: "coffee-30", pool: "coffee", text: "The sink sponge is due for replacement. It was due last quarter." },

  // ---------------------------------------------------------------- merienda (31)
  // 23 default items, 4 for payday, 4 for petsa de peligro. One is picked per date.
  { id: "merienda-01", pool: "merienda", item: "Turon", text: "Two pieces per person. This is on the honor system." },
  { id: "merienda-02", pool: "merienda", item: "Banana cue", text: "Dispose of the stick properly. The pen holder is not proper." },
  { id: "merienda-03", pool: "merienda", item: "Pancit", text: "From someone's birthday. The celebrant has not been identified." },
  { id: "merienda-04", pool: "merienda", item: "Crackers", text: "Petsa de peligro measures are in effect.", when: ["petsa_de_peligro"] },
  { id: "merienda-05", pool: "merienda", item: "Pizza", text: "Courtesy of a team that hit its target. One slice per person, in theory.", when: ["payday"] },
  { id: "merienda-06", pool: "merienda", item: "Kutsinta", text: "The niyog ran out at 3:05." },
  { id: "merienda-07", pool: "merienda", item: "Puto", text: "Counted this morning. The count is no longer accurate." },
  { id: "merienda-08", pool: "merienda", item: "Lumpiang shanghai", text: "There were forty pieces. This note was written early." },
  { id: "merienda-09", pool: "merienda", item: "Ensaymada", text: "One per person. Halves are being taken instead." },
  { id: "merienda-10", pool: "merienda", item: "Kamote cue", text: "Arrived warm. Status as of this note: not warm." },
  { id: "merienda-11", pool: "merienda", item: "Maruya", text: "Brought by someone from the third floor. Nobody asked why." },
  { id: "merienda-12", pool: "merienda", item: "Biko", text: "The corner pieces went first." },
  { id: "merienda-13", pool: "merienda", item: "Palitaw", text: "Please use the tongs. The tongs are in the sink." },
  { id: "merienda-14", pool: "merienda", item: "Cassava cake", text: "Pre-sliced. The slices are not equal and this has been noticed." },
  { id: "merienda-15", pool: "merienda", item: "Empanada", text: "Filling not indicated. Proceed on trust." },
  { id: "merienda-16", pool: "merienda", item: "Pandesal", text: "From this morning. The palaman is your responsibility." },
  { id: "merienda-17", pool: "merienda", item: "Suman", text: "Sugar is beside the tray. The sugar is nearly gone." },
  { id: "merienda-18", pool: "merienda", item: "Siopao", text: "Asado and bola-bola. The dots have rubbed off." },
  { id: "merienda-19", pool: "merienda", item: "Pichi-pichi", text: "Half with cheese, half with niyog. The cheese half is finished." },
  { id: "merienda-20", pool: "merienda", item: "Assorted kakanin", text: "Pasalubong from someone's leave. Province not specified." },
  { id: "merienda-21", pool: "merienda", item: "Spaghetti", text: "Sweet style, from a birthday. Paper plates are on top of the ref." },
  { id: "merienda-22", pool: "merienda", item: "Kwek-kwek", text: "Sauce is in the tied plastic. Open with care." },
  { id: "merienda-23", pool: "merienda", item: "Saging na saba", text: "Boiled. A healthy option. Supply remains high." },
  { id: "merienda-24", pool: "merienda", item: "Bibingka", text: "Still warm. Someone passed a stall on the way in." },
  { id: "merienda-25", pool: "merienda", item: "Mamon", text: "Individually wrapped. The count matches the headcount, for once." },
  { id: "merienda-26", pool: "merienda", item: "Milk tea", text: "Ordered by batch. Check the sticker before taking one.", when: ["payday"] },
  { id: "merienda-27", pool: "merienda", item: "Fried chicken", text: "One bucket per department. Gravy is limited.", when: ["payday"] },
  { id: "merienda-28", pool: "merienda", item: "Cake", text: "A whole one. No occasion was stated. It is payday.", when: ["payday"] },
  { id: "merienda-29", pool: "merienda", item: "Biscuits", text: "From the bottom drawer of someone's desk. Shared in good faith.", when: ["petsa_de_peligro"] },
  { id: "merienda-30", pool: "merienda", item: "Hard candy", text: "From the reception bowl. Assorted, mostly the one flavor.", when: ["petsa_de_peligro"] },
  { id: "merienda-31", pool: "merienda", item: "Yesterday's pandesal", text: "Toasted to extend its service life.", when: ["petsa_de_peligro"] },

  // ---------------------------------------------------------------- parcel (20)
  { id: "parcel-01", pool: "parcel", text: "For: someone on the 14th floor. This is the 12th." },
  { id: "parcel-02", pool: "parcel", text: "Fragile. Has been under three other parcels since Tuesday." },
  { id: "parcel-03", pool: "parcel", text: "For pickup. The recipient is on leave until the 20th." },
  { id: "parcel-04", pool: "parcel", text: "Contents: one phone case. Box size: microwave." },
  { id: "parcel-05", pool: "parcel", text: "Addressed to a department that was renamed last year." },
  { id: "parcel-06", pool: "parcel", text: "Signed for by reception at 9:12. Nobody has been told." },
  { id: "parcel-07", pool: "parcel", text: "Cash on delivery. Reception advanced the payment. Reception remembers." },
  { id: "parcel-08", pool: "parcel", text: "Third parcel this week for the same name." },
  { id: "parcel-09", pool: "parcel", text: "Declared contents: office supplies. The box is the shape of a shoe box." },
  { id: "parcel-10", pool: "parcel", text: "For: HR. Marked personal." },
  { id: "parcel-11", pool: "parcel", text: "Arrived during the sale. So did the eleven others." },
  { id: "parcel-12", pool: "parcel", text: "Handle with care. The box has a footprint on it." },
  { id: "parcel-13", pool: "parcel", text: "Return to sender. The sender has not been reached." },
  { id: "parcel-14", pool: "parcel", text: "The label has two names. Both deny ordering it." },
  { id: "parcel-15", pool: "parcel", text: "Delivered to the wrong tower. Corrected on the second attempt." },
  { id: "parcel-16", pool: "parcel", text: "Do not stack. Currently third from the bottom." },
  { id: "parcel-17", pool: "parcel", text: "Giveaway calendars for this year. Arrived in March." },
  { id: "parcel-18", pool: "parcel", text: "This side up. The arrow points to the floor." },
  { id: "parcel-19", pool: "parcel", text: "Contents: one item. Bubble wrap: generous." },
  { id: "parcel-20", pool: "parcel", text: "Ordered at 2 AM, according to the slip. No comment is offered." },

  // ---------------------------------------------------------------- background (25)
  { id: "bg-01", pool: "background", object: "microwave", text: "Please cover your food. The inside of this microwave is a record of who did not." },
  { id: "bg-06", pool: "background", object: "microwave", text: "Microwave queue: 6 persons. Estimated wait: your entire lunch." },
  { id: "bg-07", pool: "background", object: "microwave", text: "Two minutes maximum per person. The timer was last set to nine." },
  { id: "bg-08", pool: "background", object: "microwave", text: "Someone heated fish at 11:50. The floor has been informed by air." },
  { id: "bg-09", pool: "background", object: "microwave", text: "The turntable does not turn. Rotate your container at the halfway mark." },

  { id: "bg-02", pool: "background", object: "ref", text: "Items left in the ref on Friday will be disposed of. This notice is two years old." },
  { id: "bg-10", pool: "background", object: "ref", text: "A baon has been in the ref since October. It has seniority now." },
  { id: "bg-11", pool: "background", object: "ref", text: "Please label your food. Unlabeled items are considered donations." },
  { id: "bg-12", pool: "background", object: "ref", text: "The freezer contains ice and one item wrapped in foil. Nobody has checked." },
  { id: "bg-13", pool: "background", object: "ref", text: "Ref cleaning is every last Friday. Which Friday is last is under dispute." },

  { id: "bg-03", pool: "background", object: "aircon", text: "The aircon remote is missing. The temperature is now permanent." },
  { id: "bg-14", pool: "background", object: "aircon", text: "The aircon is set to 18. Nobody has claimed responsibility." },
  { id: "bg-15", pool: "background", object: "aircon", text: "Thermostat requests go through facilities. Jackets are faster." },
  { id: "bg-16", pool: "background", object: "aircon", text: "The remote needs two batteries. It has one, and a rubber band." },
  { id: "bg-17", pool: "background", object: "aircon", text: "One side of the floor is cold. The other side has filed a request." },

  { id: "bg-04", pool: "background", object: "bulletin", text: "Fire drill: date to be announced. Posted in March." },
  { id: "bg-18", pool: "background", object: "bulletin", text: "Lost: one umbrella, black. This describes every umbrella in the building." },
  { id: "bg-19", pool: "background", object: "bulletin", text: "Pantry rules, revised. Rule 4 has been crossed out by hand." },
  { id: "bg-20", pool: "background", object: "bulletin", text: "Elevator maintenance on Saturday. Posted here, not at the elevator." },
  { id: "bg-21", pool: "background", object: "bulletin", text: "Lunch orders: sign up before 10. The last entry was in June." },

  { id: "bg-05", pool: "background", object: "clock", text: "The wall clock is correct. It is the only thing in this pantry on schedule." },
  { id: "bg-22", pool: "background", object: "clock", text: "The clock runs on one battery. It has been the same battery since the move." },
  { id: "bg-23", pool: "background", object: "clock", text: "This clock and the one in the lobby disagree. Attendance follows the lobby." },
  { id: "bg-24", pool: "background", object: "clock", text: "The second hand hesitates at 9. It recovers." },
  { id: "bg-25", pool: "background", object: "clock", text: "You entered with five minutes. The clock is counting." },

  // ---------------------------------------------------------------- condition (40, 4 per condition)
  { id: "cond-01", pool: "condition", when: ["monday_morning"], text: "Monday, before noon. The coffee is working at the same pace as everyone else." },
  { id: "cond-06", pool: "condition", when: ["monday_morning"], object: "coffee", text: "Monday. Two sachets is not prohibited. It is also not discussed." },
  { id: "cond-07", pool: "condition", when: ["monday_morning"], text: "Monday, before noon. The lights are at half. So is the floor." },
  { id: "cond-08", pool: "condition", when: ["monday_morning"], object: "bulletin", text: "This week's schedule has been posted. It is last week's schedule with new dates." },

  { id: "cond-02", pool: "condition", when: ["lunch_rush"], object: "microwave", text: "Microwave queue: 9 persons. Those with cold baon are advised to accept it." },
  { id: "cond-09", pool: "condition", when: ["lunch_rush"], object: "microwave", text: "Lunch rush. The line starts at the ref and ends at the door." },
  { id: "cond-10", pool: "condition", when: ["lunch_rush"], object: "ref", text: "The ref is at capacity. Baon is now stacked two deep." },
  { id: "cond-11", pool: "condition", when: ["lunch_rush"], text: "Lunch rush. All tables are taken. Standing is permitted." },

  { id: "cond-12", pool: "condition", when: ["merienda_hour"], text: "It is 3 PM. The tray has been uncovered four times in ten minutes." },
  { id: "cond-13", pool: "condition", when: ["merienda_hour"], text: "Merienda hour. Foot traffic to the pantry has tripled." },
  { id: "cond-14", pool: "condition", when: ["merienda_hour"], object: "microwave", text: "Merienda hour. The microwave has been given a rest." },
  { id: "cond-15", pool: "condition", when: ["merienda_hour"], object: "coffee", text: "Afternoon coffee. The second sachet of the day is the honest one." },

  { id: "cond-03", pool: "condition", when: ["friday_close"], text: "Friday, 4:45 PM. Someone has asked if you have five minutes." },
  { id: "cond-16", pool: "condition", when: ["friday_close"], text: "Friday, 4:58 PM. A meeting invite has entered the building." },
  { id: "cond-17", pool: "condition", when: ["friday_close"], object: "bulletin", text: "Reminder: timesheets are due today. This is the third reminder." },
  { id: "cond-18", pool: "condition", when: ["friday_close"], text: "Friday afternoon. The elevators are busier than the keyboards." },

  { id: "cond-04", pool: "condition", when: ["overtime"], text: "Half the lights are off. The aircon left at 6:00 and was not consulted." },
  { id: "cond-19", pool: "condition", when: ["overtime"], object: "coffee", text: "It is past 6:30. This cup is not for enjoyment." },
  { id: "cond-20", pool: "condition", when: ["overtime"], text: "Overtime. The window now shows more of the office than the street." },
  { id: "cond-21", pool: "condition", when: ["overtime"], object: "microwave", text: "Dinner is being reheated. The lunch container has returned for a second shift." },

  { id: "cond-22", pool: "condition", when: ["payday"], text: "Payday. The pantry is quieter than usual. Everyone has gone out for lunch." },
  { id: "cond-23", pool: "condition", when: ["payday"], object: "microwave", text: "Payday. The microwave queue is short. Baon attendance is low." },
  { id: "cond-24", pool: "condition", when: ["payday"], object: "bulletin", text: "Payday advisory: the ATM on the ground floor has a line." },
  { id: "cond-25", pool: "condition", when: ["payday"], object: "coffee", text: "Payday. Someone has brought in coffee from outside. The sachets understand." },

  { id: "cond-26", pool: "condition", when: ["petsa_de_peligro"], text: "Petsa de peligro. Baon attendance is at a record high." },
  { id: "cond-27", pool: "condition", when: ["petsa_de_peligro"], object: "coffee", text: "Petsa de peligro. The free coffee is being appreciated more than usual." },
  { id: "cond-28", pool: "condition", when: ["petsa_de_peligro"], object: "microwave", text: "Queue: 8 persons, all baon. Payday will shorten this line." },
  { id: "cond-29", pool: "condition", when: ["petsa_de_peligro"], text: "Payday is near. Lunch out has been postponed until further notice." },

  { id: "cond-05", pool: "condition", when: ["ber_months"], object: "bulletin", text: "Christmas party update: the theme is still under discussion. So is the exchange gift." },
  { id: "cond-30", pool: "condition", when: ["ber_months"], object: "bulletin", text: "The Christmas party committee still needs volunteers. Avoid eye contact." },
  { id: "cond-31", pool: "condition", when: ["ber_months"], object: "bulletin", text: "Christmas party: attendance is voluntary. A headcount is being taken." },
  { id: "cond-32", pool: "condition", when: ["ber_months"], text: "A parol has been hung on the window. It was approved in one meeting, which is a record." },

  { id: "cond-33", pool: "condition", when: ["weekend"], text: "You are here because the deadline is Monday. It was Monday all along." },
  { id: "cond-34", pool: "condition", when: ["weekend"], text: "You came in to finish one thing. It has become four things." },
  { id: "cond-35", pool: "condition", when: ["weekend"], object: "microwave", text: "No queue. This is what the microwave is like when nobody is watching." },
  { id: "cond-36", pool: "condition", when: ["weekend"], object: "coffee", text: "Weekend coffee. Nobody restocked on Friday." },

  { id: "cond-37", pool: "condition", when: ["rainy_season"], text: "Rain since morning. The umbrella rack is full and the floor by the door is not dry." },
  { id: "cond-38", pool: "condition", when: ["rainy_season"], object: "bulletin", text: "Weather advisory posted. Work continues as scheduled." },
  { id: "cond-39", pool: "condition", when: ["rainy_season"], text: "It is raining. Booking a ride home is now a project." },
  { id: "cond-40", pool: "condition", when: ["rainy_season"], text: "The rain has started. Slippers have appeared under several desks." },

  // ---------------------------------------------------------------- door (15)
  { id: "door-01", pool: "door", text: "Pantry closed. You were just here." },
  { id: "door-02", pool: "door", text: "Closed for 30 minutes. Your desk is where you left it." },
  { id: "door-03", pool: "door", text: "Closed. The work did not move while you were away." },
  { id: "door-04", pool: "door", text: "Pantry closed. Your inbox has been keeping your seat warm." },
  { id: "door-05", pool: "door", text: "Closed. The coffee will still be 3-in-1 when you come back." },
  { id: "door-06", pool: "door", text: "The pantry is resting. You have already rested." },
  { id: "door-07", pool: "door", text: "Closed for 30 minutes. This is the longest the pantry has been empty all day." },
  { id: "door-08", pool: "door", text: "No entry. The door has been briefed about you." },
  { id: "door-09", pool: "door", text: "Closed. A second break this soon would be a meeting." },
  { id: "door-10", pool: "door", text: "The pantry reopens shortly. Shortly is defined below." },
  { id: "door-11", pool: "door", text: "Closed. The microwave queue has been informed that you left." },
  { id: "door-12", pool: "door", text: "Door closed. The merienda will not improve in the next 30 minutes." },
  { id: "door-13", pool: "door", text: "Pantry closed. Somebody has to answer those emails." },
  { id: "door-14", pool: "door", text: "Closed. Your chair has been turning slowly since you left." },
  { id: "door-15", pool: "door", text: "Still closed. Checking again does not shorten it." },

  // ---------------------------------------------------------------- receipt closing (20)
  { id: "receipt-01", pool: "receipt", text: "Thank you. Your emails have been waiting quietly." },
  { id: "receipt-02", pool: "receipt", text: "Break recorded. No approval was required." },
  { id: "receipt-03", pool: "receipt", text: "This receipt is not valid for reimbursement." },
  { id: "receipt-04", pool: "receipt", text: "No signature required. Nobody was going to sign it anyway." },
  { id: "receipt-05", pool: "receipt", text: "Please keep this receipt. There is no reason to." },
  { id: "receipt-06", pool: "receipt", text: "Break completed within the allotted time. This will not appear in your evaluation." },
  { id: "receipt-07", pool: "receipt", text: "Thank you. Come again in 30 minutes." },
  { id: "receipt-08", pool: "receipt", text: "Not an official document, despite the title." },
  { id: "receipt-09", pool: "receipt", text: "Filed under: things that happened today." },
  { id: "receipt-10", pool: "receipt", text: "Your break has been noted by no one." },
  { id: "receipt-11", pool: "receipt", text: "For questions about this receipt, there is no one to ask." },
  { id: "receipt-12", pool: "receipt", text: "Customer copy. There is no other copy." },
  { id: "receipt-13", pool: "receipt", text: "The pantry thanks you for your five minutes." },
  { id: "receipt-14", pool: "receipt", text: "Productivity impact: not measured." },
  { id: "receipt-15", pool: "receipt", text: "This break was not billable." },
  { id: "receipt-16", pool: "receipt", text: "Returned to desk in good condition." },
  { id: "receipt-17", pool: "receipt", text: "Valid for one break only. Not transferable." },
  { id: "receipt-18", pool: "receipt", text: "No items were returned. No refunds on time spent." },
  { id: "receipt-19", pool: "receipt", text: "The work was still there when you got back. It always is." },
  { id: "receipt-20", pool: "receipt", text: "End of receipt. Back to it." },

  // ---------------------------------------------------------------- extras, outside the 181
  // Landing line (open door).
  { id: "landing-01", pool: "landing", text: "Pantry open. Break limit: 5 minutes. Tap the door." },
  { id: "landing-02", pool: "landing", when: ["weekend"], text: "Pantry open. It is the weekend. The pantry would like to know why you are here." },

  // Receipt line the visitor did not earn.
  { id: "unearned-01", pool: "unearned", label: "Meetings avoided", value: "1" },
  { id: "unearned-02", pool: "unearned", label: "Emails answered", value: "0" },
  { id: "unearned-03", pool: "unearned", label: "Reply-alls ignored", value: "1" },
  { id: "unearned-04", pool: "unearned", label: "Mondays survived", value: "1", when: ["monday_morning"] },
  { id: "unearned-05", pool: "unearned", label: "Late invites declined", value: "0", when: ["friday_close"] },
  { id: "unearned-06", pool: "unearned", label: "Overtime filed", value: "0", when: ["overtime"] },
  { id: "unearned-07", pool: "unearned", label: "Weekends worked", value: "1", when: ["weekend"] },
  { id: "unearned-08", pool: "unearned", label: "Lunches out planned", value: "1", when: ["payday"] },

  // What is inside the ref. `sprite` is the row in assets/sprites/ref_items.png.
  { id: "ref-item-01", pool: "ref_item", sprite: 0, text: "Label: DO NOT EAT. Underlined twice." },
  { id: "ref-item-02", pool: "ref_item", sprite: 1, text: "No label. Contents: adobo, by smell." },
  { id: "ref-item-03", pool: "ref_item", sprite: 2, text: "Label: a name and a date. The date is from October." },
  { id: "ref-item-04", pool: "ref_item", sprite: 3, text: "A cake box. Inside: one slice and a plastic knife." },
  { id: "ref-item-05", pool: "ref_item", sprite: 4, text: "Label: FINANCE. It is unclear if this is ownership or a warning." },
  { id: "ref-item-06", pool: "ref_item", sprite: 5, text: "A water bottle with a name on masking tape. The tape is older than the bottle." },
  { id: "ref-item-07", pool: "ref_item", sprite: 6, text: "Ice cream tub. Contents: fish." },
  { id: "ref-item-08", pool: "ref_item", sprite: 7, text: "Someone's lunch, still warm. The ref is working harder because of it." },

  // What comes out of the microwave. `item` is what went in, min and max are seconds.
  { id: "mw-bread-1", pool: "microwave_result", item: "bread", min: 10, max: 10, text: "The bread is warm outside and cold inside. This is the standard result." },
  { id: "mw-bread-2", pool: "microwave_result", item: "bread", min: 20, max: 30, text: "The bread is warm all the way through. Eat it within one minute." },
  { id: "mw-bread-3", pool: "microwave_result", item: "bread", min: 40, max: 120, text: "The bread has hardened. It may now be used as a paperweight." },
  { id: "mw-merienda-1", pool: "microwave_result", item: "merienda", min: 10, max: 20, text: "Lukewarm. The microwave did the minimum." },
  { id: "mw-merienda-2", pool: "microwave_result", item: "merienda", min: 30, max: 60, text: "Heated through. This is rare and should be reported." },
  { id: "mw-merienda-3", pool: "microwave_result", item: "merienda", min: 70, max: 120, text: "The edges are bubbling. The center is still cold." },

  // The hidden case. Bulletin scrap, then aircon at 25, then the October baon, then 0:50.
  { id: "secret-note", pool: "secret", text: "A handwritten scrap, unsigned. To whoever keeps setting it to 18: try 25, and wait." },
  { id: "secret-code", pool: "secret", text: "25. Something rattles in the remote. Taped inside the battery cover: October baon, 0:50." },
  { id: "secret-take", pool: "secret", text: "You take the October baon out of the ref. Nobody stops you." },
  { id: "secret-wrong", pool: "secret", text: "The October baon is unchanged. It has survived worse." },
  { id: "secret-solved", pool: "secret", text: "0:50. The October baon has been reheated at last. Case closed." },

  // Inside the cabinets under the counter.
  { id: "cab-1", pool: "cabinet", object: "cab1", text: "Cleaning supplies. Inside the door, the supply cabinet key log. Last entry: taped under the bubble wrap, for safekeeping." },
  { id: "cab-2", pool: "cabinet", object: "cab2", text: "Plastic lids, assorted. None of the containers they belong to." },
  { id: "cab-3", pool: "cabinet", object: "cab3", text: "A plastic bag full of other plastic bags." },
  { id: "cab-4-locked", pool: "cabinet", object: "cab4", text: "Supply cabinet. Locked. The key is signed out in the log in the first cabinet." },
  { id: "cab-4-open", pool: "cabinet", object: "cab4", text: "Stirrers, sachets, tissue. Fully stocked. Nobody was told." },

  // The second hidden case: key log, a full sheet of bubble wrap, one cup of coffee,
  // 20 seconds at the window, then the supply cabinet.
  { id: "secret2-slip", pool: "secret", text: "Taped under the bubble wrap: not the key. A requisition slip for it. Valid only with a coffee ring." },
  { id: "secret2-ring", pool: "secret", text: "You set the mug on the slip. It has a coffee ring now, which makes it valid. Processing takes 20 seconds and cannot be watched." },
  { id: "secret2-key", pool: "secret", text: "You looked away for 20 seconds. A key is on the counter. The tag says SUPPLY." },
  { id: "secret2-solved", pool: "secret", text: "The supply cabinet is open. It is full of stirrers. There were always stirrers. Case closed." },
  { id: "cab-4-slip", pool: "cabinet", object: "cab4", text: "Locked. You have a slip, but it is not valid yet. It needs a coffee ring." },
  { id: "cab-4-wait", pool: "cabinet", object: "cab4", text: "Locked. The slip is in processing. This does not happen while watched. Try the window." },

  // The building cat.
  { id: "cat-1", pool: "cat", text: "The building cat. Not on the payroll. Present every day." },
  { id: "cat-2", pool: "cat", text: "The cat is asleep. It has no deliverables." },
  { id: "cat-3", pool: "cat", text: "The cat opens one eye. You have been assessed." },
  { id: "cat-4", pool: "cat", text: "Feeding the cat is not allowed. The cat is well fed." },
  { id: "cat-5", pool: "cat", text: "The cat has outlasted three office renovations." },

  // Once the cat knows the visitor. The stage lines are said once, when it warms up.
  { id: "cat-stage-1", pool: "hint", text: "The cat has started to recognize you. From now on it looks up when you come in." },
  { id: "cat-stage-2", pool: "hint", text: "The cat has filed you under furniture. It will join you at the window." },
  { id: "cat-k1", pool: "cat_known", text: "The cat is purring. This is not a performance review, but it went well." },
  { id: "cat-k2", pool: "cat_known", text: "The cat knows your break schedule. It has not reported it." },
  { id: "cat-k3", pool: "cat_known", text: "The cat allows this. The arrangement is informal." },
  { id: "cat-k4", pool: "cat_known", text: "Purring. Volume: low. Duration: at the cat's discretion." },
  { id: "cat-k5", pool: "cat_known", text: "The cat has seen you before. You are on its list of acceptable persons." },

  // At the window. In four seconds, out six. The glass fogs on the way out.
  { id: "window-01", pool: "window", text: "The window. Breathe out and the glass fogs. Drawing on it is permitted." },
  { id: "window-02", pool: "window", text: "Nothing is required at the window. In for four, out for six, if you want a task." },
  { id: "window-03", pool: "window", text: "Breathe out, the glass fogs. Whatever you draw is gone before the next meeting." },
  { id: "window-04", pool: "window", when: ["rainy_season"], text: "Rain on the glass. Breathe with it. The traffic below is not yours for five minutes." },
  { id: "window-05", pool: "window", when: ["overtime"], text: "The city at night. Breathe out, the glass fogs. Most of those lit windows are also on break." },
  { id: "window-quiet", pool: "hint", text: "The sound is off. It can be turned on, bottom left." },

  // The sill plant. One watering per break. The grow lines are said once each.
  { id: "plant-01", pool: "plant", text: "You water the sill plant. It is the only thing here with a growth plan." },
  { id: "plant-02", pool: "plant", text: "Watered. The plant has no owner on record. It is doing fine." },
  { id: "plant-03", pool: "plant", text: "One watering, logged. The plant does not send a calendar invite." },
  { id: "plant-04", pool: "plant", text: "Watered. It leans toward the window, away from the office." },
  { id: "plant-done", pool: "hint", text: "Already watered this break. The plant asks for nothing further." },
  { id: "plant-grow-1", pool: "hint", text: "Watered. The plant has a new leaf. Nobody announced it." },
  { id: "plant-grow-2", pool: "hint", text: "Watered. The plant is taller than it was. It has been keeping count of your breaks." },
  { id: "plant-grow-3", pool: "hint", text: "Watered. The plant has flowered. This was not in anyone's targets." },
  { id: "plant-grow-4", pool: "hint", text: "Watered. A second flower. The plant is now the most productive thing on this floor." },

  // The mug. Stir it, and afterwards wash it.
  { id: "stir-hint", pool: "hint", text: "Stir. Circles work. The powder is in no hurry." },
  { id: "wash-own", pool: "hint", text: "Your mug, emptied. Scrub, then rinse." },
  { id: "wash-soak", pool: "hint", text: "A mug left to soak. It has been soaking since Tuesday. Scrub, then rinse." },
  { id: "wash-dry", pool: "hint", text: "There is no soap on it yet. Scrub first." },
  { id: "wash-stain", pool: "hint", text: "Rinsed. The stain stayed. Scrub it again." },
  { id: "wash-clean", pool: "hint", text: "The mug is already clean. Leave it while it lasts." },
  { id: "wash-01", pool: "wash", text: "The mug is clean. This condition is temporary." },
  { id: "wash-02", pool: "wash", text: "One mug washed. The sponge has seen worse." },
  { id: "wash-03", pool: "wash", text: "Clean. The coffee ring was older than some of the staff." },
  { id: "wash-04", pool: "wash", text: "Washed and set to dry. The drying rack is the counter." },
  { id: "wash-05", pool: "wash", text: "Clean. The dishwashing liquid is now mostly water, per office practice." },
  { id: "wash-06", pool: "wash", text: "Done. Nobody will know it was you. That is how it works." },

  // The ref door. The magnets and the note stay where they are left.
  { id: "magnet-01", pool: "magnet", text: "The ref door. Magnets from three pizza places and one dentist. Arrange as needed." },
  { id: "magnet-02", pool: "magnet", text: "Ref door. The magnets hold nothing up. They are here on their own merit." },
  { id: "magnet-03", pool: "magnet", text: "Magnets and one sticky note. Whatever you leave here will still be here next break." },
  { id: "magnet-straight", pool: "hint", text: "The magnets are aligned. This will last until lunch." },
  { id: "note-new", pool: "hint", text: "A fresh sticky note. It has about half its stick left." },

  // Optional post caption for the copy button.
  { id: "caption-01", pool: "caption", text: "Five minutes in the pantry. It is on record." }
];
