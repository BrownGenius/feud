// =====================================================================
// DEFAULT STARTER DECK & CONFIGURATION (data/questions.js)
// All names, icons, team presets, rounds, and Fast Money questions can
// also be configured via any imported Deck JSON file!
// =====================================================================

window.Feud = window.Feud || {};

window.Feud.DEFAULT_DECK = {
  gameTitle: "Party Feud",
  gameIcon: "🎉",
  deckName: "Starter Party Deck",
  teamPresets: [
    ["Team A", "Team B"],
    ["Team Red", "Team Blue"],
    ["Team 1", "Team 2"]
  ],
  roomWords: [
    "GAME", "PLAY", "QUIZ", "STAR", "GOLD",
    "BUZZ", "TEAM", "SHOW", "LIVE", "CLUB"
  ],
  rounds: [
    {
      theme: "🔥 Live Party Poll (Editable!)",
      title: "Round 1",
      multiplier: 1,
      prompt: "Name something people always do right after finishing a huge meal.",
      answers: [
        { text: "Take a nap on the couch", points: 40 },
        { text: "Have coffee or tea", points: 24 },
        { text: "Put on stretchy pants", points: 15 },
        { text: "Eat dessert", points: 10 },
        { text: "Watch sports or a movie", points: 6 },
        { text: "Go for a walk", points: 5 }
      ]
    },
    {
      theme: "🔥 Live Party Poll (Editable!)",
      title: "Round 2",
      multiplier: 1,
      prompt: "What is one item you will NEVER travel on an airplane without?",
      answers: [
        { text: "Headphones / Earbuds", points: 36 },
        { text: "Phone charger / Power bank", points: 24 },
        { text: "Snacks", points: 16 },
        { text: "Sweater / Jacket", points: 12 },
        { text: "Water bottle", points: 7 },
        { text: "Neck pillow", points: 5 }
      ]
    },
    {
      theme: "🎉 Everyday Life & Trivia",
      title: "Round 3",
      multiplier: 1,
      prompt: "Name a reason someone might be running 30 minutes late to a party.",
      answers: [
        { text: "Stuck in traffic / Parking", points: 38 },
        { text: "Couldn't decide what to wear", points: 25 },
        { text: "Stopped to pick up food or drinks", points: 16 },
        { text: "Lost track of time", points: 12 },
        { text: "Waiting on spouse or kids", points: 9 }
      ]
    },
    {
      theme: "🎉 Everyday Life & Trivia",
      title: "Round 4",
      multiplier: 2,
      prompt: "Name something people spend way too much money on every week.",
      answers: [
        { text: "Iced coffee / Specialty drinks", points: 38 },
        { text: "Food delivery apps", points: 26 },
        { text: "Streaming subscriptions", points: 16 },
        { text: "Rideshares / Gas", points: 12 },
        { text: "Impulse online shopping", points: 8 }
      ]
    },
    {
      theme: "🎉 Everyday Life & Trivia",
      title: "Round 5",
      multiplier: 2,
      prompt: "Name something that always happens on a long road trip.",
      answers: [
        { text: "Eating all the snacks in the first hour", points: 36 },
        { text: "Arguing over the music playlist", points: 25 },
        { text: "Missing a highway exit", points: 18 },
        { text: "Unplanned restroom stops", points: 13 },
        { text: "Passengers falling asleep", points: 8 }
      ]
    },
    {
      theme: "⚡ Sudden-Death Tie-Breaker (#1 Answer Only)",
      title: "Tie-Breaker",
      multiplier: 3,
      prompt: "SUDDEN DEATH (#1 Answer Only): Name the first thing people check the moment they wake up.",
      answers: [
        { text: "Their smartphone / notifications!", points: 100 }
      ]
    }
  ],
  fastMoney: [
    {
      prompt: "Name a pizza topping almost everyone can agree on.",
      hint: "Cheese (42), Pepperoni (30), Mushrooms (14), Olives (8), Peppers (6)"
    },
    {
      prompt: "Name something people save and reuse instead of throwing away.",
      hint: "Plastic containers (45), Grocery bags (25), Glass jars (15), Gift bags (10), Foil (5)"
    },
    {
      prompt: "Name a popular board or card game played at game nights.",
      hint: "Uno (38), Monopoly (26), Catan (16), Codenames (12), Scrabble (8)"
    },
    {
      prompt: "Name a city people always want to visit on vacation.",
      hint: "New York (35), Paris (26), Tokyo (18), London (12), Rome (9)"
    },
    {
      prompt: "Name something you hear on the TV in a living room on weekends.",
      hint: "Live sports (42), Movies (26), News (16), Video games (10), Music (6)"
    }
  ]
};

window.Feud.DEFAULT_ROUNDS = window.Feud.DEFAULT_DECK.rounds;
window.Feud.FAST_MONEY_QUESTIONS = window.Feud.DEFAULT_DECK.fastMoney;
window.Feud.TEAM_PRESETS = window.Feud.DEFAULT_DECK.teamPresets;
window.Feud.ROOM_WORDS = window.Feud.DEFAULT_DECK.roomWords;
