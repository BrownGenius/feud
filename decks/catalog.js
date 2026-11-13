// =====================================================================
// DECK CATALOG & OFFLINE BUNDLE (decks/catalog.js)
// Pre-registers decks in the /decks folder so they appear automatically
// in the GUI selector and work 100% offline over file:// as well as
// on GitHub Pages (where new files in /decks are also auto-discovered
// via the GitHub Contents API).
// =====================================================================

window.Feud = window.Feud || {};

window.Feud.DECK_CATALOG = [
  {
    id: "starter",
    label: "🎉 Starter Party Deck (6 Rounds)",
    file: null,
    builtin: "starter"
  },
  {
    id: "desi-thanksgiving.json",
    label: "🦃 Desi Thanksgiving (37 Rounds • 5 Fast Money Sets)",
    file: "./decks/desi-thanksgiving.json",
    data: {
  "gameTitle": "Party Feud",
  "gameIcon": "🦃",
  "deckName": "Desi Thanksgiving (37 Rounds)",
  "teamPresets": [
    ["Team Parents", "Team Kids"],
    ["Side A Family", "Side B Family"],
    ["Team Biryani", "Team Samosa"]
  ],
  "rounds": [
    {
      "theme": "🔥 Live Party Poll (House Survey - Editable!)",
      "title": "House Poll 1",
      "multiplier": 1,
      "prompt": "What is the single best item on a Thanksgiving / Desi buffet plate?",
      "answers": [
        { "text": "Biryani / Pulao", "points": 35 },
        { "text": "Tandoori / Masala Turkey", "points": 25 },
        { "text": "Stuffing / Mashed Potatoes", "points": 16 },
        { "text": "Samosas / Chaat Appetizers", "points": 12 },
        { "text": "Garlic Naan", "points": 7 },
        { "text": "Gulab Jamun / Pumpkin Pie", "points": 5 }
      ]
    },
    {
      "theme": "🔥 Live Party Poll (House Survey - Editable!)",
      "title": "House Poll 2",
      "multiplier": 1,
      "prompt": "If you could only eat ONE Indian street food or chaat for the rest of your life, what are you picking?",
      "answers": [
        { "text": "Pani Puri / Golgappe / Puchka", "points": 42 },
        { "text": "Samosa Chaat", "points": 22 },
        { "text": "Pav Bhaji", "points": 15 },
        { "text": "Bhel Puri / Sev Puri", "points": 10 },
        { "text": "Vada Pav", "points": 6 },
        { "text": "Aloo Tikki / Dahi Puri", "points": 5 }
      ]
    },
    {
      "theme": "🔥 Live Party Poll (House Survey - Editable!)",
      "title": "House Poll 3",
      "multiplier": 1,
      "prompt": "What is the first thing you want to do right after finishing a massive holiday meal?",
      "answers": [
        { "text": "Take a nap on the couch", "points": 40 },
        { "text": "Drink hot Masala Chai", "points": 24 },
        { "text": "Unbutton pants / Put on sweatpants", "points": 15 },
        { "text": "Eat dessert / Mithai", "points": 10 },
        { "text": "Watch football / Cricket", "points": 6 },
        { "text": "Go for a walk", "points": 5 }
      ]
    },
    {
      "theme": "🔥 Live Party Poll (House Survey - Editable!)",
      "title": "House Poll 4",
      "multiplier": 2,
      "prompt": "How many minutes late is still considered 'on time' for an Indian party?",
      "answers": [
        { "text": "30 minutes late", "points": 38 },
        { "text": "45 minutes late", "points": 26 },
        { "text": "1 full hour late (60 mins)", "points": 20 },
        { "text": "15 minutes late", "points": 10 },
        { "text": "90+ minutes late (IST!)", "points": 6 }
      ]
    },
    {
      "theme": "🔥 Live Party Poll (House Survey - Editable!)",
      "title": "House Poll 5",
      "multiplier": 2,
      "prompt": "What is one item you will NEVER travel on an airplane without?",
      "answers": [
        { "text": "Headphones / AirPods", "points": 36 },
        { "text": "Phone charger / Power bank", "points": 24 },
        { "text": "Homemade snacks / Thepla / Trail mix", "points": 16 },
        { "text": "Sweater / Jacket / Shawl", "points": 12 },
        { "text": "Water bottle", "points": 7 },
        { "text": "Neck pillow / Lip balm", "points": 5 }
      ]
    },
    {
      "theme": "🔥 Live Party Poll (House Survey - Editable!)",
      "title": "House Poll 6",
      "multiplier": 3,
      "prompt": "What is the greatest Bollywood movie (or song) of all time?",
      "answers": [
        { "text": "Dilwale Dulhania Le Jayenge (DDLJ)", "points": 36 },
        { "text": "Kabhi Khushi Kabhie Gham (K3G)", "points": 24 },
        { "text": "3 Idiots", "points": 18 },
        { "text": "Sholay", "points": 12 },
        { "text": "Zindagi Na Milegi Dobara / Kuch Kuch Hota Hai", "points": 10 }
      ]
    },
    {
      "theme": "🦃 Desi Thanksgiving & Hospitality",
      "title": "Round 7",
      "multiplier": 1,
      "prompt": "Name a dish that MUST be on the table for a proper Desi Thanksgiving—because turkey alone isn't cutting it.",
      "answers": [
        { "text": "Biryani / Pulao", "points": 36 },
        { "text": "Tandoori / Masala Turkey", "points": 24 },
        { "text": "Samosas / Pakoras", "points": 16 },
        { "text": "Dal Makhani / Tarka Dal", "points": 10 },
        { "text": "Naan / Roti", "points": 8 },
        { "text": "Gulab Jamun / Rasmalai", "points": 6 }
      ]
    },
    {
      "theme": "🦃 Desi Thanksgiving & Hospitality",
      "title": "Round 8",
      "multiplier": 1,
      "prompt": "Name something an Indian parent or auntie says the second you walk through the door.",
      "answers": [
        { "text": "\"Have you eaten? / Come eat!\"", "points": 38 },
        { "text": "\"You've lost / gained weight!\"", "points": 26 },
        { "text": "\"Take off your shoes!\"", "points": 15 },
        { "text": "\"Why are you so late?\"", "points": 10 },
        { "text": "\"When are you getting married?\"", "points": 6 },
        { "text": "\"How is work / school?\"", "points": 5 }
      ]
    },
    {
      "theme": "🦃 Desi Thanksgiving & Hospitality",
      "title": "Round 9",
      "multiplier": 2,
      "prompt": "Name something inside an Indian auntie's purse or Tupperware stash at party's end.",
      "answers": [
        { "text": "Leftover food / Mithai in foil", "points": 35 },
        { "text": "Saunf / Elaichi / Cloves", "points": 24 },
        { "text": "Tylenol / Tiger Balm / Eno", "points": 18 },
        { "text": "Extra napkins / Tissues", "points": 13 },
        { "text": "Safety pins / Bobby pins", "points": 10 }
      ]
    },
    {
      "theme": "🦃 Desi Thanksgiving & Hospitality",
      "title": "Round 10",
      "multiplier": 2,
      "prompt": "Name a classic excuse an Indian relative gives when grabbing the restaurant check.",
      "answers": [
        { "text": "\"I'm the elder, let me pay!\"", "points": 40 },
        { "text": "\"I already gave my card to the waiter\"", "points": 25 },
        { "text": "\"You pay next time we visit you\"", "points": 16 },
        { "text": "\"Put your wallet away or I'm leaving!\"", "points": 11 },
        { "text": "\"You're still a kid / student!\"", "points": 8 }
      ]
    },
    {
      "theme": "🦃 Desi Thanksgiving & Hospitality",
      "title": "Round 11",
      "multiplier": 3,
      "prompt": "Name something that happens during the \"Indian Goodbye\" when guests finally say they are leaving.",
      "answers": [
        { "text": "Talking by the front door for 45 mins", "points": 42 },
        { "text": "Host forcing leftover Tupperware on you", "points": 24 },
        { "text": "\"One more cup of chai before you drive!\"", "points": 15 },
        { "text": "Taking 15 group photos on the porch", "points": 11 },
        { "text": "Standing by open car door talking", "points": 8 }
      ]
    },
    {
      "theme": "🦃 Desi Thanksgiving & Hospitality",
      "title": "Round 12",
      "multiplier": 3,
      "prompt": "Name a spice or ingredient every Indian kitchen runs out of right before a big holiday party.",
      "answers": [
        { "text": "Fresh Cilantro / Dhaniya", "points": 35 },
        { "text": "Garam Masala / Cumin (Jeera)", "points": 26 },
        { "text": "Ginger-Garlic Paste", "points": 17 },
        { "text": "Milk / Heavy Cream / Paneer", "points": 13 },
        { "text": "Green Chilies / Onions", "points": 9 }
      ]
    },
    {
      "theme": "👨‍👩‍👧‍👦 Parents vs. Kids Showdown",
      "title": "Round 13 (Kids Guess)",
      "multiplier": 1,
      "prompt": "Name a classic phrase an Indian parent says when you ask for a sleepover.",
      "answers": [
        { "text": "\"Who all is going? / Do I know their parents?\"", "points": 40 },
        { "text": "\"Why sleep there? You have a bed at home!\"", "points": 24 },
        { "text": "\"Did you finish your homework first?\"", "points": 16 },
        { "text": "\"Ask your father / Ask your mother\"", "points": 10 },
        { "text": "\"What time are you coming back?\"", "points": 6 },
        { "text": "\"No.\" (Just flat-out no)", "points": 4 }
      ]
    },
    {
      "theme": "👨‍👩‍👧‍👦 Parents vs. Kids Showdown",
      "title": "Round 14 (Parents Guess)",
      "multiplier": 1,
      "prompt": "Name something a teen/college kid says to avoid talking about grades or internships.",
      "answers": [
        { "text": "\"It's fine / Everything's good\"", "points": 38 },
        { "text": "\"I don't know yet / Still figuring it out\"", "points": 26 },
        { "text": "\"Stop stressing, I'm handling it\"", "points": 15 },
        { "text": "\"Can we talk about something else?\"", "points": 10 },
        { "text": "\"Everyone is in the same boat\"", "points": 6 },
        { "text": "\"I have to go study / have a call\"", "points": 5 }
      ]
    },
    {
      "theme": "👨‍👩‍👧‍👦 Parents vs. Kids Showdown",
      "title": "Round 15 (Kids Guess)",
      "multiplier": 2,
      "prompt": "Name something an Indian parent does right after buying a new gadget or car.",
      "answers": [
        { "text": "Leave the protective plastic film on forever", "points": 42 },
        { "text": "Put a heavy-duty case / seat cover on it", "points": 24 },
        { "text": "Compare price to how cheap it was at Costco", "points": 16 },
        { "text": "Keep the cardboard box in the garage", "points": 11 },
        { "text": "Ask kids how to set up the Wi-Fi", "points": 7 }
      ]
    },
    {
      "theme": "👨‍👩‍👧‍👦 Parents vs. Kids Showdown",
      "title": "Round 16 (Parents Guess)",
      "multiplier": 2,
      "prompt": "Name something kids spend too much money on that drives Indian parents crazy.",
      "answers": [
        { "text": "Iced coffee / Matcha / Boba ($7 drinks)", "points": 38 },
        { "text": "DoorDash / Uber Eats delivery fees", "points": 26 },
        { "text": "Uber / Lyft instead of walking or train", "points": 16 },
        { "text": "Concert tickets / Festivals", "points": 12 },
        { "text": "Brand-name sneakers / Lululemon", "points": 8 }
      ]
    },
    {
      "theme": "👨‍👩‍👧‍👦 Parents vs. Kids Showdown",
      "title": "Round 17 (Kids Guess)",
      "multiplier": 3,
      "prompt": "Name something an Indian parent refuses to pay full price for.",
      "answers": [
        { "text": "Airline tickets (checking at 2 AM)", "points": 36 },
        { "text": "Groceries / Bulk items (Costco coupons)", "points": 25 },
        { "text": "Shipping fees (\"I'll pick it up at store\")", "points": 18 },
        { "text": "Hotel rooms / Rental cars", "points": 13 },
        { "text": "Clothes / Designer brands (clearance rack)", "points": 8 }
      ]
    },
    {
      "theme": "👨‍👩‍👧‍👦 Parents vs. Kids Showdown",
      "title": "Round 18 (Parents Guess)",
      "multiplier": 3,
      "prompt": "Name a slang word kids use today that leaves parents completely confused.",
      "answers": [
        { "text": "\"Bet\" / \"Say less\"", "points": 35 },
        { "text": "\"No cap\" / \"Cap\"", "points": 25 },
        { "text": "\"Cook\" / \"Let him cook\"", "points": 18 },
        { "text": "\"Rizz\"", "points": 12 },
        { "text": "\"Delulu\" / \"Mid\" / \"Slay\"", "points": 10 }
      ]
    },
    {
      "theme": "🏠 Indian Household Habits & WhatsApp",
      "title": "Round 19",
      "multiplier": 1,
      "prompt": "Name what an Indian parent says when you have a headache or cold.",
      "answers": [
        { "text": "\"Always on that phone!\"", "points": 38 },
        { "text": "\"Drink hot water / ginger chai / haldi doodh\"", "points": 25 },
        { "text": "\"Put Vicks VapoRub / Tiger Balm on it\"", "points": 16 },
        { "text": "\"You didn't eat / skipped breakfast\"", "points": 10 },
        { "text": "\"Went outside with wet hair / no jacket\"", "points": 6 },
        { "text": "\"Take a Tylenol / Crocin and sleep\"", "points": 5 }
      ]
    },
    {
      "theme": "🏠 Indian Household Habits & WhatsApp",
      "title": "Round 20",
      "multiplier": 1,
      "prompt": "Name something you see in a family WhatsApp group every morning.",
      "answers": [
        { "text": "Glittery \"Good Morning\" flower GIFs", "points": 40 },
        { "text": "Unverified health remedies (\"Eat garlic\")", "points": 24 },
        { "text": "Political forwards / News clips", "points": 15 },
        { "text": "Religious quotes / Devotional videos", "points": 10 },
        { "text": "Birthday wishes with 50 emojis", "points": 6 },
        { "text": "Blurry vacation photos from an uncle", "points": 5 }
      ]
    },
    {
      "theme": "🏠 Indian Household Habits & WhatsApp",
      "title": "Round 21",
      "multiplier": 1,
      "prompt": "Name something in EVERY Indian spice box (masala dabba).",
      "answers": [
        { "text": "Turmeric / Haldi", "points": 36 },
        { "text": "Cumin seeds / Jeera", "points": 25 },
        { "text": "Red chili powder / Mirchi", "points": 16 },
        { "text": "Garam masala", "points": 11 },
        { "text": "Coriander powder / Dhaniya", "points": 7 },
        { "text": "Mustard seeds / Rai / Hing", "points": 5 }
      ]
    },
    {
      "theme": "🏠 Indian Household Habits & WhatsApp",
      "title": "Round 22",
      "multiplier": 2,
      "prompt": "Name a classic excuse an Indian kid gives to skip a family party.",
      "answers": [
        { "text": "\"Too much homework / studying for exam\"", "points": 42 },
        { "text": "\"Big work deadline / project due\"", "points": 24 },
        { "text": "\"Not feeling well / have a migraine\"", "points": 16 },
        { "text": "\"Already have plans with friends\"", "points": 11 },
        { "text": "\"I won't know anyone my age there!\"", "points": 7 }
      ]
    },
    {
      "theme": "🏠 Indian Household Habits & WhatsApp",
      "title": "Round 23",
      "multiplier": 2,
      "prompt": "Name something an Indian dad insists on doing himself.",
      "answers": [
        { "text": "Fixing plumbing / appliances via YouTube", "points": 38 },
        { "text": "Doing his own taxes / spreadsheets", "points": 25 },
        { "text": "Mowing the lawn / Washing the car", "points": 16 },
        { "text": "Assembling furniture / Mounting TV", "points": 12 },
        { "text": "Cutting hair / Trimming trees", "points": 9 }
      ]
    },
    {
      "theme": "🏠 Indian Household Habits & WhatsApp",
      "title": "Round 24",
      "multiplier": 3,
      "prompt": "Name something an Indian parent considers a \"waste of money.\"",
      "answers": [
        { "text": "Eating out (\"We have food at home!\")", "points": 38 },
        { "text": "Buying bottled water at airport/park", "points": 25 },
        { "text": "Paying for extended warranties / AppleCare", "points": 16 },
        { "text": "Designer clothes / Luxury cars", "points": 12 },
        { "text": "Valet parking or airport seat selection", "points": 9 }
      ]
    },
    {
      "theme": "💃 Weddings, Sangeets & Big Parties",
      "title": "Round 25",
      "multiplier": 1,
      "prompt": "Name something guaranteed on the dance floor at an Indian wedding.",
      "answers": [
        { "text": "\"Screwing in the lightbulb\" bhangra move", "points": 38 },
        { "text": "Aunties forming a tight circle pulling people in", "points": 25 },
        { "text": "Uncles doing off-beat shoulder bounces", "points": 16 },
        { "text": "Throwing fake cash / dollar bills in the air", "points": 10 },
        { "text": "Kids sliding across the floor on knees", "points": 6 },
        { "text": "Losing a safety pin, dupatta, or shoe", "points": 5 }
      ]
    },
    {
      "theme": "💃 Weddings, Sangeets & Big Parties",
      "title": "Round 26",
      "multiplier": 1,
      "prompt": "Name a song that packs the dance floor at any Desi party.",
      "answers": [
        { "text": "\"Kala Chashma\"", "points": 36 },
        { "text": "\"Mundian To Bach Ke\"", "points": 26 },
        { "text": "\"London Thumakda\"", "points": 16 },
        { "text": "\"Chaiyya Chaiyya\"", "points": 10 },
        { "text": "\"Badtameez Dil\" / \"Gallan Goodiyaan\"", "points": 7 },
        { "text": "\"Tunak Tunak Tun\"", "points": 5 }
      ]
    },
    {
      "theme": "💃 Weddings, Sangeets & Big Parties",
      "title": "Round 27",
      "multiplier": 2,
      "prompt": "Name a complaint heard after a huge Indian wedding or party.",
      "answers": [
        { "text": "\"Food ran out / Catering too spicy or cold\"", "points": 38 },
        { "text": "\"Started 2 hours late (Indian Standard Time)\"", "points": 26 },
        { "text": "\"DJ music was way too loud to talk!\"", "points": 16 },
        { "text": "\"Speeches / performances went on forever\"", "points": 12 },
        { "text": "\"Parking nightmare / Not enough seating\"", "points": 8 }
      ]
    },
    {
      "theme": "💃 Weddings, Sangeets & Big Parties",
      "title": "Round 28",
      "multiplier": 3,
      "prompt": "Name something that goes wrong right before a big Indian party starts.",
      "answers": [
        { "text": "Blouse, kurta, or zipper breaks last minute", "points": 36 },
        { "text": "Caterer or biryani tray is 1 hour late", "points": 26 },
        { "text": "Fighting over the bathroom / iron / curling iron", "points": 18 },
        { "text": "Someone forgot the gift envelope (shagun)", "points": 12 },
        { "text": "Mom stressed yelling to clean living room", "points": 8 }
      ]
    },
    {
      "theme": "✈️ Travel, Careers & Uncle Debates",
      "title": "Round 29",
      "multiplier": 2,
      "prompt": "Name something you MUST pack in your suitcase when flying back from India to the US.",
      "answers": [
        { "text": "Snacks / Namkeen / Chakli / Banana chips", "points": 35 },
        { "text": "Homemade pickles (Achar) / Masalas / Ghee", "points": 25 },
        { "text": "Sweets / Mithai (Kaju Katli, Mysore Pak)", "points": 18 },
        { "text": "Clothes / Kurtas / Sarees for weddings", "points": 13 },
        { "text": "Indian medicines / Ayurvedic creams", "points": 9 }
      ]
    },
    {
      "theme": "✈️ Travel, Careers & Uncle Debates",
      "title": "Round 30",
      "multiplier": 2,
      "prompt": "Name a way you can immediately tell an Indian family is at the airport.",
      "answers": [
        { "text": "Suitcases wrapped in plastic or bright ribbons", "points": 36 },
        { "text": "Repacking overweight bags on floor at check-in", "points": 26 },
        { "text": "15 relatives waving goodbye at security", "points": 17 },
        { "text": "Carrying homemade parathas / thepla in foil", "points": 13 },
        { "text": "Requesting wheelchair assistance for Grandma", "points": 8 }
      ]
    },
    {
      "theme": "✈️ Travel, Careers & Uncle Debates",
      "title": "Round 31",
      "multiplier": 2,
      "prompt": "Name a career path that makes Indian parents beam with pride when bragging to relatives.",
      "answers": [
        { "text": "Doctor / Surgeon", "points": 45 },
        { "text": "Software / AI / Computer Engineer", "points": 28 },
        { "text": "Lawyer", "points": 12 },
        { "text": "Finance / Wall Street / Investment Banker", "points": 9 },
        { "text": "CEO / Startup Founder", "points": 6 }
      ]
    },
    {
      "theme": "✈️ Travel, Careers & Uncle Debates",
      "title": "Round 32",
      "multiplier": 3,
      "prompt": "Name a topic that starts a 45-minute debate among uncles after chai.",
      "answers": [
        { "text": "Indian / US Politics", "points": 38 },
        { "text": "Cricket (IPL, World Cup, team selection)", "points": 25 },
        { "text": "Real estate / Interest rates / Stock market", "points": 18 },
        { "text": "Whose kids got into which college / job", "points": 11 },
        { "text": "Traffic / Which route has fewer tolls", "points": 8 }
      ]
    },
    {
      "theme": "✈️ Travel, Careers & Uncle Debates",
      "title": "Round 33",
      "multiplier": 3,
      "prompt": "Name a classic trope or scene you see in almost every old-school Bollywood movie.",
      "answers": [
        { "text": "Choreographed dance in the rain or Swiss Alps", "points": 36 },
        { "text": "Rich parents forbidding marriage to someone poor", "points": 25 },
        { "text": "One punch sending 10 bad guys flying in slow-mo", "points": 18 },
        { "text": "Dramatic courtroom / police arriving at the end", "points": 12 },
        { "text": "Long-lost twins separated at a fair (Mela)", "points": 9 }
      ]
    },
    {
      "theme": "✈️ Travel, Careers & Uncle Debates",
      "title": "Round 34",
      "multiplier": 3,
      "prompt": "Name something that always happens on an Indian family road trip.",
      "answers": [
        { "text": "Packing enough homemade thepla & snacks for 3 days", "points": 38 },
        { "text": "Dad refusing to stop for bathroom breaks", "points": 25 },
        { "text": "Leaving 2 hours after the '5:00 AM sharp' plan", "points": 16 },
        { "text": "Arguing over Google Maps vs. Dad's shortcut", "points": 12 },
        { "text": "Blasting 90s Bollywood songs the whole drive", "points": 9 }
      ]
    },
    {
      "theme": "⚡ Sudden-Death Tie-Breakers (#1 Answer Only)",
      "title": "Tie-Breaker 1",
      "multiplier": 3,
      "prompt": "SUDDEN DEATH (#1 Answer Only): Name the ONE thing an Indian mom will NEVER let you leave her house without doing.",
      "answers": [
        { "text": "Eating food / Taking leftovers in Tupperware!", "points": 100 }
      ]
    },
    {
      "theme": "⚡ Sudden-Death Tie-Breakers (#1 Answer Only)",
      "title": "Tie-Breaker 2",
      "multiplier": 3,
      "prompt": "SUDDEN DEATH (#1 Answer Only): Name the ultimate status symbol in an Indian-American household.",
      "answers": [
        { "text": "Kid in Med School / Ivy League (or Tesla in driveway)", "points": 100 }
      ]
    },
    {
      "theme": "⚡ Sudden-Death Tie-Breakers (#1 Answer Only)",
      "title": "Tie-Breaker 3",
      "multiplier": 3,
      "prompt": "SUDDEN DEATH (#1 Answer Only): What time do guests actually show up when an Indian party invite says '6:00 PM'?",
      "answers": [
        { "text": "7:30 PM – 8:00 PM (Indian Standard Time!)", "points": 100 }
      ]
    }
  ],
  "fastMoney": [
    {
      "prompt": "Name a spice every Indian kitchen runs out of right before a big party.",
      "hint": "Garam Masala (35), Cumin/Jeera (28), Cardamom/Elaichi (18), Turmeric/Haldi (12), Cilantro (7)"
    },
    {
      "prompt": "Name something an Indian mom saves and reuses instead of throwing away.",
      "hint": "Yogurt/Dahi tubs (45), Grocery bags (25), Pickle jars (15), Gift bags (10), Foil/Ziplocs (5)"
    },
    {
      "prompt": "Name a popular Indian sweet (mithai) you see at every holiday gathering.",
      "hint": "Gulab Jamun (40), Kaju Katli (26), Rasmalai (18), Jalebi (10), Ladoo (6)"
    },
    {
      "prompt": "Name a major Indian city people always ask if you've visited recently.",
      "hint": "Mumbai (36), Delhi (28), Bengaluru (18), Hyderabad (10), Ahmedabad/Kolkata (8)"
    },
    {
      "prompt": "Name something you hear blasting from the TV in an Indian living room.",
      "hint": "Cricket match (42), Bollywood movies/music (26), News debates (18), Serials (9), Bhajans (5)"
    },
    {
      "prompt": "Name an Indian street food (chaat) everyone crowds around at a party.",
      "hint": "Pani Puri / Golgappa (44), Samosa Chaat (24), Bhel Puri (15), Pav Bhaji (11), Aloo Tikki (6)"
    },
    {
      "prompt": "Name a car brand you see parked in every Desi neighborhood driveway.",
      "hint": "Tesla (38), Toyota / Lexus (26), Honda / Acura (16), BMW (12), Mercedes (8)"
    },
    {
      "prompt": "Name something an Indian dad checks three times before leaving for the airport.",
      "hint": "Passports (45), Stove / Gas off (22), Doors locked (16), Boarding passes (10), Luggage weight (7)"
    },
    {
      "prompt": "Name a Bollywood actor even your grandparents know by name.",
      "hint": "Amitabh Bachchan (42), Shah Rukh Khan (32), Salman Khan (12), Dharmendra (8), Raj Kapoor (6)"
    },
    {
      "prompt": "Name something you put in masala chai besides tea leaves and milk.",
      "hint": "Ginger / Adrak (42), Cardamom / Elaichi (30), Sugar (16), Cloves / Cinnamon (8), Tulsi (4)"
    },
    {
      "prompt": "Name an aisle or store Indian parents never skip on a weekend.",
      "hint": "Costco (44), Patel Brothers / Indian Grocery (30), Trader Joe's (12), Home Depot (8), Marshalls (6)"
    },
    {
      "prompt": "Name a traditional Indian outfit people wear to a festive dinner.",
      "hint": "Saree (38), Kurta Pajama (30), Lehenga (16), Salwar Kameez (10), Sherwani (6)"
    },
    {
      "prompt": "Name a fruit Indian parents cut up and bring to your room without asking.",
      "hint": "Mango (42), Apple (24), Pomegranate / Anar (16), Papaya (10), Orange / Guava (8)"
    },
    {
      "prompt": "Name a game played at every big Desi family get-together.",
      "hint": "Teen Patti / Poker (36), Antakshari (26), Carrom (16), Dumb Charades (14), Ludo (8)"
    },
    {
      "prompt": "Name a home remedy an Indian mom gives you the second you sneeze.",
      "hint": "Haldi Doodh / Turmeric Milk (40), Ginger / Masala Chai (25), Vicks VapoRub (18), Steam / Kadha (11), Honey & Warm Water (6)"
    },
    {
      "prompt": "Name an Indian bread people order at every restaurant.",
      "hint": "Garlic Naan (48), Butter Naan (22), Roti / Chapati (14), Aloo Paratha (10), Bhatura (6)"
    },
    {
      "prompt": "Name a question aunties ask single twenty-somethings at every party.",
      "hint": "When are you getting married? (48), Seeing anyone? (22), How's your job/salary? (15), Buying a house? (9), Grad school? (6)"
    },
    {
      "prompt": "Name something you always find inside an Indian freezer.",
      "hint": "Frozen Parathas / Naan (38), Green Peas / Mixed Veggies (24), Ginger-Garlic cubes (16), Kulfi / Ice Cream (12), Extra Rotis (10)"
    },
    {
      "prompt": "Name a legendary Indian cricketer uncles still compare every new player to.",
      "hint": "Sachin Tendulkar (45), MS Dhoni (24), Virat Kohli (16), Kapil Dev (9), Sunil Gavaskar (6)"
    },
    {
      "prompt": "Name a condiment or side always on the table at an Indian meal.",
      "hint": "Mango Pickle / Achaar (36), Raita / Yogurt (26), Mint-Cilantro Chutney (18), Tamarind Chutney (12), Papad (8)"
    },
    {
      "prompt": "Name something that takes way longer than expected at an Indian wedding.",
      "hint": "Family group photos on stage (40), Baraat procession (24), Ceremony / Pheras (16), Buffet line (12), Speeches & dances (8)"
    },
    {
      "prompt": "Name a vegetable Indian moms sneak into almost every dish.",
      "hint": "Potatoes / Aloo (38), Cauliflower / Gobi (24), Spinach / Palak (16), Peas / Matar (12), Bottle Gourd / Lauki (10)"
    },
    {
      "prompt": "Name an excuse people give for showing up an hour late to a Desi party.",
      "hint": "Traffic was terrible (40), Getting ready / ironing saree (24), Kids took forever (16), Making dish / chai at home (12), Parking (8)"
    },
    {
      "prompt": "Name something an Indian dad does to save money on the utility bill.",
      "hint": "Turning off lights in every room (44), Adjusting the thermostat (28), Unplugging chargers (14), Shorter showers (8), Opening windows (6)"
    },
    {
      "prompt": "Name a song or artist that instantly gets every generation on the dance floor.",
      "hint": "Punjabi / Daler Mehndi / Diljit (38), 90s Bollywood hits (26), Kajra Re / Chaiyya Chaiyya (16), Kala Chashma (12), Garba / Dandiya beats (8)"
    }
  ]
}

  },
  {
    id: "sample-friendly-feud.json",
    label: "🤝 Friendly-Feud Sample Pack (3 Rounds)",
    file: "./decks/sample-friendly-feud.json",
    data: {
  "rounds": [
    {
      "question": "Name something people always do right after finishing a huge meal.",
      "multiply": 1,
      "answers": [
        { "ans": "Take a nap on the couch", "pnt": 40 },
        { "ans": "Have coffee or tea", "pnt": 24 },
        { "ans": "Put on stretchy pants", "pnt": 15 },
        { "ans": "Eat dessert", "pnt": 10 },
        { "ans": "Watch sports or a movie", "pnt": 6 },
        { "ans": "Go for a walk", "pnt": 5 }
      ]
    },
    {
      "question": "Name a reason someone might be running 30 minutes late to a party.",
      "multiply": 2,
      "answers": [
        { "ans": "Stuck in traffic / Parking", "pnt": 38 },
        { "ans": "Couldn't decide what to wear", "pnt": 25 },
        { "ans": "Stopped to pick up food or drinks", "pnt": 16 },
        { "ans": "Lost track of time", "pnt": 12 },
        { "ans": "Waiting on spouse or kids", "pnt": 9 }
      ]
    }
  ],
  "final_round": [
    {
      "question": "Name a pizza topping almost everyone can agree on.",
      "answers": [
        ["Cheese", 42],
        ["Pepperoni", 30],
        ["Mushrooms", 14],
        ["Olives", 8],
        ["Peppers", 6]
      ]
    },
    {
      "question": "Name something people save and reuse instead of throwing away.",
      "answers": [
        ["Plastic containers", 45],
        ["Grocery bags", 25],
        ["Glass jars", 15],
        ["Gift bags", 10],
        ["Foil", 5]
      ]
    }
  ]
}

  }
,
  {
    id: "2025.json",
    label: "⭐ Family Feud 2025 (60 Rounds • 8 Fast Money Sets)",
    file: "./decks/2025.json",
    data: {
  "gameTitle": "Family Feud 2025",
  "gameIcon": "⭐",
  "deckName": "Family Feud 2025 (60 Rounds • 8 Fast Money Sets)",
  "teamPresets": [
    ["Team Red", "Team Blue"],
    ["The Champs", "The Challengers"],
    ["Family A", "Family B"],
    ["Parents", "Kids"],
    ["Celebrity All-Stars", "Hometown Heroes"]
  ],
  "rounds": [
    {
      "theme": "📺 Pop Culture & Celebrity Matchups",
      "title": "Round 1",
      "multiplier": 1,
      "prompt": "Name a Britney Spears song that describes your energy in the bedroom.",
      "answers": [
        { "text": "\"Oops!... I Did It Again\"", "points": 49 },
        { "text": "\"...Baby One More Time\"", "points": 19 },
        { "text": "\"Toxic\"", "points": 11 },
        { "text": "\"Circus\"", "points": 7 },
        { "text": "\"I'm a Slave 4 U\"", "points": 3 }
      ]
    },
    {
      "theme": "📺 Pop Culture & Celebrity Matchups",
      "title": "Round 2",
      "multiplier": 1,
      "prompt": "Name a female American celebrity who is treated like absolute royalty.",
      "answers": [
        { "text": "Taylor Swift", "points": 21 },
        { "text": "Oprah Winfrey", "points": 18 },
        { "text": "Beyoncé", "points": 13 },
        { "text": "Dolly Parton", "points": 12 },
        { "text": "Martha Stewart", "points": 8 },
        { "text": "Jennifer Lopez", "points": 6 }
      ]
    },
    {
      "theme": "📺 Pop Culture & Celebrity Matchups",
      "title": "Round 3",
      "multiplier": 2,
      "prompt": "Name someone who is widely considered the funniest person alive right now.",
      "answers": [
        { "text": "Steve Harvey", "points": 24 },
        { "text": "Kevin Hart", "points": 21 },
        { "text": "Dave Chappelle", "points": 16 },
        { "text": "Jerry Seinfeld", "points": 14 },
        { "text": "Chris Rock", "points": 10 },
        { "text": "Adam Sandler", "points": 8 },
        { "text": "Jim Carrey", "points": 5 }
      ]
    },
    {
      "theme": "📺 Pop Culture & Celebrity Matchups",
      "title": "Round 4",
      "multiplier": 2,
      "prompt": "Name a living celebrity you would love to share a relaxing smoke with.",
      "answers": [
        { "text": "Snoop Dogg", "points": 48 },
        { "text": "Willie Nelson", "points": 22 },
        { "text": "Barack Obama", "points": 12 },
        { "text": "Tommy Chong / Cheech", "points": 8 },
        { "text": "Woody Harrelson", "points": 5 },
        { "text": "Seth Rogen", "points": 4 }
      ]
    },
    {
      "theme": "📺 Pop Culture & Celebrity Matchups",
      "title": "Round 5",
      "multiplier": 3,
      "prompt": "Name a specific smell that would instantly remind a woman of her ex-boyfriend.",
      "answers": [
        { "text": "His cologne / Aftershave", "points": 42 },
        { "text": "Body odor / Sweaty gym clothes", "points": 24 },
        { "text": "Beer / Stale alcohol", "points": 14 },
        { "text": "Cigarette smoke", "points": 10 },
        { "text": "Cheap deodorant / Axe spray", "points": 6 },
        { "text": "Cheese", "points": 4 }
      ]
    },
    {
      "theme": "📺 Pop Culture & Celebrity Matchups",
      "title": "Round 6",
      "multiplier": 1,
      "prompt": "Admit it—which TV host, past or present, have people secretly had a crush on?",
      "answers": [
        { "text": "Steve Harvey", "points": 26 },
        { "text": "Jimmy Fallon", "points": 18 },
        { "text": "Bob Barker", "points": 15 },
        { "text": "Alex Trebek", "points": 14 },
        { "text": "Regis Philbin", "points": 11 },
        { "text": "Conan O'Brien", "points": 9 },
        { "text": "Jeff Probst", "points": 6 }
      ]
    },
    {
      "theme": "📺 Pop Culture & Celebrity Matchups",
      "title": "Round 7",
      "multiplier": 2,
      "prompt": "Name the greatest all-female R&B singing group of all time.",
      "answers": [
        { "text": "The Supremes", "points": 36 },
        { "text": "TLC", "points": 27 },
        { "text": "Destiny's Child", "points": 18 },
        { "text": "En Vogue", "points": 9 },
        { "text": "The Pointer Sisters", "points": 5 },
        { "text": "SWV / Salt-N-Pepa", "points": 4 }
      ]
    },
    {
      "theme": "📺 Pop Culture & Celebrity Matchups",
      "title": "Round 8",
      "multiplier": 3,
      "prompt": "Name a job or role in an A-list celebrity's personal entourage.",
      "answers": [
        { "text": "Bodyguard / Security", "points": 44 },
        { "text": "Stylist / Hair & Makeup Glam", "points": 22 },
        { "text": "Personal Assistant", "points": 16 },
        { "text": "Manager / Publicist", "points": 9 },
        { "text": "Personal Chef", "points": 5 },
        { "text": "Private Driver / Chauffeur", "points": 4 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 9",
      "multiplier": 1,
      "prompt": "We asked 100 single men: What is your move if your date simply will not stop talking?",
      "answers": [
        { "text": "Fake bathroom break / Escape", "points": 40 },
        { "text": "Smile, nod, and say \"uh-huh\"", "points": 31 },
        { "text": "Zone out / Think about sports", "points": 16 },
        { "text": "Lean in and kiss her to shush her", "points": 11 },
        { "text": "Pretend to get an emergency call", "points": 2 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 10",
      "multiplier": 1,
      "prompt": "We asked 100 married women: You start choking during dinner—what is your husband doing?",
      "answers": [
        { "text": "Staring at his phone screen", "points": 24 },
        { "text": "Glued to the TV / Watching sports", "points": 21 },
        { "text": "Still chewing his own food", "points": 15 },
        { "text": "Calling 911 / Shouting for help", "points": 14 },
        { "text": "Performing the Heimlich maneuver", "points": 11 },
        { "text": "Asking \"Are you okay, babe?\"", "points": 8 },
        { "text": "Completely freezing in panic", "points": 6 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 11",
      "multiplier": 2,
      "prompt": "We asked 100 married women: What would you do if you found a dating app on your husband's phone?",
      "answers": [
        { "text": "Smash / Throw his phone", "points": 35 },
        { "text": "Open it and read all the messages", "points": 26 },
        { "text": "Delete his profile and the app", "points": 16 },
        { "text": "Pack my bags / Call a divorce lawyer", "points": 12 },
        { "text": "Confront and scream at him", "points": 8 },
        { "text": "Create a fake profile and catfish him", "points": 3 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 12",
      "multiplier": 2,
      "prompt": "We asked 100 women: You discover the diamond in your engagement ring is fake—what do you do?",
      "answers": [
        { "text": "Confront him and demand an upgrade", "points": 38 },
        { "text": "Keep quiet and wear it anyway", "points": 24 },
        { "text": "Call off the wedding / Break up", "points": 16 },
        { "text": "Throw the ring in his face", "points": 12 },
        { "text": "Cry hysterically to my mom", "points": 6 },
        { "text": "Take it to a pawn shop to check value", "points": 4 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 13",
      "multiplier": 3,
      "prompt": "Name something you pray a new partner doesn't do when you take your clothes off for the first time.",
      "answers": [
        { "text": "Burst out laughing or giggling", "points": 52 },
        { "text": "Gag or make a sick face", "points": 18 },
        { "text": "Look away / Turn the lights off fast", "points": 12 },
        { "text": "Stare wide-eyed in horror", "points": 8 },
        { "text": "Point at something and ask \"What's that?\"", "points": 6 },
        { "text": "Make an excuse and run out", "points": 4 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 14",
      "multiplier": 1,
      "prompt": "Name something an angry wife might place right on top of her cheating husband's birthday cake.",
      "answers": [
        { "text": "Signed divorce papers", "points": 38 },
        { "text": "A photo of him with his mistress", "points": 24 },
        { "text": "Her wedding ring / band", "points": 16 },
        { "text": "The mistress's phone number", "points": 10 },
        { "text": "His packed suitcases / car keys", "points": 7 },
        { "text": "A mean message piped in icing", "points": 5 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 15",
      "multiplier": 2,
      "prompt": "We asked 100 women: If you think your boyfriend will propose tonight, what do you do to prepare?",
      "answers": [
        { "text": "Get a fresh manicure / Nails done", "points": 36 },
        { "text": "Shave legs and full body wax", "points": 24 },
        { "text": "Pick out the perfect stunning outfit", "points": 18 },
        { "text": "Get hair professionally styled", "points": 11 },
        { "text": "Put on full glam makeup", "points": 7 },
        { "text": "Practice looking surprised and crying", "points": 4 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 16",
      "multiplier": 3,
      "prompt": "We asked 100 single men: Your new girlfriend has a 10/10 body and 0/10 breath—what do you do?",
      "answers": [
        { "text": "Constantly offer mints or gum", "points": 44 },
        { "text": "Hold breath / Breathe through mouth", "points": 22 },
        { "text": "Tell her gently / Buy her mouthwash", "points": 15 },
        { "text": "Stick strictly to cheek kisses", "points": 10 },
        { "text": "Tough it out—she's out of my league!", "points": 6 },
        { "text": "Break up immediately", "points": 3 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 17",
      "multiplier": 1,
      "prompt": "Complete the sentence: \"Before going on a big first date, I always have to shave my...\"",
      "answers": [
        { "text": "Legs", "points": 42 },
        { "text": "Face / Beard / Stubble", "points": 29 },
        { "text": "Bikini zone / Down under", "points": 16 },
        { "text": "Underarms / Armpits", "points": 6 },
        { "text": "Chest / Back", "points": 4 },
        { "text": "Nose hairs / Unibrow", "points": 3 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 18",
      "multiplier": 2,
      "prompt": "Name an animal that some men accidentally sound like when they make love.",
      "answers": [
        { "text": "Pig / Warthog (Oinking / Grunting)", "points": 42 },
        { "text": "Grizzly Bear (Roaring / Growling)", "points": 19 },
        { "text": "Bull / Steer (Snorting)", "points": 13 },
        { "text": "Gorilla / Monkey (Pounding chest)", "points": 10 },
        { "text": "Horse / Stallion (Neighing)", "points": 7 },
        { "text": "Howling Dog / Wolf", "points": 5 },
        { "text": "Donkey / Jackass (Braying)", "points": 4 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 19",
      "multiplier": 2,
      "prompt": "You'd be mortified to find out the romantic flowers your date gave you were picked from where?",
      "answers": [
        { "text": "A cemetery / Fresh grave plot", "points": 45 },
        { "text": "A neighbor's private flowerbed", "points": 23 },
        { "text": "The gas station / 99-cent rack", "points": 16 },
        { "text": "The trash can / Dumpster", "points": 10 },
        { "text": "Another date he went on earlier", "points": 6 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 20",
      "multiplier": 3,
      "prompt": "When a cheesy magician proposes, he might pull the engagement ring out of his girlfriend's what?",
      "answers": [
        { "text": "Ear", "points": 44 },
        { "text": "Mouth", "points": 22 },
        { "text": "Cleavage / Bra", "points": 15 },
        { "text": "Hair", "points": 9 },
        { "text": "Purse / Handbag", "points": 6 },
        { "text": "Nose", "points": 4 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 21",
      "multiplier": 1,
      "prompt": "A woman might tell her boyfriend: \"I love your hugs, but stop squeezing me like I'm a...\" what?",
      "answers": [
        { "text": "Lemon / Orange / Fresh fruit", "points": 37 },
        { "text": "Stuffed animal / Teddy bear", "points": 24 },
        { "text": "Wet kitchen sponge", "points": 13 },
        { "text": "Foam stress ball", "points": 11 },
        { "text": "Throw pillow", "points": 8 },
        { "text": "Balloon / Tube of toothpaste", "points": 7 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 22",
      "multiplier": 2,
      "prompt": "Name something you would hate to have happen while being romantic outside in the backyard.",
      "answers": [
        { "text": "Caught by neighbors / Peeping tom", "points": 58 },
        { "text": "Sudden thunderstorm / Downpour", "points": 19 },
        { "text": "Swarm of mosquitoes / Bees / Ants", "points": 12 },
        { "text": "Lawn sprinklers blast on", "points": 6 },
        { "text": "Rolling over into dog poop", "points": 3 },
        { "text": "Blinding motion floodlights turn on", "points": 2 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 23",
      "multiplier": 2,
      "prompt": "We asked 100 women: \"My partner would be way more fun if he enjoyed ________ just like a woman!\"",
      "answers": [
        { "text": "Gossiping / Spilling hot tea", "points": 38 },
        { "text": "Going shopping at the mall", "points": 29 },
        { "text": "Dancing at the club", "points": 16 },
        { "text": "Watching reality TV / Rom-coms", "points": 10 },
        { "text": "Spa days / Mani-pedis", "points": 7 }
      ]
    },
    {
      "theme": "💍 Love, Dating & Marriage Fails",
      "title": "Round 24",
      "multiplier": 3,
      "prompt": "Grandma warned us: \"Every time your Grandpa ________, his fake teeth fly right across the room!\"",
      "answers": [
        { "text": "Sneezes or coughs hard", "points": 43 },
        { "text": "Laughs / Chuckles loudly", "points": 27 },
        { "text": "Burps / Belches", "points": 12 },
        { "text": "Farts / Passes gas", "points": 9 },
        { "text": "Takes a bite of corn on the cob", "points": 5 },
        { "text": "Yells at the referee on TV", "points": 4 }
      ]
    },
    {
      "theme": "💼 Work, Tech & Modern Daily Life",
      "title": "Round 25",
      "multiplier": 1,
      "prompt": "You look like a CEO on the Zoom camera, but from the waist down, what are you actually wearing?",
      "answers": [
        { "text": "Nothing at all! (Buck naked)", "points": 42 },
        { "text": "Flannel pajama bottoms", "points": 26 },
        { "text": "Boxer shorts / Underwear", "points": 16 },
        { "text": "Baggy sweatpants", "points": 10 },
        { "text": "Gym / Running shorts", "points": 4 },
        { "text": "Bathrobe / Towel", "points": 2 }
      ]
    },
    {
      "theme": "💼 Work, Tech & Modern Daily Life",
      "title": "Round 26",
      "multiplier": 1,
      "prompt": "Name an app on your smartphone that you would NEVER want your parents to see you opening.",
      "answers": [
        { "text": "Dating app (Tinder / Hinge / Bumble)", "points": 51 },
        { "text": "TikTok", "points": 20 },
        { "text": "OnlyFans / Adult streaming", "points": 14 },
        { "text": "Hidden Photo Vault / Camera roll", "points": 8 },
        { "text": "Bank / Credit card account", "points": 4 },
        { "text": "Reddit / Discord chat", "points": 3 }
      ]
    },
    {
      "theme": "💼 Work, Tech & Modern Daily Life",
      "title": "Round 27",
      "multiplier": 2,
      "prompt": "Name something riders do to avoid making conversation with an overly chatty Uber driver.",
      "answers": [
        { "text": "Stare at phone / Fake a phone call", "points": 43 },
        { "text": "Pop in earbuds / Over-ear headphones", "points": 35 },
        { "text": "Close eyes and pretend to be asleep", "points": 14 },
        { "text": "Stare straight out the window", "points": 5 },
        { "text": "Say \"I have a pounding migraine\"", "points": 3 }
      ]
    },
    {
      "theme": "💼 Work, Tech & Modern Daily Life",
      "title": "Round 28",
      "multiplier": 2,
      "prompt": "Bad news—your phone was hacked! Worse news—they mass-texted your spicy selfies to who?",
      "answers": [
        { "text": "Mom and Dad / Parents", "points": 48 },
        { "text": "The Boss / Work colleagues", "points": 24 },
        { "text": "In-laws / Mother-in-law", "points": 12 },
        { "text": "The entire family group chat", "points": 8 },
        { "text": "Church congregation / Pastor", "points": 5 },
        { "text": "My own kids", "points": 3 }
      ]
    },
    {
      "theme": "💼 Work, Tech & Modern Daily Life",
      "title": "Round 29",
      "multiplier": 3,
      "prompt": "Name an old-school reference source nobody buys anymore because everyone just Googles it.",
      "answers": [
        { "text": "Hardcover Encyclopedia set", "points": 42 },
        { "text": "Giant Dictionary", "points": 32 },
        { "text": "Yellow Pages / Phone book", "points": 18 },
        { "text": "Thesaurus", "points": 5 },
        { "text": "Road Atlas / Paper map", "points": 3 }
      ]
    },
    {
      "theme": "💼 Work, Tech & Modern Daily Life",
      "title": "Round 30",
      "multiplier": 1,
      "prompt": "Name something people stick their noses into when they really ought to mind their own business.",
      "answers": [
        { "text": "Other people's personal drama / Gossip", "points": 74 },
        { "text": "Someone else's phone screen", "points": 13 },
        { "text": "Their kid's / neighbor's marriage", "points": 7 },
        { "text": "The refrigerator at midnight", "points": 4 },
        { "text": "A baby's dirty diaper", "points": 2 }
      ]
    },
    {
      "theme": "💼 Work, Tech & Modern Daily Life",
      "title": "Round 31",
      "multiplier": 2,
      "prompt": "If you could see all the microscopic bacteria on it, name something you would never touch again.",
      "answers": [
        { "text": "Public bathroom door handle / knob", "points": 32 },
        { "text": "Smartphone touchscreen", "points": 26 },
        { "text": "Paper cash / Coins", "points": 16 },
        { "text": "Toilet flush lever / seat", "points": 12 },
        { "text": "Hotel TV remote control", "points": 7 },
        { "text": "Kitchen dish sponge", "points": 4 },
        { "text": "Airplane tray table / Gas pump", "points": 3 }
      ]
    },
    {
      "theme": "💼 Work, Tech & Modern Daily Life",
      "title": "Round 32",
      "multiplier": 3,
      "prompt": "Complete the panic phrase: \"Oh no—my ________ is leaking all over the place!\"",
      "answers": [
        { "text": "Kitchen faucet / Sink pipe", "points": 38 },
        { "text": "Car engine oil / Radiator", "points": 24 },
        { "text": "House roof / Ceiling", "points": 17 },
        { "text": "Bathroom toilet / Plumbing", "points": 10 },
        { "text": "Ink pen in my shirt pocket", "points": 6 },
        { "text": "Baby's diaper", "points": 5 }
      ]
    },
    {
      "theme": "💼 Work, Tech & Modern Daily Life",
      "title": "Round 33",
      "multiplier": 1,
      "prompt": "Name something people do in the bathroom mirror when they are 100% sure nobody is looking.",
      "answers": [
        { "text": "Flex muscles / Practice sexy poses", "points": 42 },
        { "text": "Pop pimples / Pluck stray hairs", "points": 26 },
        { "text": "Make funny faces / Test smiles", "points": 14 },
        { "text": "Turn around and inspect their butt", "points": 9 },
        { "text": "Sing into a hairbrush microphone", "points": 5 },
        { "text": "Rehearse arguments they will never have", "points": 4 }
      ]
    },
    {
      "theme": "💼 Work, Tech & Modern Daily Life",
      "title": "Round 34",
      "multiplier": 2,
      "prompt": "Name a reason you give someone an awkward \"side-hug\" instead of a warm, normal hug.",
      "answers": [
        { "text": "Don't like them / Creepy vibes", "points": 45 },
        { "text": "They smell like terrible body odor", "points": 24 },
        { "text": "Barely know them / Professional boundary", "points": 16 },
        { "text": "They are soaking wet / Sweaty", "points": 8 },
        { "text": "Rushing out the door / In a hurry", "points": 4 },
        { "text": "Holding a hot cup of coffee", "points": 3 }
      ]
    },
    {
      "theme": "👶 Family, Home & Growing Up",
      "title": "Round 35",
      "multiplier": 1,
      "prompt": "Fill in the family flex: \"Out of all my family members, I am officially the...\"",
      "answers": [
        { "text": "Smartest", "points": 26 },
        { "text": "Funniest", "points": 21 },
        { "text": "Best looking / Prettiest", "points": 17 },
        { "text": "Hardest working", "points": 13 },
        { "text": "Only sane one / Peacemaker", "points": 10 },
        { "text": "Oldest / Youngest", "points": 8 },
        { "text": "Tallest", "points": 5 }
      ]
    },
    {
      "theme": "👶 Family, Home & Growing Up",
      "title": "Round 36",
      "multiplier": 1,
      "prompt": "What would you do if a DNA test revealed that your long-term spouse is actually your cousin?",
      "answers": [
        { "text": "Pack my bags and break up instantly", "points": 30 },
        { "text": "Freak out and cry hysterically", "points": 23 },
        { "text": "Stay together / Too late to change now!", "points": 15 },
        { "text": "Check Ancestry to see how distant", "points": 11 },
        { "text": "Faint / Throw up", "points": 9 },
        { "text": "Vow never to speak of it to anyone", "points": 8 },
        { "text": "Make hillbilly / banjo jokes", "points": 4 }
      ]
    },
    {
      "theme": "👶 Family, Home & Growing Up",
      "title": "Round 37",
      "multiplier": 2,
      "prompt": "When little kids play pretend with their friends, what do they always pretend to be?",
      "answers": [
        { "text": "Doctors or Nurses", "points": 25 },
        { "text": "Superheroes (Batman / Spider-Man)", "points": 22 },
        { "text": "Cops and Robbers", "points": 18 },
        { "text": "Mom and Dad / Playing house", "points": 16 },
        { "text": "Wild Animals / Dinosaurs", "points": 11 },
        { "text": "Princesses / Kings / Royalty", "points": 8 }
      ]
    },
    {
      "theme": "👶 Family, Home & Growing Up",
      "title": "Round 38",
      "multiplier": 2,
      "prompt": "Besides your phone, what one item would you desperately want if you were stuck in an elevator?",
      "answers": [
        { "text": "Bottled water and snacks", "points": 54 },
        { "text": "An attractive crush to pass the time with", "points": 16 },
        { "text": "A cold bottle of wine / Beer", "points": 12 },
        { "text": "A private portable toilet / Bucket", "points": 8 },
        { "text": "A good paperback novel / Puzzle", "points": 5 },
        { "text": "A battery-powered fan / Air flow", "points": 3 },
        { "text": "A crowbar / Escape ladder", "points": 2 }
      ]
    },
    {
      "theme": "👶 Family, Home & Growing Up",
      "title": "Round 39",
      "multiplier": 3,
      "prompt": "Name something many women have been known to stretch the truth about the size of.",
      "answers": [
        { "text": "Dress / Clothing size", "points": 48 },
        { "text": "Body weight on the bathroom scale", "points": 38 },
        { "text": "Shoe size", "points": 6 },
        { "text": "Size of their home / Closet", "points": 4 },
        { "text": "Carat size of diamond jewelry", "points": 4 }
      ]
    },
    {
      "theme": "👶 Family, Home & Growing Up",
      "title": "Round 40",
      "multiplier": 1,
      "prompt": "Name something identical twins are usually forced to share on their birthday.",
      "answers": [
        { "text": "The birthday cake & candles", "points": 58 },
        { "text": "The birthday party venue & guests", "points": 22 },
        { "text": "Presents and toys", "points": 12 },
        { "text": "Birthday card from relatives", "points": 5 },
        { "text": "The spotlight and birthday song", "points": 3 }
      ]
    },
    {
      "theme": "👶 Family, Home & Growing Up",
      "title": "Round 41",
      "multiplier": 2,
      "prompt": "Name a nightmare disaster that an Olympic torch runner prays does not happen on live TV.",
      "answers": [
        { "text": "Tripping and eating asphalt face-first", "points": 53 },
        { "text": "A gust of wind blowing the flame out", "points": 24 },
        { "text": "Setting their own hair / jersey on fire", "points": 13 },
        { "text": "A sudden torrential rainstorm", "points": 6 },
        { "text": "Running the completely wrong way", "points": 2 },
        { "text": "Running shorts falling down", "points": 2 }
      ]
    },
    {
      "theme": "👶 Family, Home & Growing Up",
      "title": "Round 42",
      "multiplier": 3,
      "prompt": "Name an activity that is awesome for a 6-year-old's party, but disastrous for a bachelor party.",
      "answers": [
        { "text": "Musical chairs", "points": 34 },
        { "text": "Face painting", "points": 28 },
        { "text": "Hitting a donkey piñata", "points": 17 },
        { "text": "Hide and seek / Tag", "points": 10 },
        { "text": "A silly children's magic show", "points": 6 },
        { "text": "Pin the tail on the donkey", "points": 5 }
      ]
    },
    {
      "theme": "👶 Family, Home & Growing Up",
      "title": "Round 43",
      "multiplier": 1,
      "prompt": "Complete the classic insult: \"Would you please go get a ________!\"",
      "answers": [
        { "text": "Life!", "points": 71 },
        { "text": "Job!", "points": 17 },
        { "text": "Grip!", "points": 5 },
        { "text": "Clue!", "points": 4 },
        { "text": "Room!", "points": 3 }
      ]
    },
    {
      "theme": "👶 Family, Home & Growing Up",
      "title": "Round 44",
      "multiplier": 2,
      "prompt": "Name an extreme activity a woman should probably avoid when she is 9 months pregnant.",
      "answers": [
        { "text": "Riding roller coasters / Bungee jumping", "points": 43 },
        { "text": "Going out drinking / Bar hopping", "points": 24 },
        { "text": "Running a marathon / CrossFit", "points": 14 },
        { "text": "Flying long-distance on a plane", "points": 9 },
        { "text": "Wearing 6-inch stiletto heels", "points": 6 },
        { "text": "Lifting heavy couches / Moving", "points": 4 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 45",
      "multiplier": 3,
      "prompt": "Tell us what you are doing when you mutter: \"I am SO going to regret this tomorrow morning!\"",
      "answers": [
        { "text": "Taking extra tequila shots / Binge drinking", "points": 55 },
        { "text": "Devouring an entire pizza at 2:00 AM", "points": 22 },
        { "text": "Texting or dialing my ex-partner", "points": 12 },
        { "text": "Binge-watching TV until 4:00 AM", "points": 7 },
        { "text": "Impulse buying expensive stuff online", "points": 4 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 46",
      "multiplier": 1,
      "prompt": "Scientists should genetically engineer dairy cows to produce what drink instead of milk?",
      "answers": [
        { "text": "Ice cold Beer", "points": 42 },
        { "text": "Red / White Wine", "points": 26 },
        { "text": "Iced Coffee / Caramel Macchiato", "points": 16 },
        { "text": "Creamy Chocolate Milkshake", "points": 10 },
        { "text": "Coca-Cola / Dr Pepper", "points": 6 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 47",
      "multiplier": 2,
      "prompt": "Fill in the universal wish: \"Man, I really wish I was ________ right now!\"",
      "answers": [
        { "text": "Filthy rich / A multi-millionaire", "points": 44 },
        { "text": "Twenty years younger", "points": 20 },
        { "text": "In shape / 20 pounds lighter", "points": 16 },
        { "text": "A few inches taller", "points": 10 },
        { "text": "Lying on a sunny beach in Maui", "points": 6 },
        { "text": "Sound asleep in bed", "points": 4 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 48",
      "multiplier": 3,
      "prompt": "At a funeral visitation, name a shocking clue that makes you suspect the deceased is still alive.",
      "answers": [
        { "text": "Fingers twitch or hand moves", "points": 35 },
        { "text": "Chest visibly rising and falling (Breathing)", "points": 28 },
        { "text": "Eyelids flutter open or wink", "points": 16 },
        { "text": "Sitting straight up and speaking", "points": 10 },
        { "text": "Sneezing or coughing loudly", "points": 6 },
        { "text": "Loud knocking sound from inside the casket", "points": 5 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 49",
      "multiplier": 1,
      "prompt": "Name something that can turn a somber memorial service into a surprisingly fun celebration.",
      "answers": [
        { "text": "Live upbeat music and joyful dancing", "points": 44 },
        { "text": "A fully stocked open bar with cocktails", "points": 29 },
        { "text": "Hilarious roast speeches & funny stories", "points": 15 },
        { "text": "A video montage of wild, funny memories", "points": 6 },
        { "text": "A gourmet buffet with favorite comfort foods", "points": 4 },
        { "text": "A massive colorful balloon release", "points": 2 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 50",
      "multiplier": 2,
      "prompt": "Name something well-known that swings back and forth.",
      "answers": [
        { "text": "Playground swing / Tire swing", "points": 49 },
        { "text": "A monkey / Chimpanzee in trees", "points": 18 },
        { "text": "A grandfather clock pendulum", "points": 12 },
        { "text": "A baseball bat or golf club", "points": 9 },
        { "text": "Saloon / Double-hinged doors", "points": 7 },
        { "text": "An adventurous swinger couple", "points": 5 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 51",
      "multiplier": 3,
      "prompt": "Name a famous term or title that includes the word \"Beauty\".",
      "answers": [
        { "text": "Beauty and the Beast", "points": 45 },
        { "text": "Beauty Queen / Beauty Pageant", "points": 25 },
        { "text": "Sleeping Beauty", "points": 16 },
        { "text": "Beauty Salon / Parlor", "points": 8 },
        { "text": "Black Beauty", "points": 4 },
        { "text": "Beauty Mark", "points": 2 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 52",
      "multiplier": 1,
      "prompt": "Complete the phrase: \"Knock ________!\"",
      "answers": [
        { "text": "Knock knock (joke)", "points": 44 },
        { "text": "Knockout / Knock out", "points": 30 },
        { "text": "Knock on wood", "points": 16 },
        { "text": "Knock it off!", "points": 6 },
        { "text": "Knockdown", "points": 4 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 53",
      "multiplier": 2,
      "prompt": "Name a sovereign nation whose name begins with the letter \"S\".",
      "answers": [
        { "text": "Spain", "points": 42 },
        { "text": "Sweden", "points": 25 },
        { "text": "Switzerland", "points": 18 },
        { "text": "South Africa", "points": 8 },
        { "text": "Scotland", "points": 5 },
        { "text": "Singapore", "points": 2 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 54",
      "multiplier": 3,
      "prompt": "Name a U.S. President whose portrait appears on American paper currency.",
      "answers": [
        { "text": "George Washington ($1)", "points": 41 },
        { "text": "Abraham Lincoln ($5)", "points": 29 },
        { "text": "Alexander Hamilton ($10) / Ben Franklin ($100)", "points": 14 },
        { "text": "Thomas Jefferson ($2)", "points": 9 },
        { "text": "Andrew Jackson ($20)", "points": 7 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 55",
      "multiplier": 1,
      "prompt": "Name something very slippery that is almost impossible to hold onto.",
      "answers": [
        { "text": "A wet bar of shower soap", "points": 48 },
        { "text": "A fresh live fish / Eel", "points": 24 },
        { "text": "A melting ice cube", "points": 14 },
        { "text": "A soapy, wriggling baby in the bath", "points": 8 },
        { "text": "A greased watermelon", "points": 4 },
        { "text": "A water balloon", "points": 2 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 56",
      "multiplier": 2,
      "prompt": "Name a fruit or vegetable that a proud farmer says reminds him of his wife's bottom.",
      "answers": [
        { "text": "A plump, juicy Peach", "points": 42 },
        { "text": "A round Watermelon", "points": 24 },
        { "text": "A giant Pumpkin", "points": 16 },
        { "text": "A ripe red Tomato", "points": 9 },
        { "text": "A sweet Cantaloupe", "points": 5 },
        { "text": "A Bartlett Pear", "points": 4 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 57",
      "multiplier": 2,
      "prompt": "Instead of classic strip poker, name a hilarious card game to play strip-style.",
      "answers": [
        { "text": "UNO", "points": 42 },
        { "text": "Go Fish", "points": 26 },
        { "text": "Blackjack / 21", "points": 16 },
        { "text": "Old Maid", "points": 8 },
        { "text": "Cards Against Humanity / Exploding Kittens", "points": 5 },
        { "text": "Solitaire", "points": 3 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 58",
      "multiplier": 3,
      "prompt": "Name the scariest instrument a dentist can pick up while you're trapped in the chair.",
      "answers": [
        { "text": "The high-pitched tooth drill", "points": 64 },
        { "text": "Giant Novocaine syringe & needle", "points": 22 },
        { "text": "Heavy tooth extraction pliers", "points": 8 },
        { "text": "Sharp metal scraping hook / Pick", "points": 4 },
        { "text": "The shocking final bill", "points": 2 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 59",
      "multiplier": 1,
      "prompt": "Name a terrible smell you hope the mall Santa Claus does NOT reek of when you sit on his lap.",
      "answers": [
        { "text": "Cheap whiskey / Hard liquor", "points": 42 },
        { "text": "Urine / Stale diaper smell", "points": 22 },
        { "text": "Weed / Marijuana smoke", "points": 13 },
        { "text": "Stale cigarette smoke", "points": 11 },
        { "text": "Rank body odor / Gym sweat", "points": 8 },
        { "text": "Heavy cheap perfume", "points": 4 }
      ]
    },
    {
      "theme": "🎉 Late Night Parties, Wild Quirks & Steve's Favorites",
      "title": "Round 60",
      "multiplier": 2,
      "prompt": "On Christmas morning you find Santa Claus firmly wedged in your chimney—what's your first move?",
      "answers": [
        { "text": "Dial 911 / Call the fire department", "points": 40 },
        { "text": "Grab his boots and tug with all my might", "points": 22 },
        { "text": "Burst out laughing hysterically", "points": 14 },
        { "text": "Take a viral selfie / Post to TikTok", "points": 12 },
        { "text": "Ask \"Did you remember my PS5 first?\"", "points": 7 },
        { "text": "Hand him a warm mug of milk and cookies", "points": 5 }
      ]
    }
  ],
  "fastMoney": [
    {
      "prompt": "In school, you would get in serious trouble for bringing home what report card grade?",
      "hint": "F (54), D (28), C (14), B (4)"
    },
    {
      "prompt": "Name a legendary classic horror movie franchise.",
      "hint": "Halloween / Michael Myers (38), Friday the 13th (25), Scream (18), A Nightmare on Elm Street (12), Saw (7)"
    },
    {
      "prompt": "Name something you genuinely, deeply love that is NOT a human being.",
      "hint": "My Dog / Pet (48), Money / Cash (22), Pizza / Comfort Food (15), Morning Coffee (9), My Phone / Car (6)"
    },
    {
      "prompt": "Name something people drink or take to soothe a scratchy sore throat.",
      "hint": "Hot tea with lemon & honey (45), Throat lozenge / Cough drop (28), Warm salt water gargle (15), Chicken noodle soup (8), Cough syrup (4)"
    },
    {
      "prompt": "Name a trusty hand tool everyone keeps around the house to fix things.",
      "hint": "Hammer (46), Screwdriver (32), Adjustable wrench (14), Pliers (5), Roll of duct tape (3)"
    },
    {
      "prompt": "Name something you reach for in the pitch black in the middle of the night.",
      "hint": "Smartphone (46), Eyeglasses (24), Glass of ice water (16), Nightstand lamp switch (10), Partner (4)"
    },
    {
      "prompt": "How many total strings does a standard string bikini have?",
      "hint": "4 strings (42), 6 strings (28), 2 strings (18), 3 strings (12)"
    },
    {
      "prompt": "Name an occupation where you routinely make people groan and say \"Ouch!\".",
      "hint": "Dentist (48), Nurse / Phlebotomist (25), Tattoo artist (14), Waxing esthetician (9), Physical therapist / Chiropractor (4)"
    },
    {
      "prompt": "Name a venue or travel option where people willingly pay extra for a better seat.",
      "hint": "Airplane / First class (45), Concert / Front row (28), Sports stadium / VIP box (16), Movie theater (8), Broadway show (3)"
    },
    {
      "prompt": "Name any major brand of toothpaste.",
      "hint": "Colgate (52), Crest (36), Sensodyne (8), Aquafresh (3), Arm & Hammer (1)"
    },
    {
      "prompt": "To the exact degree Fahrenheit, what do you set the hotel thermostat to?",
      "hint": "68 degrees (38), 70 degrees (26), 72 degrees (18), 65 degrees (12), 69 degrees (6)"
    },
    {
      "prompt": "In what calendar month does the most baby-making happen?",
      "hint": "February (38), December (26), November (18), January (12), July (6)"
    },
    {
      "prompt": "Name something people absolutely despise having pulled.",
      "hint": "A rotten tooth (46), Hair / Eyebrows (24), A hamstring / Muscle (18), Their leg (8), A fire alarm (4)"
    },
    {
      "prompt": "Name something you always buy inside a gas station convenience store on a road trip.",
      "hint": "Salty chips / Beef jerky / Snacks (42), Gasoline (24), Energy drink / Hot coffee (18), Cold soda / Water (11), Pack of gum (5)"
    },
    {
      "prompt": "According to women, what color is your favorite sexy go-to dress?",
      "hint": "Classic Black (56), Fiery Red (32), Royal Blue (6), White (4), Hot Pink (2)"
    },
    {
      "prompt": "According to men, admit it—who in your life are you secretly a little bit afraid of?",
      "hint": "My Wife / Spouse (38), My Mom (28), My Mother-in-law (18), My Boss (12), The IRS (4)"
    },
    {
      "prompt": "At what age did you realize you were as tall as you were ever going to get?",
      "hint": "18 years old (32), 16 years old (28), 15 years old (18), 20 years old (12), 14 years old (10)"
    },
    {
      "prompt": "Name a sport where an athlete is very likely to take a blow to the head.",
      "hint": "Football (42), Boxing / MMA (30), Soccer (14), Baseball (9), Hockey (5)"
    },
    {
      "prompt": "What is the single most heavily used color in an entire box of crayons?",
      "hint": "Bold Red (48), Sky Blue (26), Deep Black (14), Sunny Yellow (8), Emerald Green (4)"
    },
    {
      "prompt": "Complete the phrase: \"Leap ________\".",
      "hint": "Leap Frog (50), Leap Year (45), Leap of Faith (5)"
    },
    {
      "prompt": "How many consecutive months of gym workouts does it take to see real muscle in the mirror?",
      "hint": "3 months (45), 1 month (24), 2 months (18), 6 months (10), 12 months (3)"
    },
    {
      "prompt": "Name the single best thing to come home to after an exhausting day at work.",
      "hint": "My Dog / Excited Pet (38), My Spouse / Partner / Kids (30), The Soft Couch / Warm Bed (20), A Hot Cooked Dinner (8), Total Peace & Silence (4)"
    },
    {
      "prompt": "What does a talented street musician place on the pavement to collect tips?",
      "hint": "Open guitar / violin case (48), Upturned fedora / baseball cap (26), Glass jar / paper cup (14), Bucket (8), Cardboard sign (4)"
    },
    {
      "prompt": "Name a face card in a standard deck of playing cards.",
      "hint": "King (46), Queen (32), Jack (18), Ace (4)"
    },
    {
      "prompt": "If you accidentally drop a piece of candy, where is the nastiest place it could land?",
      "hint": "Public bathroom floor / Toilet (44), Subway / Street sidewalk (28), Deep carpet full of pet hair (16), Kitchen trash can (8), Under the couch (4)"
    },
    {
      "prompt": "Name a public place where you'd be furious if someone talked loudly through the whole event.",
      "hint": "Movie theater (48), Live concert / Opera (24), Sunday church service (15), Broadway stage play (9), Library (4)"
    },
    {
      "prompt": "Who is the one relative at Thanksgiving dinner you desperately hope you don't sit next to?",
      "hint": "Mother-in-law (36), The Loud Opinionated Uncle (26), An Ex / Former flame (18), Nosy Aunt (12), Father-in-law (8)"
    },
    {
      "prompt": "Which high school graduation class reunion usually draws the biggest crowd?",
      "hint": "10-year reunion (46), 20-year reunion (31), 50-year reunion (13), 25-year reunion (7), 5-year reunion (3)"
    },
    {
      "prompt": "Name a mode of winter transportation that has metal runners instead of wheels.",
      "hint": "Snow Sled / Toboggan (44), Ice skates (26), Santa's Sleigh (18), Snowmobile (8), Dog sled (4)"
    },
    {
      "prompt": "What is the very first hot beverage people pour themselves in the morning?",
      "hint": "Fresh brewed Coffee (58), Hot Tea (32), Hot Chocolate (6), Warm water with lemon (4)"
    },
    {
      "prompt": "According to married couples, what is the very last phrase you say before falling asleep?",
      "hint": "\"I love you\" (48), \"Goodnight\" (32), \"Turn off the light\" (12), \"Don't snore tonight!\" (8)"
    },
    {
      "prompt": "How many total hours does it take to prepare and cook a full Thanksgiving feast?",
      "hint": "4 hours (35), 5 hours (26), 6 hours (20), 3 hours (11), 8+ hours (8)"
    },
    {
      "prompt": "Name something Santa Claus would panic to discover was missing on Christmas Eve night.",
      "hint": "Rudolph / The Flying Reindeer (42), His giant Bag of Toys (30), The Flying Sleigh (16), The Naughty & Nice List (8), His Red Velvet Hat (4)"
    },
    {
      "prompt": "Name a profession where people literally save human lives every single day.",
      "hint": "Doctor / Trauma Surgeon (50), Firefighter (26), Paramedic / EMT (14), Police Officer (7), Beach Lifeguard (3)"
    },
    {
      "prompt": "Give me a common English word that rhymes with \"turkey\".",
      "hint": "Perky (45), Jerky (35), Murky (14), Quirky (6)"
    },
    {
      "prompt": "How many weeks does it take an average man to grow an impressive mustache?",
      "hint": "4 weeks (38), 2 weeks (26), 3 weeks (18), 6 weeks (12), 1 week (6)"
    },
    {
      "prompt": "What is the absolute first physical object you reach for when your alarm rings?",
      "hint": "Smartphone (55), Eyeglasses (22), Snooze button (14), Cup of water (6), The bedsheet (3)"
    },
    {
      "prompt": "Name something that millions of people are allergic to.",
      "hint": "Peanuts / Tree nuts (38), Spring pollen / Ragweed (28), Cat & dog fur (16), Dust mites & mold (12), Penicillin (6)"
    },
    {
      "prompt": "On which night of the entire week do people stay up latest past their bedtime?",
      "hint": "Saturday night (68), Friday night (28), Sunday night (3), New Year's Eve (1)"
    },
    {
      "prompt": "Name a prestigious entertainment trophy that every performer dreams of holding.",
      "hint": "The Oscar / Academy Award (54), Grammy Award (24), Emmy Award (14), Tony Award (5), Golden Globe (3)"
    }
  ]
}

  }
,
  {
    id: "2025-family-friendly.json",
    label: "🌟 Family Feud 2025 (Family-Friendly • 60 Rounds)",
    file: "./decks/2025-family-friendly.json",
    data: {
  "gameTitle": "Family Feud 2025",
  "gameIcon": "🌟",
  "deckName": "Family Feud 2025 (Family-Friendly Edition • 60 Rounds)",
  "teamPresets": [
    ["Team Parents", "Team Kids"],
    ["The Champs", "The Challengers"],
    ["Team Gold", "Team Blue"],
    ["Cousins", "Siblings"],
    ["Grandparents", "Grandkids"]
  ],
  "rounds": [
    {
      "theme": "📺 Pop Culture, Famous Faces & Entertainment",
      "title": "Round 1",
      "multiplier": 1,
      "prompt": "Name a female American celebrity who is treated like absolute royalty.",
      "answers": [
        { "text": "Taylor Swift", "points": 21 },
        { "text": "Oprah Winfrey", "points": 18 },
        { "text": "Beyoncé", "points": 13 },
        { "text": "Dolly Parton", "points": 12 },
        { "text": "Martha Stewart", "points": 8 },
        { "text": "Jennifer Lopez", "points": 6 }
      ]
    },
    {
      "theme": "📺 Pop Culture, Famous Faces & Entertainment",
      "title": "Round 2",
      "multiplier": 1,
      "prompt": "Name someone who is widely considered the funniest person alive right now.",
      "answers": [
        { "text": "Steve Harvey", "points": 24 },
        { "text": "Kevin Hart", "points": 21 },
        { "text": "Dave Chappelle", "points": 16 },
        { "text": "Jerry Seinfeld", "points": 14 },
        { "text": "Chris Rock", "points": 10 },
        { "text": "Adam Sandler", "points": 8 },
        { "text": "Jim Carrey", "points": 5 }
      ]
    },
    {
      "theme": "📺 Pop Culture, Famous Faces & Entertainment",
      "title": "Round 3",
      "multiplier": 2,
      "prompt": "Name the greatest all-female singing group of all time.",
      "answers": [
        { "text": "The Supremes", "points": 36 },
        { "text": "TLC", "points": 27 },
        { "text": "Destiny's Child", "points": 18 },
        { "text": "The Spice Girls", "points": 10 },
        { "text": "En Vogue", "points": 5 },
        { "text": "The Pointer Sisters", "points": 4 }
      ]
    },
    {
      "theme": "📺 Pop Culture, Famous Faces & Entertainment",
      "title": "Round 4",
      "multiplier": 2,
      "prompt": "Name a job or role in an A-list superstar's personal entourage.",
      "answers": [
        { "text": "Bodyguard / Security", "points": 44 },
        { "text": "Stylist / Hair & Makeup Glam", "points": 22 },
        { "text": "Personal Assistant", "points": 16 },
        { "text": "Manager / Publicist", "points": 9 },
        { "text": "Personal Chef", "points": 5 },
        { "text": "Private Driver / Chauffeur", "points": 4 }
      ]
    },
    {
      "theme": "📺 Pop Culture, Famous Faces & Entertainment",
      "title": "Round 5",
      "multiplier": 3,
      "prompt": "Name an actor who would be fantastic at playing Santa Claus in a holiday movie.",
      "answers": [
        { "text": "Tim Allen", "points": 38 },
        { "text": "Tom Hanks", "points": 24 },
        { "text": "Jack Black", "points": 16 },
        { "text": "Will Ferrell", "points": 10 },
        { "text": "Danny DeVito", "points": 7 },
        { "text": "Steve Harvey", "points": 5 }
      ]
    },
    {
      "theme": "📺 Pop Culture, Famous Faces & Entertainment",
      "title": "Round 6",
      "multiplier": 1,
      "prompt": "Name someone Winnie the Pooh probably has on speed dial in the Hundred Acre Wood.",
      "answers": [
        { "text": "Piglet", "points": 42 },
        { "text": "Christopher Robin", "points": 26 },
        { "text": "Tigger", "points": 16 },
        { "text": "Eeyore", "points": 8 },
        { "text": "The Beekeeper / Honey maker", "points": 5 },
        { "text": "Rabbit", "points": 3 }
      ]
    },
    {
      "theme": "📺 Pop Culture, Famous Faces & Entertainment",
      "title": "Round 7",
      "multiplier": 2,
      "prompt": "Besides a bird, name a real-life creature that can fly through the air.",
      "answers": [
        { "text": "Flying insects (Fly / Bee / Butterfly)", "points": 46 },
        { "text": "Bat", "points": 32 },
        { "text": "Flying squirrel", "points": 12 },
        { "text": "Flying fish", "points": 6 },
        { "text": "Pterodactyl", "points": 4 }
      ]
    },
    {
      "theme": "📺 Pop Culture, Famous Faces & Entertainment",
      "title": "Round 8",
      "multiplier": 3,
      "prompt": "Complete the famous fairy tale or movie title: \"Beauty ________\".",
      "answers": [
        { "text": "Beauty and the Beast", "points": 52 },
        { "text": "Sleeping Beauty", "points": 26 },
        { "text": "Beauty Queen / Pageant", "points": 12 },
        { "text": "Beauty Salon / Parlor", "points": 6 },
        { "text": "Black Beauty", "points": 4 }
      ]
    },
    {
      "theme": "📺 Pop Culture, Famous Faces & Entertainment",
      "title": "Round 9",
      "multiplier": 1,
      "prompt": "Name a superhero that kids always pretend to be on the playground.",
      "answers": [
        { "text": "Spider-Man", "points": 38 },
        { "text": "Batman", "points": 28 },
        { "text": "Superman", "points": 16 },
        { "text": "Iron Man", "points": 10 },
        { "text": "Captain America", "points": 5 },
        { "text": "Wonder Woman", "points": 3 }
      ]
    },
    {
      "theme": "📺 Pop Culture, Famous Faces & Entertainment",
      "title": "Round 10",
      "multiplier": 2,
      "prompt": "Name a superhero whose power would make doing house chores effortless.",
      "answers": [
        { "text": "The Flash / Super Speed", "points": 45 },
        { "text": "Superman / Super Strength", "points": 24 },
        { "text": "Telekinesis / Mind Power", "points": 15 },
        { "text": "Stretchy Arms / Mr. Fantastic", "points": 10 },
        { "text": "Invisibility", "points": 6 }
      ]
    },
    {
      "theme": "📺 Pop Culture, Famous Faces & Entertainment",
      "title": "Round 11",
      "multiplier": 2,
      "prompt": "Name a famous cartoon character who rarely ever wears pants.",
      "answers": [
        { "text": "Donald Duck", "points": 42 },
        { "text": "Porky Pig", "points": 26 },
        { "text": "Winnie the Pooh", "points": 16 },
        { "text": "SpongeBob SquarePants", "points": 8 },
        { "text": "Mickey Mouse", "points": 5 },
        { "text": "Yogi Bear", "points": 3 }
      ]
    },
    {
      "theme": "📺 Pop Culture, Famous Faces & Entertainment",
      "title": "Round 12",
      "multiplier": 3,
      "prompt": "Name an entertainment trophy that every performer dreams of winning one day.",
      "answers": [
        { "text": "The Oscar / Academy Award", "points": 54 },
        { "text": "Grammy Award", "points": 24 },
        { "text": "Emmy Award", "points": 14 },
        { "text": "Tony Award", "points": 5 },
        { "text": "Golden Globe", "points": 3 }
      ]
    },
    {
      "theme": "🏠 Home, Daily Habits & Everyday Life",
      "title": "Round 13",
      "multiplier": 1,
      "prompt": "Name something people do as soon as they get home from a long day at work or school.",
      "answers": [
        { "text": "Take off shoes / Change into comfy clothes", "points": 42 },
        { "text": "Wash hands with soap", "points": 22 },
        { "text": "Grab a snack and a cold drink", "points": 16 },
        { "text": "Slump down on the living room sofa", "points": 12 },
        { "text": "Pet the excited dog or cat", "points": 8 }
      ]
    },
    {
      "theme": "🏠 Home, Daily Habits & Everyday Life",
      "title": "Round 14",
      "multiplier": 1,
      "prompt": "Name something you clean only when you know guests are coming over.",
      "answers": [
        { "text": "The guest bathroom / Toilet", "points": 38 },
        { "text": "Living room sofa / Fluff cushions", "points": 24 },
        { "text": "Baseboards / Dust the blinds", "points": 16 },
        { "text": "Inside of the refrigerator", "points": 12 },
        { "text": "Guest bedroom sheets", "points": 10 }
      ]
    },
    {
      "theme": "🏠 Home, Daily Habits & Everyday Life",
      "title": "Round 15",
      "multiplier": 2,
      "prompt": "Name something you might find buried deep underneath the couch cushions.",
      "answers": [
        { "text": "Loose change and coins", "points": 45 },
        { "text": "Food crumbs and popcorn", "points": 24 },
        { "text": "The TV remote control", "points": 15 },
        { "text": "Lost socks", "points": 8 },
        { "text": "Children's toys / Lego bricks", "points": 5 },
        { "text": "Hairpins and ink pens", "points": 3 }
      ]
    },
    {
      "theme": "🏠 Home, Daily Habits & Everyday Life",
      "title": "Round 16",
      "multiplier": 2,
      "prompt": "Name something parents hide from their children around the house.",
      "answers": [
        { "text": "Holiday & birthday presents", "points": 42 },
        { "text": "Candy and secret snacks", "points": 28 },
        { "text": "Emergency cash stash", "points": 14 },
        { "text": "Video game controllers / iPad", "points": 10 },
        { "text": "Car keys", "points": 6 }
      ]
    },
    {
      "theme": "🏠 Home, Daily Habits & Everyday Life",
      "title": "Round 17",
      "multiplier": 3,
      "prompt": "Name an item that always gets lost in a messy kitchen junk drawer.",
      "answers": [
        { "text": "Extra batteries", "points": 34 },
        { "text": "Roll of clear tape", "points": 24 },
        { "text": "Kitchen scissors", "points": 18 },
        { "text": "Rubber bands", "points": 12 },
        { "text": "Pens and Sharpie markers", "points": 8 },
        { "text": "Random mystery keys", "points": 4 }
      ]
    },
    {
      "theme": "🏠 Home, Daily Habits & Everyday Life",
      "title": "Round 18",
      "multiplier": 1,
      "prompt": "Name something you might forget to put on in the morning and feel weird all day long.",
      "answers": [
        { "text": "Deodorant", "points": 48 },
        { "text": "Wristwatch / Smartwatch", "points": 22 },
        { "text": "Matching socks", "points": 14 },
        { "text": "Pants belt", "points": 8 },
        { "text": "Eyeglasses / Contact lenses", "points": 5 },
        { "text": "Jewelry / Earrings", "points": 3 }
      ]
    },
    {
      "theme": "🏠 Home, Daily Habits & Everyday Life",
      "title": "Round 19",
      "multiplier": 2,
      "prompt": "Name an item that looks completely ruined and terrible after it gets soaking wet.",
      "answers": [
        { "text": "Cardboard box / Paper documents", "points": 42 },
        { "text": "A fluffy dog or cat", "points": 28 },
        { "text": "Suede shoes or jacket", "points": 15 },
        { "text": "Slice of bread / Toast", "points": 9 },
        { "text": "Silk clothing", "points": 6 }
      ]
    },
    {
      "theme": "🏠 Home, Daily Habits & Everyday Life",
      "title": "Round 20",
      "multiplier": 3,
      "prompt": "Name something people stick their noses into when they really should mind their own business.",
      "answers": [
        { "text": "Other people's drama / Gossip", "points": 72 },
        { "text": "Someone else's smartphone screen", "points": 14 },
        { "text": "A neighbor's private business", "points": 8 },
        { "text": "The refrigerator at midnight", "points": 4 },
        { "text": "A scented candle / Flower", "points": 2 }
      ]
    },
    {
      "theme": "🏠 Home, Daily Habits & Everyday Life",
      "title": "Round 21",
      "multiplier": 1,
      "prompt": "Complete the panic phrase: \"Oh no—my ________ is leaking all over the floor!\"",
      "answers": [
        { "text": "Refrigerator / Freezer", "points": 38 },
        { "text": "Washing machine / Dishwasher", "points": 26 },
        { "text": "Bathroom toilet / Pipe", "points": 18 },
        { "text": "Kitchen sink faucet", "points": 10 },
        { "text": "Coffee maker", "points": 5 },
        { "text": "Pet's water bowl", "points": 3 }
      ]
    },
    {
      "theme": "🏠 Home, Daily Habits & Everyday Life",
      "title": "Round 22",
      "multiplier": 2,
      "prompt": "Name something people do in the bathroom mirror when they think nobody is watching.",
      "answers": [
        { "text": "Flex muscles / Strike heroic poses", "points": 42 },
        { "text": "Pop a pimple / Check teeth", "points": 26 },
        { "text": "Make silly and goofy faces", "points": 16 },
        { "text": "Practice their best smile", "points": 9 },
        { "text": "Sing into a hairbrush microphone", "points": 7 }
      ]
    },
    {
      "theme": "🏠 Home, Daily Habits & Everyday Life",
      "title": "Round 23",
      "multiplier": 2,
      "prompt": "Fill in the family flex: \"Out of all my family members, I am officially the...\"",
      "answers": [
        { "text": "Smartest", "points": 28 },
        { "text": "Funniest", "points": 24 },
        { "text": "Best looking", "points": 16 },
        { "text": "Hardest working", "points": 14 },
        { "text": "Most organized / Sane one", "points": 10 },
        { "text": "Tallest", "points": 8 }
      ]
    },
    {
      "theme": "🏠 Home, Daily Habits & Everyday Life",
      "title": "Round 24",
      "multiplier": 3,
      "prompt": "Name something identical twins are usually expected to share on their birthday.",
      "answers": [
        { "text": "The birthday cake & candles", "points": 58 },
        { "text": "The party venue & friends", "points": 22 },
        { "text": "Toys and presents", "points": 12 },
        { "text": "Birthday card from relatives", "points": 5 },
        { "text": "The spotlight and birthday song", "points": 3 }
      ]
    },
    {
      "theme": "🏫 School, Work & Modern Tech",
      "title": "Round 25",
      "multiplier": 1,
      "prompt": "Name something people do to avoid having to talk to a chatty driver or stranger.",
      "answers": [
        { "text": "Put in headphones / Earbuds", "points": 44 },
        { "text": "Stare at smartphone / Fake a call", "points": 36 },
        { "text": "Close eyes and pretend to sleep", "points": 14 },
        { "text": "Look out the window silently", "points": 4 },
        { "text": "Say \"I have a huge headache\"", "points": 2 }
      ]
    },
    {
      "theme": "🏫 School, Work & Modern Tech",
      "title": "Round 26",
      "multiplier": 1,
      "prompt": "Name an old-school reference source nobody opens anymore because of Google.",
      "answers": [
        { "text": "Hardcover Encyclopedia set", "points": 44 },
        { "text": "Giant Dictionary", "points": 30 },
        { "text": "Yellow Pages / Phonebook", "points": 18 },
        { "text": "Road Atlas / Paper Map", "points": 5 },
        { "text": "Thesaurus", "points": 3 }
      ]
    },
    {
      "theme": "🏫 School, Work & Modern Tech",
      "title": "Round 27",
      "multiplier": 2,
      "prompt": "Name an app on a teenager's phone that their grandparents have no idea how to use.",
      "answers": [
        { "text": "TikTok", "points": 46 },
        { "text": "Snapchat", "points": 28 },
        { "text": "Discord", "points": 14 },
        { "text": "BeReal / Twitch", "points": 8 },
        { "text": "Reddit", "points": 4 }
      ]
    },
    {
      "theme": "🏫 School, Work & Modern Tech",
      "title": "Round 28",
      "multiplier": 2,
      "prompt": "If you could see all the microscopic bacteria on it, name something you'd never touch again.",
      "answers": [
        { "text": "Public door handle / Push bar", "points": 34 },
        { "text": "Smartphone touchscreen", "points": 28 },
        { "text": "Paper dollar bills & coins", "points": 18 },
        { "text": "Toilet flush lever / Handle", "points": 11 },
        { "text": "Hotel TV remote control", "points": 6 },
        { "text": "Kitchen dish sponge", "points": 3 }
      ]
    },
    {
      "theme": "🏫 School, Work & Modern Tech",
      "title": "Round 29",
      "multiplier": 3,
      "prompt": "Name an excuse people use when they show up 20 minutes late to work or school.",
      "answers": [
        { "text": "Stuck in terrible traffic", "points": 48 },
        { "text": "Alarm didn't go off / Overslept", "points": 28 },
        { "text": "Couldn't find car keys or backpack", "points": 12 },
        { "text": "Car wouldn't start / Flat tire", "points": 8 },
        { "text": "Spilled breakfast on clothes", "points": 4 }
      ]
    },
    {
      "theme": "🏫 School, Work & Modern Tech",
      "title": "Round 30",
      "multiplier": 1,
      "prompt": "Name something people borrow from coworkers or classmates and constantly forget to return.",
      "answers": [
        { "text": "Ink pens and pencils", "points": 58 },
        { "text": "Desktop stapler", "points": 22 },
        { "text": "Charging cable / Phone charger", "points": 11 },
        { "text": "Tape dispenser", "points": 5 },
        { "text": "A dollar / Lunch change", "points": 4 }
      ]
    },
    {
      "theme": "🏫 School, Work & Modern Tech",
      "title": "Round 31",
      "multiplier": 2,
      "prompt": "Name a reason you give someone an awkward \"side-hug\" instead of a normal hug.",
      "answers": [
        { "text": "Barely know the person / Acquaintance", "points": 44 },
        { "text": "Person has terrible body odor", "points": 26 },
        { "text": "Awkward professional boundary", "points": 18 },
        { "text": "In a huge rush out the door", "points": 8 },
        { "text": "Person is sweaty from workout", "points": 4 }
      ]
    },
    {
      "theme": "🏫 School, Work & Modern Tech",
      "title": "Round 32",
      "multiplier": 3,
      "prompt": "Besides a cell phone, what one item would you want if you were stuck in an elevator for 3 hours?",
      "answers": [
        { "text": "Bottle of water and snacks", "points": 54 },
        { "text": "A comfortable chair or pillow", "points": 18 },
        { "text": "A deck of cards or book", "points": 14 },
        { "text": "A good friend for company", "points": 8 },
        { "text": "A battery-powered mini fan", "points": 6 }
      ]
    },
    {
      "theme": "🏫 School, Work & Modern Tech",
      "title": "Round 33",
      "multiplier": 1,
      "prompt": "Name an activity that is awesome for a 6-year-old's birthday, but terrible for grown-ups.",
      "answers": [
        { "text": "Bouncing in an inflatable bounce house", "points": 36 },
        { "text": "Full face painting", "points": 26 },
        { "text": "Whacking a candy piñata blindfolded", "points": 18 },
        { "text": "Playing musical chairs", "points": 12 },
        { "text": "Pin the tail on the donkey", "points": 8 }
      ]
    },
    {
      "theme": "🏫 School, Work & Modern Tech",
      "title": "Round 34",
      "multiplier": 2,
      "prompt": "Complete the classic phrase: \"Would you please go get a ________!\"",
      "answers": [
        { "text": "Life!", "points": 70 },
        { "text": "Job!", "points": 18 },
        { "text": "Grip!", "points": 6 },
        { "text": "Clue!", "points": 4 },
        { "text": "Glass of water!", "points": 2 }
      ]
    },
    {
      "theme": "🏫 School, Work & Modern Tech",
      "title": "Round 35",
      "multiplier": 2,
      "prompt": "Name a place where one single minute feels like an entire hour.",
      "answers": [
        { "text": "The DMV waiting room", "points": 42 },
        { "text": "Doctor or Dentist waiting room", "points": 26 },
        { "text": "Airport security TSA checkpoint", "points": 18 },
        { "text": "Holding a plank at gym class", "points": 10 },
        { "text": "Waiting for microwave to finish", "points": 4 }
      ]
    },
    {
      "theme": "🏫 School, Work & Modern Tech",
      "title": "Round 36",
      "multiplier": 3,
      "prompt": "Name something a student dreads hearing their teacher say right before the bell rings.",
      "answers": [
        { "text": "\"Pop quiz tomorrow!\"", "points": 48 },
        { "text": "\"Here is tonight's heavy homework\"", "points": 28 },
        { "text": "\"I need to speak to you after class\"", "points": 14 },
        { "text": "\"Big group project assigned!\"", "points": 7 },
        { "text": "\"Phones on my desk right now\"", "points": 3 }
      ]
    },
    {
      "theme": "🍔 Food, Fun, Quirks & Favorites",
      "title": "Round 37",
      "multiplier": 1,
      "prompt": "Name a food that people love to drown in ranch dressing.",
      "answers": [
        { "text": "Buffalo chicken wings / Tenders", "points": 38 },
        { "text": "Crisp Pizza slice", "points": 28 },
        { "text": "French fries", "points": 16 },
        { "text": "Carrots, celery, and veggies", "points": 12 },
        { "text": "Potato chips / Pretzels", "points": 6 }
      ]
    },
    {
      "theme": "🍔 Food, Fun, Quirks & Favorites",
      "title": "Round 38",
      "multiplier": 1,
      "prompt": "Name a topping almost everyone likes to put on a juicy hamburger.",
      "answers": [
        { "text": "Cheddar / American Cheese", "points": 44 },
        { "text": "Crisp Lettuce", "points": 22 },
        { "text": "Fresh sliced Tomato", "points": 15 },
        { "text": "Ketchup & Mustard", "points": 10 },
        { "text": "Pickles", "points": 6 },
        { "text": "Crispy Bacon", "points": 3 }
      ]
    },
    {
      "theme": "🍔 Food, Fun, Quirks & Favorites",
      "title": "Round 39",
      "multiplier": 2,
      "prompt": "Name something that might completely ruin a family outdoor picnic in the park.",
      "answers": [
        { "text": "Sudden downpour / Thunderstorm", "points": 52 },
        { "text": "Ants, bees, and mosquitoes", "points": 28 },
        { "text": "High gusty winds blowing napkins", "points": 10 },
        { "text": "Forgetting the picnic basket / Cooler", "points": 6 },
        { "text": "Stray dogs trying to steal burgers", "points": 4 }
      ]
    },
    {
      "theme": "🍔 Food, Fun, Quirks & Favorites",
      "title": "Round 40",
      "multiplier": 2,
      "prompt": "Name a food that makes an undeniably loud crunching sound when you bite into it.",
      "answers": [
        { "text": "Potato chips / Tortilla chips", "points": 46 },
        { "text": "Fresh raw celery / Carrots", "points": 24 },
        { "text": "Crisp Honeycrisp apple", "points": 16 },
        { "text": "Buttery movie Popcorn", "points": 8 },
        { "text": "Hard taco shell", "points": 6 }
      ]
    },
    {
      "theme": "🍔 Food, Fun, Quirks & Favorites",
      "title": "Round 41",
      "multiplier": 3,
      "prompt": "Name something well-known that swings back and forth.",
      "answers": [
        { "text": "Playground swing / Tire swing", "points": 48 },
        { "text": "Grandfather clock pendulum", "points": 24 },
        { "text": "Monkey swinging in jungle trees", "points": 14 },
        { "text": "Baseball bat or golf club", "points": 8 },
        { "text": "Double-hinged saloon doors", "points": 6 }
      ]
    },
    {
      "theme": "🍔 Food, Fun, Quirks & Favorites",
      "title": "Round 42",
      "multiplier": 1,
      "prompt": "Complete the popular phrase: \"Knock ________!\".",
      "answers": [
        { "text": "Knock knock (joke)", "points": 45 },
        { "text": "Knockout / Knock out", "points": 28 },
        { "text": "Knock on wood", "points": 18 },
        { "text": "Knock it off!", "points": 6 },
        { "text": "Knockdown", "points": 3 }
      ]
    },
    {
      "theme": "🍔 Food, Fun, Quirks & Favorites",
      "title": "Round 43",
      "multiplier": 2,
      "prompt": "Name a sovereign nation whose name begins with the letter \"S\".",
      "answers": [
        { "text": "Spain", "points": 42 },
        { "text": "Sweden", "points": 25 },
        { "text": "Switzerland", "points": 18 },
        { "text": "South Africa", "points": 8 },
        { "text": "Scotland", "points": 5 },
        { "text": "Singapore", "points": 2 }
      ]
    },
    {
      "theme": "🍔 Food, Fun, Quirks & Favorites",
      "title": "Round 44",
      "multiplier": 3,
      "prompt": "Name a U.S. President whose portrait appears on American paper currency.",
      "answers": [
        { "text": "George Washington ($1)", "points": 42 },
        { "text": "Abraham Lincoln ($5)", "points": 28 },
        { "text": "Alexander Hamilton ($10) / Ben Franklin ($100)", "points": 15 },
        { "text": "Thomas Jefferson ($2)", "points": 9 },
        { "text": "Andrew Jackson ($20)", "points": 6 }
      ]
    },
    {
      "theme": "🍔 Food, Fun, Quirks & Favorites",
      "title": "Round 45",
      "multiplier": 1,
      "prompt": "Name something very slippery that is almost impossible to hold onto with wet hands.",
      "answers": [
        { "text": "A wet bar of bath soap", "points": 48 },
        { "text": "A fresh live fish / Eel", "points": 25 },
        { "text": "A melting ice cube", "points": 14 },
        { "text": "A soapy baby in the tub", "points": 8 },
        { "text": "A slippery water balloon", "points": 5 }
      ]
    },
    {
      "theme": "🍔 Food, Fun, Quirks & Favorites",
      "title": "Round 46",
      "multiplier": 2,
      "prompt": "Name a sport where players are allowed to kick the ball with their feet.",
      "answers": [
        { "text": "Soccer", "points": 55 },
        { "text": "American Football", "points": 28 },
        { "text": "Rugby", "points": 10 },
        { "text": "Kickball", "points": 5 },
        { "text": "Australian Rules", "points": 2 }
      ]
    },
    {
      "theme": "🍔 Food, Fun, Quirks & Favorites",
      "title": "Round 47",
      "multiplier": 2,
      "prompt": "Name an animal that people are surprisingly terrified of, even though it is tiny.",
      "answers": [
        { "text": "Spider", "points": 46 },
        { "text": "Mouse / Rat", "points": 26 },
        { "text": "Cockroach / Bug", "points": 14 },
        { "text": "Wasp / Hornet / Bee", "points": 10 },
        { "text": "Tiny garden snake", "points": 4 }
      ]
    },
    {
      "theme": "🍔 Food, Fun, Quirks & Favorites",
      "title": "Round 48",
      "multiplier": 3,
      "prompt": "Name something you frequently lose track of during a busy day.",
      "answers": [
        { "text": "Time / What time it is", "points": 42 },
        { "text": "House or car keys", "points": 26 },
        { "text": "Smartphone", "points": 18 },
        { "text": "Reading glasses", "points": 8 },
        { "text": "TV remote control", "points": 6 }
      ]
    },
    {
      "theme": "🎄 Holidays, Travel & Wild Laughs",
      "title": "Round 49",
      "multiplier": 1,
      "prompt": "On Christmas morning you find Santa Claus firmly wedged in your chimney—what is your first move?",
      "answers": [
        { "text": "Dial 911 / Call the fire department", "points": 40 },
        { "text": "Grab his boots and pull as hard as possible", "points": 24 },
        { "text": "Burst out laughing", "points": 16 },
        { "text": "Take a fun selfie with him", "points": 12 },
        { "text": "Hand him warm cookies and milk", "points": 8 }
      ]
    },
    {
      "theme": "🎄 Holidays, Travel & Wild Laughs",
      "title": "Round 50",
      "multiplier": 1,
      "prompt": "Name something Santa Claus would wear if he delivered presents to kids in sunny Hawaii.",
      "answers": [
        { "text": "Bermuda shorts / Board shorts", "points": 38 },
        { "text": "Colorful flower lei", "points": 28 },
        { "text": "Hawaiian floral shirt", "points": 16 },
        { "text": "Sunglasses", "points": 10 },
        { "text": "Flip-flops / Sandals", "points": 5 },
        { "text": "Red swimming trunks", "points": 3 }
      ]
    },
    {
      "theme": "🎄 Holidays, Travel & Wild Laughs",
      "title": "Round 51",
      "multiplier": 2,
      "prompt": "Name something that is on almost every teenager's holiday wish list.",
      "answers": [
        { "text": "New iPhone / Smartphone", "points": 44 },
        { "text": "Cold hard cash", "points": 26 },
        { "text": "Video game console (PS5 / Xbox / Switch)", "points": 16 },
        { "text": "Laptop or iPad", "points": 8 },
        { "text": "New designer sneakers", "points": 6 }
      ]
    },
    {
      "theme": "🎄 Holidays, Travel & Wild Laughs",
      "title": "Round 52",
      "multiplier": 2,
      "prompt": "Name an Olympic disaster that a torch runner prays does not happen on live international TV.",
      "answers": [
        { "text": "Tripping and falling flat on the ground", "points": 54 },
        { "text": "The torch flame blowing out", "points": 24 },
        { "text": "Setting their own sleeve or hair on fire", "points": 12 },
        { "text": "Sudden heavy rain storm", "points": 6 },
        { "text": "Running in the wrong direction", "points": 4 }
      ]
    },
    {
      "theme": "🎄 Holidays, Travel & Wild Laughs",
      "title": "Round 53",
      "multiplier": 3,
      "prompt": "Name something you should always keep inside your car trunk for roadside emergencies.",
      "answers": [
        { "text": "Jumper cables", "points": 42 },
        { "text": "Spare tire and tire jack", "points": 28 },
        { "text": "First aid kit", "points": 14 },
        { "text": "Heavy-duty flashlight", "points": 10 },
        { "text": "Warm blanket", "points": 6 }
      ]
    },
    {
      "theme": "🎄 Holidays, Travel & Wild Laughs",
      "title": "Round 54",
      "multiplier": 1,
      "prompt": "Name a place where you would never in a million years want to hear someone say, \"Oops!\".",
      "answers": [
        { "text": "Hospital operating room / Surgery", "points": 48 },
        { "text": "Airplane cockpit", "points": 28 },
        { "text": "Hair salon / Barber shop", "points": 14 },
        { "text": "Nuclear power plant", "points": 6 },
        { "text": "Dentist's chair", "points": 4 }
      ]
    },
    {
      "theme": "🎄 Holidays, Travel & Wild Laughs",
      "title": "Round 55",
      "multiplier": 2,
      "prompt": "Name a reason people change seats inside a movie theater.",
      "answers": [
        { "text": "Tall person sitting right in front", "points": 44 },
        { "text": "People talking loudly / On phones", "points": 28 },
        { "text": "Want a better centered screen view", "points": 16 },
        { "text": "Sticky or broken seat", "points": 8 },
        { "text": "Loud crunchy popcorn eater next door", "points": 4 }
      ]
    },
    {
      "theme": "🎄 Holidays, Travel & Wild Laughs",
      "title": "Round 56",
      "multiplier": 3,
      "prompt": "Name something people kick with their feet.",
      "answers": [
        { "text": "Soccer ball / Football", "points": 62 },
        { "text": "Car tires at the car lot", "points": 16 },
        { "text": "Small pebbles on the sidewalk", "points": 11 },
        { "text": "A bad habit", "points": 7 },
        { "text": "A bedroom door shut", "points": 4 }
      ]
    },
    {
      "theme": "🎄 Holidays, Travel & Wild Laughs",
      "title": "Round 57",
      "multiplier": 1,
      "prompt": "Name something people spread onto food with a butter knife.",
      "answers": [
        { "text": "Creamy butter / Margarine", "points": 46 },
        { "text": "Peanut butter & Jelly", "points": 32 },
        { "text": "Cream cheese on bagels", "points": 14 },
        { "text": "Chocolate Nutella spread", "points": 5 },
        { "text": "Mayonnaise", "points": 3 }
      ]
    },
    {
      "theme": "🎄 Holidays, Travel & Wild Laughs",
      "title": "Round 58",
      "multiplier": 2,
      "prompt": "Tell me something many people do faithfully just once every week.",
      "answers": [
        { "text": "Attend church / Religious service", "points": 38 },
        { "text": "Big grocery store shopping trip", "points": 28 },
        { "text": "Mow the lawn / Yard work", "points": 16 },
        { "text": "Deep clean the house", "points": 11 },
        { "text": "Sleep in late on Saturday", "points": 7 }
      ]
    },
    {
      "theme": "🎄 Holidays, Travel & Wild Laughs",
      "title": "Round 59",
      "multiplier": 2,
      "prompt": "Name an excuse people give when trying to talk their way out of a speeding ticket.",
      "answers": [
        { "text": "\"I have a medical emergency!\"", "points": 38 },
        { "text": "\"I didn't realize how fast I was going\"", "points": 28 },
        { "text": "\"I really have to use the restroom!\"", "points": 18 },
        { "text": "\"I didn't see the speed limit sign\"", "points": 10 },
        { "text": "\"I'm running late for work / school\"", "points": 6 }
      ]
    },
    {
      "theme": "🎄 Holidays, Travel & Wild Laughs",
      "title": "Round 60",
      "multiplier": 3,
      "prompt": "Name a classic board game or card game that has caused real family arguments.",
      "answers": [
        { "text": "Monopoly", "points": 58 },
        { "text": "UNO", "points": 22 },
        { "text": "Scrabble", "points": 10 },
        { "text": "Risk", "points": 6 },
        { "text": "Clue", "points": 4 }
      ]
    }
  ],
  "fastMoney": [
    {
      "prompt": "In school, you would get in serious trouble for bringing home what report card grade?",
      "hint": "F (54), D (28), C (14), B (4)"
    },
    {
      "prompt": "Name a popular Disney animated movie of all time.",
      "hint": "The Lion King (42), Frozen (28), Beauty and the Beast (16), Aladdin (10), Moana (4)"
    },
    {
      "prompt": "Name something you genuinely love that is NOT a human being.",
      "hint": "My Dog / Pet (48), Money / Cash (22), Pizza / Ice Cream (15), Morning Coffee (9), My Phone / Video Games (6)"
    },
    {
      "prompt": "Name something people drink or take to soothe a scratchy sore throat.",
      "hint": "Hot tea with lemon & honey (45), Throat lozenge / Cough drop (28), Warm salt water gargle (15), Chicken noodle soup (8), Cough syrup (4)"
    },
    {
      "prompt": "Name a trusty hand tool everyone keeps around the house to fix things.",
      "hint": "Hammer (46), Screwdriver (32), Adjustable wrench (14), Pliers (5), Roll of duct tape (3)"
    },
    {
      "prompt": "Name something you reach for in the pitch black in the middle of the night.",
      "hint": "Smartphone (46), Eyeglasses (24), Glass of ice water (16), Nightstand lamp switch (10), Pillow (4)"
    },
    {
      "prompt": "How many slices of pizza can the average hungry teenager eat in one sitting?",
      "hint": "3 slices (42), 4 slices (30), 2 slices (16), 5+ slices (12)"
    },
    {
      "prompt": "Name an occupation where you routinely make people groan and say \"Ouch!\".",
      "hint": "Dentist (48), Nurse giving a shot (25), Physical therapist (14), Tattoo artist (9), Doctor (4)"
    },
    {
      "prompt": "Name a venue or travel option where people willingly pay extra for a better seat.",
      "hint": "Airplane / First class (45), Concert / Front row (28), Sports stadium / VIP box (16), Movie theater (8), Broadway show (3)"
    },
    {
      "prompt": "Name any major brand of toothpaste.",
      "hint": "Colgate (52), Crest (36), Sensodyne (8), Aquafresh (3), Arm & Hammer (1)"
    },
    {
      "prompt": "To the exact degree Fahrenheit, what do you set the hotel thermostat to?",
      "hint": "68 degrees (38), 70 degrees (26), 72 degrees (18), 65 degrees (12), 69 degrees (6)"
    },
    {
      "prompt": "In what calendar month do most families take their big summer vacation?",
      "hint": "July (48), August (28), June (16), December (8)"
    },
    {
      "prompt": "Name something people absolutely despise having pulled.",
      "hint": "A loose tooth (48), Hair / Eyebrows (24), A hamstring / Muscle (18), Their leg (6), A fire alarm (4)"
    },
    {
      "prompt": "Name something you always buy inside a gas station convenience store on a road trip.",
      "hint": "Salty chips / Beef jerky / Snacks (42), Gasoline (24), Energy drink / Hot coffee (18), Cold soda / Water (11), Pack of gum (5)"
    },
    {
      "prompt": "What is the most popular color for a brand new sports car?",
      "hint": "Radiant Red (52), Sleek Black (24), Pure White (12), Electric Blue (8), Bright Yellow (4)"
    },
    {
      "prompt": "Name a person in your family whose opinion you respect the most.",
      "hint": "Mom (44), Dad (28), Grandma / Grandpa (16), Older Sibling (8), Spouse (4)"
    },
    {
      "prompt": "At what age did you realize you were as tall as you were ever going to get?",
      "hint": "18 years old (32), 16 years old (28), 15 years old (18), 20 years old (12), 14 years old (10)"
    },
    {
      "prompt": "Name a sport where an athlete is very likely to take a blow to the head.",
      "hint": "Football (44), Boxing / MMA (28), Soccer (14), Baseball (9), Hockey (5)"
    },
    {
      "prompt": "What is the single most heavily used color in an entire box of crayons?",
      "hint": "Bold Red (48), Sky Blue (26), Deep Black (14), Sunny Yellow (8), Emerald Green (4)"
    },
    {
      "prompt": "Complete the phrase: \"Leap ________\".",
      "hint": "Leap Frog (50), Leap Year (45), Leap of Faith (5)"
    },
    {
      "prompt": "How many consecutive months of gym workouts does it take to see real muscle in the mirror?",
      "hint": "3 months (45), 1 month (24), 2 months (18), 6 months (10), 12 months (3)"
    },
    {
      "prompt": "Name the single best thing to come home to after an exhausting day at school or work.",
      "hint": "My Dog / Excited Pet (42), Family / Parents (28), Soft Couch / Warm Bed (18), Hot Dinner / Pizza (8), Total Peace & Quiet (4)"
    },
    {
      "prompt": "What does a talented street musician place on the pavement to collect tips?",
      "hint": "Open guitar / violin case (48), Upturned fedora / baseball cap (26), Glass jar / paper cup (14), Bucket (8), Cardboard sign (4)"
    },
    {
      "prompt": "Name a face card in a standard deck of playing cards.",
      "hint": "King (46), Queen (32), Jack (18), Ace (4)"
    },
    {
      "prompt": "If you accidentally drop a piece of candy, where is the nastiest place it could land?",
      "hint": "Public bathroom floor / Toilet (44), Subway / Street sidewalk (28), Deep carpet full of pet hair (16), Kitchen trash can (8), Under the couch (4)"
    },
    {
      "prompt": "Name a public place where you'd be furious if someone talked loudly through the whole event.",
      "hint": "Movie theater (48), Live concert / Opera (24), Sunday church service (15), Broadway stage play (9), Public library (4)"
    },
    {
      "prompt": "Who is the one relative at Thanksgiving dinner who always starts a debate?",
      "hint": "Opinionated Uncle (38), Grandparent (24), Older Brother / Sister (18), In-laws (12), Cousin (8)"
    },
    {
      "prompt": "Which high school graduation class reunion usually draws the biggest crowd?",
      "hint": "10-year reunion (46), 20-year reunion (31), 50-year reunion (13), 25-year reunion (7), 5-year reunion (3)"
    },
    {
      "prompt": "Name a mode of winter transportation that has metal runners instead of wheels.",
      "hint": "Snow Sled / Toboggan (44), Ice skates (26), Santa's Sleigh (18), Snowmobile (8), Dog sled (4)"
    },
    {
      "prompt": "What is the very first hot beverage people pour themselves in the morning?",
      "hint": "Fresh brewed Coffee (58), Hot Tea (32), Hot Chocolate (6), Warm water with lemon (4)"
    },
    {
      "prompt": "Name something that kids always leave lying on the living room floor.",
      "hint": "Toys / Lego bricks (48), Shoes and sneakers (24), Backpacks / Books (14), Dirty socks (8), Video game controllers (6)"
    },
    {
      "prompt": "How many total hours does it take to prepare and cook a full Thanksgiving feast?",
      "hint": "4 hours (35), 5 hours (26), 6 hours (20), 3 hours (11), 8+ hours (8)"
    },
    {
      "prompt": "Name something Santa Claus would panic to discover was missing on Christmas Eve night.",
      "hint": "Rudolph / The Flying Reindeer (42), His giant Bag of Toys (30), The Flying Sleigh (16), The Naughty & Nice List (8), His Red Velvet Hat (4)"
    },
    {
      "prompt": "Name a profession where people literally save human lives every single day.",
      "hint": "Doctor / Trauma Surgeon (50), Firefighter (26), Paramedic / EMT (14), Police Officer (7), Beach Lifeguard (3)"
    },
    {
      "prompt": "Give me a common English word that rhymes with \"turkey\".",
      "hint": "Perky (45), Jerky (35), Murky (14), Quirky (6)"
    },
    {
      "prompt": "How many weeks does it take an average man to grow an impressive mustache?",
      "hint": "4 weeks (38), 2 weeks (26), 3 weeks (18), 6 weeks (12), 1 week (6)"
    },
    {
      "prompt": "What is the absolute first physical object you reach for when your alarm rings?",
      "hint": "Smartphone (55), Eyeglasses (22), Snooze button (14), Cup of water (6), The bedsheet (3)"
    },
    {
      "prompt": "Name something that millions of people are allergic to.",
      "hint": "Peanuts / Tree nuts (38), Spring pollen / Ragweed (28), Cat & dog fur (16), Dust mites & mold (12), Penicillin (6)"
    },
    {
      "prompt": "On which night of the entire week do people stay up latest past their bedtime?",
      "hint": "Saturday night (68), Friday night (28), Sunday night (3), New Year's Eve (1)"
    },
    {
      "prompt": "Name a musical instrument that almost every school band includes.",
      "hint": "Flute (35), Trumpet (28), Drums / Snare (18), Clarinet (12), Saxophone (7)"
    }
  ]
}

  }
];