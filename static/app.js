const RECENT_CITIES_KEY = "weatherstation-recent-cities";

const state = {
  city: "Langston, Oklahoma",
  unit: "imperial",
  forecast: null,
  startupLoaded: false,
  startupResolved: false,
  suggestions: [],
  selectedSuggestionIndex: -1,
  suggestionRequestId: 0,
  suggestionQuery: "",
  articles: [],
  articleCategory: "all",
  articleLocationKey: "",
};

const elements = {
  searchForm: document.querySelector("#searchForm"),
  cityInput: document.querySelector("#cityInput"),
  suggestionsBox: document.querySelector("#suggestionsBox"),
  locateButton: document.querySelector("#locateButton"),
  unitToggle: document.querySelector("#unitToggle"),
  navTabs: document.querySelectorAll(".nav-tab"),
  categoryChips: document.querySelectorAll(".category-chip"),
  statusPill: document.querySelector("#statusPill"),
  locationLabel: document.querySelector("#locationLabel"),
  currentTemp: document.querySelector("#currentTemp"),
  currentTitle: document.querySelector("#currentTitle"),
  currentTagline: document.querySelector("#currentTagline"),
  roastLine: document.querySelector("#roastLine"),
  feelsLike: document.querySelector("#feelsLike"),
  humidity: document.querySelector("#humidity"),
  wind: document.querySelector("#wind"),
  precipitation: document.querySelector("#precipitation"),
  cloudCover: document.querySelector("#cloudCover"),
  pressure: document.querySelector("#pressure"),
  visibility: document.querySelector("#visibility"),
  uvIndex: document.querySelector("#uvIndex"),
  threatScore: document.querySelector("#threatScore"),
  threatLevel: document.querySelector("#threatLevel"),
  threatFill: document.querySelector("#threatFill"),
  threatSummary: document.querySelector("#threatSummary"),
  lightningRisk: document.querySelector("#lightningRisk"),
  lightningCopy: document.querySelector("#lightningCopy"),
  moodIndex: document.querySelector("#moodIndex"),
  moodCopy: document.querySelector("#moodCopy"),
  rainHustle: document.querySelector("#rainHustle"),
  rainCopy: document.querySelector("#rainCopy"),
  windHands: document.querySelector("#windHands"),
  windCopy: document.querySelector("#windCopy"),
  dispatchRoast: document.querySelector("#dispatchRoast"),
  dispatchAdvice: document.querySelector("#dispatchAdvice"),
  dispatchAdviceMain: document.querySelector("#dispatchAdviceMain"),
  dispatchExcuse: document.querySelector("#dispatchExcuse"),
  dispatchExcuseMain: document.querySelector("#dispatchExcuseMain"),
  latePass: document.querySelector("#latePass"),
  newsTicker: document.querySelector("#newsTicker"),
  newsGrid: document.querySelector("#newsGrid"),
  mapLabel: document.querySelector("#mapLabel"),
  timezoneLabel: document.querySelector("#timezoneLabel"),
  hourlyLabel: document.querySelector("#hourlyLabel"),
  forecastGrid: document.querySelector("#forecastGrid"),
  hourlyStrip: document.querySelector("#hourlyStrip"),
  recentCities: document.querySelector("#recentCities"),
  visitorCounter: document.querySelector("#visitorCounter"),
  boozeRunLabel: document.querySelector("#boozeRunLabel"),
  boozeButton: document.querySelector("#boozeButton"),
  shakeButton: document.querySelector("#shakeButton"),
  panicButton: document.querySelector("#panicButton"),
  tipButton: document.querySelector("#tipButton"),
  excuseButton: document.querySelector("#excuseButton"),
  roastButton: document.querySelector("#roastButton"),
  hotlineButton: document.querySelector("#hotlineButton"),
  gossipSeedButton: document.querySelector("#gossipSeedButton"),
  gossipClearButton: document.querySelector("#gossipClearButton"),
  gossipGrid: document.querySelector("#gossipGrid"),
  alertButton: document.querySelector("#alertButton"),
  sirenButton: document.querySelector("#sirenButton"),
  alertScreen: document.querySelector("#alertScreen"),
  pollGrid: document.querySelector("#pollGrid"),
  pollResult: document.querySelector("#pollResult"),
  scannerScreen: document.querySelector("#scannerScreen"),
  scannerButton: document.querySelector("#scannerButton"),
  scannerChaosButton: document.querySelector("#scannerChaosButton"),
  blotterGrid: document.querySelector("#blotterGrid"),
  hotlineList: document.querySelector("#hotlineList"),
  boozePlan: document.querySelector("#boozePlan"),
  lineStatus: document.querySelector("#lineStatus"),
  riskLevel: document.querySelector("#riskLevel"),
  reporterCards: document.querySelectorAll(".reporter-card"),
  suspectList: document.querySelector("#suspectList"),
  tvGuide: document.querySelector("#tvGuide"),
  communityBoard: document.querySelector("#communityBoard"),
  readerModal: document.querySelector("#readerModal"),
  readerBackdrop: document.querySelector("#readerBackdrop"),
  readerClose: document.querySelector("#readerClose"),
  readerTitle: document.querySelector("#readerTitle"),
  readerDek: document.querySelector("#readerDek"),
  readerBody: document.querySelector("#readerBody"),
  popupAd: document.querySelector("#popupAd"),
  popupClose: document.querySelector("#popupClose"),
  popupShuffle: document.querySelector("#popupShuffle"),
  popupTitle: document.querySelector("#popupTitle"),
  popupCopy: document.querySelector("#popupCopy"),
  forecastTemplate: document.querySelector("#forecastCardTemplate"),
  hourTemplate: document.querySelector("#hourCardTemplate"),
};

function setStatus(message) {
  elements.statusPill.textContent = message;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function shuffled(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function thunderLikely(code) {
  return [95, 96, 99].includes(code);
}

function convertTemperature(value) {
  if (state.unit === "metric") {
    return `${Math.round(((value - 32) * 5) / 9)}°C`;
  }
  return `${Math.round(value)}°F`;
}

function convertWind(value) {
  if (state.unit === "metric") {
    return `${Math.round(value * 1.60934)} km/h`;
  }
  return `${Math.round(value)} mph`;
}

function convertVisibility(value) {
  if (state.unit === "metric") {
    return `${(value * 1.60934).toFixed(1)} km`;
  }
  return `${value.toFixed(1)} mi`;
}

function formatTime(dateString) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric" }).format(new Date(dateString));
}

function formatDay(dateString) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(
    new Date(`${dateString}T12:00:00`)
  );
}

function loadRecentCities() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_CITIES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentCity(city) {
  const next = [city, ...loadRecentCities().filter((entry) => entry !== city)].slice(0, 8);
  localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(next));
  renderRecentCities();
}

function renderRecentCities() {
  const cities = loadRecentCities();
  elements.recentCities.innerHTML = "";
  cities.forEach((city) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-city";
    button.textContent = city;
    button.addEventListener("click", () => loadForecast({ city }));
    elements.recentCities.appendChild(button);
  });
}

function renderUnitButtons() {
  elements.unitToggle.querySelectorAll(".unit-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.unit === state.unit);
  });
}

function formatLocationLabel(location) {
  return [location.city, location.admin1, location.country].filter(Boolean).join(", ");
}

function hasNamedCity(location) {
  return Boolean(location?.city && location.city !== "Current Location");
}

function storyPlace(location) {
  return hasNamedCity(location) ? location.city : "your block";
}

function storyPossessivePlace(location) {
  return hasNamedCity(location) ? `${location.city}'s` : "your block's";
}

function displayLocationLabel(location) {
  return hasNamedCity(location) ? formatLocationLabel(location) : "Current Location";
}

function setActiveButtons(buttons, value, key = "tab") {
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset[key] === value || button.dataset.category === value);
  });
}

function hideSuggestions() {
  state.suggestions = [];
  state.selectedSuggestionIndex = -1;
  state.suggestionQuery = "";
  elements.suggestionsBox.hidden = true;
  elements.suggestionsBox.innerHTML = "";
}

