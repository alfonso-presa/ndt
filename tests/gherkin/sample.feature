Feature: Search engine

    Scenario: Search button
         When I'm in any page
         Then I should see the search button

    Scenario: Simple search
        Given I'm in the web tab
         When I search a word
         Then I should see the corresponding results

    Scenario: Search tabs
         When I search anything
         Then I should see the search tabs

    Scenario: Search tabs for company
        When I search a company
         Then I should see "Acerca De" in the tabs

    Scenario: Company search
        Given I'm in the web tab
         When I search a company
         Then I should not see the text results
          And I should see company info
