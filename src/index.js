/**
 * Gefið efni fyrir verkefni 9, ekki er krafa að nota nákvæmlega þetta en nota
 * verður gefnar staðsetningar.
 */

import { el } from './lib/elements.js';
import { weatherSearch } from './lib/weather.js';

/**
 * @typedef {Object} SearchLocation
 * @property {string} title
 * @property {number} lat
 * @property {number} lng
 */

/**
 * Allar staðsetning sem hægt er að fá veður fyrir.
 * @type Array<SearchLocation>
 */
const locations = [
  {
    title: 'Reykjavík',
    lat: 64.1355,
    lng: -21.8954,
  },
  {
    title: 'Akureyri',
    lat: 65.6835,
    lng: -18.0878,
  },
  {
    title: 'New York',
    lat: 40.7128,
    lng: -74.006,
  },
  {
    title: 'Tokyo',
    lat: 35.6764,
    lng: 139.65,
  },
  {
    title: 'Sydney',
    lat: 33.8688,
    lng: 151.2093,
  },
];

/**
 * Hreinsar fyrri niðurstöður, passar að niðurstöður séu birtar og birtir element.
 * @param {Element} element
 */
function renderIntoResultsContent(element) {
  const loadingElement = document.querySelector('.loading');
  loadingElement.classList.add('hidden');
  // TODO útfæra
  const resultsNameElement = document.querySelector('.results__location');
  const resultsTextElement = document.querySelector('.results__text');
  const tableBodyElement = document.querySelector('.forecast tbody');
  const tableElement = document.querySelector('.forecast');
  resultsNameElement.textContent = '';
  resultsTextElement.textContent = '';
  tableBodyElement.textContent = '';

  resultsNameElement.classList.remove('hidden');
  resultsTextElement.classList.remove('hidden');
  tableElement.classList.remove('hidden');
}

/**
 * Birtir niðurstöður í viðmóti.
 * @param {SearchLocation} location
 * @param {Array<import('./lib/weather.js').Forecast>} results
 */
function renderResults(location, results) {
  renderIntoResultsContent(document.querySelector('.results'));

  // TODO útfæra
  console.log('render results', location, results);
  const resultsNameElement = document.querySelector('.results__location');
  const resultsTextElement = document.querySelector('.results__text');
  resultsNameElement.appendChild(document.createTextNode(location.title));
  resultsTextElement.appendChild(document.createTextNode('Spá fyrir daginn a breiddargráðu ' + location.lat
    + ' og lengdargráðu ' + location.lng));

  const tableElement = document.querySelector('.forecast tbody');

  const timeArray = results.hourly.time;
  const temperatureArray = results.hourly.temperature_2m;
  const precipitationArray = results.hourly.precipitation;

  for (let i = 0; i < timeArray.length; i++) {
    const tableRowElement = document.createElement('tr');
    const tableTimeElement = document.createElement('td');
    const tableTemperatureElement = document.createElement('td');
    const tablePrecipitationElement = document.createElement('td');
    tableTimeElement.appendChild(document.createTextNode(timeArray[i].substring(11, 16)));
    tableTemperatureElement.appendChild(document.createTextNode(temperatureArray[i]));
    tablePrecipitationElement.appendChild(document.createTextNode(precipitationArray[i]));
    tableRowElement.appendChild(tableTimeElement);
    tableRowElement.appendChild(tableTemperatureElement);
    tableRowElement.appendChild(tablePrecipitationElement);
    tableElement.appendChild(tableRowElement);
  }
}

/**
 * Birta villu í viðmóti.
 * @param {Error} error
 */
function renderError(error) {
  // TODO útfæra
  //console.log('render error', error);
  if (error = 'denied') {
    //console.log('render error', error);
    renderLoading();
    const loadingTextElement = document.querySelector('.results .loading');
    const resultsHeadingElement = document.querySelector('.results h2');
    const resultsTextElement = document.querySelector('.results .results__text');
    resultsHeadingElement.classList.remove('hidden');
    resultsTextElement.classList.remove('hidden');
    loadingTextElement.classList.add('hidden');
    resultsTextElement.textContent = "Gat ekki sótt stadsetningu";
  }
}

