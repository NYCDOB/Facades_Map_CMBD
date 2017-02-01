var map;
  var baseAPI = 'https://timothymartin76.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM facades_cmbd_merge WHERE cartodb_id = '

  var layerGroup = new L.LayerGroup();

  var TopComplaintsChartData = [];
  TopComplaintsChartData[0]={};


  var TopComplaintsChart;


  function init(){
    // initiate leaflet map
    map = new L.Map('map', { 
	scrollWheelZoom: false,
      center: [40.7,-73.96],
      zoom: 11
    })
   var layer = L.tileLayer('',{
  attribution: ''




    }).addTo(map);
    var layerUrl = 'https://timothymartin76.carto.com/api/v2/viz/b8612f9e-e7ed-11e6-9904-0e233c30368f/viz.json';
    var sublayers = [];




    var currentHover, newFeature = null;
    cartodb.createLayer(map, layerUrl)
      .addTo(map)
      .on('done', function(layer) {
        
        console.log("done");

        layer.getSubLayer(0).setInteraction(true);
        layer.on('featureOver', function(ev, pos, latlng, data){
          console.log("featureover");
          //check to see if it's the same feature so we don't waste an API call
          if(data.cartodb_id != currentHover) {
            layerGroup.clearLayers();
          
            $.getJSON(baseAPI + data.cartodb_id, function(res) {
          
              newFeature = L.geoJson(res,{
                style: {
                  "color": "#DCFF2E",
                  "weight": 3,
                  "opacity": 1
                }
              });
              layerGroup.addLayer(newFeature);
              layerGroup.addTo(map);
              updateSidebar(res.features[0].properties);
              updateChart(res.features[0].properties)

            })
            currentHover = data.cartodb_id;
          }
        })
        .on('featureOut', function(){
          layerGroup.clearLayers();
        })

        // // change the query for the first layer
        // var subLayerOptions = {
        //   sql: "SELECT * FROM ne_10m_populated_places_simple",
        //   cartocss: "#ne_10m_populated_places_simple{marker-fill: #F84F40; marker-width: 8; marker-line-color: white; marker-line-width: 2; marker-clip: false; marker-allow-overlap: true;}"
        // }
        // var sublayer = layer.getSubLayer(0);
        // sublayer.set(subLayerOptions);
        // sublayers.push(sublayer);


      })
      .on('error', function() {
        //log the error
      });
      }

      //from http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
      // String.prototype.toProperCase = function () {
      //   return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      // };

      function updateSidebar(f) {

        //first check if there is data
        if (f.cmbd == null) {
          $('.noData').show();
          $('.mainSidebar').hide();
        } else { 
          $('.noData').hide();
          $('.mainSidebar').show();
        }


        $('.cmbd').text(function(){
          return "Community Board:  " + f.cmbd;
        });

       $('.borough').text(function(){
          return "Borough:  " + f.borough;
        });

		$('.total_filings').text(function(){
          return "Total Facade Filings:  " + f.total_filings;
        });

       
        TopComplaintsChartData[0].key = "test";
        TopComplaintsChartData[0].values = 
          [
            { 
              "label" : "Safe" ,
              "value" : f.ok
            } , 
            { 
              "label" : "Safe w/Repair" , 
              "value" : f.sw
            } , 
            { 
              "label" : "No Report" , 
              "value" : f.nr
            } , 
            { 
              "label" : "Unsafe" , 
              "value" : f.un
            } 
          ]
        
       

       d3.select('#TopComplaintsChart svg')
      .datum(TopComplaintsChartData)
      .transition().duration(0)
      .call(TopComplaintsChart);

    

      }

//chart stuff
nv.addGraph(function() {
  TopComplaintsChart = nv.models.discreteBarChart()
      .x(function(d) { return d.label })    //Specify the data accessors.
      .y(function(d) { return d.value })
      .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
      .tooltips(false)        //Don't show tooltips
      .showValues(true)       //...instead, show the bar value right on top of each bar.
      .valueFormat(d3.format(".0f"))
	  .duration(200)
      .width(222)
      .showYAxis(false)
      .margin({left:0,right:0})
      .color(['rgb(31,120,180)','rgb(92,162,209)','rgb(102,102,102)','rgb(214,48,29)']);
      ;

      TopComplaintsChart.xAxis
      .axisLabel('')

     

  // d3.select('#chart svg')
  //     .datum(exampleData)
  //     .transition().duration(500)
  //     .call(chart);

  nv.utils.windowResize( TopComplaintsChart.update);

  return TopComplaintsChart;
});


