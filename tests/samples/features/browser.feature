@parallel
Feature: browser managing
 Should allow using the browser in parallel

 Background:
  Given I perform duckduckgo navigation

 Scenario: Search button
   Then I should see the search button

 Scenario: Simple search
   When I search 'prueba'
   Then I should see the results for prueba

 Scenario: Search tabs
   When I search anything
   Then I should see the search tabs


 Scenario: Simple search
   When I search 'google'
   Then I should not see the text results for google
   Then I should see company info for Google
