const RECENT_CITIES_KEY = "weatherstation-recent-cities";

const state = {
  city: "Los Angeles",
  unit: "imperial",
  forecast: null,
  suggestions: [],
  selectedSuggestionIndex: -1,
  suggestionRequestId: 0,
  suggestionQuery: "",
  articles: [],
};

const elements = {
  searchForm: document.querySelector("#searchForm"),
  cityInput: document.querySelector("#cityInput"),
  suggestionsBox: document.querySelector("#suggestionsBox"),
  locateButton: document.querySelector("#locateButton"),
  unitToggle: document.querySelector("#unitToggle"),
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
  shakeButton: document.querySelector("#shakeButton"),
  excuseButton: document.querySelector("#excuseButton"),
  roastButton: document.querySelector("#roastButton"),
  communityBoard: document.querySelector("#communityBoard"),
  readerModal: document.querySelector("#readerModal"),
  readerBackdrop: document.querySelector("#readerBackdrop"),
  readerClose: document.querySelector("#readerClose"),
  readerTitle: document.querySelector("#readerTitle"),
  readerDek: document.querySelector("#readerDek"),
  readerBody: document.querySelector("#readerBody"),
  forecastTemplate: document.querySelector("#forecastCardTemplate"),
  hourTemplate: document.querySelector("#hourCardTemplate"),
};

function setStatus(message) {
  elements.statusPill.textContent = message;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

  let roast = `In ${location.city}, the sky got a shady look like it just said "trust me" with no plan.`;
  let advice = "Dress in layers and keep your business mobile in case outside start acting suspicious and disrespectful.";
  let excuse = `I was not late. ${location.city} weather was outside creating obstacles, confusion, and unnecessary bitch-ass drama for the working people.`;

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
    `Store manager in ${location.city} says the slushie machine got stage fright and shut down before the after-school rush.`,
    `Unofficial block advisory: if the bus late, blame traffic, weather, and one loud-ass argument near the corner store.`,
    `Neighborhood memo says somebody's uncle is still on the porch giving a weather speech nobody asked for.`,
    `Alert from the hood desk: beauty supply parking lot energy remains chaotic with a 90% chance of horn abuse.`,
    `Public notice: if the fish spot line wraps around the building, that is not weather-related but it still feels important.`,
  ];
}