/**
 * Birta biðstöðu í viðmóti.
 */
function renderLoading() {
  console.log('render loading');
  // TODO útfæra
  const resultsHeadingElement = document.querySelector('.results h2');
  const loadingTextElement = document.querySelector('.results .loading');

  resultsHeadingElement.classList.remove('hidden');
  loadingTextElement.classList.remove('hidden');

  const tableElement = document.querySelector('.forecast');
  const resultsTextElement = document.querySelector('.results__text');
  const resultsLocationElement = document.querySelector('.results__location');
  tableElement.classList.add('hidden');
  resultsTextElement.classList.add('hidden');
  resultsLocationElement.classList.add('hidden');
}

/**
 * Framkvæmir leit að veðri fyrir gefna staðsetningu.
 * Birtir biðstöðu, villu eða niðurstöður í viðmóti.
 * @param {SearchLocation} location Staðsetning sem á að leita eftir.
 */
async function onSearch(location) {
  console.log('onSearch', location);

  // Birta loading state
  renderLoading();

  const results = await weatherSearch(location.lat, location.lng);

  console.log(results);
  // TODO útfæra
  // Hér ætti að birta og taka tillit til mismunandi staða meðan leitað er.

  if (results) {
    renderResults(location, results);
  } else {
    renderError('Villa við að sækja veðrið');
  }
}

/**
 * Framkvæmir leit að veðri fyrir núverandi staðsetningu.
 * Biður notanda um leyfi gegnum vafra.
 */
async function onSearchMyLocation() {
  console.log('onSearchMyLocation');

  // Check the permission state before requesting location
  navigator.permissions.query({ name: 'geolocation' }).then((result) => {
    console.log('Initial permission state:', result.state);

    // Handle 'granted' or 'prompt' states
    if (result.state === 'granted' || result.state === 'prompt') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Geolocation success', position.coords.latitude, position.coords.longitude);
          onSearch({
            title: 'Mín staðsetning',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          if (error.code === error.PERMISSION_DENIED) {
            console.log('User denied geolocation request.');
            renderError('Permission denied');
          }
        }
      );
    }
  });
}

/**
 * Býr til takka fyrir staðsetningu.
 * @param {string} locationTitle
 * @param {() => void} onSearch
 * @returns {HTMLElement}
 */
function renderLocationButton(locationTitle, onSearch) {
  // Notum `el` fallið til að búa til element og spara okkur nokkur skref.
  const locationElement = el(
    'li',
    { class: 'locations__location' },
    el(
      'button',
      { class: 'locations__button', click: onSearch },
      locationTitle,
    ),
  );

  /* Til smanburðar við el fallið ef við myndum nota DOM aðgerðir
  const locationElement = document.createElement('li');
  locationElement.classList.add('locations__location');
  const locationButton = document.createElement('button');
  locationButton.appendChild(document.createTextNode(locationTitle));
  locationButton.addEventListener('click', onSearch);
  locationElement.appendChild(locationButton);
  */

  return locationElement;
}

/**
 * Býr til grunnviðmót: haus og lýsingu, lista af staðsetningum og niðurstöður (falið í byrjun).
 * @param {Element} container HTML element sem inniheldur allt.
 * @param {Array<SearchLocation>} locations Staðsetningar sem hægt er að fá veður fyrir.
 * @param {(location: SearchLocation) => void} onSearch
 * @param {() => void} onSearchMyLocation
 */