function applySuggestion(location) {
  const label = formatLocationLabel(location);
  elements.cityInput.value = label;
  hideSuggestions();
  loadForecast({ lat: location.latitude, lon: location.longitude, city: location.city });
}

function renderSuggestions() {
  if (!state.suggestions.length) {
    hideSuggestions();
    return;
  }

  elements.suggestionsBox.hidden = false;
  elements.suggestionsBox.innerHTML = "";

  state.suggestions.forEach((location, index) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    if (index === state.selectedSuggestionIndex) {
      item.classList.add("active");
    }
    item.innerHTML = `<strong>${location.city}</strong><span>${[location.admin1, location.country].filter(Boolean).join(", ")}</span>`;
    item.addEventListener("mousedown", (event) => {
      event.preventDefault();
      applySuggestion(location);
    });
    elements.suggestionsBox.appendChild(item);
  });
}

async function fetchSuggestions(query) {
  state.suggestionQuery = query;
  const requestId = ++state.suggestionRequestId;
  try {
    const response = await fetch(`/api/locations?q=${encodeURIComponent(query)}`);
    const payload = await response.json();
    if (requestId !== state.suggestionRequestId || state.suggestionQuery !== query) {
      return;
    }
    state.suggestions = payload.results || [];
    state.selectedSuggestionIndex = state.suggestions.length ? 0 : -1;
    renderSuggestions();
  } catch {
    if (requestId !== state.suggestionRequestId || state.suggestionQuery !== query) {
      return;
    }
    hideSuggestions();
  }
}

