(function() {

    /////////////////////////////////////////////////////////
    //
    // instance of global object
    //
    /////////////////////////////////////////////////////////
    var root = this;



    /////////////////////////////////////////////////////////
    //
    // instance of txVirtualCoin object
    //
    /////////////////////////////////////////////////////////
    var txVirtualCoin = {};



    /////////////////////////////////////////////////////////
    //
    // instance of crypto currencies object
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.cryptoCurrencies = {};



    /////////////////////////////////////////////////////////
    //
    // instance of currencies rate object
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.currenciesRate = [];



    /////////////////////////////////////////////////////////
    //
    // instance of currencies converter
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.converter = {
        cryptoCurrency: {
            name: "dash",
            value: 0
        },
    
        currency: {
            index: "0",
            value: 0
        },

        event: undefined
    };



    /////////////////////////////////////////////////////////
    //
    // int txVirtualCoin
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.init = function() {

        // initialize crypto currencies data
        txVirtualCoin.getCryptoCurrencies().then(function(currencies) {

            txVirtualCoin.getCurrenciesRate().then(function(currenciesRate) {
                
                var EUR = currenciesRate.rates['EUR'];
                var GBP = currenciesRate.rates['GBP'];
                
                var count = 0;
                
                for (var key in currenciesRate.rates) {
                    txVirtualCoin.currenciesRate.push({
                        index: count++,
                        label: key,
                        value: currenciesRate.rates[key]
                    });
                }

                // setting crypto currencies data
                var cryptoCurrencies = [];

                currencies.map(function (currency) {
                    cryptoCurrencies[currency.id] = currency;
                    cryptoCurrencies[currency.id]['price_eur'] = (currency.price_usd * EUR).toFixed(1);
                    cryptoCurrencies[currency.id]['price_gbp'] = (currency.price_usd * GBP).toFixed(1);
                })

                txVirtualCoin.cryptoCurrencies = cryptoCurrencies;

                // rerendering HTML markup
                txVirtualCoin.render();
            })
        })
    }



    /////////////////////////////////////////////////////////
    //
    // Get crypto currencies
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.getCryptoCurrencies = function () {
       return axios.get('https://api.coinmarketcap.com/v1/ticker/')
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
            });
    }



    /////////////////////////////////////////////////////////
    //
    // Get currencies rate
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.getCurrenciesRate = function () {
        return axios.get('https://api.fixer.io/latest?base=USD')
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
            });
    }



    /////////////////////////////////////////////////////////
    //
    // Updating currency
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.updateCurrency = function (type, event) {
        switch (type) {
            case "cryptocurrency":
                var valueOfCurrency = txVirtualCoin.currenciesRate[txVirtualCoin.converter.currency.index].value;

                txVirtualCoin.converter.cryptoCurrency.value = event.value;
                
                txVirtualCoin.converter.currency.value = (event.value * valueOfCurrency).toFixed(1);

                txVirtualCoin.converter.event = event;

                txVirtualCoin.render();

                break;
        
            default:
                var valueOfCurrency = txVirtualCoin.cryptoCurrencies[txVirtualCoin.converter.cryptoCurrency.name].price_usd;

                txVirtualCoin.converter.currency.value = event.value;

                txVirtualCoin.converter.cryptoCurrency.value = (event.value * valueOfCurrency).toFixed(1);

                txVirtualCoin.converter.event = event;

                txVirtualCoin.render();

                break;
        }
    }



    /////////////////////////////////////////////////////////
    //
    // On cryptocurrency changed
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.onCryptoCurrencyChange = function (event) {
        txVirtualCoin.converter.cryptoCurrency.name = event.value;
    }



    /////////////////////////////////////////////////////////
    //
    // On currency changed
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.onCurrencyChange = function (event) {
        txVirtualCoin.converter.currency.index = event.value;
    }



    /////////////////////////////////////////////////////////
    //
    // Get price card HTML markup
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.getPriceCardMarkup = function (filter) {
        var template = $('#price-card').html();
        
        var filters = filter.split(", ");

        var priceCards = [];

        filters.forEach(function(filter) {
            var cryptoCurrency = txVirtualCoin.cryptoCurrencies[filter];

            priceCards.push({
                symbol: cryptoCurrency.symbol,
                name: cryptoCurrency.name,
                cryptoCurrencies: [
                    { label: "USD", value: cryptoCurrency.price_usd},
                    { label: "EUR", value: cryptoCurrency.price_eur },
                    { label: "GBP", value: cryptoCurrency.price_gbp },
                ]
            });
        })

        return Mustache.render(template, {
            priceCards: priceCards
        });
    }



    /////////////////////////////////////////////////////////
    //
    // Get converter HTML markup
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.getConverterMarkup = function (filter) {
        var template = $('#converter').html();

        var filters = filter.split(", ");

        var cryptoCurrencies = [];

        filters.forEach(function (filter) {
            var cryptoCurrency = txVirtualCoin.cryptoCurrencies[filter];

            cryptoCurrencies.push({
                id: cryptoCurrency.id,
                symbol: cryptoCurrency.symbol,
                name: cryptoCurrency.name,
                cryptoCurrencies: [
                    { label: "USD", value: cryptoCurrency.price_usd },
                    { label: "EUR", value: cryptoCurrency.price_eur },
                    { label: "GBP", value: cryptoCurrency.price_gbp },
                ]
            });
        })

        return Mustache.render(template, {
            cryptoCurrencies: cryptoCurrencies,
            currencies: txVirtualCoin.currenciesRate,
            converter: txVirtualCoin.converter,
            v: function() {
                return txVirtualCoin.converter.currency.value
            }
        });
    }



    /////////////////////////////////////////////////////////
    //
    // rendering HTML markup to the DOM
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.render = function() {
        $('TXVirtualCoin').each(function (index, element) {

            // TXVirtualCoin type
            var type = $(this).attr("type");

            // TXVirtualcoin filter
            var filter = $(this).attr("filter");

            // binding HTML markup based on type
            switch (type) {
                case "price-card":
                    this.innerHTML = txVirtualCoin.getPriceCardMarkup(filter);
                    break;
                case "converter":
                    this.innerHTML = txVirtualCoin.getConverterMarkup(filter);
                    break;
            }
        })
    }



    /////////////////////////////////////////////////////////
    //
    // Loading tx virtual coin
    //
    /////////////////////////////////////////////////////////
    txVirtualCoin.init();



    /////////////////////////////////////////////////////////
    //
    // Assign txVirtualCoin to the Global object
    //
    /////////////////////////////////////////////////////////
    window.txVirtualCoin = txVirtualCoin;

}())