function render(container, locations, onSearch, onSearchMyLocation) {
  // Búum til <main> og setjum `weather` class
  const parentElement = document.createElement('main');
  parentElement.classList.add('weather');

  // Búum til <header> með beinum DOM aðgerðum
  const headerElement = document.createElement('header');
  const heading = document.createElement('h1');
  heading.appendChild(document.createTextNode('🌬Veðrið⛄'));
  headerElement.appendChild(heading);
  parentElement.appendChild(headerElement);

  // inngangstexti
  const descriptionElement = document.createElement('p');
  descriptionElement.appendChild(document.createTextNode('Veldu stað til að sjá hita- og úrkomuspá.'));
  parentElement.appendChild(descriptionElement);

  // stadsetningar fyrirsogn
  const stadsetningarElement = document.createElement('h2');
  stadsetningarElement.appendChild(document.createTextNode('Staðsetningar'));
  parentElement.appendChild(stadsetningarElement);

  // Búa til <div class="loctions">
  const locationsElement = document.createElement('div');
  locationsElement.classList.add('locations');

  // Búa til <ul class="locations__list">
  const locationsListElement = document.createElement('ul');
  locationsListElement.classList.add('locations__list');

  // <div class="loctions"><ul class="locations__list"></ul></div>
  locationsElement.appendChild(locationsListElement);

  const liButtonElement = renderLocationButton('Mín staðsetning (þarf leyfi)', onSearchMyLocation);
  locationsListElement.appendChild(liButtonElement);

  // <div class="loctions"><ul class="locations__list"><li><li><li></ul></div>
  for (const location of locations) {
    const liButtonElement = renderLocationButton(location.title, () => {
      //console.log('Halló!!', location);
      onSearch(location);
    });
    locationsListElement.appendChild(liButtonElement);
  }

  parentElement.appendChild(locationsElement);

  // results div
  const resultsElement = document.createElement('div');
  resultsElement.classList.add('results');

  parentElement.appendChild(resultsElement);

  // results fyrirsogn
  const resultsHeadingElement = document.createElement('h2');
  resultsHeadingElement.appendChild(document.createTextNode('Niðurstöður'));
  resultsElement.appendChild(resultsHeadingElement);
  resultsHeadingElement.classList.add('hidden');

  // loading texti
  const loadingTextElement = document.createElement('p');
  loadingTextElement.appendChild(document.createTextNode('Leita að veðri...'));
  resultsElement.appendChild(loadingTextElement);
  loadingTextElement.classList.add('hidden');
  loadingTextElement.classList.add('loading');

  // h3 nafn á völdum stað
  const resultsLocationNameElement = document.createElement('h3');
  resultsLocationNameElement.classList.add('results__location');
  resultsElement.appendChild(resultsLocationNameElement);
  resultsLocationNameElement.classList.add('hidden');

  // results text
  const resultsTextElement = document.createElement('p');
  resultsElement.appendChild(resultsTextElement);
  resultsTextElement.classList.add('hidden');
  resultsTextElement.classList.add('results__text');

  // table fyrir nidurstodur
  const tableElement = document.createElement('table');
  tableElement.classList.add('forecast');
  resultsElement.appendChild(tableElement);
  const tableHeadElement = document.createElement('thead');
  const tableRowElement = document.createElement('tr');
  const tableHeadTimeElement = document.createElement('th');
  const tableHeadTemperatureElement = document.createElement('th');
  const tableHeadPrecipitationElement = document.createElement('th');
  tableHeadTimeElement.appendChild(document.createTextNode('Tími'));
  tableHeadElement.style.textAlign = 'left';
  tableHeadTemperatureElement.appendChild(document.createTextNode('Hiti (°C)'));
  tableHeadPrecipitationElement.appendChild(document.createTextNode('Úrkoma (mm)'));
  tableRowElement.appendChild(tableHeadTimeElement);
  tableRowElement.appendChild(tableHeadTemperatureElement);
  tableRowElement.appendChild(tableHeadPrecipitationElement);
  tableHeadElement.appendChild(tableRowElement);
  tableElement.appendChild(tableHeadElement);

  const tableBodyElement = document.createElement('tbody');
  tableElement.appendChild(tableBodyElement);
  tableElement.classList.add('hidden');

  container.appendChild(parentElement);
}

// Þetta fall býr til grunnviðmót og setur það í `document.body`
render(document.body, locations, onSearch, onSearchMyLocation);