async function searchAndLoadLocation(query) {
  try {
    const response = await fetch(`/api/locations?q=${encodeURIComponent(query)}`);
    const payload = await response.json();
    const first = (payload.results || [])[0];
    if (first) {
      applySuggestion(first);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function scoreThreat(current, daily, hourly) {
  const peakRain = Math.max(...hourly.map((entry) => entry.precipChance), 0);
  const peakWind = Math.max(current.windGusts, ...hourly.map((entry) => entry.windSpeed), 0);
  const thunderBonus = thunderLikely(current.weatherCode) || daily.some((entry) => thunderLikely(entry.weatherCode)) ? 28 : 0;
  return clamp(Math.round(current.cloudCover * 0.12 + peakRain * 0.4 + peakWind * 0.9 + thunderBonus), 0, 100);
}

function getRoastLine(current) {
  if (thunderLikely(current.weatherCode)) {
    return "This sky bangin around like somebody dropped a toolbox, a folding chair, and a bad attitude down the apartment stairs.";
  }
  if (current.cloudCover > 90) {
    return "These clouds got the whole day lookin like a bootleg VHS cover and smellin like unfinished arguments.";
  }
  if (current.windGusts > 30) {
    return "Wind outside doing random audits on hairstyles, cheap umbrellas, and anybody wearing lip gloss with confidence.";
  }
  if (current.precipitation > 0.2) {
    return "Rain picked today to be extra as hell like it saw your clean shoes, your fresh fit, and said 'fuck all that.'";
  }
  if (current.temperature > 88) {
    return "Heat got the whole neighborhood cooking like the sidewalk owe the sun back rent and a damn explanation.";
  }
  return "The weather behaving regular, but it still look like it got a loud-ass cousin who steals cable and talks through movies.";
}

function getDispatches(data) {
  const { current, hourly, location } = data;
  const rainPeak = Math.max(...hourly.map((entry) => entry.precipChance), 0);

  let roast = `On ${storyPlace(location)}, the sky got a shady look like it just said "trust me" with no plan.`;
  let advice = "Dress in layers and keep your business mobile in case outside start acting suspicious and disrespectful.";
  let excuse = `I was not late. ${storyPlace(location)} weather was outside creating obstacles, confusion, and unnecessary bitch-ass drama for the working people.`;

  if (thunderLikely(current.weatherCode)) {
    roast = "Thunder got the ceiling sounding like somebody upstairs losing a folding chair match while cussing everybody out through the floor.";
    advice = "Stay near shelter and do not volunteer to be the main character in a lightning scene, because that is dumb as shit.";
    excuse = "I had to wait. The sky was doing surround-sound foolishness with no adult supervision and entirely too much confidence.";
  } else if (rainPeak >= 70) {
    roast = "Rain lined up outside like it heard there was fresh laundry, laid edges, and confidence in the area and wanted to ruin every damn bit of it.";
    advice = "Bring a real umbrella, not that weak little snack-sized bullshit from the gas station that folds under peer pressure.";
    excuse = "The rain was stopping and frisking everybody who left the house in peace and then writing tickets for optimism.";
  } else if (current.windGusts >= 35) {
    roast = "Wind moving like a bitter ex with keys to every unsecured object in town and a personal grudge against hairstyles.";
    advice = "Secure hats, papers, wigs, receipts, cheap lawn furniture, and any lies you wrote on napkins.";
    excuse = "The wind physically challenged my route, kidnapped my paperwork, and slapped the attitude off a stop sign.";
  } else if (current.temperature >= 88) {
    roast = "This heat got the block shimmering like a fake alibi under police lights and sweating like it know it guilty.";
    advice = "Hydrate, move slow, and stop pretending denim is your friend today because that fabric don't give a damn about you.";
    excuse = "I would have been early, but the sun was out there oppressing the righteous and cooking the patience out my spirit.";
  } else if (current.cloudCover >= 85) {
    roast = "The whole sky look like it filmed a moody-ass music video on a borrowed camcorder and then refused to rewind the tape.";
    advice = "Keep a hoodie nearby because the vibe is gray, dramatic, and low on explanation but high on bullshit.";
    excuse = "The clouds made the whole day feel like a rerun of somebody else's bad decision with director's commentary.";
  }

  return { roast, advice, excuse };
}

function getNeighborhoodBulletins(location) {
  return [
    `Store manager on ${storyPlace(location)} says the slushie machine got stage fright and shut down before the after-school rush.`,
    `Unofficial block advisory: if the bus late, blame traffic, weather, and one loud-ass argument near the corner store.`,
    `Neighborhood memo says somebody's uncle is still on the porch giving a weather speech nobody asked for.`,
    `Alert from the hood desk: beauty supply parking lot energy remains chaotic with a 90% chance of horn abuse.`,
    `Public notice: if the fish spot line wraps around the building, that is not weather-related but it still feels important.`,
  ];
}

function getBoozeRuns(location) {
  return [
    {
      banner: `${storyPlace(location)} night crews reportedly targeting cognac, pineapple soda, and one suspiciously warm bag of ice.`,
      plan: "Primary move: grab drinks before the crowd gets loud and one dude starts explaining his mixtape.",
      line: "Line moving slow because somebody buying minis, loose chips, and arguing about lottery science.",
      risk: "Moderate hood risk. High chance of double parking, cigarette borrowing, and one dumb-ass debate in the doorway.",
    },
    {
      banner: `Beer fridge on ${storyPlace(location)} currently under pressure from after-work survivors, porch philosophers, and people dodging the damn rain.`,
      plan: "Recommended run: tall cans, blunt wraps, anti-social snacks, and a fast exit before the weather switch up.",
      line: "Cashier line unstable. Somebody counting crumpled bills like a hostage negotiator.",
      risk: "Elevated nonsense. Wind, booze, and side-eyes may combine into a parking-lot misunderstanding.",
    },
    {
      banner: `Late-night bottle mission on ${storyPlace(location)} expected to be complicated by fake weather confidence and one busted card reader.`,
      plan: "Best route: hit the nearest store, ignore all opinions by the front door, and keep receipts like legal evidence.",
      line: "Current line status says two regulars talking too much and one cousin buying exactly one stale-ass honey bun.",
      risk: "High petty-crime energy. Somebody definitely trying to sell cologne, headphones, or an unlocked phone by the entrance.",
    },
  ];
}

function getCrimeBlotter(location) {
  return [
    `Open container of gossip spilled across ${storyPlace(location)} after one auntie spotted her ex buying storm chips and cheap rum before sunset.`,
    `Umbrella assault reported near the bus stop. Witnesses say the wind swung first and the umbrella folded like a snitch.`,
    `Parking-lot diplomacy failed outside the liquor store when two Buicks tried to claim the same crooked-ass space at once.`,
    `Suspicious weather loitering observed over the block. Clouds seen circling with criminal intent and zero explanation.`,
    `Petty theft report: somebody walked off with three lighters, one sports drink, and a confidence level that felt federally illegal.`,
    `Noise complaint filed against thunder, porch dice, and one cousin laughing way too damn hard at 1:12 AM.`,
  ];
}

function getScannerIncidents(location) {
  return [
    `SCANNER 1: ${storyPlace(location)} corner store reports grape soda shelf wiped the fuck out by 2:14 PM. One cashier described the crowd as "thirsty, dramatic, and slightly feral."`,
    `SCANNER 2: Watermelon stack at the market collapsed after one uncle squeezed every damn melon like he was solving crimes with his fingertips.`,
    `SCANNER 3: EBT reader at the discount mart went down again. Line immediately transformed into a TED Talk about struggle, wires, and weak-ass management.`,
    `SCANNER 4: Beauty supply parking lot experiencing a hostile merge situation and two separate acts of horn-based disrespect.`,
    `SCANNER 5: Somebody on ${storyPossessivePlace(location)} east side reported a busted hydrant, three wet kids, and one auntie cussing the city with biblical confidence.`,
    `SCANNER 6: Chicken spot says fryer oil acting suspicious, drink machine dripping lies, and customers still ordering like rent not due.`,
    `SCANNER 7: Bus stop bench leaning like it heard all the gossip and want no more part of this raggedy-ass block.`,
    `SCANNER 8: Local porch committee confirms the weather got a slick mouth, fake smile, and too much damn free time.`,
  ];
}

function getPollResponse(key, location) {
  const responses = {
    weather: `Poll closed: 41% say this is plain weather bullshit, 33% say the sky woke up angry, and 26% say somebody need to cuss out a meteorologist on ${storyPlace(location)}.`,
    government: `Poll closed: 58% blame the city, 22% blame weak infrastructure, and the rest blame one lazy official who definitely "knew this shit was coming."`,
    haters: `Poll closed: 63% say haters hexed the block, 19% say an ex did candle work, and 18% say the vibes simply broke as hell this week.`,
    mercury: `Poll closed: 77% say Mercury is back on dickhead timing, while three aunties insist planets need ass-whippings too.`,
  };
  return responses[key] || "The poll machine jammed because the neighborhood answers came in too loud.";
}

function getSuspectFile(suspect, location) {
  const files = {
    sun: {
      title: "PRIMARY SUSPECT: THE SUN",
      deck: "Charged with overheating sidewalks, bleaching car paint, and flexing too hard on innocent foreheads.",
      body: `Detectives on ${storyPlace(location)} say the sun has been seen hanging high, talking greasy, and making everybody's car seat feel like attempted murder. Witnesses report excessive shining, aggressive glare, and repeated acts of sweaty-ass intimidation.`,
    },
    wind: {
      title: "PRIMARY SUSPECT: THE WIND",
      deck: "Wanted for slapping signs, flipping cheap umbrellas, and violating personal space blockwide.",
      body: `Residents allege the wind keeps running up on paper plates, front lace, loose receipts, and anybody carrying something important with both hands full. The suspect remains invisible, raggedy, and weirdly bold.`,
    },
    rain: {
      title: "PRIMARY SUSPECT: THE RAIN",
      deck: "Known to target clean sneakers, fresh errands, and people who just said 'it don't look too bad outside.'",
      body: `Investigators say the rain often waits until folks leave the house to start its shady-ass performance. Charges include sock sabotage, puddle fraud, and emotional damage to one decent hoodie on ${storyPlace(location)}.`,
    },
    clouds: {
      title: "PRIMARY SUSPECT: THE CLOUDS",
      deck: "Charged with loitering over the neighborhood and acting moody with no explanation whatsoever.",
      body: `Block witnesses say these clouds have been moving in packs, looking dark, and giving off fake-calm energy before every fresh piece of nonsense. Their lawyer released no statement and one weak-ass shrug.`,
    },
  };
  return files[suspect] || files.clouds;
}

function getPopupAds(location) {
  return [
    {
      title: "BOOTLEG METEOROLOGY CLASSES",
      copy: `Learn how to point at a cloud, cuss at it, and call yourself chief weather officer of ${storyPlace(location)}. Limited folding chairs available.`,
    },
    {
      title: "UNC DARNELL'S PORCH RADAR",
      copy: "Now offering same-day storm predictions, fish plate reviews, and half-reliable parking advice for two dollars and a nod.",
    },
    {
      title: "DISRESPECTFUL UMBRELLAS WHOLESALE",
      copy: "Buy 2 umbrellas, get 1 argument with the wind free. Not valid during sideways rain or personal growth.",
    },
    {
      title: "HOTLINE SPONSOR ALERT",
      copy: "This weather warning brought to you by the corner store fan section and whoever still selling DVDs from a duffel bag.",
    },
  ];
}

function getAlertMessages(location) {
  return [
    `CITYWIDE ALERT: ${storyPlace(location).toUpperCase()} CURRENTLY EXPERIENCING HIGH LEVELS OF OUTSIDE BULLSHIT.`,
    `BLOCK ADVISORY: DO NOT LET THIS NICE-LOOKING SKY FOOL YOUR DUMB ASS.`,
    `STREET WARNING: WIND, HEAT, OR RAIN MAY TRY TO HUMBLE YOU IN PUBLIC TODAY.`,
    `EMERGENCY BULLETIN: SOMEBODY UNCLE ALREADY BLAMED THE FORECAST FOR EVERYTHING SINCE 1998.`,
    `PUBLIC SAFETY NOTE: IF THE CLOUDS LOOK PETTY, TAKE YOUR BUSINESS ELSEWHERE.`,
  ];
}

function getGossipSeeds(location) {
  return [
    `Word on the block is ${storyPlace(location)} got one cloud that be circling like it owe everybody money.`,
    "Somebody near the liquor store swears the heat only pull up when they just got their hair done.",
    "A woman by the bus stop said the weather app lied and now she beefing with technology itself.",
    "Two cousins are arguing whether the wind hate braids specifically or just joy in general.",
    "Local rumor says the sky been acting dramatic because Mercury somewhere minding nobody's business.",
  ];
}

function getHotlineMessages(location) {
  return [
    `HOTLINE MESSAGE: "Why the hell is ${storyPlace(location)} sunny and shady at the same damn time?"`,
    'HOTLINE MESSAGE: "If this wind touch my plate again, I am writing my congressman."',
    'HOTLINE MESSAGE: "Tell the humidity to square up or calm down, pick one."',
    'HOTLINE MESSAGE: "I knew them clouds was fake when they smiled too hard this morning."',
  ];
}

function getReporterTake(reporter, location) {
  const takes = {
    "big-shirl": `BIG SHIRL reporting live from ${storyPlace(location)}: "The sky got too much mouth and not enough accountability. Back to you, player."`,
    "lil-ree": `LIL REE here: "I checked three corner stores and two aunties. Consensus says the weather acting foul and the snacks are overpriced."`,
    "unc-darnell": `UNC DARNELL on the porch: "I seen worse in '86, but this bullshit still unnecessary. Y'all be safe and stop trusting pretty clouds."`,
  };
  return takes[reporter] || "Reporter unavailable due to outside foolishness.";
}

function fakeArticles(data) {
  const { location, current, daily } = data;
  const firstDay = daily[0];
  const articles = [
    {
      category: "weather",
      title: `${storyPlace(location)} resident accuses ${firstDay.label.toLowerCase()} of "doing too damn much before noon" and demands a public apology.`,
      body:
        "Witnesses report the atmosphere came in loud, overdressed, half-cocked, and unwilling to explain a single damn thing. One woman near the donut shop said the whole sky looked like it had been rehearsing fake behavior since sunrise. Neighborhood analysts agreed that the weather had entered the day with entirely too much confidence for something acting that suspicious.",
      deck: "Residents say the atmosphere showed up with a slick mouth and no accountability.",
    },
    {
      category: "weather",
      title: `City council denies rumors that wind gusts are targeting cookout tents, paper plates, and old men in lawn chairs on purpose.`,
      body:
        `Officials say the ${Math.round(current.windGusts)} mph gusts are random, but porch witnesses say that is some lying-ass nonsense. Multiple family members claim the wind waited until the ribs hit the grill before getting disrespectful. One folding table has already been described as "emotionally unavailable" after a close call near the potato salad.`,
      deck: "Porch witnesses refuse to believe this much chaos could be accidental.",
    },
    {
      category: "weather",
      title: `Neighborhood relieved after sun clocked in for part-time duty despite ${current.cloudCover}% cloud cover and a lazy-ass attitude.`,
      body:
        "Experts say the brightness lasted long enough for one selfie, two bad decisions, and a completely unnecessary argument in sandals. Community members remain split on whether the sun was truly helping or just trying to show off after ducking responsibility all morning. A man outside the liquor store called it 'performative brightness' and then refused further comment.",
      deck: "Civic leaders say the sunshine contribution was small, flashy, and suspiciously timed.",
    },
    {
      category: "weather",
      title: `Local pressure pack reaches ${current.pressure} hPa, community asked to act normal anyway and immediately says "hell no."`,
      body:
        "Residents responded by minding some business, exaggerating the rest, and blaming the sky for every dumb choice since breakfast. Sources close to the smoke shop say customers were already on edge before the pressure report landed. Once word spread, three separate people blamed the atmosphere for old arguments, bad parking, and a busted toenail from 2024.",
      deck: "Pressure numbers drop and suddenly everybody got weather-related trauma.",
    },
    {
      category: "street",
      title: `Breaking: cousin fights invisible humidity, loses, cusses out porch furniture and a box fan.`,
      body:
        "Family members say the battle started peacefully until the sticky air got slick and turned the whole block into a sweaty-ass grievance hearing. A witness from across the street claims the first insult was directed at the air itself, followed by an extended rant at an innocent plastic chair. Mediation efforts failed once the box fan started wobbling like it had an opinion.",
      deck: "Humidity once again defeats common sense in a one-sided summer dispute.",
    },
    {
      category: "street",
      title: `Neighborhood dog refuses to pee in drizzle, stares at owner like "you take your dumb ass out there."`,
      body:
        "Animal analysts say the canine made a valid point and had better weather instincts than most grown people. The owner allegedly tried to motivate the dog with claps, encouragement, and one deeply embarrassing baby voice. None of it worked. Onlookers say the dog delivered a stare so judgmental it should count as a weather advisory by itself.",
      deck: "Experts rank the dog's side-eye among the strongest forecast signals of the week.",
    },
    {
      category: "store",
      title: `Corner store ice machine quits without notice, city enters crunchy beverage emergency.`,
      body:
        "Store employees confirmed the machine made one sad noise, leaked in a circle, and died like it was tired of everybody's shit. Customers arriving for cold drinks found only warm disappointment and one handwritten sign with no punctuation. A neighborhood spokesman described the scene as 'emotionally ragged' and requested immediate intervention before folks started buying room-temperature orange soda out of desperation.",
      deck: "Cold drink infrastructure collapses at the exact moment people need it most.",
    },
    {
      category: "services",
      title: `EBT reader down at neighborhood market, line now powered entirely by cussing and side-eyes.`,
      body:
        "Witnesses say one cashier whispered 'not again' and three customers immediately started calling cousins for backup cash. The line reportedly shifted from mild frustration to full theatrical performance within two minutes. One auntie was seen giving a speech about modern systems, weak management, and the spiritual collapse of customer service while still holding frozen fries.",
      deck: "Register drama escalates faster than expected under fluorescent lighting.",
    },
    {
      category: "services",
      title: `Barbershop says power flicker ruined two lineups and one man's whole damn weekend.`,
      body:
        "Officials at the scene described the mood as 'tense, betrayed, and ready to fight the electric company.' Sources inside the shop say the clippers cut out at a historic level of inconvenience. By the time the lights came back, one customer was demanding accountability, one barber was pacing in disbelief, and everybody else was acting like the grid had committed a personal offense.",
      deck: "Investigators say the timing was so bad it felt intentional.",
    },
    {
      category: "store",
      title: `Fish spot runs out of lemon pepper during weather confusion, community considers filing federal complaint.`,
      body:
        "Multiple residents confirmed this was the final insult in a week already full of heat, delays, and disrespect. People in line described the shortage as spiritually destabilizing and economically suspicious. One man claimed the weather distracted the kitchen, the manager blamed delivery issues, and two cousins in matching white tees offered twenty separate theories without evidence.",
      deck: "Culinary outrage spreads block by block as seasoning hopes collapse.",
    },
    {
      category: "services",
      title: `Laundromat change machine jams again, forcing grown adults into desperate quarter diplomacy.`,
      body:
        "Sources say two aunties brokered a peace deal near Dryer 6 while a toddler ate a cheese puff in silence. Witnesses described a tense economy built on loose coins, wrinkled dollar bills, and desperate eye contact. Management posted a note saying the machine was being serviced, but nobody in the building believed that shit for even one second.",
      deck: "Quarter negotiations resume after yet another mechanical betrayal.",
    },
    {
      category: "street",
      title: `Man on BMX bike circles the block nine times screaming free advice nobody asked for, then blames the heat for his philosophy.`,
      body:
        `Neighbors on ${storyPlace(location)} say the rider started with simple greetings and gradually evolved into a full TED Talk about loyalty, tire pressure, and why the city owes him compensation. The speech ended only when somebody's grandmother yelled out the window and asked if he had a damn job.`,
      deck: "Residents describe the performance as cardio-powered foolishness with no clear sponsor.",
    },
    {
      category: "store",
      title: `Corner store runs out of grape soda, peach rings, and patience within fourteen disrespectful minutes.`,
      body:
        "Cashiers say the rush began when one dude yelled 'they still got the cold ones!' and the whole front end turned into a survival exercise. Customers reported emotional whiplash, warm tempers, and at least one suspicious side deal near the pickle jar.",
      deck: "Snack-and-soda infrastructure remains shaky under real pressure.",
    },
    {
      category: "services",
      title: `City bus pulls off while two cousins still arguing at the back door, creating fresh beef at the stop.`,
      body:
        "Transit witnesses say the operator had reached a spiritual limit and refused to host one more second of open-door debate. The cousins accused the route of moving funny, while bystanders mostly accused everyone involved of being loud and late on purpose.",
      deck: "Public transportation once again forced to referee nonsense it did not create.",
    },
    {
      category: "street",
      title: `Liquor-store parking lot cookout nearly starts by accident after one trunk opened with hot links, dominoes, and no adult supervision.`,
      body:
        "People nearby insist the scene escalated organically from music, sunlight, and one overconfident folding table. Authorities considered shutting it down, but half the witnesses were already fixing plates and speaking in unhelpful hypotheticals.",
      deck: "What began as a quick beer run reportedly drifted into community event territory.",
    },
    {
      category: "services",
      title: `Apartment complex group chat melts down after mystery person leaves full-size couch by the dumpster like it's a peace offering.`,
      body:
        `Residents on ${storyPlace(location)} traded accusations, blurry photos, and typed threats in all caps for nearly three hours. One tenant claimed the couch had "criminal posture" from the start, while another suggested it was probably connected to the same person who never breaks down boxes.`,
      deck: "Digital neighborhood diplomacy fails again under furniture-related stress.",
    },
    {
      category: "store",
      title: `Smoke shop clerk says blunt-wrap shortage got customers speaking like hostage negotiators and amateur economists.`,
      body:
        "The situation deteriorated when a regular tried to buy every remaining pack and call it community leadership. Several people objected, one man invented a pricing conspiracy, and the clerk simply stared into middle distance like his soul clocked out at lunch.",
      deck: "Supply-chain panic reaches petty but fully theatrical levels.",
    },
    {
      category: "street",
      title: `Loose pit bull escapes cousin's yard, ignores everybody, then spends forty minutes just judging the block from the shade.`,
      body:
        "Despite intense neighborhood concern, the dog reportedly displayed zero aggression and one unbelievable amount of side-eye. Children were called inside, elders gave commentary, and three grown men with zero official training formed a retrieval squad that mostly argued about snacks.",
      deck: "Animal control was discussed loudly and contacted much later.",
    },
    {
      category: "weather",
      title: `Local man insists breeze "feels federal" and refuses to elaborate beyond one hard stare and a cigarette.`,
      body:
        "Porch meteorologists say the wind entered the neighborhood with badge energy, clipboard behavior, and way too much curiosity about unsecured receipts. Nobody could prove anything, but nobody felt comfortable either.",
      deck: "Street science continues to produce uncomfortable but vivid findings.",
    },
    {
      category: "store",
      title: `Beauty supply employee forced to mediate standoff over last edge-control jar like it was a hostage situation.`,
      body:
        "Witnesses say both claimants presented compelling arguments, shaky receipts, and enough attitude to heat the entire aisle. The jar was eventually placed behind the counter under protective watch while management evaluated who was being the bigger damn liar.",
      deck: "Retail peacekeeping units stretched thin by beauty emergencies.",
    },
    {
      category: "services",
      title: `Water shut off on one side of the block, forcing everybody to suddenly become experts in city negligence and bucket strategy.`,
      body:
        `Families on ${storyPlace(location)} responded with text threads, borrowed gallons, and one impromptu porch hearing about taxes, pipes, and the collapse of civilization. City voicemail remained full, unhelpful, and spiritually disrespectful.`,
      deck: "Hydration logistics now being handled with prayer and borrowed coolers.",
    },
    {
      category: "street",
      title: `Dice game pauses after one player accuses the sun of helping his cousin cheat by providing biased lighting.`,
      body:
        "No evidence of solar favoritism has been produced, but that did not stop a thirty-minute closing statement with visual aids and profanity. Neighbors describe the accusation as weak, loud, and somehow still more organized than most city meetings.",
      deck: "Game integrity remains under cloudless but questionable review.",
    },
    {
      category: "weather",
      title: `Forecast reaches awkward stage where everybody keeps saying "it ain't even that bad" while clearly suffering.`,
      body:
        "Observers report a neighborhood-wide epidemic of denial, damp shirts, and unnecessary bravado. The mood remained stable until one person admitted they were miserable, at which point six others instantly agreed and began blaming the atmosphere like it owed back child support.",
      deck: "Collective lying lasts only until the first honest sweat stain appears.",
    },
    {
      category: "store",
      title: `Fish market cat becomes local hero after slapping a roach off the chips rack with veteran precision.`,
      body:
        "Customers applauded, one employee whispered 'that's my dog,' and management briefly considered putting the animal on payroll. The cat, however, declined comment and returned to loaf position near the freezer like this sort of greatness was routine.",
      deck: "Unofficial pest-control operations continue to outperform paid systems.",
    },
    {
      category: "services",
      title: `Power company says outage was temporary; block says that don't explain melted groceries, broken AC, and two ruined lineups.`,
      body:
        "Residents accepted the statement the way people accept obvious lies from somebody already halfway backing toward their car. One elder summarized the community response best by saying, 'temporary to who, bitch?' before returning indoors to protect the last of the ice.",
      deck: "Official messaging once again fails to cool tempers or refrigerators.",
    },
    {
      category: "street",
      title: `Porch chair launched across yard during family argument, immediately reclassified as evidence and community property.`,
      body:
        "Nobody was harmed, but everybody had a theory. Witnesses spent the next hour reconstructing the flight path, debating motive, and insisting the chair had seen too much over the years to stay silent any longer.",
      deck: "Domestic drama briefly crosses into furniture forensics.",
    },
    {
      category: "store",
      title: `Mini-mart freezer starts screaming like a demon, customers continue shopping anyway because the wings still looked decent.`,
      body:
        "Staff members described the noise as concerning, spiritual, and above their pay grade. Shoppers mostly nodded, grabbed what they needed, and agreed to pretend the whole thing felt normal as long as the popsicles stayed alive.",
      deck: "Retail standards remain flexible when hunger and convenience team up.",
    },
    {
      category: "services",
      title: `Phone repair kiosk accused of holding one auntie's screen hostage for six business days and a mystery surcharge.`,
      body:
        `The auntie in question held court in front of the shop for nearly an hour, delivering a complete economic takedown of repair culture on ${storyPlace(location)}. Spectators described the speech as devastating, inspirational, and too accurate for comfort.`,
      deck: "Consumer-protection energy peaks near the food court.",
    },
    {
      category: "weather",
      title: `Rain cloud seen hovering over one specific barbecue like it had unresolved personal beef with joy itself.`,
      body:
        "Neighbors swear every other yard remained dry while one family reunion slowly accepted its fate under dripping disrespect. Paper plates warped, uncles cussed, and a tray of macaroni was evacuated with military urgency.",
      deck: "Meteorological targeting allegations grow louder by the minute.",
    },
    {
      category: "street",
      title: `Moped with no muffler wakes block at ungodly hour, disappears before anybody can throw a proper threat at it.`,
      body:
        "Residents emerged onto porches in bonnets, slides, and righteous fury, but the culprit had already converted noise into legend. One older neighbor promised consequences, though no one is fully sure she can run fast enough to deliver them.",
      deck: "Street accountability remains difficult when chaos has wheels.",
    },
    {
      category: "store",
      title: `Dollar store balloon release goes wrong, leaving one metallic '5' floating over traffic like a cursed-ass omen.`,
      body:
        "By the time workers noticed, half the block had already assigned spiritual meaning to the situation. Some saw warning, others saw celebration, but everybody agreed the balloon looked smug as hell.",
      deck: "Party-supply incident quickly upgraded to neighborhood symbolism.",
    },
    {
      category: "services",
      title: `DMV printer dies mid-appointment, forcing strangers to bond through mutual hatred and chair-based despair.`,
      body:
        "Employees begged for patience. Customers countered with loud sighs, hot gossip, and one devastating monologue about government machines always folding under pressure. No resolution was reached, but everyone left spiritually older.",
      deck: "Administrative suffering continues to unite people across all demographics.",
    },
    {
      category: "street",
      title: `Somebody's uncle starts giving legal advice outside the check-cashing spot despite never passing anything but judgment.`,
      body:
        "Listeners still gathered, partly out of curiosity and partly because he sounded extremely sure of himself. Several claims were made about taxes, warrants, and what counts as 'technically borrowed,' none of which survived light questioning.",
      deck: "Confidence once again mistaken for certification in broad daylight.",
    },
  ];

  return shuffled(articles).slice(0, 12);
}

function ensureArticlesForForecast(data) {
  const locationKey = [data.location.city, data.location.admin1, data.location.country].filter(Boolean).join("|");
  if (!state.articles.length || state.articleLocationKey !== locationKey) {
    state.articles = fakeArticles(data);
    state.articleLocationKey = locationKey;
  }
}

function renderNews() {
  const articles = state.articles;
  elements.newsGrid.innerHTML = "";
  const filtered =
    state.articleCategory === "all"
      ? articles
      : articles.filter((article) => article.category === state.articleCategory);
  const display = filtered.length ? filtered : articles;
  display.forEach((article) => {
    const index = articles.indexOf(article);
    const card = document.createElement("article");
    card.className = "news-card";
    card.innerHTML = `<h3>${article.title}</h3><p>${article.body}</p>`;
    card.addEventListener("click", () => openReader(index));
    elements.newsGrid.appendChild(card);
  });
}

function renderTicker(data) {
  const tickerBits = [
    `${storyPlace(data.location)} sky still under suspicion and talking wild as hell.`,
    `${data.current.title} reported loitering over the neighborhood with a shady-ass look.`,
    `Wind gusts at ${Math.round(data.current.windGusts)} and still talking crazy out the side of they neck.`,
    `Community warns umbrellas to stay ready because outside on bullshit.`,
    `Officials confirm the weather got one more smart-ass comment left in it.`,
    `Corner stores, bus stops, and beauty supply parking lots remain on high alert.`,
  ];
  elements.newsTicker.textContent = tickerBits.join("     •     ");
}

function renderGossip(location) {
  const seeds = getGossipSeeds(location);
  elements.gossipGrid.innerHTML = "";
  seeds.slice(0, 3).forEach((seed) => {
    const card = document.createElement("article");
    card.className = "gossip-card";
    card.textContent = seed;
    card.addEventListener("click", () => {
      elements.dispatchRoast.textContent = `GOSSIP DESK: ${seed}`;
      setStatus("BLOCK RUMOR UPDATED");
    });
    elements.gossipGrid.appendChild(card);
  });
}

function renderHotline(location) {
  const messages = getHotlineMessages(location);
  elements.hotlineList.innerHTML = "";
  messages.forEach((message) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hotline-item";
    button.textContent = message;
    button.addEventListener("click", () => {
      elements.alertScreen.textContent = message;
      setStatus("HOTLINE PLAYING LOUD-ASS MESSAGE");
    });
    elements.hotlineList.appendChild(button);
  });
}

function renderScanner(location, chaotic = false) {
  const incidents = getScannerIncidents(location);
  const picks = incidents.sort(() => Math.random() - 0.5).slice(0, chaotic ? 5 : 3);
  elements.scannerScreen.innerHTML = "";
  picks.forEach((incident) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "scanner-item";
    row.textContent = incident;
    row.addEventListener("click", () => {
      elements.readerTitle.textContent = "BLOCK SCANNER INCIDENT FILE";
      elements.readerDek.textContent = "Dispatch audio cleaned up only slightly. Language remains reckless as hell.";
      elements.readerBody.innerHTML = `<p>${incident}</p>`;
      elements.readerModal.hidden = false;
    });
    elements.scannerScreen.appendChild(row);
  });
}

function renderBlotter(location) {
  const notes = getCrimeBlotter(location);
  elements.blotterGrid.innerHTML = "";
  notes.slice(0, 4).forEach((note) => {
    const card = document.createElement("article");
    card.className = "blotter-card";
    card.textContent = note;
    card.addEventListener("click", () => {
      elements.readerTitle.textContent = "CRIME BLOTTER ENTRY";
      elements.readerDek.textContent = "Neighborhood incident log compiled by nosy people with good hearing.";
      elements.readerBody.innerHTML = `<p>${note}</p>`;
      elements.readerModal.hidden = false;
    });
    elements.blotterGrid.appendChild(card);
  });
}

function renderBoozeRun(location) {
  const runs = getBoozeRuns(location);
  const pick = runs[Math.floor(Math.random() * runs.length)];
  elements.boozeRunLabel.textContent = pick.banner;
  elements.boozePlan.textContent = pick.plan;
  elements.lineStatus.textContent = pick.line;
  elements.riskLevel.textContent = pick.risk;
}

function renderPopupAd(location) {
  const ads = getPopupAds(location);
  const choice = ads[Math.floor(Math.random() * ads.length)];
  elements.popupTitle.textContent = choice.title;
  elements.popupCopy.textContent = choice.copy;
  elements.popupAd.hidden = false;
}

function openReader(index) {
  const article = state.articles[index];
  if (!article) {
    return;
  }
  elements.readerTitle.textContent = article.title;
  elements.readerDek.textContent = article.deck || "The newsroom got details, accusations, and no damn restraint.";
  elements.readerBody.innerHTML = "";
  const chunks = article.body.split(". ").filter(Boolean);
  chunks.forEach((chunk) => {
    const p = document.createElement("p");
    p.textContent = chunk.endsWith(".") ? chunk : `${chunk}.`;
    elements.readerBody.appendChild(p);
  });
  elements.readerModal.hidden = false;
}

function closeReader() {
  elements.readerModal.hidden = true;
}

function randomizeNeighborhoodChaos() {
  if (!state.forecast) {
    return;
  }
  const bulletins = getNeighborhoodBulletins(state.forecast.location);
  const choice = bulletins[Math.floor(Math.random() * bulletins.length)];
  elements.dispatchAdvice.textContent = choice;
  elements.dispatchAdviceMain.textContent = choice;
  setStatus("BLOCK SHOOK. NEW FOOLISHNESS POSTED");
}

function rerollAlert() {
  if (!state.forecast) {
    return;
  }
  const alerts = getAlertMessages(state.forecast.location);
  elements.alertScreen.textContent = alerts[Math.floor(Math.random() * alerts.length)];
  setStatus("ALERT BOARD UPDATED");
}

function triggerPanicMode() {
  document.body.classList.add("panic-mode");
  elements.alertScreen.classList.add("alarm");
  rerollAlert();
  setStatus("PANIC MODE ACTIVATED. EVERYBODY ACT STUPID.");
  window.setTimeout(() => {
    document.body.classList.remove("panic-mode");
    elements.alertScreen.classList.remove("alarm");
  }, 2200);
}

function rerollExcuse() {
  if (!state.forecast) {
    return;
  }
  const dispatches = getDispatches(state.forecast);
  const extras = [
    "Also the bus smelled like bad decisions and wet denim.",
    "Also somebody blocked the lane just to argue in flip-flops.",
    "Also the store line moved like it had unresolved trauma.",
    "Also the whole street had main-character syndrome for no reason.",
  ];
  const bonus = extras[Math.floor(Math.random() * extras.length)];
  const excuse = `${dispatches.excuse} ${bonus}`;
  elements.dispatchExcuse.textContent = excuse;
  elements.dispatchExcuseMain.textContent = excuse;
  elements.latePass.textContent = excuse;
}

function rerollRoast() {
  if (!state.forecast) {
    return;
  }
  const variations = [
    getRoastLine(state.forecast.current),
    `This forecast look like it borrowed your charger, ate your snacks, and then blamed the weather anyway.`,
    `Outside got the energy of a cousin knocking with no text and too much damn confidence.`,
    `The sky over ${storyPlace(state.forecast.location)} look like it came to start mess and borrow gas money.`,
  ];
  elements.roastLine.textContent = variations[Math.floor(Math.random() * variations.length)];
}

function dropAnonymousTip() {
  if (!state.forecast) {
    return;
  }
  const tips = [
    `ANONYMOUS TIP: Somebody at the minimart says the forecast got a side chick, a fake chain, and no reliable transportation.`,
    `ANONYMOUS TIP: Word is the clouds seen outside arguing over who forgot to bring the damn shade to ${storyPlace(state.forecast.location)}.`,
    `ANONYMOUS TIP: A barber reported the heat walked in like it owned the block and left smelling like cheap cologne and bad intentions.`,
    `ANONYMOUS TIP: The block believes this weather personally hates errands, hair maintenance, and anybody wearing all white.`,
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];
  elements.dispatchRoast.textContent = tip;
  elements.alertScreen.textContent = tip;
  setStatus("ANONYMOUS MESS JUST HIT THE DESK");
}

function openHotlineReader() {
  if (!state.forecast) {
    return;
  }
  const messages = getHotlineMessages(state.forecast.location);
  elements.readerTitle.textContent = "GANGSTACAST HOTLINE TRANSCRIPT";
  elements.readerDek.textContent = "Callers from around the neighborhood continue to report outrageous levels of weather-related disrespect.";
  elements.readerBody.innerHTML = "";
  messages.forEach((message) => {
    const p = document.createElement("p");
    p.textContent = message;
    elements.readerBody.appendChild(p);
  });
  elements.readerModal.hidden = false;
}

function renderPollResult(location, selection = "weather") {
  elements.pollResult.textContent = getPollResponse(selection, location);
}

function renderAnalytics(data) {
  const { current, daily, hourly } = data;
  const score = scoreThreat(current, daily, hourly);
  elements.threatScore.textContent = String(score);
  elements.threatFill.style.width = `${score}%`;

  if (score > 84) {
    elements.threatLevel.textContent = "TOP-TIER NONSENSE";
    elements.threatSummary.textContent = "The sky is fully outside, fully loud, cussing under its breath, and absolutely not minding its damn business.";
  } else if (score > 64) {
    elements.threatLevel.textContent = "ACTIN UP";
    elements.threatSummary.textContent = "This forecast got a slick mouth, too much backup, and the kind of energy that starts dumb shit in parking lots.";
  } else if (score > 39) {
    elements.threatLevel.textContent = "LOOKIN SHADY";
    elements.threatSummary.textContent = "Not chaos yet, but the vibe upstairs is suspicious, oddly confident, and probably full of petty-ass ideas.";
  } else {
    elements.threatLevel.textContent = "CHILLIN KINDA";
    elements.threatSummary.textContent = "Outside is mostly behaving, though nobody trusts that shit for long.";
  }

  if (thunderLikely(current.weatherCode) || daily.slice(0, 2).some((entry) => thunderLikely(entry.weatherCode))) {
    elements.lightningRisk.textContent = "VERY RUDE";
    elements.lightningCopy.textContent = "Electric foolishness on file. Let the sky throw its loud-ass tantrum by itself.";
  } else {
    elements.lightningRisk.textContent = "LAYIN LOW";
    elements.lightningCopy.textContent = "No flashy nonsense yet, but keep one eye on them shady bitches anyway.";
  }

  if (current.cloudCover >= 85) {
    elements.moodIndex.textContent = "PETTY";
    elements.moodCopy.textContent = "The whole atmosphere came dressed in grayscale, side-eye, and unnecessary attitude.";
  } else if (current.temperature >= 84) {
    elements.moodIndex.textContent = "SHOWBOATIN";
    elements.moodCopy.textContent = "Sun outside flexing on everybody with no humility, no chill, and no damn indoor voice.";
  } else {
    elements.moodIndex.textContent = "REGULAR MESS";
    elements.moodCopy.textContent = "Not too wild, not too clean, just the usual outdoor bullshit with decent timing.";
  }

  const rainPeak = Math.max(...hourly.map((entry) => entry.precipChance), 0);
  elements.rainHustle.textContent = `${rainPeak}%`;
  elements.rainCopy.textContent =
    rainPeak >= 70
      ? "Rain about to pull rank on hairstyles, socks, and confidence."
      : "Rain in the mix, but not enough to fully run the damn neighborhood.";

  elements.windHands.textContent = convertWind(current.windGusts);
  elements.windCopy.textContent =
    current.windGusts >= 35
      ? "These gusts got boxing gloves and no sense of boundaries."
      : "Wind got opinions, but it ain't throwing furniture and cussing out lawn decor yet.";
}

function renderHourly(hourly) {
  elements.hourlyStrip.innerHTML = "";
  hourly.forEach((entry) => {
    const node = elements.hourTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".hour-time").textContent = formatTime(entry.time);
    node.querySelector(".hour-temp").textContent = convertTemperature(entry.temperature);
    node.querySelector(".hour-label").textContent = entry.label;
    node.querySelector(".hour-meta").innerHTML = `Rain: ${entry.precipChance}%<br>Wind: ${convertWind(entry.windSpeed)}`;
    elements.hourlyStrip.appendChild(node);
  });
}

