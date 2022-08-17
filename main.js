var _Map, _Draw, _Source, _Layer, _Coordinate, _ApiData, _Name, _No, _Panel;
var apiUrl = "http://localhost:5001/api/Directions";
var features = [];

InitializeMap = () => {
  
  GetUserPoints();

  _Source = new ol.source.Vector({ wrapX: false, features });

  _Layer = new ol.layer.Vector({
    source: _Source,
  });

  _Map = new ol.Map({
    target: "map",
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
      _Layer,
    ],
    view: new ol.View({
      center: [3875337.272593909, 4673762.797695817],
      zoom: 7,
    }),
  });
};

AddInteraction = () => {
  _Draw = new ol.interaction.Draw({
    source: _Source,
    type: "Point",
  });

  _Map.addInteraction(_Draw);

  _Draw.setActive(false);

  _Map.on("click", function (_event) {
    _Coordinate = ol.proj.transform(_event.coordinate, "EPSG:3857", "EPSG:4326");
  });

  _Draw.on("drawend", (_event) => {
    _Draw.setActive(false);

    _Panel = jsPanel.create({
      contentSize: "400 180",
      theme: "dark",
      headerTitle: "location ınfo",
      animateIn: "jsPanelFadeIn",
      boxShadow: 5,
      contentAjax: {
        url: "datatable-panel/js-panel.html",
      },
    });

    $(function () {
      $("#btnsubmit").click(function (_event) {
        _event.preventDefault();
        _Name = $("#name").val();
        _No = $("#no").val();

        _ApiData = {
          name: _Name,
          no: parseInt(_No),
          coordinateX: String(_Coordinate[0]),
          coordinateY: String(_Coordinate[1]),
        };

        $.ajax({
          type: "POST",
          url: apiUrl,
          contentType: "application/json",
          data: JSON.stringify(_ApiData),
          success: function () {
            _Panel.close();
            toastr.options = { timeOut: "1000" };
            toastr.success("The point has been added successfully");
          },
        });
      });
    });
  });
};

AddPoint = () => {
  _Draw.setActive(true);
};

QueryPoint = () => {
  jsPanel.create({
    contentSize: "1200 515",
    theme: "dark",
    headerTitle: "locations table",
    animateIn: "jsPanelFadeIn",
    boxShadow: 5,
    contentAjax: {
      url: "datatable-panel/data-table.html",
    },
  });
};


GetUserPoints = () => {
  $.ajax({
    type: "GET",
    url: apiUrl,
    contentType: "application/json",
    async: false,
    success: function (data) {
      if (data)
      {
        data.forEach((item) => {
          features.push(
            new ol.Feature({
              geometry: new ol.geom.Point(
                ol.proj.fromLonLat([
                  Number(item.coordinateX),
                  Number(item.coordinateY),
                ])
              ),
            })
          );
        });
      }
    }
  });
};
