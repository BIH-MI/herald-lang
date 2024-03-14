/**
 * @module
 * CrossSectionalAnalysisPlugin / Central init function for the plugin
 */

i2b2.HeraldDemo.Init = function(div) {

  GHDM_I2B2_DEBUG = false;
  GHDM_I2B2_SAMPLE_SIZE = 1000;
  //GHDM_I2B2_BLOCK_SIZE = 10;
  //GHDM_I2B2_DEGREE_OF_PARALLELISM = 10;
  //GHDM_I2B2_RETRY_NUMBER = 5;
  //GHDM_I2B2_RETRY_DELAY = 100;

  // Launch UI adaptor
	new UIAdapter(div, (data) => {
    
    // Select container
    const container = $$("div#ghdmMainDiv div#ghdmTabs div.ghdm-results-finished")[0];
    container.innerHTML = '';
    
    // Create iframe
    const iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.border = "none";
    iframe.style.border = "none";
    container.appendChild(iframe);
    
    // Let the iframe navigate
    var path = "./js-i2b2/cells/plugins/community/HeraldDemo/";
    iframe.src = path + "index.html";

    // Wait for the iframe to load before sending the message
    iframe.addEventListener("load", () => {
      const targetDomain = new URL(iframe.src).origin;
      iframe.contentWindow.postMessage(data, targetDomain);
    });
  });
}