//// Script to apply different warter index ////
// Creating the collection
// Creating geometry to clip every image in the collection for a specific site

var geometry = ee.Geometry.Polygon(
        [[[-48.74015808105469,-26.37372339295363],
            [-48.65947723388672,-26.37372339295363],
            [-48.65947723388672,-26.31895972813747],
            [-48.74015808105469,-26.31895972813747],
            [-48.74015808105469,-26.37372339295363]]]);
Map.centerObject(geometry, 11);

function reflec_corr (image){
  var opticalBands = image.select("B.").multiply(0.0001); //applying the scale factor of Sentinel-2 collection
    return image
    .addBands(opticalBands, null, true);
  }

var img1 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2022-07-01', '2022-07-05') //image in low tide condition
  .filterBounds(ee.Geometry.Point([-48.69, -26.32]))
  .map(reflec_corr);

var img2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2022-06-16', '2022-06-20') //image in mean tide condition
  .filterBounds(ee.Geometry.Point([-48.69, -26.32]))
  .map(reflec_corr);

var img3 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2022-06-11', '2022-06-15') //image in high tide condition
  .filterBounds(ee.Geometry.Point([-48.69, -26.32]))
  .map(reflec_corr);

var Bay_Plenty_collection = img1.merge(img2).merge(img3);  // merging the images into a collection
print ("Colection: ", Bay_Plenty_collection);

// Defining the index and clip funcitons
function indices (image) {
  var ndwi = image.normalizedDifference(['B3', 'B8']).rename ('ndwi'); //Mc Feeters, 1996
  var mndwi = image.normalizedDifference(['B3', 'B11']).rename('mndwi'); // Xu, 2006 (B11 = SWI1 = Short wave infrared 1)
  var awei = image.expression('((B + 2.5 * G) - (1.5 * (N + S)) - (0.25 * S2)) ',{ //Feyisa etal, 2014
   B: image.select('B2'),
   G: image.select('B3'), 
   S: image.select('B11'), 
   N: image.select('B8'),
   S2: image.select('B12'),
   }).rename('awei');
   var awei2 = image.expression('(4 * (G - S)) - (0.25 * N + 2.75 * S) ',{ //Feyisa etal, 2014
   B: image.select('B2'),
   G: image.select('B3'), 
   S: image.select('B11'), 
   N: image.select('B8'),
   }).rename('awei2');
  return image.addBands([ndwi,mndwi,awei,awei2])}

function clip_image (image){
  return image.clip(geometry)} // clip the interest area

//// Applying the functions to all collection 
// the minimum value is assigned to black, and the maximum value is assigned to white
var singleBandVis = {
              'min': -0.05,
              'max': 1,
              };
var mNDWIVis = {
   'max': 0.0012,
   'min': 0,
};
var aweiVis = {
   'max': 150,
   'min': 10,
};
var awei2Vis = {
   //'max': 150,
   'min': 550,
};

var NWI = Bay_Plenty_collection.map(indices);  
var NoMask = NWI.map(clip_image);  
print (NoMask);

var NDWI = NoMask.select('ndwi');
var mNDWI = NoMask.select('mndwi');
var AWEI = NoMask.select('awei');
var AWEI2 = NoMask.select('awei2');

var NWI_STD = NDWI.reduce(ee.Reducer.stdDev()); // Now, the collection was reduced to a single image in terms of standard deviation
Map.addLayer(NWI_STD, singleBandVis,'NDWI STD image', false); // the "false" is to disable the layer on the map panel

var mNWI_STD = mNDWI.reduce(ee.Reducer.stdDev());
Map.addLayer(mNWI_STD, mNDWIVis, 'MNDWI STD image',false);

var awei_STD = AWEI.reduce(ee.Reducer.stdDev());
Map.addLayer(awei_STD, aweiVis, 'AWEI STD image', false);

var awei2_STD = AWEI2.reduce(ee.Reducer.stdDev());
Map.addLayer(awei2_STD, awei2Vis, 'AWEI 2 STD image');

// NDWI Histogram visualize
var hist_NDWI = ui.Chart.image.histogram({image: NWI_STD, region: geometry, scale: 11})
  .setOptions({title: 'NDWI histogram'});
print (hist_NDWI);

// MNDWI Histogram visualize
var hist_MNDWI = ui.Chart.image.histogram({image: mNWI_STD, region: geometry, scale: 11})
  .setOptions({title: 'mNDWI histogram'});
print (hist_MNDWI);

// AWEI Histogram visualize
var hist_AWEI = ui.Chart.image.histogram({image: awei_STD, region: geometry, scale: 11})
  .setOptions({title: 'AWEI histogram'});
print (hist_AWEI);

// AWEI 2 Histogram visualize
var hist_AWEI2 = ui.Chart.image.histogram({image: awei2_STD, region: geometry, scale: 11})
  .setOptions({title: 'AWEI 2 histogram'});
print (hist_AWEI2);