function renderWeek(daily) {
  elements.forecastGrid.innerHTML = "";
  daily.forEach((entry) => {
    const node = elements.forecastTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".week-day").textContent = formatDay(entry.date);
    node.querySelector(".week-label").textContent = entry.label;
    node.querySelector(".week-temps").textContent = `${convertTemperature(entry.tempMax)} / ${convertTemperature(entry.tempMin)}`;
    node.querySelector(".week-meta").innerHTML = `Rain chance: ${entry.precipChance}%<br>Wind max: ${convertWind(entry.windMax)}`;
    elements.forecastGrid.appendChild(node);
  });
}

function renderForecast(data) {
  state.forecast = data;
  const { location, current, daily, hourly } = data;
  const placeBits = displayLocationLabel(location);

  elements.locationLabel.textContent = `CHECKIN ${placeBits.toUpperCase()}`;
  elements.currentTemp.textContent = convertTemperature(current.temperature);
  elements.currentTitle.textContent = current.title.toUpperCase();
  elements.currentTagline.textContent = current.tagline;
  elements.roastLine.textContent = getRoastLine(current);
  elements.feelsLike.textContent = convertTemperature(current.feelsLike);
  elements.humidity.textContent = `${current.humidity}%`;
  elements.wind.textContent = `${convertWind(current.windSpeed)} / ${convertWind(current.windGusts)}`;
  elements.precipitation.textContent = `${current.precipitation}"`;
  elements.cloudCover.textContent = `${current.cloudCover}%`;
  elements.pressure.textContent = `${current.pressure} hPa`;
  elements.visibility.textContent = convertVisibility(current.visibility);
  elements.uvIndex.textContent = String(current.uvIndex);
  elements.timezoneLabel.textContent = `${location.timezone} • Sunrise ${formatTime(daily[0].sunrise)} • Sunset ${formatTime(daily[0].sunset)}`;
  elements.mapLabel.textContent = `Radar says ${storyPlace(location)} got weather in the vicinity, bullshit on standby, and at least one cloud acting fake as hell.`;
  elements.hourlyLabel.textContent = `Next 12 hours on ${storyPlace(location)}: who talkin shit, who drippin, who gettin blown sideways, and who need to sit they ass down.`;

  const dispatches = getDispatches(data);
  elements.dispatchRoast.textContent = dispatches.roast;
  elements.dispatchAdvice.textContent = dispatches.advice;
  elements.dispatchAdviceMain.textContent = dispatches.advice;
  elements.dispatchExcuse.textContent = dispatches.excuse;
  elements.dispatchExcuseMain.textContent = dispatches.excuse;
  elements.latePass.textContent = `This certifies that ${storyPlace(location)} weather was doing entirely too much damn bullshit and may excuse tardiness, stink attitude, delayed errands, or cussing in public.`;

  ensureArticlesForForecast(data);
  renderAnalytics(data);
  renderNews();
  renderTicker(data);
  renderGossip(location);
  renderHotline(location);
  renderBlotter(location);
  renderScanner(location);
  renderBoozeRun(location);
  renderPollResult(location);
  renderHourly(hourly);
  renderWeek(daily);
  rerollAlert();
  renderPopupAd(location);
}

