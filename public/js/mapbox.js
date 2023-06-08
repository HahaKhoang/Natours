/* eslint-disable */

const locations = JSON.parse(
  document.getElementById('map').dataset.locations
);

console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiaGFoYWhvYW5nIiwiYSI6ImNsaW5iZHluejBqd2YzcnRod2RydGJ1bnAifQ.2ZScbLOTbhLxDGZ2i_g1sw';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/hahahoang/clinbivpo01bn01p65gb1fw14',
  center: [-118.113491, 34.111745],
  zoom: 4,
  interactive: false,
});