function fakeArticles(data) {
  const { location, current, daily } = data;
  const firstDay = daily[0];
  return [
    {
      title: `${location.city} resident accuses ${firstDay.label.toLowerCase()} of "doing too damn much before noon" and demands a public apology.`,
      body:
        "Witnesses report the atmosphere came in loud, overdressed, half-cocked, and unwilling to explain a single damn thing. One woman near the donut shop said the whole sky looked like it had been rehearsing fake behavior since sunrise. Neighborhood analysts agreed that the weather had entered the day with entirely too much confidence for something acting that suspicious.",
      deck: "Residents say the atmosphere showed up with a slick mouth and no accountability.",
    },
    {
      title: `City council denies rumors that wind gusts are targeting cookout tents, paper plates, and old men in lawn chairs on purpose.`,
      body:
        `Officials say the ${Math.round(current.windGusts)} mph gusts are random, but porch witnesses say that is some lying-ass nonsense. Multiple family members claim the wind waited until the ribs hit the grill before getting disrespectful. One folding table has already been described as "emotionally unavailable" after a close call near the potato salad.`,
      deck: "Porch witnesses refuse to believe this much chaos could be accidental.",
    },
    {
      title: `Neighborhood relieved after sun clocked in for part-time duty despite ${current.cloudCover}% cloud cover and a lazy-ass attitude.`,
      body:
        "Experts say the brightness lasted long enough for one selfie, two bad decisions, and a completely unnecessary argument in sandals. Community members remain split on whether the sun was truly helping or just trying to show off after ducking responsibility all morning. A man outside the liquor store called it 'performative brightness' and then refused further comment.",
      deck: "Civic leaders say the sunshine contribution was small, flashy, and suspiciously timed.",
    },
    {
      title: `Local pressure pack reaches ${current.pressure} hPa, community asked to act normal anyway and immediately says "hell no."`,
      body:
        "Residents responded by minding some business, exaggerating the rest, and blaming the sky for every dumb choice since breakfast. Sources close to the smoke shop say customers were already on edge before the pressure report landed. Once word spread, three separate people blamed the atmosphere for old arguments, bad parking, and a busted toenail from 2024.",
      deck: "Pressure numbers drop and suddenly everybody got weather-related trauma.",
    },
    {
      title: `Breaking: cousin fights invisible humidity, loses, cusses out porch furniture and a box fan.`,
      body:
        "Family members say the battle started peacefully until the sticky air got slick and turned the whole block into a sweaty-ass grievance hearing. A witness from across the street claims the first insult was directed at the air itself, followed by an extended rant at an innocent plastic chair. Mediation efforts failed once the box fan started wobbling like it had an opinion.",
      deck: "Humidity once again defeats common sense in a one-sided summer dispute.",
    },
    {
      title: `Neighborhood dog refuses to pee in drizzle, stares at owner like "you take your dumb ass out there."`,
      body:
        "Animal analysts say the canine made a valid point and had better weather instincts than most grown people. The owner allegedly tried to motivate the dog with claps, encouragement, and one deeply embarrassing baby voice. None of it worked. Onlookers say the dog delivered a stare so judgmental it should count as a weather advisory by itself.",
      deck: "Experts rank the dog's side-eye among the strongest forecast signals of the week.",
    },
    {
      title: `Corner store ice machine quits without notice, city enters crunchy beverage emergency.`,
      body:
        "Store employees confirmed the machine made one sad noise, leaked in a circle, and died like it was tired of everybody's shit. Customers arriving for cold drinks found only warm disappointment and one handwritten sign with no punctuation. A neighborhood spokesman described the scene as 'emotionally ragged' and requested immediate intervention before folks started buying room-temperature orange soda out of desperation.",
      deck: "Cold drink infrastructure collapses at the exact moment people need it most.",
    },
    {
      title: `EBT reader down at neighborhood market, line now powered entirely by cussing and side-eyes.`,
      body:
        "Witnesses say one cashier whispered 'not again' and three customers immediately started calling cousins for backup cash. The line reportedly shifted from mild frustration to full theatrical performance within two minutes. One auntie was seen giving a speech about modern systems, weak management, and the spiritual collapse of customer service while still holding frozen fries.",
      deck: "Register drama escalates faster than expected under fluorescent lighting.",
    },
    {
      title: `Barbershop says power flicker ruined two lineups and one man's whole damn weekend.`,
      body:
        "Officials at the scene described the mood as 'tense, betrayed, and ready to fight the electric company.' Sources inside the shop say the clippers cut out at a historic level of inconvenience. By the time the lights came back, one customer was demanding accountability, one barber was pacing in disbelief, and everybody else was acting like the grid had committed a personal offense.",
      deck: "Investigators say the timing was so bad it felt intentional.",
    },
    {
      title: `Fish spot runs out of lemon pepper during weather confusion, community considers filing federal complaint.`,
      body:
        "Multiple residents confirmed this was the final insult in a week already full of heat, delays, and disrespect. People in line described the shortage as spiritually destabilizing and economically suspicious. One man claimed the weather distracted the kitchen, the manager blamed delivery issues, and two cousins in matching white tees offered twenty separate theories without evidence.",
      deck: "Culinary outrage spreads block by block as seasoning hopes collapse.",
    },
    {
      title: `Laundromat change machine jams again, forcing grown adults into desperate quarter diplomacy.`,
      body:
        "Sources say two aunties brokered a peace deal near Dryer 6 while a toddler ate a cheese puff in silence. Witnesses described a tense economy built on loose coins, wrinkled dollar bills, and desperate eye contact. Management posted a note saying the machine was being serviced, but nobody in the building believed that shit for even one second.",
      deck: "Quarter negotiations resume after yet another mechanical betrayal.",
    },
  ];
}