async function loadForecast(query = { city: state.city }) {
  const params = new URLSearchParams();
  if (query.city) {
    params.set("city", query.city);
  }
  if (query.lat !== undefined && query.lon !== undefined) {
    params.set("lat", query.lat);
    params.set("lon", query.lon);
  }

  setStatus("PULLIN SKY GOSSIP AND EXTRA BULLSHIT");
  try {
    const response = await fetch(`/api/forecast?${params.toString()}`);
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Weather acting funny as hell.");
    }
    renderForecast(payload);
    state.startupLoaded = true;
    if (payload.location.city) {
      if (hasNamedCity(payload.location)) {
        state.city = payload.location.city;
      }
      if (hasNamedCity(payload.location)) {
        saveRecentCity(payload.location.city);
      }
      elements.cityInput.value = displayLocationLabel(payload.location);
    }
    setStatus("FORECAST LOADED, LIES EXPOSED, BULLSHIT CLOCKED");
  } catch (error) {
    setStatus("THE SKY HUNG UP ON US LIKE A HO");
    elements.currentTitle.textContent = "RUDE";
    elements.currentTagline.textContent = error.message;
  }
}

function locateUser({ fallbackToDefault = false } = {}) {
  state.startupResolved = false;
  if (!navigator.geolocation) {
    setStatus("THIS BROWSER DO NOT KNOW YOUR BLOCK FOR SHIT");
    if (fallbackToDefault) {
      state.startupResolved = true;
      loadForecast({ city: "Langston, Oklahoma" });
    }
    return;
  }

  if (fallbackToDefault) {
    window.setTimeout(() => {
      if (!state.startupLoaded) {
        loadForecast({ city: "Langston, Oklahoma" });
      }
    }, 1800);
  }

  setStatus("TRYNA FIND YOUR CORNER, HOLD THE HELL ON");
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      state.startupResolved = true;
      loadForecast({ lat: coords.latitude, lon: coords.longitude });
    },
    () => {
      setStatus("LOCATION REQUEST GOT CURVED HARD AS HELL");
      if (fallbackToDefault) {
        state.startupResolved = true;
        loadForecast({ city: "Langston, Oklahoma" });
      }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const rawInput = elements.cityInput.value.trim();
  const city = rawInput && rawInput !== "Current Location" ? rawInput : state.city;
  const hasVisibleSuggestions = !elements.suggestionsBox.hidden && state.suggestions.length > 0;
  if (hasVisibleSuggestions && state.selectedSuggestionIndex >= 0 && state.suggestions[state.selectedSuggestionIndex]) {
    applySuggestion(state.suggestions[state.selectedSuggestionIndex]);
    return;
  }
  hideSuggestions();
  searchAndLoadLocation(city).then((matched) => {
    if (!matched) {
      loadForecast({ city });
    }
  });
});

