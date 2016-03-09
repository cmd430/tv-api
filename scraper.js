const async = require("async-q"),
  config = require("./config"),
  eztv = require("./providers/eztv")("EZTV"),
  util = require("./util");

/* Start scraping from KAT. */
const scrapeKAT = () => {
  return async.eachSeries(config.providers, (provider) => {
    util.setStatus("Scraping " + provider.name);
    const kat = require("./providers/kat")(provider.name);
    return util.spawn(kat.search(provider)).then((response) => {
      console.log(provider.name + ": Done.");
      util.setStatus("Idle");
      return response;
    });
  });
};

/* Start scraping from EZTV. */
const scrapeEZTV = () => {
  util.setStatus("Scraping " + eztv.name);
  return util.spawn(eztv.search()).then((response) => {
	config.scrapers.kat ? util.setStatus(eztv.name + ": Done.") : util.setStatus("Idle");
    console.log(eztv.name + ": Done.");
    return response;
  });
};

module.exports = {

  /* Initiate the scraping. */
  scrape: () => {
	var scrapers = [];
	if(config.scrapers.eztv) scrapers.push(scrapeEZTV);
	if(config.scrapers.kat) scrapers.push(scrapeKAT);
    util.setlastUpdate();
    if(scrapers.length !== 0) {
	  async.eachSeries(scrapers, (scraper) => {
        return scraper();
      }).catch((err) => {
        util.onError("Error while scraping: " + err);
        return err;
      }).done();
	} else {
	  util.onError("Error while scraping: No scrapers enabled");
      return "No scrapers enabled";
	}
  }

};
