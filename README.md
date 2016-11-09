## PoC of Navigation driven tests

This repo contains a PoC. It intends to demonstrate the advantages of having gherkins scenarios
executed in parallel in a feature driven by a "background" navigation.

The navigation triggers events while its advancing, and the steps await those events to make the scenario
progress.

To achieve this a fork of cucumberjs is used and webdriver.io

## How to execute

Run the following commands after cloning this repo.

```sh
npm install -g selenium-standalone && selenium-standalone install && selenium-standalone start > /dev/null &
npm install && npm test
```

Note that if you're using MacOS you need to install chrome canary.
