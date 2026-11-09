
const {DeckGL} = deck;
const {GeoJsonLayer} = deck;

// Your building data
const buildings = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Building One",
        description: "My first selected Vancouver building.",
        image: "images/building1.jpg",
        height: 60
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-123.1208, 49.2828],
          [-123.1205, 49.2828],
          [-123.1205, 49.2830],
          [-123.1208, 49.2830],
          [-123.1208, 49.2828]
        ]]
      }
    }
  ]
};

// Initial Vancouver view
const INITIAL_VIEW_STATE = {
  latitude: 49.254,
  longitude: -123.13,
  zoom: 11,
  pitch: 45,
  bearing: 0
};

// Create the map
const deckgl = new DeckGL({
  container: "map",

  mapStyle: "https://tiles.openfreemap.org/styles/positron",

  initialViewState: INITIAL_VIEW_STATE,

  controller: true,

  layers: [

    new GeoJsonLayer({
      id: "buildings",
      data: buildings,

      filled: true,
      stroked: true,
      extruded: true,

      getElevation: f => f.properties.height,

      getFillColor: [65, 140, 190],
      getLineColor: [255, 255, 255],

      pickable: true,
      autoHighlight: true,

      onClick: info => {
        if (info.object) {
          selectBuilding(info.object);
        }
      }
    })

  ]
});

// Building information panel
function selectBuilding(feature) {

  const p = feature.properties;

  document.getElementById("building-name").textContent = p.name;

  document.getElementById("building-description").textContent =
    p.description;

  document.getElementById("building-image").src = p.image;

  document.getElementById("info-panel").style.display = "block";

  const coords = feature.geometry.coordinates[0];

  const center = coords.reduce(
    (acc, coord) => [
      acc[0] + coord[0] / coords.length,
      acc[1] + coord[1] / coords.length
    ],
    [0, 0]
  );

  deckgl.setProps({
    viewState: {
      longitude: center[0],
      latitude: center[1],
      zoom: 17,
      pitch: 60,
      bearing: -20
    },
    transitionDuration: 1500,
    transitionInterpolator: new deck.FlyToInterpolator()
  });
}
