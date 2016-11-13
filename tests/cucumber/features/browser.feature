@parallel @focus
Feature: browser managing
 Should allow using the browser in parallel

 Background:
  Given I perform duckduckgo navigation

 Scenario: Search button
   When I'm in the wellcome screen
   Then I should see the search button

 Scenario: Simple search
   When I search 'prueba'
   Then I should see the corresponding results

 Scenario: Search tabs
   When I search anything
   Then I should see the search tabs
   And I should see the search button

 Scenario: Search tabs
   When I search a company
   Then I should see 'Acerca De' in the tabs

 Scenario: Simple search
   When I search a company
   Then I should not see the text results
   Then I should see company info
