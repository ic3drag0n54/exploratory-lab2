// Built from the deck.gl tempalte and the trees code from class. Claude helped me understand what deck.gl react components were doing what.

import * as maplibregl from 'https://cdn.jsdelivr.net/npm/maplibre-gl@6.15.0/dist/maplibre-gl.mjs';

// how-to pitch and bearing modified from deck.gl.
const map = new maplibregl.Map({
  container: 'mapid',
  center: [-123.13, 49.254],    // [longitude, latitude]
  zoom: 11.5,
  pitch: 45,
  bearing: 0,
  style: 'https://tiles.openfreemap.org/styles/positron'
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');

const url = 'blocks.geojson';

const countColour = ['step', ['get', 'count'],
                     '#ffffb2',
                     2, '#fed976',
                     3, '#feb24c',
                     4, '#fd8d3c',
                     6, '#f03b20',
                     9, '#bd0026'];

// height for permit count: 60 metres for each permit.
const countHeight = ['*', ['get', 'count'], 60];

// Colour and height for permits per hectare.
const densityColour = ['step', ['get', 'density'],
                       '#ffffb2',
                       0.5, '#fed976',
                       1, '#feb24c',
                       2, '#fd8d3c',
                       3, '#f03b20',
                       4, '#bd0026'];

const densityHeight = ['*', ['get', 'density'], 150];

const blockPaint = {
  'fill-extrusion-color': countColour,
  'fill-extrusion-height': countHeight,
  'fill-extrusion-opacity': 0.85
};

// code from trees, claude help as well. was having trouble formatting popup multiple lines
// e.features[0] is the block that was clicked.
function onEachBlock(e) {
  const block = e.features[0].properties;
  const popup = new maplibregl.Popup();
  popup.setLngLat(e.lngLat);
  // \n starts a new line in the popup.
  popup.setText('Block ' + block.id +
                '\nPermits: ' + block.count +
                '\nPermits / ha: ' + block.density +
                '\nArea: ' + block.area_ha + ' ha');
  popup.addTo(map);
}

// Permit count button: change the colour and height back to permit count.
function showCount() {
  map.setPaintProperty('blocks-3d', 'fill-extrusion-color', countColour);
  map.setPaintProperty('blocks-3d', 'fill-extrusion-height', countHeight);
  // The highlight layer has to change height too, or it would not match the blocks.
  map.setPaintProperty('blocks-highlight', 'fill-extrusion-height', ['+', countHeight, 2]);

  document.getElementById('countLegend').style.display = 'block';
  document.getElementById('densityLegend').style.display = 'none';

  document.getElementById('countButton').className = 'active';
  document.getElementById('densityButton').className = '';
}

// Permits / hectare button: change the colour and height to density.
function showDensity() {
  map.setPaintProperty('blocks-3d', 'fill-extrusion-color', densityColour);
  map.setPaintProperty('blocks-3d', 'fill-extrusion-height', densityHeight);
  map.setPaintProperty('blocks-highlight', 'fill-extrusion-height', ['+', densityHeight, 2]);
  document.getElementById('countLegend').style.display = 'none';
  document.getElementById('densityLegend').style.display = 'block';
  document.getElementById('countButton').className = '';
  document.getElementById('densityButton').className = 'active';
}
// hovering popup. popup code modified from trees with claude assistance for the highlight and hovering.
const hoverPopup = new maplibregl.Popup({
  closeButton: false,
  closeOnClick: false
});

map.on('load', function () {
  map.addSource('blocks', {
    type: 'geojson',
    data: url,
    attribution: 'Building permits: City of Vancouver Open Data'
  });


  map.addLayer({
    id: 'blocks-3d',
    type: 'fill-extrusion',
    source: 'blocks',
    paint: blockPaint
  });

  //claude assist with this as well. wanted some way to show the highlighted block when hovering. tried to code as much as i could, claude helped clean up code and figure out how to implement.
  map.addLayer({
    id: 'blocks-highlight',
    type: 'fill-extrusion',
    source: 'blocks',
    filter: ['==', ['get', 'id'], -1],
    paint: {
      'fill-extrusion-color': '#18e0ff',
      'fill-extrusion-height': ['+', countHeight, 2],
      'fill-extrusion-opacity': 0.9
    }
  });

  map.on('click', 'blocks-3d', onEachBlock);

  // When the mouse moves over a block, show the hover popup there. Claude also (heavily) assisted with this.
  //Wanted to show the hovering popup for quicker information. Was really struggling with it though. Claude helped me work through issues and assist with code writing.
map.on('mousemove', 'blocks-3d', function (e) {
  map.getCanvas().style.cursor = 'pointer';
  const block = e.features[0].properties;
  hoverPopup.setLngLat(e.lngLat);
  hoverPopup.setText(
                     '\nPermits: ' + block.count +
                     '\nPermits / ha: ' + block.density +
                     '\nArea: ' + block.area_ha + ' ha');
  hoverPopup.addTo(map);
  // Highlight: show only the block whose id matches the one under the mouse.
  map.setFilter('blocks-highlight', ['==', ['get', 'id'], block.id]);
});

// When the mouse leaves the blocks, remove the hover popup.
map.on('mouseleave', 'blocks-3d', function () {
  map.getCanvas().style.cursor = '';
  hoverPopup.remove();
  // Turn the highlight off again.
  map.setFilter('blocks-highlight', ['==', ['get', 'id'], -1]);
});



  document.getElementById('countButton').addEventListener('click', showCount);
  document.getElementById('densityButton').addEventListener('click', showDensity);
});
