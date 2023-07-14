///////////////////////////////////////////////////////////
///// Laís Pool  (lais.pool@gmail.com)                /////                        
///// Florianopolis, 14/07/2023                       /////              
///// Code Editor - Earth Engine                      /////                             
///////////////////////////////////////////////////////////


/*
declaration: function waterIndex(collection):
This function was made to calculate 4 water indices of sentinel-2 SR imagery

    list of parametres:
    • collection: a Sentinel-2 ('COPERNICUS/S2_SR_HARMONIZED') image collection (for different mission, check the band names to edit)
    
    global variables: (none)
    libraries needed: (none)
    return value: image collection with the indices as bands in each image
    
    Exemple: 

    var NWI = collection.map(waterIndex); 
    
    var NDWI = NoMask.select('ndwi');
    var mNDWI = NoMask.select('mndwi');
    var AWEI = NoMask.select('awei');
    var AWEI2 = NoMask.select('awei2');
    
    // generate standard deviation for the index
    var mNWI_STD = mNDWI.reduce(ee.Reducer.stdDev());
    Map.addLayer(mNWI_STD, mNDWIVis, 'MNDWI STD image');
    
    // MNDWI Histogram visualize
    var hist_MNDWI = ui.Chart.image.histogram({image: mNWI_STD, region: geometry, scale: 11})
      .setOptions({title: 'mNDWI histogram'});
    print (hist_MNDWI);
*/


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
  var singleBandVis = {'min': -1,'max': 1};
  var mNDWIVis = {'max': -1,'min': 1};
  var aweiVis = {'max': 150,'min': 10};
  var awei2Vis = {'min': 550}; //'max': 150
  
  return image.addBands([ndwi,mndwi,awei,awei2])}