function renderNews(data) {
  const articles = fakeArticles(data);
  state.articles = articles;
  elements.newsGrid.innerHTML = "";
  articles.forEach((article, index) => {
    const card = document.createElement("article");
    card.className = "news-card";
    card.innerHTML = `<h3>${article.title}</h3><p>${article.body}</p>`;
    card.addEventListener("click", () => openReader(index));
    elements.newsGrid.appendChild(card);
  });

  const tickerBits = [
    `${data.location.city} sky still under suspicion and talking wild as hell.`,
    `${data.current.title} reported loitering over the neighborhood with a shady-ass look.`,
    `Wind gusts at ${Math.round(data.current.windGusts)} and still talking crazy out the side of they neck.`,
    `Community warns umbrellas to stay ready because outside on bullshit.`,
    `Officials confirm the weather got one more smart-ass comment left in it.`,
    `Corner stores, bus stops, and beauty supply parking lots remain on high alert.`,
  ];
  elements.newsTicker.textContent = tickerBits.join("     •     ");
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
    `The sky over ${state.forecast.location.city} look like it came to start mess and borrow gas money.`,
  ];
  elements.roastLine.textContent = variations[Math.floor(Math.random() * variations.length)];
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
  const placeBits = [location.city, location.admin1, location.country].filter(Boolean).join(", ");

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
  elements.mapLabel.textContent = `Radar says ${location.city} got weather in the vicinity, bullshit on standby, and at least one cloud acting fake as hell.`;
  elements.hourlyLabel.textContent = `Next 12 hours in ${location.city}: who talkin shit, who drippin, who gettin blown sideways, and who need to sit they ass down.`;

  const dispatches = getDispatches(data);
  elements.dispatchRoast.textContent = dispatches.roast;
  elements.dispatchAdvice.textContent = dispatches.advice;
  elements.dispatchAdviceMain.textContent = dispatches.advice;
  elements.dispatchExcuse.textContent = dispatches.excuse;
  elements.dispatchExcuseMain.textContent = dispatches.excuse;
  elements.latePass.textContent = `This certifies that ${location.city} weather was doing entirely too much damn bullshit and may excuse tardiness, stink attitude, delayed errands, or cussing in public.`;

  renderAnalytics(data);
  renderNews(data);
  renderHourly(hourly);
  renderWeek(daily);
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
    if (payload.location.city) {
      state.city = payload.location.city;
      saveRecentCity(payload.location.city);
      elements.cityInput.value = formatLocationLabel(payload.location);
    }
    setStatus("FORECAST LOADED, LIES EXPOSED, BULLSHIT CLOCKED");
  } catch (error) {
    setStatus("THE SKY HUNG UP ON US LIKE A HO");
    elements.currentTitle.textContent = "RUDE";
    elements.currentTagline.textContent = error.message;
  }
}

function locateUser() {
  if (!navigator.geolocation) {
    setStatus("THIS BROWSER DO NOT KNOW YOUR BLOCK FOR SHIT");
    return;
  }

  setStatus("TRYNA FIND YOUR CORNER, HOLD THE HELL ON");
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      loadForecast({ lat: coords.latitude, lon: coords.longitude });
    },
    () => {
      setStatus("LOCATION REQUEST GOT CURVED HARD AS HELL");
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = elements.cityInput.value.trim() || state.city;
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
elements.shakeButton.addEventListener("click", randomizeNeighborhoodChaos);
elements.excuseButton.addEventListener("click", rerollExcuse);
elements.roastButton.addEventListener("click", rerollRoast);
elements.readerBackdrop.addEventListener("click", closeReader);
elements.readerClose.addEventListener("click", closeReader);
elements.communityBoard.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item) {
    return;
  }
  elements.dispatchRoast.textContent = `COMMUNITY REPORT: ${item.textContent}`;
  setStatus("NEIGHBORHOOD TEA UPDATED");
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
loadForecast({ city: state.city });