elements.locateButton.addEventListener("click", locateUser);
elements.boozeButton.addEventListener("click", () => {
  if (!state.forecast) {
    return;
  }
  renderBoozeRun(state.forecast.location);
  setStatus("BOOZE REPORT UPDATED");
});
elements.shakeButton.addEventListener("click", randomizeNeighborhoodChaos);
elements.panicButton.addEventListener("click", triggerPanicMode);
elements.tipButton.addEventListener("click", dropAnonymousTip);
elements.excuseButton.addEventListener("click", rerollExcuse);
elements.roastButton.addEventListener("click", rerollRoast);
elements.hotlineButton.addEventListener("click", openHotlineReader);
elements.gossipSeedButton.addEventListener("click", () => {
  if (!state.forecast) {
    return;
  }
  renderGossip(state.forecast.location);
  setStatus("NEW BLOCK GOSSIP JUST DROPPED");
});
elements.gossipClearButton.addEventListener("click", () => {
  elements.gossipGrid.innerHTML = '<article class="gossip-card">Everybody got quiet for a second. Suspicious as hell.</article>';
  setStatus("GOSSIP TEMPORARILY WIPED");
});
elements.alertButton.addEventListener("click", rerollAlert);
elements.sirenButton.addEventListener("click", triggerPanicMode);
elements.scannerButton.addEventListener("click", () => {
  if (!state.forecast) {
    return;
  }
  renderScanner(state.forecast.location);
  setStatus("NEW INCIDENTS CRACKLIN ON THE SCANNER");
});
elements.scannerChaosButton.addEventListener("click", () => {
  if (!state.forecast) {
    return;
  }
  renderScanner(state.forecast.location, true);
  triggerPanicMode();
});
elements.readerBackdrop.addEventListener("click", closeReader);
elements.readerClose.addEventListener("click", closeReader);
elements.popupClose.addEventListener("click", () => {
  elements.popupAd.hidden = true;
});
elements.popupShuffle.addEventListener("click", () => {
  if (!state.forecast) {
    return;
  }
  renderPopupAd(state.forecast.location);
});
elements.communityBoard.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item) {
    return;
  }
  elements.dispatchRoast.textContent = `COMMUNITY REPORT: ${item.textContent}`;
  setStatus("NEIGHBORHOOD TEA UPDATED");
});
elements.reporterCards.forEach((button) => {
  button.addEventListener("click", () => {
    if (!state.forecast) {
      return;
    }
    const take = getReporterTake(button.dataset.reporter, state.forecast.location);
    elements.readerTitle.textContent = "FIELD REPORT";
    elements.readerDek.textContent = "Local correspondents continue to be loud, underpaid, and extremely correct.";
    elements.readerBody.innerHTML = `<p>${take}</p>`;
    elements.readerModal.hidden = false;
  });
});
elements.pollGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".poll-option");
  if (!button || !state.forecast) {
    return;
  }
  elements.pollGrid.querySelectorAll(".poll-option").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  renderPollResult(state.forecast.location, button.dataset.poll);
  setStatus("BLOCK POLL UPDATED WITH UNNECESSARY CONFIDENCE");
});
elements.suspectList.addEventListener("click", (event) => {
  const button = event.target.closest(".suspect-card");
  if (!button || !state.forecast) {
    return;
  }
  const file = getSuspectFile(button.dataset.suspect, state.forecast.location);
  elements.readerTitle.textContent = file.title;
  elements.readerDek.textContent = file.deck;
  elements.readerBody.innerHTML = `<p>${file.body}</p>`;
  elements.readerModal.hidden = false;
  setStatus("SUSPECT FILE OPENED");
});
elements.tvGuide.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item) {
    return;
  }
  elements.readerTitle.textContent = "TONIGHT ON GANGSTACAST";
  elements.readerDek.textContent = "Programming for people who love weather, drama, and unnecessary volume.";
  elements.readerBody.innerHTML = `<p>${item.textContent}</p><p>This episode is sponsored by loud opinions, porch chairs, and a city budget held together with one zip tie and blind faith.</p>`;
  elements.readerModal.hidden = false;
  setStatus("TV GUIDE OPENED");
});
elements.navTabs.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveButtons(elements.navTabs, button.dataset.tab);
    if (button.dataset.tab === "news") {
      window.scrollTo({ top: elements.newsGrid.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    } else if (button.dataset.tab === "gossip") {
      window.scrollTo({ top: elements.gossipGrid.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    } else if (button.dataset.tab === "alerts") {
      window.scrollTo({ top: elements.alertScreen.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    } else if (button.dataset.tab === "scanner") {
      window.scrollTo({ top: elements.scannerScreen.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    } else if (button.dataset.tab === "ads") {
      elements.popupAd.hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});
elements.categoryChips.forEach((button) => {
  button.addEventListener("click", () => {
    state.articleCategory = button.dataset.category;
    setActiveButtons(elements.categoryChips, state.articleCategory, "category");
    if (state.forecast) {
      renderNews();
    }
  });
});

elements.cityInput.addEventListener("input", () => {
  const query = elements.cityInput.value.trim();
  state.suggestionRequestId += 1;
  hideSuggestions();
  if (query.length < 2) {
    return;
  }
  fetchSuggestions(query);
});

elements.cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.readerModal.hidden) {
    closeReader();
    return;
  }
  if (!state.suggestions.length) {
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    state.selectedSuggestionIndex = (state.selectedSuggestionIndex + 1) % state.suggestions.length;
    renderSuggestions();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    state.selectedSuggestionIndex =
      (state.selectedSuggestionIndex - 1 + state.suggestions.length) % state.suggestions.length;
    renderSuggestions();
  } else if (event.key === "Escape") {
    hideSuggestions();
  }
});

elements.cityInput.addEventListener("blur", () => {
  window.setTimeout(() => {
    hideSuggestions();
  }, 120);
});

elements.unitToggle.addEventListener("click", (event) => {
  const button = event.target.closest(".unit-button");
  if (!button || button.dataset.unit === state.unit) {
    return;
  }
  state.unit = button.dataset.unit;
  renderUnitButtons();
  if (state.forecast) {
    renderForecast(state.forecast);
  }
});

renderUnitButtons();
renderRecentCities();
elements.visitorCounter.textContent = String(80431 + Math.floor(Math.random() * 500));
locateUser({ fallbackToDefault: true });
