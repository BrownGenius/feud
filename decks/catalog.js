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
    id: "2026-frc-rules.json",
    label: "🤖 2026 FRC Game & Rules (14 Rounds • Fast Money)",
    file: "./decks/2026-frc-rules.json",
    data: {
      "gameTitle": "Party Feud",
      "gameIcon": "🤖",
      "deckName": "2026 FRC Game & Rules (14 Rounds)",
      "teamPresets": [
        ["Red Alliance", "Blue Alliance"],
        ["Mechanical", "Programming"],
        ["Students", "Mentors"],
        ["Drive Team", "Pit Crew"],
        ["Scouting Team", "Strategy Team"]
      ],
      "rounds": [
        {
          "theme": "⚙️ Robot Inspection (R-Rules)",
          "title": "Round 1",
          "multiplier": 1,
          "prompt": "Name a reason an FRC robot fails its initial inspection at competition.",
          "answers": [
            { "text": "Over the 125 lb weight limit", "points": 36 },
            { "text": "Bumpers out of zone or corner gaps", "points": 24 },
            { "text": "Sharp edges or exposed pinch points", "points": 15 },
            { "text": "Main breaker inaccessible or unmarked", "points": 11 },
            { "text": "Pneumatic system leak or over-pressure", "points": 8 },
            { "text": "Illegal wire gauge or reversed polarity", "points": 6 }
          ]
        },
        {
          "theme": "🟥 Penalties & Cards (G-Rules)",
          "title": "Round 2",
          "multiplier": 1,
          "prompt": "Name a rule violation that will earn your alliance an immediate Yellow or Red Card.",
          "answers": [
            { "text": "Entering field before green lights / field safe", "points": 35 },
            { "text": "Damaging contact inside opponent frame perimeter", "points": 26 },
            { "text": "Pinning opponent >3 seconds after referee countdown", "points": 18 },
            { "text": "Deliberately tipping or flipping another robot", "points": 12 },
            { "text": "Egregious conduct or referee disrespect (G201)", "points": 9 }
          ]
        },
        {
          "theme": "🧰 Pit Life & Survival",
          "title": "Round 3",
          "multiplier": 1,
          "prompt": "Name an item or tool every team is frantically trying to borrow in the pits.",
          "answers": [
            { "text": "Zip ties or electrical / gaffer tape", "points": 33 },
            { "text": "Freshly charged 12V robot battery", "points": 25 },
            { "text": "7/16\" or 10mm wrench / socket", "points": 18 },
            { "text": "1/4-20 bolts, nuts, or hardware", "points": 13 },
            { "text": "Hex keys / Allen wrench set", "points": 6 },
            { "text": "Rivet gun or pop rivets", "points": 5 }
          ]
        },
        {
          "theme": "⏱️ Pre-Match Checklist",
          "title": "Round 4",
          "multiplier": 1,
          "prompt": "Name something the drive team must check or do right before the match starts.",
          "answers": [
            { "text": "Turn on main 120A robot breaker", "points": 37 },
            { "text": "Plug in driver station joysticks / controllers", "points": 24 },
            { "text": "Connect field Ethernet tether / check FMS link", "points": 17 },
            { "text": "Pre-load the game piece properly", "points": 12 },
            { "text": "Align robot on starting line / auto orientation", "points": 10 }
          ]
        },
        {
          "theme": "⚡ Field Disasters",
          "title": "Round 5",
          "multiplier": 2,
          "prompt": "Name an excuse a drive team gives when their robot suddenly stops moving on the field.",
          "answers": [
            { "text": "Radio rebooted or lost wireless FMS link", "points": 40 },
            { "text": "Battery brownout / voltage drop under load", "points": 24 },
            { "text": "CAN bus wire snapped or disconnected", "points": 16 },
            { "text": "Code crashed / RoboRIO watchdog loop error", "points": 11 },
            { "text": "Main breaker tripped or wire pulled out", "points": 9 }
          ]
        },
        {
          "theme": "🤖 Autonomous Mode",
          "title": "Round 6",
          "multiplier": 2,
          "prompt": "Name something a robot attempts to do during the 15-second Autonomous period.",
          "answers": [
            { "text": "Score a pre-loaded game piece", "points": 42 },
            { "text": "Leave starting zone / Mobility taxi points", "points": 27 },
            { "text": "Intake a center-field game piece", "points": 15 },
            { "text": "Disrupt or block opposing alliance paths", "points": 9 },
            { "text": "Sit dead / do nothing (Auto routine failed)", "points": 7 }
          ]
        },
        {
          "theme": "📐 Construction Limits (R-Rules)",
          "title": "Round 7",
          "multiplier": 2,
          "prompt": "Name a part of the robot that must strictly follow Game Manual construction rules.",
          "answers": [
            { "text": "Bumpers (Height zone, backing, pool noodles)", "points": 44 },
            { "text": "Frame Perimeter / Starting sizing envelope", "points": 25 },
            { "text": "Maximum extension outside frame perimeter", "points": 15 },
            { "text": "Robot battery mounting and tie-down strap", "points": 10 },
            { "text": "Pneumatic storage tanks & pressure relief valve", "points": 6 }
          ]
        },
        {
          "theme": "📊 Scouting in the Stands",
          "title": "Round 8",
          "multiplier": 2,
          "prompt": "Name something team scouts track while watching a match from the stands.",
          "answers": [
            { "text": "Number of game pieces scored / cycle times", "points": 44 },
            { "text": "Autonomous success and starting position", "points": 26 },
            { "text": "Endgame climb / hang level achieved", "points": 16 },
            { "text": "Fouls and penalties committed", "points": 8 },
            { "text": "Defensive capability and robot reliability", "points": 6 }
          ]
        },
        {
          "theme": "🥽 Safety First",
          "title": "Round 9",
          "multiplier": 3,
          "prompt": "Name a safety violation that will get you scolded by the Safety Advisor in the pits.",
          "answers": [
            { "text": "Not wearing safety glasses", "points": 46 },
            { "text": "Wearing open-toed shoes / sandals", "points": 25 },
            { "text": "Running or horseplay in the pit aisles", "points": 14 },
            { "text": "Using power tools without proper PPE", "points": 9 },
            { "text": "Working on an enabled or pressurized robot", "points": 6 }
          ]
        },
        {
          "theme": "🙋 Human Player Duties",
          "title": "Round 10",
          "multiplier": 3,
          "prompt": "Name something an FRC Human Player is responsible for during a match.",
          "answers": [
            { "text": "Feeding / introducing game pieces into play", "points": 45 },
            { "text": "Throwing / tossing game pieces into scoring targets", "points": 25 },
            { "text": "Triggering endgame activation or substation buttons", "points": 14 },
            { "text": "Communicating field info / timer to drive team", "points": 10 },
            { "text": "Staying behind the starting line / boundary", "points": 6 }
          ]
        },
        {
          "theme": "🛑 Match Delays & FMS",
          "title": "Round 11",
          "multiplier": 3,
          "prompt": "Name a reason an FRC match gets delayed right before starting.",
          "answers": [
            { "text": "Robot cannot connect to the field FMS", "points": 42 },
            { "text": "Alliance called a timeout coupon", "points": 24 },
            { "text": "Field element repair or broken sensor", "points": 16 },
            { "text": "Robot battery / bumper falling off on field", "points": 11 },
            { "text": "Broken game piece or debris left on carpet", "points": 7 }
          ]
        },
        {
          "theme": "🏆 Alliance Selection & Playoffs",
          "title": "Round 12",
          "multiplier": 3,
          "prompt": "Name a trait an Alliance Captain looks for when picking a playoff partner.",
          "answers": [
            { "text": "High game piece scoring rate / cycle consistency", "points": 40 },
            { "text": "Reliable and fast endgame climb / hang", "points": 24 },
            { "text": "Solid autonomous routine that does not conflict", "points": 18 },
            { "text": "Heavy defense and counter-defense capability", "points": 11 },
            { "text": "No robot breakdowns / clean electrical wiring", "points": 7 }
          ]
        },
        {
          "theme": "🏅 Prestige Awards",
          "title": "Round 13",
          "multiplier": 3,
          "prompt": "Name an official FRC award that teams compete fiercely for at competitions.",
          "answers": [
            { "text": "FIRST Impact Award (Chairman's)", "points": 48 },
            { "text": "Engineering Inspiration Award", "points": 22 },
            { "text": "Industrial Design Award / Quality Award", "points": 13 },
            { "text": "Rookie All-Star Award", "points": 10 },
            { "text": "Autonomous Award / Innovation in Control", "points": 7 }
          ]
        },
        {
          "theme": "🔧 Robot Materials & Build Season",
          "title": "Round 14",
          "multiplier": 3,
          "prompt": "Name a common material or part used to build an FRC robot.",
          "answers": [
            { "text": "Aluminum tubing / plates", "points": 42 },
            { "text": "Polycarbonate / Lexan sheets", "points": 24 },
            { "text": "3D-printed parts (PLA, PETG, Onyx)", "points": 16 },
            { "text": "Pool noodles (for bumpers)", "points": 11 },
            { "text": "Falcon, Kraken, or NEO brushless motors", "points": 7 }
          ]
        }
      ],
      "fastMoney": [
        {
          "prompt": "How many seconds does a robot have to clear out when warned for pinning an opponent?",
          "hint": "3 seconds (78), 5 seconds (14), 10 seconds (8)"
        },
        {
          "prompt": "Name a specific safety rule violation in the pits.",
          "hint": "Not wearing safety glasses (55), Open-toed shoes (28), Running in pit aisles (17)"
        },
        {
          "prompt": "Name an official FRC drive team role on the field.",
          "hint": "Driver (48), Operator / Co-Pilot (26), Drive Coach (18), Human Player (8)"
        },
        {
          "prompt": "Name the maximum legal weight of an FRC robot in pounds excluding battery and bumpers.",
          "hint": "125 lbs (88), 120 lbs (8), 100 lbs (4)"
        },
        {
          "prompt": "Name a sensor frequently mounted on an FRC robot.",
          "hint": "Limelight / Vision Camera (44), Gyro / Pigeon IMU (28), Encoders (18), Beam-break sensor (10)"
        },
        {
          "prompt": "Name a color of card shown by referees for rule violations.",
          "hint": "Yellow Card (56), Red Card (42), White Card (2)"
        },
        {
          "prompt": "Name a common mechanism seen on modern FRC robots.",
          "hint": "Intake / Roller Claw (38), Swerve Drive / Drivetrain (30), Elevator / Lift (20), Shooter / Flywheel (12)"
        },
        {
          "prompt": "Name something drive teams yell into their headsets during a match.",
          "hint": "Shoot / Score! (36), Defense / Watch out! (28), Climb / Hang! (20), How much time? (16)"
        },
        {
          "prompt": "Name an FRC game element from recent seasons.",
          "hint": "Notes / Foam rings (34), Cones / Cubes (26), Coral / Algae (22), Cargo / Oversized balls (18)"
        },
        {
          "prompt": "Name something teams give away at their pit table.",
          "hint": "Team buttons / pins (52), Stickers (30), Candy / snacks (12), 3D printed swag (6)"
        }
      ]
    }
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
  "deckName": "Family Feud 2025",
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
  "deckName": "Family Feud 2025 (Family-Friendly Edition)",
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
  ,
  {
    id: "2026.json",
    label: "🔥 Family Feud 2026 (60 Rounds • 8 Fast Money Sets)",
    file: "./decks/2026.json",
    data: {
    "gameTitle":  "Family Feud 2026",
    "gameIcon":  "🔥",
    "deckName":  "Family Feud 2026",
    "teamPresets":  [
                        [
                            "Team Red",
                            "Team Blue"
                        ],
                        [
                            "The Champs",
                            "The Challengers"
                        ],
                        [
                            "Family A",
                            "Family B"
                        ],
                        [
                            "Parents",
                            "Kids"
                        ],
                        [
                            "Celebrity All-Stars",
                            "Hometown Heroes"
                        ]
                    ],
    "rounds":  [
                   {
                       "title":  "Round 1",
                       "answers":  [
                                       {
                                           "text":  "Giant rattle or pacifier",
                                           "points":  34
                                       },
                                       {
                                           "text":  "Adult diaper over clothes",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Gold baby bottle chain",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Oversized gold crib",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Diamond-encrusted bib",
                                           "points":  8
                                       }
                                   ],
                       "prompt":  "If a rapper called themselves \u0027Big Old Baby\u0027, name something they might have on stage or wear.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture \u0026 Celebrity Feuds"
                   },
                   {
                       "title":  "Round 2",
                       "answers":  [
                                       {
                                           "text":  "Edgy fashion / Cone bra",
                                           "points":  41
                                       },
                                       {
                                           "text":  "Provocative / Rebellious attitude",
                                           "points":  23
                                       },
                                       {
                                           "text":  "Her dance choreography",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Endless chart-topping hits",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Her signature blonde hair",
                                           "points":  8
                                       }
                                   ],
                       "prompt":  "Name a quality or physical feature about Madonna that made her an eternal pop icon.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture \u0026 Celebrity Feuds"
                   },
                   {
                       "title":  "Round 3",
                       "answers":  [
                                       {
                                           "text":  "Bennifer (JLo \u0026 Ben Affleck)",
                                           "points":  45
                                       },
                                       {
                                           "text":  "Cardi B \u0026 Offset",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Channing Tatum \u0026 Zoe Kravitz",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Machine Gun Kelly \u0026 Megan Fox",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Gypsy Rose Blanchard \u0026 Ryan",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name a public celebrity breakup in 2026 that had everyone talking on social media.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture \u0026 Celebrity Feuds"
                   },
                   {
                       "title":  "Round 4",
                       "answers":  [
                                       {
                                           "text":  "Snoop Dogg",
                                           "points":  48
                                       },
                                       {
                                           "text":  "Flavor Flav",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Lil Jon",
                                           "points":  13
                                       },
                                       {
                                           "text":  "DJ Khaled",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Post Malone",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a rapper who always looks like they are having the absolute best time.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture \u0026 Celebrity Feuds"
                   },
                   {
                       "title":  "Round 5",
                       "answers":  [
                                       {
                                           "text":  "Cinderella (Sparkling Blue)",
                                           "points":  48
                                       },
                                       {
                                           "text":  "Belle (Golden Ballgown)",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Elsa (Ice Dress)",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Ariel (Seafoam Gown)",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Jasmine (Teal Silk)",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a Disney princess whose gown you would love to wear to a red carpet gala.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture \u0026 Celebrity Feuds"
                   },
                   {
                       "title":  "Round 6",
                       "answers":  [
                                       {
                                           "text":  "Jennifer Aniston",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Jennifer Lopez",
                                           "points":  31
                                       },
                                       {
                                           "text":  "Jennifer Lawrence",
                                           "points":  13
                                       },
                                       {
                                           "text":  "Jennifer Hudson",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Jennifer Garner",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name a famous woman named Jennifer.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture \u0026 Celebrity Feuds"
                   },
                   {
                       "title":  "Round 7",
                       "answers":  [
                                       {
                                           "text":  "Cell phone / Smartphone",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Television \u0026 remote",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Good book / Bible",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Deck of playing cards",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Video game console",
                                           "points":  9
                                       }
                                   ],
                       "prompt":  "Name something you would hope to be buried with so you do not get bored in the afterlife.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture \u0026 Celebrity Feuds"
                   },
                   {
                       "title":  "Round 8",
                       "answers":  [
                                       {
                                           "text":  "Big nose",
                                           "points":  38
                                       },
                                       {
                                           "text":  "Giant ears",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Plump lips / mouth",
                                           "points":  19
                                       },
                                       {
                                           "text":  "Big eyeballs",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Shiny teeth",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "If aliens visited Earth, name a facial feature on humans they might find huge or strange.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture \u0026 Celebrity Feuds"
                   },
                   {
                       "title":  "Round 9",
                       "answers":  [
                                       {
                                           "text":  "Music",
                                           "points":  52
                                       },
                                       {
                                           "text":  "Facts / Truth",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Mirror",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Crowd / Public",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Front",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Complete this famous phrase: \u0027Face the _____\u0027",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture \u0026 Celebrity Feuds"
                   },
                   {
                       "title":  "Round 10",
                       "answers":  [
                                       {
                                           "text":  "Jack Sparrow (Johnny Depp)",
                                           "points":  39
                                       },
                                       {
                                           "text":  "The Terminator (Arnold Schwarzenegger)",
                                           "points":  26
                                       },
                                       {
                                           "text":  "The Joker (Heath Ledger)",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Forrest Gump (Tom Hanks)",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Iron Man (Robert Downey Jr.)",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a movie role so iconic that no other actor should ever try to remake it.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture \u0026 Celebrity Feuds"
                   },
                   {
                       "title":  "Round 11",
                       "answers":  [
                                       {
                                           "text":  "Onion / Garlic",
                                           "points":  38
                                       },
                                       {
                                           "text":  "Fish / Seafood",
                                           "points":  27
                                       },
                                       {
                                           "text":  "Broccoli / Brussels sprouts",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Blue cheese",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Cardboard / Plain flavorless",
                                           "points":  8
                                       }
                                   ],
                       "prompt":  "Name a flavor of edible underwear you would be deeply disappointed to receive as a romantic gift.",
                       "multiplier":  1,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 12",
                       "answers":  [
                                       {
                                           "text":  "Slice of pizza / fast food bag",
                                           "points":  36
                                       },
                                       {
                                           "text":  "Beer can / can of soda",
                                           "points":  28
                                       },
                                       {
                                           "text":  "His cell phone / texting",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Cigarette / vape",
                                           "points":  12
                                       },
                                       {
                                           "text":  "TV remote control",
                                           "points":  8
                                       }
                                   ],
                       "prompt":  "If a guy made a terrible romantic proposal, what might he be holding in his other hand instead of flowers?",
                       "multiplier":  1,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 13",
                       "answers":  [
                                       {
                                           "text":  "Wedding ring tan line / indent",
                                           "points":  49
                                       },
                                       {
                                           "text":  "Flipping phone screen face-down",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Refusing photos / dodging crowds",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Strict curfew / rushing home",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Insisting on paying cash only",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a dead giveaway sign that a man on a first date is actually secretly married.",
                       "multiplier":  1,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 14",
                       "answers":  [
                                       {
                                           "text":  "Earring / piece of jewelry",
                                           "points":  39
                                       },
                                       {
                                           "text":  "Hair clip / bobby pin / scrunchie",
                                           "points":  27
                                       },
                                       {
                                           "text":  "Lipstick / lip balm",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Strong perfume scent",
                                           "points":  10
                                       },
                                       {
                                           "text":  "High heel / stray shoe",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name something a woman might find in her boyfriend\u0027s car that makes her immediately suspicious.",
                       "multiplier":  1,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 15",
                       "answers":  [
                                       {
                                           "text":  "Bear",
                                           "points":  42
                                       },
                                       {
                                           "text":  "Walrus",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Hippopotamus",
                                           "points":  17
                                       },
                                       {
                                           "text":  "Pig",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Sloth",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name an animal a wife might jokingly compare her husband\u0027s body shape to after 20 years of marriage.",
                       "multiplier":  1,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 16",
                       "answers":  [
                                       {
                                           "text":  "Bought the wrong brand / size",
                                           "points":  43
                                       },
                                       {
                                           "text":  "Spending too much / impulse buying",
                                           "points":  25
                                       },
                                       {
                                           "text":  "Wandering off / cart abandoned",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Sneaking junk food into cart",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Flirting or embarrassing her",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name a reason a woman might start yelling at her husband in the middle of a grocery store.",
                       "multiplier":  2,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 17",
                       "answers":  [
                                       {
                                           "text":  "\u0027Mom still does my laundry\u0027",
                                           "points":  36
                                       },
                                       {
                                           "text":  "\u0027Terrible texter \u0026 ghoster\u0027",
                                           "points":  27
                                       },
                                       {
                                           "text":  "\u0027Financially completely broke\u0027",
                                           "points":  18
                                       },
                                       {
                                           "text":  "\u0027Screams at video games\u0027",
                                           "points":  12
                                       },
                                       {
                                           "text":  "\u0027Emotionally unavailable\u0027",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "If dating apps required brutally honest warning labels on men\u0027s profiles, what would one say?",
                       "multiplier":  2,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 18",
                       "answers":  [
                                       {
                                           "text":  "Exotic sports car",
                                           "points":  41
                                       },
                                       {
                                           "text":  "Rolex / luxury designer watch",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Custom designer suits \u0026 clothes",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Luxury penthouse apartment",
                                           "points":  11
                                       },
                                       {
                                           "text":  "First-class European vacation",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name something an older wealthy woman might buy for her young \u0027Sugar Baby\u0027 boyfriend.",
                       "multiplier":  2,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 19",
                       "answers":  [
                                       {
                                           "text":  "\u0027My mouth tastes like garlic\u0027",
                                           "points":  35
                                       },
                                       {
                                           "text":  "\u0027I threw up earlier\u0027",
                                           "points":  29
                                       },
                                       {
                                           "text":  "\u0027I forgot to brush my teeth\u0027",
                                           "points":  18
                                       },
                                       {
                                           "text":  "\u0027I have a contagious cold\u0027",
                                           "points":  12
                                       },
                                       {
                                           "text":  "\u0027Please don\u0027t use tongue\u0027",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name something you would hate to hear your partner say right before you lean in to kiss them.",
                       "multiplier":  2,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 20",
                       "answers":  [
                                       {
                                           "text":  "Tube socks pulled all the way up",
                                           "points":  44
                                       },
                                       {
                                           "text":  "Tight tighty-whities",
                                           "points":  25
                                       },
                                       {
                                           "text":  "Faded stained high school t-shirt",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Flannel footie onesie",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Baggy grey sweatpants",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name something a man wears to bed that makes him look completely unsexy.",
                       "multiplier":  2,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 21",
                       "answers":  [
                                       {
                                           "text":  "Giant red pimple on nose/forehead",
                                           "points":  39
                                       },
                                       {
                                           "text":  "Horrible haircut / dye disaster",
                                           "points":  27
                                       },
                                       {
                                           "text":  "Outfit does not zip or fit",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Chipped front tooth",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Terrible sunburn or fake tan",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name an appearance flaw that would make someone panic and cancel a first date at the last minute.",
                       "multiplier":  2,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 22",
                       "answers":  [
                                       {
                                           "text":  "Wedding anniversary",
                                           "points":  45
                                       },
                                       {
                                           "text":  "Her birthday",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Taking out the trash / recycling",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Dinner with the in-laws",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Picking up groceries",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something a husband will \u0027conveniently forget\u0027 to get out of trouble or chores.",
                       "multiplier":  2,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 23",
                       "answers":  [
                                       {
                                           "text":  "New haircut / hair color",
                                           "points":  56
                                       },
                                       {
                                           "text":  "New dress / outfit",
                                           "points":  22
                                       },
                                       {
                                           "text":  "That she is mad at him",
                                           "points":  12
                                       },
                                       {
                                           "text":  "House was thoroughly cleaned",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Weight loss",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something a woman expects her partner to notice immediately without having to tell them.",
                       "multiplier":  2,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 24",
                       "answers":  [
                                       {
                                           "text":  "Snookums / Pookie",
                                           "points":  42
                                       },
                                       {
                                           "text":  "Sugar Dumpling / Honeybunch",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Baby Cakes",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Daddy / Papa Bear",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Cuddle Bug",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a romantic nickname for a lover that sounds ridiculous when shouted across a crowded room.",
                       "multiplier":  2,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 25",
                       "answers":  [
                                       {
                                           "text":  "Car temperature / AC settings",
                                           "points":  38
                                       },
                                       {
                                           "text":  "Directions / refusing GPS",
                                           "points":  29
                                       },
                                       {
                                           "text":  "Music playlist / radio station",
                                           "points":  17
                                       },
                                       {
                                           "text":  "When and where to stop for food",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Aggressive driving / speeding",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something couples fight over during a long 10-hour road trip.",
                       "multiplier":  2,
                       "theme":  "💘 Dating, Marriage \u0026 Steve Harvey Fails"
                   },
                   {
                       "title":  "Round 26",
                       "answers":  [
                                       {
                                           "text":  "\u0027...performing surgery on a human\u0027",
                                           "points":  44
                                       },
                                       {
                                           "text":  "\u0027...flying a passenger plane\u0027",
                                           "points":  28
                                       },
                                       {
                                           "text":  "\u0027...doing a permanent tattoo\u0027",
                                           "points":  14
                                       },
                                       {
                                           "text":  "\u0027...cutting someone\u0027s hair\u0027",
                                           "points":  8
                                       },
                                       {
                                           "text":  "\u0027...driving a school bus\u0027",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a phrase starting with \u0027I have never done this before\u0027 that would terrify you to hear from a professional.",
                       "multiplier":  2,
                       "theme":  "💼 Work, Money \u0026 Modern Life"
                   },
                   {
                       "title":  "Round 27",
                       "answers":  [
                                       {
                                           "text":  "Fashion Model",
                                           "points":  47
                                       },
                                       {
                                           "text":  "Hollywood Actor / Actress",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Television News Anchor",
                                           "points":  13
                                       },
                                       {
                                           "text":  "Flight Attendant",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Personal Fitness Trainer",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a profession where people are constantly scrutinized and judged purely on how they look.",
                       "multiplier":  2,
                       "theme":  "💼 Work, Money \u0026 Modern Life"
                   },
                   {
                       "title":  "Round 28",
                       "answers":  [
                                       {
                                           "text":  "Deep cleaning the bathroom \u0026 toilet",
                                           "points":  48
                                       },
                                       {
                                           "text":  "Scrubbing the inside of the oven",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Folding and putting away mountains of laundry",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Mowing and weeding the entire lawn",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Washing a huge sink full of crusted dishes",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a chore you would willingly hand someone  cash to do for you right now.",
                       "multiplier":  2,
                       "theme":  "💼 Work, Money \u0026 Modern Life"
                   },
                   {
                       "title":  "Round 29",
                       "answers":  [
                                       {
                                           "text":  "\u0027It\u0027s just water weight / bloating\u0027",
                                           "points":  42
                                       },
                                       {
                                           "text":  "\u0027My shoes and jeans weigh 8 pounds\u0027",
                                           "points":  28
                                       },
                                       {
                                           "text":  "\u0027The scale is clearly uncalibrated/broken\u0027",
                                           "points":  16
                                       },
                                       {
                                           "text":  "\u0027It\u0027s dense muscle mass\u0027",
                                           "points":  9
                                       },
                                       {
                                           "text":  "\u0027I just ate a huge salty burrito\u0027",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name an excuse people give when they step onto the bathroom scale and notice they gained 10 pounds.",
                       "multiplier":  2,
                       "theme":  "💼 Work, Money \u0026 Modern Life"
                   },
                   {
                       "title":  "Round 30",
                       "answers":  [
                                       {
                                           "text":  "Taking showers / baths",
                                           "points":  58
                                       },
                                       {
                                           "text":  "Brushing and flossing teeth",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Washing and conditioning hair",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Trimming toenails",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Shaving body hair",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "If humans had self-cleaning bodies like cats, name a daily grooming task we could permanently eliminate.",
                       "multiplier":  2,
                       "theme":  "💼 Work, Money \u0026 Modern Life"
                   },
                   {
                       "title":  "Round 31",
                       "answers":  [
                                       {
                                           "text":  "Registration and insurance papers",
                                           "points":  53
                                       },
                                       {
                                           "text":  "Stash of napkins and moist towelettes",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Tire pressure gauge",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Emergency flashlight",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Roll of breath mints / gum",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name something you keep tucked inside your car\u0027s glove compartment that definitely is not gloves.",
                       "multiplier":  3,
                       "theme":  "💼 Work, Money \u0026 Modern Life"
                   },
                   {
                       "title":  "Round 32",
                       "answers":  [
                                       {
                                           "text":  "Hair straightener / curling iron",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Clothes iron",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Coffee maker / kettle",
                                           "points":  13
                                       },
                                       {
                                           "text":  "Stove / oven burner",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Space heater",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something people constantly panic about leaving plugged in when they rush out the front door.",
                       "multiplier":  3,
                       "theme":  "💼 Work, Money \u0026 Modern Life"
                   },
                   {
                       "title":  "Round 33",
                       "answers":  [
                                       {
                                           "text":  "Target",
                                           "points":  37
                                       },
                                       {
                                           "text":  "Costco / Wholesale Club",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Grocery supermarket",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Car dealership / mechanic",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Casino",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name a place you walk into where you can instantly feel your wallet getting substantially lighter.",
                       "multiplier":  3,
                       "theme":  "💼 Work, Money \u0026 Modern Life"
                   },
                   {
                       "title":  "Round 34",
                       "answers":  [
                                       {
                                           "text":  "Talking while muted / \u0027You are on mute\u0027",
                                           "points":  42
                                       },
                                       {
                                           "text":  "Chewing food / loud crunching",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Barking dogs / noisy background",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Obviously multitasking / looking at phone",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Heavy mouth breathing into microphone",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name an annoying habit coworkers have on Zoom video meetings.",
                       "multiplier":  3,
                       "theme":  "💼 Work, Money \u0026 Modern Life"
                   },
                   {
                       "title":  "Round 35",
                       "answers":  [
                                       {
                                           "text":  "\u0027URGENT\u0027 email from your boss",
                                           "points":  48
                                       },
                                       {
                                           "text":  "A calendar invite for 8:00 AM",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Overdue bill notification",
                                           "points":  15
                                       },
                                       {
                                           "text":  "\u0027Reply-all\u0027 chain with 50 emails",
                                           "points":  8
                                       },
                                       {
                                           "text":  "System outage alert",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something you dread seeing in your email inbox on a Monday morning.",
                       "multiplier":  3,
                       "theme":  "💼 Work, Money \u0026 Modern Life"
                   },
                   {
                       "title":  "Round 36",
                       "answers":  [
                                       {
                                           "text":  "\u0027I will turn this car around right now!\u0027",
                                           "points":  46
                                       },
                                       {
                                           "text":  "\u0027Wait until your father gets home!\u0027",
                                           "points":  26
                                       },
                                       {
                                           "text":  "\u0027I\u0027m taking your tablets and phones away!\u0027",
                                           "points":  14
                                       },
                                       {
                                           "text":  "\u0027Santa is watching and taking notes!\u0027",
                                           "points":  8
                                       },
                                       {
                                           "text":  "\u0027Don\u0027t make me pull over!\u0027",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a classic threat parents yell when children start acting crazy in the backseat of the car.",
                       "multiplier":  3,
                       "theme":  "👶 Family Meltdowns \u0026 Home Secrets"
                   },
                   {
                       "title":  "Round 37",
                       "answers":  [
                                       {
                                           "text":  "Their banana snapped in half",
                                           "points":  38
                                       },
                                       {
                                           "text":  "Told they cannot wear pants on their head",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Announcing it is bedtime or naptime",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Cutting their sandwich the wrong way",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Forcing them to put on socks or shoes",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name something completely ridiculous that will trigger a toddler\u0027s full five-alarm meltdown.",
                       "multiplier":  3,
                       "theme":  "👶 Family Meltdowns \u0026 Home Secrets"
                   },
                   {
                       "title":  "Round 38",
                       "answers":  [
                                       {
                                           "text":  "Smartphones, iPads \u0026 social apps",
                                           "points":  54
                                       },
                                       {
                                           "text":  "Video games (Roblox, Minecraft, Fortnite)",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Fixing the home Wi-Fi and smart TV",
                                           "points":  13
                                       },
                                       {
                                           "text":  "Modern slang and trending memes",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Artificial Intelligence / ChatGPT",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something modern kids understand way faster and better than their grandparents.",
                       "multiplier":  3,
                       "theme":  "👶 Family Meltdowns \u0026 Home Secrets"
                   },
                   {
                       "title":  "Round 39",
                       "answers":  [
                                       {
                                           "text":  "Leather bifold wallet",
                                           "points":  41
                                       },
                                       {
                                           "text":  "Pocket knife",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Leather belt",
                                           "points":  17
                                       },
                                       {
                                           "text":  "Black pocket comb",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Fleece house slippers",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name something cheap and worn-out that grandpa has been carrying since his wedding day.",
                       "multiplier":  3,
                       "theme":  "👶 Family Meltdowns \u0026 Home Secrets"
                   },
                   {
                       "title":  "Round 40",
                       "answers":  [
                                       {
                                           "text":  "Practice clapping and yelling \u0027Good answer!\u0027",
                                           "points":  45
                                       },
                                       {
                                           "text":  "Binge-watch old episodes and Steve Harvey clips",
                                           "points":  25
                                       },
                                       {
                                           "text":  "Pick out the sharpest color-coordinated outfit",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Practice buzzing in using a sofa cushion",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Say a quick family prayer",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name something you do the night before taping Family Feud to make sure you do not freeze up.",
                       "multiplier":  3,
                       "theme":  "👶 Family Meltdowns \u0026 Home Secrets"
                   },
                   {
                       "title":  "Round 41",
                       "answers":  [
                                       {
                                           "text":  "Wedding ceremony \u0026 reception",
                                           "points":  43
                                       },
                                       {
                                           "text":  "Tropical beach vacation",
                                           "points":  27
                                       },
                                       {
                                           "text":  "Birthday milestone party",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Family holiday photo shoot",
                                           "points":  9
                                       },
                                       {
                                           "text":  "New Year\u0027s Eve bash",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name an event where people snap 500 photos and end up liking exactly two of them.",
                       "multiplier":  3,
                       "theme":  "👶 Family Meltdowns \u0026 Home Secrets"
                   },
                   {
                       "title":  "Round 42",
                       "answers":  [
                                       {
                                           "text":  "Canned jellied cranberry sauce",
                                           "points":  41
                                       },
                                       {
                                           "text":  "Fruitcake",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Green bean casserole",
                                           "points":  17
                                       },
                                       {
                                           "text":  "Jell-O mold with shredded carrots",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Mashed turnips / rutabaga",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a dish at Thanksgiving dinner that sits on the table untouched every year.",
                       "multiplier":  3,
                       "theme":  "👶 Family Meltdowns \u0026 Home Secrets"
                   },
                   {
                       "title":  "Round 43",
                       "answers":  [
                                       {
                                           "text":  "Christmas presents \u0026 birthday gifts",
                                           "points":  52
                                       },
                                       {
                                           "text":  "Secret stash of candy and chocolate",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Video game controllers / tablets",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Sentimental fragile heirlooms",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Important tax \u0026 birth documents",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something parents hide on the highest closet shelf where kids cannot reach.",
                       "multiplier":  3,
                       "theme":  "👶 Family Meltdowns \u0026 Home Secrets"
                   },
                   {
                       "title":  "Round 44",
                       "answers":  [
                                       {
                                           "text":  "Front door deadbolt",
                                           "points":  64
                                       },
                                       {
                                           "text":  "Back / patio sliding glass door",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Car doors parked in driveway",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Windows",
                                           "points":  4
                                       },
                                       {
                                           "text":  "Garage door",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name something you always double-check is locked before you go to sleep at night.",
                       "multiplier":  3,
                       "theme":  "👶 Family Meltdowns \u0026 Home Secrets"
                   },
                   {
                       "title":  "Round 45",
                       "answers":  [
                                       {
                                           "text":  "Squeaky wooden floorboard / staircase",
                                           "points":  58
                                       },
                                       {
                                           "text":  "Creaky front door hinge",
                                           "points":  23
                                       },
                                       {
                                           "text":  "Barking family dog",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Refrigerator door seal suction",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Microwave loud beep",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name something in your childhood home that made a loud, distinct noise whenever someone tried to sneak around.",
                       "multiplier":  3,
                       "theme":  "👶 Family Meltdowns \u0026 Home Secrets"
                   },
                   {
                       "title":  "Round 46",
                       "answers":  [
                                       {
                                           "text":  "Pounding headache / epic hangover",
                                           "points":  37
                                       },
                                       {
                                           "text":  "A stranger they married at 3:00 AM",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Maxed-out credit card statements",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Novelty yard-long slushy cup",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Regrettable matching tattoo",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name an unwelcome souvenir people bring back from Las Vegas that they immediately regret.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 47",
                       "answers":  [
                                       {
                                           "text":  "Shorter skirt or side slit",
                                           "points":  41
                                       },
                                       {
                                           "text":  "Flashy designer high heels or Jordans",
                                           "points":  27
                                       },
                                       {
                                           "text":  "Bold fire-engine red lipstick",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Pushing veil back to show hair",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Cool leather motorcycle jacket",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "If a Catholic nun was feeling rebelliously stylish, how might she modify her habit?",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 48",
                       "answers":  [
                                       {
                                           "text":  "Cool designer sunglasses",
                                           "points":  38
                                       },
                                       {
                                           "text":  "Baseball cap or ten-gallon cowboy hat",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Silk pajamas and fuzzy bunny slippers",
                                           "points":  17
                                       },
                                       {
                                           "text":  "Super Bowl champion jersey",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Heavy gold chains and royal crown",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name a strange item an eccentric billionaire might request to wear inside their open casket.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 49",
                       "answers":  [
                                       {
                                           "text":  "Fluffy feather pillow",
                                           "points":  45
                                       },
                                       {
                                           "text":  "Fresh plush sherpa blanket / comforter",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Big fluffy dog or golden retriever fur",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Tall warm stack of buttermilk pancakes",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Giant stuffed teddy bear",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something super thick and plush that you just want to bury your face into.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 50",
                       "answers":  [
                                       {
                                           "text":  "Sandy beach / ocean shore",
                                           "points":  57
                                       },
                                       {
                                           "text":  "Inside your own living room",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Swimming pool patio deck",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Yoga studio / dojo mat",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Locker room / sauna",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name a place where it is totally socially acceptable to be walking around completely barefoot.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 51",
                       "answers":  [
                                       {
                                           "text":  "Professional Golf",
                                           "points":  56
                                       },
                                       {
                                           "text":  "Championship Tennis",
                                           "points":  31
                                       },
                                       {
                                           "text":  "Grandmaster Chess",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Olympic Archery / Rifle Shooting",
                                           "points":  4
                                       },
                                       {
                                           "text":  "Billiards / Snooker",
                                           "points":  2
                                       }
                                   ],
                       "prompt":  "Name a competitive sport where the spectators are required to stay dead silent during action.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 52",
                       "answers":  [
                                       {
                                           "text":  "Ostrich",
                                           "points":  76
                                       },
                                       {
                                           "text":  "Emu",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Emperor Penguin",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Canada Goose",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name an animal that is famous for laying enormous eggs.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 53",
                       "answers":  [
                                       {
                                           "text":  "Television remote control",
                                           "points":  48
                                       },
                                       {
                                           "text":  "Car keys / house keys",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Cell phone",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Reading glasses / sunglasses",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Phone charger cord",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something people constantly misplace inside their own house and blame others for stealing.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 54",
                       "answers":  [
                                       {
                                           "text":  "Picking their nose",
                                           "points":  54
                                       },
                                       {
                                           "text":  "Smelling their own armpits / breath",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Adjusting wedgies / underwear",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Checking their teeth in phone reflection",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Passing gas quietly",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name a bad habit people secretly do when they think nobody in the room is watching them.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 55",
                       "answers":  [
                                       {
                                           "text":  "Aluminum foil / metal utensils",
                                           "points":  58
                                       },
                                       {
                                           "text":  "Raw whole egg in shell",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Cell phone / electronics",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Styrofoam take-out cup",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Hot chili peppers",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something you should never, under any circumstances, microwave.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 56",
                       "answers":  [
                                       {
                                           "text":  "Toilet paper",
                                           "points":  54
                                       },
                                       {
                                           "text":  "Bottled water",
                                           "points":  25
                                       },
                                       {
                                           "text":  "Canned goods / spam / beans",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Batteries \u0026 flashlights",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Hand sanitizer / disinfectant wipes",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something people hoard in massive quantities in case of an apocalyptic emergency.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 57",
                       "answers":  [
                                       {
                                           "text":  "Grocery store / supermarket",
                                           "points":  51
                                       },
                                       {
                                           "text":  "The gym",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Local coffee shop / Starbucks",
                                           "points":  13
                                       },
                                       {
                                           "text":  "Airport terminal",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Doctor\u0027s waiting room",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name a place you hate running into your ex when you look like an absolute mess.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 58",
                       "answers":  [
                                       {
                                           "text":  "Unpopped popcorn kernel",
                                           "points":  62
                                       },
                                       {
                                           "text":  "Hard crusty artisan bread",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Olive pit / cherry pit",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Jawbreaker candy / lollipop",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Ice cube",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name an innocent food that causes major dental distress if you bite into it wrong.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 59",
                       "answers":  [
                                       {
                                           "text":  "Singing passionately at the top of their lungs",
                                           "points":  52
                                       },
                                       {
                                           "text":  "Enthusiastic steering wheel drumming / dancing",
                                           "points":  27
                                       },
                                       {
                                           "text":  "Aggressive nose picking",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Applying full makeup in rearview mirror",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Talking animatedly to themselves",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something people do when they are stuck in slow-moving traffic that makes other drivers laugh.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   },
                   {
                       "title":  "Round 60",
                       "answers":  [
                                       {
                                           "text":  "\u0027Double down!\u0027",
                                           "points":  39
                                       },
                                       {
                                           "text":  "\u0027Hit me!\u0027",
                                           "points":  28
                                       },
                                       {
                                           "text":  "\u0027Winner winner, chicken dinner!\u0027",
                                           "points":  16
                                       },
                                       {
                                           "text":  "\u0027Let it ride!\u0027",
                                           "points":  11
                                       },
                                       {
                                           "text":  "\u0027House always wins!\u0027",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a phrase you hear constantly in Las Vegas casinos.",
                       "multiplier":  3,
                       "theme":  "🎉 Wild Nights, Strange Habits \u0026 Party Laughs"
                   }
               ],
    "fastMoney":  [
                      {
                          "hint":  "3 drinks (42), 2 drinks (28), 4 drinks (16), 5+ drinks (9), 1 drink (5)",
                          "prompt":  "How many alcoholic drinks do you have before making questionable decisions?"
                      },
                      {
                          "hint":  "Nurse / Doctor (54), Tattoo artist (24), Seamstress / Tailor (12), Acupuncturist (7), Phlebotomist (3)",
                          "prompt":  "Name a profession where people use needles every single day."
                      },
                      {
                          "hint":  "Mega yachts (38), Mansions / Estates (31), Private jets (19), Supercars / Ferraris (8), Private islands (4)",
                          "prompt":  "Name something the world\u0027s richest man probably owns two of."
                      },
                      {
                          "hint":  "Donut (56), Basketball (24), Cookie / Oreo (14), Chicken nugget (4), French fry (2)",
                          "prompt":  "Name something you dunk."
                      },
                      {
                          "hint":  "King (62), Queen (36), Knight (2)",
                          "prompt":  "Name a royal piece on a chessboard."
                      },
                      {
                          "hint":  "Biceps / Arms (55), Chest / Pecs (26), Shoulders / Traps (11), Thighs / Calves (5), Neck (3)",
                          "prompt":  "Name a body part a cartoon bodybuilder would have exaggeratedly huge."
                      },
                      {
                          "hint":  "10 nuggets (44), 6 nuggets (26), 20 nuggets (18), 12 nuggets (8), 8 nuggets (4)",
                          "prompt":  "How many chicken nuggets make a satisfying dinner meal?"
                      },
                      {
                          "hint":  "Mom / Mother (43), Spouse / Partner (26), Child / Grandchild (18), Best friend (9), Pet / Dog (4)",
                          "prompt":  "Name someone in your life whose voice instantly puts a smile on your face."
                      },
                      {
                          "hint":  "Concert / Music festival (52), NBA basketball game (28), Broadway theater show (11), Comedy club (6), Boxing / UFC fight (3)",
                          "prompt":  "Name a live entertainment event where you definitely want front-row seats."
                      },
                      {
                          "hint":  "Tokyo (68), New York City (22), San Francisco (5), Los Angeles (3), London (2)",
                          "prompt":  "Name a world city Godzilla would probably stomp through first."
                      },
                      {
                          "hint":  "King-size bedroom suite (38), Full chef\u0027s kitchen \u0026 fridge (26), Giant flat-screen TV (18), Luxury tile shower (12), Electric fireplace (6)",
                          "prompt":  "Name an impressive luxury feature you\u0027d expect to find in a ,000 RV."
                      },
                      {
                          "hint":  "Algebra / 8th or 9th grade (44), Calculus / 12th grade (26), 6th grade fractions (16), Geometry / 10th grade (9), College college algebra (5)",
                          "prompt":  "At what grade in school did math become completely impossible for you?"
                      },
                      {
                          "hint":  "October (48), November (28), December (14), January (7), September (3)",
                          "prompt":  "Name the single best month of the year for wearing cozy sweaters."
                      },
                      {
                          "hint":  "Money / Cash loan (62), Favorite book (14), Jacket / Designer clothes (11), Power tools / lawn mower (8), Car (5)",
                          "prompt":  "Name something you shouldn\u0027t lend to a friend unless you\u0027re okay never seeing it again."
                      },
                      {
                          "hint":  "5 minutes (46), 2 minutes (29), 1 minute (15), 10 minutes (7), 30 seconds (3)",
                          "prompt":  "How many minutes can you listen to someone brag before you tune them out?"
                      },
                      {
                          "hint":  "Free meals / 3 hot meals a day (42), Plenty of uninterrupted sleep (28), No phone / peace \u0026 quiet (16), Mandatory workout time (9), Free cable TV (5)",
                          "prompt":  "Name an unexpected luxury or benefit you\u0027d enjoy if you spent a quiet weekend in jail."
                      },
                      {
                          "hint":  "Acorns (58), Dry leaves (24), Fallen twigs / branches (10), Pinecones (5), Wild mushrooms (3)",
                          "prompt":  "Name something you might find lying on the ground under a large oak tree."
                      },
                      {
                          "hint":  "Mercedes-Benz (39), Porsche (27), Rolls-Royce (18), Ferrari / Lamborghini (11), Tesla (5)",
                          "prompt":  "Name a luxury car brand you see parked in every driveway in Beverly Hills."
                      },
                      {
                          "hint":  "Zelda (51), The Fall (22), Sleepy Hollow (14), The Hidden Temple (8), Korra (5)",
                          "prompt":  "Complete this famous gaming or movie phrase: \u0027Legend of _____\u0027."
                      },
                      {
                          "hint":  "Tuna salad sandwich (48), Egg salad sandwich (24), Pastrami with raw onions (16), Garlic roast beef (8), Liverwurst (4)",
                          "prompt":  "Name a lunch sandwich that is delicious but gives you terrible dragon breath."
                      },
                      {
                          "hint":  "Cleaning their messy bedroom (52), Mowing the lawn (24), Taking out the trash (12), Doing their laundry (8), Emptying dishwasher (4)",
                          "prompt":  "Name a chore teenagers complain about having to do every single Saturday morning."
                      },
                      {
                          "hint":  "Ostrich (78), Emu (14), Emperor Penguin (5), Canada Goose (3)",
                          "prompt":  "Name a bird that is famous for having enormous eggs."
                      },
                      {
                          "hint":  "3 pairs (41), 2 pairs (32), 4 pairs (15), 5 pairs (8), 1 pair (4)",
                          "prompt":  "How many pairs of shoes do you actually wear on a regular weekly basis?"
                      },
                      {
                          "hint":  "Pancakes / Waffles (42), Cheeseburger \u0026 french fries (31), Hot coffee (14), Chocolate milkshake (8), Bacon \u0026 eggs (5)",
                          "prompt":  "Name something you might order at a 24-hour diner at midnight."
                      },
                      {
                          "hint":  "Tuba / Sousaphone (59), Bass drum (24), Snare quad drums (11), Trombone (4), Baritone horn (2)",
                          "prompt":  "Name an instrument in a high school marching band that looks painfully heavy to carry."
                      },
                      {
                          "hint":  "Baseball / Outfield (54), Beach volleyball (24), Road cycling / Biking (12), Golf (7), Snowboarding / Skiing (3)",
                          "prompt":  "Name a sport where an athlete might wear sunglasses during competition."
                      },
                      {
                          "hint":  "TV remote control (48), Loose coins / Change (27), Cell phone (14), Car keys (7), Hair ties / pens (4)",
                          "prompt":  "Name something people constantly lose behind their living room couch cushions."
                      },
                      {
                          "hint":  "15 minutes (44), 10 minutes (33), 20 minutes (15), 5 minutes (5), 30 minutes (3)",
                          "prompt":  "How many minutes is an ideal, refreshing hot shower?"
                      },
                      {
                          "hint":  "Driver texting at green light (51), Car cutting you off abruptly (27), Warning a pedestrian or animal (11), Saying hi to a neighbor (7), Road rage (4)",
                          "prompt":  "Name a reason you would aggressively honk the horn on your car."
                      },
                      {
                          "hint":  "Stuck in bumper-to-bumper traffic (62), Alarm didn\u0027t go off / overslept (22), Flat tire / car trouble (10), Child was sick (4), Spilled coffee all over clothes (2)",
                          "prompt":  "Name a classic excuse for arriving 30 minutes late to work."
                      },
                      {
                          "hint":  "Chopped walnuts / nuts (42), Hot fudge (21), Rainbow sprinkles (16), Marshmallow fluff (12), Maraschino cherry (9)",
                          "prompt":  "Name an ice cream topping that completely ruins the sundae if you dislike it."
                      },
                      {
                          "hint":  "Aerosol spray can (58), Household batteries (21), Glass bottle (11), Fireworks (7), Cell phone (3)",
                          "prompt":  "Name an item you should never, ever toss into a raging campfire."
                      },
                      {
                          "hint":  "Fidget / tap fingers on table (46), Sweat profusely / wipe palms (24), Talk too fast with hands (16), Clench fists together (9), Bite fingernails (5)",
                          "prompt":  "Name something people nervously do with their hands during a high-stakes job interview."
                      },
                      {
                          "hint":  "Pineapple (72), Anchovies (16), Mushrooms (7), Jalapeño peppers (3), Black olives (2)",
                          "prompt":  "Name a popular pizza topping that sparks heated arguments among friends."
                      },
                      {
                          "hint":  "6 hours (45), 7 hours (31), 5 hours (14), 8 hours (8), 4 hours (2)",
                          "prompt":  "How many hours of sleep do you realistically get on an average weeknight?"
                      },
                      {
                          "hint":  "Refrigerator / freezer (48), Microwave oven (24), Coffee maker / Keurig (16), Air fryer (8), Dishwasher (4)",
                          "prompt":  "Name a kitchen appliance you would be utterly devastated without for two days."
                      },
                      {
                          "hint":  "Plastic bottle of water (64), Cold deli sandwich / snack box (18), Memory foam neck pillow (10), Charging cord / headphones (5), Magazine (3)",
                          "prompt":  "Name something you purchase at an airport terminal that costs triple what it should."
                      },
                      {
                          "hint":  "Sloth (65), Turtle / Tortoise (22), Garden snail (9), Koala (4)",
                          "prompt":  "Name an animal that moves so painfully slow it is almost comical."
                      },
                      {
                          "hint":  "Buttered popcorn (62), Chocolate candy / M\u0026Ms (18), Twizzlers / Red Vines (11), Nachos with melted cheese (6), Sour Patch Kids (3)",
                          "prompt":  "Name a movie theater snack you cannot resist even if you just ate dinner."
                      },
                      {
                          "hint":  "Shocking text message / juicy gossip (44), Low bank balance notification (28), Breaking news bulletin (16), Realized they are terribly late (8), Tagged in an awful photo (4)",
                          "prompt":  "Name a reason a person might look down at their phone in public and visibly gasp."
                      }
                  ]
}
  },
  {
    id: "2026-family-friendly.json",
    label: "🌟 Family Feud 2026 (Family-Friendly • 60 Rounds)",
    file: "./decks/2026-family-friendly.json",
    data: {
    "gameTitle":  "Family Feud 2026",
    "gameIcon":  "🌟",
    "deckName":  "Family Feud 2026 (Family-Friendly Edition)",
    "teamPresets":  [
                        [
                            "Team Parents",
                            "Team Kids"
                        ],
                        [
                            "The Champs",
                            "The Challengers"
                        ],
                        [
                            "Team Gold",
                            "Team Blue"
                        ],
                        [
                            "Cousins",
                            "Siblings"
                        ],
                        [
                            "Grandparents",
                            "Grandkids"
                        ]
                    ],
    "rounds":  [
                   {
                       "title":  "Round 1",
                       "answers":  [
                                       {
                                           "text":  "Cinderella (Sparkling Blue Ballgown)",
                                           "points":  48
                                       },
                                       {
                                           "text":  "Belle (Golden Ballroom Dress)",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Elsa (Ice Crystal Gown)",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Ariel (Sparkling Seafoam Gown)",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Jasmine (Teal Silk Outfit)",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a Disney princess whose gown you would love to wear to a grand royal ball.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture, Movies \u0026 Famous Faces"
                   },
                   {
                       "title":  "Round 2",
                       "answers":  [
                                       {
                                           "text":  "Giant rattle or pacifier",
                                           "points":  34
                                       },
                                       {
                                           "text":  "Oversized cartoon diaper",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Gold baby bottle chain",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Giant golden crib",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Diamond-encrusted bib",
                                           "points":  8
                                       }
                                   ],
                       "prompt":  "If a rapper called themselves \u0027Big Old Baby\u0027, name something funny they might wear or have on stage.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture, Movies \u0026 Famous Faces"
                   },
                   {
                       "title":  "Round 3",
                       "answers":  [
                                       {
                                           "text":  "Jennifer Aniston",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Jennifer Lopez",
                                           "points":  31
                                       },
                                       {
                                           "text":  "Jennifer Lawrence",
                                           "points":  13
                                       },
                                       {
                                           "text":  "Jennifer Hudson",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Jennifer Garner",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name a famous woman named Jennifer.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture, Movies \u0026 Famous Faces"
                   },
                   {
                       "title":  "Round 4",
                       "answers":  [
                                       {
                                           "text":  "Captain Jack Sparrow (Johnny Depp)",
                                           "points":  39
                                       },
                                       {
                                           "text":  "The Terminator (Arnold Schwarzenegger)",
                                           "points":  26
                                       },
                                       {
                                           "text":  "The Joker (Heath Ledger)",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Forrest Gump (Tom Hanks)",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Iron Man (Robert Downey Jr.)",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a movie role so iconic that no other actor should ever try to remake it.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture, Movies \u0026 Famous Faces"
                   },
                   {
                       "title":  "Round 5",
                       "answers":  [
                                       {
                                           "text":  "Music",
                                           "points":  52
                                       },
                                       {
                                           "text":  "Facts / Truth",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Mirror",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Crowd",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Front",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Complete this famous phrase: \u0027Face the _____\u0027",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture, Movies \u0026 Famous Faces"
                   },
                   {
                       "title":  "Round 6",
                       "answers":  [
                                       {
                                           "text":  "Dolly Parton",
                                           "points":  38
                                       },
                                       {
                                           "text":  "Snoop Dogg",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Jack Black",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Kelly Clarkson",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Dwayne \u0027The Rock\u0027 Johnson",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name a celebrity who always looks cheerful and full of positive energy.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture, Movies \u0026 Famous Faces"
                   },
                   {
                       "title":  "Round 7",
                       "answers":  [
                                       {
                                           "text":  "Big nose",
                                           "points":  38
                                       },
                                       {
                                           "text":  "Giant ears",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Plump lips / mouth",
                                           "points":  19
                                       },
                                       {
                                           "text":  "Round eyeballs",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Shiny teeth",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "If aliens visited Earth, name a facial feature on humans they might find huge or strange.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture, Movies \u0026 Famous Faces"
                   },
                   {
                       "title":  "Round 8",
                       "answers":  [
                                       {
                                           "text":  "Cell phone / smartphone",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Television \u0026 remote",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Good book / Bible",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Deck of playing cards",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Video game console",
                                           "points":  9
                                       }
                                   ],
                       "prompt":  "Name something you would hope to be buried with so you do not get bored in the afterlife.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture, Movies \u0026 Famous Faces"
                   },
                   {
                       "title":  "Round 9",
                       "answers":  [
                                       {
                                           "text":  "Batman",
                                           "points":  56
                                       },
                                       {
                                           "text":  "Iron Man",
                                           "points":  32
                                       },
                                       {
                                           "text":  "Hawkeye",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Black Widow",
                                           "points":  4
                                       },
                                       {
                                           "text":  "Ant-Man",
                                           "points":  2
                                       }
                                   ],
                       "prompt":  "Name a superhero who relies purely on high-tech gadgets rather than natural superpowers.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture, Movies \u0026 Famous Faces"
                   },
                   {
                       "title":  "Round 10",
                       "answers":  [
                                       {
                                           "text":  "Up",
                                           "points":  48
                                       },
                                       {
                                           "text":  "The Lion King",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Coco",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Toy Story 3",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Bambi",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name an animated movie that makes grown adults cry every time they watch it.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture, Movies \u0026 Famous Faces"
                   },
                   {
                       "title":  "Round 11",
                       "answers":  [
                                       {
                                           "text":  "Monopoly",
                                           "points":  68
                                       },
                                       {
                                           "text":  "Uno",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Scrabble",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Sorry!",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Risk",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name a classic board game that has caused bitter arguments during family game night.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture, Movies \u0026 Famous Faces"
                   },
                   {
                       "title":  "Round 12",
                       "answers":  [
                                       {
                                           "text":  "Godzilla",
                                           "points":  44
                                       },
                                       {
                                           "text":  "Frankenstein\u0027s Monster",
                                           "points":  26
                                       },
                                       {
                                           "text":  "King Kong",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Count Dracula",
                                           "points":  7
                                       },
                                       {
                                           "text":  "The Mummy",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name a classic movie monster that would look ridiculous wearing sneakers.",
                       "multiplier":  1,
                       "theme":  "📺 Pop Culture, Movies \u0026 Famous Faces"
                   },
                   {
                       "title":  "Round 13",
                       "answers":  [
                                       {
                                           "text":  "\u0027I will turn this car around right now!\u0027",
                                           "points":  46
                                       },
                                       {
                                           "text":  "\u0027Wait until your father gets home!\u0027",
                                           "points":  26
                                       },
                                       {
                                           "text":  "\u0027I am taking away your tablets and phones!\u0027",
                                           "points":  14
                                       },
                                       {
                                           "text":  "\u0027Santa is watching!\u0027",
                                           "points":  8
                                       },
                                       {
                                           "text":  "\u0027Don\u0027t make me pull over!\u0027",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a classic threat parents yell when children start acting up in the car.",
                       "multiplier":  1,
                       "theme":  "🏡 Home, Daily Quirks \u0026 Family Life"
                   },
                   {
                       "title":  "Round 14",
                       "answers":  [
                                       {
                                           "text":  "Their banana broke in half",
                                           "points":  38
                                       },
                                       {
                                           "text":  "Told they cannot wear pants on their head",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Hearing it is bedtime or naptime",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Cutting their sandwich into triangles instead of squares",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Being asked to put on shoes",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name something totally silly that will trigger a toddler\u0027s full dramatic tantrum.",
                       "multiplier":  1,
                       "theme":  "🏡 Home, Daily Quirks \u0026 Family Life"
                   },
                   {
                       "title":  "Round 15",
                       "answers":  [
                                       {
                                           "text":  "Leather bifold wallet",
                                           "points":  41
                                       },
                                       {
                                           "text":  "Pocket knife",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Leather belt",
                                           "points":  17
                                       },
                                       {
                                           "text":  "Black pocket comb",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Fleece house slippers",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name something cheap and worn-out that grandpa has been using since his wedding day.",
                       "multiplier":  1,
                       "theme":  "🏡 Home, Daily Quirks \u0026 Family Life"
                   },
                   {
                       "title":  "Round 16",
                       "answers":  [
                                       {
                                           "text":  "Fluffy down pillow",
                                           "points":  45
                                       },
                                       {
                                           "text":  "Fresh plush fleece blanket",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Big fluffy dog or golden retriever fur",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Warm stack of buttermilk pancakes",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Giant teddy bear",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something super thick and soft you just want to bury your face into.",
                       "multiplier":  2,
                       "theme":  "🏡 Home, Daily Quirks \u0026 Family Life"
                   },
                   {
                       "title":  "Round 17",
                       "answers":  [
                                       {
                                           "text":  "Sandy beach / ocean shore",
                                           "points":  57
                                       },
                                       {
                                           "text":  "Inside your own living room",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Swimming pool patio deck",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Yoga studio / dojo mat",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Locker room / sauna",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name a place where it is totally acceptable to be walking around completely barefoot.",
                       "multiplier":  2,
                       "theme":  "🏡 Home, Daily Quirks \u0026 Family Life"
                   },
                   {
                       "title":  "Round 18",
                       "answers":  [
                                       {
                                           "text":  "Deep cleaning the bathrooms \u0026 toilets",
                                           "points":  48
                                       },
                                       {
                                           "text":  "Scrubbing the inside of the oven",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Folding and putting away piles of laundry",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Mowing and weeding the entire lawn",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Washing a mountain of crusted dishes",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a chore you would gladly pay someone  cash to do for you right now.",
                       "multiplier":  2,
                       "theme":  "🏡 Home, Daily Quirks \u0026 Family Life"
                   },
                   {
                       "title":  "Round 19",
                       "answers":  [
                                       {
                                           "text":  "Registration and insurance documents",
                                           "points":  53
                                       },
                                       {
                                           "text":  "Fast-food napkins and wet wipes",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Tire pressure gauge",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Emergency flashlight",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Roll of breath mints / gum",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name something you keep tucked inside your car\u0027s glove compartment that definitely is not gloves.",
                       "multiplier":  2,
                       "theme":  "🏡 Home, Daily Quirks \u0026 Family Life"
                   },
                   {
                       "title":  "Round 20",
                       "answers":  [
                                       {
                                           "text":  "Front door deadbolt",
                                           "points":  64
                                       },
                                       {
                                           "text":  "Back patio sliding glass door",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Car doors parked outside",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Windows",
                                           "points":  4
                                       },
                                       {
                                           "text":  "Garage door",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name something you always double-check is locked before turning off the lights to go to sleep.",
                       "multiplier":  2,
                       "theme":  "🏡 Home, Daily Quirks \u0026 Family Life"
                   },
                   {
                       "title":  "Round 21",
                       "answers":  [
                                       {
                                           "text":  "Christmas presents \u0026 birthday gifts",
                                           "points":  52
                                       },
                                       {
                                           "text":  "Secret stash of chocolate and candy",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Video game controllers and tablets",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Sentimental fragile heirlooms",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Important family documents",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something parents hide on the top closet shelf so kids cannot get to it.",
                       "multiplier":  2,
                       "theme":  "🏡 Home, Daily Quirks \u0026 Family Life"
                   },
                   {
                       "title":  "Round 22",
                       "answers":  [
                                       {
                                           "text":  "Squeaky wooden floorboard or stair",
                                           "points":  58
                                       },
                                       {
                                           "text":  "Suction seal on the refrigerator door",
                                           "points":  23
                                       },
                                       {
                                           "text":  "Barking family pet",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Microwave timer beep",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Crinkly chip bag",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name something in your house that makes a distinct noise whenever someone tries to sneak a midnight snack.",
                       "multiplier":  2,
                       "theme":  "🏡 Home, Daily Quirks \u0026 Family Life"
                   },
                   {
                       "title":  "Round 23",
                       "answers":  [
                                       {
                                           "text":  "Bear",
                                           "points":  44
                                       },
                                       {
                                           "text":  "Walrus",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Sloth",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Koala",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Hippopotamus",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name an animal a wife might jokingly compare her husband to when he falls asleep watching football on the couch.",
                       "multiplier":  2,
                       "theme":  "🏡 Home, Daily Quirks \u0026 Family Life"
                   },
                   {
                       "title":  "Round 24",
                       "answers":  [
                                       {
                                           "text":  "Hair straightener or curling iron",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Clothes iron",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Coffee maker or electric kettle",
                                           "points":  13
                                       },
                                       {
                                           "text":  "Stove or oven burner",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Space heater",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something people constantly panic about leaving turned on or plugged in when leaving home.",
                       "multiplier":  2,
                       "theme":  "🏡 Home, Daily Quirks \u0026 Family Life"
                   },
                   {
                       "title":  "Round 25",
                       "answers":  [
                                       {
                                           "text":  "Smartphones, iPads \u0026 apps",
                                           "points":  54
                                       },
                                       {
                                           "text":  "Video games (Roblox, Minecraft, Fortnite)",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Fixing home Wi-Fi and streaming devices",
                                           "points":  13
                                       },
                                       {
                                           "text":  "Modern slang and memes",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Artificial Intelligence / ChatGPT",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something modern kids understand way faster and better than their grandparents.",
                       "multiplier":  2,
                       "theme":  "🏫 School, Sports \u0026 Modern Tech"
                   },
                   {
                       "title":  "Round 26",
                       "answers":  [
                                       {
                                           "text":  "Golf",
                                           "points":  56
                                       },
                                       {
                                           "text":  "Tennis",
                                           "points":  31
                                       },
                                       {
                                           "text":  "Chess",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Archery / Shooting",
                                           "points":  4
                                       },
                                       {
                                           "text":  "Billiards / Snooker",
                                           "points":  2
                                       }
                                   ],
                       "prompt":  "Name a sport where the spectators are required to stay completely silent during play.",
                       "multiplier":  2,
                       "theme":  "🏫 School, Sports \u0026 Modern Tech"
                   },
                   {
                       "title":  "Round 27",
                       "answers":  [
                                       {
                                           "text":  "Talking while muted / \u0027You are on mute!\u0027",
                                           "points":  42
                                       },
                                       {
                                           "text":  "Loudly crunching snacks on mic",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Loud barking dog or siren in background",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Clearly multitasking on their phone",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Heavy breathing directly into the microphone",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name an annoying thing people do during a remote video conference call.",
                       "multiplier":  2,
                       "theme":  "🏫 School, Sports \u0026 Modern Tech"
                   },
                   {
                       "title":  "Round 28",
                       "answers":  [
                                       {
                                           "text":  "\u0027...performing surgery on a human\u0027",
                                           "points":  44
                                       },
                                       {
                                           "text":  "\u0027...flying a passenger plane\u0027",
                                           "points":  28
                                       },
                                       {
                                           "text":  "\u0027...doing a permanent tattoo\u0027",
                                           "points":  14
                                       },
                                       {
                                           "text":  "\u0027...cutting someone\u0027s hair\u0027",
                                           "points":  8
                                       },
                                       {
                                           "text":  "\u0027...driving a school bus\u0027",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a phrase starting with \u0027I have never done this before\u0027 that would terrify you to hear from a professional.",
                       "multiplier":  2,
                       "theme":  "🏫 School, Sports \u0026 Modern Tech"
                   },
                   {
                       "title":  "Round 29",
                       "answers":  [
                                       {
                                           "text":  "Ostrich",
                                           "points":  76
                                       },
                                       {
                                           "text":  "Emu",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Emperor Penguin",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Canada Goose",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name an animal that is famous for laying enormous eggs.",
                       "multiplier":  2,
                       "theme":  "🏫 School, Sports \u0026 Modern Tech"
                   },
                   {
                       "title":  "Round 30",
                       "answers":  [
                                       {
                                           "text":  "Taking showers / baths",
                                           "points":  58
                                       },
                                       {
                                           "text":  "Brushing and flossing teeth",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Washing and styling hair",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Clipping toenails",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Shaving body hair",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "If humans had self-cleaning bodies like cats, name a daily task we could permanently eliminate.",
                       "multiplier":  2,
                       "theme":  "🏫 School, Sports \u0026 Modern Tech"
                   },
                   {
                       "title":  "Round 31",
                       "answers":  [
                                       {
                                           "text":  "An \u0027URGENT\u0027 email from your boss or teacher",
                                           "points":  48
                                       },
                                       {
                                           "text":  "A calendar invitation for an 8:00 AM meeting",
                                           "points":  24
                                       },
                                       {
                                           "text":  "A sudden bill or tuition reminder",
                                           "points":  15
                                       },
                                       {
                                           "text":  "A massive 50-person reply-all thread",
                                           "points":  8
                                       },
                                       {
                                           "text":  "A computer system outage notice",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something you dread seeing in your email inbox on a Monday morning.",
                       "multiplier":  3,
                       "theme":  "🏫 School, Sports \u0026 Modern Tech"
                   },
                   {
                       "title":  "Round 32",
                       "answers":  [
                                       {
                                           "text":  "Tuba / Sousaphone",
                                           "points":  59
                                       },
                                       {
                                           "text":  "Bass Drum",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Marching Snare / Quad Drums",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Trombone",
                                           "points":  4
                                       },
                                       {
                                           "text":  "Baritone Horn",
                                           "points":  2
                                       }
                                   ],
                       "prompt":  "Name an instrument in a high school marching band that looks exhausting to carry in a parade.",
                       "multiplier":  3,
                       "theme":  "🏫 School, Sports \u0026 Modern Tech"
                   },
                   {
                       "title":  "Round 33",
                       "answers":  [
                                       {
                                           "text":  "Baseball / Softball",
                                           "points":  54
                                       },
                                       {
                                           "text":  "Beach Volleyball",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Road Cycling / Biking",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Golf",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Snowboarding / Skiing",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name a sport where an athlete frequently wears sunglasses during competition.",
                       "multiplier":  3,
                       "theme":  "🏫 School, Sports \u0026 Modern Tech"
                   },
                   {
                       "title":  "Round 34",
                       "answers":  [
                                       {
                                           "text":  "Whisper / talk to their friends",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Throw spitballs or paper airplanes",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Check their hidden cell phone",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Make silly faces / gestures",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Sneak a bite of a snack",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something kids do the instant the teacher turns their back to write on the chalkboard.",
                       "multiplier":  3,
                       "theme":  "🏫 School, Sports \u0026 Modern Tech"
                   },
                   {
                       "title":  "Round 35",
                       "answers":  [
                                       {
                                           "text":  "Math / Algebra",
                                           "points":  58
                                       },
                                       {
                                           "text":  "Physical Education / Gym",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Science / Chemistry",
                                           "points":  12
                                       },
                                       {
                                           "text":  "History / Social Studies",
                                           "points":  7
                                       },
                                       {
                                           "text":  "English / Spelling",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name a subject in elementary or middle school where students either love it or dread it with no in-between.",
                       "multiplier":  3,
                       "theme":  "🏫 School, Sports \u0026 Modern Tech"
                   },
                   {
                       "title":  "Round 36",
                       "answers":  [
                                       {
                                           "text":  "Forgot to plug it in overnight",
                                           "points":  48
                                       },
                                       {
                                           "text":  "Screen brightness turned all the way up",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Endlessly scrolling TikTok / Instagram",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Playing graphics-heavy mobile games",
                                           "points":  8
                                       },
                                       {
                                           "text":  "GPS navigation running in background",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name a reason your phone battery mysteriously drained down to 5% before lunchtime.",
                       "multiplier":  3,
                       "theme":  "🏫 School, Sports \u0026 Modern Tech"
                   },
                   {
                       "title":  "Round 37",
                       "answers":  [
                                       {
                                           "text":  "Canned jellied cranberry sauce",
                                           "points":  41
                                       },
                                       {
                                           "text":  "Fruitcake",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Green bean casserole",
                                           "points":  17
                                       },
                                       {
                                           "text":  "Jell-O salad with shredded carrots",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Mashed turnips / rutabaga",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a traditional Thanksgiving dinner side dish that sits on the table largely untouched.",
                       "multiplier":  3,
                       "theme":  "🍔 Food, Snacks \u0026 Diner Favorites"
                   },
                   {
                       "title":  "Round 38",
                       "answers":  [
                                       {
                                           "text":  "Stack of pancakes or Belgian waffles",
                                           "points":  42
                                       },
                                       {
                                           "text":  "Bacon cheeseburger and fries",
                                           "points":  31
                                       },
                                       {
                                           "text":  "Hot coffee with cream",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Thick chocolate milkshake",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Eggs, bacon and hashbrowns platter",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something you might order at a classic 24-hour diner when you are starving.",
                       "multiplier":  3,
                       "theme":  "🍔 Food, Snacks \u0026 Diner Favorites"
                   },
                   {
                       "title":  "Round 39",
                       "answers":  [
                                       {
                                           "text":  "Unpopped popcorn kernel",
                                           "points":  62
                                       },
                                       {
                                           "text":  "Hard crusty artisan sourdough bread",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Hidden olive pit or cherry pit",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Jawbreaker candy or solid lollipop",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Ice cube",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name an innocent food that causes major tooth panic if you crunch down on it unexpectedly.",
                       "multiplier":  3,
                       "theme":  "🍔 Food, Snacks \u0026 Diner Favorites"
                   },
                   {
                       "title":  "Round 40",
                       "answers":  [
                                       {
                                           "text":  "Pineapple",
                                           "points":  72
                                       },
                                       {
                                           "text":  "Anchovies",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Mushrooms",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Jalapeño peppers",
                                           "points":  3
                                       },
                                       {
                                           "text":  "Black olives",
                                           "points":  2
                                       }
                                   ],
                       "prompt":  "Name a popular pizza topping that sparks fiery debates among family members.",
                       "multiplier":  3,
                       "theme":  "🍔 Food, Snacks \u0026 Diner Favorites"
                   },
                   {
                       "title":  "Round 41",
                       "answers":  [
                                       {
                                           "text":  "Chopped walnuts or peanuts",
                                           "points":  42
                                       },
                                       {
                                           "text":  "Hot fudge syrup",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Rainbow sprinkles",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Marshmallow cream",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Maraschino cherry",
                                           "points":  9
                                       }
                                   ],
                       "prompt":  "Name an ice cream sundae topping that totally ruins the treat if you do not like it.",
                       "multiplier":  3,
                       "theme":  "🍔 Food, Snacks \u0026 Diner Favorites"
                   },
                   {
                       "title":  "Round 42",
                       "answers":  [
                                       {
                                           "text":  "Aluminum foil or metal fork/spoon",
                                           "points":  58
                                       },
                                       {
                                           "text":  "Whole raw egg in its shell",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Cell phone / electronic gadget",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Styrofoam take-out container",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Hot chili peppers",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something you should never, under any circumstances, place inside a microwave.",
                       "multiplier":  3,
                       "theme":  "🍔 Food, Snacks \u0026 Diner Favorites"
                   },
                   {
                       "title":  "Round 43",
                       "answers":  [
                                       {
                                           "text":  "Tuna salad sandwich",
                                           "points":  48
                                       },
                                       {
                                           "text":  "Egg salad sandwich",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Pastrami with raw sliced onions",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Garlic roast beef sub",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Liverwurst sandwich",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name a lunch sandwich that is delicious but leaves you with pungent breath for hours.",
                       "multiplier":  3,
                       "theme":  "🍔 Food, Snacks \u0026 Diner Favorites"
                   },
                   {
                       "title":  "Round 44",
                       "answers":  [
                                       {
                                           "text":  "Warm buttered popcorn",
                                           "points":  62
                                       },
                                       {
                                           "text":  "Box of chocolate candy / M\u0026Ms",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Twizzlers or Red Vines licorice",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Nachos with warm melted cheese",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Sour Patch Kids",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name a movie theater snack you simply cannot resist even after eating a big meal.",
                       "multiplier":  3,
                       "theme":  "🍔 Food, Snacks \u0026 Diner Favorites"
                   },
                   {
                       "title":  "Round 45",
                       "answers":  [
                                       {
                                           "text":  "Hot chicken noodle soup",
                                           "points":  68
                                       },
                                       {
                                           "text":  "Warm cup of herbal tea with honey",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Buttered toast or saltine crackers",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Lemon-lime ginger ale",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Mashed potatoes",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name a food you eat when you are feeling under the weather that makes you feel instantly better.",
                       "multiplier":  3,
                       "theme":  "🍔 Food, Snacks \u0026 Diner Favorites"
                   },
                   {
                       "title":  "Round 46",
                       "answers":  [
                                       {
                                           "text":  "Sizzling bacon",
                                           "points":  61
                                       },
                                       {
                                           "text":  "Freshly brewed coffee",
                                           "points":  23
                                       },
                                       {
                                           "text":  "Pancakes or waffles with maple syrup",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Warm cinnamon rolls",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Golden buttered toast",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name a breakfast food that smells so delicious it wakes you right up.",
                       "multiplier":  3,
                       "theme":  "🍔 Food, Snacks \u0026 Diner Favorites"
                   },
                   {
                       "title":  "Round 47",
                       "answers":  [
                                       {
                                           "text":  "Potato chips or Doritos",
                                           "points":  54
                                       },
                                       {
                                           "text":  "Crisp raw carrots or celery",
                                           "points":  23
                                       },
                                       {
                                           "text":  "Crispy apple",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Popcorn",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Hard pretzels",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name a food that makes an embarrassing loud crunching noise when eating in a quiet room.",
                       "multiplier":  3,
                       "theme":  "🍔 Food, Snacks \u0026 Diner Favorites"
                   },
                   {
                       "title":  "Round 48",
                       "answers":  [
                                       {
                                           "text":  "Warm chocolate brownies",
                                           "points":  44
                                       },
                                       {
                                           "text":  "Fresh chocolate chip cookies",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Homemade apple pie",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Banana pudding",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Strawberry shortcake",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a dessert that disappeared in 10 minutes at the family reunion.",
                       "multiplier":  3,
                       "theme":  "🍔 Food, Snacks \u0026 Diner Favorites"
                   },
                   {
                       "title":  "Round 49",
                       "answers":  [
                                       {
                                           "text":  "Family wedding celebration",
                                           "points":  43
                                       },
                                       {
                                           "text":  "Beach vacation or theme park trip",
                                           "points":  27
                                       },
                                       {
                                           "text":  "Milestone birthday party",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Annual holiday family portrait",
                                           "points":  9
                                       },
                                       {
                                           "text":  "New Year\u0027s Eve gathering",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name an occasion where you take 200 photos on your phone and only end up keeping three.",
                       "multiplier":  3,
                       "theme":  "🎉 Holidays, Travel \u0026 Hilarious Antics"
                   },
                   {
                       "title":  "Round 50",
                       "answers":  [
                                       {
                                           "text":  "Practice clapping fast and shouting \u0027Good answer!\u0027",
                                           "points":  45
                                       },
                                       {
                                           "text":  "Binge-watch old episodes and Steve Harvey clips",
                                           "points":  25
                                       },
                                       {
                                           "text":  "Coordinate stylish matching outfits",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Practice hitting the buzzer on a sofa cushion",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Say an enthusiastic family prayer",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name something you do the night before taping Family Feud to ensure your family wins.",
                       "multiplier":  3,
                       "theme":  "🎉 Holidays, Travel \u0026 Hilarious Antics"
                   },
                   {
                       "title":  "Round 51",
                       "answers":  [
                                       {
                                           "text":  "\u0027It is just water weight or bloating\u0027",
                                           "points":  42
                                       },
                                       {
                                           "text":  "\u0027My boots and jeans weigh at least 8 pounds\u0027",
                                           "points":  28
                                       },
                                       {
                                           "text":  "\u0027The bathroom scale is clearly miscalibrated\u0027",
                                           "points":  16
                                       },
                                       {
                                           "text":  "\u0027It is all dense muscle mass\u0027",
                                           "points":  9
                                       },
                                       {
                                           "text":  "\u0027I just ate a huge heavy dinner\u0027",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name an excuse people give when stepping on the scale and noticing they gained a few pounds.",
                       "multiplier":  3,
                       "theme":  "🎉 Holidays, Travel \u0026 Hilarious Antics"
                   },
                   {
                       "title":  "Round 52",
                       "answers":  [
                                       {
                                           "text":  "Toilet paper and paper towels",
                                           "points":  54
                                       },
                                       {
                                           "text":  "Bottled water",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Bread and milk",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Batteries and flashlights",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Canned soups and chili",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something people hoard in huge quantities when they hear a big winter blizzard is coming.",
                       "multiplier":  3,
                       "theme":  "🎉 Holidays, Travel \u0026 Hilarious Antics"
                   },
                   {
                       "title":  "Round 53",
                       "answers":  [
                                       {
                                           "text":  "Singing passionately at the top of their lungs",
                                           "points":  52
                                       },
                                       {
                                           "text":  "Enthusiastic steering-wheel drumming and dancing",
                                           "points":  27
                                       },
                                       {
                                           "text":  "Unabashedly picking their nose",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Applying complete makeup in the rearview mirror",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Animatedly talking and gesturing to themselves",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something drivers do when stuck in highway traffic that makes other motorists laugh.",
                       "multiplier":  3,
                       "theme":  "🎉 Holidays, Travel \u0026 Hilarious Antics"
                   },
                   {
                       "title":  "Round 54",
                       "answers":  [
                                       {
                                           "text":  "Aerosol spray can",
                                           "points":  58
                                       },
                                       {
                                           "text":  "Household batteries",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Glass bottle",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Fireworks or firecrackers",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Cell phone",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name an item you should never, ever throw into an outdoor campfire.",
                       "multiplier":  3,
                       "theme":  "🎉 Holidays, Travel \u0026 Hilarious Antics"
                   },
                   {
                       "title":  "Round 55",
                       "answers":  [
                                       {
                                           "text":  "Bottle of plain drinking water",
                                           "points":  64
                                       },
                                       {
                                           "text":  "Cold deli sandwich or snack box",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Memory foam neck pillow",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Phone charging cable or headphones",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Glossy magazine",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name something you purchase at an airport terminal that costs triple what it should.",
                       "multiplier":  3,
                       "theme":  "🎉 Holidays, Travel \u0026 Hilarious Antics"
                   },
                   {
                       "title":  "Round 56",
                       "answers":  [
                                       {
                                           "text":  "Three-toed sloth",
                                           "points":  65
                                       },
                                       {
                                           "text":  "Giant tortoise or turtle",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Garden snail",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Koala",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name an animal that moves so comically slow you can easily outwalk it.",
                       "multiplier":  3,
                       "theme":  "🎉 Holidays, Travel \u0026 Hilarious Antics"
                   },
                   {
                       "title":  "Round 57",
                       "answers":  [
                                       {
                                           "text":  "Stuck in unexpected bumper-to-bumper traffic",
                                           "points":  62
                                       },
                                       {
                                           "text":  "Alarm did not go off or overslept",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Flat tire or car would not start",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Child was feeling sick",
                                           "points":  4
                                       },
                                       {
                                           "text":  "Spilled coffee all over clothes",
                                           "points":  2
                                       }
                                   ],
                       "prompt":  "Name a classic excuse for arriving 30 minutes late to work or school.",
                       "multiplier":  3,
                       "theme":  "🎉 Holidays, Travel \u0026 Hilarious Antics"
                   },
                   {
                       "title":  "Round 58",
                       "answers":  [
                                       {
                                           "text":  "Driver texting and sitting at a green light",
                                           "points":  51
                                       },
                                       {
                                           "text":  "Car recklessly cutting you off",
                                           "points":  27
                                       },
                                       {
                                           "text":  "Warning a pedestrian or animal",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Friendly honk to greet a neighbor",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Car backing out without looking",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name a reason you would aggressively honk your car horn at another vehicle.",
                       "multiplier":  3,
                       "theme":  "🎉 Holidays, Travel \u0026 Hilarious Antics"
                   },
                   {
                       "title":  "Round 59",
                       "answers":  [
                                       {
                                           "text":  "Television remote control",
                                           "points":  48
                                       },
                                       {
                                           "text":  "Loose coins and spare change",
                                           "points":  27
                                       },
                                       {
                                           "text":  "Cell phone",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Set of house or car keys",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Hair ties, bobby pins or pens",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something people constantly lose beneath the cushions of their living room couch.",
                       "multiplier":  3,
                       "theme":  "🎉 Holidays, Travel \u0026 Hilarious Antics"
                   },
                   {
                       "title":  "Round 60",
                       "answers":  [
                                       {
                                           "text":  "Shocking text message with unbelievable gossip",
                                           "points":  44
                                       },
                                       {
                                           "text":  "Bank alert indicating a low checking balance",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Breaking news alert pop-up",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Realized what time it is and they are very late",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Saw an unflattering photo they were tagged in",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name a reason a person might look down at their phone in public and visibly gasp in shock.",
                       "multiplier":  3,
                       "theme":  "🎉 Holidays, Travel \u0026 Hilarious Antics"
                   }
               ],
    "fastMoney":  [
                      {
                          "hint":  "3 slices (42), 2 slices (28), 4 slices (16), 5+ slices (9), 1 slice (5)",
                          "prompt":  "How many slices of pizza can you eat in one sitting before you feel guilty?"
                      },
                      {
                          "hint":  "Nurse / Doctor (54), Seamstress / Tailor (24), Acupuncturist (12), Tattoo artist (7), Phlebotomist (3)",
                          "prompt":  "Name a profession where people use needles every single day."
                      },
                      {
                          "hint":  "Mega yachts (38), Mansions / Estates (31), Private jets (19), Exotic sports cars (8), Private islands (4)",
                          "prompt":  "Name something the world\u0027s richest person probably owns two of."
                      },
                      {
                          "hint":  "Donut (56), Basketball (24), Cookie / Oreo (14), Chicken nugget (4), French fry (2)",
                          "prompt":  "Name something you dunk."
                      },
                      {
                          "hint":  "King (62), Queen (36), Knight (2)",
                          "prompt":  "Name a royal piece on a chessboard."
                      },
                      {
                          "hint":  "Biceps / Arms (55), Chest / Pecs (26), Shoulders / Traps (11), Thighs / Calves (5), Neck (3)",
                          "prompt":  "Name a body part a cartoon bodybuilder would have exaggeratedly huge."
                      },
                      {
                          "hint":  "10 nuggets (44), 6 nuggets (26), 20 nuggets (18), 12 nuggets (8), 8 nuggets (4)",
                          "prompt":  "How many chicken nuggets make a satisfying dinner meal?"
                      },
                      {
                          "hint":  "Mom / Mother (43), Spouse / Partner (26), Child / Grandchild (18), Best friend (9), Pet / Dog (4)",
                          "prompt":  "Name someone in your life whose voice instantly puts a smile on your face."
                      },
                      {
                          "hint":  "Concert / Music festival (52), NBA basketball game (28), Broadway theater show (11), Magic show (6), Circus / Acrobatics (3)",
                          "prompt":  "Name a live entertainment event where you definitely want front-row seats."
                      },
                      {
                          "hint":  "Tokyo (68), New York City (22), San Francisco (5), Los Angeles (3), London (2)",
                          "prompt":  "Name a world city Godzilla would probably stomp through first."
                      },
                      {
                          "hint":  "King-size bedroom suite (38), Full chef\u0027s kitchen \u0026 fridge (26), Giant flat-screen TV (18), Luxury tile shower (12), Electric fireplace (6)",
                          "prompt":  "Name an impressive luxury feature you\u0027d expect to find in a ,000 RV."
                      },
                      {
                          "hint":  "Algebra / 8th or 9th grade (44), Calculus / 12th grade (26), 6th grade fractions (16), Geometry / 10th grade (9), College college algebra (5)",
                          "prompt":  "At what grade in school did math become completely impossible for you?"
                      },
                      {
                          "hint":  "October (48), November (28), December (14), January (7), September (3)",
                          "prompt":  "Name the single best month of the year for wearing cozy sweaters."
                      },
                      {
                          "hint":  "Money / Cash loan (62), Favorite book (14), Jacket / Designer clothes (11), Power tools / lawn mower (8), Car (5)",
                          "prompt":  "Name something you shouldn\u0027t lend to a friend unless you\u0027re okay never seeing it again."
                      },
                      {
                          "hint":  "5 minutes (46), 2 minutes (29), 1 minute (15), 10 minutes (7), 30 seconds (3)",
                          "prompt":  "How many minutes can you listen to someone brag before you tune them out?"
                      },
                      {
                          "hint":  "Monopoly (58), Risk (22), Scrabble (11), The Game of Life (6), Clue (3)",
                          "prompt":  "Name a classic board game that takes all afternoon to play."
                      },
                      {
                          "hint":  "Acorns (58), Dry leaves (24), Fallen twigs / branches (10), Pinecones (5), Wild mushrooms (3)",
                          "prompt":  "Name something you might find lying on the ground under a large oak tree."
                      },
                      {
                          "hint":  "Mercedes-Benz (39), Porsche (27), Rolls-Royce (18), Ferrari / Lamborghini (11), Tesla (5)",
                          "prompt":  "Name a luxury car brand you see parked in every driveway in Beverly Hills."
                      },
                      {
                          "hint":  "Zelda (51), The Fall (22), Sleepy Hollow (14), The Hidden Temple (8), Korra (5)",
                          "prompt":  "Complete this famous gaming or movie phrase: \u0027Legend of _____\u0027."
                      },
                      {
                          "hint":  "Tuna salad sandwich (48), Egg salad sandwich (24), Pastrami with raw onions (16), Garlic roast beef (8), Liverwurst (4)",
                          "prompt":  "Name a lunch sandwich that is delicious but gives you terrible dragon breath."
                      },
                      {
                          "hint":  "Cleaning their messy bedroom (52), Mowing the lawn (24), Taking out the trash (12), Doing their laundry (8), Emptying dishwasher (4)",
                          "prompt":  "Name a chore teenagers complain about having to do every single Saturday morning."
                      },
                      {
                          "hint":  "Ostrich (78), Emu (14), Emperor Penguin (5), Canada Goose (3)",
                          "prompt":  "Name a bird that is famous for having enormous eggs."
                      },
                      {
                          "hint":  "3 pairs (41), 2 pairs (32), 4 pairs (15), 5 pairs (8), 1 pair (4)",
                          "prompt":  "How many pairs of shoes do you actually wear on a regular weekly basis?"
                      },
                      {
                          "hint":  "Pancakes / Waffles (42), Cheeseburger \u0026 french fries (31), Hot coffee (14), Chocolate milkshake (8), Bacon \u0026 eggs (5)",
                          "prompt":  "Name something you might order at a 24-hour diner at midnight."
                      },
                      {
                          "hint":  "Tuba / Sousaphone (59), Bass drum (24), Snare quad drums (11), Trombone (4), Baritone horn (2)",
                          "prompt":  "Name an instrument in a high school marching band that looks painfully heavy to carry."
                      },
                      {
                          "hint":  "Baseball / Outfield (54), Beach volleyball (24), Road cycling / Biking (12), Golf (7), Snowboarding / Skiing (3)",
                          "prompt":  "Name a sport where an athlete might wear sunglasses during competition."
                      },
                      {
                          "hint":  "TV remote control (48), Loose coins / Change (27), Cell phone (14), Car keys (7), Hair ties / pens (4)",
                          "prompt":  "Name something people constantly lose behind their living room couch cushions."
                      },
                      {
                          "hint":  "15 minutes (44), 10 minutes (33), 20 minutes (15), 5 minutes (5), 30 minutes (3)",
                          "prompt":  "How many minutes is an ideal, refreshing hot shower?"
                      },
                      {
                          "hint":  "Driver texting at green light (51), Car cutting you off abruptly (27), Warning a pedestrian or animal (11), Saying hi to a neighbor (7), Road rage (4)",
                          "prompt":  "Name a reason you would aggressively honk the horn on your car."
                      },
                      {
                          "hint":  "Stuck in bumper-to-bumper traffic (62), Alarm didn\u0027t go off / overslept (22), Flat tire / car trouble (10), Child was sick (4), Spilled coffee all over clothes (2)",
                          "prompt":  "Name a classic excuse for arriving 30 minutes late to work or school."
                      },
                      {
                          "hint":  "Chopped walnuts / nuts (42), Hot fudge (21), Rainbow sprinkles (16), Marshmallow fluff (12), Maraschino cherry (9)",
                          "prompt":  "Name an ice cream topping that completely ruins the sundae if you dislike it."
                      },
                      {
                          "hint":  "Aerosol spray can (58), Household batteries (21), Glass bottle (11), Fireworks (7), Cell phone (3)",
                          "prompt":  "Name an item you should never, ever toss into a raging campfire."
                      },
                      {
                          "hint":  "Fidget / tap fingers on table (46), Sweat profusely / wipe palms (24), Talk too fast with hands (16), Clench fists together (9), Bite fingernails (5)",
                          "prompt":  "Name something people nervously do with their hands during a high-stakes job interview."
                      },
                      {
                          "hint":  "Pineapple (72), Anchovies (16), Mushrooms (7), Jalapeño peppers (3), Black olives (2)",
                          "prompt":  "Name a popular pizza topping that sparks heated arguments among friends."
                      },
                      {
                          "hint":  "6 hours (45), 7 hours (31), 5 hours (14), 8 hours (8), 4 hours (2)",
                          "prompt":  "How many hours of sleep do you realistically get on an average weeknight?"
                      },
                      {
                          "hint":  "Refrigerator / freezer (48), Microwave oven (24), Coffee maker / Keurig (16), Air fryer (8), Dishwasher (4)",
                          "prompt":  "Name a kitchen appliance you would be utterly devastated without for two days."
                      },
                      {
                          "hint":  "Plastic bottle of water (64), Cold deli sandwich / snack box (18), Memory foam neck pillow (10), Charging cord / headphones (5), Magazine (3)",
                          "prompt":  "Name something you purchase at an airport terminal that costs triple what it should."
                      },
                      {
                          "hint":  "Sloth (65), Turtle / Tortoise (22), Garden snail (9), Koala (4)",
                          "prompt":  "Name an animal that moves so painfully slow it is almost comical."
                      },
                      {
                          "hint":  "Buttered popcorn (62), Chocolate candy / M\u0026Ms (18), Twizzlers / Red Vines (11), Nachos with melted cheese (6), Sour Patch Kids (3)",
                          "prompt":  "Name a movie theater snack you cannot resist even if you just ate dinner."
                      },
                      {
                          "hint":  "Shocking text message / juicy news (44), Low bank balance notification (28), Breaking news bulletin (16), Realized they are terribly late (8), Tagged in an awful photo (4)",
                          "prompt":  "Name a reason a person might look down at their phone in public and visibly gasp."
                      }
                  ]
}
  }
  ,
  {
    id: "gandhi-samaj-2026.json",
    label: "🪔 Gandhi Samaj 2026 (43 Rounds • 6 Fast Money Sets)",
    file: "./decks/gandhi-samaj-2026.json",
    data: {
    "gameTitle":  "Gandhi Samaj Diwali Feud 2026",
    "gameIcon":  "🪔",
    "deckName":  "Gandhi Samaj 2026",
    "teamPresets":  [
                        [
                            "Baa \u0026 Bapuji All-Stars",
                            "Next-Gen Cousins"
                        ],
                        [
                            "Team Fafda",
                            "Team Jalebi"
                        ],
                        [
                            "Team Dhokla",
                            "Team Thepla"
                        ],
                        [
                            "Parents \u0026 Kaka-Kakis",
                            "Kids \u0026 ABCD Cousins"
                        ],
                        [
                            "Team Patola",
                            "Team Bandhani"
                        ],
                        [
                            "East Coast Family",
                            "West Coast Family"
                        ]
                    ],
    "rounds":  [
                   {
                       "title":  "Round 1",
                       "answers":  [
                                       {
                                           "text":  "Cash envelopes from elders (Sagan/Chandla)",
                                           "points":  44
                                       },
                                       {
                                           "text":  "Bursting firecrackers / Sparklers",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Eating unlimited mithai \u0026 snacks",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Wearing brand new clothes",
                                           "points":  9
                                       },
                                       {
                                           "text":  "No school / holiday break",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name something kids look forward to the most during Diwali.",
                       "multiplier":  1,
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions"
                   },
                   {
                       "title":  "Round 2",
                       "answers":  [
                                       {
                                           "text":  "Diyas / Ghee lamps",
                                           "points":  42
                                       },
                                       {
                                           "text":  "Gold/Silver coins (Laxmi coin)",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Kanku \u0026 Chokha (Kumkum \u0026 Rice)",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Fresh marigold flowers",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Mithai / Prasad (Kaju Katli/Peda)",
                                           "points":  8
                                       }
                                   ],
                       "prompt":  "Name something you will always find on the Diwali Laxmi Puja thali.",
                       "multiplier":  1,
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions"
                   },
                   {
                       "title":  "Round 3",
                       "answers":  [
                                       {
                                           "text":  "Chakri",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Mathia",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Ghooghra / Gujiya",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Chivda / Chevdo",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Shakarpara",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name a classic Gujarati homemade snack (nashto) moms make in bulk before Diwali.",
                       "multiplier":  1,
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions"
                   },
                   {
                       "title":  "Round 4",
                       "answers":  [
                                       {
                                           "text":  "\u0027Saal Mubarak!\u0027",
                                           "points":  58
                                       },
                                       {
                                           "text":  "\u0027Happy New Year!\u0027",
                                           "points":  22
                                       },
                                       {
                                           "text":  "\u0027Kem Chho? Majama?\u0027",
                                           "points":  11
                                       },
                                       {
                                           "text":  "\u0027Jai Shri Krishna!\u0027",
                                           "points":  6
                                       },
                                       {
                                           "text":  "\u0027Pranam / Touching feet\u0027",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "What is the very first thing Gujarati family members say to each other on Beshtu Varas (New Year\u0027s Day)?",
                       "multiplier":  1,
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions"
                   },
                   {
                       "title":  "Round 5",
                       "answers":  [
                                       {
                                           "text":  "Sparklers (Phooljhadi)",
                                           "points":  56
                                       },
                                       {
                                           "text":  "Ground Spinners (Chakri / Zameen Chakkar)",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Pop-pops / Snappers",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Flower Pots (Anar)",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Snake tablets",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name a Diwali firecracker that is always designated as \u0027safe for the little kids\u0027.",
                       "multiplier":  1,
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions"
                   },
                   {
                       "title":  "Round 6",
                       "answers":  [
                                       {
                                           "text":  "Deep cleaning every closet \u0026 corner",
                                           "points":  55
                                       },
                                       {
                                           "text":  "Making 10 different dabbas of snacks",
                                           "points":  23
                                       },
                                       {
                                           "text":  "Shopping for Indian outfits for everyone",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Hanging up outdoor lights \u0026 lanterns",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Designing intricate floor Rangoli",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something moms do two weeks before Diwali that exhausts the entire household.",
                       "multiplier":  1,
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions"
                   },
                   {
                       "title":  "Round 7",
                       "answers":  [
                                       {
                                           "text":  "Kaju Katli",
                                           "points":  45
                                       },
                                       {
                                           "text":  "Soan Papdi",
                                           "points":  31
                                       },
                                       {
                                           "text":  "Motichoor Ladoo",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Peda",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Gulab Jamun",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name a popular mithai (sweet) you receive so many boxes of that you end up regifting it.",
                       "multiplier":  1,
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions"
                   },
                   {
                       "title":  "Round 8",
                       "answers":  [
                                       {
                                           "text":  "Doctor",
                                           "points":  51
                                       },
                                       {
                                           "text":  "Crorepati / Millionaire",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Engineer",
                                           "points":  13
                                       },
                                       {
                                           "text":  "Big businessman / CEO",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Good human being",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Complete this classic Diwali blessing elders give when you touch their feet: \u0027May you become a _____\u0027",
                       "multiplier":  1,
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions"
                   },
                   {
                       "title":  "Round 9",
                       "answers":  [
                                       {
                                           "text":  "Dhokla / Khaman",
                                           "points":  48
                                       },
                                       {
                                           "text":  "Fafda (with Jalebi)",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Khandvi",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Thepla",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Patra",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name the single most iconic Gujarati farsan (snack) of all time.",
                       "multiplier":  2,
                       "theme":  "🫓 Gujarati Food, Farsan \u0026 Baa\u0027s Kitchen"
                   },
                   {
                       "title":  "Round 10",
                       "answers":  [
                                       {
                                           "text":  "Methi Thepla",
                                           "points":  58
                                       },
                                       {
                                           "text":  "Chundo or Mango Pickle",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Khakhra (various flavors)",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Sukhi Bhaji / Potato sabzi",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Shakarpara / Chevdo",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something Baa packs in a foil roll when anyone in the family is traveling.",
                       "multiplier":  2,
                       "theme":  "🫓 Gujarati Food, Farsan \u0026 Baa\u0027s Kitchen"
                   },
                   {
                       "title":  "Round 11",
                       "answers":  [
                                       {
                                           "text":  "Sugar / Jaggery (Gor)",
                                           "points":  62
                                       },
                                       {
                                           "text":  "Peanuts (Singdana)",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Lemon juice / Kokum (sourness)",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Cinnamon \u0026 Cloves",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Curry leaves (Kadi patta)",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name an ingredient non-Gujaratis are shocked to find inside a Gujarati dal.",
                       "multiplier":  2,
                       "theme":  "🫓 Gujarati Food, Farsan \u0026 Baa\u0027s Kitchen"
                   },
                   {
                       "title":  "Round 12",
                       "answers":  [
                                       {
                                           "text":  "Undhiyu (with Puri \u0026 Jalebi)",
                                           "points":  64
                                       },
                                       {
                                           "text":  "Dal Dhokli",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Khichdi \u0026 Kadhi",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Sev Tameta nu Shaak",
                                           "points":  5
                                       },
                                       {
                                           "text":  "Pav Bhaji",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name a dish that is the undisputed king of winter Sunday lunches in a Gujarati home.",
                       "multiplier":  2,
                       "theme":  "🫓 Gujarati Food, Farsan \u0026 Baa\u0027s Kitchen"
                   },
                   {
                       "title":  "Round 13",
                       "answers":  [
                                       {
                                           "text":  "Chaas (Masala Buttermilk)",
                                           "points":  68
                                       },
                                       {
                                           "text":  "Masala Chai",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Mango Ras / Keri no Ras",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Nimbu Paani",
                                           "points":  4
                                       },
                                       {
                                           "text":  "Soda / Jeera Masala",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name something every Gujarati home drinks at the end of lunch, especially in summer.",
                       "multiplier":  2,
                       "theme":  "🫓 Gujarati Food, Farsan \u0026 Baa\u0027s Kitchen"
                   },
                   {
                       "title":  "Round 14",
                       "answers":  [
                                       {
                                           "text":  "Methi (Fenugreek)",
                                           "points":  44
                                       },
                                       {
                                           "text":  "Jeera (Cumin)",
                                           "points":  25
                                       },
                                       {
                                           "text":  "Masala / Chili",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Plain / Ghee",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Pizza / Garlic",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a flavor of Khakhra you will find sitting in a Gujarati pantry.",
                       "multiplier":  2,
                       "theme":  "🫓 Gujarati Food, Farsan \u0026 Baa\u0027s Kitchen"
                   },
                   {
                       "title":  "Round 15",
                       "answers":  [
                                       {
                                           "text":  "Mohanthal",
                                           "points":  42
                                       },
                                       {
                                           "text":  "Shrikhand (Elaichi/Kesar/Mango)",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Ghari (Surati)",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Magas (Besan Ladoo)",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Doodhpak / Kheer",
                                           "points":  8
                                       }
                                   ],
                       "prompt":  "Name a sweet dish (mithai) that Gujaratis take supreme pride in making from scratch.",
                       "multiplier":  2,
                       "theme":  "🫓 Gujarati Food, Farsan \u0026 Baa\u0027s Kitchen"
                   },
                   {
                       "title":  "Round 16",
                       "answers":  [
                                       {
                                           "text":  "Desi Ghee",
                                           "points":  72
                                       },
                                       {
                                           "text":  "White Butter (Makhan)",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Jaggery (Gor)",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Chundo / Pickle masala",
                                           "points":  4
                                       },
                                       {
                                           "text":  "Salt",
                                           "points":  2
                                       }
                                   ],
                       "prompt":  "Name something Baa insists on putting an excessive amount of on hot rotli.",
                       "multiplier":  2,
                       "theme":  "🫓 Gujarati Food, Farsan \u0026 Baa\u0027s Kitchen"
                   },
                   {
                       "title":  "Round 17",
                       "answers":  [
                                       {
                                           "text":  "Falguni Pathak (anything by her)",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Sanedo (at 1:30 AM)",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Chogada (Loveyatri)",
                                           "points":  13
                                       },
                                       {
                                           "text":  "Nagada Sang Dhol",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Dholi Taro Dhol Baaje",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name a song or artist that is guaranteed to turn a polite Garba circle into pure pandemonium.",
                       "multiplier":  2,
                       "theme":  "💃 Garba, Dandiya \u0026 Navratri Madness"
                   },
                   {
                       "title":  "Round 18",
                       "answers":  [
                                       {
                                           "text":  "Getting your fingers/knuckles whacked by a stick",
                                           "points":  45
                                       },
                                       {
                                           "text":  "A dandiya stick snaps in half or flies across room",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Someone loses the rhythm / going wrong direction",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Stepping on someone\u0027s chaniya/dupatta",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Two concentric circles crash into each other",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something that inevitably goes wrong during Dandiya Raas.",
                       "multiplier":  2,
                       "theme":  "💃 Garba, Dandiya \u0026 Navratri Madness"
                   },
                   {
                       "title":  "Round 19",
                       "answers":  [
                                       {
                                           "text":  "3-Tali (Three Claps)",
                                           "points":  42
                                       },
                                       {
                                           "text":  "2-Tali (Two Claps)",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Dodhiya",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Spinning twirls (Chakkar)",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Hudo / Popat",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a classic Garba step or style that everyone tries to show off.",
                       "multiplier":  2,
                       "theme":  "💃 Garba, Dandiya \u0026 Navratri Madness"
                   },
                   {
                       "title":  "Round 20",
                       "answers":  [
                                       {
                                           "text":  "Heavy mirror-work Chaniya Choli",
                                           "points":  52
                                       },
                                       {
                                           "text":  "Silver antique oxidized jewelry / necklaces",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Huge heavy jhumkas / earrings",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Heavy Kamarbandh / Waist belt",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Dupatta with heavy border",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something worn or carried by aunties at Garba that looks stunning but weighs 20 pounds.",
                       "multiplier":  2,
                       "theme":  "💃 Garba, Dandiya \u0026 Navratri Madness"
                   },
                   {
                       "title":  "Round 21",
                       "answers":  [
                                       {
                                           "text":  "Eating snacks / Drinking chai at the food stalls",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Debating politics, stock market \u0026 real estate",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Pretending they have knee or back pain",
                                           "points":  13
                                       },
                                       {
                                           "text":  "Taking photos \u0026 videos on their phones",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Holding their wife\u0027s purse and coat",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "What is the primary reason uncles stand on the perimeter of the gym floor at Garba?",
                       "multiplier":  2,
                       "theme":  "💃 Garba, Dandiya \u0026 Navratri Madness"
                   },
                   {
                       "title":  "Round 22",
                       "answers":  [
                                       {
                                           "text":  "Ice cold water / Chaas",
                                           "points":  48
                                       },
                                       {
                                           "text":  "A hot shower \u0026 sleep",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Late-night hot food (Puri-saak / Taco Bell)",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Pain relief balm (Volini / Tiger Balm / Moov)",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Taking off uncomfortable jewelry \u0026 shoes",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something you desperately need after 4 hours of nonstop Garba.",
                       "multiplier":  3,
                       "theme":  "💃 Garba, Dandiya \u0026 Navratri Madness"
                   },
                   {
                       "title":  "Round 23",
                       "answers":  [
                                       {
                                           "text":  "Vadodara (Baroda / United Way)",
                                           "points":  54
                                       },
                                       {
                                           "text":  "Ahmedabad",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Surat",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Rajkot",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Bhavnagar",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name a city in Gujarat that is famous for having the most legendary Garba celebrations.",
                       "multiplier":  3,
                       "theme":  "💃 Garba, Dandiya \u0026 Navratri Madness"
                   },
                   {
                       "title":  "Round 24",
                       "answers":  [
                                       {
                                           "text":  "\u0027A halo!\u0027",
                                           "points":  52
                                       },
                                       {
                                           "text":  "\u0027Chalo chalo!\u0027",
                                           "points":  24
                                       },
                                       {
                                           "text":  "\u0027Sanedo sanedo!\u0027",
                                           "points":  14
                                       },
                                       {
                                           "text":  "\u0027Speed up!\u0027",
                                           "points":  6
                                       },
                                       {
                                           "text":  "\u0027Jay Mataji!\u0027",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something you will hear someone shout right before the tempo goes into overdrive.",
                       "multiplier":  3,
                       "theme":  "💃 Garba, Dandiya \u0026 Navratri Madness"
                   },
                   {
                       "title":  "Round 25",
                       "answers":  [
                                       {
                                           "text":  "DDLJ (Dilwale Dulhania Le Jayenge)",
                                           "points":  48
                                       },
                                       {
                                           "text":  "Kabhi Khushi Kabhie Gham (K3G)",
                                           "points":  24
                                       },
                                       {
                                           "text":  "3 Idiots",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Sholay",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Hum Aapke Hain Koun..!",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name a Bollywood film that every single generation in this room has watched at least 5 times.",
                       "multiplier":  3,
                       "theme":  "🎬 Bollywood Blockbusters, Stars \u0026 Anthems"
                   },
                   {
                       "title":  "Round 26",
                       "answers":  [
                                       {
                                           "text":  "Arms spread wide open",
                                           "points":  78
                                       },
                                       {
                                           "text":  "Dimpled smile with head tilt",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Stuttering: \u0027K-k-k-Kiran\u0027",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Running fingers through hair",
                                           "points":  3
                                       },
                                       {
                                           "text":  "Salute in military uniform",
                                           "points":  2
                                       }
                                   ],
                       "prompt":  "Name the single most iconic signature pose of Shah Rukh Khan.",
                       "multiplier":  3,
                       "theme":  "🎬 Bollywood Blockbusters, Stars \u0026 Anthems"
                   },
                   {
                       "title":  "Round 27",
                       "answers":  [
                                       {
                                           "text":  "Amitabh Bachchan (Big B)",
                                           "points":  74
                                       },
                                       {
                                           "text":  "Shah Rukh Khan",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Dharmendra",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Raj Kapoor",
                                           "points":  4
                                       },
                                       {
                                           "text":  "Dilip Kumar",
                                           "points":  2
                                       }
                                   ],
                       "prompt":  "Name an actor who has been the undisputed patriarch of Bollywood for 50 years.",
                       "multiplier":  3,
                       "theme":  "🎬 Bollywood Blockbusters, Stars \u0026 Anthems"
                   },
                   {
                       "title":  "Round 28",
                       "answers":  [
                                       {
                                           "text":  "Gallan Goodiyaan (Dil Dhadakne Do)",
                                           "points":  36
                                       },
                                       {
                                           "text":  "Bole Chudiyan (K3G)",
                                           "points":  25
                                       },
                                       {
                                           "text":  "London Thumakda (Queen)",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Kala Chashma",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Mauja Hi Mauja",
                                           "points":  9
                                       }
                                   ],
                       "prompt":  "Name a song that instantly packs the dance floor at an Indian family reception.",
                       "multiplier":  3,
                       "theme":  "🎬 Bollywood Blockbusters, Stars \u0026 Anthems"
                   },
                   {
                       "title":  "Round 29",
                       "answers":  [
                                       {
                                           "text":  "\u0027Khush hua!\u0027",
                                           "points":  88
                                       },
                                       {
                                           "text":  "\u0027Ko gussa mat dilao\u0027",
                                           "points":  6
                                       },
                                       {
                                           "text":  "\u0027Ka aadesh\u0027",
                                           "points":  4
                                       },
                                       {
                                           "text":  "\u0027Zinda hai\u0027",
                                           "points":  2
                                       }
                                   ],
                       "prompt":  "Complete this legendary dialogue: \u0027Mogambo _____\u0027",
                       "multiplier":  3,
                       "theme":  "🎬 Bollywood Blockbusters, Stars \u0026 Anthems"
                   },
                   {
                       "title":  "Round 30",
                       "answers":  [
                                       {
                                           "text":  "Goliyon Ki Raasleela Ram-Leela",
                                           "points":  42
                                       },
                                       {
                                           "text":  "Hum Dil De Chuke Sanam",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Loveyatri",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Kai Po Che!",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Raees",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name an Indian movie that features memorable Gujarati culture or garba dance numbers.",
                       "multiplier":  3,
                       "theme":  "🎬 Bollywood Blockbusters, Stars \u0026 Anthems"
                   },
                   {
                       "title":  "Round 31",
                       "answers":  [
                                       {
                                           "text":  "Lata Mangeshkar",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Kishore Kumar",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Mohammed Rafi",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Asha Bhosle",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Mukesh",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name a legendary playback singer whose voice is synonymous with classic golden-era Bollywood.",
                       "multiplier":  3,
                       "theme":  "🎬 Bollywood Blockbusters, Stars \u0026 Anthems"
                   },
                   {
                       "title":  "Round 32",
                       "answers":  [
                                       {
                                           "text":  "Strict father who forbids marriage / love",
                                           "points":  44
                                       },
                                       {
                                           "text":  "Dramatic thunderstorm when bad news hits",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Long-lost twin brother separated at a mela",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Mother praying at temple bell",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Hero running into slow-motion train",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name a classic trope you see in almost every traditional Bollywood family drama.",
                       "multiplier":  3,
                       "theme":  "🎬 Bollywood Blockbusters, Stars \u0026 Anthems"
                   },
                   {
                       "title":  "Round 33",
                       "answers":  [
                                       {
                                           "text":  "Spicy green chutney (mint/coriander)",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Ginger-garlic paste",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Leftover Gujarati dal or kadhi",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Sambharo / Papaya salad",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Actual butter or yogurt (the rarest surprise!)",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name something you will find inside an old Country Crock or Dahi tub in Baa\u0027s fridge.",
                       "multiplier":  3,
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins"
                   },
                   {
                       "title":  "Round 34",
                       "answers":  [
                                       {
                                           "text":  "\u0027Chalo!\u0027 (Let\u0027s go!)",
                                           "points":  42
                                       },
                                       {
                                           "text":  "\u0027Kem Chho? / Majama\u0027",
                                           "points":  28
                                       },
                                       {
                                           "text":  "\u0027Thepla\u0027",
                                           "points":  14
                                       },
                                       {
                                           "text":  "\u0027Bas bas!\u0027 (Enough!)",
                                           "points":  9
                                       },
                                       {
                                           "text":  "\u0027Saru\u0027 (Good / Okay)",
                                           "points":  7
                                       }
                                   ],
                       "prompt":  "Name a Gujarati word or phrase that even the American-born grandkids know by heart.",
                       "multiplier":  3,
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins"
                   },
                   {
                       "title":  "Round 35",
                       "answers":  [
                                       {
                                           "text":  "Giant 5-lb bag of Almonds or Cashews",
                                           "points":  45
                                       },
                                       {
                                           "text":  "Toilet paper \u0026 paper towel bundles",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Huge bottle of Cooking Oil / Ghee",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Cases of bottled water",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Tub of mixed nuts / Pistachios",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "Name something an Indian dad buys in absurd quantities at Costco.",
                       "multiplier":  3,
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins"
                   },
                   {
                       "title":  "Round 36",
                       "answers":  [
                                       {
                                           "text":  "\u0027Good Morning\u0027 glitter/flower images",
                                           "points":  52
                                       },
                                       {
                                           "text":  "Fake medical health tips \u0026 home remedies",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Cousin\u0027s graduation / engagement announcement",
                                           "points":  13
                                       },
                                       {
                                           "text":  "Inspirational quotes with tea cups",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Videos of baby animals or bhajan clips",
                                           "points":  5
                                       }
                                   ],
                       "prompt":  "Name something you are 100% guaranteed to find in the family WhatsApp group.",
                       "multiplier":  3,
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins"
                   },
                   {
                       "title":  "Round 37",
                       "answers":  [
                                       {
                                           "text":  "Parle-G",
                                           "points":  58
                                       },
                                       {
                                           "text":  "Khari Biscuit / Puff pastry",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Marie Gold / Britannia Marie",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Toast / Rusk",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Bourbon / Good Day",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "Name a biscuit that has been dipped into hot 4:00 PM masala chai for generations.",
                       "multiplier":  3,
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins"
                   },
                   {
                       "title":  "Round 38",
                       "answers":  [
                                       {
                                           "text":  "4 hours early",
                                           "points":  48
                                       },
                                       {
                                           "text":  "5 hours early",
                                           "points":  28
                                       },
                                       {
                                           "text":  "3 hours early",
                                           "points":  16
                                       },
                                       {
                                           "text":  "6+ hours early / Night before",
                                           "points":  5
                                       },
                                       {
                                           "text":  "2 hours early (causes pure panic!)",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "How many hours before an international flight does an Indian dad insist on arriving at the airport?",
                       "multiplier":  3,
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins"
                   },
                   {
                       "title":  "Round 39",
                       "answers":  [
                                       {
                                           "text":  "TV remote control",
                                           "points":  54
                                       },
                                       {
                                           "text":  "Living room sofa / couch cushions",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Car seats",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Microwave or refrigerator display panel",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Mattress",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "Name something inside an Indian house that is still wrapped in its original protective plastic.",
                       "multiplier":  3,
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins"
                   },
                   {
                       "title":  "Round 40",
                       "answers":  [
                                       {
                                           "text":  "Hanging out in a separate bedroom/basement",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Gossip about all the aunties and uncles",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Raiding the snack counter before dinner is served",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Making TikTok / Reel videos",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Debating which cousin is getting married next",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "When all the cousins get together at a big family party, what are they usually doing?",
                       "multiplier":  3,
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins"
                   },
                   {
                       "title":  "Tie-Breaker 1",
                       "answers":  [
                                       {
                                           "text":  "Turmeric / Haldi",
                                           "points":  52
                                       },
                                       {
                                           "text":  "Cumin / Jeera",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Red Chili Powder",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Garam Masala",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Mustard Seeds / Rai",
                                           "points":  4
                                       }
                                   ],
                       "prompt":  "SUDDEN DEATH (#1 Answer Only): Name the undisputed favorite spice in every Indian kitchen.",
                       "multiplier":  1,
                       "theme":  "⚡ Sudden-Death Tie-Breakers (#1 Answer Only)"
                   },
                   {
                       "title":  "Tie-Breaker 2",
                       "answers":  [
                                       {
                                           "text":  "Doctor / Physician",
                                           "points":  61
                                       },
                                       {
                                           "text":  "Software Engineer / Tech",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Pharmacist",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Business Owner / Entrepreneur",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Lawyer",
                                           "points":  3
                                       }
                                   ],
                       "prompt":  "SUDDEN DEATH (#1 Answer Only): Name the #1 career Gujarati parents pray their child chooses.",
                       "multiplier":  1,
                       "theme":  "⚡ Sudden-Death Tie-Breakers (#1 Answer Only)"
                   },
                   {
                       "title":  "Tie-Breaker 3",
                       "answers":  [
                                       {
                                           "text":  "7:30 PM",
                                           "points":  48
                                       },
                                       {
                                           "text":  "8:00 PM",
                                           "points":  32
                                       },
                                       {
                                           "text":  "7:00 PM",
                                           "points":  14
                                       },
                                       {
                                           "text":  "8:30 PM",
                                           "points":  6
                                       }
                                   ],
                       "prompt":  "SUDDEN DEATH (#1 Answer Only): What time does a Gujarati party scheduled for 6:00 PM actually start?",
                       "multiplier":  1,
                       "theme":  "⚡ Sudden-Death Tie-Breakers (#1 Answer Only)"
                   }
               ],
    "fastMoney":  [
                      {
                          "hint":  "10 boxes (38), 5 boxes (26), 15 boxes (18), 20+ boxes (12), 7 boxes (6)",
                          "prompt":  "How many boxes of Diwali sweets (mithai) does an Indian family receive each year?"
                      },
                      {
                          "hint":  "Red / Maroon (46), Gold / Yellow (28), Royal Blue (14), Emerald Green (8), Orange (4)",
                          "prompt":  "Name a traditional color people love to wear on Diwali night."
                      },
                      {
                          "hint":  "Sparklers / Fireworks (58), Candle (24), Incense stick / Agarbatti (12), String lights (6)",
                          "prompt":  "Name something you light up on Diwali besides a diya."
                      },
                      {
                          "hint":  "Dry fruits / Nuts box (52), Silver coin / Utensil (24), Cash / Gift card (14), Clothes (7), Scented candle (3)",
                          "prompt":  "Name a gift people give on Diwali besides sweets."
                      },
                      {
                          "hint":  "Never / Any age (44), 18 years old (26), 13 years old (16), 25 years old (10), 10 years old (4)",
                          "prompt":  "At what age do kids stop touching elders\u0027 feet and just do a polite namaste?"
                      },
                      {
                          "hint":  "3 theplas (42), 4 theplas (28), 2 theplas (16), 5 theplas (9), 6+ theplas (5)",
                          "prompt":  "How many theplas can an average Gujarati eat in one sitting?"
                      },
                      {
                          "hint":  "Dal (58), Kadhi (22), Sambharo / Pickle (11), Tomato soup (6), Chai (3)",
                          "prompt":  "Name a food item that Gujaratis put sugar or jaggery into."
                      },
                      {
                          "hint":  "Mint / Coriander Chutney (54), Sweet Tamarind Chutney (32), Fried Green Chilies (9), Ketchup (5)",
                          "prompt":  "Name an essential condiment served alongside hot samosas."
                      },
                      {
                          "hint":  "Pani Puri / Golgappe (62), Pav Bhaji (18), Dahi Puri (11), Bhel Puri (6), Samosa Chaat (3)",
                          "prompt":  "Name a street food you can never eat gracefully without making a mess."
                      },
                      {
                          "hint":  "3 cups (44), 2 cups (31), 4 cups (15), 5+ cups (8), 1 cup (2)",
                          "prompt":  "How many cups of hot chai does Baa drink in a single day?"
                      },
                      {
                          "hint":  "30 minutes (41), 45 minutes (28), 15 minutes (17), 60 minutes (10), 20 minutes (4)",
                          "prompt":  "How many minutes can you dance Garba before needing to stop for water?"
                      },
                      {
                          "hint":  "Feet / Soles (54), Calves / Legs (26), Shoulders / Arms (11), Lower back (6), Fingers (3)",
                          "prompt":  "Name a body part that is painfully sore the morning after Garba night."
                      },
                      {
                          "hint":  "Dhol / Dholak (64), Keyboard / Synthesizer (18), Octapad (11), Shehnai / Flute (4), Dholki (3)",
                          "prompt":  "Name an instrument you hear in every Garba band."
                      },
                      {
                          "hint":  "Earring / Jhumka (48), Dandiya stick (26), Bindi (12), Shoe / Chappal (9), Hairpin (5)",
                          "prompt":  "Name something people lose on the dance floor during Navratri."
                      },
                      {
                          "hint":  "2:00 AM (48), 1:00 AM (26), 3:00 AM (16), Midnight (7), 4:00 AM (3)",
                          "prompt":  "What time does a true Gujarati Garba night actually shut down?"
                      },
                      {
                          "hint":  "Gabbar Singh (62), Mogambo (24), Shakaal (8), Kancha Cheena (4), Crime Master Gogo (2)",
                          "prompt":  "Name an iconic Bollywood villain whose name everyone knows."
                      },
                      {
                          "hint":  "Mumbai / Bombay (88), Hyderabad (6), Delhi (4), Chennai (2)",
                          "prompt":  "Name an Indian city where Bollywood films are produced."
                      },
                      {
                          "hint":  "6 songs (42), 5 songs (28), 7 songs (16), 8 songs (9), 4 songs (5)",
                          "prompt":  "How many songs are usually in a classic Bollywood movie?"
                      },
                      {
                          "hint":  "Hrithik Roshan (56), Salman Khan (26), Tiger Shroff (11), John Abraham (4), Shah Rukh Khan (3)",
                          "prompt":  "Name a Bollywood star famous for having six-pack abs."
                      },
                      {
                          "hint":  "Joy / Happiness (42), Romantic love (26), Sadness / Tears (18), Excitement (10), Anger (4)",
                          "prompt":  "Name an emotion that every Bollywood movie guarantees to make you feel."
                      },
                      {
                          "hint":  "30 minutes (48), 45 minutes (24), 60 minutes (16), 15 minutes (8), 20 minutes (4)",
                          "prompt":  "How many minutes late is still considered \u0027on time\u0027 according to Indian Standard Time (IST)?"
                      },
                      {
                          "hint":  "Napkins / Wet wipes (44), Car registration / insurance (28), Pen \u0026 notepad (12), Breath mints / Saunf (10), Sunglasses (6)",
                          "prompt":  "Name something you will find inside the glove compartment of an Indian dad\u0027s car."
                      },
                      {
                          "hint":  "Haldi Doodh (Turmeric Milk) (58), Ginger / Adrak Chai (22), Vicks VapoRub (12), Tulsi leaves (5), Warm salt water (3)",
                          "prompt":  "Name a natural remedy Baa suggests for literally any illness."
                      },
                      {
                          "hint":  "Basmati Rice (64), Atta (Chakki Flour) (24), Sugar (6), Onions / Potatoes (4), Toor Dal (2)",
                          "prompt":  "Name an item that is always purchased in 20-lb or 40-lb bulk bags."
                      },
                      {
                          "hint":  "Too much homework / exam tomorrow (54), Feeling sick / headache (24), Working a shift (12), Already had dinner (6), School project (4)",
                          "prompt":  "Name an excuse an Indian teenager uses to avoid going to an uncle\u0027s house."
                      },
                      {
                          "hint":  "Dancing in the middle of the street (52), Dhol players going crazy (26), Groom on a horse or vintage car (12), Uncle doing snake dance (7), Firecrackers (3)",
                          "prompt":  "Name something guaranteed to happen during an Indian wedding baraat."
                      },
                      {
                          "hint":  "Live Chaat / Pani Puri counter (54), Biryani / Pulao (22), Paneer Tikka / Butter Paneer (12), Fresh Hot Jalebi (8), Naan station (4)",
                          "prompt":  "Name a dish on a wedding buffet where the line is always 20 people deep."
                      },
                      {
                          "hint":  "3 outfits (44), 4 outfits (28), 5 outfits (16), 2 outfits (8), 6+ outfits (4)",
                          "prompt":  "How many outfit changes does an attendee do for a 3-day Indian wedding?"
                      },
                      {
                          "hint":  "Food was too spicy / cold (41), Music was way too loud (27), Parking was a disaster (16), Auntie\u0027s comment / gossip (11), Started way too late (5)",
                          "prompt":  "Name something people complain about on the car ride home from a party."
                      },
                      {
                          "hint":  "Cash in an envelope (58), Silver coin / idol (22), Kitchen appliance / Instant Pot (12), Bedding / Quilt (5), Crockery set (3)",
                          "prompt":  "Name a classic gift given at an Indian housewarming or wedding."
                      }
                  ]
}
  }
    ,
  {
    id: "gandhi-samaj-2026-meha-edition.json",
    label: "🪔 Gandhi Samaj 2026 (Meha Edition • 21 Rounds)",
    file: "./decks/gandhi-samaj-2026-meha-edition.json",
    data: {
    "gameTitle":  "Gandhi Samaj Diwali Feud 2026",
    "gameIcon":  "🪔",
    "deckName":  "Gandhi Samaj 2026 (Meha Edition)",
    "teamPresets":  [
                        [
                            "Baa \u0026 Bapuji All-Stars",
                            "Next-Gen Cousins"
                        ],
                        [
                            "Team Fafda",
                            "Team Jalebi"
                        ],
                        [
                            "Team Dhokla",
                            "Team Thepla"
                        ],
                        [
                            "Parents \u0026 Kaka-Kakis",
                            "Kids \u0026 ABCD Cousins"
                        ],
                        [
                            "Team Patola",
                            "Team Bandhani"
                        ],
                        [
                            "East Coast Family",
                            "West Coast Family"
                        ]
                    ],
    "rounds":  [
                   {
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions",
                       "title":  "Round 1",
                       "multiplier":  1,
                       "prompt":  "Name something kids look forward to the most during Diwali.",
                       "answers":  [
                                       {
                                           "text":  "Cash envelopes from elders (Sagan/Chandla)",
                                           "points":  44
                                       },
                                       {
                                           "text":  "Bursting firecrackers / Sparklers",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Eating unlimited mithai \u0026 snacks",
                                           "points":  15
                                       },
                                       {
                                           "text":  "Wearing brand new clothes",
                                           "points":  9
                                       },
                                       {
                                           "text":  "No school / holiday break",
                                           "points":  6
                                       }
                                   ]
                   },
                   {
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions",
                       "title":  "Round 2",
                       "multiplier":  1,
                       "prompt":  "Name something you will always find on the Diwali Laxmi Puja thali.",
                       "answers":  [
                                       {
                                           "text":  "Diyas / Ghee lamps",
                                           "points":  42
                                       },
                                       {
                                           "text":  "Gold/Silver coins (Laxmi coin)",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Kanku \u0026 Chokha (Kumkum \u0026 Rice)",
                                           "points":  16
                                       },
                                       {
                                           "text":  "Fresh marigold flowers",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Mithai / Prasad (Kaju Katli/Peda)",
                                           "points":  8
                                       }
                                   ]
                   },
                   {
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions",
                       "title":  "Round 3",
                       "multiplier":  1,
                       "prompt":  "What is the very first thing Gujarati family members say to each other on Beshtu Varas (New Year\u0027s Day)?",
                       "answers":  [
                                       {
                                           "text":  "\u0027Saal Mubarak!\u0027",
                                           "points":  58
                                       },
                                       {
                                           "text":  "\u0027Happy New Year!\u0027",
                                           "points":  22
                                       },
                                       {
                                           "text":  "\u0027Kem Chho? Majama?\u0027",
                                           "points":  11
                                       },
                                       {
                                           "text":  "\u0027Jai Shri Krishna!\u0027",
                                           "points":  6
                                       },
                                       {
                                           "text":  "\u0027Nutan Varshabhinandan / Pranam!\u0027",
                                           "points":  3
                                       }
                                   ]
                   },
                   {
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions",
                       "title":  "Round 4",
                       "multiplier":  1,
                       "prompt":  "Name a Diwali firecracker that is always designated as \u0027safe for the little kids\u0027.",
                       "answers":  [
                                       {
                                           "text":  "Sparklers (Phooljhadi)",
                                           "points":  56
                                       },
                                       {
                                           "text":  "Ground Spinners (Chakri / Zameen Chakkar)",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Pop-pops / Snappers",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Flower Pots (Anar)",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Snake tablets",
                                           "points":  4
                                       }
                                   ]
                   },
                   {
                       "theme":  "🪔 Diwali \u0026 Saal Mubarak Traditions",
                       "title":  "Round 5",
                       "multiplier":  1,
                       "prompt":  "Name something moms do two weeks before Diwali that exhausts the entire household.",
                       "answers":  [
                                       {
                                           "text":  "Deep cleaning every closet \u0026 corner",
                                           "points":  55
                                       },
                                       {
                                           "text":  "Making 10 different dabbas of snacks",
                                           "points":  23
                                       },
                                       {
                                           "text":  "Shopping for Indian outfits for everyone",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Hanging up outdoor lights \u0026 lanterns",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Designing intricate floor Rangoli",
                                           "points":  4
                                       }
                                   ]
                   },
                   {
                       "theme":  "🫓 Gujarati Food, Farsan \u0026 Baa\u0027s Kitchen",
                       "title":  "Round 6",
                       "multiplier":  1,
                       "prompt":  "Name an ingredient non-Gujaratis are shocked to find inside a Gujarati dal.",
                       "answers":  [
                                       {
                                           "text":  "Sugar / Jaggery (Gor)",
                                           "points":  62
                                       },
                                       {
                                           "text":  "Peanuts (Singdana)",
                                           "points":  18
                                       },
                                       {
                                           "text":  "Lemon juice / Kokum (sourness)",
                                           "points":  10
                                       },
                                       {
                                           "text":  "Cinnamon \u0026 Cloves (Sweet spices)",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Raisins (Kishmish)",
                                           "points":  4
                                       }
                                   ]
                   },
                   {
                       "theme":  "🫓 Gujarati Food, Farsan \u0026 Baa\u0027s Kitchen",
                       "title":  "Round 7",
                       "multiplier":  2,
                       "prompt":  "Name a sweet dish (mithai) that Gujaratis take supreme pride in making from scratch.",
                       "answers":  [
                                       {
                                           "text":  "Mohanthal",
                                           "points":  42
                                       },
                                       {
                                           "text":  "Shrikhand (Elaichi/Kesar/Mango)",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Ghari (Surati)",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Magas (Besan Ladoo)",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Doodhpak / Kheer",
                                           "points":  8
                                       }
                                   ]
                   },
                   {
                       "theme":  "🫓 Gujarati Food, Farsan \u0026 Baa\u0027s Kitchen",
                       "title":  "Round 8",
                       "multiplier":  2,
                       "prompt":  "Name something Baa insists on putting an excessive amount of on hot rotli.",
                       "answers":  [
                                       {
                                           "text":  "Desi Ghee",
                                           "points":  72
                                       },
                                       {
                                           "text":  "White Butter (Makhan)",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Jaggery (Gor)",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Chundo / Pickle masala",
                                           "points":  4
                                       },
                                       {
                                           "text":  "Sugar (Khand / Bura roll-up)",
                                           "points":  2
                                       }
                                   ]
                   },
                   {
                       "theme":  "💃 Garba, Dandiya \u0026 Navratri Madness",
                       "title":  "Round 9",
                       "multiplier":  2,
                       "prompt":  "Name something worn or carried by aunties at Garba that looks stunning but weighs 20 pounds.",
                       "answers":  [
                                       {
                                           "text":  "Heavy mirror-work Chaniya Choli",
                                           "points":  52
                                       },
                                       {
                                           "text":  "Silver antique oxidized jewelry / necklaces",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Huge heavy jhumkas / earrings",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Heavy Kamarbandh / Waist belt",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Dupatta with heavy border",
                                           "points":  5
                                       }
                                   ]
                   },
                   {
                       "theme":  "💃 Garba, Dandiya \u0026 Navratri Madness",
                       "title":  "Round 10",
                       "multiplier":  2,
                       "prompt":  "Name a city in Gujarat that is famous for having the most legendary Garba celebrations.",
                       "answers":  [
                                       {
                                           "text":  "Vadodara (Baroda / United Way)",
                                           "points":  54
                                       },
                                       {
                                           "text":  "Ahmedabad",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Surat",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Rajkot",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Bhavnagar",
                                           "points":  3
                                       }
                                   ]
                   },
                   {
                       "theme":  "💃 Garba, Dandiya \u0026 Navratri Madness",
                       "title":  "Round 11",
                       "multiplier":  2,
                       "prompt":  "Name something you will hear someone shout right before the tempo goes into overdrive.",
                       "answers":  [
                                       {
                                           "text":  "\u0027A halo! / Chalo chalo!\u0027",
                                           "points":  58
                                       },
                                       {
                                           "text":  "Loud whistling \u0026 cheering",
                                           "points":  18
                                       },
                                       {
                                           "text":  "\u0027Sanedo sanedo!\u0027",
                                           "points":  14
                                       },
                                       {
                                           "text":  "\u0027Jay Mataji!\u0027",
                                           "points":  6
                                       },
                                       {
                                           "text":  "\u0027Speed up / Faster!\u0027",
                                           "points":  4
                                       }
                                   ]
                   },
                   {
                       "theme":  "🎬 Bollywood Blockbusters, Stars \u0026 Anthems",
                       "title":  "Round 12",
                       "multiplier":  2,
                       "prompt":  "Name the single most iconic signature pose of Shah Rukh Khan.",
                       "answers":  [
                                       {
                                           "text":  "Arms spread wide open",
                                           "points":  76
                                       },
                                       {
                                           "text":  "Dimpled smile with head tilt",
                                           "points":  12
                                       },
                                       {
                                           "text":  "Sliding on his knees",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Running fingers through hair",
                                           "points":  4
                                       },
                                       {
                                           "text":  "Hand on his heart / chest",
                                           "points":  2
                                       }
                                   ]
                   },
                   {
                       "theme":  "🎬 Bollywood Blockbusters, Stars \u0026 Anthems",
                       "title":  "Round 13",
                       "multiplier":  3,
                       "prompt":  "Name a legendary playback singer whose voice is synonymous with classic golden-era Bollywood.",
                       "answers":  [
                                       {
                                           "text":  "Lata Mangeshkar",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Kishore Kumar",
                                           "points":  28
                                       },
                                       {
                                           "text":  "Mohammed Rafi",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Asha Bhosle",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Mukesh",
                                           "points":  4
                                       }
                                   ]
                   },
                   {
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins",
                       "title":  "Round 14",
                       "multiplier":  3,
                       "prompt":  "Name a Gujarati word or phrase that even the American-born grandkids know by heart.",
                       "answers":  [
                                       {
                                           "text":  "\u0027Chalo!\u0027 (Let\u0027s go!)",
                                           "points":  42
                                       },
                                       {
                                           "text":  "\u0027Kem Chho? / Majama\u0027",
                                           "points":  28
                                       },
                                       {
                                           "text":  "\u0027Thepla\u0027",
                                           "points":  14
                                       },
                                       {
                                           "text":  "\u0027Bas bas!\u0027 (Enough!)",
                                           "points":  9
                                       },
                                       {
                                           "text":  "\u0027Saru\u0027 (Good / Okay)",
                                           "points":  7
                                       }
                                   ]
                   },
                   {
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins",
                       "title":  "Round 15",
                       "multiplier":  3,
                       "prompt":  "Name a biscuit that has been dipped into hot 4:00 PM masala chai for generations.",
                       "answers":  [
                                       {
                                           "text":  "Parle-G",
                                           "points":  58
                                       },
                                       {
                                           "text":  "Khari Biscuit / Puff pastry",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Marie Gold / Britannia Marie",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Toast / Rusk",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Bourbon / Good Day",
                                           "points":  3
                                       }
                                   ]
                   },
                   {
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins",
                       "title":  "Round 16",
                       "multiplier":  3,
                       "prompt":  "How many hours before an international flight does an Indian dad insist on arriving at the airport?",
                       "answers":  [
                                       {
                                           "text":  "4 hours early",
                                           "points":  48
                                       },
                                       {
                                           "text":  "5 hours early",
                                           "points":  28
                                       },
                                       {
                                           "text":  "3 hours early",
                                           "points":  16
                                       },
                                       {
                                           "text":  "6+ hours early / Night before",
                                           "points":  5
                                       },
                                       {
                                           "text":  "2 hours early (causes pure panic!)",
                                           "points":  3
                                       }
                                   ]
                   },
                   {
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins",
                       "title":  "Round 17",
                       "multiplier":  3,
                       "prompt":  "Name something inside an Indian house that is still wrapped in its original protective plastic.",
                       "answers":  [
                                       {
                                           "text":  "TV remote control",
                                           "points":  54
                                       },
                                       {
                                           "text":  "Living room sofa / couch cushions",
                                           "points":  24
                                       },
                                       {
                                           "text":  "Car seats",
                                           "points":  11
                                       },
                                       {
                                           "text":  "Microwave or refrigerator display panel",
                                           "points":  7
                                       },
                                       {
                                           "text":  "Mattress",
                                           "points":  4
                                       }
                                   ]
                   },
                   {
                       "theme":  "👨‍👩‍👧‍👦 Baa, Parents \u0026 ABCD Cousins",
                       "title":  "Round 18",
                       "multiplier":  3,
                       "prompt":  "When all the cousins get together at a big family party, what are they usually doing?",
                       "answers":  [
                                       {
                                           "text":  "Hanging out in a separate bedroom/basement",
                                           "points":  46
                                       },
                                       {
                                           "text":  "Gossip about all the aunties and uncles",
                                           "points":  26
                                       },
                                       {
                                           "text":  "Raiding the snack counter before dinner is served",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Making TikTok / Reel videos",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Debating which cousin is getting married next",
                                           "points":  6
                                       }
                                   ]
                   },
                   {
                       "theme":  "⚡ Sudden-Death Tie-Breakers (#1 Answer Only)",
                       "title":  "Tie-Breaker 1",
                       "multiplier":  1,
                       "prompt":  "SUDDEN DEATH (#1 Answer Only): Name the undisputed favorite spice in every Indian kitchen.",
                       "answers":  [
                                       {
                                           "text":  "Turmeric / Haldi",
                                           "points":  52
                                       },
                                       {
                                           "text":  "Cumin / Jeera",
                                           "points":  22
                                       },
                                       {
                                           "text":  "Red Chili Powder",
                                           "points":  14
                                       },
                                       {
                                           "text":  "Garam Masala",
                                           "points":  8
                                       },
                                       {
                                           "text":  "Mustard Seeds / Rai",
                                           "points":  4
                                       }
                                   ]
                   },
                   {
                       "theme":  "⚡ Sudden-Death Tie-Breakers (#1 Answer Only)",
                       "title":  "Tie-Breaker 2",
                       "multiplier":  1,
                       "prompt":  "SUDDEN DEATH (#1 Answer Only): Name the #1 career Gujarati parents pray their child chooses.",
                       "answers":  [
                                       {
                                           "text":  "Doctor / Physician",
                                           "points":  61
                                       },
                                       {
                                           "text":  "Software Engineer / Tech",
                                           "points":  21
                                       },
                                       {
                                           "text":  "Pharmacist",
                                           "points":  9
                                       },
                                       {
                                           "text":  "Business Owner / Entrepreneur",
                                           "points":  6
                                       },
                                       {
                                           "text":  "Lawyer",
                                           "points":  3
                                       }
                                   ]
                   },
                   {
                       "theme":  "⚡ Sudden-Death Tie-Breakers (#1 Answer Only)",
                       "title":  "Tie-Breaker 3",
                       "multiplier":  1,
                       "prompt":  "SUDDEN DEATH (#1 Answer Only): What time does a Gujarati party scheduled for 6:00 PM actually start?",
                       "answers":  [
                                       {
                                           "text":  "7:30 PM",
                                           "points":  48
                                       },
                                       {
                                           "text":  "8:00 PM",
                                           "points":  32
                                       },
                                       {
                                           "text":  "7:00 PM",
                                           "points":  14
                                       },
                                       {
                                           "text":  "8:30 PM",
                                           "points":  6
                                       }
                                   ]
                   }
               ],
    "fastMoney":  [
                      {
                          "hint":  "10 boxes (38), 5 boxes (26), 15 boxes (18), 20+ boxes (12), 7 boxes (6)",
                          "prompt":  "How many boxes of Diwali sweets (mithai) does an Indian family receive each year?"
                      },
                      {
                          "hint":  "Red / Maroon (46), Gold / Yellow (28), Royal Blue (14), Emerald Green (8), Orange (4)",
                          "prompt":  "Name a traditional color people love to wear on Diwali night."
                      },
                      {
                          "hint":  "Sparklers / Fireworks (58), Candle (24), Incense stick / Agarbatti (12), String lights (6)",
                          "prompt":  "Name something you light up on Diwali besides a diya."
                      },
                      {
                          "hint":  "Dry fruits / Nuts box (52), Silver coin / Utensil (24), Cash / Gift card (14), Clothes (7), Scented candle (3)",
                          "prompt":  "Name a gift people give on Diwali besides sweets."
                      },
                      {
                          "hint":  "Never / Any age (44), 18 years old (26), 13 years old (16), 25 years old (10), 10 years old (4)",
                          "prompt":  "At what age do kids stop touching elders\u0027 feet and just do a polite namaste?"
                      },
                      {
                          "hint":  "3 theplas (42), 4 theplas (28), 2 theplas (16), 5 theplas (9), 6+ theplas (5)",
                          "prompt":  "How many theplas can an average Gujarati eat in one sitting?"
                      },
                      {
                          "hint":  "Dal (58), Kadhi (22), Sambharo / Pickle (11), Tomato soup (6), Chai (3)",
                          "prompt":  "Name a food item that Gujaratis put sugar or jaggery into."
                      },
                      {
                          "hint":  "Mint / Coriander Chutney (54), Sweet Tamarind Chutney (32), Fried Green Chilies (9), Ketchup (5)",
                          "prompt":  "Name an essential condiment served alongside hot samosas."
                      },
                      {
                          "hint":  "Pani Puri / Golgappe (62), Pav Bhaji (18), Dahi Puri (11), Bhel Puri (6), Samosa Chaat (3)",
                          "prompt":  "Name a street food you can never eat gracefully without making a mess."
                      },
                      {
                          "hint":  "3 cups (44), 2 cups (31), 4 cups (15), 5+ cups (8), 1 cup (2)",
                          "prompt":  "How many cups of hot chai does Baa drink in a single day?"
                      },
                      {
                          "hint":  "30 minutes (41), 45 minutes (28), 15 minutes (17), 60 minutes (10), 20 minutes (4)",
                          "prompt":  "How many minutes can you dance Garba before needing to stop for water?"
                      },
                      {
                          "hint":  "Feet / Soles (54), Calves / Legs (26), Shoulders / Arms (11), Lower back (6), Fingers (3)",
                          "prompt":  "Name a body part that is painfully sore the morning after Garba night."
                      },
                      {
                          "hint":  "Dhol / Dholak (64), Keyboard / Synthesizer (18), Octapad (11), Shehnai / Flute (4), Dholki (3)",
                          "prompt":  "Name an instrument you hear in every Garba band."
                      },
                      {
                          "hint":  "Earring / Jhumka (48), Dandiya stick (26), Bindi (12), Shoe / Chappal (9), Hairpin (5)",
                          "prompt":  "Name something people lose on the dance floor during Navratri."
                      },
                      {
                          "hint":  "2:00 AM (48), 1:00 AM (26), 3:00 AM (16), Midnight (7), 4:00 AM (3)",
                          "prompt":  "What time does a true Gujarati Garba night actually shut down?"
                      },
                      {
                          "hint":  "Gabbar Singh (62), Mogambo (24), Shakaal (8), Kancha Cheena (4), Crime Master Gogo (2)",
                          "prompt":  "Name an iconic Bollywood villain whose name everyone knows."
                      },
                      {
                          "hint":  "Mumbai / Bombay (88), Hyderabad (6), Delhi (4), Chennai (2)",
                          "prompt":  "Name an Indian city where Bollywood films are produced."
                      },
                      {
                          "hint":  "6 songs (42), 5 songs (28), 7 songs (16), 8 songs (9), 4 songs (5)",
                          "prompt":  "How many songs are usually in a classic Bollywood movie?"
                      },
                      {
                          "hint":  "Hrithik Roshan (56), Salman Khan (26), Tiger Shroff (11), John Abraham (4), Shah Rukh Khan (3)",
                          "prompt":  "Name a Bollywood star famous for having six-pack abs."
                      },
                      {
                          "hint":  "Joy / Happiness (42), Romantic love (26), Sadness / Tears (18), Excitement (10), Anger (4)",
                          "prompt":  "Name an emotion that every Bollywood movie guarantees to make you feel."
                      },
                      {
                          "hint":  "30 minutes (48), 45 minutes (24), 60 minutes (16), 15 minutes (8), 20 minutes (4)",
                          "prompt":  "How many minutes late is still considered \u0027on time\u0027 according to Indian Standard Time (IST)?"
                      },
                      {
                          "hint":  "Napkins / Wet wipes (44), Car registration / insurance (28), Pen \u0026 notepad (12), Breath mints / Saunf (10), Sunglasses (6)",
                          "prompt":  "Name something you will find inside the glove compartment of an Indian dad\u0027s car."
                      },
                      {
                          "hint":  "Haldi Doodh (Turmeric Milk) (58), Ginger / Adrak Chai (22), Vicks VapoRub (12), Tulsi leaves (5), Warm salt water (3)",
                          "prompt":  "Name a natural remedy Baa suggests for literally any illness."
                      },
                      {
                          "hint":  "Basmati Rice (64), Atta (Chakki Flour) (24), Sugar (6), Onions / Potatoes (4), Toor Dal (2)",
                          "prompt":  "Name an item that is always purchased in 20-lb or 40-lb bulk bags."
                      },
                      {
                          "hint":  "Too much homework / exam tomorrow (54), Feeling sick / headache (24), Working a shift (12), Already had dinner (6), School project (4)",
                          "prompt":  "Name an excuse an Indian teenager uses to avoid going to an uncle\u0027s house."
                      },
                      {
                          "hint":  "Dancing in the middle of the street (52), Dhol players going crazy (26), Groom on a horse or vintage car (12), Uncle doing snake dance (7), Firecrackers (3)",
                          "prompt":  "Name something guaranteed to happen during an Indian wedding baraat."
                      },
                      {
                          "hint":  "Live Chaat / Pani Puri counter (54), Biryani / Pulao (22), Paneer Tikka / Butter Paneer (12), Fresh Hot Jalebi (8), Naan station (4)",
                          "prompt":  "Name a dish on a wedding buffet where the line is always 20 people deep."
                      },
                      {
                          "hint":  "3 outfits (44), 4 outfits (28), 5 outfits (16), 2 outfits (8), 6+ outfits (4)",
                          "prompt":  "How many outfit changes does an attendee do for a 3-day Indian wedding?"
                      },
                      {
                          "hint":  "Food was too spicy / cold (41), Music was way too loud (27), Parking was a disaster (16), Auntie\u0027s comment / gossip (11), Started way too late (5)",
                          "prompt":  "Name something people complain about on the car ride home from a party."
                      },
                      {
                          "hint":  "Cash in an envelope (58), Silver coin / idol (22), Kitchen appliance / Instant Pot (12), Bedding / Quilt (5), Crockery set (3)",
                          "prompt":  "Name a classic gift given at an Indian housewarming or wedding."
                      }
                  ]
}
  }
];
