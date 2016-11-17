## Navigation driven tests

This repo contains a set of tools that can be used to executed Gherkin validations
in parallel during a predefined navigation.

The navigation triggers events while its advancing, and the steps await those events to make the scenario
progress.

This project is a WIP.

## How to execute

Run the following commands after cloning this repo.

```sh
npm install -g selenium-standalone && selenium-standalone install && selenium-standalone start > /dev/null &
npm install && npm test
```

Note that if you're using MacOS you need to install chrome canary.

![Image](ndt.gif?raw=true)

## The steps

The concept aplyed in this repo handles the Gherkin languaje differently than cucumber does:

- Given: defines an state that must be preserved during the scenario execution for it to be valid.
- When: defines an events that mas happen for the scenario to progress.
- Then: defines an assertion that must be fulfilled for the scenario to pass.

## Example implementation

You can check a sample implementation in the tests/gherkin for the gherkin description and steps, and the tests/observable
for a navigation
